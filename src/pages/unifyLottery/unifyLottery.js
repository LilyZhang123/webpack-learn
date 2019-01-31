require('./jQueryRotate.js')

import {getBasePath,fetch,getQueryString} from "../../../assert/utils";
import Vue from 'vue';
import  $ from  "jquery";
import {Toast,MessageBox} from 'mint-ui';
Vue.config.productionTip = false
// 判断是不是移动设备
var isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i) ? true : false;
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i) ? true : false;
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i) ? true : false;
	},
	any: function() {
		return(isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());
	}
};

var turnWheel = {
	// chanceRemain : 1,
	rewardNames: [], //转盘奖品名称数组
	colors: [], //转盘奖品区块对应背景颜色
	outsideRadius: 192, //转盘外圆的半径
	textRadius: 155, //转盘奖品位置距离圆心的距离
	insideRadius: 68, //转盘内圆的半径
	startAngle: 0, //开始角度
	rewardInfos:[],//转盘奖品信息数组
	bRotate: false, //false:停止;ture:旋转


};
var vm= new Vue({
	el:'#rrapp',
	data:{
        mainId:null,
        prizesList:[],
        restCount:0,
        color1:null,
        color2:null,
        secureSvcNum:'',
        restCountShow:false,//显示
	},
	method:{

	}
});

function loadData() {
    var  mainId = getQueryString("mainId");
    fetch(getBasePath()+'/sw-api/wxgzLottery/unifyLottery/'+mainId,
        {method: "post",data:{"mainId":mainId}}
    ).then(function (r) {
        var data = r.data.resultMap;
        if( r.data.code===0){
            vm.mainId=data.mainId;
            vm.prizesList=JSON.parse(data.prizesList);
            vm.restCount=data.restCount;
            if(vm.restCount!=null&&vm.restCount>0){
                $("#restCountNum").show();
            }else{
                $("#restCountNone").show();
            }
            console.log(vm.restCountShow);
            vm.secureSvcNum=data.secureSvcNum;
            vm.color1=data.BIGLOTTERY_COLOR1;
            vm.color2=data.BIGLOTTERY_COLOR2;
            $("#bigLotteryImg").attr("src",data.BIGLOTTERY_IMG);
            loadPageData();
        }else{
            Toast(data.msg);
        }
    }).then(function () {
        drawWheelCanvas();
        isShowExtraPage();
    }).catch(function () {
        console.log("获取数据异常1");
    });
}

// 图片信息
var images={};
$(document).ready(function() {
    debugger;
    loadData();
});

