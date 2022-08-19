/**
 * 别名中间件，可用于seo，支持本地化
 **/ 
import consola from "consola"
import {join} from "path"
// 缓存alias
const maps = {}
// 检查配置方法是否可用
function checkFun(fun,logger){
  if(fun){
    if(Object.prototype.toString.call(fun)=="[object AsyncFunction]"){
      return fun
    }
    console.log(fun)
    logger.error(`alias option: [${fun.name}] must be a AsyncFunction`)
    process.exit(0)
  }
  return false
}
// 获取映射值
function getAlias(path){
  return maps[path]||false
}
/**
 * url alias 
 * @param {*} option
 *              {
 *                get:async function                       //AsyncFunction方法，本地化获取alias列表对象的方法，不提供的话为空, {aliasPath:directTo}
 *                set:async function(aliasPath,directTo)   //AsyncFunction方法，本地化保存alias的方法，不提供的存在缓存
 *                del:async function(aliasPath)            //AsyncFunction方法，本地化删除alias的方法，不提供的存在缓存
 *              }
 */
export default async function(option,logger){
  option = option||{}
  logger = logger||consola
  // 初始化本地化方法
  const setter = checkFun(option.set,logger)
  const delter = checkFun(option.del,logger)
  const getter = checkFun(option.get,logger)
  const _maps = getter?await getter():{}
  Object.assign(maps,_maps)

  const Alias = {
    async set(aliasPath,directTo){
      if(!aliasPath || !directTo){
        return false
      }
      aliasPath = join("/",aliasPath)
      directTo = join("/",directTo)
      maps[aliasPath] = directTo
      if(setter){
        return await setter(aliasPath,directTo)
      }
      return true
    },
    async del(aliasPath){
      delete maps[aliasPath]
      if(delter){
        return await delter(aliasPath,directTo)
      }
      return true
    },
    list(){
      return maps
    }
  }

  // 返回中间件方法
  return async (ctx,next)=>{
    const originPath = ctx.path
    const redirecTo = getAlias(originPath)
    if(redirecTo){
      ctx.path = redirecTo
      await next()
      ctx.path = originPath
    }
    // no redirect, 注入方法
    ctx.alias = Alias
    return next()
  }
}