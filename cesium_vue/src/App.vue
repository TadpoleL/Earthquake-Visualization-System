<template>
  <EarthPane ref="EarthPane"></EarthPane>
  <SearchBox @geturl="getURL"></SearchBox>
  <!-- <DataTable ref="DataTable"></DataTable> -->
  <!-- <el-container class="home-container">
    <el-header>
      <div>
        <img alt="" height="50px" />
        <span>地震信息统计平台</span>
      </div>
    </el-header>
  </el-container> -->
  <!-- 页面主体区域 -->
  <!-- <el-container>
    <el-col :span="8">
      <el-row>       
        <SearchBox @geturl="getURL"></SearchBox>
      </el-row>
      <el-row>
        <DataTable ref="DataTable"></DataTable>
      </el-row>
    </el-col>

    <el-col>
      <el-row>
        <EarthPane ref="EarthPane"></EarthPane>
      </el-row>
    </el-col>

  </el-container> -->
</template>

<script>

import EarthPane from './components/EarthPane.vue';
// import DataTable from './components/DataTable.vue';
import SearchBox from './components/SearchBox.vue';

export default {
  name: 'App',

  components: {
    EarthPane,
    // DataTable,
    SearchBox,
  },

  data () {
    return {
      url: ''
    }
  },

  methods: {
    // 将url传入到数据表组件和cesium球组件中
    getURL (url) {
      this.url = url
      console.log('APP接受url', url)
      this.$refs.EarthPane.seturl(this.url);
      // this.$refs.DataTable.settableurl(this.url);
    }
  }
}
</script>


<!-- <style>
.home-container {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}

.el-header {
  background-color: #666;
  设置显示为flex布局
  display: flex;
  设置为flex左右布局
  justify-content: space-between;
  左内边距为0（Logo贴左边）
  padding-left: 0;
  元素上下居中（防止右边按钮贴上下边）
  align-items: center;
  color: #fff;
  font-size: 26px;
  文字左侧设置间距，防止与Logo紧贴
  margin-left: 15px;
}

.EarthPane {
  width: 100%;
  background-color: #eaedf1;
}

.SearchBox {
  width: 40%;
  height: 40%;
  order: -1;
  background-color: #333744;
  flex: 0 0 80px;
}

.DataTable {
  width: 40%;
  height: 60%;
  order: -1;
  flex: 0 0 80px;
  background-color: #333744;
} 
</style> -->

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #f1f1f1;
  margin: 0px;
  width: 100%;
  height: 100%;
}

/* 搜索框样式 */
.serachContainer {
  position: absolute;
  left: 60%;
  width: 40%;
  top: 0px;
  right: 0px;
  font-size: 25px;
  font-weight: bold;
  /* text-align: center; */
  background-color: #f1f1f1;
  color: #666;
  padding: 0px 10px 15px 20px;
  /* letter-spacing: 10px; */
}

/* 右侧样式 */
.table {
  position: absolute;
  left: 60%;
  width: 40%;
  top: 35%;
  bottom: 0px;
  overflow-y: auto;
  background-color: #f1f1f1;
}

/* 地球区域 */
.earthContainer {
  position: absolute;
  height: 100%;
  bottom: 0px;
  right: 0px;
  /* 距离右边0像素 */
  padding: 10px;
  overflow-y: auto;
}
</style>