import http from "http"
import https from "https"
import {join} from "path"
import deepmerge from "deepmerge"
import consola from "consola"
import {initialize} from "./core/index.js"
import defConfig from './koavc.config.js'

// 启动生产web服务
export async function run(Config){
  const app = await initialize(Config)
  const httpOptions = Config.https
  const server = httpOptions?https:http
  const port = Config.port
  const cb  = (err)=>{
    if (err) {
      app.context.logger.error(err)
    } else {
      app.context.logger.success('[server]',`${httpOptions?'https':'http'} server start success. listenn at ${port}`);
    } 
  }
  if(httpOptions){
    server.createServer(httpOptions,app.callback()).listen(port, cb);
  }else{
    server.createServer(app.callback()).listen(port, cb);
  }
}

// 初始化参数设置
export async function initConfig(){
  consola.info('loading config')
  defConfig.root = process.env.PWD
  const localConfig = await import(join(defConfig.root,"koavc.config.js"))
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