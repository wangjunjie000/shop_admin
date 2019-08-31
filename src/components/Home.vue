<template>
  <el-container class="home">
    <!-- 头部 -->
    <el-header>
      <div class="logo"></div>
      <div class="logout">
        <span>欢迎光临</span>
        <a href="javascript:;" @click="handleLogoutClick">退出</a>
      </div>
      <div class="title">
        <h3>电商后台管理系统</h3>
      </div>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <!-- default-active="1"显示高亮，对应着index属性，index属性又对应着url地址中的hash，所以要动态获取hash -->
        <el-menu
          :default-active="$route.path.substr(1).split('-')[0]"
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :unique-opened="true"
          router
        >
          <el-submenu
            :key="submenu.id"
            :index="submenu.path"
            v-for="submenu in menuList"
          >
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{ submenu.authName }}</span>
            </template>
            <el-menu-item
              :key="item.id"
              :index="item.path"
              v-for="item in submenu.children"
            >
              <i class="el-icon-menu"></i>
              <span slot="title">{{ item.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体内容页 -->
      <el-main>
        <!-- 指定/home（Home组件）的子路由/users(Users组件)的出口 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  name: 'Home',

  data() {
    return {
      // 根据用户的角色、权限对应的菜单列表，用户菜单根据它来动态渲染
      menuList: []
    }
  },
  methods: {
    // 点击退出清空token，跳转到登录页
    async handleLogoutClick() {
      try {
        await this.$confirm('您确定要退出吗', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 清除localStorage中的token登陆状态,其实是有bug的，可以自己添加token，
        window.localStorage.removeItem('token')
        // 跳转到登录页
        this.$router.push('/login')
        this.$message({
          type: 'success',
          message: '退出成功!'
        })
      } catch (e) {
        this.$message.error('取消退出')
      }
    }
  },
  // 在created钩子函数中获取到左侧菜单数据，然后动态渲染到页面，服务器会根据不同的用户的角色返回不同权限的菜单数据，因此角色不一样的登陆用户左侧的菜单也是不同的
  async created() {
    // 获取菜单的列表
    let res = await this.axios.get('menus')
    let {
      meta: { status },
      data
    } = res.data
    if (status === 200) {
      this.menuList = data
      // console.log(data)
    }
  }
}
</script>
<style lang="less" scoped>
.home {
  height: 100%;

  .el-header {
    background-color: #b3c1cd;

    .logo {
      width: 180px;
      height: 60px;
      background: url('../assets/logo.png') no-repeat center center;
      background-size: contain;
      float: left;
    }

    .logout {
      width: 180px;
      height: 60px;
      float: right;
      font-weight: 700;
      line-height: 60px;
      text-align: right;

      a {
        color: #f80;
      }
    }

    .title {
      height: 60px;
      overflow: hidden;
      line-height: 60px;
      text-align: center;
      color: #fff;
      font-size: 24px;
    }
  }

  .el-aside {
    background-color: #545c64;

    .el-submenu {
      width: 200px;
    }
  }

  .el-main {
    background-color: #d4dfe4;
  }
}
</style>
