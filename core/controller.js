/**
 * 路由， 遍历加载路由文件
 */
import {relative,join} from "path"
import { readdir,stat } from 'fs/promises'
import Router from '@koa/router'
import {loadMiddleware,middlewaresLoader} from "./middleware.js"
import {setControllerExtParams} from "../middlewares/injectController.js"
// controller固定的属性
const constants = ['name','alias','middlewares','fn','method']

let RootDir = null
let Logger = null
export default async (config,logger)=>{
  RootDir = config.dir,
  Logger = logger||console
  const router = new Router(config.option)
  // exclusive为false 注入全局route支持
  if(!config.option.exclusive){
    Logger.info("loading router global middlewares...")
    const middlewares = await middlewaresLoader(config.middlewares).catch(e=>{
      Logger.error(e)
      process.exit(0)
    })
    router.use(middlewares)
  }else{
    Logger.warn("router global middlewares support is closed.")
  }
  Logger.info("loading router controllers...")  
  await travel(RootDir,router)
  return router
}

// 遍历加载controller
async function travel(dir,router) {
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
      await travel(pathname,router);
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
      //2 route path & alias
      const paths = []
      const route = relative(RootDir,pathname).replace(/\.js$/i,'').replace(/\/_/g,'\/:')
      paths.push(join('/',route))
      if(m.alias){
        paths.push(m.alias)
      }
      params.push(paths)
      //3 middlewares
      if(m.middlewares){
        for (const item of m.middlewares) {
          const middleware = await loadMiddleware(item)
          middleware && params.push(middleware)
        }
      }
      // 4 fn 实际页面逻辑中间件方法
      if(m.fn){
        params.push(m.fn)
      }
      // 5 add router
      const method = m.method?m.method.toLowerCase():'all'
      const result = router[method](...params)
      // 6 ext params  v1.3.3
      if(!result.opts.exclusive){
        const extparams = {}
        for (const key in m) {
          if(!constants.includes(key)){
            extparams[key] = m[key]
          }
        }
        setControllerExtParams(result.stack[result.stack.length-1],extparams)
      }
    }
  }
}




