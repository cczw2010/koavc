import spawn from "cross-spawn"
import chokidar  from "chokidar"
import { resolve } from "path"
import consola from "consola"
import { fileURLToPath, pathToFileURL } from "url"

let workProcess = null
let scriptPath = null
// ctrl+c
process.on("SIGINT", function(code){
  process.exit(1);
})
// 主进程退出，子进程也退出
process.on("exit", function(code,signal){
  // consola.info("Server exit.")
  if(workProcess){
    workProcess.kill()
  }
})

// 启动服务. 开发模式下会启动新的进程启动,便于管理重启进程
export default function(config,isDev){
  const scriptFile = !isDev?'../scripts/start.js':'../scripts/dev.js'
  // 非开发模式，直接当前进程启动。 
  if(!isDev){
    import (new URL(scriptFile,import.meta.url))
    return
  }
  // scriptPath = scriptFile
  // scriptPath = new URL(scriptFile,import.meta.url).href
  // scriptPath = new URL(scriptFile,import.meta.url).pathname
  scriptPath = fileURLToPath(new URL(scriptFile,import.meta.url))
  // scriptPath = fileURLToPath(new URL('./test.js',import.meta.url))
  runWorkProcess()
  if(isDev){
    watcher(config)
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
      detached:false,
      // shell:(process.platform=="win32"),
      env: process.env,
      stdio: "inherit"
    }
  )
  // consola.info(">>>>>>>>>>",workProcess.pid,workProcess.stdin,workProcess.stdio)
  workProcess.on("error",(e)=>{
    consola.error("Server error",e)
  })
  workProcess.on("exit",(code,signal)=>{
    // code非0 代表子进程非正常退出，主进程一起退出 
    if(code>0){
      process.exit(1)
    }
    consola.info("Server restarting...")
  })
  // consola.log("workProcess running.... ",workProcess.pid)
}
// 监控器 用于开发模式，文件变化会重启server进程
async function watcher(config){
  // 启动简单的配置文件监控文件变化，然后服务restart
  let watchPaths = ['./koavc.config.js'].concat(config.watchs)
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
    cwd:process.env.PWD,
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    interval: 1200,
  })
  watcher.on('ready', async() => {
    // console.log(watchPaths)
    watcher.on('change', (filepath, stats) => {
      // console.log("change",filepath)
      runWorkProcessWithCheck(filepath)
    })
    watcher.on('add', (filepath) => {
      // console.log("add",filepath)
      runWorkProcessWithCheck(filepath)
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

// 检查文件正确性 然后再加载
async function runWorkProcessWithCheck(filepath){
  // 增加参数，避免import模块缓存
  await import(pathToFileURL(filepath).href+`?${Date.now()}`).then(m=>{
    runWorkProcess()
  }).catch(e=>{
    consola.error(filepath,e)
    return false
  })
 
}