import { rootDist } from "vuesfcbuilder"

export default {
  //============ 服务器配置
  host:'127.0.0.1',
  port:3000,
  // ==如果配置了https，将以https方式提供服务
  // https:{
  //   key: fs.readFileSync('ssl/xxxxyun.com.key'),
  //   cert: fs.readFileSync('ssl/xxxxyun.com.pem'),
  // },
  //============路由配置
  router:{
    // controller文件根目录
    dir:"controller",
    // @koa/router中间件的配置
    option:{
      // host:'',
      // prefix:'',
      // V1.3.3 不建议修改，否则全局路由中间件将失效
      exclusive:false,
    },
     // V1.3.3 新增， 全局路由中间件,这里的中间件可以访问router, 前提是 option的 exclusive:false
     middlewares:[]
  },
  // alias:{},
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
  statics:[
    ['/static',rootDist],   //vue输出目录挂载到`/static`路由上
  ],
  //============vuesfcbuilder
  vuesfcbuilder: {
    injectStyle:'/static', 
    injectScript:'/static',
    buildModules:{
      // vuetify:{
      //   // meta:{},
      //   option:{}
      // }
    }
  }
}