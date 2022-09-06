const extKeyName = "_extparams"

/**
 * 注入获取扩展参数方法(ctx.getControllerExtParam)只有进入router中有效,只最后一个匹配的router的参数，
 **/
export default function(){
  return (ctx,next)=>{
    ctx.getControllerExtParam = function(paramName){
      return getControllerExtParam(this,paramName)
    }
    return next()
  }
}

/**
 * 设置某个route实体的扩展参数，routerLayer为stack中的layer
 */
export function setControllerExtParams(routerLayer,extparams){
  routerLayer[extKeyName] = extparams
}
/**
 *  只有进入router中有效,只最后一个匹配的router，
 */
function getControllerExtParam(ctx,paramName){
  if(ctx.router && ctx.matched && ctx.matched.length>1){
    const routerLayer = ctx.matched[ctx.matched.length-1]
    return routerLayer[extKeyName][paramName]
  }
  return null
}

