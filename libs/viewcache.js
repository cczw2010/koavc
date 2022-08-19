import {stat,readFile} from "fs/promises"
import {resolve} from "path"
import hash from "hash-sum"
import write from "write"

// 页面缓存库
export default class ViewCache{
  /**
   * @param {*} option
   *      {
   *        dir:'.koavc',
   *        ttl:1000*60*60
   *       }
   */
  constructor(option){
    if(!option){
      return null
    }
    this.option = Object.assign({dir:'.koavc', ttl:1000*60*60},option)
  }
  // 设置页面缓存
  async set(pageFullUrl,data){
    const cachePath = this.__getCachePath(pageFullUrl)
    return await write(cachePath,data)
  }
  // 获取页面对应的文件缓存，不存在或者过期返回false
  async get(pageFullUrl){
    const cachePath = this.__getCachePath(pageFullUrl)
    const cacheDT = await stat(cachePath).then(stats=>stats.mtimeMs).catch(e=>false)
    if(cacheDT && cacheDT+this.option.ttl>Date.now()){
      return await readFile(cachePath,{encoding:"utf8"}).catch(e=>false)
    }
    return false
  }
  __getCachePath(pageFullUrl){
    // 可以保证不管全url还是相对url 都能解析一致
    const UUID = hash(new URL(pageFullUrl).href)
    return resolve(this.option.dir,UUID)
  }
}