<template>
  <div id="earthContainer"></div>
</template>

<script>
import * as Cesium from "cesium/Cesium";
import * as widgets from "cesium/Widgets/widgets.css";
// import bus from '../bus.js'

let viewer = null
let highlightEntity = null

export default {
  name: 'EarthPane',

  mounted () {
    //组件初始化完成后，挂载到父容器中后触发
    this.initEarth();
  },

  data () {
    //保存组件的私有数据
    return {
      // cesium图层
      // viewer: undefined,
      //定义高亮变量
      // highlightEntity: null,
      //定义url变量
      earthurl: '',
    }
  },

  methods: {
    // 初始化
    initEarth () {
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2OTkxY2ZlYS01NjQ1LTQwOTktODc4OS1mNTQ3NTk5NGZjY2YiLCJpZCI6MzE4OTUsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTYxMDU3NTl9.MfJB6x_8MAk5sq7VEHu-_OYj4K8ZHdWoirMkjJFvNFg';
      viewer = new Cesium.Viewer('earthContainer', {
        timeline: false,//是否显示时间轴  
        sceneMode: 3,//初始场景模式 1 2D模式 2 2D循环模式 3 3D模式  Cesium.SceneMode
        animation: false,//是否创建动画小器件，左下角仪表  
      })
    },

    // 从父组件中获取url
    seturl (val) {
      this.earthurl = val;
      this.fetchdata();
      return null;
    },

    // 获取后端数据
    fetchdata () {
      fetch(this.earthurl)
        .then(response => response.json())
        .then(data => {
          // const jsonStr = JSON.stringify(data, null, 2); // 使用缩进和换行

          // 生成geojson数据
          const geoJsonData = {
            type: 'FeatureCollection',
            features: data.map(item => ({
              type: 'Feature',
              properties: item,
              geometry: {
                type: 'Point',
                coordinates: [item.lon, item.lat] // 注意经度和纬度的顺序
              }
            }))
          };
          // const geojsonStr = JSON.stringify(geoJsonData, null, 2); // 使用缩进和换行
          // const newWindow = window.open('', '_blank');
          // newWindow.document.write('<pre>' + geojsonStr + '</pre>');

          this.drawPoint(geoJsonData);
          this.mountEventHandler();
        }
        )
        .catch(error => console.error(error));
    },


    // 在cesium球上画点
    drawPoint (geoJsonData) {
      var dataPromise = Cesium.GeoJsonDataSource.load(geoJsonData);

      dataPromise.then(function (dataSource) {

        //清除之前的实体
        // viewer.entities.removeAll();
        viewer.dataSources.removeAll(true)

        // 加载数据
        viewer.dataSources.add(dataSource);
        viewer.flyTo(dataSource);
        var entities = dataSource.entities.values;

        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          // 显示点数据而不是标记
          entity.billboard = undefined;

          if (entity.properties.震级 < 3) {
            entity.point = new Cesium.PointGraphics({
              color: Cesium.Color.fromCssColorString('#f2d643'),
              pixelSize: entity.properties.震级,
            })
          }
          else if (entity.properties.震级 < 4.5) {
            entity.point = new Cesium.PointGraphics({
              color: Cesium.Color.fromCssColorString('#ffb248'),
              pixelSize: 1.5 * entity.properties.震级,
            })
          }
          else if (entity.properties.震级 < 6) {
            entity.point = new Cesium.PointGraphics({
              color: Cesium.Color.fromCssColorString('#eb8146'),
              pixelSize: 2 * entity.properties.震级,
            })
          }
          else {
            entity.point = new Cesium.PointGraphics({
              color: Cesium.Color.fromCssColorString('#d95850'),
              pixelSize: 3.5 * entity.properties.震级,
            })
          }
        }
      });
    },

    // 挂载鼠标事件
    mountEventHandler () {
      //1. 创建ScreenSpaceEventHandler对象
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      //2. 定义输入的响应函数
      handler.setInputAction(function (movement) {

        var pickedObject = viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && pickedObject.id instanceof Cesium.Entity) {
          //移除之前显示的高亮点
          if (Cesium.defined(highlightEntity)) {
            if (highlightEntity.properties.震级 < 3) {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#f2d643')
            }
            else if (highlightEntity.properties.震级 < 4.5) {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#ffb248')
            }
            else if (highlightEntity.properties.震级 < 6) {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#eb8146')
            }
            else {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#d95850')
            }
            highlightEntity = null;
          }
          // 高亮显示点
          highlightEntity = pickedObject.id;
          highlightEntity.point.color = Cesium.Color.GREEN.withAlpha(0.7);
        } else {
          // 移除高亮显示
          if (Cesium.defined(highlightEntity)) {

            if (highlightEntity.properties.震级 < 3) {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#f2d643')
            }
            else if (highlightEntity.properties.震级 < 4.5) {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#ffb248')
            }
            else if (highlightEntity.properties.震级 < 6) {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#eb8146')
            }
            else {
              highlightEntity.point.color = Cesium.Color.fromCssColorString('#d95850')
            }

            highlightEntity = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },


  },
};


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#earthContainer {
  /* left: 40%; */
  width: 60%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  background-color: red;
}
</style>  