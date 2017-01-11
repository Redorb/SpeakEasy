import "phoenix_html"
import Vue from 'vue'
import VueMaterial from 'vue-material'
import Speakeasy from "../components/speakeasy.vue"


Vue.use(VueMaterial)
// Create the main component
Vue.component('speakeasy', Speakeasy)

// And create the top-level view model:
new Vue({
  el: '#app',
  render(createElement) {
    return createElement(Speakeasy, {})
  }
});
