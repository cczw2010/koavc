import { resolve} from 'path'
import Koa from "koa"
import staticServe from "koa-static"
import mount from "koa-mount"
import {createLogger} from '../libs/logger.js'
import loadControllers from './controller.js'
import viewer from './view/index.js'
import alias from '../middlewares/alias.js'
import { middlewaresLoader } from './middleware.js'

// 初始化koa应用
export default async function(config){
  const app = new Koa()
  const logger =  createLogger(config.logger)
  app.on('error', (err, ctx) => {
    logger.error( err)
  })
  app.context.Config = config
  app.context.logger =logger
  // 初始化静态服务，放上面,下面的中间件就不会相应静态服务的内容了
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
  // 加载全局中间件
  await middlewaresLoader(config.middlewares,app,logger).catch(e=>{
    logger.error(e)
    process.exit(0)
  })
  // 初始化view
  app.context.view = await viewer(config.view)
  // 初始化controller
  config.router.dir = resolve(config.router.dir)
  const router = await loadControllers(config.router,logger)
  app.use(router.routes())
  app.use(router.allowedMethods(config.router.allowedMethods))
  return app
}



