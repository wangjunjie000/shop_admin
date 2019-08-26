// 引入vue文件，为实例化vue对象
import Vue from 'vue'
// 引入App.vue根组件，为渲染到主页面
import App from './App'
// 引入路由文件，挂载到vue实例上
import router from './router'

// 引入elementUI插件
import ElementUI from 'element-ui'
// 引入element-ui样式
import 'element-ui/lib/theme-chalk/index.css'

// 引入通用样式
import '@/assets/common.css'

// 引入axios
import axios from 'axios'
// 将axios赋值给Vue的原型对象，然后Vue所有的实例都能通过this.axios使用了，
Vue.prototype.axios = axios
// 配置全局axios默认值
// axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// 添加请求拦截器
axios.interceptors.request.use(
  function(config) {
    // 这是拦截到的发送请求的配置信息
    // console.log(config)
    // 在发送请求之前做些什么
    config.baseURL = 'http://localhost:8888/api/private/v1/'
    config.headers.Authorization = window.localStorage.getItem('token')
    return config
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 使用elementui插件
Vue.use(ElementUI)

// 取消生产环境的提示
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
