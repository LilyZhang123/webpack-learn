require('./index.css');
import Vue from "vue";
import axios from "axios"
console.log(Vue)
axios.defaults.withCredentials = true;

axios.post('/api/u/loading', {
		firstName: 'Fred',
		lastName: 'Flintstone'
	})
	.then(function(response) {
		console.log(response);
	})
	.catch(function(error) {
		console.log(error);
	});

var vm = new Vue({
	el: "#app",
	data: {
		name: "用户名",
		phone: " 18815294416"
	},
	methods: {
		changeName: function() {
			return this.name = "章力"
			// console.log(this.name);
		}
	}
})