import chokidar  from "chokidar"
import hash from "hash-sum"
import { WebSocketServer } from  'ws'
import consola from "consola"
let wsServer = null
let watcher = null
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
      // consola.debug('client message %s',data);
      const infos = data.toString().split("::")
      if(infos[0]==CLIENTMSGTYPE.connect){
        ws.pageUUID = infos[1]||0
        // consola.debug('client connected', ws.pageUUID );
      }
    })
    // ws.on('close',function(){
    //   consola.debug('client close', ws.pageUUID );
    // })
  })
  return wsServer
}
// 初始化文件监控
export function  initViewWatcher(watchpath,option,onChange){
  option = Object.assign({
    // ignored: /(^|[\/\\])\..$/, // ignore dotfiles
    persistent: true,
    // cwd:'.',
    // alwaysStat: true,
    interval: 1000,   //过早触发可能会文件未写完
    awaitWriteFinish: true
  },option)
  watcher = chokidar.watch([].concat(watchpath),option)
  watcher.on('ready', () => {
    // consola.debug("livereload server start...",watcher.getWatched())
    watcher.on('change', (filepath,fstats)=>{
      let changes = onChange(filepath,fstats)
      if(!changes){return}
      changes = [].concat(changes)
      changes.forEach(reloadPage)
    })
  })
}
// 增加监控文件 或者文件数组
export function addWatchFile(files){
  if(watcher && files){
    watcher.add(files)
  }
}
// 页面注入客户端代码
export function injectCode(pagePath){
  if(!wsServer || !pagePath){
    return false
  }
  const pageUUID = getPageUUid(pagePath)
  // consola.log('inject code',pagePath,pageUUID)
  const address = wsServer.address()
  return `<script type="text/javascript">
  var __livereload_uuid = '${pageUUID}'
  var __webSocket = WebSocket || MozWebSocket;
  var __limitReConnect = 50;
  var __reConnectCount = 0;
  var __connectLock = false;
  var __ws_liveload = null
  var __ws_timer = null
  function __initLiveReload(){
    __connectLock = true
    __ws_liveload = new __webSocket('ws://${address.address}:${address.port}');
    __ws_liveload.onopen=function() {
      // 重连成功，刷新
      if(__reConnectCount>0){
        console.debug("> livereload server actived,restart!")
        window.location.reload()
      }else{
        console.debug("> livereload actived!")
        __ws_liveload.send('${CLIENTMSGTYPE.connect}::'+__livereload_uuid);
      }
    };
    __ws_liveload.onmessage=function(event) {
      console.debug('received: %s', event.data);
      if(event.data == '${CLIENTMSGTYPE.reload}'){
        window.location.reload()
      }
    };
    __ws_liveload.onclose=__ws_liveload.onerror=function(event) {
      __connectLock = false
      clearTimeout(__ws_timer)
      __ws_timer = setTimeout(function(){
        if(__connectLock || __limitReConnect<__reConnectCount){return}
        __reConnectCount++
        __initLiveReload()
      },3000)
    }
  }
  if(!__webSocket){
    console.error("livereload not actived (websocket not supoorted)")
  }else{
    __initLiveReload()
  }
  </script>`
}
// 热重载某个页面
export function reloadPage(pagePath){
  if(!wsServer) return
  const pageUUID = getPageUUid(pagePath)
  consola.debug("reloadPage：",pagePath,pageUUID)
  wsServer.clients.forEach(function(client) {
    if (client.readyState === 1 && client.pageUUID==pageUUID) { //WebSocket.OPEN
      // consola.debug("client reload：",pagePath,client.pageUUID)
      client.send(CLIENTMSGTYPE.reload);
    }
  });
}


function getPageUUid(pagePath){
  return hash(pagePath)
}

