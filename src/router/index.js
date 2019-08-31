import Vue from 'vue'
// 它依赖vue，所以上面要引入vue
import Router from 'vue-router'

// import HelloWorld from '@/components/HelloWorld'
// 导入登陆组件
import Login from '@/components/Login'
// 导入首页组件
import Home from '@/components/Home'
// 导入用户列表组件
import Users from '@/components/users/Users'
// 导入权限列表组件
import Rights from '@/components/rights/Rights'
// 导入角色列表组件
import Roles from '@/components/rights/Roles'
// 导入商品分类组件
import Categories from '@/components/products/Categories'
// 导入goods组件
import Goods from '@/components/products/Goods'
// 导入添加商品组件
import Add from '@/components/products/Add'

// 网上找的连续点击侧边栏报错的问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

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
          name: 'Users',
          component: Users
        },
        {
          path: '/rights',
          name: 'Rights',
          component: Rights
        },
        {
          path: '/roles',
          name: 'Roles',
          component: Roles
        },
        {
          path: '/categories',
          name: 'Categories',
          component: Categories
        },
        {
          path: '/goods',
          name: 'Goods',
          component: Goods
        },
        {
          path: '/goods-add',
          name: 'Add',
          component: Add
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
