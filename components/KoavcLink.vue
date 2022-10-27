<template>
  <span @click="onClick" class="koavc-link">
    <slot></slot>
  </span>
</template>
<script type="text/javascript">
  export default {
    props: {
      to:{
        type:String,
        default:""
      },
      //是否router模式，默认false,启用后ajax形式去获取
      async:{
        type:Boolean,
        default:false
      }, 
      begin:{
        type:Function,
        default:null
      },
      process:{
        type:Function,
        default:null
      },
      finish:{
        type:Function,
        default:null
      }
    },
    data(){
      return {
      }
    },
    methods:{
      onClick(){
        if(!this.to){
          return
        }
        if(this.async){
          this.getAsyncPage()
        }else{
          location.href=this.to
        }
      },
      getAsyncPage(){
        const requestUrl = this.to
        // 请求过的异步列表记录，不会在重复请求，参数不同会重新请求
        window.koavc_asyncpages = window.koavc_asyncpages||{
          [location.pathname+location.search]:{
            id:App.getInstance().pageName,
            state:{}
          }
        }
        if(requestUrl in koavc_asyncpages){
          App.setAsyncPage(koavc_asyncpages[requestUrl])
          history.pushState(null,null,requestUrl)
          return
        }
        if(window._koavc_asyncXhr){
          window._koavc_asyncXhr.onreadystatechange = null //防止触发
          window._koavc_asyncXhr.abort()
        }
        this.$emit('begin')
        const xhr = new XMLHttpRequest()
        xhr.addEventListener('progress', (processEvent)=>{
          if(processEvent.lengthComputable){
            this.$emit('process',processEvent.loaded/processEvent.total)
          }
        })
        xhr.onreadystatechange = ()=>{
          // console.debug('>>>>>>>>>finished',xhr.readyState,xhr.status);
          if (xhr.readyState==4){
            try{
              if(xhr.status==200){
                const json = JSON.parse(xhr.responseText)
                koavc_asyncpages[requestUrl] = json
                App.setAsyncPage(json)
                this.$emit('finish')
                history.pushState(null,null,requestUrl)
              }else{
                throw new Error('request to server failed')
              }
            }catch(e){
              this.$emit('finish',e)
            }
          }
        }
        xhr.open("GET",this.to+"?_page_json",true);
        xhr.send();
        window._koavc_asyncXhr = xhr
      }
    }
  }
</script>