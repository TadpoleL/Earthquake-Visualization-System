from datetime import datetime, timedelta
import requests
import pandas as pd
import psycopg2

# 定义数据库连接信息
db_host = "localhost"
db_port = "5432"
db_name = "postgis_33_sample"
db_user = "postgres"
db_password = "123456"

#根据时间范围获得网页的页面总数
def get_page_num(startTime,endTime):
    url=f'http://www.ceic.ac.cn/ajax/search?page=0&&start={startTime}&&end={endTime}&&jingdu1=&&jingdu2=&&weidu1=&&weidu2=&&height1=&&height2=&&zhenji1=&&zhenji2=' 
    header = {'User-Agent': 'Mozilla/5.0'}
    params = {"time": 6, "page": 0}
    r = requests.get(url, params=params, headers=header)
    print(r.url)
    if r.status_code == 200:
        r.encoding = r.apparent_encoding
        
        json_data = eval(r.text)#转换成字典
        return json_data['num']
    else:
        print("网页爬取异常")
        return None
    
    
# 获取对应时间范围内对应页数的内容
def get_html(page,startTime,endTime):
    
    url=f'http://www.ceic.ac.cn/ajax/search?page={page}&&start={startTime}&&end={endTime}&&jingdu1=&&jingdu2=&&weidu1=&&weidu2=&&height1=&&height2=&&zhenji1=&&zhenji2='  
    header = {'User-Agent': 'Mozilla/5.0'}
    params = {"time": 6, "page": page}
    r = requests.get(url, params=params, headers=header)
    print(r.url)
    if r.status_code == 200:
        r.encoding = r.apparent_encoding
        return r.text
    else:
        print("网页爬取异常")
        return None

# 解析、提取网页源代码
def get_data(html):
    data = []
    json_data = eval(html)#转换成字典
    
    for i in json_data['shuju']:
        latitude=i['EPI_LAT']#纬度
        longitude=i['EPI_LON']#经度
        depth=i['EPI_DEPTH']#深度
        location=i['LOCATION_C']#参考位置
        time=i['O_TIME']#时间
        Magnitude=i['M']#震级
        URL='https://news.ceic.ac.cn/'+i['NEW_DID']+'.html'#链接
        data.append({
            '震级': Magnitude,
            '时间': time,
            '纬度': latitude,
            '经度': longitude,
            '震源深度': depth,
            '地址': location,
            'url': URL
        })

    return data

if __name__ == "__main__":
    #url = "http://www.ceic.ac.cn/speedsearch"
    # 连接数据库
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        database=db_name,
        user=db_user,
        password=db_password
    )    
    cursor = conn.cursor()
    cursor.execute('SELECT MAX(time) FROM earthquake_data;')
    data_res=cursor.fetchone()[0]
    if(not data_res):
        #数据库不存在数据，指定地震网最早记录时间2012.4.26作为起始日期
        startTime = datetime(2012, 4, 26).date()
        print("初始查询日期:", startTime)
    else:
        #使用数据库存在数据的最晚日期+1作为初始查询日期
        startTime= data_res.date()
        print("已存在数据的最晚日期:", startTime)
        startTime = startTime + timedelta(days=1)
        print("初始查询日期:", startTime)
    
    #更新到当前日期的前一天，避免数据不完整
    current_date = datetime.now().date()
    endTime = current_date
    print("更新到当前日期的前一天，当前日期：",endTime)
    
    page_num=get_page_num(startTime,endTime)
    print("当前时间范围内的页数：",page_num)
    
    data = []
    for i in range(1, page_num+1):        
        html = get_html(i,startTime,endTime)
        if html:
            data += get_data(html)

    df = pd.DataFrame(data)
    df.drop_duplicates(inplace=True)  # 数据清洗去重
    pd.set_option('display.max_columns', None)
    pd.set_option('display.max_rows', None)
    print(df)
    
    for _, row in df[::-1].iterrows():
        insert_query = """
            INSERT INTO earthquake_data (震级, time, lat, lon, 深度, 位置, 链接)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            row['震级'],
            datetime.strptime(row['时间'], '%Y-%m-%d %H:%M:%S'),
            row['纬度'],
            row['经度'],
            row['震源深度'],
            row['地址'],
            row['url']
        )
        cursor.execute(insert_query, values)
    cursor.execute("UPDATE earthquake_data SET the_geom = ST_SetSRID(ST_MakePoint(lon,lat), 4326);")
    
    
    # 提交事务并关闭连接
    conn.commit()
    cursor.close()
    conn.close()
    