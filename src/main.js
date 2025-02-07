import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import api from './api'

import './assets/css/main.css'
import './assets/icon-fonts/css/fontello.css'
import './message/message.css'

import loading from './directive/loading'

const app = createApp(App)

app.use(router)
app.use(api)
app.use(loading)

app.mount('#app')
