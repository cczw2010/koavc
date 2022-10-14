#!/usr/bin/env node
"use strict"
import consola from "consola"
import chalk from "chalk"
import {compiler,getRuntimeConfig as getVueSfcConfig} from "vuesfc"
import runServer from "./run.js"
import { getConfig } from "../index.js"
// import build from "../scripts/build.js"

const Config = await getConfig()
switch (process.argv[2]) {
  case "build":
    if(Config.view.engine=="vue"){
      consola.log(sysColor('vue builder start...'))
      compiler(null,false)
    }else{
      consola.warn('View complier engine is not [vue], ignore vue complier! ')
    } 
    // build()
    break;
  case "start":
    consola.log(`> koavc run with [${chalk.yellow('production')}] mode`)
    if(Config.view.engine=="vue"){
      const vuesfcConfig = await getVueSfcConfig()
      if(!vuesfcConfig || vuesfcConfig.isDev){
        consola.error('Must run [build] first in the [vue] mode!')
        process.exit(1)
      }
    }
    consola.log(sysColor('Initilize server...'))
    runServer(Config)
    break;
  case "dev":
  case undefined:
    consola.log(`> koavc run with [${chalk.yellow('development')}] mode ♻️`)
    if(Config.view.engine=="vue"){
      consola.log(sysColor('vue builder start...'))
      compiler(()=>{
        consola.log(sysColor('Initilize server...'))
        runServer(Config,true)
      },true)
    }else{
      consola.log(sysColor('Initilize server...'))
      runServer(Config,true)
    }
    break;
  default:
    consola.error("unkown command")
    break;
}

function sysColor(msg){
  return chalk.green('☕️ '+msg)
}

