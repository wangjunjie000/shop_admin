import Vue from 'vue'
// 它依赖vue，所以上面要引入vue
import Router from 'vue-router'

// import HelloWorld from '@/components/HelloWorld'
// 导入登陆组件
import Login from '@/components/Login'
// 导入首页组件
import Home from '@/components/Home'
// 导入用户列表组件
import Users from '@/components/Users'

Vue.use(Router)

const router = new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'HelloWorld',
    //   component: HelloWorld
    // }
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      children: [
        {
          path: '/users',
          name: Users,
          component: Users
        }
      ]
    }
    // {
    //   path: '/users',
    //   name: 'Users',
    //   component: Users,

    // },
  ]
})

router.beforeEach((to, from, next) => {
  const token = window.localStorage.getItem('token')
  if (to.path === '/login' || token) {
    next()
  } else {
    next('/login')
  }
})

export default router
