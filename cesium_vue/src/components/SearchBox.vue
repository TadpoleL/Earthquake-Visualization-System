<template>
  <div id="search" class="serachContainer">
    <el-form ref="form" :model="form" label-width="80px" size="small">
      <!-- <span>地震信息统计平台</span> -->
      <font color="black" face="SimSun" size="6">地震信息统计平台</font>
      <!-- dateTime  起始时间选择器 -->
      <el-row>
        <el-form-item label="时间">
          <el-date-picker
            v-model="search.starttime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DDTHH:mm:ss.000Z"
            start-placeholder="开始日期"
            align="right"
            @change="startdateChange"
          />
          <span class="separator">至</span>
          <el-date-picker
            v-model="search.endtime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DDTHH:mm:ss.000Z"
            end-placeholder="结束日期"
            align="right"
            @change="enddateChange"
          />
        </el-form-item>
      </el-row>

      <!-- 输入  震级 -->
      <el-row>
        <el-col :span="11">
          <el-form-item label="最小震级">
            <el-input v-model="search.minMagnitude" placeholder="请输入最小震级" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="最大震级">
            <el-input v-model="search.maxMagnitude" placeholder="请输入最大震级" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>


      <!-- 输入  纬度 -->
      <el-row>
        <el-col :span="11">
          <el-form-item label="最低纬度">
            <el-input v-model="search.minLat" placeholder="请输入最低纬度" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="最高纬度">
            <el-input v-model="search.maxLat" placeholder="请输入最高纬度" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 输入  经度 -->
      <el-row>
        <el-col :span="11">
          <el-form-item label="最小经度">
            <el-input v-model="search.minLon" placeholder="请输入最小经度" clearable></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item label="最大经度">
            <el-input v-model="search.maxLon" placeholder="请输入最大经度" clearable></el-input>
          </el-form-item>
        </el-col>
      </el-row>


      <el-row>
        <!-- 输入  地点 -->
        <el-col :span="10">
          <el-form-item label="地点">
            <el-input v-model="search.keyword" placeholder="请输入地点" clearable></el-input>
          </el-form-item>
        </el-col>

        <!-- 查询按钮 -->
        <el-col :span="6">
          <el-form-item label="">
            <el-button @click="queryAll()">查询信息</el-button>
          </el-form-item>
        </el-col>

        <!-- 查询按钮 -->
        <el-col :span="4">
          <el-form-item label="">
            <el-button @click="updataDatabase()">更新数据库</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>

  <div class="table">
    <el-table :data="tabledata" v-loading="loading" :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
      border style="width: 100%;">
      <el-table-column label="id" type="index" :index="computeTableIndex" width="50">
      </el-table-column>
      <el-table-column prop="震级" label="震级" width="50">
      </el-table-column>
      <el-table-column prop="time" label="发震时间" min-width="80">
      </el-table-column>
      <el-table-column prop="lat" label="纬度" width="80">
      </el-table-column>
      <el-table-column prop="lon" label="经度" width="80">
      </el-table-column>
      <el-table-column prop="深度" label="深度" width="50">
      </el-table-column>
      <el-table-column prop="位置" label="位置" min-width="80">
      </el-table-column>
      <!-- <el-table-column prop="链接" label="链接">
      </el-table-column> -->
    </el-table>

    <!-- 创建分页 -->
    <el-pagination align='center' @size-change="SizeChange" @current-change="CurrentChange" :current-page="page"
      :page-sizes="pageSizes" :page-size="size" layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>

export default {
  name: 'SearchBox',

  data () {
    return {
      url: '',
      search: {        
        starttime: '',
        endtime: '',
        minMagnitude: '',
        maxMagnitude: '',
        minLat: '',
        maxLat: '',
        minLon: '',
        maxLon: '',
        keyword: '',
      },

      alldata: [],//读取到的数据
      tabledata: [],//table表格显示数据（获取到数据赋值给它就能显示数据列表）
      page: 1,//当前页
      size: 10, //每页几行
      total: 0, //总行数
    }
  },

  methods: {
    startdateChange(value) {
      console.log(value);  
      if (value === null) {
          this.search.starttime = '';
      }
    },

    enddateChange(value) {
      console.log(value);  
      if (value === null) {
          this.search.endtime = '';
      }
    },

    queryAll () {
      console.log("点击查询");
      let startTime = this.search.starttime;
      let endTime = this.search.endtime;
      let minMagnitude = this.search.minMagnitude;
      let maxMagnitude = this.search.maxMagnitude;
      let minLat = this.search.minLat;
      let maxLat = this.search.maxLat;
      let minLon = this.search.minLon;
      let maxLon = this.search.maxLon;
      let boundingBox = [minLon, minLat, maxLon, maxLat];
      let keyword = this.search.keyword

      this.url = `http://localhost:3000/search?startTime=${startTime}&endTime=${endTime}&minMagnitude=${minMagnitude}&maxMagnitude=${maxMagnitude}&boundingBox=${boundingBox}&keyword=${encodeURIComponent(keyword)}`;

      // 将jsondata传给父组件

      this.$emit('geturl', this.url);

      //fetch数据
      //获取后端数据
      console.log('serchbox开始fetch数据');
      fetch(this.url)
        .then(response => response.json())
        .then(data => {
          // const jsonStr = JSON.stringify(data, null, 2); // 使用缩进和换行
          // const newWindow = window.open('', '_blank');
          // newWindow.document.write('<pre>' + geojsonStr + '</pre>');
          console.log("tabledata get");
          this.alldata = data;
          this.alldata.splice(1, 0);
          this.getTableData();
        }
        )
        .catch(error => console.error(error));
    },

    // 更新数据库
    updataDatabase () {
      // this.$message.success('数据更新成功')  // ....成功信息

      fetch('http://localhost:3000/updateData')
        .then(response => response.json())
        .then(data => {
          if (data == 0) {
            this.$message.error('数据更新失败')  // .....失败信息
          }
          else {
            this.$message.success('数据更新成功')  // ....成功信息
          }
        })
        .catch(error => console.error(error));
    },

    // 获取表格数据，自行分页
    getTableData () {
      this.tabledata = this.alldata.slice(
        (this.page - 1) * this.size,
        this.page * this.size
      );
      this.total = this.alldata.length
    },

    // page改变的回调函数，参数为当前页码
    CurrentChange (val) {
      console.log("翻页，当前为第", val, "页");
      this.page = val;
      this.getTableData();
    },

    // 每页显示的数据行数改变
    SizeChange (val) {
      console.log(`每页 ${val} 条`);
      this.page = 1;
      this.size = val;
      this.getTableData();
    },

    // 计算index
    computeTableIndex (index) {
      return (this.page - 1) * this.size + index + 1;
    }
  }
}
</script>

<style scoped>
#serachContainer {
  /* width: 30%;
  height: 35%; */
  margin: 0px;
  background-color: #f1f1f1;
  /* background-color: white; */
  position: fixed;
  top: 0px;
  left: 60%;
  /* padding: 5px; */
}
</style>  