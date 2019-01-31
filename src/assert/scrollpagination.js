import $ from "jquery";


(function( $ ){
	 
		 
 $.fn.scrollPagination = function(options) {
  	
		var opts = $.extend($.fn.scrollPagination.defaults, options);  
		var target = opts.scrollTarget;
		if (target == null){
			target = obj; 
	 	}
		opts.scrollTarget = target;
	 
		return this.each(function() {
		  $.fn.scrollPagination.init($(this), opts);
		});

  };
  
  $.fn.stopScrollPagination = function(){
	  return this.each(function() {
	 	$(this).attr('scrollPagination', 'disabled');
	  });
	  
  };
  
  $.fn.scrollPagination.loadContent = function(obj, opts,sHeight){
	 var target = opts.scrollTarget;
	 var mayLoadContent = $(target).scrollTop()+opts.heightOffset+$(target).height() >= sHeight;
	 if (mayLoadContent){
		 if (opts.beforeLoad != null){
			opts.beforeLoad(); 
		 }
		 $(obj).children().attr('rel', 'loaded');
		 fetch(opts.contentPage,
			 {data:opts.contentData}).then(function(data){
			 list(data.data);
//				$(obj).append(data);
			 var objectsRendered = $(obj).children('[rel!=loaded]');

			 if (opts.afterLoad != null){
				 opts.afterLoad(objectsRendered,data);
			 }
		 }
		 )
			  dataType: 'html'
		 }

  };

  
  $.fn.scrollPagination.init = function(obj, opts){
	 var target = opts.scrollTarget;
	 $(obj).attr('scrollPagination', 'enabled');
	
	 $(target).scroll(function(event){
	 	
		if ($(obj).attr('scrollPagination') == 'enabled'){
			var sHeight = $(target)[0].scrollHeight;
	 		$.fn.scrollPagination.loadContent(obj, opts,sHeight);		
		}
		else {
			event.stopPropagation();	
		}
	 });
	 
	 $.fn.scrollPagination.loadContent(obj, opts);
	 
 };
	
 $.fn.scrollPagination.defaults = {
      	 'contentPage' : null,
     	 'contentData' : {},
		 'beforeLoad': null,
		 'afterLoad': null	,
		 'scrollTarget': null,
		 'heightOffset': 0		  
 };	
})( $ );


const list=(data)=>{//处理返回的数据
 //    var count = data.commentsCount;
 //    $('#totalCount').html(count);
	// var dataObj = data.comments;
	// var str = ""
	// var i=0;
	// for( i in dataObj){
	// 	if(i<dataObj.length){
 //            str += '<div class="liuyanitem">';
 //            str += '<div style="width: 100%;height: 0.8rem;position: relative;display: flex;flex-direction: row">';
 //            str += '<img src="'+dataObj[i].userImageUrl+'" class="touxiang">';
 //            str += '<div class="liuyanname" >'+dataObj[i].userNickName+'</div>';
 //            str += '<div class="liuyanbq"></div>';
 //            str += '</div>';
 //            str += '<div class="liuyancontent">'+dataObj[i].commentContent+'</div>';
 //            str += '</div>';
	// 	}}
	// $('.broadItems').append(str);
	$("#scroll").append("<p style='color:red'>新增数据</p>")
}
export {list }