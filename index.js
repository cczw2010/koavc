import http from "http"
import https from "https"
import {resolve} from "path"
import deepmerge from "deepmerge"
import consola from "consola"
import chalk from "chalk"
import initApp from "./core/app.js"
import defConfig from "./koavc.config.js"

process.on("uncaughtException",(e)=>{
  consola.error(e)
})
// process.on("unhandledRejection",(e)=>{
//   consola.error(e)
// })
// 启动生产web服务
export async function run(callback){
  const config = await getRuntimeConfig()
  const app = await initApp(config)
  const httpsOption = config.https
  const serverSchame = httpsOption?https:http
  const port = config.port
  const host = config.host||'0.0.0.0'
  let server = null
  const cb  = (err)=>{
    callback && callback(err,server,config)
    const logger = app.context.logger
    if (err) {
      logger.error(err)
    } else {
      const muse = process.memoryUsage()
      logger.info(chalk.gray(`Memory usage ${(muse.heapTotal/(1024*1024)).toFixed(2)}MB (rss:${(muse.rss/(1024*1024)).toFixed(2)}MB)`))
      logger.success(`Server start successful. ${httpsOption?'https':'http'}://${host}:${port}`)
    } 
  }
  if(httpsOption){
    server = serverSchame.createServer(httpsOption,app.callback())
  }else{
    server = serverSchame.createServer(app.callback())
  }
  server.listen(port,host, cb)
  return server
}

/**
 * 加载项目自定义的config文件，合并生成运行时config文件
 * @export object
 */
export async function getRuntimeConfig(){
  try{
    const localConfig = await import(resolve("./koavc.config.js")).then(m=>m.default)
    const config = deepmerge(defConfig,localConfig)
    config.app = initAppOptions(config.app)
    return config
  }catch(e){
    consola.error('Error in [koavc.config.js].',e)
    process.exit(1)
  }
}

// 初始化多应用的配置参数
function initAppOptions(options){
  if(!options || options.length==0){
    throw new Error("There should be at least one app")
  }
  options.map((option,id)=>{
    if(!option.dir){
      throw new Error(`The ${id}th app option [dir] is required`)
    }
    option._dir = option.dir
    option.dir = resolve(option.dir)
    // if(!option.prefix){
    //   option.prefix = '/'
    // }
  })
  return options
}