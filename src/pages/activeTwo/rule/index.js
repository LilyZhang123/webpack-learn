require('./index.css');
require('assert/scrollpagination.js');
import Vue from "vue";
import Toast from "mint-ui";


var vm = new Vue({
  el: "#app",
  data: {
    name: "用户名",
    phone: " 18815294416"
  },
  method: {
    changeName: function() {
      return this.name = "章力"
    }
  }
});
$(function() {
  $.fn.fadeInWithDelay = function(){//滑动
    var delay = 0;
    return this.each(function(){
        $(this).delay(delay).animate({opacity:1}, 200);
        delay += 100;
    });
};
  $('#scoll').scrollPagination({ //滚动加载
    'contentPage': '/api/u/loading', //请求url
    'contentData': '',
    'scrollTarget': $('#scoll'),
    'heightOffset': 0,
    'beforeLoad': function() { //加载前操作
      // param.currentpage = currentpage;
    },
    'afterLoad': function(elementsLoaded, data) { //加载后操作,data：返回的数据
      debugger;
      data = data.data;
      $(elementsLoaded).fadeInWithDelay();
      // if (data.code == 0) {
      //   
      //   var dataObj = data.comments;
      //   if (dataObj.length < 1 && $("#currentPage").val() == 1) {
      //     Toast("暂时还没有人留言");
          // $('.warp').stopScrollPagination();
      //   } else if (dataObj.length < 1) {
      //     Toast("没有更多数据了");
      //     $('.warp').stopScrollPagination();
      //   }
      //   currentpage = currentpage + 1;
      // } else {
      //   $('.warp').stopScrollPagination();
      //   if (data.code == 2) {
      //     $('.test').show();
      //   } else {
      //     Toast(data.msg);
      //   }
      // }
    }
  });
})