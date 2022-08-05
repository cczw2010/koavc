import { join} from 'path'
import Koa from "koa"
import {createLogger} from '../libs/logger.js'
import controller from './controller.js'
import view from './view/index.js'
import middlewareLoader from "./middleware.js"
import alias from '../middlewares/alias.js'
// const serverRoot = dirname(dirname(fileURLToPath(import.meta.url)))

export async function initialize(Config){
  const app = new Koa()
  const logger =  createLogger(Config.logger)
  app.on('error', (err, ctx) => {
    logger.error( err)
  })
  app.context.Config = Config
  app.context.logger =logger
  // 加载alias中间件
  app.use(await alias(Config.alias,logger))
  // 动态加载所有的配置middleware
  await middlewareLoader(Config.middlewares,app)

  // 初始化model
  // app.use(model(join(app.context.Config.root,'model')))
  // 初始化view
  const viewer = await view(Config.view)
  app.use(viewer)
  // 初始化controller
  Config.router.dir = join(Config.root,Config.router.dir)
  const router = await controller(Config.router,logger)
  app.use(router)

  // 初始化静态服务
  // if(Config.static){
  //   const statics = Config.static
  //   for(const routName in statics){
  //     app.use(mount(routName,staticServe(statics[routName])))
  //   }
  // }

  return app
}



