<template>
  <div class="users">
    <!-- 面包屑组件 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索框组件 -->
    <div style="margin-top: 15px;" class="seachBox">
      <el-input
        placeholder="请输入内容"
        v-model="query"
        class="input-with-select"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="handleSearchUser"
        >
        </el-button>
      </el-input>
      <!-- 添加用户按钮 -->
      <el-button type="primary" plain @click="showAddDialog"
        >添加用户</el-button
      >
    </div>

    <!-- 表格组件 -->
    <el-table :data="userList" stripe style="width: 100%">
      <!-- prop表示当前列显示哪个属性，label表示thead中的内容 -->
      <!--  create_time : 1486720211 email : "adsfad@qq.com" id : 500 mg_state : true
      mobile : "12345678" role_name : "超级管理员" username : "admin" -->
      <el-table-column prop="username" label="姓名" width="200">
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="200"> </el-table-column>
      <el-table-column prop="mobile" label="电话" width="200">
      </el-table-column>
      <el-table-column prop="mg_state" label="状态" width="200">
        <!-- 这里的scope获取到的是子组件（组件库）中传过来的数据，scope.row就是所在行对应的用户数据 -->
        <template v-slot:default="scope">
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handleChangeState($event, scope.row.id)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="操作">
        <!-- 表格操作栏里面的插槽 -->
        <template slot-scope="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            plain
            size="small"
            @click="showEditDialog(scope.row)"
          ></el-button>
          <!-- 添加按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            plain
            size="small"
            @click="handleDeleteUser(scope.row)"
          ></el-button>
          <el-button
            type="success"
            icon="el-icon-check"
            plain
            size="small"
            @click="showAssignRoleDialog(scope.row)"
            >分配角色</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :page-sizes="[2, 4, 6, 8, 10]"
      :currentPage="currentPage"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
    </el-pagination>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="40%">
      <!-- 这里应该放一个表单来提交添加的用户 -->
      <el-form :model="addForm" label-width="80px" ref="addForm" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="email" v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddUserClick">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用戶的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="40%">
      <!-- 这里应该放一个表单来提交添加的用户 -->
      <el-form
        :model="editForm"
        label-width="80px"
        ref="editForm"
        :rules="rules"
      >
        <el-form-item label="用户名">
          <el-tag type="info">{{ editForm.username }}</el-tag>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            type="email"
            v-model="editForm.email"
            @keydown.enter.native="handleEditUserClick"
          ></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input
            v-model="editForm.mobile"
            @keydown.enter.native="handleEditUserClick"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditUserClick">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 给用户分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="assignDialogVisible" width="40%">
      <!-- 这里应该放一个表单来提交添加的用户 -->
      <el-form :model="assignForm" label-width="80px" ref="assignForm">
        <el-form-item label="用户名">
          <el-tag type="info">assignForm.username</el-tag>
        </el-form-item>
        <el-form-item label="角色列表">
          <el-select
            v-model="assignForm.rid"
            placeholder="请选择"
            name="roleName"
          >
            <!-- 将roleList中的角色数据渲染到select的option选项中 -->
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAssignRoleClick"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'User',

  data() {
    return {
      query: '', // 查询的关键字
      currentPage: 1, // 当前页
      pageSize: 2, // 每页显示的条数
      total: 0, // 总的条数
      userList: [], // 存储用户的列表
      roleList: [],
      dialogVisible: false, // 是否显示弹出的对话框
      editDialogVisible: false,
      assignDialogVisible: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 编辑用户的表单数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      // 点击分配角色时被赋值,存放的是当前用户的用户名和id（注意：不是角色的）
      assignForm: {
        username: '', // 用户的username
        id: '', // 用户的id
        rid: '' // 用户的角色id
      },
      // 点击分配角色后选中某个角色对应的角色id

      // 添加用户的表单验证规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 根据请求获取用户列表
    async getUserList() {
      let ret = await this.axios({
        method: 'get',
        url: 'users',
        params: {
          query: this.query,
          // 根据当前页来查询数据库对应的数据，方便分页时的渲染
          pagenum: this.currentPage,
          // 每页显示条数
          pagesize: this.pageSize
        }
      })
      let {
        meta: { status },
        data: { users, total }
      } = ret.data
      if (status === 200) {
        // data中的users数据来自服务端返回的数据，表格组件获取到数据后通过父传子传到组件库中
        // 组件库内部处理这些数据渲染到表格上
        this.userList = users
        // 根据服务端返回的数据来得到总条数，再根据自定义的每页显示条数可以让分页组件自动计算出有多少页
        this.total = total
      }
    },

    // 发送请求获取角色列表
    async getRoleList() {
      let ret = await this.axios.get('roles')
      let {
        meta: { status },
        data
      } = ret.data
      if (status === 200) {
        this.roleList = data
        // console.log(data)
      }
    },

    // 根据改变的当前页发送请求获取对应数据
    handleCurrentChange(val) {
      this.currentPage = val
      this.getUserList()
    },
    // 根据每页显示用户条数发送请求获取对应数据
    handleSizeChange(size) {
      this.pageSize = size
      // 让当前页等于1，因为如果开始每页显示两条，位置在最后一页，此时让每页显示4条的话，那么还是发送的最后一页的请求，而此时最后一页时没有数据的
      this.currentPage = 1
      // console.log(size)
      this.getUserList()
    },
    // 根据输入的搜索信息query发送请求获取对应数据并渲染
    handleSearchUser() {
      // 需要把当前页改成1，否则如果在第n页搜索会发送索要第n页数据的请求，就看不到搜索到的数据了
      this.currentPage = 1
      this.getUserList()
    },

    // 点击状态按钮修改用户状态
    async handleChangeState(state, id) {
      // console.log(id)
      // id是通过scope.row.id传过来的
      let uid = id
      let type = state
      // 发送请求修改用户状态
      let ret = await this.axios({
        method: 'put',
        url: 'users/' + uid + '/state/' + type
      })
      let { meta } = ret.data
      if (meta.status === 200) {
        this.$message.success('修改成功')
      } else {
        this.$message.error('修改失败')
      }
    },

    // 点击删除用户
    async handleDeleteUser(row) {
      try {
        // await 语法表示点击确定时，表示promise对象执行成功了，点击取消时用catch来捕获失败时的状态
        await this.$confirm('您确定删除该用户吗', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // 点击确定后发送axios请求,通过await获取到返回的ret
        let ret = await this.axios({
          method: 'delete',
          url: `users/${row.id}`
        })
        // 将ret解构赋值
        let {
          meta: { status }
        } = ret.data
        // 如果返回的状态码为200，则表示删除成功，然后再提示用户
        if (status === 200) {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          // 当当前页只剩一条数据时(this.userList.length获取)，点击删除发送请求的当前页需要减1，因为删除后此页就没有内容了，
          if (this.userList.length === 1 && this.currentPage > 1) {
            this.currentPage--
          }
          this.getUserList()
        } else {
          // 如果状态码不是200，则提示删除失败
          this.$message({
            type: 'error',
            message: '删除失败!'
          })
        }
      } catch (e) {
        this.$message.error('取消删除成功')
      }
    },

    // 点击显示添加用户表单
    showAddDialog() {
      this.dialogVisible = true
    },

    // 点击确定添加用户
    handleAddUserClick() {
      this.$refs.addForm.validate(async valid => {
        // 表单验证成功发送添加用户的请求
        if (valid) {
          let ret = await this.axios({
            method: 'post',
            url: 'users',
            data: this.addForm
          })
          let {
            meta: { status }
          } = ret.data
          // 表单验证成功够根据返回的状态码再次验证，并消息提示
          if (status === 201) {
            this.$message.success('恭喜你，添加用户成功')
            // 关闭对话框
            this.dialogVisible = false
            // 对该表单项进行重置，将其值重置为初始值并移除校验结果
            this.$refs.addForm.resetFields()
            // 跳转到最后一页，为了显示出刚才添加的用户,在这之前还要将total加1
            this.total++
            this.currentPage = Math.ceil(this.total / this.pageSize)
            // 重新请求数据刷新用户列表
            this.getUserList()
          } else {
            this.$message.error('添加用户失败了')
          }
        } else {
          // 表单验证失败，阻止表单默认提交行为
          return false
        }
      })
    },

    // 点击编辑图标显示编辑用户对话框,根据row（当前用户信息）填充editForm中的数据
    showEditDialog(row) {
      this.editDialogVisible = true
      this.editForm.username = row.username
      this.editForm.email = row.email
      this.editForm.mobile = row.mobile
      this.editForm.id = row.id
    },

    // 编辑用户完成后点击确定发送请求
    handleEditUserClick() {
      this.$refs.editForm.validate(async valid => {
        if (valid) {
          // 验证成功，发送请求持久化修改
          let ret = await this.axios({
            method: 'put',
            url: `users/${this.editForm.id}`,
            data: {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            }
          })
          // 将await返回的ret解构，然后通过status判断是否修改成功
          let {
            meta: { status }
          } = ret.data
          if (status === 200) {
            this.editDialogVisible = false
            this.getUserList()
            this.$message.success('恭喜你，用户修改成功了')
          } else {
            this.$message.error('很遗憾，用户修改失败了')
          }
        } else {
          // 校验失败阻止默认提交
          return false
        }
      })
    },

    // 点击显示分配角色对话框
    async showAssignRoleDialog(row) {
      this.assignDialogVisible = true
      this.assignForm.username = row.username
      this.assignForm.id = row.id
      // 通过id发送请求获取用户的角色id信息，为了回显用户的角色
      let ret = await this.axios({
        method: 'get',
        url: `users/${row.id}`
      })
      let {
        meta: { status },
        data
      } = ret.data
      if (status === 200) {
        // 因为用户在没有权限的情况下rid为-1，此时会在select下拉框中默认显示-1，所以要处理
        if (data.rid === -1) {
          this.assignForm.rid = ''
        } else {
          this.assignForm.rid = data.rid
        }
      }

      // 获取角色列表，将返回的角色数据赋值给roleList
      this.getRoleList()
      // console.log(row)
    },

    // 点击确定给指定用户发送分配角色的请求，
    async handleAssignRoleClick() {
      // 角色id
      // console.log(this.rid)
      // 用户id
      // console.log(this.assignForm.id)
      // 非空校验，否则会崩 当用户没有选择角色的时候直接发送请求服务器就崩了，
      if (!this.assignForm.rid) {
        this.$message.error('请选择用户角色')
        return
      }
      let ret = await this.axios({
        method: 'put',
        url: `users/${this.assignForm.id}/role`,
        data: {
          rid: this.assignForm.rid
        }
      })
      let {
        meta: { status }
      } = ret.data
      if (status === 200) {
        this.$message.success('设置角色成功')
        this.assignDialogVisible = false
      } else {
        this.$message.error('设置角色失败')
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-breadcrumb {
  padding: 10px 5px;
  font-size: 16px;
}
.seachBox {
  .el-input {
    width: 300px;
    margin-bottom: 5px;
  }
}
</style>
