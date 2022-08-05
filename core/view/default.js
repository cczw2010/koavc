// 默认 render, 不适用任何引擎，单纯的返回源码
export default {
  name:"default",
  // 根据传入的引擎配置初始化
  // init(config){
    // nothing
  // },
  /**
   * 转换path,可以不提供，默认根据配置获取地址
   * @param {string} path 传入文件的view
   * @return string 新地址
   */
  // transferPath(path)
  /**
   * 处理view模板文件的源码，可以不提供，默认根据目录获取
   * @param {string} path 传入文件的view
   * @return any  返回处理过的对象，提供给render使用
   */
  // async getSource(path,ctx){
  //   return any
  // },
  /**
   * 渲染时调用   必须
   * @param {any} dst       源码对象
   * @param {object} data   外部数据用于模板
   * @return html 返回渲染后的html
   */
   async compiled(dst,data){
    return dst||'empty page'
  }
}