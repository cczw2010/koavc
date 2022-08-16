// 模板文件请使用单文件模式
// 注意，该模式应该区分服务器端渲染，可服务器端注入（只预注入数据和处理中间件，而不进行直接vue渲染），暂时定位为后
import  {renderer} from "vuesfcbuilder"

// console.log(clientManifest)
//TODO lru-cache  缓存
// const LRU = require('lru-cache')

// 模板方法
export default {
  name:"vue",
  // 根据传入的引擎配置初始化
  // init(params){
  // },
  // 防止使用默认配置
  transferPath(path){
    return path
  },
  // 自定义获取源码,渲染前处理源码,主要是拼合layout和page
  async getSource(path,ctx){
   return path
  },
  // 渲染
  async compiled(path,data,ctx){
    return await renderer(path,data,ctx)
    // ctx.body = html
  }
}
