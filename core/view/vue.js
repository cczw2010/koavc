// 模板文件请使用单文件模式
// 注意，该模式应该区分服务器端渲染，可服务器端注入（只预注入数据和处理中间件，而不进行直接vue渲染），暂时定位为后
import {readFileSync} from "fs"
import  {renderer,versPath,getRenderInfo} from "vuesfc"
import {  updatedDiff } from 'deep-object-diff'
// console.log(clientManifest)
// const LRU = require('lru-cache')
let clientManifest = null
// url中带有该key则返回 pageRenderInfo json数据
export const vuepPageRenderInfoKey = '_page_json'
// 模板方法
export default {
  name:"vue",
  // 根据传入的引擎配置初始化
  init(option){
    clientManifest = JSON.parse(readFileSync(versPath,{encoding:"utf8"}))
  },
  // 防止使用默认配置
  transferPath(path){
    return path
  },
  // 自定义获取源码,builder自动处理了，不需要处理
  async getSource(path,ctx){
   return path
  },
  // 渲染
  async compiled(path,data,ctx){
    // 如果参数中带着_pagejson,返回pagrenderinfo 的json数据
    if(vuepPageRenderInfoKey in  ctx.query){
      return await getRenderInfo(path,data,ctx)
    }else{
      return await renderer(path,data,ctx)
    }
    // ctx.body = html
  },
  // ====================== for dev liveload
  // 获取监控的实际目录或者文件， 不提供默认为config中配置的目录
  getWatchs(){
    return versPath
  },
  // 监控文件发生变化时的回调方法，返回需要reload的目标页面， 不提供默认为变化的文件本身
  onWatchChange(filePath){
    try{
      const newManifest = JSON.parse(readFileSync(versPath,{encoding:"utf8"}))
      if(!clientManifest){
        clientManifest = newManifest
        return false
      }
      const diffs = updatedDiff(clientManifest,newManifest)
      clientManifest = newManifest
      const diffpages = []
      if(diffs && diffs.page)
      for (const page in diffs.page) {
        diffpages.push(page)
      }
      for (const layoutKey in diffs.layout) {
        const layoutName = layoutKey.split('.')[0]
        for (const pageName in newManifest.page) {
          if(newManifest.page[pageName].layout == layoutName){
            diffpages.push(pageName)
          }
        }
      }
      // console.debug(">>>>>>>>>>>>>>>>",diffs,diffpages)
      return diffpages
    }catch(e){
      throw new Error('version manifest file get error')
    }
  },
}
