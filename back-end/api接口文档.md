# 1. 地震可视化 接口文档



## 1.1. 说明

- 接口基准地址：`http://127.0.0.1:3000/`
- 数据返回格式统一使用 JSON

* 响应数据示例

  ```json
  {
    {
      "id": 1,
      "震级": 3,
      "time": "2023-05-16T11:28:37.000Z",
      "lat": 28.08,
      "lon": 105.12,
      "深度": 10,
      "位置": "四川宜宾市兴文县",
      "链接": "https://news.ceic.ac.cn/CD20230516192837.html",
      "the_geom": "0101000020E610000048E17A14AE475A4014AE47E17A143C40"
    }
    、、、
  }
 



## 1.2. 接口



### 1.2.1. 请求所有数据

* 请求路径：`/all`

* 请求方法：get

* 示例：http://localhost:3000/all

* 返回：存储在数据库中的所有地震点数据

  

### 1.2.2. 根据id请求数据

* 请求路径：`/index/:id`

* 请求方法：get

* 示例：http://localhost:3000/index/2

* 请求参数

  | 参数名   | 参数说明 |
  | -------- | -------- |
  |    id    | id标识符  |

* 返回：特定id标识符对应的地震点数据



### 1.2.3. 根据震级查询地震点数据

* 请求路径：`/magnitude`

* 请求方法：get

* 示例：http://localhost:3000/magnitude?minMagnitude=4&maxMagnitude=5

* 请求参数

  | 参数名   | 参数说明        |
  | -------- | --------------- |
  | minMagnitude | 最小震级  |
  | maxMagnitude | 最大震级 |

* 返回：大于等于最小震级，小于等于最大震级的地震点数据。

* 注意：必须同时给定两个参数，如果进行单边查询，可以在前端设置另一参数为0或者10。数据震级范围为1.1-8.6。



### 1.2.4. 根据时间段查询地震点数据

* 请求路径：`/time`

* 请求方法：get

* 示例1：http://localhost:3000/time?startTime=2023-01-01T00:00:00&endTime=2023-02-01T00:00:00
* 示例1：http://localhost:3000/time?startTime=2023-01-01%2000:00:00&endTime=2023-02-01%2000:00:00
* 示例2：http://localhost:3000/time?startTime=2023-05-03&endTime=2023-05-04

* 请求参数

  | 参数名   | 参数说明        |
  | -------- | --------------- |
  | startTime | 起始时间  |  
  | endTime   | 终止时间 |   

* 返回：大于等于起始时间，小于等于终止时间的地震点数据。

* 注意1：必须同时给定两个参数，如果进行单边查询，可以在前端设置另一参数为2012-01-01T00:00:00Z或者当前时间。数据震级范围为2012.04.26  -  2023.05.16。
* 注意2：可以仅使用日期，不加具体时间，如示例2所示。



### 1.2.5. 根据地理范围查询地震点数据

* 请求路径：`/location`

* 请求方法：get

* 示例：http://localhost:3000/location?minLongitude=-180&maxLongitude=180&minLatitude=-90&maxLatitude=90

* 请求参数

  | 参数名   | 参数说明        | 
  | -------- | --------------- | 
  | minLongitude | 最小经度  |      
  | maxLongitude | 最大经度  |      
  | minLatitude  | 最小纬度  |      
  | maxLatitude  | 最大纬度  |      

* 返回：在经纬度范围内的地震点数据。

* 注意：必须同时给定4个参数，如果进行单边查询，可以在前端设置另外参数为-180，180，-90，90。

  

### 1.2.6. 根据所在省级行政区或地区进行查询

* 请求路径：`/area`

* 请求方法：get

* 示例：http://localhost:3000/area?keyword=四川

* 请求参数

  | 参数名   | 参数说明 | 
  | -------- | -------- | 
  |    keyword    | 所在省  |      

* 返回：数据库中“位置”字段开头为keyword的地震点数据，匹配原则为'四川%'

* 注意：keyword只能用四川，不能用四川省。可以为阿根廷、印度等国家名



### 1.2.7. 复合查询

* 请求路径：`/search`

* 请求方法：get

* 示例1：http://localhost:3000/search?startTime=2023-05-01T00:00:00&endTime=2023-05-31T23:59:59&minMagnitude=4&maxMagnitude=6&boundingBox=-180,-90,180,90&keyword=四川
* 示例2：http://localhost:3000/search?startTime=2022-05-31&minMagnitude=4&keyword=四川
* 示例3：http://localhost:3000/search?startTime=2022-05-31
* 示例3：http://localhost:3000/search?keyword=四川
* 示例1：http://localhost:3000/search?startTime=&endTime=&minMagnitude=&maxMagnitude=&boundingBox=90,,,&keyword=

* 请求参数

  | 参数名   | 参数说明 | 
  | -------- | -------- | 
  |  startTime   | 起始时间  |  
  |   endTime    | 结束时间  |  
  | minMagnitude | 最小震级  |  
  | maxMagnitude | 最大震级 |  
  | boundingBox  | 地理范围  |  
  |  keyword   | 所在省区  |       

* 返回：返回满足复合条件的查询结果。

* 注意1：其他参数和前文的接口基本一致，boundingBox=-180,-90,180,90为地理范围，后面四个数分别代表最小经度、最小纬度、最大经度、最大纬度
* 注意2：可以仅给定startTime和endTime中的一个，进行单边查询，也可以仅给定minMagnitude、maxMagnitude中的一个
* 注意3：boundingBox的四个参数可以选择性省略其中几个或几个，也可以全部省略，将使用postGIS中the_geom几何字段进行空间查询
* 注意4：时间条件、震级条件、地理范围、所在省区均可以省略不给出，会自动根据给出的条件进行查询



### 1.2.8. 请求更新数据

* 请求路径：`/updateData`

* 请求方法：get

* 示例：http://localhost:3000/updateData

* 返回：返回执行python爬虫的结果

* 说明：执行已经完成的py爬虫文件来爬取最新的地震数据，会自动爬取当前日期前一天为截止时间的所有地震数据并存入数据库中。