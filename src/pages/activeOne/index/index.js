require('./index.css');
require('assert/close.less');
import 'mint-ui/lib/style.css'
import Vue from "vue";
import {fetch} from "components/utils";
require("components/ft-slider.css");
require("components/ft-slider.min.js");
import Mint from 'mint-ui';
var Mock = require('mockjs')
import { MessageBox, Button } from 'mint-ui';
Vue.component(Button.name, Button);
Vue.use(Mint);
// var name = Mock.mock({
//   'name':@cname
// })


var btn1 = document.getElementById("btn1");
      var result1 = document.getElementById("result1");
      var slider1 = new FtSlider({
        id: "slider1",
        callback: function(res) {
          result1.innerHTML = res;
        }
      });


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
      return this.name = name
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