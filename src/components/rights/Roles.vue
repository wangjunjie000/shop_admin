<template>
  <div class="role">
    <!-- 面包屑组件 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 添加角色按钮 -->
    <el-button type="primary" plain @click="showAddRoleDialog"
      >添加角色</el-button
    >

    <!-- 添加角色对话框 -->
    <el-dialog
      :title="!this.id ? '添加角色' : '修改角色'"
      :visible.sync="dialogVisible"
      width="40%"
    >
      <!-- 添加角色的表单，编辑角色的表单也是它 -->
      <el-form :model="addForm" label-width="80px" ref="addForm" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input
            v-model="addForm.roleDesc"
            @keydown.enter.native="handleAddRoleClick"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>

        <el-button type="primary" @click="handleAddRoleClick" v-if="!id"
          >确 定</el-button
        >
        <el-button type="primary" @click="handleEditRoleClick" v-if="id"
          >修 改</el-button
        >
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="权限分配"
      :visible.sync="rightDialogVisible"
      width="40%"
      @closed="handleClearRightClick"
    >
      <!-- 这里应该放一个树形控件放置需要分配的权限 -->
      <el-tree
        :data="rightTree"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="tree"
        highlight-current
        :props="defaultProps"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAssignRrightClick"
          >分 配</el-button
        >
      </span>
    </el-dialog>

    <!-- 表格组件 -->
    <el-table :data="roleList" style="width: 100%" stripe>
      <!-- 表格中的展开行 -->
      <el-table-column type="expand">
        <!-- 这里的scope和<el-table-column>组件中插槽接收到的scope是一样的，都能取到当前行的数据 -->
        <template slot-scope="scope">
          <el-row v-if="scope.row.children.length === 0">
            <span>暂无权限</span>
          </el-row>
          <!-- 获取到所在行对应角色的所有权限数据，level1就是所有权限的集合，是一个数组，里面的第一层对象是一级权限，第二层对象是第二级权限。。。 -->
          <el-row
            class="level1"
            v-for="level1 in scope.row.children"
            :key="level1.id"
          >
            <!-- 第一列来渲染一级权限的名称 -->
            <el-col :span="4">
              <!-- 删除权限需要两个参数，角色id和权限id，通过事件传过去 -->
              <el-tag
                closable
                @close="handleDeleteRight(scope.row, level1.id)"
                >{{ level1.authName }}</el-tag
              >
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <!-- 第一列来渲染二级权限的名称 -->
            <el-col :span="20">
              <el-row
                class="level2"
                v-for="level2 in level1.children"
                :key="level2.id"
              >
                <el-col :span="4"
                  ><el-tag
                    type="success"
                    closable
                    @close="handleDeleteRight(scope.row, level2.id)"
                    >{{ level2.authName }}</el-tag
                  >
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <!-- 第一列来渲染三级权限的名称 -->
                <el-col :span="20">
                  <el-tag
                    class="level3"
                    v-for="level3 in level2.children"
                    :key="level3.id"
                    type="danger"
                    closable
                    @close="handleDeleteRight(scope.row, level3.id)"
                  >
                    {{ level3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 表格中的列 -->
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="roleDesc" label="描述"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            plain
            size="small"
            @click="showEditRoleDialog(scope.row)"
          ></el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            plain
            size="small"
            @click="handleDeleteRoleClick(scope.row)"
          ></el-button>
          <el-button
            type="success"
            icon="el-icon-check"
            plain
            size="small"
            @click="showAssignRight(scope.row)"
            >分配权限</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'Roles',

  data() {
    return {
      roleList: [],
      dialogVisible: false,
      rightDialogVisible: false,
      id: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      roleId: '', // 分配权限所在行对应的角色id，点击分配角色的时候获取到值
      currentAssignRole: {},
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      },
      rightTree: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      }
    }
  },

  // 渲染角色列表和权限列表
  created() {
    this.getRoleList()
  },
  methods: {
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

    // 点击删除对应的角色信息
    async handleDeleteRoleClick(row) {
      try {
        await this.$confirm('您确定要删除该角色吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        let ret = await this.axios({
          method: 'delete',
          url: `roles/${row.id}`
        })
        console.log(ret)
        let {
          meta: { status }
        } = ret.data
        if (status === 200) {
          this.$message.success('删除成功')
          // 重新获取角色列表
          this.getRoleList()
        }
      } catch (e) {
        this.$message.info('取消删除')
      }
    },

    // 显示添加角色对话框
    showAddRoleDialog() {
      // 点击添加让id变成false，为了显示表单中的添加按钮
      this.id = false
      this.dialogVisible = true
      this.addForm = {
        roleName: '',
        roleDesc: ''
      }
    },

    // 点击确定添加角色
    handleAddRoleClick() {
      try {
        this.$refs.addForm.validate(async valid => {
          if (valid) {
            let ret = await this.axios({
              method: 'post',
              url: 'roles',
              data: this.addForm
            })
            let {
              meta: { status }
            } = ret.data
            if (status === 201) {
              this.dialogVisible = false
              // 清空表单内容
              this.$refs.addForm.resetFields()
              this.$message.success('添加角色成功')
              // 重新获取角色列表
              this.getRoleList()
            } else {
              this.$message.error('添加角色失败')
            }
          }
        })
      } catch (e) {
        this.$message.info('取消添加')
      }
    },

    // 显示编辑角色对话框
    showEditRoleDialog(row) {
      // console.log(row)
      // 让id值变成true，为了让编辑角色表单的修改按钮显示出来
      this.id = true
      // 将编辑角色按钮那行的数据赋值给addForm，为了弹出对话框就有值
      // 不能直接将row赋值给addForm，这样在编辑表单输入值的时候由于双向绑定，
      // 会影响到row里面的数据，从而在没有发送修改请求的时候就让页面上显示的数据动态变化
      this.addForm.roleName = row.roleName
      this.addForm.roleDesc = row.roleDesc
      this.addForm.id = row.id
      this.dialogVisible = true
    },

    // 点击修改发送修改角色的请求
    handleEditRoleClick() {
      try {
        this.$refs.addForm.validate(async valid => {
          if (valid) {
            let ret = await this.axios({
              method: `put`,
              url: `roles/${this.addForm.id}`,
              data: this.addForm
            })
            // console.log(this.addForm)
            let {
              meta: { status }
            } = ret.data
            if (status === 200) {
              this.dialogVisible = false
              // 清空表单内容
              this.$refs.addForm.resetFields()
              this.$message.success('修改角色成功')
              // 重新获取角色列表
              this.getRoleList()
            } else {
              this.$message.error('修改角色失败')
            }
          }
        })
      } catch (e) {
        this.$message.info('取消修改')
      }
    },

    // 点击tag标签的×删除对应的权限
    async handleDeleteRight(row, rightId) {
      let ret = await this.axios({
        method: 'delete',
        url: `roles/${row.id}/rights/${rightId}`
      })
      let {
        meta: { status },
        data
      } = ret.data
      if (status === 200) {
        this.$message.success('删除成功')
        // 因为返回的data对象中的data对象是该角色删除权限后剩余的所有权限数据，所以把更新剩余权限做局部渲染
        row.children = data
      } else {
        this.$message.error('添加权限失败')
      }
      console.log(ret)
    },

    // 点击显示分配权限的对话框
    // showAssignRight() { // this.rightDialogVisible = true // this.getRightTree()
    // console.log(this.$refs.tree) // //
    // 获取到当前角色拥有的所有三级权限的id，用于默认选中，不能用一级二级，因为当一级二级选中，下面的会全部被选中
    // this.$refs.tree.setCheckedKeys([105]) // }

    // 显示分配权限的对话框
    async showAssignRight(row) {
      // 显示对话框
      this.rightDialogVisible = true
      // 将该行角色id赋值给分配权限的参数对象assignRight，为了点击分配的时候获取到参数
      this.roleId = row.id
      // 将所在行对应的角色信息对象赋值给currentAssignRole，以便分配权限时更新当前角色
      this.currentAssignRole = row
      // 发送ajax请求，获取所有的权限，树形结构
      let res = await this.axios.get(`rights/tree`)
      let {
        meta: { status },
        data
      } = res.data
      if (status === 200) {
        this.rightTree = data
      }
      // 设置默认选中
      // 获取到当前角色拥有的所有的三级权限的id
      let temp = []
      row.children.forEach(level1 => {
        level1.children.forEach(level2 => {
          level2.children.forEach(level3 => {
            // 使用一个空数组，把所有的三级权限的id给存储起来
            temp.push(level3.id)
          })
        })
      })
      // 树形控件中的setCheckedKeys方法，传入数组，数组里放权限对应的id，就能默认选中
      // 对应的权限
      this.$refs.tree.setCheckedKeys(temp)
    },

    // 关闭分配权限对话框时清除checkbox的权限选中状态，为了弹出对话框时不闪烁
    handleClearRightClick() {
      this.$refs.tree.setCheckedKeys([])
    },

    // 点击显示分配权限的对话框的分配发送请求，
    // 参数：角色id，点击分配角色的时候获取到值
    // 参数：权限id列表，以逗号分隔，注意它的上级的id也要获取到，不然一级或二级以下的全都无法自动勾选，用join方法连接成字符串
    async handleAssignRrightClick() {
      // 获取到所有被选中的key值，即id值,返回一个数组，包含所有选中的id
      // this.$refs.tree.getCheckedKeys()
      let ret = await this.axios({
        method: 'post',
        url: `roles/${this.roleId}/rights`,
        data: {
          rids: this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys()).join()
        }
      })
      let {meta: {status}} = ret.data
      if (status === 200) {
        this.$message.success('恭喜你，权限分配成功')
      } else {
        this.$message.error('权限分配失败，请与管理员联系')
      }
      // 隐藏分配权限对话框
      this.rightDialogVisible = false
      // 更新当前角色的权限信息
      this.getRoleList()
    }
  }
}
</script>

<style lang="less" scoped>
.level1 {
  margin-bottom: 5px;
}
.level2 {
  margin-bottom: 10px;
}
.level3 {
  margin-bottom: 5px;
  margin-right: 10px;
}
</style>
