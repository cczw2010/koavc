#!/usr/bin/env node
"use strict"
import consola from "consola"
import chalk from "chalk"
import {join} from "path"
import {compiler,rootDist} from "vuesfcbuilder"
import {run,initConfig} from "../index.js"
import { createLogger } from "../libs/logger.js"
const Config = await initConfig()
switch (process.argv[2]) {
  case "build":
    if(Config.view.engine=="vue"){
      consola.info(`vue complier with [${chalk.yellow('production')}] mode ⚙`)
      Config.vuesfcbuilder.isDev = false
      compiler(false,Config.vuesfcbuilder)
    }else{
      consola.info('View complier engine is not [vue], ignore vue complier! ')
    } 
    break;
  case "start":
    if(Config.view.engine=="vue"){
      const vuebuilderConfig = await import(join(rootDist,'config.runtime.js'))
                              .then(m=>m.default)
                              .catch(e=>false)
      if(!vuebuilderConfig || vuebuilderConfig.isDev){
        consola.error('Must run [build]  before publish server!')
        process.exit(1)
      }
    }
    run(Config)
    break;
  case "dev":
  case undefined:
    if(Config.view.engine=="vue"){
      consola.info(`vue complier with [${chalk.yellow('development')}] mode ♻️`)
      Config.vuesfcbuilder.isDev = true
      compiler(true,Config.vuesfcbuilder,()=>{
        run(Config)
      })
    }else{
      //TODO 监控各引擎对应的落地页面变化  ,liveload
      run(Config)
    }
    break;
  default:
    consola.error("unkown command")
    break;
}
