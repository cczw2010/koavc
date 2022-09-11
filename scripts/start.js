import {run} from "../index.js"
import consola from "consola"
run((err,server)=>{
  if(err){
    consola.error(err)
    process.exit(1)
  }
})