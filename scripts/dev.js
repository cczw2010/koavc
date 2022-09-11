import {run} from "../index.js"
import {startLiveServer} from "../libs/livereload.js"
import consola from "consola"
run((err,server)=>{
  if(err){
    consola.error(err)
    process.exit(1)
  }else{
    startLiveServer(server)
  }
})