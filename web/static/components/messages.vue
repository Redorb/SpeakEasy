<template>
<div id="messages-list">
    <ul>
        <transition-group name="message-appear">
            <li v-for="message in messages" v-bind:key="message">
                <div class="message-metadata">
                    <span class="username">{{message.user_id}}</span>
                    <span class="received-at">{{message.received_at}}</span>
                </div>
                {{message.body}}
            </li>
        </transition-group>
    </ul>
</div>
</template>
<script>
export default {
   props: ['messages']
}
</script>
<style lang="sass">
#messages-list {
    padding-top: 20px;
    padding-left: 20px;
    ul {
        list-style: none;
        padding: 0;
        width: 50vw;
        li {
            padding: 5px 0;
            &.message-appear-enter-active,
            &.message-appear-leave-active {
                transition: all .2s
            }
            &.message-appear-enter,
            &.message-appear-leave-active {
                opacity: 0;
                transform: translateY(20px);
            }
            .message-metadata {
                .username {
                    font-weight: bold;
                }
                .received-at {
                    color: rgba(0, 0, 0, 0.4);
                    margin-left: 5px;
                    font-size: 0.9em;
                }
            }
        }
    }
}
</style>
