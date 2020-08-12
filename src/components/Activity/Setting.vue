<template>
  <!-- 使用模式 -->
  <div class="wrapper">
    <div class="wrapper-top">
      <label class="wrapper-title">使用模式</label>
      <div>
        <a-radio-group v-model="useType" @change="HandleSetUseType">
          <a-radio :value="1">在线使用</a-radio>
          <a-radio :value="2">离线使用</a-radio>
        </a-radio-group>
      </div>
    </div>

    <!-- 分割线 -->
    <a-divider class="line" />

    <!-- 签到设置 -->
    <div class="wrapper-bottom">
      <label class="wrapper-title">签到设置</label>

      <div>
        <div class="setting-row">
          <label class="setting-label">拓展屏</label>
          <a-switch :checked="enableExtraScreen" @change="HandleSetEnableExtraScreen" />
        </div>
        <div class="setting-row">
          <label class="setting-label">自动打印</label>
          <a-switch :checked="autoPrint" @change="HandleSetAutoPrint" />
        </div>
        <div class="setting-row">
          <label class="setting-label">自动签到</label>
          <a-switch :checked="autoConfirmSign" @change="HandleSetAutoConfirmSign" />
        </div>
        <div class="setting-row">
          <label class="setting-label">允许重复签到</label>
          <a-switch :checked="allowRepeatSign" @change="HandleSetAllowRepeatSign" />
        </div>
        <div class="setting-row">
          <label class="setting-label">签到时开启头像采集</label>
          <a-switch v-model="signByFace" @change="HandleSetSignByFace" />
        </div>
        <div class="setting-row">
          <label class="setting-label">允许签到绑定RFID卡</label>
          <a-switch v-model="enableRfid" @change="HandleSetBandRfid" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import db from '../../db'
import offlinedb from '../../offlinedb'
const ipcRenderer = require('electron').ipcRenderer

