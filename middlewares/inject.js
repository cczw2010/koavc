// 注入controller中的默认中间件，用于处理 用户中间件自定义controller属性
const globalsParams = {}

export default function(params){
  return (ctx,next)=>{
    ctx.injectParams =params
    return next()
  }
}


// 设置自定义中间件 的 自定义参数
export function setParam(middlewareName,params){
  
}