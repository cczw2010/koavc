/**
 * 路由， 遍历加载路由文件
 */
import {relative,join} from "path"
import { readdir,stat } from 'fs/promises'
import Router from 'koa-router'
import {middlewaresLoader} from "./middleware.js"
import {setRouteExtParams} from "../middlewares/injectController.js"
// controller固定的属性
const constants = ['name','alias','middlewares','fn','method']
const defAppMiddlewares = ['../middlewares/injectController.js']
let Logger = null

export default async (options,logger)=>{
  Logger = logger||console
  const router = new Router()
  const defMiddlewares = await middlewaresLoader(defAppMiddlewares)
  router.use(defMiddlewares)
  for (const option of options) {
    const appRouter = await initAppRouter(option)
    router.use(appRouter.routes(),appRouter.allowedMethods(option.allowedMethods))
    // router.use(appRouter.routes())
  }
  return router
}
// 初始化一个应用路由
async function initAppRouter(option){
  const {dir,prefix,host,middlewares} = option
  // // exclusive为false 注入全局route支持
  const router = new Router({host,prefix,exclusive:false})
  Logger.info("loading router global middlewares...")
  const appMiddlewares = await middlewaresLoader(middlewares)
  router.use(appMiddlewares)
  Logger.info("loading router controllers...")  
  await travel(dir,router,dir)
  return router
}


// 遍历加载controller
async function travel(dir,router,appBaseDir) {
  const files =await readdir(dir).catch(e=>{
    Logger.error(e)
    return []
  });
  // 默认按照字母正序，而_开头的泛域名在最前
  // files.reverse()
  for (const k in files) {
    const file = files[k];
    const pathname = join(dir, file)
    const stats = await stat(pathname)
    
    if (stats.isDirectory()) {
      await travel(pathname,router,appBaseDir);
    } else if(pathname.endsWith('.js')){
      let m = await import(pathname).then(module=>module.default).catch(e=>{
        Logger.error(pathname,e)
        // Logger.warn(`Invalid route controller [${pathname}]`)
        return false
      })
      if(!m){
        return false
      }
      const params = []
      //1 route name
      if(m.name){
        params.push(m.name)
      }
      //2 route path & alias
      const paths = []
      // 2.1index.js  简写支持
      if(file.toLowerCase()=='index.js'){
        paths.push(join('/',relative(appBaseDir,dir)))
      }
      // 2.2
      const route = relative(appBaseDir,pathname).replace(/\.js$/i,'').replace(/\/_/g,'\/:')
      paths.push(join('/',route))
      // 2.3 alias
      if(m.alias){
        paths.push(m.alias)
      }
      params.push(paths)
      //3 middlewares
      if(m.middlewares && m.middlewares.length>0){
        const middlewares = await middlewaresLoader(m.middlewares)
        middlewares.map(m=> params.push(m))
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
        setRouteExtParams(result.stack[result.stack.length-1],extparams)
      }
    }
  }
}