export default {
  name: 'setting',
  data() {
    return {
      useType: 1, // 使用模式
      enableExtraScreen: false, // 拓展屏
      autoPrint: false, // 自动打印
      allowRepeatSign: false, // 重复签到
      autoConfirmSign: false, // 自动签到
      signByFace: false, // 开启人脸
      enableRfid: false, // 是否签到绑定RFID
    }
  },
  created() {
    ipcRenderer.send('close-extra') // 关闭扩展屏幕
    this.useType = db.get('useType').value()
    this.getUserSetting()
  },
  computed: {
    ...mapGetters(['UserInfo']),
    userId() {
      return this.UserInfo.userId
    },
    activityId() {
      return this.$store.state.user.activityId
    },
    siteId() {
      return this.$store.state.user.siteId
    },
  },
  components: {},
  methods: {
    HandleSetEnableExtraScreen: function (value) {
      if (this.activityId > 0) {
        if (this.useType === 2) {
          offlinedb.getDB('setting').set('userSetting.enableExtraScreen', value).write()
          this.enableExtraScreen = value
          this.$message.success('设置成功', 0.5)
          return
        }
        this.submit({ enableExtraScreen: value }).then((bool) => {
          if (bool) {
            this.$message.success('设置成功', 0.5)
            this.enableExtraScreen = value
          } else {
            this.$message.error('设置失败', 0.5)
          }
        })
      } else {
        this.$message.error('请选择活动', 0.5)
      }
    },
    HandleSetAutoPrint: function (value) {
      if (this.activityId > 0) {
        if (this.useType === 2) {
          offlinedb.getDB('setting').set('userSetting.autoPrint', value).write()
          this.autoPrint = value
          this.$message.success('设置成功', 0.5)
          return
        }
        this.submit({ autoPrint: value }).then((bool) => {
          if (bool) {
            this.$message.success('设置成功', 0.5)
            this.autoPrint = value
          } else {
            this.$message.error('设置失败', 0.5)
          }
        })
      } else {
        this.$message.error('请选择活动', 0.5)
      }
    },
    HandleSetAutoConfirmSign: function (value) {
      if (this.activityId > 0) {
        if (this.useType === 2) {
          offlinedb.getDB('setting').set('userSetting.autoConfirmSign', value).write()
          this.autoConfirmSign = value
          this.$message.success('设置成功', 0.5)
          return
        }
        this.submit({ autoConfirmSign: value }).then((bool) => {
          if (bool) {
            this.$message.success('设置成功', 0.5)
            this.autoConfirmSign = value
          } else {
            this.$message.error('设置失败', 0.5)
          }
        })
      } else {
        this.$message.error('请选择活动', 0.5)
      }
    },
    HandleSetAllowRepeatSign: function (value) {
      if (this.activityId > 0) {
        if (this.useType === 2) {
          offlinedb.getDB('setting').set('userSetting.allowRepeatSign', value).write()
          this.allowRepeatSign = value
          this.$message.success('设置成功', 0.5)
          return
        }
        this.submit({ allowRepeatSign: value }).then((bool) => {
          if (bool) {
            this.$message.success('设置成功', 0.5)
            this.allowRepeatSign = value
          } else {
            this.$message.error('设置失败', 0.5)
          }
        })
      } else {
        this.$message.error('请选择活动', 0.5)
      }
    },
    HandleSetSignByFace: function (value) {
      if (this.activityId > 0) {
        if (this.useType === 2) {
          offlinedb.getDB('setting').set('userSetting.signByFace', value).write()
          this.signByFace = value
          this.$message.success('设置成功', 0.5)
          return
        }
        this.submit({ signByFace: value }).then((bool) => {
          if (bool) {
            this.$message.success('设置成功', 0.5)
            this.signByFace = value
          } else {
            this.$message.error('设置失败', 0.5)
          }
        })
      } else {
        this.$message.error('请选择活动', 0.5)
      }
    },

    HandleSetBandRfid: function (value) {
      if (this.activityId > 0) {
        if (this.useType === 2) {
          offlinedb.getDB('setting').set('userSetting.enableRfid', value).write()
          this.enableRfid = value
          this.$message.success('设置成功', 0.5)
          return
        }
        this.submit({ enableRfid: value }).then((bool) => {
          if (bool) {
            this.$message.success('设置成功', 0.5)
            this.enableRfid = value
          } else {
            this.$message.error('设置失败', 0.5)
          }
        })
      } else {
        this.$message.error('请选择活动', 0.5)
      }
    },
    /**
     * 提交
     * @param JSON
     */
    async submit(params) {
      try {
        await this.$http.patch(`/activities/${this.activityId}/setting`, params)
        return true
      } catch (error) {
        return false
      }
    },
    /**
     * 获取设置信息
     */
    async getUserSetting() {
      let result = {}
      if (this.useType === 2) {
        result = await offlinedb.getDB('setting').get('userSetting').value()
      } else {
        result = await this.$http.get(`/activities/${this.activityId}/setting`)
      }

      this.enableExtraScreen = result.enableExtraScreen
      this.autoPrint = result.autoPrint
      this.allowRepeatSign = result.allowRepeatSign
      this.autoConfirmSign = result.autoConfirmSign
      this.signByFace = result.signByFace
      this.enableRfid = result.enableRfid
    },
    async HandleSetUseType() {
      let type = this.useType

      db.set('activityId', this.activityId).write()
      const activityId = db.get('activityId').value()

      if (type === 1) {
        db.set('useType', type).write()
      } else {
        if (activityId > 0) {
          this.$message.info('请先同步数据...', 0.5)
          setTimeout(() => {
            this.useType = 1
          }, 500)
          return
        }
        db.set('useType', type).write()
        this.$message.loading('正在下载数据,请勿操作...', 0)
        // 下载某个活动下的签到点;
        await this.downloadActivitySites().then((rst) => {
          offlinedb.getDB('sites').set('siteList', rst).write()
          // 下载签到数据
          this.downloadSignData(rst.rows)
          // 下载参会人员信息
          this.downloadAttendees(rst.rows)
          // 下载胸卡信息
          //this.downloadCardTemplate(rst.rows);
          // 下载签到点信息
          this.downloadSiteInfo(rst.rows)
        })

        // 下载胸卡列表;
        await this.downloadCardList()
        // 下载签到人员详情
        await this.downloadAtteendeeDetail()

        // 下载用户基本信息
        await this.downloadUserInfo()
        // 下载活动列表
        await this.downloadActivityList()

        // 下载活动信息
        await this.downloadActivityData()
        // 下载参会人员表头
        await this.downloadFields()
        // 下载用户设置
        await this.downloadUserSetting()
        // 下载扩展屏信息
        await this.downloadExtraScreenTemplate()

        this.$message.destroy()
      }
    },

    //下载活动列表
    downloadActivityList() {
      const url = '/activities'
      this.$http
        .get(url)
        .then((rst) => {
          // 由于只能操作单个活动，因此活动列表只显示当前活动
          const list = rst.rows.filter((item) => item.id === this.activityId)
          offlinedb.getDB('activities').set('activityList', { rows: list, count: 1 }).write()
        })
        .catch((err) => {
          console.log('TCL download activityList error =>:', err)
        })
    },

    // 下载签到点列表
    async downloadActivitySites() {
      try {
        return await this.$http.get(`/activities/${this.activityId}/sign-sites`)
      } catch (err) {
        return {}
        console.log('TCL download siteList error =>:', err)
      }
    },

    // 下载用户基本信息
    downloadUserInfo() {
      this.$http
        .get('/users/me')
        .then((rst) => {
          this.imageToBase64(rst.avatar).then((base64) => {
            offlinedb.getDB('me').set('base64', base64).write()
          })
          offlinedb.getDB('user').set('userInfo', rst).write()
        })
        .catch((err) => {
          console.log('TCL download userInfo error =>:', err)
        })
    },

    // 下载签到数据
    downloadSignData(siteIds) {
      siteIds.map((site) => {
        const url = `/activities/${this.activityId}/site/${site.id}/stat`
        this.$http
          .get(url)
          .then((rst) => {
            offlinedb.getDB('statistics', site.id).set('statistics', rst).write()
          })
          .catch((err) => {
            console.log('TCL download statistics error =>:', err)
          })
      })
    },

    // 下载参会人员信息
    downloadAttendees(siteIds) {
      siteIds.map((site) => {
        const url = `/activities/${this.activityId}/sign-sites/${site.id}/attendees`
        this.$http
          .get(url, { params: { all: true } })
          .then((rst) => {
            if (!rst) {
              return {}
            }
            offlinedb.getDB('attendees', site.id).set('attendeeList', rst.rows).write()
            rst.rows.map((attendees) => {
              this.imageToBase64(attendees.avatar).then((base64) => {
                offlinedb.getDB(attendees.id, site.id).set('base64', base64).write()
              })
              return attendees
            })
          })
          .catch((err) => {
            console.log('TCL download attendeeList error =>:', err)
          })
      })
    },

    // 下载活动信息
    downloadActivityData() {
      const url = `/activities/${this.activityId}`
      this.$http
        .get(url)
        .then((rst) => {
          offlinedb.getDB('activitiy').set('activityData', rst).write()
        })
        .catch((err) => {
          console.log('TCL download activityData error =>:', error)
        })
    },

    // 下载参会人员表头
    downloadFields() {
      const url = `/activities/${this.activityId}/fields`
      this.$http
        .get(url, {
          query: {
            silent: true,
          },
        })
        .then((rst) => {
          offlinedb.getDB('fields').set('fields', rst).write()
        })
        .catch((error) => {
          console.log('TCL download fields error =>:', error)
        })
    },

    // 下载用户设置
    downloadUserSetting() {
      this.$http
        .get(`/activities/${this.activityId}/setting`)
        .then((rst) => {
          offlinedb.getDB('setting').set('userSetting', rst).write()
        })
        .catch((err) => {
          console.log('TCL download userSetting error =>:', error)
        })
    },

    // 下载获取拓展屏信息
    downloadExtraScreenTemplate() {
      const url = `/activities/${this.activityId}/screen`
      this.$http
        .get(url)
        .then((rst) => {
          this.imageToBase64(rst.template.signPageData.page.bgImg).then((base64) => {
            offlinedb.getDB('extraScreen').set('signbg', base64).write()
          })
          this.imageToBase64(rst.template.welcomePageData.page.bgImg).then((base64) => {
            offlinedb.getDB('extraScreen').set('welcomebg', base64).write()
          })
          offlinedb.getDB('extraScreen').set('extraScreenTemplate', rst).write()
        })
        .catch((error) => {
          console.log('TCL download extraScreenTemplate error =>:', error)
        })
    },

    // 获取签到点的信息
    downloadSiteInfo(siteIds) {
      try {
        siteIds.map(async (site) => {
          const url = `/activities/${this.activityId}/sign-sites/${site.id}`
          const rst = await this.$http.get(url)
          offlinedb.getDB('siteInfo', site.id).set('info').write()
        })
      } catch (error) {}
    },

    // 下载参会人员详情
    async downloadAtteendeeDetail() {
      try {
        const rst = await this.$http.get(`/activities/${this.activityId}/attendees/download`)
        offlinedb.getDB('attendeeDetail').set('list', rst).write()
      } catch (err) {
        return {}
        console.log('TCL download siteList error =>:', err)
      }
    },

    // 下载胸卡列表
    async downloadCardList() {
      try {
        const list = await this.$http.get(`/activities/${this.activityId}/cards`, {
          params: {
            type: 0,
          },
        })
        offlinedb.getDB('cards').set('cardList', list).write()
        list.map((card) => {
          this.imageToBase64(card.template.page.bgImg).then((base64) => {
            offlinedb.getDB(card.id, 'card').set('base64', base64).write()
          })
        })
      } catch (error) {
        console.log('TCL -> downloadCardList throw exception')
        return []
      }
    },

    // 下载胸卡模板信息
    downloadCardTemplate(siteIds) {
      siteIds.map((site) => {
        this.$http
          .get(`/activities/${this.activityId}/sign-sites/${site.id}/card`)
          .then((rst) => {
            offlinedb.getDB('card', site.id).set('cardTemplate', rst).write()
          })
          .catch((error) => {
            console.log('TCL download cardTemplate error =>:', error)
          })
      })
    },

    // 图片转base64
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
          resolve('')
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  padding-top: 24px;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 1);
  border-radius: 4px;
  border: 1px solid rgba(229, 229, 229, 1);
  .wrapper-top {
    display: flex;
    flex-direction: row;
    justify-items: center;
    align-items: center;
  }
  .wrapper-bottom {
    display: flex;
    flex-direction: row;
    justify-items: center;
  }
}
.line {
  width: 100%;
}
.wrapper-title {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  align-items: center;
  margin-right: 68px;
}
.setting-row {
  display: flex;
  flex-direction: row;
  & + .setting-row {
    margin-top: 24px;
  }
  .setting-label {
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    display: block;
    width: 200px;
  }
}
</style>
