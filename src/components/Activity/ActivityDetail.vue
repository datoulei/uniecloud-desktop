<template>
  <div class="root">
    <div class="root-child-1">
      <a-card class="a-card-1">
        <div class="a-card-1-top">
          <div class="activity-title">{{ activityInfo.name }}</div>
          <div class="activity-status">
            {{ getNameByStatus(activityInfo.status) }}
          </div>
        </div>

        <div class="a-card-1-middle">
          签到点：
          <a-dropdown :trigger="['click']" placement="bottomLeft">
            <a class="ant-dropdown-link" href="#">
              <label class="addressTitle">{{ currentSite.name }}</label>
              <a-icon type="down" />
            </a>
            <a-menu slot="overlay">
              <a-menu-item v-for="data in sites" :key="data.id" style="width: 320px;" @click="checkSignAddress(data)">
                <div>
                  <span class="line">{{ data.name }}</span>
                  <span class="icon">
                    <a-icon type="check-circle" class="a-list-item-icon" slot="actions" style="margin-rigth: 0px;" />
                  </span>
                </div>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </div>
        <div class="a-card-1-count">
          <div class="sign-total" @click="HandleToAttendeeList(-1)">
            <span class="num">{{ signStatistics.total }}</span>
            <span>参会人数</span>
          </div>
          <a-divider type="vertical" style="height: 24px;" />
          <div class="sign-people" @click="HandleToAttendeeList(1)">
            <span class="num">{{ signStatistics.signCount }}</span>
            <span>已签到</span>
          </div>
          <a-divider type="vertical" style="height: 24px;" />
          <div class="sign-percent">
            <span class="num">{{ signStatistics.percent }}%</span>
            <span>签到率</span>
          </div>
        </div>
        <div class="view-sign-text" v-if="accoutType === 1 || this.UserInfo.enableAttendeeManage === true">
          <img src="~@/assets/sign.png" />
          <span @click="HandleToAttendeeList(-1)" style="cursor: pointer;">查看签到名单</span>
        </div>
      </a-card>
      <a-card class="a-card-2">
        <!-- 直接签到 -->
        <div class="direct-sign-div" v-if="buttonGroup === 1">
          <!-- RFID读卡器 身份证读卡器 -->
          <div>
            <span class="font-span">
              <img src="~@/assets/connect.png" />
              RFID读卡器
            </span>
            <span class="font-span"> <img src="~@/assets/unconnect.png" />身份证读卡器 </span>
          </div>
          <!-- 签到栏 -->
          <div class="search-group-div">
            <!-- 签到 -->
            <div class="search-div">
              <a-input-search
                v-model="keyword"
                placeholder="请输入签到码/手机号/手机号后四位/姓名"
                enterButton="签到"
                size="large"
                @search="HandleOnSearch"
                enter-button="Search"
              />
            </div>
            <!-- 二维码 -->
            <div class="font-div">
              <img src="~@/assets/qr.png" />
              <span>扫描二维码</span>
            </div>
            <!-- 人脸识别 -->
            <div class="font-div">
              <!-- <img src="~@/assets/face.png" @click="showFaceModal(2)" /> -->
              <img src="~@/assets/face.png" @click="$refs.cameraModal.open()" />
              <span class="font-desc">人脸识别</span>
            </div>
          </div>
        </div>
      </a-card>
      <!-- 检索签到弹框 -->
      <SignModal :visible="searchSignModal" :title="searchModalTittle" width="80%" @cancel="handleClose" :maskClosable="false" :destroyOnClose="true">
        <a-table :columns="columns" :dataSource="attendeeListData" :scroll="{ x: true }" rowKey="id" :pagination="false">
          <img
            v-if="avatar && avatar !== ''"
            slot-scope="avatar"
            slot="avatar"
            style="width: 24px; height: 24px; border-radius: 50%; margin: auto;"
            :src="avatar"
            target="avatar"
          />
          <img v-else slot="avatar" style="width: 24px; height: 24px; border-radius: 50%; margin: auto;" src="~@/assets/default_avatar.jpg" target="avatar" />

          <a-button type="primary" slot-scope="attendees" slot="action" :style="{ 'margin-left': '16px' }" @click="HandleOnSign(attendees.mobile)"
            >签到</a-button
          >
        </a-table>
        <div class="pagination">
          <a-locale-provider :locale="zh_CN">
            <a-pagination
              @change="handlePageChange"
              :current="currentPage"
              :total="total"
              :showTotal="(total) => `共有 ${total} 条数据`"
              :pageSizeOptions="['10', '20', '30', '50']"
              showSizeChanger
              @showSizeChange="onShowSizeChange"
              :defaultPageSize="10"
            />
          </a-locale-provider>
        </div>
      </SignModal>

      <!-- 签到结果 -->
      <CustomModal
        :visible="signResult"
        @cancel="HandleCancel('signResult')"
        :title="modalTittle"
        @ok="HandleOk"
        width="46%"
        :okText="signStatus !== 2 ? '确认签到' : '打印胸卡'"
        :hiddenCancel="false"
        :maskClosable="false"
        :destroyOnClose="true"
      >
        <div class="custom-modal-wrap" :style="{ 'max-height': modalMaxHeight }">
          <div class="sign-result">
            <div class="sign-result-header">
              <div class="sign-result-header-userinfo">
                <div class="sign-result-header-userinfo-avatar">
                  <img
                    v-if="signAttendee.avatar && signAttendee.avatar !== ''"
                    :src="signAttendee.avatar"
                    style="width: 40px; height: 40px; border-radius: 20px;"
                  />
                  <img v-else src="~@/assets/default_avatar.jpg" style="width: 40px; height: 40px; border-radius: 20px;" />
                </div>
                <div class="sign-result-header-userinfo-content">
                  <span class="sign-result-header-userinfo-content-username">{{ signAttendee.name }}</span>
                  <br />
                  <span class="sign-result-header-userinfo-content-mobile">{{ hiddenMobile(signAttendee.mobile) }}</span>
                </div>
              </div>
              <div style="display: none;">
                <Qrcode ref="qrcode" :options="{ width: 256, margin: 0 }" :value="qrcode" />
              </div>
              <a-divider type="vertical" style="width: 1px; height: 24px; background: rgba(238, 238, 238, 1);" />
              <div class="sign-result-header-content">
                {{
                  signStatus > 0
                    ? signStatus === 1
                      ? '已签到'
                      : signAttendee.signRecord && signAttendee.signRecord.length > 1
                      ? '重复签到'
                      : '签到成功'
                    : '未签到'
                }}
              </div>
            </div>
            <a-divider />
            <!-- 签到显示信息 -->
            <div :class="['sign-result-body', signStatus === 2 ? 'm-b-24' : '']">
              <div v-for="item in afterSignFields" :key="item.key" class="sign-column">
                <div class="sign-result-body-row">
                  <div class="sign-result-body-row-title">
                    {{ item.name }}
                  </div>
                  <div class="sign-result-body-row-content">
                    {{ item.value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 横线 -->
            <a-divider style="width: 100%;" v-if="signStatus === 1" />

            <!-- 签到记录 -->
            <div class="sign-record" v-if="signStatus === 1">
              <div class="sign-record-title">
                <div>签到记录</div>
                <div class="record-opt" @click="handleRecordActions" id="record-actions">
                  展开
                </div>
              </div>
              <div>
                <div v-for="record in records" :key="record.id">
                  <div class="record-item">
                    <div class="sign-record-place">{{ record.site.name }}</div>
                    <div class="sign-record-remark">{{ record.remark }}</div>
                    <div class="sign-record-date">
                      {{ moment(record.createdAt).format('YYYY.MM.DD HH:mm:ss') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <a-divider style="width: 100%;" v-if="[0, 1].includes(signStatus)" />
            <div v-show="signStatus <= 1" class="sign-input-wrap">
              <span class="sign-remark-label">签到备注：</span>
              <div><a-input id="remark" :style="{ height: '28px' }" /></div>
            </div>

            <div class="bind-xcard" v-if="signStatus === 2 && setting.enableRfid">
              <div>
                <img src="~@/assets/xcard.png" alt />
              </div>
              <div class="search">
                <a-input-search ref="rfid" placeholder="输入胸卡电子码手动绑定" v-model="RFID" @search="bindRFID">
                  <a-button slot="enterButton" style="border-color: red; color: red;">绑定RFID卡</a-button>
                </a-input-search>
              </div>
            </div>
          </div>

          <div class="button-group" slot="footer" slot-scope="{ ok }" v-if="signStatus !== 2 && setting.signByFace">
            <a-button class="a-button" type="primary" @click="HandleSignAndCollection">签到并采集人像</a-button>
            <a-button class="a-button" @click="ok">直接签到</a-button>
          </div>
        </div>
      </CustomModal>

      <!-- 签到失败 -->
      <CustomModal
        :visible="signFaild"
        @cancel="HandleCancel('signFaild')"
        :title="modalTittle"
        @ok="HandleCancel('signFaild')"
        width="36%"
        okText="确定"
        :hiddenCancel="true"
        :status="signStatus"
        :maskClosable="false"
        :destroyOnClose="true"
      >
        <div class="sign-result">
          <div class="sign-result-faild">签到失败</div>
          <div class="sign-result-msg">{{ errorMessage }}</div>
        </div>
      </CustomModal>

      <!-- 人脸签到 -->
      <CustomModal
        :visible="faceSign"
        @cancel="HandleCancel('faceSign')"
        title="采集人像"
        @ok="confirmPhoto"
        width="360px"
        okText="确定"
        :hiddenCancel="false"
        :maskClosable="false"
        :destroyOnClose="true"
      >
        <div class="sign-result">
          <div ref="camera" id="cam-area" class="cam-area"></div>
          <br />
          <div style="text-align: center;">
            <img src="~@/assets/carema.png" @click="showCarema" />
          </div>
        </div>
      </CustomModal>
    </div>
    <CameraModal ref="cameraModal" />
  </div>
</template>

<script>
import SignModal from '@/components/CustomModal/SignModal'
import CustomModal from '@/components/CustomModal/CustomModal'
import CameraModal from '@/components/Activity/CameraModal'
import WebCamera from 'webcamjs'
import { mapGetters } from 'vuex'
import moment from 'moment'
import { webContents } from 'electron'
import Qrcode from '@chenfengyuan/vue-qrcode'
const fs = require('fs')
import db from '../../db'
import offlinedb from '../../offlinedb'
import dayjs from 'dayjs'
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN'
const ipcRenderer = require('electron').ipcRenderer
import ActivityDetail from '../../../static/js/ActivityDetail.js'
export default {
  data() {
    return {
      useType: 1,
      activityId: this.$route.params.id,
      currentSite: {
        id: this.$route.query.addressId,
        name: '',
        fields: [],
      },
      activityInfo: {}, // 活动信息
      sites: [], // 签到地点
      signStatistics: {
        signCount: 0, // 签到人数
        total: 0, // 参会人数
        percent: 0, // 签到百分比
      },
      buttonGroup: 1,
      searchSignModal: false, // 是否显示检索签到
      signFaild: false, // 是否显示签到失败
      signResult: false, //签到结果
      faceSign: false, //人脸
      enabled: true,
      //attendeeName: '', // 检索词
      keyword: '', //直接签到检索词
      errorMessage: '', // 签到失败提示语
      deviceName: '', //打印机名字
      cardTemplate: {}, //胸卡模板
      signAttendee: {}, // 签到人员信息
      zh_CN,
      RFID: '', // RFID码
      attendeeList: [], // 检索签到人员列表
      detectType: 1, // 人脸动作类型： 1：人像采集 2：人脸识别
      activityFields: [],
      setting: {
        enableExtraScreen: false,
        autoPrint: false,
        allowRepeatSign: false,
        autoConfirmSign: false,
        signByFace: false,
        enableRfid: false,
      },
      signStatus: 0, // 0:未签到 1:已签到 2:签到成功
      afterSignColumn: [], // 签到后显示的字段
      currentPage: 1, // 当前第几页
      total: 0,
      pageSize: 10,
      optionFlag: 0, // 签到记录标识 0:收起状态 1：展开状态
      countTime: 0,
      pageKeyword: '', // 在检索的时候keyword 缓存 到pageKeyword中，在清空keyword后pageKeyword用来分页处理
    }
  },
  created() {
    this.useType = db.get('useType').value()
    ipcRenderer.on('show-loading', () => {
      this.$message.loading('正在打印...', 0)
    })
    ipcRenderer.on('hide-loading', () => {
      this.$message.destroy()
    })

    this.handleGetSiteInfo()

    // 获取活动信息
    this.getActivityData().then((result) => {
      if (result) {
        this.activityInfo = result
      }
    })
    // 获取签到地点列表
    this.getSiteList().then((result) => {
      if (result) {
        this.sites = result.rows
        this.sites.map((signItem) => {
          if (signItem.id === Number(this.currentSite.id)) {
            this.currentSite.id = signItem.id
            this.currentSite.name = signItem.name
            this.currentSite.fields = signItem.fields
          }
        })
      }
    })
    // 获取签到数据
    this.getSignData()
    // 获取动态的表头
    this.getActivityFields().then((result) => {
      if (result && Array.isArray(result)) {
        this.activityFields = result
      }
    })
    // 获取账号设置
    this.getUserSetting().then((result) => {
      if (result) {
        this.setting.enableExtraScreen = result.enableExtraScreen
        this.setting.autoPrint = result.autoPrint
        this.setting.allowRepeatSign = result.allowRepeatSign
        this.setting.autoConfirmSign = result.autoConfirmSign
        this.setting.signByFace = result.signByFace
        this.setting.enableRfid = result.enableRfid

        if (this.setting.enableExtraScreen) {
          this.getExtraScreenTemplate().then((rst) => {
            if (rst) {
              this.buildTemplate(rst.template.welcomePageData.elements, this.activityInfo).then((_rst) => {
                rst.template.welcomePageData.elements = _rst
              })

              // 离线模式，直接从文件中读取
              if (this.useType === 2) {
                rst.template.welcomePageData.page.bgImg = offlinedb.getDB('extraScreen').get('welcomebg').value()
                this.createExtraWindow()
                ipcRenderer.once('init-extra-screen-complete', (event, res) => {
                  if (res === 'ok') {
                    ipcRenderer.send('transfer', rst.template.welcomePageData, 'welcome')
                  }
                })
                return
              }

              //背景图
              const bgImg = rst.template.welcomePageData.page.bgImg
              this.imageToBase64(bgImg)
                .then((base64) => {
                  rst.template.welcomePageData.page.bgImg = base64
                  this.createExtraWindow()
                  ipcRenderer.once('init-extra-screen-complete', (event, res) => {
                    if (res === 'ok') {
                      ipcRenderer.send('transfer', rst.template.welcomePageData, 'welcome')
                    }
                  })
                })
                .catch((error) => {
                  console.log(error)
                  ipcRenderer.send('transfer', rst.template.welcomePageData, 'welcome')
                })
            } else {
              this.$message.info('请设置拓展屏')
            }
          })
        }
      }
    })

    // 获取胸卡模板
    this.getCardTemplate().then((result) => {
      if (result !== null) {
        this.cardTemplate = result
      } else {
        console.log('胸卡模板为空...')
      }
    })
  },

  beforeDestroy() {
    ipcRenderer.removeAllListeners('hide-loading')
    ipcRenderer.removeAllListeners('show-loading')
    ipcRenderer.removeAllListeners('init-extra-screen-complete')
  },
  computed: {
    ...mapGetters(['UserInfo']),

    accoutType() {
      return this.UserInfo.type
    },

    tableHeight() {
      const height = this.$store.state.user.windowHeight
      if (height > 700) {
        return Number(height * 0.6)
      } else {
        return 400
      }
    },

    // modal 弹框的高度
    modalMaxHeight() {
      const height = this.$store.state.user.windowHeight
      if (height > 700) {
        return '80%'
      } else {
        return '400px'
      }
    },

    records() {
      const list = this.signAttendee.signRecord.map((item) => {
        return item
      })
      const records = ActivityDetail.signRecord(list)
      if (records.length > 0 && this.optionFlag === 0) {
        return [records[0]]
      } else {
        return records
      }
    },

    // 签到结果modal标题
    modalTittle() {
      if (this.setting.autoConfirmSign) {
        return `签到结果(${this.countTime})`
      }
      return '签到结果'
    },

    searchModalTittle() {
      if (this.setting.autoConfirmSign) {
        if (this.attendeeList.length === 0) {
          return `选择签到(${this.countTime})`
        } else {
          return '选择签到'
        }
      }
      return '选择签到'
    },
    // printURL() {
    //   return `${__static}/print.html`;
    // },
    action() {
      return process.env.VUE_APP_API + '/files'
    },
    tableWidth() {
      return this.columns.reduce((width, column) => {
        return width + (column.width || 100)
      }, 65)
    },
    columns() {
      const originMap = {
        1: '网站报名',
        2: '中台导入',
        3: '中台添加',
        4: '签到添加',
      }
      const fixedColumnsstart = [
        {
          title: '性别',
          key: 'sex',
          dataIndex: 'sex',
          width: 100,
          customRender: (index) => ['女', '男'][index] || '',
        },
        {
          title: '单位',
          key: 'work',
          dataIndex: 'work',
          width: 200,
        },
        {
          title: '职位',
          key: 'job',
          dataIndex: 'job',
          width: 160,
        },
        {
          title: '身份证',
          key: 'idCard',
          dataIndex: 'idCard',
          width: 160,
          sorter: true,
        },
      ]
      const fixedColumnsend = [
        {
          title: '来源',
          key: 'origin',
          dataIndex: 'origin',
          width: 160,
          customRender: (index) => originMap[index] || '',
        },
        {
          title: '票种名称',
          key: 'ticket',
          dataIndex: 'ticket',
          width: 200,
        },
        {
          title: '报名时间',
          key: 'createdAt',
          dataIndex: 'createdAt',
          width: 200,
          customRender: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '组别',
          key: 'groupName',
          dataIndex: 'group',
          width: 160,
        },
        {
          title: '邀约码',
          key: 'inviteCode',
          dataIndex: 'inviteCode',
          width: 160,
        },
        {
          title: '签到码',
          key: 'signCode',
          dataIndex: 'signCode',
          width: 160,
        },
        {
          title: '签到状态',
          key: 'signTime',
          dataIndex: 'signTime',
          width: 160,
          customRender: (signTime) => (signTime ? '已签到' : '未签到'),
        },
      ]
      const fieldColumns = this.activityFields.map((item) => {
        return {
          title: item.name,
          dataIndex: item.id,
          width: 200,
          key: item.id,
        }
      })
      return [
        {
          title: '',
          key: 'avatar',
          dataIndex: 'avatar',
          fixed: 'left',
          width: 50,
          scopedSlots: { customRender: 'avatar' },
        },
        {
          title: '姓名',
          key: 'name',
          fixed: 'left',
          width: 100,
          dataIndex: 'name',
        },
        {
          title: '手机号码',
          key: 'mobile',
          fixed: 'left',
          dataIndex: 'mobile',
          width: 120,
        },
        ...fixedColumnsstart,
        ...fieldColumns,
        ...fixedColumnsend,
        {
          title: '',
          key: 'operation',
          fixed: 'right',
          width: 100,
          scopedSlots: { customRender: 'action' },
        },
      ]
    },
    attendeeListData() {
      return this.attendeeList.map((attendee) => {
        const _attendee = {
          id: attendee.id,
          name: attendee.name,
          mobile: attendee.mobile,
          origin: attendee.origin,
          signCode: attendee.signCode,
          inviteCode: attendee.inviteCode,
          group: attendee.group !== null ? attendee.group.name : '未分组',
          ticket: attendee.ticket != null ? attendee.ticket.name : '',
          avatar: attendee.avatar,
          work: attendee.work,
          job: attendee.job,
          sex: attendee.sex,
          createdAt: attendee.createdAt,
          signTime: attendee.signTime,
          idCard: idCard,
        }
        const json = {}
        attendee.fieldValues.map((_item) => {
          json[_item.fieldId] = _item.value
        })
        return Object.assign(_attendee, json)
      })
    },
    qrcode() {
      try {
        return this.signAttendee.signCode
      } catch (error) {
        return ''
      }
    },

    afterSignFields() {
      return ActivityDetail.buildSignFields(this.afterSignColumn, this.activityFields, this.signAttendee)
    },
  },
  components: {
    SignModal,
    CustomModal,
    WebCamera,
    Qrcode,
    CameraModal,
  },
  methods: {
    moment,

    // 活动信息
    async getActivityData() {
      // 离线
      if (this.useType === 2) {
        return await offlinedb.getDB('activitiy').get('activityData').value()
      }

      try {
        const url = `/activities/${this.activityId}`
        return await this.$http.get(url)
      } catch (error) {
        console.log('method getActivityData throw exception :' + error)
        return
      }
    },
    // 获取签到地点列表
    async getSiteList() {
      // 离线

      if (this.useType === 2) {
        return await offlinedb.getDB('sites').get('siteList').value()
      }
      try {
        const url = `/activities/${this.activityId}/sign-sites`
        return await this.$http.get(url)
      } catch (error) {
        console.log('method getSiteList throw exception :' + error)
        return
      }
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
    // 检索签到
    async HandleOnSearch() {
      this.pageKeyword = this.keyword
      this.currentPage = 1

      this.getAttendeeList().then((result) => {
        if (Array.isArray(result)) {
          this.attendeeList = result
          if (result.length === 1) {
            if (this.setting.autoConfirmSign) {
              this.HandleOnSign(result[0].mobile)
            } else {
              // 未开启自动签到,检索出来的结果显示
              this.searchSignModal = true
            }
          } else if (result.length === 0) {
            this.searchSignModal = true
            if (this.setting.autoConfirmSign) {
              this.countdown(3)
              setTimeout(() => {
                this.searchSignModal = false
              }, 3000)
            }
          } else {
            this.searchSignModal = true
          }
        } else {
          console.log('TCL:getAttendeeList result is not a Array')
        }
        this.keyword = '' // 清空输入框
      })
    },
    // 直接签到
    HandleOnSign(keyword) {
      // 隐藏搜索框
      this.searchSignModal = false

      // 非空校验
      if (keyword === '' || keyword === null || keyword === 'undefined') {
        return
      }

      // 获取参会人员信息
      this.getAttendeeInfo(keyword)
        .then((result) => {
          console.log('result=', result)
          if (result) {
            this.signAttendee = result

            // 自动签到
            if (this.setting.autoConfirmSign) {
              const isNotAllowRepeatSign =
                !this.setting.allowRepeatSign && Array.isArray(this.signAttendee.signRecord) && this.signAttendee.signRecord.length > 0
              if (isNotAllowRepeatSign) {
                this.signStatus = 1 // (已签到)
                this.signResult = true
                this.countdown(3)
                setTimeout(() => {
                  this.signResult = false
                }, 3000)
                return
              }

              this.signAccount(this.signAttendee.id, Number(this.currentSite.id), this.signAttendee).then((result) => {
                if (result) {
                  this.signAttendee = result
                  this.signStatus = 2 // (签到成功)
                  this.signResult = true

                  this.toExtraScreen(result) // 投放到拓展屏
                  if (this.setting.enableRfid) {
                    this.$nextTick(() => {
                      this.$refs.rfid.focus()
                    })
                  }
                  if (this.useType === 1) {
                    // 在线的情况下才统计签到信息
                    this.getSignData()
                  }
                  // 打印
                  if (this.setting.autoPrint) {
                    this.printCard()
                  }

                  // 倒计时关闭
                  this.countdown(3)
                  setTimeout(() => {
                    this.signResult = false
                  }, 3000)
                } else {
                  this.signFaild = true
                  // 倒计时关闭
                  this.countdown(3)
                  setTimeout(() => {
                    this.signFaild = false
                  }, 3000)
                }
              })
            } else {
              this.signStatus = Array.isArray(this.signAttendee.signRecord) && this.signAttendee.signRecord.length > 0 ? 1 : 0
              this.signResult = true
            }
          } else {
            this.signFaild = true
          }
        })
        .catch((err) => {
          console.log(err)
          this.signFaild = true
        })
    },
    switchBtn(val) {
      this.buttonGroup = val
    },
    // 选择签约地点
    checkSignAddress(data) {
      this.$store.commit('SET_SITE_ID', data.id)
      this.$store.commit('SET_SITE_INFO', data)
      this.currentSite.id = data.id
      this.currentSite.name = data.name
      this.currentSite.fields = data.fields
      //请求接口，获取数据
      this.getSignData(data.id)

      // 获取胸卡模板
      this.getCardTemplate().then((result) => {
        if (result !== null) {
          this.cardTemplate = result
        } else {
          console.log('胸卡模板为空...')
        }
      })

      // 签到后显示的字段
      this.handleGetSiteInfo()
    },
    // 关掉modal
    handleClose() {
      this.searchSignModal = false
    },
    HandleCancel(flag) {
      // 处理签到记录
      var obj = document.getElementById('record-actions')
      if (obj) {
        obj.innerText = '展开'
        this.optionFlag = 0
      }

      if (flag === 'signResult') {
        this.RFID = ''
        this.signResult = false
      } else if (flag === 'signFaild') {
        this.signFaild = false
      } else if (flag === 'faceSign') {
        this.faceSign = false
      }
    },
    HandleOk() {
      if (this.signStatus !== 2) {
        if (Array.isArray(this.signAttendee.signRecord) && this.signAttendee.signRecord.length > 0 && !this.setting.allowRepeatSign) {
          this.$message.info('该参会人员已签到,不允许重复签到', 0.5)
          return
        }
        this.signAccount(this.signAttendee.id, Number(this.currentSite.id), this.signAttendee).then((result) => {
          if (result) {
            this.signAttendee = result
            this.signStatus = 2
            this.toExtraScreen(result)

            if (this.setting.enableRfid) {
              this.$nextTick(() => {
                this.$refs.rfid.focus()
              })
            }
            this.getSignData()
            if (this.setting.autoPrint) {
              this.printCard()
            }
          } else {
            this.signResult = false
            this.signFaild = true // 签到失败弹框显示
          }
        })
      } else {
        const cardData = this.cardTemplate
        if (cardData !== null) {
          this.buildTemplate(cardData.template.elements, this.signAttendee).then((result) => {
            cardData.template.elements = result
            const pw = Math.ceil(cardData.template.page.input.width)
            const ph = Math.ceil(cardData.template.page.input.height)
            ipcRenderer.send('createPrintWindow', Math.ceil(pw * (359 / 95)), Math.ceil(ph * (359 / 95)), { template: cardData.template })
          })
        } else {
          this.$message.error('请设置签到点胸卡模板', 1)
        }
      }
    },

    /**
     * 构建拓展屏或胸卡数据
     * @param template 模板
     * @param data 数据
     */
    buildTemplate(template, data) {
      return Promise.all(
        template.map((ele) => {
          return new Promise((resolve) => {
            if (ele.type === 'label') {
              resolve(ele)
            } else if (ele.type === 'name') {
              // 姓名
              ele.value = data.name
              resolve(ele)
            } else if (ele.type === 'mobile') {
              // 手机号
              ele.value = this.hiddenMobile(data.mobile)
              resolve(ele)
            } else if (ele.type === 'sex') {
              // 性别
              console.log('sex:', data.sex)
              ele.value = data.sex !== 0 && data.sex !== 1 ? '未定义' : data.sex === 1 ? '男' : '女'

              resolve(ele)
            } else if (ele.type === 'work') {
              // 单位
              ele.value = data.work
              resolve(ele)
            } else if (ele.type === 'job') {
              // 职位
              ele.value = data.job
              resolve(ele)
            } else if (ele.type === 'avatar') {
              // 头像
              if (data.avatar) {
                // 离线模式直接读取头像信息
                if (this.useType === 2) {
                  ele.value = offlinedb.getDB(data.id, this.currentSite.id).get('base64').value()
                  resolve(ele)
                }
                this.imageToBase64(data.avatar).then((base64) => {
                  ele.value = base64
                  resolve(ele)
                })
              } else {
                ele.value = require('@/assets/default_avatar.jpg')
                resolve(ele)
              }
            } else if (ele.type === 'group') {
              // 组别
              ele.value = data.group ? data.group.name : '未分组'
              resolve(ele)
            } else if (ele.type === 'title') {
              // 会议标题
              ele.value = this.activityInfo.name
              resolve(ele)
            } else if (ele.type === 'qrcode') {
              const uri = this.$refs.qrcode.$el.toDataURL('image/png')
              // 参会二维码
              ele.value = uri
              resolve(ele)
            } else {
              // 动态数据
              data.fieldValues.map((fieldvalue) => {
                if (fieldvalue.fieldId === ele.type) {
                  ele.value = fieldvalue.value
                  resolve(ele)
                }
              })
            }
          })
        })
      )
    },
    // 签到并采集人像
    HandleSignAndCollection() {
      if (this.useType === 2) {
        this.$message.info('离线模式不支持人像采集', 0.5)
        return
      }
      if (this.signAttendee.signRecord.length > 0 && !this.setting.allowRepeatSign) {
        this.$message.info('该参会人员已签到,不允许重复签到', 0.5)
        return
      }
      this.signAccount(this.signAttendee.id, Number(this.currentSite.id), this.signAttendee).then((result) => {
        if (result) {
          this.signAttendee = result
          this.signResult = false
          this.showFaceModal(1) // 开启人像
          this.toExtraScreen(result)
        } else {
          this.signResult = false
          this.signFaild = true // 签到失败弹框显示
        }
      })
    },
    /**
     * 调起摄像头
     */
    showCarema() {
      if (!this.enabled) {
        // Start the camera !
        this.enabled = true
        WebCamera.unfreeze()
        console.log('The camera has been started')
      } else {
        // Disable the camera !
        this.enabled = false
        WebCamera.freeze()
        // WebCamera.reset();
        console.log('The camera has been disabled')
      }
    },
    confirmPhoto() {
      let uri = ''
      WebCamera.snap(function (data_uri) {
        uri = data_uri
      })

      this.uploadImage(uri)
    },

    async uploadImage(uri) {
      if (this.detectType === 1) {
        // 采集

        try {
          const url = `/activities/${this.activityId}/attendees/${this.signAttendee.id}/avatar`
          const result = await this.$http.put(url, {
            content: uri,
          })
        } catch (error) {
          this.$message.error('签到成功,但采集人像信息失败:' + error.response.data.message)
        }
        this.faceSign = false
        this.signStatus = 2
        this.signResult = true
        if (this.setting.enableRfid) {
          this.$nextTick(() => {
            this.$refs.rfid.focus()
          })
        }
        this.getSignData()
      } else if (this.detectType === 2) {
        try {
          const img_uri = await this.$http.post(
            '/files',
            {
              content: uri,
            },
            {
              params: {
                silent: true,
              },
            }
          )

          this.getAttendeeInfo(img_uri).then((result) => {
            console.log('通过人脸获取签到人信息：', result)
            if (result) {
              this.signAttendee = result

              if (this.setting.autoConfirmSign) {
                if (this.signAttendee.signRecord.length > 0 && !this.setting.allowRepeatSign) {
                  this.$message.info('该参会人员已签到,不允许重复签到', 0.5)
                  this.signStatus = 1
                  return
                }
                this.signAccount(this.signAttendee.id, Number(this.currentSite.id), this.signAttendee).then((rst) => {
                  if (rst) {
                    this.signAttendee = rst
                    this.signStatus = 2
                    this.signResult = true
                    this.toExtraScreen(result)
                    if (this.setting.enableRfid) {
                      this.$nextTick(() => {
                        this.$refs.rfid.focus()
                      })
                    }
                    this.getSignData()
                  } else {
                    this.errorMessage = error.response.data.message
                    this.signFaild = true
                  }
                })
              } else {
                this.faceSign = false
                this.signStatus = this.signAttendee.signRecord.length === 0 ? 0 : 1
                this.signResult = true
              }
            } else {
              this.faceSign = false
              this.signFaild = true
            }
          })
        } catch (error) {
          this.errorMessage = error.response.data.message
          this.signFaild = true
        }
      }
    },

    // 查看签到名单
    HandleToAttendeeList(status) {
      if (this.accoutType === 2) {
        if (!this.UserInfo.enableAttendeeManage) {
          this.$message.info('您没有该操作权限', 1)
          return
        }
      }

      this.$router.push({
        name: 'attendeeList',
        params: {
          activityId: this.activityId,
          siteId: this.currentSite.id,
        },
        query: {
          status,
        },
      })
    },

    showFaceModal(detectType) {
      if (this.useType === 2) {
        this.$message.info('离线模式不支持人脸签到', 0.5)
        return
      }
      this.detectType = detectType
      this.faceSign = true
      // 开启摄像头
      window.setTimeout(() => {
        WebCamera.set({
          flip_horiz: true,
        })
        // WebCamera.attach('#cam-area')
        WebCamera.attach(this.$refs.camera.$el)
      }, 3000)
    },
    // 签到统计数据
    async getSignData(sId) {
      try {
        const siteId = !!sId ? sId : this.currentSite.id
        // 离线模式
        if (this.useType === 2) {
          const statistics = await offlinedb.getDB('statistics', siteId).get('statistics').value()
          console.log(JSON.stringify(statistics))
          this.signStatistics.total = statistics.attendeeTotal
          this.signStatistics.signCount = statistics.attendeeSignTotal
          this.signStatistics.percent = statistics.attendeeTotal > 0 ? Math.round((statistics.attendeeSignTotal / statistics.attendeeTotal) * 100) : 0
          return
        }

        const url = `/activities/${this.activityId}/site/${siteId}/stat`
        const result = await this.$http.get(url)
        this.signStatistics.total = result.attendeeTotal
        this.signStatistics.signCount = result.attendeeSignTotal
        this.signStatistics.percent = result.attendeeTotal > 0 ? Math.round((result.attendeeSignTotal / result.attendeeTotal) * 100) : 0
      } catch (error) {
        console.log('method getSignData is throw a expection:' + error)
      }
    },

    // -------------------------------------------------------------------------------------------
    // -----------------------------------  接口请求  ---------------------------------------------
    // -------------------------------------------------------------------------------------------
    /**
     * 通过手机号码或签到码获取签到人员信息
     */
    async getAttendeeInfo(keyword) {
      if (this.useType === 2) {
        // 离线模式
        let attendeeList = await offlinedb.getDB('attendees', this.currentSite.id).get('attendeeList').value()
        if (!attendeeList) {
          attendeeList = []
        }

        let result = attendeeList.filter((row) => row.mobile === keyword)

        if (result.length > 0) {
          let signList = await offlinedb.getDB('userSignList', this.currentSite.id).get('list').value()
          let tempArr = []
          if (Array.isArray(signList)) {
            tempArr = signList.filter((item) => item.attendeeId === result[0].id)
          }
          result[0].signRecord.push(...tempArr)

          return result[0]
        } else {
          this.errorMessage = '未匹配到签到人员信息'
          return
        }
      }

      try {
        return await this.$http.get(`/activities/${this.activityId}/site/${this.currentSite.id}/attendee`, {
          params: {
            keyword,
            silent: true, // 静默标识
          },
        })
      } catch (error) {
        this.errorMessage = error.response.data.message // 签到失败提示语
        return
      }
    },
    /**
     * 签到
     */
    async signAccount(attendeeId, siteId, signAttendee) {
      try {
        var obj = document.getElementById('remark')
        let remark = ''
        if (obj) {
          remark = obj.value
        }

        // 离线做签到的时候存储数据
        if (this.useType === 2) {
          let signList = []
          let bool = await offlinedb.getDB('userSignList', this.currentSite.id).has('list').value()
          if (bool) {
            signList = await offlinedb.getDB('userSignList', this.currentSite.id).get('list').value()
          }
          signList.push({
            activityId: this.activityId, // 活动ID
            createBy: this.UserInfo.id, // 创建人
            remark: remark, // 备注
            attendeeId, // 签到人员ID
            signTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 签到时间
            site: {
              id: this.currentSite.id,
              name: this.currentSite.name,
            },
          })

          let tempArr = signList.filter((item) => item.attendeeId === signAttendee.id)
          signAttendee.signRecord.push(...tempArr)
          offlinedb.getDB('userSignList', this.currentSite.id).set('list', signList).write()
          return signAttendee
        }

        const url = `/activities/${this.activityId}/site/${this.currentSite.id}/sign`
        const result = await this.$http.post(
          url,
          {
            attendeeId,
            siteId,
            remark,
          },
          {
            params: {
              silent: true,
            },
          }
        )

        return await this.getAttendeeInfo(result.mobile)
      } catch (error) {
        this.errorMessage = error.response.data.message // 签到失败提示语
        return
      }
    },
    /**
     * 绑定RFID卡
     * @param activityId 活动ID
     * @param attendeeId 签到人ID
     * @param RFID
     */
    async bindRFID(RFID) {
      if (!RFID) {
        this.$message.info('FRID卡不能为空', 1)
        return
      }

      // 离线
      if (this.useType === 2) {
        let attendees = await offlinedb.getDB('attendees', this.currentSite.id).get('attendeeList').value()
        let tempArr = attendees.map((attendee) => {
          if (attendee.id === this.signAttendee.id) {
            attendee.rfid = this.RFID
          }
          return attendee
        })

        await offlinedb.getDB('attendees', this.currentSite.id).set('attendeeList', tempArr).write()
        let rfids = []
        let ids = await offlinedb.getDB('rfid', this.currentSite.id).get('list').value()
        if (ids) {
          rfids = ids
        }
        rfids.push({
          activityId: this.activityId,
          siteId: this.currentSite.id,
          attendeeId: this.signAttendee.id,
          rfid: this.RFID,
        })
        await offlinedb.getDB('rfid', this.currentSite.id).set('list', rfids).write()
        this.$message.success('FRID卡绑定成功', 1)
        return
      }
      const url = `/activities/${this.activityId}/attendees/${this.signAttendee.id}`
      try {
        await this.$http.put(url, {
          rfid: this.RFID,
        })
        this.$message.success('FRID卡绑定成功', 1)
      } catch (error) {
        this.$message.error('FRID卡绑定失败', 1)
      }
    },
    /**
     * 检索签到人员列表
     * @param activityId 活动ID
     * @param currentSite.id 签到地点ID
     */
    async getAttendeeList(pkw) {
      try {
        // 离线模式
        if (this.useType === 2) {
          const attendeeList = await offlinedb.getDB('attendees', this.currentSite.id).get('attendeeList').value()
          let attendees = []

          if (pkw) {
            attendees = attendeeList.filter((attendee) => {
              if (
                attendee.name.indexOf(pkw) === 0 ||
                attendee.letter.indexOf(pkw) === 0 ||
                attendee.firstLetter.indexOf(pkw) === 0 ||
                attendee.mobile === pkw ||
                attendee.rfid === pkw ||
                attendee.mobile.substr(-4) === pkw
              ) {
                attendee.avatar = offlinedb.getDB(attendee.id, this.currentSite.id).get('base64').value()

                return attendee
              }
            })
          } else {
            if (!!this.keyword) {
              attendees = attendeeList.filter((attendee) => {
                if (
                  attendee.name.indexOf(this.keyword) === 0 ||
                  attendee.letter.indexOf(this.keyword) === 0 ||
                  attendee.firstLetter.indexOf(this.keyword) === 0 ||
                  attendee.mobile === this.keyword ||
                  attendee.rfid === this.keyword ||
                  attendee.mobile.substr(-4) === this.keyword
                ) {
                  attendee.avatar = offlinedb.getDB(attendee.id, this.currentSite.id).get('base64').value()

                  return attendee
                }
              })
            } else {
              attendees = attendeeList.map((attendee) => {
                attendee.avatar = offlinedb.getDB(attendee.id, this.currentSite.id).get('base64').value()

                return attendee
              })
            }
          }
          this.total = attendees.length
          let list = attendees.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize)
          return list
        }
        const url = `/activities/${this.activityId}/sign-sites/${this.currentSite.id}/attendees`
        const result = await this.$http.get(url, {
          params: {
            keyword: pkw ? pkw : this.keyword,
            offset: (this.currentPage - 1) * this.pageSize,
            limit: this.pageSize,
          },
        })

        if (result) {
          this.total = result.count
          return result.rows
        } else {
          return []
        }
      } catch (error) {
        console.log('TCL -> getAttendeeList throw Exception:' + error)
        return []
      }
    },
    /**
     * 获取签到人员信息表头
     * @param activityId 活动的ID
     */
    async getActivityFields() {
      try {
        // 离线
        if (this.useType === 2) {
          return await offlinedb.getDB('fields').get('fields').value()
        }
        const url = `/activities/${this.activityId}/fields`
        return await this.$http.get(url, {
          query: {
            silent: true,
          },
        })
      } catch (error) {
        console.log('TCL -> getActivityFields throw Exception:' + error)
        return
      }
    },

    /**
     * 获取设置信息
     */
    async getUserSetting() {
      // 离线
      if (this.useType === 2) {
        return await offlinedb.getDB('setting').get('userSetting').value()
      }
      try {
        return await this.$http.get(`/activities/${this.activityId}/setting`)
      } catch (error) {
        console.log('TCL -> getUserSetting throw Exception:' + error)
        return
      }
    },
    /**
     * 往主进程发送数据
     */
    toExtraScreen(attendeeInfo) {
      this.getExtraScreenTemplate().then((result) => {
        if (result) {
          const template = result.template.signPageData
          this.buildTemplate(template.elements, attendeeInfo).then(async (rst) => {
            template.elements = rst
            // 离线模式，直接从文件中读取
            if (this.useType === 2) {
              template.page.bgImg = await offlinedb.getDB('extraScreen').get('signbg').value()
              ipcRenderer.send('transfer', template, 'sign')
              return
            }
            const bgImg = result.template.signPageData.page.bgImg
            this.imageToBase64(bgImg)
              .then((base64) => {
                template.page.bgImg = base64
                ipcRenderer.send('transfer', template, 'sign')
              })
              .catch((error) => {
                ipcRenderer.send('transfer', template, 'sign')
              })
          })
        }
      })
    },

    /**
     * 获取拓展屏信息
     */
    async getExtraScreenTemplate() {
      try {
        // 离线
        if (this.useType === 2) {
          return await offlinedb.getDB('extraScreen').get('extraScreenTemplate').value()
        }
        const url = `/activities/${this.activityId}/screen`
        return await this.$http.get(url)
      } catch (error) {
        return
      }
    },
    /**
     * 获取胸卡模板信息
     */
    async getCardTemplate() {
      // 离线

      if (this.useType === 2) {
        const cardList = await offlinedb.getDB('cards').get('cardList').value()
        const defaultTemplate = cardList.filter((card) => card.type === 0)
        const bindTemplate = cardList.filter((card) => {
          if (card.site && card.site.id === this.currentSite.id) {
            return true
          } else {
            return false
          }
        })
        if (bindTemplate.length > 0) {
          return bindTemplate[0]
        } else {
          return defaultTemplate[0]
        }
      }

      try {
        return await this.$http.get(`/activities/${this.activityId}/sign-sites/${this.currentSite.id}/card`)
      } catch (error) {
        console.log('获取签到点胸卡模板出错：' + error)
        return []
      }
    },
    /**
     * 开启拓展屏
     */
    createExtraWindow() {
      ipcRenderer.send('createExtraScreen')
    },

    imageToBase64(url) {
      if (!url) {
        return new Promise((resolve, reject) => {
          resolve('')
        })
      }
      var http = require('http')
      return new Promise((resolve, reject) => {
        try {
          http.get(encodeURI(url), function (res) {
            var chunks = [] //用于保存网络请求不断加载传输的缓冲数据
            var size = 0 //保存缓冲数据的总长度
            res.on('data', function (chunk) {
              chunks.push(chunk)
              // 在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，
              // node会把接收到的数据片段逐段的保存在缓冲区（Buffer），
              // 这些数据片段会形成一个个缓冲对象（即Buffer对象），
              // 而Buffer数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），
              // 如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，
              // 直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到chunks数组中，
              // 利用下面的node.js内置的Buffer.concat()方法进行拼接
              size += chunk.length // 累加缓冲数据的长度
            })

            res.on('end', function (err) {
              var data = Buffer.concat(chunks, size)
              var base64Img = data.toString('base64')
              resolve('data:image/png;base64,' + base64Img)
            })
          })
        } catch (error) {
          console.log(error)
          resolve('')
        }
      })
    },

    printCard() {
      const cardData = this.cardTemplate
      if (cardData !== null) {
        this.buildTemplate(cardData.template.elements, this.signAttendee).then((result) => {
          cardData.template.elements = result
          const pw = Math.ceil(cardData.template.page.input.width)
          const ph = Math.ceil(cardData.template.page.input.height)

          ipcRenderer.send('createPrintWindow', Math.ceil(pw * (359 / 95)), Math.ceil(ph * (359 / 95)), { template: cardData.template })
        })
      } else {
        this.$message.error('请设置签到点胸卡模板', 1)
      }
    },

    hiddenMobile(mobile) {
      if (this.UserInfo.hideMobile) {
        if (mobile !== null && String(mobile).length === 11) {
          var reg = /^(\d{3})\d{4}(\d{4})$/
          return mobile.replace(reg, '$1****$2')
        } else {
          return mobile
        }
      } else {
        return mobile
      }
    },

    // 获取签到点的信息
    async handleGetSiteInfo() {
      try {
        if (this.useType === 2) {
          const rst = await offlinedb.getDB('siteInfo', this.currentSite.id).get('info').value()
          this.afterSignColumn = rst.fields
        }
        const rst = await this.$http.get(`/activities/${this.activityId}/sign-sites/${this.currentSite.id}`)
        this.afterSignColumn = rst.fields
      } catch (error) {}
    },

    // 分页
    handlePageChange(currentPage) {
      this.currentPage = currentPage
      this.getAttendeeList(this.pageKeyword).then((rst) => {
        this.attendeeList = rst
      })
    },

    // 设置每页显示条数
    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize
      this.current = 1
      this.getAttendeeList(this.pageKeyword).then((rst) => {
        this.attendeeList = rst
      })
    },

    // 签到记录的展开收起
    handleRecordActions() {
      var obj = document.getElementById('record-actions')
      if (obj) {
        if (obj.innerText === '展开') {
          obj.innerText = '收起'
          this.optionFlag = 1
        } else {
          obj.innerText = '展开'
          this.optionFlag = 0
        }
      }
    },

    // 倒计时
    countdown(time) {
      this.countTime = time
      if (time > 0) {
        setTimeout(() => {
          time -= 1
          this.countdown(time)
        }, 1000)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../common/activity.scss';

/deep/.ant-table th {
  white-space: nowrap;
}

/deep/.ant-table-thead > tr > th {
  padding: 16px 0px;
}

//修改列表文字、背景颜色
/deep/.ant-table-tbody > tr > td {
  padding: 16px 0px;
}
</style>

<style lang="scss" scoped>
.root {
  display: flex;
  justify-content: center;
  width: 100%;
  .root-child-1 {
    width: 100%;
  }
}
.ant-dropdown-link {
  cursor: default;
  display: inline-flex;

  flex-direction: row;
  align-items: center;
  font-weight: 400;
  line-height: 16px;
  .addressTitle {
    display: inline-block;
    align-items: center;
    max-width: 250px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.line:hover {
  color: red;
}

.ant-dropdown-menu-item-active {
  background-color: white;
  .a-list-item-icon {
    color: #f60f0f;
  }
}

a-button-group:active {
  background-color: #f60f0f;
}

.a-card-1 {
  display: flex;
  flex-direction: column;
  margin-left: 0px;
  margin-right: 0px;
  //width: 906px;
  //height: 265px;
  background: rgba(255, 255, 255, 1);
  border-radius: 4px;
  border: 1px solid rgba(229, 229, 229, 1);
  padding-top: 8px;
  padding-left: 8px;
  .a-card-1-top {
    display: flex;
    align-items: center;
    .activity-title {
      flex: 1;
      font-size: 24px;
      font-weight: 600;
      color: #333333;
      line-height: 32px;
    }
    .activity-status {
      font-size: 12px;
      font-weight: 500;
      color: #f60f0f;
      line-height: 16px;
    }
  }

  .a-card-1-middle {
    font-size: 14px;
    font-weight: 400;
    color: rgba(102, 102, 102, 1);
    line-height: 20px;
    margin-top: 16px;
  }
  .a-card-1-count {
    display: flex;
    padding-top: 32px;
    .sign-total {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-items: center;
      align-items: center;
    }
    .sign-total:hover {
      cursor: pointer;
    }
    .sign-people {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-items: center;
      align-items: center;
    }
    .sign-people:hover {
      cursor: pointer;
    }
    .sign-percent {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-items: center;
      align-items: center;
    }
    .num {
      font-size: 30px;
      font-weight: bold;
      color: rgba(51, 51, 51, 1);
      line-height: 36px;
    }
  }
  .view-sign-text {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 400;
    color: #f60f0f;
    line-height: 16px;
    margin-top: 16px;
  }
}

.a-card-2 {
  margin-top: 16px;
  margin-left: 0px;
  margin-right: 0px;
  height: 220px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 1);
  border-radius: 4px;
  border: 1px solid rgba(229, 229, 229, 1);
  padding-top: 8px;
  padding-left: 8px;

  .direct-sign-div {
    margin-top: 24px;
    width: 100%;
    .search-group-div {
      margin-top: 16px;
      width: 100%;
      display: flex;
      align-content: center;
      align-items: center;
      .search-div {
        width: 389px;
      }
      .font-div {
        margin-left: 48px;
      }
    }
  }
  .search-sign-div {
    margin-top: 24px;
    width: 100%;
    .search-div {
      width: 389px;
    }
  }
}

.a-list-item-icon {
  color: white;
  font-size: 14px;
}

.line {
  display: inline-block;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.icon {
  width: 40px;
  margin-left: 30px;
  justify-items: center;
  align-items: center;
}
.icon:hover {
  color: #f60f0f;
}
.font-span {
  font-size: 12px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
  display: inline-flex;
  align-content: center;
}
a {
  color: rgba(51, 51, 51, 1);
}

.custom-modal-wrap {
  overflow: auto;
}
.sign-result {
  display: flex;
  flex-direction: column;

  overflow: auto;
  .sign-result-faild {
    margin-top: 25px;
    display: flex;
    align-content: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
    line-height: 28px;
  }
  .sign-result-msg {
    margin-bottom: 25px;
    display: flex;
    justify-content: center;
    align-content: center;
    font-size: 14px;
    font-weight: 400;
    color: rgba(102, 102, 102, 1);
    line-height: 20px;
  }
  .sign-result-header {
    padding-top: 24px;
    display: flex;
    align-items: center;
    align-content: center;
    .sign-result-header-userinfo {
      flex: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      align-content: center;
      .sign-result-header-userinfo-content {
        margin-left: 12px;
        .sign-result-header-userinfo-content-username {
          font-size: 16px;
          font-weight: 500;
          color: rgba(51, 51, 51, 1);
          line-height: 22px;
        }
        .sign-result-header-userinfo-content-mobile {
          font-size: 12px;
          font-weight: 400;
          color: #999999;
          line-height: 16px;
        }
      }
    }
    .sign-result-header-content {
      margin-left: 16px;
      font-size: 20px;
      font-weight: 500;
      color: rgba(102, 102, 102, 1);
    }
  }

  .m-b-24 {
    margin-bottom: 24px;
  }
  .sign-result-body {
    display: flex;
    flex-direction: column;
    .m-t-16 {
      margin-top: 16px;
    }
    .sign-column {
      & + .sign-column > .sign-result-body-row {
        margin-top: 16px;
      }
    }
    .sign-result-body-row {
      display: flex;
      justify-content: space-between;

      .sign-result-body-row-title {
        flex: 1;
        font-size: 12px;
        font-weight: 400;
        color: rgba(153, 153, 153, 1);
        line-height: 16px;
      }

      .sign-result-body-row-content {
        font-size: 12px;
        font-weight: 400;
        color: rgba(51, 51, 51, 1);
        line-height: 16px;
      }
    }
  }
  .rm-p-b {
    padding-bottom: 0px;
  }
  .sign-record {
    // padding-bottom: 16px;
    .sign-record-title {
      font-size: 14px;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
      line-height: 16px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      .record-opt {
        color: #f60f0f;
        cursor: pointer;
        padding-left: 16px;
      }
    }
  }
  .bind-xcard {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
    flex: 1;
    .search {
      display: flex;
      flex: 1;
    }
    margin-bottom: 24px;
  }
}

.record-item {
  margin-top: 16px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  .sign-record-place {
    flex: 1;
    font-size: 12px;
    font-weight: 400;
    color: rgba(153, 153, 153, 1);
    line-height: 16px;
    display: inline-block;
    max-width: 160px;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .sign-record-remark {
    flex: 1;
  }
  .sign-record-date {
    font-size: 12px;
    font-weight: 400;
    color: rgba(51, 51, 51, 1);
    line-height: 16px;
  }
}

.cam-area {
  width: 320px;
  height: 240px;
  text-align: center;
  margin: 0 auto;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 24px;
  padding-top: 8px;
}
.sign-input-wrap {
  display: flex;
  font-size: 16px;
  flex-direction: row;
  align-items: center;
  margin: 24px 0;
  margin-top: 0;
  div {
    flex: 1;
  }
  .sign-remark-label {
    display: inline-block;
    font-size: 14px;
    font-weight: 400;
    color: #999999;
  }
}
</style>