function loadPageData(){
    if (vm.restCount > 0) {
        $("#none").hide();
        $("#start").show();
    } else {
        $("#none").show();
        $("#start").hide();
    }
    getRewardList();
    // rotateFunc(item, tip, count, awardName);
    $("a.popupCloseBtn").on("click", function() {
        $("div.popup").fadeOut(200);
    });
    $("#backBtn").on("click", function() {
        $("div.popup").fadeOut(200);
        window.location.reload();
    });
    $("#submitBtn").on("click", function() {
        var param = {
            'lotteryMainId':vm.mainId,
            'resultId':vm.resultId
        };
        fetch(getBasePath()+'/sw-api/wxgzLottery/toExchangeAwardPage',
            {method: "post",data:param}
        ).then(function (r) {
            var data = r.data;
            if(data.code===0){
                window.location.href='../'+data.url+'?lotteryMainId='+vm.mainId+'&resultId='+vm.resultId;
            }else{
                Toast(data.msg);
            }
        }).catch(function (error) {
            console.log("获取数据异常2");
        });
    });
    // 抽取按钮按钮点击触发事件
    $('#start').click(function() {
        // 正在转动，直接返回
        if(turnWheel.bRotate) return;
        if(vm.restCount < 0) {
            vm.restCount = 0;
        }
        console.log(vm.restCount);
        if(vm.restCount === 0){
            Toast("抽奖机会已经用完！");
            return;
        }
        $("#none").show();
        // switch (vm.restCount) {
        //     case 0:
        //         $("#none").show();
        //         $("#start").hide();
        //         return;
        //     case 1:
        //         $("#none").show();
        //         $("#start").hide();
        //     default:
        //         turnWheel.chanceRemain--;
        //         break;
        // }
        vm.restCount--;
        if(!isMobile.any()) {// 判断是否移动设备
            layerMsg("", "请在移动设备上打开");
            return;
        }
        turnWheel.bRotate = !turnWheel.bRotate;
        var count = turnWheel.rewardNames.length;
        var param = {
            mainId:vm.mainId,
        };
        fetch(getBasePath()+'/sw-api/wxgzLottery/lottery',
            {method: "post",data:param})
            .then(function (result) {
                var data = result.data;
                if (data.code!=0) {
                    Toast(data.errorReason || data.msg);
                    return;
                }else{
                    var resultId = data.result.resultId;
                    if(resultId == null || resultId == undefined || resultId == ''){
                        Toast("系统出错了");
                        return;
                    }else{
                        vm.resultId=resultId;
                        for (var i in turnWheel.rewardInfos) {

                            if (turnWheel.rewardInfos[i].awardInstanceId == data.result.awardInstance.awardInstanceId) {
                                rotateFunc(i, turnWheel.rewardInfos[i].awardKind, count,turnWheel.rewardInfos[i].awardName);
                                return;
                            }
                        }
                        Toast("系统出错了");//返回的奖品名称在先前的奖品列表中未找到
                    }
                }
            }).catch(function (error) {
                console.log(error)
            layerMsg("", "网络连接出错");
            $("#none").hide();
            $("#start").show();
        })
    });
    $('#myAwardInfo').on('click',function(){
        if(turnWheel.bRotate){
            return;//正在旋转，控制不能点击
        }
        window.location.href='../unifyPrizeList/index.html?mainId='+vm.mainId;
    })
    $('#restNone').on('click',function(){
        Toast("抽奖次数已用完");
        return;
    });
    $("#rrapp").show();
}
//旋转转盘 item:奖品序号，从0开始的; txt：提示语 ,count 奖品的总数量;
function rotateFunc(item, tip, count, awardName) {

    // 应该旋转的角度，旋转插件角度参数是角度制。
    var baseAngle = 360 / count;
    // 旋转角度 == 270°（当前第一个角度和指针位置的偏移量） - 奖品的位置 * 每块所占的角度 - 每块所占的角度的一半(指针指向区域的中间)
    var angles = 360 * 3 / 4 - (item * baseAngle) - baseAngle / 2; // 因为第一个奖品是从0°开始的，即水平向右方向
    $('#wheelCanvas').stopRotate();
    // 注意，jqueryrotate 插件传递的角度不是弧度制。
    // 哪个标签调用方法，旋转哪个控件
    $('#wheelCanvas').rotate({
        angle: 0,   //初始旋转的角度数，并且立即执行
        animateTo: angles + 360 * 5, // 这里多旋转了5圈，圈数越多，转的越快
        duration: 8000,  //指定使用animateTo的动画执行持续时间
        callback: function() { // 回调方法
            if (tip == "3") {//未中奖
                $("#rewardNone").fadeIn(200);
                return;
            }
            $("div.rewardText").text(awardName);
            turnWheel.bRotate = !turnWheel.bRotate;
            $("#reward").fadeIn(200);
        }
    });

};
//获取奖品列表，设置颜色
function getRewardList() {
    turnWheel.rewardInfos = vm.prizesList;
    if ($.type(turnWheel.rewardInfos)!='array' || turnWheel.rewardInfos.length <1) {
        Toast("获取奖品信息失败123");
        return;
    }
//		turnWheel.rewardInfos.pop();		//去掉后面的数字
    turnWheel.rewardNames = [];
    turnWheel.colors = [];
    var color1=vm.color1;
    var color2=vm.color2;

    for (var i in turnWheel.rewardInfos) {
        //加载图片
        var image_name = new Image();
        var img_src = turnWheel.rewardInfos[i].awardImage;
        if(img_src){
            image_name.src= img_src;
            images[i]=image_name;
        }
        turnWheel.rewardNames[i] = turnWheel.rewardInfos[i].awardName;
        turnWheel.colors.push(i%2==0 ? color1 : color2);
    }
    drawWheelCanvas();
	isShowExtraPage();
}
// window.onload = function() {
// 	drawWheelCanvas();
// 	isShowExtraPage();
// };

