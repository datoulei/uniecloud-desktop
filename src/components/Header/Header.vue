<template>
  <div class="header">
    <!-- logo -->
    <div class="logo"></div>
    <!-- 前进后退按钮 -->
    <NavigatorButton />
    <!-- 菜单 -->
    <HeaderMenu />
    <!-- 同步按钮 -->
    <a-button type="primary" size="small" @click="asyncData">同步数据</a-button>
    <div class="divider"></div>
    <UserBar />
    <div class="divider"></div>
    <!-- 操作按钮 -->
    <!-- <ActionBar /> -->
  </div>
</template>

<script>
import NavigatorButton from './components/NavigatorButton'
import HeaderMenu from './components/HeaderMenu'
// import ActionBar from './components/ActionBar';
import UserBar from './components/UserBar'
import db from '../../db'
import offlinedb from '../../offlinedb'
import fs from 'fs'
export default {
  components: {
    NavigatorButton,
    HeaderMenu,
    // ActionBar,
    UserBar,
  },
  computed: {
    action() {
      const url = `${process.env.VUE_APP_API}/files`
      return url
    },
  },
  methods: {
    async asyncData() {
      const activityId = await db.get('activityId').value()

      if (!activityId || activityId === 0) {
        this.$message.info('暂无数据可同步！')
        return
      }
      this.$message.loading('正在同步数据...', 0)
      const sites = await offlinedb.getDB('sites').get('siteList').value()
      // 同步签到数据
      await this.asyncSignData(sites)
      await this.asyncExtraScreenData()
      await this.asyncCardData()
      await this.asyncSetting(activityId)
      await this.removeLocalData()
      db.set('activityId', 0).write()
      this.$message.destroy()
    },

    // 同步签到数据
    async asyncSignData(sites) {
      sites.rows.map(async (site) => {
        const signList = await offlinedb.getDB('userSignList', site.id).get('list').value()
        if (signList) {
          signList.map(async (sign) => {
            const url = `/activities/${sign.activityId}/site/${sign.site.id}/sign`
            const result = this.$http.post(
              url,
              {
                attendeeId: sign.attendeeId,
                siteId: sign.site.id,
                remark: sign.remark,
              },
              {
                params: {
                  silent: true,
                },
              }
            )
          })
        }
      })
    },

    // 上传背景图
    async base64ToStream(base64) {
      try {
        if (!base64) {
          // this.$message.info('图片不存在...');
          return
        }
        var arr = base64.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]),
          n = bstr.length,
          u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        var obj = new Blob([u8arr], { type: mime })
        var formData = new FormData()
        formData.append('file', obj, 'image.png')
        return await this.$http.post(this.action, formData, {
          isFile: true,
          onUploadProgress(progressEvent) {
            // 进度
          },
        })
      } catch (error) {}
    },

    // 同步扩展屏
    // 先上传背景图，然后把背景图的地址赋值到模板中
    async asyncExtraScreenData() {
      const activityId = await db.get('activityId').value()
      const extraScreen = await offlinedb.getDB('extraScreen').get('extraScreenTemplate').value()
      const welcomebg = await offlinedb.getDB('extraScreen').get('welcomebg').value()
      const signbg = await offlinedb.getDB('extraScreen').get('signbg').value()
      extraScreen.template.welcomePageData.page.bgImg = await this.base64ToStream(signbg)
      extraScreen.template.signPageData.page.bgImg = await this.base64ToStream(welcomebg)
      await this.$http.put(`/activities/${activityId}/screen`, extraScreen)
    },

    // 同步胸卡
    // 先上传背景图，然后把背景图的地址赋值到模板中
    async asyncCardData() {
      const cards = offlinedb.getDB('cards').get('cardList').value()
      const activityId = await db.get('activityId').value()
      if (cards) {
        cards.map(async (card) => {
          if (typeof card.id !== 'number') {
            // 添加
            await this.addCardTemplate(card, activityId)
          } else {
            // 修改
            await this.exitCardTemplate(card, activityId)
          }
        })
      }
    },

    // 编辑胸卡模板
    async exitCardTemplate(card, activityId) {
      const base64 = offlinedb.getDB('card').get(card.id).value()
      const bgUrl = await this.base64ToStream(base64)
      card.template.page.bgImg = bgUrl
      const url = `/activities/${activityId}/cards/${card.id}`
      this.$http.put(url, {
        template: card.template,
        name: this.name,
      })
    },

    // 添加胸卡模板
    async addCardTemplate(card, activityId) {
      const base64 = offlinedb.getDB('card').get(card.id).value()
      const bgUrl = await this.base64ToStream(base64)
      card.template.page.bgImg = bgUrl
      const url = `/activities/${activityId}/cards`
      this.$http.post(url, {
        type: 1,
        template: card.template,
        name: card.name,
      })
    },

    // 同步设置信息
    async asyncSetting(activityId) {
      const setting = await offlinedb.getDB('setting').get('userSetting').value()

      await this.$http.patch(`/activities/${activityId}/setting`, setting)
    },

    async removeLocalData() {
      const path = await offlinedb.getPath()
      this.delFile(path)
    },

    // 同步后删除本地数据
    delFile(path, reservePath) {
      if (fs.existsSync(path)) {
        if (fs.statSync(path).isDirectory()) {
          let files = fs.readdirSync(path)
          files.forEach((file, index) => {
            if (file !== 'setting.json') {
              // 排除setting文件
              let currentPath = path + '/' + file
              if (fs.statSync(currentPath).isDirectory()) {
                this.delFile(currentPath, reservePath)
              } else {
                fs.unlinkSync(currentPath)
              }
            }
          })
          // if (path != reservePath) {
          //   fs.rmdirSync(path);
          // }
        } else {
          fs.unlinkSync(path)
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  // Windows下无法交互
  // -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  align-items: center;
  //background-color: #2c2425;
  background-color: #222;
  height: 48px;
  .logo {
    -webkit-app-region: drag;
    width: 130px;
    height: 48px;
    background: url('~@/assets/logo.png') no-repeat center;
    background-size: 83px 22px;
    cursor: move;
  }
  .divider {
    margin: 0 16px;
    width: 1px;
    height: 16px;
    background: rgba(255, 255, 255, 1);
    opacity: 0.2;
  }
}
</style>
