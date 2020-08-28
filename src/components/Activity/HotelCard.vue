<template>
  <div class="hotel-item">
    <!-- 酒店信息 -->
    <div class="hotel-info">
      <!-- 封面 -->
      <div class="cover">
        <img v-if="hotel.cover" :src="hotel.cover" style="width: 208px; height: 122px;" />
      </div>
      <!-- 酒店的基本信息 -->
      <div class="info">
        <div class="title">{{ hotel.name }}</div>
        <div class="item-1">
          <span class="label">酒店星级</span><span><a-icon type="star" style="color: #ffa33e;" v-for="star in hotel.rank" :key="star" theme="filled" /></span>
        </div>
        <div class="item-1">
          <span class="label">酒店地址</span><span class="c-1">{{ hotel.address }}</span>
        </div>
        <div class="desc-info">
          <span class="label">酒店介绍</span
          ><span class="c-1"
            ><v-clamp autoresize :max-lines="3">{{ hotel.intro }}</v-clamp></span
          >
        </div>
      </div>
      <div class="operation-wrap">
        <div class="divider"></div>
        <div class="operation">
          <span class="room-type-label"> {{ statistics.list ? statistics.list.length : 0 }}个房型 </span>
          <a-button class="m-l-120" type="primary" @click="toRoom(hotel.id)">
            分配房间
          </a-button>
          <a-button class="m-1-121" @click="viewRoom(hotel.id)">
            查看状态
          </a-button>
        </div>
      </div>
    </div>
    <!-- 额外信息 -->
    <div class="other-info">
      <div class="other-info-count">
        <div style="display: flex; flex-diretion: row; align-items: center;">
          <a-form :form="form">
            <a-form-item>
              <DatePickerInput
                v-decorator="[`checkInDate`, { rules: [{ required: true, message: `请选择日期` }] }]"
                @change="HandleSubmit(hotel.id, $event)"
                :beginDate="hotel.orderBeginDate"
                :endDate="hotel.orderEndDate"
              />
            </a-form-item>
          </a-form>
          <span class="span-count">
            总房间数:{{ statistics.roomTotal }} &nbsp; 已预定房间数:{{ statistics.roomUse }} &nbsp; 剩余房间数:{{ statistics.roomFree }} &nbsp; 已分配人数:{{
              statistics.guestTotal
            }}
            &nbsp; 已入住人数:{{ statistics.guestCheckIn }} &nbsp; 未入住人数:{{ statistics.guestNoCheckIn }}
          </span>
        </div>
        <div class="btn-wrap">
          <a @click="HandleShow(hotel.id)" :id="`label${hotel.id}`" style="color: #f60f0f; display: inner-block;">展开</a>
        </div>
      </div>
      <div class="other-info-description" :id="`desc${hotel.id}`">
        <p v-for="s in statistics.list" :key="s.name" class="p-1">
          {{ s.name }}：共{{ s.roomTotal }}间·已订{{ s.roomUse }}间·剩余{{ s.roomFree }}间<span v-if="s.bedFree > 0">·剩余床位{{ s.bedFree }}</span
          >·已分配{{ s.guestTotal }}人·已入住{{ s.guestCheckIn }}人·未入住{{ s.guestNoCheckIn }}人
        </p>
        <p v-if="!statistics.list || statistics.list.length === 0">
          暂无数据...
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import DatePickerInput from '../DateComponents/DatePickerInput'
import VClamp from 'vue-clamp'
import moment from 'moment'
export default {
  props: {
    hotel: {
      type: Object,
      required: true,
    },
    activityId: {
      type: String,
      required: true,
    },
  },
  components: {
    DatePickerInput,
    VClamp,
  },

  data() {
    return {
      form: this.$form.createForm(this, {}),
      statistics: {},
    }
  },
  created() {
    this.HandleSubmit(this.hotel.id, moment(this.hotel.orderBeginDate).utcOffset(480).format('YYYY-MM-DD'))
  },

  methods: {
    HandleShow(id) {
      var e = document.getElementById('desc' + id)
      var el = document.getElementById('label' + id)
      if (['none', 'undefined', ''].includes(e.style.display)) {
        e.style.display = 'block'
        el.text = '收起'
      } else {
        e.style.display = 'none'
        el.text = '展开'
      }
    },
    toRoom(hotelId) {
      this.$router.push({
        name: 'hotel-room',
        params: { id: hotelId },
        query: {},
      })
    },

    viewRoom(hotelId) {
      this.$router.push({
        name: 'hotel-view-room',
        params: { id: hotelId },
        query: {},
      })
    },
    // 获取酒店统计信息
    async HandleSubmit(hotelId, date) {
      try {
        const rst = await this.$http.get(`/activities/${this.activityId}/hotels/${hotelId}/statistics`, {
          params: {
            date: `${date}`,
          },
        })

        this.statistics = rst
      } catch (error) {
        console.log('获取房间统计报错：' + error)
        return []
      }
    },
  },
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.hotel-item {
  width: 100%;
  background-color: #fff;
  border: 1px solid #e5e5e5;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  padding: 24px 24px 0 24px;
  .hotel-info {
    flex-direction: row;
    display: flex;
    .cover {
      height: 122px;
      min-width: 208px;
      background-color: #d8d8d8;
    }
    .info {
      padding-left: 16px;
      padding-bottom: 24px;
      flex: 1;
      .title {
        font-size: 16px;
        font-weight: 600;
        line-height: 22px;
        color: #333333;
      }
    }
  }
  .other-info {
    background-color: #fafafa;
    margin-bottom: 11px;
    .other-info-count {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      .span-count {
        font-size: 12px;
        font-weight: 600;
        color: rgba(51, 51, 51, 1);
        line-height: 16px;
        margin-left: 16px;
      }
      .btn-wrap {
        min-width: 30px;
      }
    }
    .other-info-description {
      margin: 0 16px 16px 16px;
      border-top: 1px solid #e5e5e5;
      display: none;
    }
  }
}

.divider {
  margin: 0 16px;
  width: 1px;
  height: 80px;
  background-color: gray;
  opacity: 0.2;
}

.m-l-120 {
  margin-top: 8px;
  width: 88px;
  background-color: #f60f0f;
}

.m-1-121 {
  margin-top: 8px;
  width: 88px;
}

.desc-info {
  margin-top: 12px;
  width: 100%;
  display: flex;
  flex-direction: row;
  color: #333333;
}

.operation-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.operation {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px;
  .room-type-label {
    font-size: 18px;
    font-weight: 600;
    width: 64px;
  }
}

.item-1 {
  margin-top: 12px;
}
.label {
  min-width: 55px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(51, 51, 51, 1);
  line-height: 16px;
  display: inline-block;
}
.c-1 {
  font-size: 12px;
  font-weight: 400;
  color: rgba(153, 153, 153, 1);
  line-height: 16px;
}
.p-1 {
  font-size: 12px;
  font-weight: 400;
  color: rgba(102, 102, 102, 1);
  line-height: 16px;
  margin-top: 16px;
}
</style>
