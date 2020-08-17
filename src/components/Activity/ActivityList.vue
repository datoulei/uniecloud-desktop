<template>
  <div id="wrapper">
    <a-row>
      <a-col :span="12">
        <a-select defaultValue="全部" style="text-align: center; text-align-last: center; width: 88px;" @change="handleChange">
          <a-select-option :value="`1,2,3`">全部</a-select-option>
          <a-select-option :value="1">待进行</a-select-option>
          <a-select-option :value="2">进行中</a-select-option>
          <a-select-option :value="3">已结束</a-select-option>
        </a-select>
      </a-col>
      <a-col :span="12">
        <a-input class="search" size="large" type="text" placeholder="搜索活动" v-model="name" @keydown.enter="search">
          <a-icon slot="prefix" type="search" :style="{ color: 'rgba(0,0,0,.25)' }" @click="search" />
        </a-input>
      </a-col>
    </a-row>
    <div v-for="data in loadData" :key="data.id">
      <a-card class="card" :class="{ progress: data.status === 2 }">
        <a-row>
          <a-col :span="22">
            <label class="title">{{ data.name }}</label>
          </a-col>
          <a-col :span="2">
            <span class="activity-status">{{ getNameByStatus(data.status) }}</span>
          </a-col>
        </a-row>
        <a-row style="padding-top: 24px;">
          <a-col :span="19" class="date-local">
            <a-icon type="clock-circle" />
            {{ moment(data.startTime).format('YYYY年MM月DD日 HH:mm') }}&nbsp; - &nbsp;{{ moment(data.endTime).format('YYYY年MM月DD日 HH:mm') }}
            <br />
            <a-icon type="environment" />
            {{ data.address }}
            <br />
            <!-- <a-icon type="user" /> -->

            <div class="limit">
              <img src="~@/assets/people.png" /><span>{{ data.peopleNumber }}人</span>
            </div>
          </a-col>
          <a-col :span="5">
            <div class="activity-btn">
              <!-- <a-button
                v-if="accoutType === 1 && data.status !== 2"
                type="primary"
                class="sign-2"
                style="margin-right: 5px;"
                @click="HandleToDesign(data)"
                >内容设计</a-button
              > -->
              <!-- 只有进行中才可以签到，状态为2 -->
              <a-button :class="[data.status === 1 ? 'sign-1' : 'sign-2']" type="primary" @click="handleGetSites(data)">开始签到</a-button>
              <!-- <a-button v-if="data.status === 1" class="sign-1" type="primary"
                >开始签到</a-button
              > -->
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>
    <a-locale-provider :locale="zh_CN">
      <a-pagination v-show="showPagination" v-model="current" :total="total" @change="onChange" :style="{ 'margin-bottom': '24px' }" />
    </a-locale-provider>
    <CustomModal :visible="isShow" @cancel="HandleCancel" title="选择签到" @ok="HandleOk" width="360px">
      <a-list itemLayout="horizontal" :dataSource="sites">
        <a-list-item slot="renderItem" slot-scope="item" @click="handleClick(item)" class="list-item">
          <span v-if="item.id === siteId" class="line item-red">{{ item.name }}</span>
          <span v-else class="line">{{ item.name }}</span>

          <a-icon type="check-circle" theme="filled" class="a-list-item-icon" slot="actions" v-if="siteId === item.id" />
          <a-icon type="check-circle" slot="actions" theme="filled" v-else />
        </a-list-item>
      </a-list>
    </CustomModal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import CustomModal from '@/components/CustomModal/CustomModal'
