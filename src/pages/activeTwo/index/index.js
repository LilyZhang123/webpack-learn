require('./index.css');
require('assert/bootstrap.min.css');
require("bootstrap");
import Vue from "vue";

var vm = new Vue({
	el:"#app",
	data:{
		name:"用户名",
		phone:" 18815294416"
	},
	method:{
		changeName:function () {
			return this.name = "章力"
		}
	}
})

$(function(){
  $('.carousel').carousel()
  console.log(1)
  // $(".carousel").html("测试jquery")
  console.log(2)
});

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