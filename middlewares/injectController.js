const extKeyName = "_extparams"

/**
 * 注入获取扩展参数方法(ctx.getControllerExtParam)只有进入router中有效,只最后一个匹配的router的参数，
 **/
export default function(){
  return (ctx,next)=>{
    ctx.getRouteExtParam = function(paramName){
      return getRouteExtParam(this,paramName)
    }
    return next()
  }
}

/**
 * 设置某个route实体的扩展参数，routerLayer为stack中的layer
 */
export function setRouteExtParams(routerLayer,extparams){
  routerLayer[extKeyName] = extparams
}
/**
 *  只有进入router中有效,只第一个匹配的router，
 */
function getRouteExtParam(ctx,paramName){
  if(ctx.router && ctx.matched && ctx.matched.length>1){
    // console.log( ctx.matched)
    const routerLayer = ctx.matched.find(layer=>layer.opts.end)
    if(routerLayer&&routerLayer[extKeyName]){
      return routerLayer[extKeyName][paramName]
    }
  }
  return null
}

