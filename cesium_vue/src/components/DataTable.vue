<template>
  <!-- 创建表头 -->
  <el-table :data="formdata" v-loading="loading" :header-cell-style="{ background: '#eef1f6', color: '#606266' }" border
    style="width: 100%;">
    <el-table-column prop="gid" label="id" width="180">
    </el-table-column>
    <el-table-column prop="震级" label="震级" width="180">
    </el-table-column>
    <el-table-column prop="time" label="发震时间">
    </el-table-column>
    <el-table-column prop="lat" label="纬度">
    </el-table-column>
    <el-table-column prop="lon" label="经度">
    </el-table-column>
    <el-table-column prop="深度" label="深度">
    </el-table-column>
    <el-table-column prop="位置" label="位置">
    </el-table-column>
    <el-table-column prop="链接" label="链接">
    </el-table-column>
  </el-table>
  <!-- 创建分页 -->
  <el-pagination align='center' @size-change="SizeChange" @current-change="CurrentChange" :current-page="page"
    :page-sizes="pageSizes" :page-size="size" layout="total, sizes, prev, pager, next, jumper" :total="total">
  </el-pagination>
</template>

<script>
let tableurl = ''

export default {
  data () {
    return {
      alldata: [],//读取到的数据
      tabledata: [],//table表格显示数据（获取到数据赋值给它就能显示数据列表）
      page: 1,//当前页
      size: 10, //每页几行
      total: 0, //总行数

      // url

    }
  },

  mounted () {
    //程序启动先执行一遍，获取第一页数据
    // this.getTaskList()
  },

  methods: {
    // 从父组件中获取url
    settableurl (val) {
      tableurl = val;
      console.log('tableurl', tableurl);

      // 这里调用往表格中添加数据的函数
      this.fetchdata();

      return null;
    },

    //获取后端数据
    fetchdata () {
      console.log('ferch tableurl')
      fetch(tableurl)
        .then(response => response.json())
        .then(data => {
          // const jsonStr = JSON.stringify(data, null, 2); // 使用缩进和换行
          // const newWindow = window.open('', '_blank');
          // newWindow.document.write('<pre>' + geojsonStr + '</pre>');

          console.log("tabledataget");
          this.data = data;
        }
        )
        .catch(error => console.error(error));
    },


    //表格翻页功能 —— <el-pagination>标签中的@size-change 和 @current-change 保持一致
    //每页条数改变时触发 选择一页显示多少行
    handleSizeChange (val) {
      console.log(`每页 ${val} 条`);
      this.currentPage = 1;
      this.pageSize = val;
    },
    //当前页改变时触发 跳转其他页
    handleCurrentChange (val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
    }
  }
}
</script>