function isShowExtraPage(){
    var isShowExtraPage = $('#extraPage').val();
    if(isShowExtraPage == ''){
        return;
    }else if(isShowExtraPage != 'none'){
        $('#showExtraPage').show();
        $('#showPageButton').click(function(){
            window.location.href = getBasePath()+isShowExtraPage;
        })
    }
}
function drawWheelCanvas() {

	var canvas = document.getElementById("wheelCanvas");


	var baseAngle = Math.PI * 2 / (turnWheel.rewardNames.length);

	var ctx = canvas.getContext("2d");

	var canvasW = canvas.width; // 画板的高度
	var canvasH = canvas.height; // 画板的宽度

	ctx.clearRect(0, 0, canvasW, canvasH);


	ctx.strokeStyle = "#FFBE04";

	ctx.font = '16px Microsoft YaHei';
    for(var index = 0; index < turnWheel.rewardNames.length; index++) {
		var angle = turnWheel.startAngle + index * baseAngle;
		var color = turnWheel.colors[index];
		ctx.fillStyle = "#"+color;

		ctx.beginPath();
		ctx.arc(canvasW * 0.5, canvasH * 0.5, turnWheel.outsideRadius, angle, angle + baseAngle, false);
		ctx.arc(canvasW * 0.5, canvasH * 0.5, turnWheel.insideRadius, angle + baseAngle, angle, true);
		ctx.stroke();
		ctx.fill();
		ctx.save();


		ctx.fillStyle = "#E5302F";
		var rewardName = turnWheel.rewardNames[index];
		var line_height = 17;

		var translateX = canvasW * 0.5 + Math.cos(angle + baseAngle / 2) * turnWheel.textRadius;
		var translateY = canvasH * 0.5 + Math.sin(angle + baseAngle / 2) * turnWheel.textRadius;
		ctx.translate(translateX, translateY);

		ctx.rotate(angle + baseAngle / 2 + Math.PI / 2);
		for(var i in turnWheel.rewardNames){
			if(rewardName==turnWheel.rewardNames[i]){
				// 注意，这里要等到img加载完成才能绘制
                images[i].onload = function() {
                    ctx.drawImage(this, -21, 30);
                };
                ctx.drawImage(images[i], -21, 30);
			}
		}
		if(rewardName.indexOf("M") > 0) {
			var rewardNames = rewardName.split("M");
			for(var j = 0; j < rewardNames.length; j++) {
				ctx.font = (j == 0) ? 'bold 20px Microsoft YaHei' : '16px Microsoft YaHei';
				if(j == 0) {
					ctx.fillText(rewardNames[j] + "M", -ctx.measureText(rewardNames[j] + "M").width / 2, j * line_height);
				} else {
					ctx.fillText(rewardNames[j], -ctx.measureText(rewardNames[j]).width / 2, j * line_height);
				}
			}
		} else if(rewardName.indexOf("M") == -1 && rewardName.length > 6) { //奖品名称长度超过一定范围
			rewardName = rewardName.substring(0, 8) + "||" + rewardName.substring(8);
			var rewardNames = rewardName.split("||");
			for(var j = 0; j < rewardNames.length; j++) {
				ctx.fillText(rewardNames[j], -ctx.measureText(rewardNames[j]).width / 2, j * line_height);
			}
		} else {
			ctx.fillText(rewardName, -ctx.measureText(rewardName).width / 2, 0);
		}
		ctx.restore();
	}
}


