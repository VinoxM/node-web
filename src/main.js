import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import api from './api'
import Dialog from './components/other/Dialog.vue'

import './assets/main.css'

const app = createApp(App)

app.use(router)
app.use(api)

app.component('t-dialog', Dialog);

app.mount('#app')
