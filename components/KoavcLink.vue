<style  scoped>
  .button{
    color:green
  }
</style>
<template>
  <span @click="onClick">
    <slot></slot>
  </span>
</template>
<script type="text/javascript">
  function getAsyncPageInfo(url){
    const xhr = new XMLHttpRequest()
    console.log(">>>>>>>>>loading")
    xhr.addEventListener('progress', function(e){
      if (e.lengthComputable) {
        console.log('>>>>>>>>>process:',e.loaded / e.total)
      } else {
        console.log('>>>>>>>>>process:无法计算进展');
      }
    })
    xhr.onreadystatechange = function(){
      console.log('>>>>>>>>>finished',xhr.readyState,xhr.status);
      if (xhr.readyState==4 && xhr.status==200){
        try{
          const json = JSON.parse(xhr.responseText)
          console.log(json)
          App.setAsyncPage(json)
        }catch(e){
          console.log(e)
        }
      }
    }
    xhr.open("GET",url,true);
    xhr.send();
  }
  

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
      handleComplete:{
        type:Function,
        default:null
      },
      handleProcess:{
        type:Function,
        default:null
      },
      handleAbort:{
        type:Function,
        default:null
      },
    },
    data(){
      return {
      }
    },
    methods:{
      onClick(){
        console.log(">>>>>>>>>>>>>>>>>click",this.to,this.async)
        if(!this.to){
          return
        }
        if(this.async){
          getAsyncPageInfo(this.to+"?_page_json")
        }else{
          location.href=this.to
        }
        return false
      }
    }
  }
</script>