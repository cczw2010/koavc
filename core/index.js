import { resolve} from 'path'
import Koa from "koa"
import {createLogger} from '../libs/logger.js'
import controller from './controller.js'
import viewer from './view/index.js'
import middlewareLoader from "./middleware.js"
import alias from '../middlewares/alias.js'
import staticServe from "koa-static"
import mount from "koa-mount"

export async function initialize(Config,isDev){
  const app = new Koa()
  const logger =  createLogger(Config.logger)
  app.on('error', (err, ctx) => {
    logger.error( err)
  })

  app.context.Config = Config
  app.context.logger =logger
  // 初始化静态服务，放上面,下面的中间件就不会相应静态服务的内容了
  if(Config.statics){
    for(const staticInfo of Config.statics){
      app.use(mount(staticInfo[0],staticServe(staticInfo[1])),{defer:true})
    }
  }
  // 增加
  // 加载alias中间件
  if(Config.alias){
    logger.info("load alias")
    app.use(await alias(Config.alias,logger))
  }
  // 动态加载所有的配置middleware
  await middlewareLoader(Config.middlewares,app)
  // 初始化view
  app.context.view = await viewer(Config.view,isDev)
  // 初始化controller
  Config.router.dir = resolve(Config.router.dir)
  const router = await controller(Config.router,logger)
  app.use(router)

  return app
}



