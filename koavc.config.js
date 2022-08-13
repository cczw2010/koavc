import { rootDist } from "vuesfcbuilder"

export default {
  //============ 服务器配置
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
      //是否只执行最后一个匹配的。不建议修改，否则路由规则可能会超出预想。因为路由模块获取文件list路由的时候 带_的泛路由文件名会在最前面，所以，执行最后一个正好不会覆盖实名路由
      exclusive:true,
    },
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
    src:'view',      //相对于根目录
    engine:'default'    //渲染引擎 default | lodash | vue 可自行拓展
  },
  middlewares:{},
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