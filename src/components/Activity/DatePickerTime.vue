<template>
  <a-date-picker v-model="current" :showTime="{ format: 'HH:mm' }" format="YYYY-MM-DD HH:mm" />
</template>

<script>
import moment from 'moment'
export default {
  props: {
    value: {
      type: String,
      required: false,
    },
  },
  data() {
    return {}
  },
  computed: {
    current: {
      get() {
        if (this.value) {
          return moment(this.value, 'YYYY-MM-DD HH:mm')
        } else {
          return moment()
        }
      },
      set(val) {
        this.$emit('change', val.format('YYYY-MM-DD HH:mm'))
      },
    },
  },
}
</script>

<style scoped>
</style>