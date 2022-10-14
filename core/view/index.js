import {join,resolve} from "path"
import {readFile} from "fs/promises"
import { initViewWatcher,injectCode } from "../../libs/livereload.js"
import ViewCache from '../../libs/viewcache.js'

export default async (options)=>{
  options = options||{}
  options.src = options.src||'view'
  const engine = options.engine||'default'
  const isDev = process.env.KOAVC_ENV !== 'production'
  const renderEngine = (await import(`./${engine}.js`)).default
  // 如果有初始化方法则初始化
  if('init' in renderEngine){
    renderEngine.init(options)
  }

  let viewCache = null
  if(!isDev && options.cache){
    // 页面缓存静态服务器,非开发模式下生效
    viewCache = new ViewCache(options.cache)
  }else{
    const watches = ('getWatchs' in renderEngine)?renderEngine.getWatchs():options.src
    const onChange = renderEngine.onWatchChange || function(filePath){
      // 使用全路径，防止不统一
      return join(process.env.PWD,filePath)
    }
    initViewWatcher(watches,{},onChange)
  }
  //  view方法
  return async function(filePath,data){
    const ctx = this
    data = data||{}

    let html = null
    // 0 先获取缓存
    if(viewCache){
      html = await viewCache.get(ctx.href)
      if(html){
        ctx.body = html
        return html
      }
    }
    // 1转换path, 渲染引擎提供转换函数或者使用默认
    if('transferPath' in renderEngine){
      filePath = renderEngine.transferPath(filePath)
    }else{
      // 使用全路径，防止不统一
      filePath =  resolve(options.src,filePath)
    }
    // 2 获取代码，渲染引擎提供自己设定的获取函数将覆盖默认获取源码字符串的方法
    let sourceData = null
    if('getSource' in renderEngine){
      sourceData = await renderEngine.getSource(filePath,ctx)
    }else{
      const buffer = await readFile(filePath).catch(e=>{
        ctx.logger.error(e)
        return false
      })
      sourceData = buffer?buffer.toString():''
    }
    // 3 编译
    html = await renderEngine.compiled(sourceData,data,ctx)
    if(html){
      if(isDev){
        // 开发模式注入livereload
        const injectJs = injectCode(filePath)
        if(injectJs){
          html+=injectJs
        }
      }
       // 4 存缓存
      if(viewCache){
        viewCache.set(ctx.href,html)
      }
      ctx.body = html
    }
    return html
  }
}