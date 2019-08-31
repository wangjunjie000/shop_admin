<template>
  <div class="goods">
    <!-- 添加按钮 -->
    <el-button type="primary" plain @click="$router.push('goods-add')"
      >添加商品</el-button
    >

    <!-- 添加商品的表格 -->
    <el-table :data="goodList" style="width: 100%" stripe>
      <!-- 表格中的列 -->
      <el-table-column :index="setIndex" type="index"></el-table-column>
      <el-table-column prop="goods_name" label="商品名称"></el-table-column>
      <el-table-column prop="goods_price" label="商品价格"></el-table-column>
      <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
      <el-table-column label="创建时间">
        <!-- 当数据格式不能满足的时候就可以用作用于插槽来自定义它 -->
        <template v-slot:default="scope">
          {{ scope.row.add_time | timeFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            plain
            size="small"
          ></el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            plain
            size="small"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'Goods',

  data() {
    return {
      goodList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      query: ''
    }
  },
  methods: {
    // 发送请求获取商品列表
    async getGoodList() {
      let ret = await this.axios({
        method: 'get',
        url: 'goods',
        params: {
          query: '',
          pagenum: this.currentPage,
          pagesize: this.pageSize
        }
      })
      let {
        meta: { status },
        data: { total, goods }
      } = ret.data
      if (status === 200) {
        this.goodList = goods
        this.total = total
        // console.log(goods)
      }
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.getGoodList()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getGoodList()
    },
    setIndex(index) {
      return index + 1 + (this.currentPage - 1) * this.pageSize
    }
  },
  created() {
    this.getGoodList()
  }
}
</script>

<style lang="css" scoped></style>
