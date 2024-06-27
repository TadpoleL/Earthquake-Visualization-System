const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());

// 创建数据库连接池
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgis_33_sample',
  password: '123456',
  port: '5432',
  timezone: 'Asia/Shanghai'
});

// 获取所有数据
app.get('/all', (req, res) => {
    // 构建查询语句
    const query = `
      SELECT id,震级,to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,lat,lon,深度,位置,链接 FROM earthquake_data ORDER BY id DESC
    `;
  
    // 执行查询
    pool.query(query, (error, result) => {
      if (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'An error occurred' });
      } else {
        res.json(result.rows);
      }
    });
});

//根据特定id返回
app.get('/index/:id', (req, res) => {
    const id = req.params.id;
  
    // 构建查询语句
    const query = `
      SELECT id,震级,to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,lat,lon,深度,位置,链接 FROM earthquake_data
      WHERE id = $1
    `;
  
    // 执行查询
    pool.query(query, [id], (error, result) => {
      if (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'An error occurred' });
      } else if (result.rows.length === 0) {
        res.status(404).json({ error: 'Data not found' });
      } else {
        res.json(result.rows);
      }
    });
});
  
// 根据震级查询地震点数据
app.get('/magnitude', (req, res) => {  
    const min_magnitude = req.query.minMagnitude;
    const max_magnitude = req.query.maxMagnitude;  
  
    // 构建查询语句
    const query = `
      SELECT id,震级,to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,lat,lon,深度,位置,链接 FROM earthquake_data
      WHERE 震级 >= $1 AND 震级 <= $2
      ORDER BY id DESC
    `;
  
    // 执行查询
    pool.query(query, [min_magnitude, max_magnitude], (error, result) => {
      if (error) {
        console.error('Error executing query', error);
        res.status(500).json({ error: 'An error occurred' });
      } else {
        res.json(result.rows);
      }
    });
  });

// 根据时间段查询地震点数据
app.get('/time', (req, res) => {
  const start_time = req.query.startTime;
  const end_time = req.query.endTime;

  // 构建查询语句
  const query = `
    SELECT id,震级,to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,lat,lon,深度,位置,链接 FROM earthquake_data
    WHERE time >= $1 AND time <= $2
    ORDER BY id DESC
  `;

  // 执行查询
  pool.query(query, [start_time, end_time], (error, result) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(result.rows);
    }
  });
});

// 根据地理范围查询地震点数据
app.get('/location', (req, res) => {
  const min_latitude = req.query.minLatitude;
  const max_latitude = req.query.maxLatitude;
  const min_longitude = req.query.minLongitude;
  const max_longitude = req.query.maxLongitude;

  // 构建查询语句
  const query = `
    SELECT id,震级,to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,lat,lon,深度,位置,链接 FROM earthquake_data
    WHERE lat >= $1 AND lat <= $2
    AND lon >= $3 AND lon <= $4
    ORDER BY id DESC
  `;

  // 执行查询
  pool.query(query, [min_latitude, max_latitude, min_longitude, max_longitude], (error, result) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(result.rows);
    }
  });
});

//根据所在省级行政区或地区进行查询
app.get('/area', (req, res) => {
  const keyword = req.query.keyword;

  // 构建查询语句
  const query = `
    SELECT id,震级,to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,lat,lon,深度,位置,链接
    FROM earthquake_data
    WHERE 位置 LIKE $1
    ORDER BY id DESC
  `;

  // 执行查询
  pool.query(query, [`${keyword}%`], (error, result) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(result.rows);
    }
  });
});

//复合查询
app.get('/search', (req, res) => {
  // 获取查询参数
  const { startTime, endTime, minMagnitude, maxMagnitude, boundingBox, keyword } = req.query;

  // 构建查询语句
  let query = `
    SELECT id,震级,to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,lat,lon,深度,位置,链接 FROM earthquake_data
    WHERE 1 = 1
  `;

  const queryParams = [];

  // 添加时间范围条件
  if (startTime) {
    query += ` AND time >= $${queryParams.length + 1}::timestamptz`;
    queryParams.push(startTime + 'Z');
  }
  if (endTime) {
    query += ` AND time <= $${queryParams.length + 1}::timestamptz`;
    queryParams.push(endTime + 'Z');
  }

  // 添加震级范围条件
  if (minMagnitude) {
    query += ` AND 震级 >= $${queryParams.length + 1}`;
    queryParams.push(minMagnitude);
  }
  if (maxMagnitude) {
    query += ` AND 震级 <= $${queryParams.length + 1}`;
    queryParams.push(maxMagnitude);
  }

  let [minLon, minLat, maxLon, maxLat] = boundingBox.split(',');
  // 四个参数只要有一个非空，添加地理范围条件
  if (minLon || minLat || maxLon || maxLat) {
    if(!minLon)
    {
      minLon=-180
    }
    if(!minLat)
    {
      minLat=-90
    }
    if(!maxLon)
    {
      maxLon=180
    }
    if(!maxLat)
    {
      maxLat=90
    }
    query += ` AND ST_Contains(ST_MakeEnvelope($${queryParams.length + 1}, $${queryParams.length + 2}, $${queryParams.length + 3}, $${queryParams.length + 4}, 4326), the_geom)`;
    queryParams.push(minLon);
    queryParams.push(minLat);
    queryParams.push(maxLon);
    queryParams.push(maxLat);
  }

  // 添加行政区划条件
  if (keyword) {
    query += ` AND 位置 LIKE $${queryParams.length + 1}`;
    queryParams.push(`%${keyword}%`);
  }
  query +=` ORDER BY id DESC`;



  // 执行查询
  pool.query(query, queryParams, (error, result) => {
    if (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      res.json(result.rows);
    }
  });
});

//更新地震点数据
app.get('/updateData', (req, res) => {
  exec('python updateData.py', (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing Python script', error);
      res.send('0');
    } else {
      console.log('Python script executed successfully');
      res.send('1');
    }
  });
});



// 启动服务器
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
