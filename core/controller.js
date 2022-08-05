/**
 * 路由， 遍历加载路由文件
 */
import {relative,join} from "path"
import { readdir,stat } from 'fs/promises'
import Router from '@koa/router'
import {loadMiddleware} from "./middleware.js"

let router = null
let RootDir = null
let Logger = null
let Alias = null
export default async (config,logger)=>{
  RootDir = config.dir,
  router = new Router(config.option)
  Alias = config.alias||{}
  Logger = logger||console
  Logger.info("loading controllers...")
  await travel(RootDir)
  return router.routes()
}

// 遍历加载controller
async function travel(dir) {
  const files =await readdir(dir).catch(e=>{
    Logger.error(e)
    return []
  });
  // 默认按照自古正序，而_开头的泛域名在最前
  // files.reverse()
  for (const k in files) {
    const file = files[k];
    const pathname = join(dir, file)
    const stats = await stat(pathname)
    
    if (stats.isDirectory()) {
      await travel(pathname);
    } else if(pathname.endsWith('.js')){
      let m = await import(pathname).then(module=>module.default).catch(e=>{
        Logger.error(pathname,e)
        return false
      })
      if(!m){
        Logger.warn(`ignored invalid controller [${pathname}]`)
        return
      }
      const params = []
      //1 route name
      if(m.name){
        params.push(m.name)
      }
      //2 route path 
      let route = relative(RootDir,pathname).replace(/\.js$/i,'').replace(/\/_/g,'\/:')
      route = join('/',route)
      params.push(route)
      //3 middlewares
      if(m.middlewares){
        for (const item of m.middlewares) {
          if(Array.isArray(item)){
              const middleware = await loadMiddleware(key,item[key])
              middleware && params.push(middleware)
          }else{
            const middleware = await loadMiddleware(item)
            middleware && params.push(middleware)
          }
        }
      }
      // 4 fn 实际页面逻辑中间件方法
      if(m.fn){
        params.push(m.fn)
      }
      // 5 add router
      const method = m.method?m.method.toLowerCase():'all'
      router[method](...params)
      // 6 alias copy
      if(m.alias){
        const pathidx = m.name?1:0
        const aliasParams = params.concat()
        aliasParams[pathidx] = join('/',m.alias)
        router[method](...aliasParams)

      }
    }
  }
}
