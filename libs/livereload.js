import chokidar  from "chokidar"
import deepmerge from "deepmerge"
import { WebSocketServer } from 'ws'

const defOption = {
  host:'127.0.0.1',
  port:30211
}
let Option = null
// 启动liveServer 
export function startLiveServer(option,server){
  Option = deepmerge(defOption,option||{})
  initWebSockerServer(server)
  // initWatcher(Option.watchs)
}
// 注入客户端代码
export function injectCode(){
  return `<script>var ws = new WebSocket('ws://${Option.host}:${Option.port}')</script>`
}

// 初始化文件监控
function  initWatcher(watchs){
  const watcher = chokidar.watch(watchs, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    interval: 200,
  })
  watcher.on('ready', async() => {
    logger.start("livereload server start...")
    watcher.on('add', async filepath =>{
      console.log('add.....',filepath)
    })
    watcher.on('change', async(filepath, stats) => {
     console.log('changer.....',filepath)
    })
  })
}
// 初始化websocket服务
function initWebSockerServer(server){
  const ws = new WebSocketServer({server})
  ws.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
      console.log('web socket received: %s', data);
    });
  
    ws.send('hello wss');
  });
  return ws
}