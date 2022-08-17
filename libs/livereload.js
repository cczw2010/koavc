import chokidar  from "chokidar"
import {join} from "path"
import { WebSocketServer } from  'ws'

let wsServer = null
const pageMaps = {}
// 消息类型
const CLIENTMSGTYPE = {
  connect:'conncted',
  reload:'livereload',
}
// 启动liveServer 
export function startLiveServer(server){
  wsServer = new WebSocketServer({server})
  wsServer.on('connection', function(ws,request) {
    ws.on('message', function(data) {
      console.debug('client message %s',data);
      const infos = data.toString().split(":")
      if(infos[0]==CLIENTMSGTYPE.connect){
        ws.pageUUID = infos[1]||0
        console.debug('client connected', ws.pageUUID );
      }
    })
    ws.on('close',function(){
      console.debug('client close', ws.pageUUID );
    })
  })
}
// 页面注入客户端代码
export function injectCode(pageUUID){
  if(!wsServer || !pageUUID){
    return  false
  }
  const address = wsServer.address()
  return `<script>
  var __livereload_uuid = ${pageUUID}
  var webSocket = WebSocket || MozWebSocket;
  if(!webSocket){
    console.log("> livereload not actived (websocket not supoorted)")
  }else{
    var ws = new WebSocket('ws://${address.address}:${address.port}');
    ws.onopen=function() {
      console.log("> livereload actived!")
      ws.send('${CLIENTMSGTYPE.connect}:'+__livereload_uuid);
    };
    ws.onmessage=function(event) {
      console.log('received: %s', event.data);
      if(event.data == '${CLIENTMSGTYPE.reload}'){
        window.location.reload()
      }
    };
  }
  </script>`
}
// 热重载某个页面
export function reloadPage(pageUUID){
  if(!wsServer) return
  wsServer.clients.forEach(function(client) {
    if (client.readyState === 1 && client.pageUUID==pageUUID) { //WebSocket.OPEN
      console.log("client.pageUUID",client.pageUUID)
      client.send(CLIENTMSGTYPE.reload);
    }
  });
}
// 新增liveload页面及相对应的触发文件组
export function addPageMap(pageUUID,watches){
  if(!pageUUID || files){
    return false
  }
  pageMaps[pageUUID] = [].concat(watches)
}
// 初始化文件监控
export function  initWatcher(watchs,option,onChange){
  option = Object.assign({
    // ignored: /(^|[\/\\])\..$/, // ignore dotfiles
    persistent: true,
    // alwaysStat: true,
    interval: 200,
  },option)
  onChange = onChange||onChangeDef
  const watcher = chokidar.watch([].concat(watchs),option)
  watcher.on('ready', () => {
    console.log("livereload server start...",watcher.getWatched())
    watcher.on('change', onChange)
  })
}


function onChangeDef(filePath){
  console.log('default changer.....',filePath)
}