<template>
  <div class="login">
    <el-form
      ref="form"
      label-width="80px"
      :model="form"
      :rules="rules"
      status-icon
    >
      <img src="../assets/2.png" alt="" />
      <el-form-item label="用户名" prop="username">
        <el-input placeholder="请输入用户名" v-model="form.username"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          placeholder="请输入密码"
          type="password"
          v-model="form.password"
          @keydown.enter.native="login"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登陆</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
// 引入axios,用this.axios替换了
// import axios from 'axios'

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let ret = await this.axios({
            method: 'post',
            url: 'http://localhost:8888/api/private/v1/login',
            data: this.form
          })

          if (ret.data.meta.status === 200) {
            // this.$message.success('恭喜你，登陆成功') 同下面写法
            this.$message({
              message: '恭喜你，登陆成功',
              type: 'success',
              duration: 1000
            })
            // 保存服务器传过来的token信息,要放到编程式导航前面，这样导航守卫才能判断时token才存在
            window.localStorage.setItem('token', ret.data.data.token)
            this.$router.push('/home')
            // console.log(res.data.data.token)
          } else {
            this.$message.error('用户名或密码错误')
          }
        } else {
          alert('submit error')
          return false
        }
      })
    },
    resetForm() {
      this.$refs.form.resetFields()
    }
  }
}
</script>
<style lang="less" scoped>
.login {
  background-color: #2d434c;
  height: 100%;
  overflow: hidden;

  .el-form {
    width: 400px;
    background-color: #fff;
    margin: 200px auto;
    padding: 75px 40px 15px 40px;
    border-radius: 20px;
    position: relative;

    img {
      width: 120px;
      height: 120px;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      z-index: 999;
      border: 8px solid #fff;
    }

    .el-button + .el-button {
      margin-left: 80px;
    }
  }
}
</style>
