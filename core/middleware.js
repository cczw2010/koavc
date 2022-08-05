// 中间件加载

const projectRoot = process.env.PWD
/**
 * 加载并初始化所有配置的middleware
 * @export
 * @param {array} options middleware配置数组,['~/middlewares/xxx.js',['koa-body',{...参数}]]
 *                        ~开头的代表相对于根目录的自定义组件， 或者可以直接使用安装的第三方中间件， 可传参。
 *                        返回默认初始化函数支持原生Promise
 */
export default async function(options,app){
  options = options||[]
  let cnt = 0
  app.context.logger.info("loading user middlewares...")
  for (const key in options) {
    const item = options[key]
    let middlewarePath= item
    let moption = null
    if(Array.isArray(item)){
      middlewarePath = item[0]
      moption = item[1]||null
    }
    const middleware = await loadMiddleware(middlewarePath,moption).catch(e=>{
      app.context.logger.error(middlewarePath,e)
      return false
    })
    if(!middleware){
      app.context.logger.warn(`ignored invalid middleware [${middlewarePath}]`)
    }else{
      app.use(middleware)
      cnt++
    }
  }
}

/**
 * 加载koa的middlleware ，支持返回初始化函数为原生Promise
 * @param {string} middlewarePath   ~开头的代表相对于项目根目录的自定义组件， 或者可以直接使用安装的第三方中间件
 * @param {any} option    middleware的初始化传参                       
 * 
 *  */ 
export async function loadMiddleware(middlewarePath,option){
  if(typeof middlewarePath == "function"){
    return middlewarePath
  }
  middlewarePath = middlewarePath.replace(/^~/ig,projectRoot)
  const middleware = await import(middlewarePath).then(module=>module.default)
  if(middleware instanceof Promise){
    return await middleware(option)
  }else if(middleware instanceof Function){
    return middleware(option)
  }else{
    return false
  }
}
