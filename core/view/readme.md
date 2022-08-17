view渲染模块,为koa上下文context提供模板加载功能

## 配置
  server的`config.js`中配置 `server.view`

  {
    src,        //view模板文件根目录，默认 view
    engine      //模板渲染引擎，默认dafault
  }

## 使用

  在controller路由文件中渲染模板，并将结果输出到ctx.body

    /**
     *@param {string} path 模板文件相对于模板根目录的相对路径
     *@param {object} data 渲染模板时的数据
     */
    ctx.view(path,data)

每个渲染模块需要提供： `before,compiled` 三个方法，可参考默认的default

## 模板引擎

模板引擎用于渲染模板使用，可自行扩展，参考`default`、`lodash`、`vue`
### default

  无渲染，直接读取返回html


### lodash

  使用lodash.template, 极简风:  <% [js code] %> ,<%=[js variables]%>

### vue

  基于vue2的ssr单文件（SFC）渲染引擎，支持布局文件和页面文件以及组件,模板文件使用单文件模式，[参考](https://www.w3cschool.cn/vuessr/) 已封装成库  参考 `vuesfcbuilder`库

  