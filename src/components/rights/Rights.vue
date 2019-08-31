<template>
  <div class="right">
    <!-- 面包屑组件 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 表格 -->
    <el-table :data="rightList" stripe style="width:100% ">
      <!-- type="index" 来定义列的索引，默认0开始，通过:index="indexMethod"可以自定义 -->
      <el-table-column type="index" :index="indexMethod"></el-table-column>
      <el-table-column prop="authName" label="权限名称" width="200"></el-table-column>
      <el-table-column prop="path" label="路径" width="200"></el-table-column>
      <el-table-column prop="level" label="层级" width="200">
        <!-- 通过插槽自定义列模板 -->
        <template v-slot="scope">
          <span v-if="scope.row.level === '0'">一级</span>
          <span v-else-if="scope.row.level === '1'">二级</span>
          <span v-else>三级</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'Rights',

  data() {
    return {
      rightList: []
      // index: 1
    }
  },
  async created () {
    let ret = await this.axios({
      method: 'get',
      url: 'rights/list'
    })
    let {meta: {status}, data} = ret.data
    if (status === 200) {
      this.rightList = data
      // console.log(ret)
    }
  },
  methods: {
    indexMethod (index) {
      return index + 1
    }
  }
}
</script>

<style lang="less" scoped>

</style>
