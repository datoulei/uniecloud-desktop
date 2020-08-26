<template>
  <a-date-picker v-model="current" format="YYYY-MM-DD" />
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
          return moment(this.value, 'YYYY-MM-DD')
        } else {
          return moment()
        }
      },
      set(val) {
        this.$emit('change', val.format('YYYY-MM-DD'))
      },
    },
  },
}
</script>

<style scoped></style>
