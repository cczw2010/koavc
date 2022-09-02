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
  app.context.logger.info("loading global middlewares...")
  for (const item of options) {
    const middleware = await loadMiddleware(item).catch(e=>{
      app.context.logger.error(item,e)
      return false
    })
    if(!middleware){
      app.context.logger.warn(`ignored invalid middleware [${item}]`)
    }else{
      app.use(middleware)
      cnt++
    }
  }
}

/**
 * 加载koa的middlleware ，支持返回初始化函数为原生Promise
 * @param {function|string|array} middlewareOption  
 *   function 直接传入中间件方法
 *   string 传入中间件路径(middlewarePath) ，~开头的代表相对于项目根目录的自定义组件
 *   array 如果自定义的中间件需要传入参数，以数组方式传入 [middlewarePath,option]
 * 
 *  */ 
export async function loadMiddleware(middlewareOption){
  if(typeof middlewareOption == "function"){
    return middlewareOption
  }
  let middlewarePath = middlewareOption
  let option = null
  if(Array.isArray(middlewareOption)){
    middlewarePath = middlewareOption[0]
    option = middlewareOption[1]
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
