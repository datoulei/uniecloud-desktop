<template>
  <div class="wrapper">
    <a-row class="info-flex">
      <a-col :span="12" class="basic-info-left">
        <div class="basic-item" :style="{ height: maxHeight, 'max-height': maxHeight }">
          <h3>参会人员报名提交信息</h3>
          <div class="flex-box m-t-16">
            <div class="label">头像</div>
            <img :src="data.avatar || 'https://uniecloud.oss-cn-shenzhen.aliyuncs.com/default_avatar.jpg'" alt="" class="avatar" />
          </div>
          <div class="flex-box m-t-16">
            <div class="label">姓名</div>
            <div>{{ data.name }}</div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">手机号码</div>
            <div>{{ data.mobile }}</div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">性别</div>
            <div>{{ ['女', '男'][data.sex] || '' }}</div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">单位</div>
            <div>{{ data.work }}</div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">职位</div>
            <div>{{ data.job }}</div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">身份证</div>
            <div>{{ data.idCard }}</div>
          </div>

          <!-- <div class="flex-box m-t-16" v-for="(item, index) in fieldsFilter" :key="index">
            <div class="label">{{ item.field.name }}</div>
            <div>{{ item.value }}</div>
          </div> -->
          <div class="flex-box m-t-16" v-for="item in fields" :key="item.id">
            <div class="label">{{ item.name }}</div>
            <div>
              <span>{{ data[item.id] }}</span>
            </div>
          </div>
          <h3 class="m-t-20">分组信息</h3>
          <div class="flex-box m-t-16">
            <div class="label">组别</div>
            <div>{{ data.group ? data.group.name : '' }}</div>
          </div>
          <h3 class="m-t-20">门票信息</h3>
          <div class="flex-box m-t-16">
            <div class="label">来源</div>
            <div>{{ originMap[data.origin] }}</div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">票种</div>
            <div v-text="$lodash.get(data, 'ticket.name')"></div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">报名时间</div>
            <div v-text="moment(data.createdAt).format('YYYY/MM/DD HH:mm')"></div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">邀请码</div>
            <div v-text="$lodash.get(data, 'inviteCode.code')"></div>
          </div>
          <div class="flex-box m-t-16">
            <div class="label">签到码</div>
            <div v-text="$lodash.get(data, 'signCode')"></div>
          </div>
        </div>
      </a-col>
      <a-col v-show="hasRightContent" :span="12" class="basic-info-right">
        <div class="basic-item" :style="{ height: maxHeight, 'max-height': maxHeight }">
          <div v-for="(item, index) in seats" :key="item.id">
            <h3 class="m-t-20">场地信息{{ index + 1 }}</h3>
            <div class="flex-box m-t-16">
              <div class="label">场地名称</div>
              <div>{{ item.place.name }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">座位号</div>
              <div v-if="[3, 4].includes(item.seatType)">{{ item.areaOrder + 1 }}区 {{ item.tableOrder + 1 }}桌 {{ item.seatOrder + 1 }}座</div>
              <div v-else>{{ item.areaOrder + 1 }}区 {{ item.rowOrder + 1 }}排 {{ item.seatOrder + 1 }}座</div>
            </div>
          </div>
          <div v-for="(item, index) in hotels" :key="item.id">
            <h3 class="m-t-20">酒店信息{{ index + 1 }}</h3>
            <div class="flex-box m-t-16">
              <div class="label">预订酒店</div>
              <div>{{ item.hotelName }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">预订房型</div>
              <div>{{ item.roomTypeName }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">分房房间号</div>
              <div>{{ item.roomName }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">入住时间</div>
              <div>{{ item.checkIn }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">退房时间</div>
              <div>{{ item.checkOut }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">签到状态</div>
              <div>{{ item.isSign ? '已签到' : '未签到' }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">房间是否有同住人</div>
              <div>{{ item.hasRoommate ? '是' : '否' }}</div>
            </div>
          </div>
          <div v-for="(item, index) in traffic" :key="item.id">
            <h3 class="m-t-20 not-top">交通行程{{ index + 1 }}</h3>
            <div class="flex-box m-t-16">
              <div class="label">交通行程名称</div>
              <div>{{ item.name }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">交通工具类型</div>
              <div>{{ traficTypeMap[item.type] }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">出发地</div>
              <div>{{ item.from }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">目的地</div>
              <div>{{ item.to }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">预计到达时间</div>
              <div>{{ item.toDate }} {{ item.toTime }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">联系人</div>
              <div>{{ item.contact }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">行程备注</div>
              <div>{{ item.remark }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">联系电话</div>
              <div>{{ item.contactPhone }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">签到状态</div>
              <div>{{ item.signTime ? '已签到' : '未签到' }}</div>
            </div>
          </div>
          <div v-for="(item, index) in schedules" :key="item.id">
            <h3 class="m-t-20">日程信息{{ index + 1 }}</h3>
            <div class="flex-box m-t-16">
              <div class="label">会场</div>
              <div>{{ item.room.name }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">日期</div>
              <div>{{ moment(item.date.date).format('YYYY-MM-DD') }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">时间段</div>
              <div>{{ moment(item.startTime).format('HH:mm') }}-{{ moment(item.endTime).format('HH:mm') }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">日程名称</div>
              <div>{{ item.name }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">简介</div>
              <div>{{ item.intro }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">身份</div>
              <div>{{ item.ScheduleGuest.identity }}</div>
            </div>
            <div class="flex-box m-t-16">
              <div class="label">日程备注</div>
              <div>{{ item.remark }}</div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import db from '../../db'
import offlinedb from '../../offlinedb'
const ticketTypeMap = {
  0: '公开门票',
  1: '审核门票',
  2: '邀约门票',
}

const traficTypeMap = {
  0: '飞机',
  1: '高铁/火车',
  2: '邮轮',
  3: '地面交通',
}

const originMap = {
  1: '网站报名',
  2: '中台导入',
  3: '中台添加',
  4: '签到添加',
}
export default {
  name: 'attendees-detail',

  data() {
    const activityId = this.$route.params.activityId // 活动id
    const id = this.$route.params.id // 参会人员id

    return {
      useType: 1, //默认在线
      ticketTypeMap,
      traficTypeMap,
      originMap,
      activityId,
      id,
      data: {},
      fields: [],
    }
  },
  created() {
    this.useType = db.get('useType').value()
    this.getActivityFields().then((res) => {
      this.fields = res
    })
    this.handleGetAttendeeDetail()
  },
  computed: {
    fieldsFilter() {
      if (this.data.fieldValues) {
        console.log(this.data.fieldValues)
        return this.data.fieldValues.filter((item) => item.field)
      } else {
        return []
      }
    },
    schedules() {
      try {
        return this.data.schedules || []
      } catch (error) {
        return []
      }
    },
    traffic() {
      try {
        return this.data.traffic || []
      } catch (error) {
        return []
      }
    },
    hotels() {
      try {
        return this.data.hotels || []
      } catch (error) {
        return []
      }
    },
    seats() {
      try {
        return this.data.seats || []
      } catch (error) {
        return []
      }
    },
    hasRightContent() {
      try {
        return this.traffic.length > 0 || this.hotels.length > 0 || this.schedules.length > 0 || this.seats.length > 0
      } catch (error) {
        return false
      }
    },
    maxHeight() {
      const height = this.$store.state.user.windowHeight
      if (height > 700) {
        return Number(height - 160) + 'px'
      } else {
        return 540 + 'px'
      }
    },
    siteId() {
      return this.$store.state.user.siteId
    },
  },
  methods: {
    moment,

    async handleGetAttendeeDetail() {
      try {
        // 离线
        if (this.useType === 2) {
          const bool = await offlinedb.getDB('attendeeDetail').has('list').value()
          if (bool) {
            let details = await offlinedb.getDB('attendeeDetail').get('list').value()
            let attendeeArray = details.filter((detail) => detail.id === this.id)

            const avatar = await offlinedb.getDB(attendeeArray[0].id, this.siteId).get('base64').value()
            attendeeArray[0].avatar = avatar
            this.data = attendeeArray[0]
          }
          return
        }
        const uri = `/activities/${this.activityId}/attendees/${this.id}`
        this.data = await this.$http.get(uri)
      } catch (error) {
        this.$message.error('未成功获取参会人员信息')
      }
    },
    async getActivityFields() {
      try {
        if (this.useType === 2) {
          return await offlinedb.getDB('fields').get('fields').value()
        }
        const url = `/activities/${this.activityId}/fields`
        const result = await this.$http.get(url, {
          query: {
            silent: true,
          },
        })
        return result
      } catch (error) {
        console.log('TCL -> getActivityFields throw Exception:' + error)
        return
      }
    },
  },
}
</script>

<style scoped lang="scss">
.label {
  width: 140px;
  text-align: right;
  margin-right: 32px;
}
.wrapper {
  width: 100%;
}

.flex-box {
  display: flex;
}
.m-t-16 {
  margin-top: 16px;
}

.basic-info-left {
  padding-right: 8px;
}
.basic-info-right {
  padding-left: 8px;
}

.basic-item {
  padding: 0 8px;
  background-color: #e5e5e5;
  overflow: auto;
  .avatar {
    width: 30px;
    height: 30px;
  }
}

.basic-item::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.basic-item::-webkit-scrollbar-button {
  background-color: rgba(0, 0, 0, 0);
}
.basic-item::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
.basic-item::-webkit-scrollbar-track-piece {
  background-color: rgba(0, 0, 0, 0);
}
.basic-item::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
}
.basic-item::-webkit-scrollbar-corner {
  background-color: rgba(0, 0, 0, 0);
}
.basic-item::-webkit-scrollbar-resizer {
  background-color: rgba(0, 0, 0, 0);
}
</style>
