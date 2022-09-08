import {rollup} from "rollup"
import resolve from '@rollup/plugin-node-resolve'   // // 告诉 Rollup 如何查找外部模块
import commonjs from '@rollup/plugin-commonjs'     // 将Commonjs语法的包转为ES6可用
import json from '@rollup/plugin-json'  // 转换json为 es6
import progress from 'rollup-plugin-progress'

const input = new URL("./start.js",import.meta.url).pathname
const output = new URL("./start.js",import.meta.url).pathname
const optionInput = {
  input,
  plugins:[
    resolve({
      preferBuiltins: true,
      mainFields: ["module",'jsnext:main', 'main'],
      // browser: true,
      // modulesOnly:true,
      resolveOnly:module=>{
        console.log(module)
        return module.startsWith('.')||module.startsWith('/')
      }
    }) ,
    commonjs(),
    progress({
      clearLine: true // default: true
    }),
    json(),
  ]
}

export default async function(){
  const bundled = await rollup(optionInput)
  bundled.write({
    dir:'dist'
  })
}