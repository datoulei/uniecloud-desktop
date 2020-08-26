<template>
  <a-date-picker v-model="current" format="YYYY-MM-DD" :disabledDate="disabledDate" />
</template>

<script>
import moment from 'moment'
import dayjs from 'dayjs'
export default {
  props: {
    value: {
      type: String,
      required: false,
    },
    beginDate: {
      type: String,
      required: false,
    },
    endDate: {
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
          return moment(this.value)
        } else if (this.beginDate) {
          return moment(this.beginDate)
        } else {
          return moment()
        }
      },
      set(val) {
        this.$emit('change', val.format('YYYY-MM-DD'))
      },
    },
  },
  methods: {
    moment,
    /**
     * 日期选择不可用
     */
    disabledDate(current) {
      return current < moment(dayjs(this.beginDate).subtract(1, 'day').format('YYYY-MM-DD')).endOf('day') || current > moment(this.endDate).endOf('day')
    },
  },
}
</script>

<style scoped></style>
