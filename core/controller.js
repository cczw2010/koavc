/**
 * 路由， 遍历加载路由文件
 */
import {relative,join} from "path"
import { readdir,stat } from 'fs/promises'
import Router from '@koa/router'
import {middlewaresLoader} from "./middleware.js"
import {setRouteExtParams} from "../middlewares/injectController.js"
import deepmerge from "deepmerge"
// controller固定的属性
const constants = ['name','alias','middlewares','fn','method']
// 默认应用配置
export const defAppConfig = {
    dir:"app",
    prefix:'/',
    host:'',
    allowedMethods:{},
    middlewares:['../middlewares/injectController.js']
  }

let Logger = null
export default async (configs,logger)=>{
  Logger = logger||console
  if(configs.length==0){
    configs.push(defAppConfig)
  } 
  const router = new Router()
  for (const config of configs) {
    await initAppRouter(config,router)
  }
  return router.routes()
}
// 初始化一个应用路由
async function initAppRouter(config,baseRouter){
  config = deepmerge(defAppConfig,config)
  const {dir,prefix,host,middlewares,allowedMethods} = config
  // exclusive为false 注入全局route支持 , prefix 后面拆分路由再用
  const router = new Router({host,exclusive:false})
  Logger.info("loading router global middlewares...")
  const appMiddlewares = await middlewaresLoader(middlewares).catch(e=>{
    Logger.error(e)
    process.exit(0)
  })
  router.use(appMiddlewares)
  Logger.info("loading router controllers...")  
  await travel(dir,router,dir)
  baseRouter.use(prefix,router.routes(),router.allowedMethods(allowedMethods))
}

// 遍历加载controller
async function travel(dir,router,appBaseDir) {
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
      const route = relative(appBaseDir,pathname).replace(/\.js$/i,'').replace(/\/_/g,'\/:')
      paths.push(join('/',route))
      // index.js  简写支持
      if(file.toLowerCase()=='index.js'){
        paths.push(join('/',dir))
      }
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