function layerMsg(title,content){
    MessageBox(title,content);

}
//后面为引用的大转盘js
// (function($) {
//     var supportedCSS, supportedCSSOrigin, styles = document.getElementsByTagName("head")[0].style,
//         toCheck = "transformProperty WebkitTransform OTransform msTransform MozTransform".split(" ");
//     for(var a = 0; a < toCheck.length; a++)
//         if(styles[toCheck[a]] !== undefined) {
//             supportedCSS = toCheck[a];
//         }
//     if(supportedCSS) {
//         supportedCSSOrigin = supportedCSS.replace(/[tT]ransform/, "TransformOrigin");
//         if(supportedCSSOrigin[0] == "T") supportedCSSOrigin[0] = "t";
//     }
//
//     // Bad eval to preven google closure to remove it from code o_O
//     eval('IE = "v"=="\v"');
//
//     jQuery.fn.extend({
//         rotate: function(parameters) {
//             if(this.length === 0 || typeof parameters == "undefined") return;
//             if(typeof parameters == "number") parameters = {
//                 angle: parameters
//             };
//             var returned = [];
//             for(var i = 0, i0 = this.length; i < i0; i++) {
//                 var element = this.get(i);
//                 if(!element.Wilq32 || !element.Wilq32.PhotoEffect) {
//
//                     var paramClone = $.extend(true, {}, parameters);
//                     var newRotObject = new Wilq32.PhotoEffect(element, paramClone)._rootObj;
//
//                     returned.push($(newRotObject));
//                 } else {
//                     element.Wilq32.PhotoEffect._handleRotation(parameters);
//                 }
//             }
//             return returned;
//         },
//         getRotateAngle: function() {
//             var ret = [];
//             for(var i = 0, i0 = this.length; i < i0; i++) {
//                 var element = this.get(i);
//                 if(element.Wilq32 && element.Wilq32.PhotoEffect) {
//                     ret[i] = element.Wilq32.PhotoEffect._angle;
//                 }
//             }
//             return ret;
//         },
//         stopRotate: function() {
//             for(var i = 0, i0 = this.length; i < i0; i++) {
//                 var element = this.get(i);
//                 if(element.Wilq32 && element.Wilq32.PhotoEffect) {
//                     clearTimeout(element.Wilq32.PhotoEffect._timer);
//                 }
//             }
//         }
//     });
//
//     // Library agnostic interface
//
//     Wilq32 = window.Wilq32 || {};
//     Wilq32.PhotoEffect = (function() {
//
//         if(supportedCSS) {
//             return function(img, parameters) {
//                 img.Wilq32 = {
//                     PhotoEffect: this
//                 };
//
//                 this._img = this._rootObj = this._eventObj = img;
//                 this._handleRotation(parameters);
//             }
//         } else {
//             return function(img, parameters) {
//                 this._img = img;
//                 this._onLoadDelegate = [parameters];
//
//                 this._rootObj = document.createElement('span');
//                 this._rootObj.style.display = "inline-block";
//                 this._rootObj.Wilq32 = {
//                     PhotoEffect: this
//                 };
//                 img.parentNode.insertBefore(this._rootObj, img);
//
//                 if(img.complete) {
//                     this._Loader();
//                 } else {
//                     var self = this;
//                     // TODO: Remove jQuery dependency
//                     jQuery(this._img).bind("load", function() {
//                         self._Loader();
//                     });
//                 }
//             }
//         }
//     })();
//
//     Wilq32.PhotoEffect.prototype = {
//         _setupParameters: function(parameters) {
//             this._parameters = this._parameters || {};
//             if(typeof this._angle !== "number") {
//                 this._angle = 0;
//             }
//             if(typeof parameters.angle === "number") {
//                 this._angle = parameters.angle;
//             }
//             this._parameters.animateTo = (typeof parameters.animateTo === "number") ? (parameters.animateTo) : (this._angle);
//
//             this._parameters.step = parameters.step || this._parameters.step || null;
//             this._parameters.easing = parameters.easing || this._parameters.easing || this._defaultEasing;
//             this._parameters.duration = parameters.duration || this._parameters.duration || 1000;
//             this._parameters.callback = parameters.callback || this._parameters.callback || this._emptyFunction;
//             this._parameters.center = parameters.center || this._parameters.center || ["50%", "50%"];
//             if(typeof this._parameters.center[0] == "string") {
//                 this._rotationCenterX = (parseInt(this._parameters.center[0], 10) / 100) * this._imgWidth * this._aspectW;
//             } else {
//                 this._rotationCenterX = this._parameters.center[0];
//             }
//             if(typeof this._parameters.center[1] == "string") {
//                 this._rotationCenterY = (parseInt(this._parameters.center[1], 10) / 100) * this._imgHeight * this._aspectH;
//             } else {
//                 this._rotationCenterY = this._parameters.center[1];
//             }
//
//             if(parameters.bind && parameters.bind != this._parameters.bind) {
//                 this._BindEvents(parameters.bind);
//             }
//         },
//         _emptyFunction: function() {},
//         _defaultEasing: function(x, t, b, c, d) {
//             return -c * ((t = t / d - 1) * t * t * t - 1) + b
//         },
//         _handleRotation: function(parameters, dontcheck) {
//             if(!supportedCSS && !this._img.complete && !dontcheck) {
//                 this._onLoadDelegate.push(parameters);
//                 return;
//             }
//             this._setupParameters(parameters);
//             if(this._angle == this._parameters.animateTo) {
//                 this._rotate(this._angle);
//             } else {
//                 this._animateStart();
//             }
//         },
//
//         _BindEvents: function(events) {
//             if(events && this._eventObj) {
//                 // Unbinding previous Events
//                 if(this._parameters.bind) {
//                     var oldEvents = this._parameters.bind;
//                     for(var a in oldEvents)
//                         if(oldEvents.hasOwnProperty(a))
//                         // TODO: Remove jQuery dependency
//                             jQuery(this._eventObj).unbind(a, oldEvents[a]);
//                 }
//
//                 this._parameters.bind = events;
//                 for(var a in events)
//                     if(events.hasOwnProperty(a))
//                     // TODO: Remove jQuery dependency
//                         jQuery(this._eventObj).bind(a, events[a]);
//             }
//         },
//
//         _Loader: (function() {
//             if(IE)
//                 return function() {
//                     var width = this._img.width;
//                     var height = this._img.height;
//                     this._imgWidth = width;
//                     this._imgHeight = height;
//                     this._img.parentNode.removeChild(this._img);
//
//                     this._vimage = this.createVMLNode('image');
//                     this._vimage.src = this._img.src;
//                     this._vimage.style.height = height + "px";
//                     this._vimage.style.width = width + "px";
//                     this._vimage.style.position = "absolute"; // FIXES IE PROBLEM - its only rendered if its on absolute position!
//                     this._vimage.style.top = "0px";
//                     this._vimage.style.left = "0px";
//                     this._aspectW = this._aspectH = 1;
//
//                     /* Group minifying a small 1px precision problem when rotating object */
//                     this._container = this.createVMLNode('group');
//                     this._container.style.width = width;
//                     this._container.style.height = height;
//                     this._container.style.position = "absolute";
//                     this._container.style.top = "0px";
//                     this._container.style.left = "0px";
//                     this._container.setAttribute('coordsize', width - 1 + ',' + (height - 1)); // This -1, -1 trying to fix ugly problem with small displacement on IE
//                     this._container.appendChild(this._vimage);
//
//                     this._rootObj.appendChild(this._container);
//                     this._rootObj.style.position = "relative"; // FIXES IE PROBLEM
//                     this._rootObj.style.width = width + "px";
//                     this._rootObj.style.height = height + "px";
//                     this._rootObj.setAttribute('id', this._img.getAttribute('id'));
//                     this._rootObj.className = this._img.className;
//                     this._eventObj = this._rootObj;
//                     var parameters;
//                     while(parameters = this._onLoadDelegate.shift()) {
//                         this._handleRotation(parameters, true);
//                     }
//                 }
//             else return function() {
//                 this._rootObj.setAttribute('id', this._img.getAttribute('id'));
//                 this._rootObj.className = this._img.className;
//
//                 this._imgWidth = this._img.naturalWidth;
//                 this._imgHeight = this._img.naturalHeight;
//                 var _widthMax = Math.sqrt((this._imgHeight) * (this._imgHeight) + (this._imgWidth) * (this._imgWidth));
//                 this._width = _widthMax * 3;
//                 this._height = _widthMax * 3;
//
//                 this._aspectW = this._img.offsetWidth / this._img.naturalWidth;
//                 this._aspectH = this._img.offsetHeight / this._img.naturalHeight;
//
//                 this._img.parentNode.removeChild(this._img);
//
//                 this._canvas = document.createElement('canvas');
//                 this._canvas.setAttribute('width', this._width);
//                 this._canvas.style.position = "relative";
//                 this._canvas.style.left = -this._img.height * this._aspectW + "px";
//                 this._canvas.style.top = -this._img.width * this._aspectH + "px";
//                 this._canvas.Wilq32 = this._rootObj.Wilq32;
//
//                 this._rootObj.appendChild(this._canvas);
//                 this._rootObj.style.width = this._img.width * this._aspectW + "px";
//                 this._rootObj.style.height = this._img.height * this._aspectH + "px";
//                 this._eventObj = this._canvas;
//
//                 this._cnv = this._canvas.getContext('2d');
//                 var parameters;
//                 while(parameters = this._onLoadDelegate.shift()) {
//                     this._handleRotation(parameters, true);
//                 }
//             }
//         })(),
//
//         _animateStart: function() {
//             if(this._timer) {
//                 clearTimeout(this._timer);
//             }
//             this._animateStartTime = +new Date;
//             this._animateStartAngle = this._angle;
//             this._animate();
//         },
//         _animate: function() {
//             var actualTime = +new Date;
//             var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;
//
//             // TODO: Bug for animatedGif for static rotation ? (to test)
//             if(checkEnd && !this._parameters.animatedGif) {
//                 clearTimeout(this._timer);
//             } else {
//                 if(this._canvas || this._vimage || this._img) {
//                     var angle = this._parameters.easing(0, actualTime - this._animateStartTime, this._animateStartAngle, this._parameters.animateTo - this._animateStartAngle, this._parameters.duration);
//                     this._rotate((~~(angle * 10)) / 10);
//                 }
//                 if(this._parameters.step) {
//                     this._parameters.step(this._angle);
//                 }
//                 var self = this;
//                 this._timer = setTimeout(function() {
//                     self._animate.call(self);
//                 }, 10);
//             }
//
//             // To fix Bug that prevents using recursive function in callback I moved this function to back
//             if(this._parameters.callback && checkEnd) {
//                 this._angle = this._parameters.animateTo;
//                 this._rotate(this._angle);
//                 this._parameters.callback.call(this._rootObj);
//             }
//         },
//
//         _rotate: (function() {
//             var rad = Math.PI / 180;
//             if(IE)
//                 return function(angle) {
//                     this._angle = angle;
//                     this._container.style.rotation = (angle % 360) + "deg";
//                     this._vimage.style.top = -(this._rotationCenterY - this._imgHeight / 2) + "px";
//                     this._vimage.style.left = -(this._rotationCenterX - this._imgWidth / 2) + "px";
//                     this._container.style.top = this._rotationCenterY - this._imgHeight / 2 + "px";
//                     this._container.style.left = this._rotationCenterX - this._imgWidth / 2 + "px";
//
//                 }
//             else if(supportedCSS)
//                 return function(angle) {
//                     this._angle = angle;
//                     this._img.style[supportedCSS] = "rotate(" + (angle % 360) + "deg)";
//                     this._img.style[supportedCSSOrigin] = this._parameters.center.join(" ");
//                 }
//             else
//                 return function(angle) {
//                     this._angle = angle;
//                     angle = (angle % 360) * rad;
//                     // clear canvas
//                     this._canvas.width = this._width; //+this._widthAdd;
//                     this._canvas.height = this._height; //+this._heightAdd;
//
//                     // REMEMBER: all drawings are read from backwards.. so first function is translate, then rotate, then translate, translate..
//                     this._cnv.translate(this._imgWidth * this._aspectW, this._imgHeight * this._aspectH); // at least center image on screen
//                     this._cnv.translate(this._rotationCenterX, this._rotationCenterY); // we move image back to its orginal
//                     this._cnv.rotate(angle); // rotate image
//                     this._cnv.translate(-this._rotationCenterX, -this._rotationCenterY); // move image to its center, so we can rotate around its center
//                     this._cnv.scale(this._aspectW, this._aspectH); // SCALE - if needed ;)
//                     this._cnv.drawImage(this._img, 0, 0); // First - we draw image
//                 }
//
//         })()
//     }
//
//     if(IE) {
//         Wilq32.PhotoEffect.prototype.createVMLNode = (function() {
//             document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
//             try {
//                 !document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
//                 return function(tagName) {
//                     return document.createElement('<rvml:' + tagName + ' class="rvml">');
//                 };
//             } catch(e) {
//                 return function(tagName) {
//                     return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
//                 };
//             }
//         })();
//     }
//
// })($);





