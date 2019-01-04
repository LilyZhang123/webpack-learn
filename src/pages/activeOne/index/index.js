require('./index.css');
require('assert/close.less');
import 'mint-ui/lib/style.css'
import Vue from "vue";
import {fetch} from "components/utils";
import Mint from 'mint-ui';
import { MessageBox, Button } from 'mint-ui';
Vue.component(Button.name, Button);
Vue.use(Mint);




fetch('/api/u/loading', {
  methods: "post",
  data: {
    firstName: 'Fred',
    lastName: 'Flintstone'
  }
}).then(function(response) {
  console.log(response);
}).catch(function(error) {
  console.log(error);
});
var vm = new Vue({
  el: "#app",
  data: {
    name: "用户名",
    phone: " 18815294416",
    show: false,
    confirmText: {
      title: "操作提示",

    },
    imgUrl:"http://localhost"
  },
  components: {
  },
  methods: {
    changeName: function() {
      return this.name = "章力"
    },
    open() {
        MessageBox({
  title: '提示',
  message: '确定执行此操作?',
  showCancelButton: true
});
      },
    onShow: function() {
      this.show = true;
      fetch('/dev/zjunicom-weixin/sw-api/login/oauth', {
        method: "post",
        data: {
          code: '1111',
          menuUrl: 'Flintstone'
        }
      }).then(function(response) {
        console.log(response + 'response');
      }).catch(function(error) {
        console.log(error);
      });
    },
    onConfirm: function() {
      console.log("确认")
    },
    onCancel: function() {
      console.log("取消")
    }
  }
});