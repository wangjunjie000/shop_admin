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
        <el-menu
          default-active="1"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          :unique-opened="true"
          router
        >
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/users">
              <i class="el-icon-menu"></i>
              <span slot="title">用户列表</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>权限管理</span>
            </template>
            <el-menu-item index="2-1">
              <i class="el-icon-menu"></i>
              <span slot="title">角色列表</span>
            </el-menu-item>
            <el-menu-item index="2-2">
              <i class="el-icon-menu"></i>
              <span slot="title">权限列表</span>
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
    return {}
  },
  methods: {
    handleLogoutClick() {
      this.$confirm('您确定要退出吗', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 清除localStorage中的token登陆状态,其实是有bug的，可以自己添加token，
          window.localStorage.removeItem('token')
          // 跳转到登录页
          this.$router.push('/login')
          this.$message({
            type: 'success',
            message: '退出成功!'
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath)
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
