import chokidar  from "chokidar"
import {run} from "../index.js"
import child_process from "child_process"
import {startLiveServer} from "../libs/livereload.js"
export default async function(config){
  // 启动简单的监控文件变化，然后服务restart
  let watchPaths = ['./koavc.config.js',config.router.dir]
  // global middlewares && router globalwares
  config.middlewares.concat(config.router.middlewares).map((v)=>{
    let filepath = null
    if(Array.isArray(v)){
      filepath = v[0]
    }else if(typeof v == 'string'){
      filepath = v
    }
    if(filepath && filepath.startsWith('~')){
      // watchPaths.push(filepath.replace(/^~/,process.env.PWD))
      watchPaths.push(filepath.replace(/^~/,'.'))
    }
  })
  // console.log("watchPath",watchPaths)
  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    interval: 1000,
  })
  watcher.on('ready', async() => {
    initServer(config)
    watcher.on('change', async (filepath, stats) => {
      console.log("change",filepath)
      restartServer()
    })
    watcher.on('add', async (filepath) => {
      console.log("add",filepath)
      restartServer()
    })
  })
}

function initServer(config){
  run(config,true,function(err,server){
    if(!err){
      startLiveServer(server)
    }else{
      throw err
    }
  })
}
let child = null
let isRestart = false
function restartServer(){
  isRestart = true
  process.on("beforeExit", function(code){
    console.log("beforeExit",code)
  })
  process.on("disconnect", function(code){
    console.log("disconnect",code)
  })
  process.on("exit", function(code){
    if(child){
      child.exit(1)
    }
    console.log('process._isAppRestart:',isRestart)
    if(isRestart){
      isRestart = false
      //  Resolve the `child_process` module, and `spawn` a new process.
      //  The `child_process` module lets us access OS functionalities by running any bash command.`.
      child = child_process.spawn(
          process.argv.shift(),
          process.argv,
          {
            cwd: process.cwd(),
            detached: false,
            stdio: "inherit"
          }
        )
      }
  })
  process.exit(1);
}