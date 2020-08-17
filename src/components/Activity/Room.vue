<template>
  <div class="wrap">
    <!-- 左屏 -->
    <div class="wrap-left">
      <div class="action-bar">
        <div class="date-wrap">
          <span class="label">酒店：</span>
          <span>{{ hotel.name }}</span>
        </div>
        <div class="room-type-wrap">
          <span class="label">房型:</span>
          <a-radio-group v-model="checkType" buttonStyle="solid" @change="load('roomType')">
            <a-radio-button :value="t.id" v-for="t in type" :key="t.id">{{ t.name }}</a-radio-button>
          </a-radio-group>
        </div>
        <div class="date-wrap">
          <span class="label">日期:</span>
          <a-range-picker :disabledDate="disabledDate" format="YYYY-MM-DD" v-model="values" @change="load()" />
        </div>
        <hr />
        <a-button @click="alertModal" class="btn">智能分房</a-button>
        <a-button @click="clearRoomList" class="btn">清空分房</a-button>
        <a-button @click="download" class="btn">下载分房列表</a-button>
        <div class="room-num">
          <span class="btn">可分配房间数 {{ useRooms.length + freeRooms.length }} 间</span>
          <span class="btn">已分配 {{ useRooms.length }} 间</span>
          <span class="btn">未分配 {{ freeRooms.length }} 间</span>
        </div>
        <form id="download" action="" method="post"></form>
        <div class="desc-label">{{ roomName }}(最多容纳{{ maxPeople }}人)-日期区间分房情况</div>
      </div>
      <!-- 拖拽 -->
      <div class="room-wrap">
        <div class="title" v-if="useRooms.length > 0">已分配房间</div>
        <div class="had-allot" v-if="useRooms.length > 0">
          <div v-for="room in useRooms" :key="room.id" class="room">
            <div class="room-name had-sharking-room-name" @dblclick="HandleEdit(room)" :id="`div-${room.id}`">
              {{ room.name }}
              <a-icon type="check-circle" theme="filled" :class="['check-circle', canShowCheckInIcon(room) ? 'red' : '']" @click="checkIn(room)" />
            </div>
            <a-input class="room-input" hidden="true" :id="`input-${room.id}`" @blur="HandleEditFinish(room)"></a-input>

            <draggable :value="room.orderItems" draggable=".item" handle=".item-drag" @change="(e) => doAllot(e, room)" group="room" class="v-draggable">
              <div v-for="it in room.orderItems" :key="it.id" class="item" flex="cross:center">
                <span :class="['item-drag', signIn(it)]">
                  <span v-for="attendee in it.attendees" :key="attendee.id" :class="isCheckIn(attendee.OrderAttendee)">
                    <a-tooltip placement="top">
                      <template slot="title">
                        <div class="tooltip">
                          <span>{{ attendee.name }}</span>
                          <span class="span-inner-block">
                            {{ it.orderType === 0 ? '整房预定' : '床位预定' }}
                          </span>
                          <span>
                            {{ attendee.sex && attendee.sex === 1 ? '男' : attendee.sex === 0 ? '女' : '未定义' }}/{{
                              attendee.work ? attendee.work : '未填写'
                            }}/{{ attendee.job ? attendee.job : '未填写' }}
                          </span>
                        </div>
                      </template>
                      {{ attendee.name }}
                    </a-tooltip>
                  </span>
                </span>
                <div class="icon" @click="remove(it)"></div>
              </div>
            </draggable>
          </div>
        </div>
        <div class="title" v-if="freeRooms.length > 0">未分配房间</div>
        <div class="not-allot" v-if="freeRooms.length > 0">
          <div v-for="room in freeRooms" :key="room.id" class="room">
            <div class="room-name" @dblclick="HandleEdit(room)" :id="`div-${room.id}`">
              {{ room.name }}
            </div>
            <a-input class="room-input" hidden="true" :id="`input-${room.id}`" @blur="HandleEditFinish(room)"></a-input>
            <draggable :value="room.orderItems" draggable=".item" handle=".item-drag" @change="(e) => doAllot(e, room)" group="room" class="v-draggable">
              <div v-for="it in room.orderItems" :key="it.id" class="item" flex="cross:center">
                <span class="item-drag">
                  <p v-for="attendee in it.attendees" :key="attendee.id">
                    {{ attendee.name }}
                  </p>
                </span>
                <div class="icon" @click="remove(it)"></div>
              </div>
            </draggable>
          </div>
        </div>
      </div>
    </div>
    <!-- 右屏 -->
    <div class="wrap-right">
      <p style="font-size: 16px; color: #333333; font-weight: 600;">
        选择日期的待分配参会人员
      </p>
      <a-input-search enter-button v-model="keyword" @search="search" placeholder="姓名/手机号" />
      <div class="state-box">
        <div class="left">可分配总人数<br />{{ orderStat.total }}位</div>
        <div class="right">
          <p>已分配 {{ orderStat.use }} 位</p>
          <p>未分配 {{ orderStat.free }} 位</p>
        </div>
      </div>
      <!-- 整床预定-->
      <div class="book-whole-room">
        <div style="font-size: 14px; color: #333; font-weight: 500; margin-top: 10px;" v-if="roomOrder.length > 0">
          整床预定
        </div>
        <div class="name-wrap" v-if="roomOrder.length > 0">
          <draggable :list="roomOrder" draggable=".room-item" handle=".item-drag" group="room" class="v-draggable-1">
            <div v-for="item in roomOrder" :key="item.id" class="room-item" flex="cross:center">
              <span class="item-drag name" v-for="r in item.attendees" :key="r.id" :order-id="item.id" style="border: 1px solid #d8d8d8;"
                ><a-tooltip placement="top">
                  <template slot="title">
                    <div class="tooltip">
                      <span>{{ r.name }}</span>
                      <span class="span-inner-block">{{ item.orderType === 0 ? '整房预定' : '床位预定' }}</span>
                      <span>
                        {{ r.sex && r.sex === 1 ? '男' : r.sex === 0 ? '女' : '未定义' }}/{{ r.work ? r.work : '未填写' }}/{{ r.job ? r.job : '未填写' }}
                      </span>
                    </div>
                  </template>
                  {{ r.name }}
                </a-tooltip>
              </span>
            </div>
          </draggable>
        </div>
      </div>

      <!-- 床位预定 -->
      <div class="book-single-bed">
        <div style="font-size: 14px; color: #333; font-weight: 500; margin-top: 10px;" v-if="bedOrder.length > 0">
          床位预定
        </div>
        <div class="name-wrap" v-if="bedOrder.length > 0">
          <draggable :list="bedOrder" draggable=".item" handle=".item-drag" group="room" class="v-draggable-1">
            <div v-for="item in bedOrder" :key="item.id" class="item" flex="cross:center">
              <span class="item-drag" :order-id="item.id" v-for="r in item.attendees" :key="r.id">
                <a-tooltip placement="top">
                  <template slot="title">
                    <p>{{ r.name }}</p>
                    <p>{{ r.orderType === 0 ? '整房预定' : '床位预定' }}</p>
                    <p>{{ r.sex && r.sex === 1 ? '男' : r.sex === 0 ? '女' : '未定义' }}/{{ r.work ? r.work : '未填写' }}/{{ r.job ? r.job : '未填写' }}</p>
                  </template>
                  {{ r.name }}
                </a-tooltip></span
              >
            </div>
          </draggable>
        </div>
      </div>
    </div>

    <CustomModal
      :visible="showAllot"
      title="智能分房"
      width="400px"
      height="300px"
      @cancel="handleClose"
      @ok="autoAllot"
      :maskClosable="false"
      :destroyOnClose="true"
    >
      <div class="modal-wrap">
        <div class="modal-wrap-child">
          <div class="title-1">入住时间</div>
          <div>
            {{ moment(values[0]).format('YYYY-MM-DD') }} 至
            {{ moment(values[1]).format('YYYY-MM-DD') }}
          </div>
        </div>
        <div class="modal-wrap-child">
          <div class="title-1">分配条件</div>
          <div class="modal-wrap-condition">
            <div>按照以下条件分配房间</div>
            <div class="switch"><span>是否同性别</span><a-switch defaultChecked @change="onChange" v-model="isSexSame" /></div>
            <div class="switch"><span>是否同单位</span><a-switch defaultChecked @change="onChange" v-model="isWorkSame" /></div>
          </div>
        </div>
      </div>
    </CustomModal>
  </div>
