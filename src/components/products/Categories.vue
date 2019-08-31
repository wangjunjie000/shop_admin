<template>
  <div class="category">
    <!-- 添加分类按钮 -->
    <el-button type="primary" plain @click="showAddDialog">添加分类</el-button>

    <!-- 商品分类的表格 -->
    <el-table
      :data="categoryList"
      style="width: 100%"
      stripe
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
    >
      <!-- tree-key: 指定每一个节点的key，只有指定了才能，嵌套解析 -->
      <!-- level-key: 指定层级 -->
      <!--  parent-key: 如果不指定，没办法缩起来 -->
      <!-- indent-size:指定缩进 -->
      <!-- child-key: 通过哪个属性去查找子节点 children -->
      <el-table-tree-column
        folder-icon="icon icon-folder"
        prop="cat_name"
        label="分类名称"
        tree-key="cat_id"
        level-key="cat_level"
        indent-seze="20"
        parent-key="cat_pid"
        child-key="children"
        :indent-size="16"
      ></el-table-tree-column>
      <el-table-column prop="cat_deleted" label="是否有效">
        <template v-slot:default="scope">
          {{ scope.row.cat_deleted ? '否' : '是' }}
        </template>
      </el-table-column>
      <el-table-column prop="cat_level" label="排序"></el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            plain
            size="small"
            @click="showCategoryDialog(scope.row)"
          ></el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            plain
            size="small"
            @click="handleDeleteCategoryClick(scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页功能 -->
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      :page-size="pageSize"
      :page-sizes="[10, 20, 30, 40, 50]"
      :currentPage="currentPage"
      @current-change="currentChange"
      @size-change="sizeChange"
    >
    </el-pagination>

    <!-- 添加分类对话框 -->
    <el-dialog
      :title="!id ? '添加分类' : '编辑分类'"
      :visible.sync="dialogVisible"
      width="40%"
      label-width="80px"
    >
      <!-- 这里应该放一个表单来提交添加的分类 -->
      <el-form :model="addForm" label-width="80px" ref="addForm" :rules="rules">
        <!-- prop就是表单的input元素的name属性 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item prop="cat_pid">
          <!-- 级联选择器 -->
          <el-cascader
            :props="props"
            v-model="addForm.cat_pid"
            :options="categoryList2"
            clearable
            :disabled="id ? true : false"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button v-show="!id" type="primary" @click="handleAddCategoryClick"
          >确 定</el-button
        >
        <el-button v-show="id" type="primary" @click="handleEditCategoryClick"
          >修 改</el-button
        >
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框，和添加分类的公用，用显示后有无id来区分 -->
  </div>
</template>

