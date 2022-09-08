import {run} from "../index.js"
run((err,server)=>{
  if(err){
    console.log(err)
    process.exit(1)
  }
})