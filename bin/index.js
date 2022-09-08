#!/usr/bin/env node
"use strict"
import consola from "consola"
import chalk from "chalk"
import {join} from "path"
import {compiler,rootDist} from "vuesfcbuilder"
import runServer from "./run.js"
import { getRuntimeConfig } from "../index.js"
// import build from "../scripts/build.js"

const Config = await getRuntimeConfig()
switch (process.argv[2]) {
  case "build":
    if(Config.view.engine=="vue"){
      consola.log(sysColor('vue builder start...'))
      Config.vuesfcbuilder.isDev = false
      compiler(false,Config.vuesfcbuilder)
    }else{
      consola.warn('View complier engine is not [vue], ignore vue complier! ')
    } 
    // build()
    break;
  case "start":
    process.env.NODE_ENV = 'production'
    consola.log(`> koavc run with [${chalk.yellow('production')}] mode`)
    if(Config.view.engine=="vue"){
      const vuebuilderConfig = await import(join(rootDist,'config.runtime.js'))
                              .then(m=>m.default)
                              .catch(e=>false)
      if(!vuebuilderConfig || vuebuilderConfig.isDev){
        consola.error('Must run [build] first in the [vue] mode!')
        process.exit(1)
      }
    }
    consola.log(sysColor('Initilize server...'))
    runServer()
    break;
  case "dev":
  case undefined:
    process.env.NODE_ENV = 'development'
    consola.log(`> koavc run with [${chalk.yellow('development')}] mode ♻️`)
    if(Config.view.engine=="vue"){
      consola.log(sysColor('vue builder start...'))
      Config.vuesfcbuilder.isDev = true
      compiler(true,Config.vuesfcbuilder,()=>{
        consola.log(sysColor('Initilize server...'))
        runServer()
      })
    }else{
      consola.log(sysColor('Initilize server...'))
      runServer()
    }
    break;
  default:
    consola.error("unkown command")
    break;
}

function sysColor(msg){
  return chalk.green('☕️ '+msg)
}

