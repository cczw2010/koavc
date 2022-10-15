/**
 * 路由守卫，处理路有错误
 *
 * @export
 * @param {*} appOptions  app组的配置
 * @returns
 */
export default function(appOptions){
  return async (ctx,next)=>{
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
          ctx.redirect(`${option.errorPage}/${code}`)
          return true
        }
        return false
      })
    }
  }
}