import axios from 'axios'
var qs = require('qs');
import Vue from "vue";
import { Indicator } from 'mint-ui';


axios.interceptors.request.use(config => {
  Indicator.open({
  text: 'Loading...',
  spinnerType: 'fading-circle'
});
  return config
}, error => {
  setTimeout(() => {
Indicator.close();
  }, 3000)
  return Promise.reject(error)
});

// http响应拦截器
axios.interceptors.response.use(data => { // 响应成功关闭loading
  Indicator.close();
  return data
}, error => {
  return Promise.reject(error)
});

const fetch = (url, options) => {
	console.log("options1", options);
	const {
		method = 'get', data
	} = options
	data['openid'] = "";
	switch (method.toLowerCase()) {
		case 'get':
			return axios.get(url, {
				params: data
			})
		case 'delete':
			return axios.delete(url, {
				data
			})
		case 'head':
			return axios.head(url, data)
		case 'post':
			return axios.post(url, qs.stringify(data), {
				headers: {
					"Content-Type": 'application/x-www-form-urlencoded'
				}
			})
		case 'put':
			return axios.put(url, stringify(data))
		case 'patch':
			return axios.patch(url, data)
		default:
			return axios(options)
	}
}

export {fetch};