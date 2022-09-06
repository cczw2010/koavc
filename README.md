### 安装依赖库
```
npm install koavc --save
```
### 初始化服务器配置

通过配置 `koavc.config.js` 来配置服务器相关配置,具体查看配置文件。


### 运行服务
```
#启动服务,如果是vue模式，必须先执行build命令
npx koavc start
#编译vue文件
npx koavc build
# 开发模式.1.3.0开始支持简单的liveload
npx koavc dev
```

### controller  路由
路由控制器目录，内部基于[`@koa/router`](https://github.com/koajs/router)中间件实现，目录会自动加载，目录结构与url结构等同。 

路径或文件名以`_`开头代表`泛路由`，代表`@koa/router`路由中的 `:param`。参数可以通过`ctx.params`访问

```
//====url: 
/apis/user/index
/apis/user/1  
/apis/client/1
//====目录
controller
---apis
------_cate
---------_id.js   目标路由文件   math:  /apis/client/1
------user
---------index.js 目标路由文件   math:  /apis/user/index
---------_id.js   目标路由文件   math:  /apis/user/1    

```

`路由文件` 就是每个controller下的每个js文件， 是提供给`@koa/router`使用的，格式如下:

```
export default {
    // 路由命名,参见`@koa/router`的说明，可选
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
        //ctx.view("pages/index",{...datas})
    }
}
```

`路由配置`,可在`koavc.config.js`中修改,默认配置如下：

```
...
router:{
  <!-- controller文件根目录 -->
  dir:"controller",
  <!-- @koa/router中间件的配置 -->
  option:{
    ...
    // 是否只执行最后一个匹配的，默认全部匹配的都回执行。[_]开头的controller在前面先执行
    exclusive:false, //默认,不建议修改
  }
  // V1.3.3 全局路由中间件,这里的中间件可以访问router，前提是 option的 exclusive:false
  middlewares:[],
  // v1.3.4 router的allowedMethods配置
  allowedMethods:{},
},
...
```

### 中间件配置

在`koavc.config.js`中可配置koa(`middlewares`)或者路由的全局中间件(`router.middlewares`)，或者在`controller路由文件`中配置的中间件只在当前路由中生效，中间件支持两种`本地中间件`和`第三方中间件`。本地中间件文件要求返回一个默认的初始化函数，用于加载配置文件初始化并返回最终中间件函数。 支持[async function]。配置方法如下：

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

### KOA中间件

用于koa的中间件，对应配置文件中的`middlewares`，在router初始化之前加载

### 路由中间件

路由中间件可以有两种调用方式，

* 一种在controller中针对某个路由设置中间件（具体查看controller文件介绍）， 

* 一种是V1.3.3 新增，的针对路由全局的中间件，对应配置文件中的`router.middlewares`。注意出于设计考虑，**前提是router配置中的router.option.exclusive 为false（默认）** 才会生效。下面详细介绍一下：

这里的中间件可以访问router，且在controller方法执行之前加载，并新增了`controller` 扩展属性功能，可以方便的对controller进行预处理及个性化操作。eg：

```javascript
##------- controller => home.js
export default {
  method:'get',
  auth:false,         //扩展参数
  fn:(ctx,next)=>{}
}

##------- middleware => auth.js
...
<!-- 路由中间件中获取controller扩展参数，注意该方法只会取匹配的路由中最后一个的对应扩展参数，所以要注意路由匹配重叠 -->
if(ctx.getControllerExtParam("auth")===false){   //false
  return next()
}else{
  ctx.body="not login"
}
...


```


### alias

为了支持seo,内置实现了个简单的 `alias`中间件最为路由映射使用，如果想加载只需增加响应配置即可，也提供了api可以动态更新路由映射，具体参考API部分

*** 配置

```javascript
alias: {
 //可选，初始化获取alias列表对象的方法，格式{aliasPath:directTo},不提供的话为空,
 get:asyncFunction
 //可选，本地化保存alias的方法，不提供的存在缓存               
 set:asyncFunction(aliasPath,directTo)   
 //可选，本地化删除alias的方法，不提供的存在缓存
 del:asyncFunction(aliasPath)
}
```

### view
服务端渲染视图模板根目录，支持多种渲染模式，可在配置文件`koavc.config.js`中的`view`对象来设置。  

1、**在controller路由文件使用 `ctx.view` 方法来渲染模板文件**

```javascript
/**
 *	渲染模板
 * `viewpath` : 模板文件的相对于`view`根目录的相对路径
 *					（eg： home.html ,   web/home.vue）
 * `data`     : 注入模板中的数据对象
 * /
ctx.view(viewpath,data)

```

2、**模板引擎支持**

  * **`default`** 无引擎，
  * **`lodash`**  基于lodash.Template的极简模板引擎

  ```javascript
  <% [js code] %> ,<%=[js variables]%>
  
  ```

  * **`vue`**  基于vue2的ssr单文件（SFC）渲染引擎，封装了[vuesfcbuiler](https://github.com/cczw2010/vuesfcbuilder)库来使用服务器端渲染，借鉴了一些`nuxt`,支持布局文件和页面文件以及组件.[参考](https://www.w3cschool.cn/vuessr/)。 详细说明和配置可查看`vuesfcbuilder`项目说明 ，或者`koavc`包根目录下的[默认配置文件](./vuesfcbuilder.config.js),


3、 **配置**

```javascript
<!-- 相关engine初始化时传入 -->
view:{
  <!-- 模板文件的默认根目录地址，（vue是在vuesfcbuilder总独立配置的）-->
  src:'view',
  <!-- 渲染引擎 default | lodash | vue ，可自行拓展  -->
  engine:'vue',
  // 页面静态化缓存，传入false关闭,true使用默认参数, (version:1.3.1)
  cache:{
    dir:'.koavc/pagecache',  //默认
    ttl:1000*60*60*12        //默认
  }

},
<!-- vue时有效，参数为vuesfcrender库的配置 -->
vuesfcbuilder:{
  /*vuesfcrender的配置*/
},
<!-- 静态路由目录，可配置多个 -->
statics:[
  ['/static',/**vuerootDist**/],   //默认，vue输出目录挂载到`/static`路由上
]
    
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
路由别名映射对象,路径都是相对于根目录

ctx.alias.set(aliasPath,redirectTo)

ctx.alias.del(aliasPath)

ctx.alias.list()

#### context.view(tplPath,data)
根据配置的渲染引擎，加载渲染模板

#### context.getControllerExtParam(paramName)  :v1.3.3
用于router的中间件中，可以获取最后一个匹配的router对应的controller的自定义扩展属性

### DEMO

查看[这里](https://github.com/cczw2010/koavc-example)