<script>
// 导入插件包
var ElTreeGrid = require('element-tree-grid')
// console.log(ElTreeGrid)
// 在下面注册一个局部组件，它只能在categories中使用
// Vue.component(ElTreeGrid.name, ElTreeGrid)
export default {
  name: 'Categories',

  data() {
    return {
      categoryList: [],
      categoryList2: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: true,
      dialogVisible: false,
      addForm: {
        // 分类名称，表格中输入内容后自动响应
        cat_name: '',
        // 分类父id，选择分类后自动响应，此时绑定的其实是服务器响应的cat_id，添加分类时其实应该传递这个值的（自己思考的，有待考证）
        cat_pid: []
      },
      // 点击编辑后它的值将变成true
      id: false,
      // 配置级联选择器中数据对应的key值，
      props: {
        // 这里应该用cat_id,而不是cat_pid,级联选择器选取值时双向绑定的就是这个值，添加分类传递参数的时候接口说要传cat_pid，实际上是要传这个cat_id，被坑惨了！
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      value: [],
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  components: {
    'el-table-tree-column': ElTreeGrid
  },
  created() {
    this.getCategoryList()
  },
  methods: {
    // 发送请求获取初始的分类列表
    async getCategoryList() {
      let ret = await this.axios({
        meghod: 'get',
        url: 'categories',
        params: {
          type: 3,
          pagenum: this.currentPage,
          pagesize: this.pageSize
        }
      })
      let {
        meta: { status },
        data: { result, total }
      } = ret.data
      // console.log(ret.data)
      if (status === 200) {
        this.categoryList = result
        this.total = total

        this.loading = false
      }
    },
    // 发送请求将级联对话框中的内容渲染出来
    async getCategoryList2() {
      // 发送请求给级联选择器加载2级菜单数据
      let ret = await this.axios({
        meghod: 'get',
        url: 'categories',
        params: {
          type: 2
        }
      })
      let {
        meta: { status },
        data
      } = ret.data

      if (status === 200) {
        this.categoryList2 = data
        // console.log(this.categoryList2)
      }
    },

    // 根据改变的当前页发送请求获取对应数据，当前页改变时触发
    currentChange(current) {
      this.loading = true
      this.currentPage = current
      this.getCategoryList()
    },

    // 每页显示数量改变时触发的事件
    sizeChange(size) {
      this.loading = true
      this.pageSize = size
      this.currentPage = 1
      this.getCategoryList()
    },

    // 点击显示添加分类的对话框,并发送请求将级联对话框中的内容渲染出来
    async showAddDialog() {
      // 点击编辑后变成false，用来区分是添加还是编辑
      this.id = false
      this.addForm.cat_name = ''
      this.addForm.cat_id = ''
      this.dialogVisible = true
      this.getCategoryList2()
    },

    // 点击确定添加分类
    handleAddCategoryClick() {
      this.$refs.addForm.validate(async valid => {
        if (!valid) {
          return false
        }
        // 发送ajax请求
        let { cat_name: catName, cat_pid: catPid } = this.addForm
        let ret = await this.axios.post('categories', {
          // 如果是一级分类，pid为0
          cat_pid: catPid[catPid.length - 1] || 0,
          cat_name: catName,
          cat_level: catPid.length
        })
        // console.log(ret)
        let {
          meta: { status }
        } = ret.data
        if (status === 201) {
          // 关闭对话框
          this.dialogVisible = false
          // 对该表单项进行重置，将其值重置为初始值并移除校验结果，只会重置具有prop属性的表单,且prop中对应的那个属性和v-model中的一致
          this.$refs.addForm.resetFields()
          // 发送请求刷新分类列表
          this.getCategoryList()
          this.$message.success('创建分类成功')
        } else {
          this.$message.error('创建分类失败')
        }
      })
    },

    // 点击删除分类
    async handleDeleteCategoryClick(row) {
      try {
        await this.$confirm('您确定删除该分类吗', '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        // console.log(row)
        let ret = await this.axios({
          method: `delete`,
          url: `Categories/${row.cat_id}`
        })
        let {
          meta: { status }
        } = ret.data
        if (status === 200) {
          this.$message.success('删除成功')
          // 为防止bug，每次删除都跳转到第一页
          // this.currentPage = 1
          // 刷新分类列表
          this.getCategoryList()
        }
      } catch (e) {
        this.$message.info('已取消')
      }
    },

    // 点击显示编辑分类框
    showCategoryDialog(row) {
      this.dialogVisible = true
      this.getCategoryList2()
      // 将当前分类赋值给表单，为了点击确定编辑时发送请求
      this.addForm.cat_name = row.cat_name
      this.addForm.cat_id = row.cat_id
      // 点击编辑后变成true，用来区分是添加还是编辑
      this.id = true
    },

    // 编辑框点击确定发送请求
    handleEditCategoryClick() {
      try {
        // 表单验证
        this.$refs.addForm.validate(async valid => {
          if (!valid) {
            return false
          }
          // 发送ajax请求
          let ret = await this.axios({
            method: `put`,
            url: `Categories/${this.addForm.cat_id}`,
            data: {
              cat_name: this.addForm.cat_name
            }
          })
          let {
            meta: { status }
          } = ret.data
          if (status === 200) {
            this.$message.success('更新成功')
            this.dialogVisible = false
            this.getCategoryList()
          } else {
            this.$message.error('更新失败')
          }
        })
      } catch (e) {
        this.$message.info('取消更新')
      }
    }
  }
}
</script>

<style lang="css" scoped></style>
