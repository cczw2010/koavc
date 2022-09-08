import {run} from "../index.js"
import {startLiveServer} from "../libs/livereload.js"
run((err,server)=>{
  if(err){
    console.log(err)
    process.exit(1)
  }else{
    startLiveServer(server)
  }
})