#!/usr/bin/env node
"use strict"
import consola from "consola"
import compiler from "vuesfcbuilder"
import {run,initConfig} from "../index.js"
const Config = await initConfig()
switch (process.argv[2]) {
  case "build":
    Config.vuesfcbuilder.isDev = false
    compiler(false,Config.vuesfcbuilder)
    break;
  case "start":
    run(Config)
    break;
  case "dev":
  case undefined:
    Config.vuesfcbuilder.isDev = true
    compiler(true,Config.vuesfcbuilder)
    break;
  default:
    consola.error("unkown command")
    break;
}
