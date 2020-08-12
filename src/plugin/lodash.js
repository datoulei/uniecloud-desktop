import lodash from 'lodash'
export default {
  install: function (Vue) {
    Vue.lodash = lodash
    Object.defineProperty(Vue.prototype, '$lodash', {
      value: lodash
    })
  }
}
