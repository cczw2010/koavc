/**
 * 路由守卫，处理路有错误
 *
 * @export
 * @param {array} appOptions  app组的配置
 * @param {array} staticPaths  忽略静态路由路径前缀数组
 * @returns
 */
export default function(appOptions,staticPaths,logger){
  return async (ctx,next)=>{
    ctx.isStaticPath = staticPaths.find(p=>ctx.path.startsWith(p))
    if(ctx.isStaticPath){
      return next()
    }
    let code =200
    try{
      await next()
      code = ctx.status
    }catch(e){
      logger.error(e)
      code = e.statusCode||e.status||500
    }
    if(code>=400){
      // 遍历app，获取匹配的error
      appOptions.find((option)=>{
        const prefix = option.prefix??''
        // 设置了errorPage 并且不是errorPage 并且匹配app路由
        if(option.errorPage && !ctx.path.startsWith(option.errorPage) && ctx.path.startsWith(prefix)){
          // console.log('option.prefix:',code,ctx.href,option.errorPage)
          if(option.errorPageCode){
            ctx.redirect(`${option.errorPage}?code=${code}`)
          }else{
            ctx.redirect(option.errorPage)
          }
          return true
        }
        return false
      })
    }
  }
}