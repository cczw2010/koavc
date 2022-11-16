**!!! V2版本与v1版本不兼容，请使用最新版本**

### 安装依赖库
```
pnpm i koavc
#
npm install koavc --save
```
### 初始化服务器配置

通过配置 `koavc.config.js` 来配置服务器相关配置,具体查看配置文件。


### 运行服务

提供了基本的命令，建议写入项目的script中直接调用

```
#编译vue文件
npx koavc build

#生产模式启动服务,如果是vue模式，必须先执行build命令
npx koavc start

# 开发模式,暂不支持hmr，支持livereload
npx koavc dev
```

### 应用（路由组 | controller组）

`v2.0.0`开始变更为多应用模式，应用由设定的目录下的一组路由文件组成，内部基于[`koa-router`](https://github.com/ZijianHe/koa-router)中间件实现。 多应用模式适合对不同的应用类型使用不同的公用路由中间件，请注意尽量不要进行应用嵌套。

#### > 应用配置

可在`koavc.config.js`中修改。你最少应该配置一个应用，配置如下：

```
...
app:[
  {
    // * 应用根目录，注意多应用不要嵌套，防止出现不可预计的错误
    dir:"./app",
    // 应用访问的路由前缀，可以区分应用,不设置默认表示根路由'/', eg：/web
    prefix:'/web',
    // 路由对应的host,匹配的才生效,这很方便的对应用进行域名区分，默认空
    host:'',
    // router的allowedMethods配置，默认空
    allowedMethods:{},
    // 公用路由中间件,这里的中间件可以访问router，,默认空
    middlewares:['~/middlewares/auth.js'],
    <!-- 异常页面网址-->
    errorPage:'/error'
    <!-- 异常页面是否传入response.code , 实际会redirectTo:${errorPage}?code=${ctx.status}-->
    errorPageCode:false
  }
  ...
]
```

出于系统及公共路由中间件设计，系统默认所有匹配的路由都会执行，[_]开头的路由文件在最前面先执行。具体原因可查看`koa-router`的`exclusive `配置

#### > 应用目录

应用目录下的路由文件会自动加载，目录结构与url结构匹配。 路径或文件名以`_`开头代表`泛路由`，代表`koa-router`路由中的 `:param`。参数可以通过`ctx.params`访问. 

`v2.0.0` 开始，`index.js`是目录下的默认路由文件。

```
//====url: 
/apis/user/index
/apis/user/1  
/apis/client/1
//====默认应用目录
app
---apis
------_cate
---------index.js 目标路由文件   math:  /apis/client/
---------_id.js   目标路由文件   math:  /apis/client/1
------user
---------index.js 目标路由文件   math:  /apis/user/index || /apis/user
---------_id.js   目标路由文件   math:  /apis/user/1    

```

#### > 路由文件

每个应用目录下的js文件就是对应的路由文件， 是提供给`koa-router`使用的，格式如下:

```
export default {
    // 路由命名,参见`koa-router`的说明，可选
    name:'',
    // 单独设定固定seo别名，不要为泛域名添加该选项，可选
    alias:'user-upload',
    // 路由的请求method，默认all，可选
    method:"get",
    // 本路由专用的中间件数组, 详细查看中间件部分介绍，可选
    middlewares:['~/upload.js',session()]
    //路由实际逻辑部分
    fn:async (ctx,next)=>{
        ctx.body = 'login page';
        //await ctx.view("pages/index.vue",{...datas})
    }
}
```

### view
服务端渲染视图模板根目录，支持多种渲染模式，可在配置文件`koavc.config.js`中的`view`对象来设置。  

1、**在路由文件使用 `ctx.view` 方法来渲染模板文件**

```javascript
/**
 *	渲染模板 promise
 * `viewpath` : 模板文件的相对于`view`根目录的相对路径
 *					（eg： home.html ,   web/home.vue）
 * `data`     : 注入模板中的数据对象
 * /
await ctx.view(viewpath,data)

```

2、**模板引擎支持**

  * **`default`** 无引擎，
  * **`lodash`**  基于lodash.Template的极简模板引擎

  ```javascript
  <% [js code] %> ,<%=[js variables]%>
  
  ```

  * **`vue`**  基于vue2的ssr单文件（SFC）渲染引擎，借鉴了`nuxt`封装了[vsfc](https://github.com/cczw2010/vsfc)库来使用服务器端渲染，支持布局文件和页面文件以及组件. 详细说明和配置可查看`vsfc`项目说明。可在项目目录下建立`vsfc.config.js`来个性化配置。  
  
  > vue 模式下内置了`KoavcLink`组件用于做链接跳转，支持动态加载page功能,  注意只处理page,不处理layout及meta，所以如果使用请注意场景及架构
  
  ```
<koavc-link to="..." async ></koavc-link>
#属性
to  		url地址
async 		是否异步客户端渲染，默认false,直接跳转链接
#事件
begin		请求开始回调
process		进度回调，如果支持传参进度比，没有会返回一次undifined
finish		强求结束，如果失败或者错误则传参error
  ```

3、 **配置**

```javascript
<!-- 相关engine初始化时传入 -->
view:{
  <!-- 模板文件的默认根目录地址-->
  src:'view',
  <!-- 渲染引擎 default | lodash | vue ，可自行拓展  -->
  engine:'vue',
  // 页面静态化缓存，传入false关闭,true使用默认参数, (version:1.3.1)
  cache:{
    dir:'.koavc/pagecache',  //默认
    ttl:1000*60*60*12        //默认
  }

},
    
```

### 中间件

中间件支持两种`本地中间件`和`第三方中间件`。

本地自定义的中间件文件要求返回一个默认的初始化函数， 支持[async function]。用于加载配置文件初始化，该初始化函数返回真正的中间件函数

初始化函数支持返回中间件方法数组，方便整合依赖第三方中间件，更加灵活，具体可查看demo中的auth中间件。 

主要应用场景为`koa中间件`和`路由中间件`，下面分别说明。


#### > KOA中间件

用于koa的中间件，对应配置文件中的`middlewares`，在router初始化之前加载

#### > 应用 | 路由中间件

路由中间件可以有两种调用方式，

* 一种在路由文件中针对某个路由设置中间件（具体查看路由文件介绍）， 

* 一种是针对应用公共的中间件。

应用的中间件配置之所以和全局分开，是因为有特殊的功能，应用中间件在路由文件方法执行之前执行，可以访问`router`对象，且为路由文件新增了扩展属性支持`getRouteExtParam`，可以方便的对访问进行预处理及个性化操作。eg：

```javascript
##------- controller（路由文件） => home.js
export default {
  method:'get',
  auth:false,         //自定义扩展参数
  fn:(ctx,next)=>{}
}

##------- middleware => auth.js
...
<!-- 路由中间件中获取路由文件的扩展参数，注意该方法只会取匹配的路由中第一个的对应扩展参数，所以要注意路由匹配重叠 -->
return (ctx,next)=>{
  if(ctx.getRouteExtParam("auth")===false){   //false
    return next()
  }else{
    ctx.body="not login"
  }
}
...

```

#### > 中间件配置

不管在那种场景下，中间件的配置文件都为数组格式，具体如下：

```javascript
import etag from "koa-etag"
...
middlewares:[
'~/middlewares/upload.js',              //1 本地引入以~开头表示项目根目录,【注意】！本地中间件文件返回一个默认的初始化方法，方法执行后返回中间件方法
['~/middlewares/auth.js',{...options}]  //2 数组格式的话，第二个值代表传入的参数
etag(),                                 //3 直接传入第三方中间件
]
...
```

### alias

为了支持seo,内置实现了个简单的 `alias`中间件最为路由映射使用，如果想加载只需增加响应配置即可，也提供了api可以动态更新路由映射，具体参考API部分

*** 配置

```javascript
alias: {
 //可选，AsyncFunction方法,初始化获取alias列表对象的方法，格式{aliasPath:directTo},不提供的话为空,
 get:asyncFunction
 //可选，AsyncFunction方法,本地化保存alias的方法，不提供的存在缓存               
 set:asyncFunction(aliasPath,directTo)   
 //可选，AsyncFunction方法,本地化删除alias的方法，不提供的存在缓存
 del:asyncFunction(aliasPath)
}
```

### statics
 
静态路由目录，可配置多个 ,如果view引擎为vue，且项目的`vsfc.config.js`中配置了`injectPath`路径，将自动将vue编译的资源文件挂载到该路径上. 且增加`ctx.isStaticPath`属性来判断当前url是否静态路由

```
statics:[
  ['/static',/**xxxx**/], 
]
```

### 开发模式&reload

开发模式下`npx koavc dev`，包含服务端热重载和客户端热重载（is livereload,not hmr）.

客户端会在模板文件变动后自动刷新浏览器。

服务端代码会在`app`相关route，middleware,koavc.config.js文件变动时触发热重载。

为了应对复杂环境，`v2.0.6`开始也可在配置文件中修改配置增加监控目录：

```
watchs:['model','libs/src']
```

### API

api都注入到了`context`上

#### context.Config
配置信息

#### context.logger
同过consola实现的logger日志方法,可通过配置文件的logger选项设置，支持console和file两种日志方式，默认配置如下：

```javascript
{
  tag:"koavc",     // tag标签
  level:4,            // consola的level
  console:true,       // console日志
  file:{              // 为false关闭文件日志
    dateFormat:'HH:mm:ss',   //时间戳格式
    dir:'logs',       // 日志目录
  }
}
```

#### context.alias
路由别名映射对象,路径都是相对于根目录，都是Async Function

ctx.alias.set(aliasPath,redirectTo)

ctx.alias.del(aliasPath)

ctx.alias.list()

#### context.view(tplPath,data)
根据配置的渲染引擎，加载渲染模板，Async Function

#### context.getRouteExtParam(paramName)  :v1.3.3
用于router的中间件中，可以获取第一个匹配的router对应的controller的自定义扩展属性

### DEMO

查看[这里](https://github.com/cczw2010/koavc-example)
