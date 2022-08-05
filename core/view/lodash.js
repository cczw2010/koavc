// 使用lodash.template渲染模板. 及经典的 <% js code %> 和 <%=jsVariable%>
// 说明:https://lodash.com/docs/4.17.15#template
import template from "lodash.template"
export default {
  name:"lodash",
  /**
   * 渲染时调用   必须
   * @param {any} dst       源码对象
   * @param {object} data   外部数据用于模板
   * @return html 返回渲染后的html
   */
   async compiled(dst,data){
    if(dst){
      const compiled = template(dst)
      return compiled(data||{})
    }
    return ''
  }
}