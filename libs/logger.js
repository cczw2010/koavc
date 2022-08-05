import consola from "consola"
import write from "write"
import dayjs from "dayjs"
import {join} from "path"
import deepmerge from "deepmerge"
class FileReporter extends consola.BasicReporter{
  constructor (options) {
    super(options)
  }
  getLogFile(){
    const folder = dayjs().format("YYYY-MM")
    const fileName= dayjs().format("YYYYMMDD")
    return join(this.options.dir,folder,fileName)
  }
  log (logObj) {
    const msg = this.formatLogObj(logObj)
    const datestr = this.formatDate(logObj.date)
    const logFile = this.getLogFile()
    write(logFile,`${datestr}\t ${msg} \n`,{flags:"a+"},(e)=>{
      if(e){
        consola.warn("logger write error!",e);
      }
    })
  }
}
// 默认参数
const DEFAULTOPTIONS = {
  tag:"koavc",   // tag标签
  level:4,          // consola的level
  console:true,     // 开启不开启
  file:{            // false  不开启
    dateFormat:'HH:mm:ss',   //时间戳格式
    dir:'logs',     // 日志目录
  }
}

let logger = null
/**
 * 创建logger
 *
 * @export consola实例
 * @param {*} options  参考 DEFAULTOPOTIIONS
 */
export function createLogger(options){
  options = deepmerge(DEFAULTOPTIONS,options||{})
  logger = consola.create({
    level:options.level,
    reporters:[],
    defaults:{
      tag:options.tag
    }
  })
  if(options.console){
    logger.addReporter(new consola.FancyReporter())
  }
  if(options.file){
    logger.addReporter(new FileReporter(options.file))
  }
  return logger
}

// 返回上一个创建的logger
export function getLastLogger(){
  return logger
}


// const logger = createLogger()
// logger.info("this is info")
// logger.error( new Error("this is a eeeoe"))
