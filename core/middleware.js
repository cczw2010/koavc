/**
 * 加载并初始化所有配置的middleware
 * @export
 * @param {array[string|array|function]} options 
 *            middleware配置数组,['~/middlewares/xxx.js',['koa-body',{...参数}]]
 *            ~开头的代表相对于根目录的自定义组件， 或者可以直接使用安装的第三方中间件， 可传参。
 *            返回默认初始化函数支持原生Promise
 * 
 * @param {Object|null} ctx 可以是koa,app，也可以是router ,设置的话自动use
 * @return Promise
 */
 export async function middlewaresLoader(options,ctx){
  // 加载所有的全局配置中间件
  options = options||[]
  for (const item of options) {
    const middleware = await loadMiddleware(item)
    if(!middleware){
      throw new Error(`ignored invalid middleware [${item}]`)
    }
    ctx.use(middleware)
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

  middlewarePath = middlewarePath.replace(/^~/ig,process.env.PWD)
  const {default:middlewareInit,param} = await import(middlewarePath).then(module=>module)

  // 创建this绑定对象
  let middleware = null
  if(middlewareInit instanceof Promise){
    middleware = await middlewareInit(option)
  }else if(middlewareInit instanceof Function){
    middleware = middlewareInit(option)
  }
  return middleware
}