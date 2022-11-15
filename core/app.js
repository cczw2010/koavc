import Koa from "koa"
import staticServe from "koa-static"
import mount from "koa-mount"
import { rootDist } from "vsfc"
import {createLogger} from '../libs/logger.js'
import loadControllers from './controller.js'
import viewer from './view/index.js'
import routeGuard from "../middlewares/routeGuard.js"
import alias from '../middlewares/alias.js'
import { middlewaresLoader } from './middleware.js'

// 初始化koa应用
export default async function(config){
  const app = new Koa()
  const logger =  createLogger(config.logger)
  app.on('error', (err, ctx) => {
    logger.error(err)
  })

  app.context.Config = config
  app.context.logger =logger
  // 初始化静态服务，(vue & 自定义)放上面,下面的中间件就不会响应静态服务的内容了
  if(config.view.engine=='vue' && typeof config.vueInjectPath=='string'){
    app.use(mount(config.vueInjectPath,staticServe(rootDist)),{defer:true})
  }
  if(config.statics){
    for(const staticInfo of config.statics){
      app.use(mount(staticInfo[0],staticServe(staticInfo[1])),{defer:true})
    }
  }
  // 加载alias中间件
  if(config.alias){
    // logger.debug("load alias...")
    app.use(await alias(config.alias,logger))
  }
  // 加载全局中间件,失败将退出应用
  await middlewaresLoader(config.middlewares,app,logger).catch(e=>{
    logger.error(e)
    process.exit(1)
  })
  // 初始化view
  app.context.view = await viewer(config.view)
  // 全局路由守护，不在app的router中单独设置是因为，app中可能设置了各种自定义分middlerware,会冲突，比如auth
  app.use(routeGuard(config.app,logger))
  // 初始化多应用
  const router = await loadControllers(config.app,logger)
  app.use(router.routes(),router.allowedMethods())
  return app
}



