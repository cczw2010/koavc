import http from "http"
import https from "https"
import {resolve} from "path"
import deepmerge from "deepmerge"
import consola from "consola"
import {initialize} from "./core/index.js"
import defConfig from './koavc.config.js'
import {startLiveServer} from "./libs/livereload.js"
import chalk from "chalk"

// 启动生产web服务
export async function run(Config,isDev=false){
  const app = await initialize(Config,isDev)
  const httpsOption = Config.https
  const serverSchame = httpsOption?https:http
  const port = Config.port
  const host = Config.host||'0.0.0.0'
  const cb  = (err)=>{
    const logger = app.context.logger
    if (err) {
      logger.error(err)
    } else {
      // livereload
      if(isDev){
        startLiveServer(server)
      }
      const muse = process.memoryUsage()
      const mstr = `{"rss":${muse.rss},"heapUsed":${muse.heapUsed}}`
      logger.success(chalk.green(`server start successful. ${httpsOption?'https':'http'}://${host}:${port}`));
      logger.log(chalk.grey(`  memory:${mstr}\n  cpu:\t${JSON.stringify(process.cpuUsage())}`))
    } 
  }
  let server = null
  if(httpsOption){
    server = serverSchame.createServer(httpsOption,app.callback())
  }else{
    server = serverSchame.createServer(app.callback())
  }
  server.listen(port,host, cb)
}
// 初始化参数设置
export async function initConfig(){
  // consola.info('loading config')
  const localConfig = await import(resolve("./koavc.config.js"))
          .then(module=>module.default)
          .catch(e=>{
            consola.error(e)
            process.exit(1)
          })
  if(!localConfig){
    consola.warn('ignore invalid config file [koavc.config.js], use default.')
  }
  return deepmerge(defConfig,localConfig)
}