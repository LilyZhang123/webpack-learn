require('./index.css');
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