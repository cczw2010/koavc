export default {
  //============ 服务器配置
  host:'127.0.0.1',
  port:3000,
  // ==如果配置了https，将以https方式提供服务
  // https:{
  //   key: fs.readFileSync('ssl/xxxxyun.com.key'),
  //   cert: fs.readFileSync('ssl/xxxxyun.com.pem'),
  // },
  //============应用配置
  // v1.4.0开始，配置与之前版本不通用！更改为多应用配置模式，选项也有变化，老的版本参考对应版本的readme.md
  app:[],
  alias:{},
  //============日志
  logger:{
    tag:"koavc",      // tag标签
    level:4,          // consola的level
    console:true,     // 开启不开启
    file:{            // false  不开启
      dateFormat:'HH:mm:ss',   //时间戳格式
      dir:'logs',     // 日志目录
    }
  },
  //============view渲染配置  
  view:{
    src:'view',         //相对于根目录
    engine:'default',   //渲染引擎 default | lodash | vue 可自行拓展
    // 页面静态化缓存，传入false关闭
    cache:{
      dir:'.koavc/pagecache',
      ttl:1000*60*60*12
    }
  },
  // 全局koa中间件，在route之前执行
  middlewares:[],
  // 设置静态目录服务
  statics:[],
  //=================dev
  watchs:[],    //额外的监控目录，dev模式下变动会重启服务
}