</template>

<script>
import CustomModal from '@/components/CustomModal/CustomModal'
import draggable from 'vuedraggable'
import dayjs from 'dayjs'
import moment from 'moment'
export default {
  data() {
    return {
      hotelId: this.$route.params.id,
      activityId: this.$store.state.user.activityId,
      conditions: [], // 获取房型接口
      type: [], // 房型
      values: [], // 日期控件绑定值
      allowOrderBeginDate: null, //开始预订时间
      allowOrderEndDate: null, //结束预订时间
      checkType: 0, //选中的房型ID
      keyword: '', //关键字
      orders: [], //可分配人员列表(转换后)
      useRooms: [], // 不可用
      freeRooms: [], // 可用
      showAllot: false, //控制显示隐藏modal
      isSexSame: true,
      isWorkSame: true,
      hotel: {},
      orderStat: {},
    }
  },
  created() {
    this.loadHotel()
    this.getRoomType().then((rst) => {
      if (rst.rows.length > 0) {
        this.conditions = rst.rows
        this.checkType = this.conditions[0].id

        this.allowOrderBeginDate = moment(this.conditions[0].allowOrderBeginDate, 'YYYY-MM-DD')

        this.allowOrderEndDate = moment(this.conditions[0].allowOrderEndDate, 'YYYY-MM-DD')

        this.values = [this.allowOrderBeginDate, this.allowOrderEndDate]

        this.type = this.conditions.map((row) => {
          return { id: row.id, name: row.name, maxPeople: row.maxPeople }
        })

        this.load()
      }
    })
  },
  components: {
    draggable,
    moment,
    CustomModal,
  },
  computed: {
    roomOrder() {
      return this.orders.filter((order) => {
        if (order.orderType === 0) {
          return order
        }
      })
    },
    bedOrder() {
      return this.orders.filter((order) => {
        if (order.orderType === 1) {
          return order
        }
      })
    },
    roomName() {
      let _name = this.type.filter((item) => item.id === this.checkType)

      if (_name.length > 0) {
        return _name[0].name
      }
    },
    maxPeople() {
      let maxPeople = this.type.filter((item) => item.id === this.checkType)

      if (maxPeople.length > 0) {
        return maxPeople[0].maxPeople
      }
    },
  },
  methods: {
    moment,
    async loadHotel() {
      try {
        const data = await this.$http.get(`/activities/${this.activityId}/hotels/${this.hotelId}`)
        this.hotel = data
      } catch (error) {}
    },
    onChange() {},
    signIn(order) {
      if (
        order.attendees.some((item) => {
          return item.OrderAttendee.isSignIn
        })
      ) {
        return 'sign-border'
      } else {
        return ''
      }
    },
    isCheckIn(attendee) {
      if (attendee.isSignIn) {
        return 'check-in-style'
      } else {
        return ''
      }
    },
    handleClose() {
      this.showAllot = false
    },
    load(type) {
      if (type === 'roomType') {
        if (Array.isArray(this.conditions)) {
          const selectedRoomType = this.conditions.filter((item) => this.checkType === item.id)

          this.allowOrderBeginDate = moment(selectedRoomType[0].allowOrderBeginDate, 'YYYY-MM-DD')

          this.allowOrderEndDate = moment(selectedRoomType[0].allowOrderEndDate, 'YYYY-MM-DD')
          this.values = [this.allowOrderBeginDate, this.allowOrderEndDate]
        }
      }

      this.search()
      this.GetEnbaleAllot()
    },

    /**
     * 获取未分配的订单列表
     */
    async search() {
      try {
        const url = `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/orders`
        const result = await this.$http.get(url, {
          params: {
            checkIn: this.values[0] ? dayjs(this.values[0]).format('YYYY-MM-DD') : '',
            checkOut: this.values[1] ? dayjs(this.values[1]).format('YYYY-MM-DD') : '',
            keyword: this.keyword,
          },
        })
        this.orders = this.buildOrderTemplate(result)
        this.getOrderStat()
      } catch (error) {
        console.log('获取酒房型店列表出错：' + error)
        return []
      }
    },

    /**
     * 获取订单统计
     */
    async getOrderStat() {
      try {
        const data = await this.$http.get(`/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/order_stat`, {
          params: {
            checkIn: this.values[0] ? dayjs(this.values[0]).format('YYYY-MM-DD') : '',
            checkOut: this.values[1] ? dayjs(this.values[1]).format('YYYY-MM-DD') : '',
          },
        })
        this.orderStat = data
      } catch (error) {}
    },

    /**
     * 日期选择不可用
     */
    disabledDate(current) {
      return (
        current < moment(dayjs(this.allowOrderBeginDate).subtract(1, 'day').format('YYYY-MM-DD')).endOf('day') ||
        current > moment(this.allowOrderEndDate).endOf('day')
      )
    },

    /**
     * 获取房型
     */
    async getRoomType() {
      try {
        return await this.$http.get(`/activities/${this.activityId}/hotels/${this.hotelId}/room_types`)
      } catch (error) {
        console.log('获取酒房型店列表出错：' + error)
        return []
      }
    },
    /**
     * 清空分房
     */
    async clearRoomList() {
      this.$confirm({
        title: '提示',
        content: '确定要清空分房?',
        onOk: async () => {
          try {
            const url = `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/allot`
            await this.$http.delete(url, {
              params: {
                checkIn: this.values[0] ? dayjs(this.values[0]).format('YYYY-MM-DD') : '',
                checkOut: this.values[1] ? dayjs(this.values[1]).format('YYYY-MM-DD') : '',
              },
            })
            this.load()
          } catch (error) {
            console.log('清空分房异常：', error)
          }
        },
        onCancel() {},
      })
    },

    /**
     * 获取可分配房间列表
     */
    async GetEnbaleAllot() {
      try {
        const url = `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/rooms/available`
        const result = await this.$http.get(url, {
          params: {
            checkIn: dayjs(this.values[0]).format('YYYY-MM-DD'),
            checkOut: dayjs(this.values[1]).format('YYYY-MM-DD'),
          },
        })
        if (result) {
          this.useRooms = result.use
          this.freeRooms = result.free
        }
      } catch (error) {
        console.log('获取可分配房间列表:', error)
      }
    },

    /**
     * 智能分房
     */
    async doAllot({ added }, room) {
      const { element } = added
      const orderItemId = element.id
      const roomId = room.id
      try {
        const url = `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/allot`
        await this.$http.put(url, {
          roomId,
          orderItemId,
        })
        this.$message.success('分配成功')
      } catch (error) {
        console.log('CTL = > 分配不成功')
      }
      // 刷新数据
      this.GetEnbaleAllot()
      this.search()
    },

    alertModal() {
      this.showAllot = true
    },
    /**
     * 智能分房
     */
    async autoAllot() {
      try {
        const url = `/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${this.checkType}/auto_allot`
        await this.$http.post(url, {
          checkIn: moment(this.values[0]).format('YYYY-MM-DD'),
          checkOut: moment(this.values[1]).format('YYYY-MM-DD'),
          isSexSame: this.isSexSame,
          isWorkSame: this.isWorkSame,
        })
        this.load()
        this.showAllot = false
      } catch (error) {}
    },

    /**
     * 下载分房信息
     */
    async download() {
      let url = `/activities/${this.activityId}/hotels/${this.hotelId}/export`
      try {
        let result = await this.$http.get(url)
        let el = document.createElement('a')
        el.href = result.url
        el.click()
        el.target = '_blank'
        el.remove()
      } catch (error) {
        console.log('download throw error')
      }
    },

    /**
     * 构建模板
     */
    buildOrderTemplate(rst) {
      return rst.map((item) => {
        return {
          id: item.id,
          orderType: item.orderType,
          isCheckIn: item.isCheckIn,
          attendees: item.attendees.map((_item) => {
            return {
              id: _item.id,
              name: _item.name,
              sex: _item.sex,
              job: _item.job,
              work: _item.work,
            }
          }),
        }
      })
    },

    /**
     * 检查是否有入住标记
     */
    canShowCheckInIcon(room) {
      const isCheckIn = room.orderItems.some((item) => {
        return item.isCheckIn
      })
      return isCheckIn
    },

    async checkIn(room) {
      const isCheckIn = this.canShowCheckInIcon(room)
      try {
        const url = `/activities/${this.activityId}/hotels/${this.hotelId}/rooms/${room.id}`
        await this.$http.put(url, {
          isCheckIn: !isCheckIn,
        })
        this.load()
      } catch (error) {}
    },

    //移除订单
    async remove(orderItem) {
      try {
        const url = `/activities/${this.activityId}/hotels/${this.hotelId}/order_items/${orderItem.id}/allot`
        await this.$http.delete(url)
        this.load()
      } catch (error) {}
    },

    // 编辑房间
    HandleEdit(room) {
      document.getElementById('div-' + room.id).setAttribute('hidden', true)
      var e = document.getElementById('input-' + room.id)
      e.removeAttribute('hidden')
      e.value = room.name
      e.focus()
    },

    async HandleEditFinish(room) {
      document.getElementById('div-' + room.id).removeAttribute('hidden')
      document.getElementById('input-' + room.id).setAttribute('hidden', true)
      let roomName = document.getElementById('input-' + room.id).value
      try {
        await this.$http.put(`/activities/${this.activityId}/hotels/${this.hotelId}/room_types/${room.type}/rooms/${room.id}`, {
          name: roomName,
        })
        this.GetEnbaleAllot()
      } catch (error) {}
    },
  },
  mounted() {},
}
</script>

