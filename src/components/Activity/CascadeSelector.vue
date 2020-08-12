<template>
  <a-cascader
    :value="formatValue"
    :options="options"
    placeholder="请选择"
    expandTrigger="hover"
    @change="handleChange"
  />
</template>

<script>
import _ from 'lodash';
export default {
  props: {
    value: {
      type: null,
      required: true
    },
    field: {
      type: Object,
      required: true
    }
  },
  computed: {
    formatValue() {
      if (this.value) {
        return this.value.split('-');
      } else {
        return;
      }
    },
    options() {
      const data = this.field.options.options;
      return this.formatOptions(data);
    }
  },
  methods: {
    formatOptions(optionMap) {
      return Object.keys(optionMap).map(option => {
        const data = {
          label: option,
          value: option
        };
        if (optionMap[option]) {
          data.children = this.formatOptions(optionMap[option]);
        }
        return data;
      });
    },
    handleChange(val) {
      this.$emit('change', val.join('-'));
    }
  }
};
</script>

<style lang="less" scoped>
</style>
