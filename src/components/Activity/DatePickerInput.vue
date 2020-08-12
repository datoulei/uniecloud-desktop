<template>
  <a-locale-provider :locale="zh_CN">
    <a-date-picker v-model="current" format="YYYY-MM-DD" />
  </a-locale-provider>
</template>

<script>
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
import moment from 'moment';
export default {
  props: {
    value: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      zh_CN
    };
  },
  computed: {
    current: {
      get() {
        if (this.value) {
          return moment(this.value, 'YYYY-MM-DD');
        } else {
          return moment();
        }
      },
      set(val) {
        this.$emit('change', val.format('YYYY-MM-DD'));
      }
    }
  }
};
</script>

<style scoped></style>
