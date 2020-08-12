<template>
  <div class="wrap">
    <div class="wrap-top">
      <div class="room-type">
        <span class="label">房型:</span>
        <a-radio-group
          v-model="checkType"
          buttonStyle="solid"
          @change="getRoomList"
        >
          <a-radio-button :value="t.id" v-for="t in type" :key="t.id">{{
            t.name
          }}</a-radio-button>
        </a-radio-group>
      </div>
      <div class="date">
        <div class="date-desc"><span class="label">住房日期:</span></div>
        <div class="date-group">
          <a-radio-group
            v-model="checkDate"
            buttonStyle="solid"
            @change="getRoomList"
          >
            <a-radio-button
              :value="d.date"
              v-for="d in dateList"
              :key="d.date"
              >{{ d.date }}</a-radio-button
            >
          </a-radio-group>
        </div>
      </div>

      <a-button type="primary" @click="download">下载分房列表</a-button>
    </div>
    <p
      v-for="s in countInfo"
      :key="s.name"
      style="color: #666666; font-size: 12px; margin-top: 10px;"
    >
      {{ s.name }}：共{{ s.roomTotal }}间·已订{{ s.roomUse }}间·剩余{{
        s.roomFree
      }}间<span v-if="s.bedFree > 0">·剩余床位{{ s.bedFree }}</span
      >·已分配{{ s.guestTotal }}人·已入住{{ s.guestCheckIn }}人·未入住{{
        s.guestNoCheckIn
      }}人
    </p>
    <div class="wrap-body">
      <div v-for="r in room" :key="r.id" class="room">
        <div class="room-name" @dblclick="HandleEdit(r)" :id="`div-${r.id}`">
          {{ r.name }}
          <div class="check-circle-wrap">
            <a-icon
              type="check-circle"
              theme="filled"
              :class="['', canShowCheckInIcon(r) ? 'check-circle' : '']"
            />
          </div>
        </div>
        <a-input
          class="room-input"
          hidden="true"
          :id="`input-${r.id}`"
          @blur="HandleEditFinish(r)"
        ></a-input>
        <div class="room-body" v-if="r.orderItems.length > 0">
          <div v-for="item in r.orderItems" :key="item.id" class="item">
            <span
              v-for="attendee in item.attendees"
              :key="attendee.id"
              :class="isCheckIn(attendee)"
              >{{ attendee.name }}</span
            >
          </div>
        </div>
        <div class="lock-wrap" v-else>
          <div style="display: flex; flex-direction: column;">
            <a-icon :type="isLock(r.items) ? 'lock' : 'unlock'" />
            <a href="#" @click="HandleLock(r)">{{
              isLock(r.items) ? '解锁房间' : '锁定房间'
            }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';
export default {
  data() {
    return {
      activityId: this.$store.state.user.activityId,
      hotelId: this.$route.params.id,
      conditions: [], // 获取房型接口
      type: [],
      checkType: 0,
      checkDate: '',
      room: [],
      countInfo: []
    };
  },
  created() {
    this.getRoomType().then((rst) => {
      if (rst.rows.length > 0) {
        this.conditions = rst.rows;
        this.checkType = this.conditions[0].id;
        this.type = this.conditions.map((row) => {
          return { id: row.id, name: row.name };
        });
        setTimeout(() => {
          this.getRoomList();
        }, 500);
      }
    });
  },
  computed: {
    dateList() {
      let dateList = this.conditions.filter(
        (item) => item.id === this.checkType
      );
      let dateArray = [];
      if (dateList.length > 0) {
        let beginDate = dateList[0].allowOrderBeginDate;
        let endDate = dateList[0].allowOrderEndDate;
        let day = dayjs(endDate).diff(dayjs(beginDate), 'day');
        this.checkDate = dayjs(beginDate).format('YYYY-MM-DD');
        for (let i = 0; i <= day; i++) {
          let temp = dayjs(beginDate).add(i, 'day').format('YYYY-MM-DD');
          dateArray.push({ date: temp });
        }
      }
      return dateArray;
    }
  },
  methods: {
    // 获取酒店统计信息
    async getCountInfo() {
      try {
        const result = await this.$http.get(
          `/activities/${this.activityId}/hotels/${this.hotelId}/statistics`,
          {
            params: {
              date: this.checkDate
            }
          }
        );
        const roomType = this.type.filter(
          (item) => item.id === this.checkType
        )[0].name;

        this.countInfo = result.list.filter((item) => roomType === item.name);
      } catch (error) {
        console.log('获取房间统计报错：' + error);
        return [];
      }
    },

    // 是否签到
    isCheckIn(attendee) {
      if (attendee.isSignIn) {
        return 'check-in-style';
      } else {
        return '';
      }
    },
    /**
     * 检查是否有入住标记
     */
    canShowCheckInIcon(room) {
      const isCheckIn = room.orderItems.some((item) => {
        return item.isCheckIn;
      });
      return isCheckIn;
    },

    isLock(items) {
      if (Array.isArray(items)) {
        let temp = items.filter((item) => item.date === this.checkDate);
        if (temp.length > 0) {
          return temp[0].isLock;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    // 编辑房间
    HandleEdit(room) {
      document.getElementById('div-' + room.id).setAttribute('hidden', true);
      var e = document.getElementById('input-' + room.id);
      e.removeAttribute('hidden');
      e.value = room.name;
      e.focus();
    },
    // 编辑结束
    async HandleEditFinish(room) {
      document.getElementById('div-' + room.id).removeAttribute('hidden');
      document.getElementById('input-' + room.id).setAttribute('hidden', true);
      let roomName = document.getElementById('input-' + room.id).value;
      try {
        await this.$http.put(
          `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${room.type}/rooms/${room.id}`,
          {
            name: roomName
          }
        );
        this.getRoomList();
      } catch (error) {}
    },

    // 锁定房间
    async HandleLock(room) {
      const isLock = this.isLock(room.items);
      try {
        await this.$http.put(
          `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/rooms/${room.id}`,
          {
            date: this.checkDate,
            isLock: !isLock
          }
        );
        this.getRoomList();
      } catch (error) {
        console.log('修改房间信息异常', error);
      }
    },

    //获取房型
    async getRoomType() {
      try {
        return await this.$http.get(
          `/activities/${this.activityId}/hotels/${this.hotelId}/room_types`
        );
      } catch (error) {
        console.log('获取酒房型店列表出错：' + error);
        return [];
      }
    },

    // 获取房态列表
    async getRoomList() {
      try {
        this.room = await this.$http.get(
          `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/rooms`,
          {
            params: {
              date: this.checkDate
            }
          }
        );
        this.getCountInfo();
      } catch (error) {
        console.log('获取房态列表出错：' + error);
        return [];
      }
    },

    /**
     * 下载分房信息
     */
    async download() {
      let url = `/activities/${this.activityId}/hotels/${this.hotelId}/export`;
      try {
        let result = await this.$http.get(url);
        let el = document.createElement('a');
        el.href = result.url;
        el.click();
        el.target = '_blank';
        el.remove();
      } catch (error) {
        console.log('download throw error');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.wrap {
  display: flex;
  flex: 1;
  border: 1px solid #d8d8d8;
  background-color: #fff;
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
  overflow-y: scroll;
  .wrap-top {
    border-bottom: 1px solid #d8d8d8;
    .room-type {
      margin-bottom: 24px;
    }
    .date {
      margin-bottom: 24px;
      display: flex;
      flex-direction: row;
      .date-desc {
        width: 60px;
        padding-top: 5px;
      }
      .date-group {
        flex: 1;
      }
    }
  }
  .wrap-body {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .room {
      width: 122px;
      min-height: 108px;
      border: 1px solid #d8d8d8;
      margin: 15px 12px;
      position: relative;
      display: flex;
      align-items: center;
      flex-direction: column;
      .room-name {
        height: 32px;
        width: 100%;
        background-color: #f4f4f4;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .check-circle-wrap {
        position: absolute;
        top: 5px;
        right: 6px;
      }
      .room-input {
        text-align: center;
        border-radius: 0px;
        border: none;
        border-bottom: 1px solid #333;
      }
      .room-body {
        min-height: 80px;
        width: 122px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .lock-wrap {
        min-height: 80px;
        width: 122px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .item {
        display: flex;
        flex-direction: column;
      }
    }
  }
}

.check-circle {
  color: #f60f0f;
}
.check-in-style {
  color: #ffa33e;
}
</style>

<style lang="less" scoped>
.ant-radio-button-wrapper {
  border: none;
  background-color: #fff;
}
.ant-radio-button-wrapper:not(:first-child)::before {
  content: '';
  display: block;
  top: 0;
  left: -1px;
  width: 0px;
  height: 100%;
  position: absolute;
  background-color: #d9d9d9;
}

.ant-radio-group-solid
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background-color: #fff;
  color: #f60f0f;
  border: 1px solid #f60f0f;
  box-shadow: 0px 0 0 0 #f60f0f;
  border-radius: 0px;
}

.ant-radio-button-wrapper {
  margin: 0;
  height: 32px;
  line-height: 30px;
  color: rgba(0, 0, 0, 0.65);
  display: inline-block;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid transparent;
  border-left: 0;
  border-top-width: 1.02px;
  background: #fff;
  padding: 0 15px;
  position: relative;
}
</style>

<style lang="less" scoped>
.wrap::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.wrap::-webkit-scrollbar-button {
  background-color: rgba(0, 0, 0, 0);
}
.wrap::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
.wrap::-webkit-scrollbar-track-piece {
  background-color: rgba(0, 0, 0, 0);
}
.wrap::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
}
.wrap::-webkit-scrollbar-corner {
  background-color: rgba(0, 0, 0, 0);
}
.wrap::-webkit-scrollbar-resizer {
  background-color: rgba(0, 0, 0, 0);
}
</style>
