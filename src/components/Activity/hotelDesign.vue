<template>
  <div class="hotel-wrap">
    <HotelCard
      v-for="hotel in hotelList"
      :key="hotel.id"
      :hotel="hotel"
      :activityId="`${activityId}`"
    ></HotelCard>
  </div>
</template>
<script>
import HotelCard from './HotelCard';
export default {
  data() {
    return {
      activityId: this.$route.params.id,
      hotelList: []
    };
  },

  components: {
    HotelCard
  },
  created() {
    //获取酒店列表
    this.getHotelList().then((rst) => {
      this.hotelList = rst.rows;
    });
  },
  methods: {
    async getHotelList() {
      try {
        return await this.$http.get(`/activities/${this.activityId}/hotels`, {
          params: {
            statistics: true
          }
        });
      } catch (error) {
        console.log('获取酒店列表出错：' + error);
        return [];
      }
    }
  }
};
</script>
<style lang="less" scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.hotel-wrap {
  width: 100%;
  padding-left: 24px;
  padding-right: 24px;
  margin-bottom: 24px;
  overflow-y: scroll;
  background-color: #f5f5f5;
}

.hotel-wrap::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.hotel-wrap::-webkit-scrollbar-button {
  background-color: rgba(0, 0, 0, 0);
}
.hotel-wrap::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
.hotel-wrap::-webkit-scrollbar-track-piece {
  background-color: rgba(0, 0, 0, 0);
}
.hotel-wrap::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
}
.hotel-wrap::-webkit-scrollbar-corner {
  background-color: rgba(0, 0, 0, 0);
}
.hotel-wrap::-webkit-scrollbar-resizer {
  background-color: rgba(0, 0, 0, 0);
}
</style>
