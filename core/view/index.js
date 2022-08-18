import {join} from "path"
import {readFile} from "fs/promises"
import { initWatcher,injectCode } from "../../libs/livereload.js"
export default async (options,isDev)=>{
  options = options||{}
  options.src = options.src||'view'
  const engine = options.engine||'default'

  const renderEngine = (await import(`./${engine}.js`)).default
  // 如果有初始化方法则初始化
  if('init' in renderEngine){
    renderEngine.init(options)
  }

  if(isDev){
    const watches = ('getWatchs' in renderEngine)?renderEngine.getWatchs():options.src
    const onChange = renderEngine.onWatchChange || function(filePath){
      // 使用全路径，防止不统一
      return join(process.env.PWD,filePath)
    }
    initWatcher(watches,{},onChange)
  }

  return async(ctx,next)=>{
    ctx.view = async function(filePath,data){
      data = data||{}
      // 1转换path, 渲染引擎提供转换函数或者使用默认
      if('transferPath' in renderEngine){
        filePath = renderEngine.transferPath(filePath)
      }else{
        // 使用全路径，防止不统一
        filePath =  join(ctx.Config.root,options.src,filePath)
      }
      // console.log(source)
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
      let html = await renderEngine.compiled(sourceData,data,ctx)
      if(html){
        // 开发模式注入livereload
        if(isDev){
          const injectJs = injectCode(filePath)
          if(injectJs){
            html+=injectJs
          }
        }
        ctx.body = html
      }
    }
    return next()
  }
}