<style lang="less" scoped>
.wrap {
  width: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  margin-bottom: 24px;
  .wrap-left {
    flex: 1;
    padding-left: 14px;
    overflow-y: scroll;
    .date-wrap {
      padding: 7px 0;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .none-wrap.date-wrap {
      padding: 0px;
    }
    .label {
      font-size: 14px;
      font-weight: 500;
      color: #333333;
      margin-right: 16px;
      margin-top: 14px;
      margin-bottom: 14px;
    }
  }
  .wrap-right {
    width: 300px;
    background-color: #fafafa;
    padding: 7px;
    overflow-y: scroll;
    .book-whole-room {
      .name-wrap {
        width: 100%;
        min-height: 100px;
        margin-top: 5px;

        .v-draggable-1 {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          flex-wrap: wrap;
          padding: 5px;

          .name {
            margin: 16px 20px;
            display: flex;
            flex-direction: column;
          }
          .room-item {
            width: 122px;
            border: 1px solid #d8d8d8;
            text-align: center;
            margin: 5px;
          }
        }
      }
    }
    .book-single-bed {
      margin-bottom: 10px;
      .name-wrap {
        width: 100%;
        min-height: 100px;
        margin-top: 5px;

        .v-draggable-1 {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-start;
          flex-wrap: wrap;
          padding: 5px;

          .item {
            border: 1px solid #d8d8d8;
            text-align: center;
            padding: 5px 18px;
            margin: 5px;
          }
        }
      }
    }
  }
}

.item-drag:hover {
  cursor: pointer;
}
.item-drag {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.sign-border {
  border: 1px solid #ffa33e;
}
.check-in-style {
  color: #ffa33e;
}
.title {
  color: #f60f0f;
  font-size: 14px;
  font-weight: 400;
}
.state-box {
  margin: 30px 0;
  .left {
    font-size: 14px;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.65);
    background-color: #fff;
    border: 1px solid #d9d9d9;
    padding: 28px 0px;
    text-align: center;
    display: inline-block;
    margin-right: 12px;
    vertical-align: top;
    width: 50%;
  }
  .right {
    display: inline-block;
    width: 45%;
    p {
      font-size: 14px;
      border-radius: 2px;
      color: rgba(0, 0, 0, 0.65);
      background-color: #fff;
      border: 1px solid #d9d9d9;
      padding: 10px 0;
      text-align: center;
    }
  }
}
.room-num {
  margin-top: 14px;
  display: inline-block;
  margin-right: 24px;
  span {
    height: 32px;
    line-height: 32px;
    padding: 0 15px;
    font-size: 14px;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.65);
    background-color: #fff;
    border: 1px solid #d9d9d9;
    display: inline-block;
    margin-top: 0;
  }
}
.room-wrap {
  width: 100%;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  .had-allot {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    min-height: 120px;
  }
  .not-allot {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .room {
    width: 122px;
    min-height: 108px;
    border: 1px solid #d8d8d8;
    margin: 15px 12px;
    position: relative;
    .room-name {
      height: 32px;
      width: 100%;
      background-color: #f4f4f4;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      .check-circle {
        position: absolute;
        right: 6px;
        top: 7px;
      }

      .room-input {
        background-color: #ffa33e;
        text-align: center;
        border-radius: 0px;
        border: none;
        border-bottom: 1px solid #333;
      }
    }
    .had-sharking-room-name {
      color: #fff;
      background-color: #f60f0f;
    }

    .v-draggable {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 10px 5px;
      .item {
        width: 80%;
        border: 1px solid #d8d8d8;
        text-align: center;
        margin-bottom: 5px;
        position: relative;
      }
    }

    .room-lock {
      min-height: 80px;
      display: flex;
      flex: 1;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .room-unlock {
      position: absolute;
      display: block;
      top: 32px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      align-items: center;
      justify-content: center;
    }
  }

  .red {
    color: #f60f0f;
  }
}

.icon {
  background-image: url('~@/assets/close.png');
  background-size: 100%;
  position: absolute;
  width: 0.5em;
  height: 0.5em;
  top: 1px;
  right: 1px;
}
.btn {
  margin-right: 1px;
  margin-top: 14px;
  & + .btn {
    margin-top: 0px;
  }
  &:focus {
    color: #fff;
    background-color: #f60f0f;
  }
}
.date {
  margin-right: 10px;
  border: none;
  background-color: #fff;
}

//modal弹框
.modal-wrap {
  display: flex;
  flex-direction: column;
  .modal-wrap-child {
    margin-top: 16px;
    display: flex;
    flex-direction: row;

    .title-1 {
      margin-right: 16px;
    }
    & + .modal-wrap-child {
      margin-bottom: 16px;
    }

    .modal-wrap-condition {
      flex: 1;
      display: flex;
      flex-direction: column;
      .switch {
        margin-top: 8px;
        margin-right: 20px;
        flex: 1;
        display: flex;
        justify-content: space-between;
        //border: 1px solid #d8d8d8;
      }
    }
  }
}

.desc-label {
  font-size: 16px;
  color: #333333;
  font-weight: 600;
  margin: 16px 0;
}

.tooltip {
  display: flex;
  flex-direction: column;
  .span-inner-block {
    display: inline-block;
    margin: 5px 0;
  }
}
</style>

<style lang="less" scoped>
.ant-radio-button-wrapper {
  border: 1px solid transparent;
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

.ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background-color: #fff;
  color: #f60f0f;
  border: 1px solid #f60f0f;
  box-shadow: 0px 0 0 0 #f60f0f;
  border-radius: 0px;
}

.wrap-left::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.wrap-left::-webkit-scrollbar-button {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-left::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-left::-webkit-scrollbar-track-piece {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-left::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-left::-webkit-scrollbar-corner {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-left::-webkit-scrollbar-resizer {
  background-color: rgba(0, 0, 0, 0);
}

.wrap-right::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.wrap-right::-webkit-scrollbar-button {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-right::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-right::-webkit-scrollbar-track-piece {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-right::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-right::-webkit-scrollbar-corner {
  background-color: rgba(0, 0, 0, 0);
}
.wrap-right::-webkit-scrollbar-resizer {
  background-color: rgba(0, 0, 0, 0);
}
</style>
