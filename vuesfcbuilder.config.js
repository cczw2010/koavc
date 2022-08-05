export default {
  // sfc源文件后缀
  source_ext:'vue',
  // page源码目录
  source_page:"pages",
  // layout源码目录
  source_layout: "layouts",
  // 自定义component源码目录
  source_component: "components",
  // 需要参与编译渲染的第三方的module配置
  buildModules:{
    // vuetify:{
    //   // meta:{},
    //   option:{}
    // }
  },
  // vue-meta设置
  vuemeta:{
    keyName:'head',
    tagIDKeyName:'vmid',
  }
}