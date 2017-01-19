<template>
<div class="speakeasy">
    <md-toolbar>
        <h1 class="md-title">Speakeasy</h1>
    </md-toolbar>
    <md-layout md-gutter>
        <md-layout md-gutter md-column md-flex="33">
            <h4 id="status"></h4>
            <messages v-bind:messages="messages"></messages>
            <div id="your-message">
                <input type="text" placeholder="What do you have to say?" v-model="message" v-on:keyup.13="sendMessage">
            </div>
        </md-layout>
        <video-conference></video-conference>
    </md-layout>
</div>
</template>

<script>
import {
    Socket,
    Presence
} from "phoenix"
import Messages from "./messages.vue"
import VideoConference from "./video-conference.vue"
import Peer from "simple-peer"
import getUserMedia from "getusermedia"

export default {
    data() {
        return {
            socket: null,
            lobbyChannel: null,
            callChannel: null,
            messages: [],
            message: "",
            username: "",
            users: [],
            enterName: true
        }
    },
    mounted() {
        let updateStatus = (status) => {
            let myVideo = document.getElementById('status')
            myVideo.textContent = status
        }
        updateStatus("Waiting for another User")
        let joinChannel = () => {
            if (!Peer.WEBRTC_SUPPORT) {
                updateStatus("Sorry your browser is not supported, please use Chrome or Firefox")
                return
            }
            this.socket = new Socket("/socket", {
                    params: {
                        token: window.userToken
                    }
                }),
                this.socket.connect()

            this.lobbyChannel = this.socket.channel("users:lobby", {})
            this.lobbyChannel.join()
                .receive("ok", resp => {
                    console.log("Joined users successfully", resp)
                })
                .receive("error", resp => {
                    console.log("Unable to join", resp)
                })

            this.lobbyChannel.on(`chat_start`, payload => {
                if (payload.users.includes(window.user_id)) {
                    updateStatus("Another user found, connecting...")
                    let otherUser = payload.users.filter((id) => window.user_id != id)[0]
                    this.lobbyChannel.leave()
                    this.lobbyChannel = null
                    this.callChannel = this.socket.channel(payload.room)
                    this.callChannel.join()
                        .receive("ok", resp => {
                            console.log("Joined  callChannel successfully", resp)
                        })
                        .receive("error", resp => {
                            console.log("Unable to join", resp)
                        })
                    this.callChannel.on("new_msg", payload => {
                        payload.received_at = Date();
                        this.messages.push(payload);
                    });

                    getUserMedia({
                        video: true,
                        audio: true
                    }, (err, stream) => {
                        if (err) {
                            updateStatus("There was a problem with your WebCam/Microphone. Please check your settings and try again.")
                            joinChannel();
                            return
                        }

                        let myVideo = document.getElementById('my-video')
                        let video = document.getElementById('caller-video')
                        let vendorURL = window.URL || window.webkitURL
                        myVideo.src = vendorURL ? vendorURL.createObjectURL(stream) : stream
                        myVideo.muted = true
                        myVideo.play()

                        var peer = new Peer({
                            initiator: payload.initiator == window.user_id,
                            trickle: true,
                            stream: stream,
                            config: {
                                iceServers: [{
                                    urls: 'stun:stun.l.google.com:19302'
                                }, {
                                    urls: 'stun:stun1.l.google.com:19302'
                                }, {
                                    urls: 'stun:stun2.l.google.com:19302'
                                }, {
                                    urls: 'stun:stun3.l.google.com:19302'
                                }, {
                                    urls: 'stun:stun4.l.google.com:19302'
                                }]
                            }
                        })

                        peer.on('error', err => {
                            try {
                                this.callChannel.leave()
                                this.callChannel = null
                                peer = null
                                myVideo.removeAttribute("src");
                                myVideo.load();
                                video.removeAttribute("src");
                                video.load();
                                updateStatus("User lost waiting for another")
                                peer.destroy()
                                joinChannel()
                            } catch (err) {
                                //Ignore
                            }
                        })

                        peer.on('close', () => {
                            try {
                                this.callChannel.leave()
                                this.callChannel = null
                                peer = null
                                myVideo.removeAttribute("src");
                                myVideo.load();
                                video.removeAttribute("src");
                                video.load();

                                video.src = null
                                updateStatus("User lost waiting for another")
                                joinChannel()
                            } catch (err) {
                                //Ignore
                            }
                        })

                        peer.on('signal', signal => {
                            this.callChannel.push('signal', signal)
                        })
                        this.callChannel.on(`signal:${otherUser}`, signal => {
                            peer.signal(signal)
                        })
                        peer.on('connect', () => console.log("CONNECT"))
                        peer.on('stream', (callerStream) => {
                            // got remote video stream, now let's show it in a video tag
                            video = document.getElementById('caller-video')
                            video.src = vendorURL ? vendorURL.createObjectURL(callerStream) : callerStream
                            video.play()
                            updateStatus("Video Streaming")
                        })
                    })


                }
            })
        }

        joinChannel();
    },
    components: {
        'messages': Messages,
        'video-conference': VideoConference
    },
    methods: {
        sendMessage() {
            this.callChannel.push("new_msg", {
                body: this.message
            });
            this.message = '';
        },
    }
}
</script>

<style lang="sass">
.speakeasy {
    #status {
        padding-left: 20px;
    }
    #your-message {
        background: white;
        padding-left: 20px;
        input {
            width: 25vw;
            padding: 5px 8px;
            border-radius: 3px;
            outline: 0;
            border: 1px solid #ddd;
            font-size: 16px;
            font-family: Roboto;
        }
    }
}
</style>
