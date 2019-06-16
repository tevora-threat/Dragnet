import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import VueEditor from 'vue2-editor'
import Quill from 'vue2-editor'
import vue2Dropzone from 'vue2-dropzone'
import 'vue2-dropzone/dist/vue2Dropzone.min.css'
import VueFirestore from 'vue-firestore'
import './stylus/main.styl'
const fb = require('./db/index')

Vue.use(Vuetify)
Vue.use(VueFirestore);
Vue.use(VueEditor)
Vue.use(Quill)

Vue.config.productionTip = false

let app;
fb.auth.onAuthStateChanged(user => {
  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      components: {
        App
      },
      template: '<App/>'
    })
  }
})
