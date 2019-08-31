<template>
  <div class="add">
    <!-- active的值对应步骤的高亮，通过点击tabs标签页来控制步骤的高亮 -->
    <el-steps :active="active" finish-status="success">
      <el-step title="步骤 1" description="基本信息"></el-step>
      <el-step title="步骤 2" description="商品图片"></el-step>
      <el-step title="步骤 3" description="商品内容"></el-step>
    </el-steps>

    <!-- tabs标签页 -->
    <el-tabs tab-position="left" @tab-click="change" v-model="activeName">
      <!-- 基本信息页面 -->
      <el-tab-pane label="基本信息" name="first">
        <el-form :model="form" label-width="80px">
          <el-form-item label="商品名称">
            <el-input v-model="form.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="form.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="form.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="form.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <!-- 级联选择器 -->
            <el-cascader
              :props="props"
              v-model="form.goods_cat"
              :options="categoryList"
              clearable
            ></el-cascader>
          </el-form-item>
          <el-form-item label="是否促销">
            <el-radio v-model="form.is_promote" :label="true">是</el-radio>
            <el-radio v-model="form.is_promote" :label="false">否</el-radio>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="next">下一步</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- 商品图片上传页面 -->
      <el-tab-pane label="商品图片" name="second">
        <el-upload
          class="upload-demo"
          action="http://localhost:8888/api/private/v1/upload"
          multiple
          list-type="picture"
          drag
          :headers="headers"
          :on-success="handleSuccess"
          :on-remove="handleRemove"
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">
            只能上传jpg/png文件，且不超过500kb
          </div>
        </el-upload>
      </el-tab-pane>
      <!-- 商品描述页面 -->
      <el-tab-pane label="商品内容" name="third">
        <quill-editor v-model="form.goods_introduce"></quill-editor>
        <el-button type="primary" @click="addGood">添加</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'Add',

  data() {
    return {
      active: 0,
      form: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        is_promote: false,
        pics: [],
        goods_introduce: ''
      },
      // 配置级联选择器中数据对应的key值，
      props: {
        // 这里应该用cat_id,而不是cat_pid,级联选择器选取值时双向绑定的就是这个值，添加分类传递参数的时候接口说要传cat_pid，实际上是要传这个cat_id，被坑惨了！
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
        // checkStrictly: true
      },
      categoryList: [],
      activeName: 'first',
      headers: {
        Authorization: window.localStorage.getItem('token')
      }
    }
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
          type: 3
        }
      })
      let {
        meta: { status },
        data
      } = ret.data
      // console.log(ret.data)
      if (status === 200) {
        this.categoryList = data
      }
    },
    change(tab) {
      // console.log(tab)
      this.active = parseFloat(tab.index)
    },
    next() {
      this.active = 1
      this.activeName = 'second'
    },
    handleSuccess(response, file, fileList) {
      // console.log(response)
      this.form.pics.push({
        pic: response.data.tmp_path
      })
    },
    handleRemove(file) {
      // console.log(file.response.data.tmp_path)
      // console.log(this.form.pics[0].pic)
      this.form.pics.forEach((item, index) => {
        if (item.pic === file.response.data.tmp_path) {
          this.form.pics.splice(index, 1)
        }
      })
    },
    // 点击上传商品信息
    async addGood() {
      let ret = await this.axios({
        method: 'post',
        url: 'goods',
        data: {
          ...this.form,
          goods_cat: this.form.goods_cat.join()
        }
      })
      console.log(ret)
      let {meta: {status}} = ret.data
      if (status === 201) {
        this.$message.success('商品创建成功')
        this.$router.push('goods')
      }
    }
  }
}
</script>

<style lang="css" scoped>
  .quill-editor {
  background-color: #fff;

}
/deep/ .ql-container {
    height: 300px;
  }
</style>