const ipcRenderer = require('electron').ipcRenderer
import db from '../../db'
import offlinedb from '../../offlinedb'
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN'
export default {
  name: 'landing-page',
  data() {
    return {
      name: '',
      itemData: {},
      status: '1,2,3',
      loadData: [], // 渲染的数据
      queryParam: {}, // 查询参数
      current: 1, // 默认第一页
      total: 1, // 总条数
      isShow: false,
      sites: [], // 签到地点
      siteId: 0,
      zh_CN,
    }
  },
  created() {
    ipcRenderer.send('close-extra') // 关闭扩展屏幕

    this.$store.commit('SET_SITE_ID', 0)
    this.initData().then(async () => {
      // 签到账号默认选中第一个签到点
      if (this.accoutType !== 1) {
        const useType = db.get('sites').value()
        if (useType === 2) {
          const siteList = offlinedb.getDB('sites').get('siteList').value()
          this.$store.commit('SET_SITE_NAMES', siteList.length === 0 ? {} : siteList.rows[0])
          return
        }

        // 获取签到地点
        try {
          const result = await this.$http.get(`/activities/${this.loadData[0].id}/sign-sites`)
          this.$store.commit('SET_SITE_NAMES', result.rows)
        } catch (error) {}
      }
    })
  },
  computed: {
    ...mapGetters(['UserInfo']),
    accoutType() {
      return this.UserInfo.type
    },
    showPagination() {
      return this.loadData.length < this.total
    },
  },
  components: {
    CustomModal,
  },
  methods: {
    moment,

    handleChange(value) {
      this.status = value
      this.initData()
    },
    search() {
      this.initData()
    },
    async initData(obj) {
      // 离线模式
      const useType = await db.get('useType').value()
      if (useType === 2) {
        const activityList = await offlinedb.getDB('activities').get('activityList').value()

        const { list, count } = this.findBycondition(activityList.rows, this.status, this.name)
        this.loadData = list
        this.total = count
        return
      }

      // 在线模式
      const queryParam = {
        name: this.name,
        status: this.status,
      }
      const result = await this.$http.get('/activities', {
        params: {
          ...Object.assign(queryParam, obj),
        },
      })
      this.loadData = result.rows
      this.total = result.count
    },

    // 离线根据条件状态查找
    // list 活动列表
    // status 活动的状态 1：待进行,2：进行中,3：结束 '1,2,3':全部
    // keyword 搜索框
    findBycondition(list, status, keyword) {
      // 过滤关键字
      let tempList = list.filter((item) => {
        return item.name.indexOf(keyword) === 0
      })

      if (status === '1,2,3') {
        return {
          list: tempList.slice((this.current - 1) * 10, this.current * 10),
          count: tempList.length,
        }
      } else {
        tempList = tempList.filter((item) => item.status === Number(status))
        return {
          list: tempList.slice((this.current - 1) * 10, this.current * 10),
          count: tempList.length,
        }
      }
    },

    onChange(current) {
      this.current = current
      this.initData({ offset: current })
    },

    // 显示弹框
    async handleGetSites(data) {
      // 离线
      const useType = await db.get('useType').value()
      if (useType === 2) {
        const siteList = await offlinedb.getDB('sites').get('siteList').value()
        this.sites = siteList.rows
        this.itemData = data
        this.isShow = true
        return
      }

      // 获取签到地点
      try {
        const result = await this.$http.get(`/activities/${data.id}/sign-sites`)
        this.sites = result.rows
        this.itemData = data
        this.isShow = true
      } catch (error) {}
    },
    HandleToDesign(data) {
      this.$router.push({
        name: 'cardDesign',
        params: {
          activityId: data.id,
        },
      })
    },
    getNameByStatus(key) {
      switch (key) {
        case 1:
          return '待进行'
        case 2:
          return '进行中'
        case 3:
          return '已结束'
        default:
          return ''
          break
      }
    },
    HandleCancel() {
      this.siteId = 0
      this.isShow = false
    },
    HandleOk() {
      if (this.siteId === 0) {
        this.$message.error('请选择签到地点')
        return
      }
      this.$store.commit('SET_ACTIVITY_ID', this.itemData.id)
      document.getElementById('myActivity').click()
    },
    handleClick(item) {
      this.siteId = item.id
      this.$store.commit('SET_SITE_ID', item.id)
      this.$store.commit('SET_SITE_INFO', item)
      this.$store.commit('SET_SITE_NAMES', [item])
    },
  },
}
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/deep/.ant-menu-item-group-list {
  .ant-menu-item {
    padding-left: 34px !important;
    &:active {
      background: #f7f7f7;
    }
  }
}

#wrapper {
  width: 100%;
}
.ant-input-lg {
  height: 32px;
}

.search {
  width: 227px;
  margin-right: 0;
  float: right;
}
.title {
  height: 32px;
  font-size: 24px;

  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  line-height: 32px;
}

.sign-2 {
  position: relative;
  width: 104px;
  height: 40px;
  background: rgba(246, 15, 15, 1);
  border-radius: 4;
  margin-right: 0px;
}
.sign-1 {
  margin-right: 0px;
  position: relative;
  width: 104px;
  height: 40px;
  background: rgba(246, 15, 15, 1);
  border-radius: 4px;
  opacity: 0.2;
}
.card {
  margin-top: 5px;
  margin-bottom: 5px;
  background: rgba(255, 255, 255, 1);
  border-radius: 4px;
  border: 1px solid rgba(229, 229, 229, 1);
  border-left-width: 4px;

  .activity-status {
    color: #666;
    text-align: right;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    font-size: 12px;
    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: #b8b8b8;
      margin-right: 6px;
    }
  }

  &.progress {
    border-left-color: rgba(246, 15, 15, 1);
    .activity-status {
      color: #f60f0f;
      &::before {
        background-color: #f60f0f;
      }
    }
  }
}
.date-local {
  font-size: 14px;
  font-weight: 400;
  color: rgba(153, 153, 153, 1);
  line-height: 20px;
}
.a-list-item-icon {
  color: #f60f0f;
  font-size: 14px;
}
.item-red {
  color: #f60f0f;
}
.line {
  display: inline-block;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.activity-btn {
  display: flex;
  flex-direction: row-reverse;
}
.limit {
  //background-color: #f60f60;
  align-items: center;
  //justify-content: center;
  display: flex;
  height: 24px;
}
img {
  width: 12px;
  height: 12px;
  margin-right: 4px;
}

.list-item {
  height: 46.8px;
}
.list-item:hover {
  cursor: pointer;
}
</style>
