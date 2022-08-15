import chokidar  from "chokidar"
import deepmerge from "deepmerge"
import WebSocket, { WebSocketServer } from 'ws'

const defOptions = {
  watchs:[],
  port:30211
}
// 启动liveServer 
export function startLiveServer(options,logger){
  options = deepmerge(defOptions,options||{})
  initWatcher(options.watchs)
  initWebSockerServer(options.port)
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
function initWebSockerServer(port){
  const wss = new WebSocketServer({port})
  wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
      console.log('web socket received: %s', data);
    });
  
    ws.send('hello wss');
  });
  return wss
}