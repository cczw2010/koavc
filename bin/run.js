import spawn from "cross-spawn"
import chokidar  from "chokidar"
import {getRuntimeConfig} from "../index.js"

let workProcess = null
let scriptPath = null
// ctrl+c
process.on("SIGINT", function(code){
  if(workProcess){
    workProcess.kill()
  }
  process.exit(1);
})


// 启动服务进程，如果存在会自动先干掉
export default function(){
  const scriptFile = process.env.NODE_ENV === 'production'?'../scripts/start.js':'../scripts/dev.js'
  scriptPath = new URL(scriptFile,import.meta.url).pathname
  runWorkProcess()
  if(process.env.NODE_ENV!=='production'){
    watcher()
  }
}
// 启动server 进程
function runWorkProcess(){
  if(workProcess){
    workProcess.kill()
  }
  
  workProcess = spawn(
    'node',
    [scriptPath],
    {
      cwd: process.cwd(),
      detached:true,
      env: process.env,
      stdio: "inherit"
    }
  )
  // console.log("workProcess running.... ",workProcess.pid)
}
// 监控器 用于开发模式，文件变化会重启server进程
async function watcher(){
  const config = await getRuntimeConfig()
  console.log(config)
  // 启动简单的配置文件监控文件变化，然后服务restart
  let watchPaths = ['./koavc.config.js']
  // global middlewares
  config.middlewares.map((v)=>{
    let filepath = getLocalMiddlewarePath(v)
    filepath && watchPaths.push(filepath)
  })
  // apps
  config.app.map(appconfig=>{
    watchPaths.push(appconfig.dir)
    // app  middlewares
    appconfig.middlewares.map((v)=>{
      let filepath = getLocalMiddlewarePath(v)
      filepath && watchPaths.push(filepath)
    })
  })
  // console.log("watchPath",watchPaths)
  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    interval: 1000,
  })
  watcher.on('ready', async() => {
    watcher.on('change', async (filepath, stats) => {
      // console.log("change",filepath)
      runWorkProcess()
    })
    watcher.on('add', async (filepath) => {
      // console.log("add",filepath)
      runWorkProcess()
    })
  })
}
// 判断设置的中间件是否本地中间件，是的话返回路径，不是返回null
function getLocalMiddlewarePath(middleware){
  let filepath = null
  if(Array.isArray(middleware)){
    filepath = middleware[0]
  }else if(typeof middleware == 'string'){
    filepath = middleware
  }
  if(filepath && filepath.startsWith('~')){
    // watchPaths.push(filepath.replace(/^~/,process.env.PWD))
    return filepath.replace(/^~/,'.')
  }
  return null
}