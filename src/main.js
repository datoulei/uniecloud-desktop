import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';
import './permission';

import Antd from 'ant-design-vue';
import './ant-design-vars.less';
import VueStorage from 'vue-ls';
import http from '@/plugin/$http';
import db from './db';
import lodash from '@/plugin/lodash';
Vue.use(Antd);
Vue.use(http);
Vue.use(lodash);
Vue.use(VueStorage, {
  namespace: 'uniecloud__', // key prefix
  name: 'ls', // name variable Vue.[ls] or this.[$ls],
  storage: 'local' // storage name session, local, memory
});
Vue.db = Vue.prototype.$db = db;
// if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;
/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
