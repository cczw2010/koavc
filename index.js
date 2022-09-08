import http from "http"
import https from "https"
import {resolve} from "path"
import deepmerge from "deepmerge"
import consola from "consola"
import chalk from "chalk"
import initApp from "./core/app.js"
import defConfig from "./koavc.config.js"
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
      const mstr = `{"rss":${muse.rss},"heapUsed":${muse.heapUsed}}`
      logger.success(chalk.green(`server start successful. ${httpsOption?'https':'http'}://${host}:${port}`));
      logger.log(chalk.grey(`  memory:${mstr}\n  cpu:\t${JSON.stringify(process.cpuUsage())}`))
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
  const localConfig = await import(resolve("./koavc.config.js"))
  .then(m=>m.default)
  .catch(e=>{
    consola.error(e)
    process.exit(1)
  })
  if(!localConfig){
  consola.warn('ignore local config file [koavc.config.js], use default.')
  }
  return deepmerge(defConfig,localConfig)
}