<template>
  <div class="content" :style="{ height: height + 'px' }">
    <div style="margin-bottom: 16px;">
      <a-select style="width: 120px;" v-model="pageType" @change="HandleSwitchScreen">
        <a-select-option value="welcome-page">欢迎页面</a-select-option>
        <a-select-option value="sign-page">签到页面</a-select-option>
      </a-select>
    </div>

    <!-- 头部的按钮 -->
    <div class="content-header">
      <div class="content-header-label">显示字段设置</div>
      <div class="content-header-button-group">
        <a-button class="btn" @click="appendElement('label', '文本标签')">
          文本标签
        </a-button>
        <a-button class="btn" @click="appendElement('title', '会议标题')">
          会议标题
        </a-button>
        <div class="btn-group" v-if="pageType === 'sign-page'">
          <a-button class="btn" @click="appendElement('avatar', '头像')">
            头像
          </a-button>
          <a-button class="btn" @click="appendElement('name', '姓名')">
            姓名
          </a-button>
          <a-button class="btn" @click="appendElement('mobile', '手机号码')">
            手机号码
          </a-button>
          <a-button class="btn" @click="appendElement('sex', '性别')">
            性别
          </a-button>
          <a-button class="btn" @click="appendElement('work', '单位')">
            单位
          </a-button>
          <a-button class="btn" @click="appendElement('job', '职位')">
            职位
          </a-button>
          <a-button class="btn" @click="appendElement('group', '组别')">
            组别
          </a-button>
          <a-button class="btn" @click="appendElement('qrcode', '二维码')">
            参会二维码
          </a-button>

          <a-button class="btn" v-for="field in fields" :key="field.id" @click="appendElement(field.id, field.name)">{{ field.name }}</a-button>
        </div>
      </div>
    </div>

    <div class="body">
      <!-- 设计内容左侧 -->
      <div class="body-left" id="page">
        <!-- 纸张大小 -->
        <div
          class="body-left-page"
          v-bind:style="{
            'background-image': 'url(' + bgImg + ')',
            'background-color': bgColor,
            transform: 'scale(' + percent + ')',
            height: pageHeight + 'px',
            width: pageWidth + 'px',
            'background-size': '100% 100%',
          }"
        >
          <vue-draggable-resizable
            v-for="item in elementData"
            :lock-aspect-ratio="['qrcode', 'avatar'].includes(item.type) ? true : false"
            :key="item.id"
            :w="item.w"
            :h="item.h"
            :x="item.x"
            :y="item.y"
            @dragging="onDrag"
            @resizing="onResize"
            :parent="true"
            @click.right.native="HandleRemove(item)"
            v-bind:style="{
              'text-align': item.align,
              color: item.color ? item.color : '#6b6b6b',
              'font-size': item.fontSize + 'px',
            }"
            @activated="onActivated(item)"
            @deactivated="onDeactivated"
            :is-conflict-check="false"
            :snap="true"
            :snap-tolerance="1"
          >
            <template v-if="['qrcode'].includes(item.type)">
              <img style="width: 100%; height: 100%;" src="~@/assets/qrcode.png" />
            </template>
            <template v-else-if="['avatar'].includes(item.type)">
              <img style="width: 100%; height: 100%;" src="~@/assets/default_avatar.jpg" />
            </template>
            <template v-else>
              <span>{{ item.value }}</span>
            </template>
          </vue-draggable-resizable>
        </div>
      </div>
      <!-- 设计内容右侧 -->
      <div class="body-right">
        <!-- 胸卡纸张尺寸 -->
        <div class="body-right-page-setting">
          <div class="body-right-page-setting-title">
            <span>显示设置</span>
            <span class="clear-span" @click="clearImage">清除</span>

            <a-upload
              name="file"
              :multiple="true"
              :action="action"
              :headers="headers"
              @change="handleChange"
              :showUploadList="false"
              :beforeUpload="beforeUpload"
            >
              <a-button style="color: red;"> <a-icon type="upload" />上传背景图 </a-button>
            </a-upload>
          </div>
          <div class="body-right-page-setting-label">
            <div class="row-margin">
              <span class="label">屏幕比例</span>
              <a-radio-group name="radioGroup" v-model="screenPercent">
                <a-radio value="56.25">16:9</a-radio>
                <a-radio value="75">4:3</a-radio>
              </a-radio-group>
            </div>
            <div class="row-margin">
              <span class="label">背景颜色</span>
              <input type="color" name="bgColor" v-model="bgColor" />
            </div>
          </div>
        </div>
        <a-divider />
        <!-- 编辑字段 -->
        <div class="body-right-element-setting">
          <div class="row-margin">
            <span class="label">编辑字段</span>
          </div>
          <div class="row-margin">
            <span class="label">字体大小</span>
            <a-input-number size="small" style="width: 48px; border-radius: 2px;" :min="8" :max="100" v-model="fontSize" @change="setFont"></a-input-number>
          </div>
          <div class="row-margin">
            <span class="label">字体颜色</span>
            <input type="color" name="fontColor" v-model="fontColor" @change="setFontColor" />
          </div>
          <div class="row-margin">
            <span class="label">对齐方式</span>
            <img src="~@/assets/align-left.png" class="align" @click="setAlign('left')" />
            <img src="~@/assets/align-center.png" class="align" @click="setAlign('center')" />
            <img src="~@/assets/align-right.png" class="align" @click="setAlign('right')" />
          </div>
          <div class="row-margin" style="align-items: flex-start;" v-if="isShowAreaText">
            <div>
              <span class="label">文本内容</span>
            </div>
            <div>
              <a-textarea class="textarea" v-model="value" :disabled="disabled" @change="setLabelText"></a-textarea>
            </div>
          </div>
        </div>
        <div style="width: 100%; padding-left: 65px;">
          <a-button class="submit-btn" type="primary" @click="HandleSubmit" size="small">保存</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable-gorkys'
import 'vue-draggable-resizable-gorkys/dist/VueDraggableResizable.css'
import { v4 } from 'uuid'
import db from '../../db'
import offlinedb from '../../offlinedb'
const fs = require('fs')

// 初始化页面的数据模型
const initPageData = {
  page: {
    bgImg: '',
    bgColor: '#FFF',
    pageWidth: 569,
    pageHeight: 320,
    screenPercent: '56.25',
  },
  elements: [],
}
export default {
  components: {
    VueDraggableResizable,
  },
  data: function () {
    return {
      activityId: this.$route.query.activityId, // 活动ID
      elementId: '',
      screenPercent: '56.25', // 屏幕比例16:9 56.25% 4:3 75%
      bgImg: '', // 背景图片地址
      fontSize: '32px', // 初始化字体大小
      fontColor: '#000000', // 字体颜色
      bgColor: '#FFF', // 背景颜色
      value: '',
      disabled: true, // 是否可编辑
      elementData: [],
      pageType: 'welcome-page', // 拓展屏幕类型：欢迎页面，签到页面
      headers: {}, // 上传背景图用存放token
      welcomePageData: initPageData, // 欢迎页数据
      signPageData: initPageData, // 签到也数据
      pageHeight: 320,
      fields: [],
      screenId: 0,
      isShowAreaText: true,
      useType: 1,
      welcomebgImg: '',
      signbgImg: '',
    }
  },
  computed: {
    // 上传图片的URL
    action() {
      const url = `${process.env.VUE_APP_API}/files`
      return url
    },
    // 窗口高度
    height() {
      console.log('TCL -> windowHeight:' + this.$store.state.user.windowHeight)
      return this.$store.state.user.windowHeight - 94 // (header:48,padding-top:24 padding-bottom:24px;)
    },
    percent() {
      const windowWidth = this.$store.state.user.windowWidth
      const percent = (windowWidth - 96 - 267) / 635
      return percent
    },
    pageWidth() {
      if (this.screenPercent === '56.25') {
        return (this.pageHeight * 16) / 9
      } else {
        return (this.pageHeight * 4) / 3
      }
    },
  },
  async created() {
    this.useType = await db.get('useType').value()
    const result = await this.getScreenTemplate()
    if (result) {
      this.screenId = result.id
      this.welcomePageData = result.template.welcomePageData
      this.signPageData = result.template.signPageData

      // 赋值
      this.elementData = result.template.welcomePageData.elements ? result.template.welcomePageData.elements : []
      this.screenPercent = result.template.welcomePageData.page.screenPercent
      this.pageHeight = result.template.welcomePageData.page.pageHeight
      this.bgImg = result.template.welcomePageData.page.bgImg
      this.bgColor = result.template.welcomePageData.page.bgColor
    }
    this.getFields()
      .then((result) => {
        this.fields = result
      })
      .catch((error) => {
        console.log('TCL： =>' + error.response.data.message)
      })
  },
  methods: {
    // 获取扩展屏模板
    async getScreenTemplate() {
      try {
        if (this.useType === 2) {
          let signbg = await offlinedb.getDB('extraScreen').get('signbg').value()
          let welcomebg = await offlinedb.getDB('extraScreen').get('welcomebg').value()
          let screen = await offlinedb.getDB('extraScreen').get('extraScreenTemplate').value()
          screen.template.signPageData.page.bgImg = signbg
          screen.template.welcomePageData.page.bgImg = welcomebg
          return screen
        }

        const url = `/activities/${this.activityId}/screen`
        return await this.$http.get(url)
      } catch (error) {
        this.$message.error('获取扩展屏信息出错!')
      }
    },
    // 获取活动表头信息
    async getFields() {
      try {
        // 离线
        if (this.useType === 2) {
          return await offlinedb.getDB('fields').get('fields').value()
        }
        const url = `/activities/${this.activityId}/fields`
        const fields = await this.$http.get(url, {
          query: {
            silent: true,
          },
        })
        return fields
      } catch (error) {
        return
      }
    },
    // 设置标签大小
    onResize: function (x, y, width, height) {
      const index = this.elementData.findIndex((ele) => ele.id === this.elementId)
      this.elementData[index].x = x
      this.elementData[index].y = y
      this.elementData[index].w = width
      this.elementData[index].h = height
    },
    // 拖动标签
    onDrag: function (x, y) {
      const index = this.elementData.findIndex((ele) => ele.id === this.elementId)
      this.elementData[index].x = x
      this.elementData[index].y = y
    },

    // 节点激活触发
    onActivated: function (item) {
      this.elementId = item.id
      this.fontSize = item.fontSize
      this.color = item.color
      this.value = item.value
      if (['qrcode', 'avatar'].includes(item.type)) {
        this.isShowAreaText = false
      } else {
        this.isShowAreaText = true
      }
      if ('label' === item.type) {
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
    // 取消激活
    onDeactivated: function () {
      //this.disabled = true;
      //this.elementId = 0;
    },
    // 动态添加节点数据
    appendElement: function (type, value) {
      const eleData = {
        type,
        id: v4(),
        w: 150,
        h: 50,
        x: 0,
        y: 0,
        color: '#000000',
        fontSize: 32,
        align: 'left',
        value,
      }
      switch (type) {
        case 'qrcode':
          eleData.value = 'https://uniecloud.oss-cn-shenzhen.aliyuncs.com/assets/qrcode.png'
          eleData.w = 100
          eleData.h = 100
          break
        case 'avatar':
          eleData.value = 'https://uniecloud.oss-cn-shenzhen.aliyuncs.com/assets/default_avatar.jpg'
          eleData.w = 100
          eleData.h = 100
          break
        default:
          break
      }
      this.elementData.push(eleData)
    },
    // 右击移除节点
    HandleRemove: function (item) {
      this.$confirm({
        title: '提示',
        content: '确定要删除此节点?',
        onOk: () => {
          const index = this.elementData.findIndex((ele) => ele.id === item.id)
          this.elementData.splice(index, 1)
        },
        onCancel() {},
      })
    },
    // 保存
    async HandleSubmit() {
      try {
        if (this.useType === 2) {
          offlinedb.getDB('extraScreen').set('welcomebg', this.welcomebgImg).write()
          offlinedb.getDB('extraScreen').set('signbg', this.signbgImg).write()
          const { template } = this.beforeSubmit()
          const orginTemplate = await offlinedb.getDB('extraScreen').get('extraScreenTemplate').value()
          orginTemplate.template = template

          offlinedb.getDB('extraScreen').set('extraScreenTemplate', orginTemplate).write()

          this.$message.success('保存成功')
          return
        }
        const result = await this.$http.put(`/activities/${this.activityId}/screen`, {
          ...this.beforeSubmit(),
        })

        this.$message.success('保存成功')
      } catch (error) {
        console.log(error)
        this.$message.error('保存失败')
      }
    },
    // 封装提交参数
    beforeSubmit() {
      // 提交前保存当前页面的数据
      if ('welcome-page' === this.pageType) {
        this.welcomePageData = this.buildPageData()
      } else {
        this.signPageData = this.buildPageData()
      }
      return {
        template: {
          welcomePageData: this.welcomePageData,
          signPageData: this.signPageData,
        },
      }
    },
    // 切换展示页面
    HandleSwitchScreen(value) {
      if ('welcome-page' === value) {
        // 构建数据
        this.signPageData = this.buildPageData()

        this.elementData = this.welcomePageData.elements ? this.welcomePageData.elements : []
        this.screenPercent = this.welcomePageData.page.screenPercent
        this.pageHeight = this.welcomePageData.page.pageHeight
        this.bgColor = this.welcomePageData.page.bgColor
        this.bgImg = this.welcomePageData.page.bgImg
      } else {
        // 构建数据

        this.welcomePageData = this.buildPageData()

        this.elementData = this.signPageData.elements ? this.signPageData.elements : []
        this.screenPercent = this.signPageData.page.screenPercent
        this.pageHeight = this.signPageData.page.pageHeight
        this.bgColor = this.signPageData.page.bgColor
        this.bgImg = this.signPageData.page.bgImg
      }
    },
    // 构建页面数据
    buildPageData() {
      return {
        elements: this.elementData,
        page: {
          bgColor: this.bgColor,
          bgImg: this.bgImg,
          pageWidth: this.pageWidth,
          pageHeight: this.pageHeight,
          screenPercent: this.screenPercent,
        },
      }
    },

    // 设置字体大小
    setFont: function () {
      const index = this.elementData.findIndex((ele) => ele.id === this.elementId)

      if (index === -1) {
        return
      }
      this.elementData[index].fontSize = this.fontSize
    },
    // 设置字体颜色
    setFontColor: function () {
      const index = this.elementData.findIndex((ele) => ele.id === this.elementId)

      if (index === -1) {
        return
      }
      this.elementData[index].color = this.fontColor
    },
    // 设置标签的内容
    setLabelText: function () {
      const index = this.elementData.findIndex((ele) => ele.id === this.elementId)

      if (index === -1) {
        return
      }

      if (this.elementData[index].type === 'label') {
        this.elementData[index].value = this.value
      }
    },
    // 对齐方式
    setAlign: function (align) {
      const index = this.elementData.findIndex((ele) => ele.id === this.elementId)

      if (index === -1) {
        return
      }
      this.elementData[index].align = align

      if (['qrcode', 'avatar'].includes(this.elementData[index].type)) {
        switch (align) {
          case 'left':
            this.elementData[index].x = 0
            // this.elementData[index].y = Math.round(
            //   this.pageHeight / 2 - this.elementData[index].h / 2
            // );
            break
          case 'center':
            this.elementData[index].x = Math.round(this.pageWidth / 2 - this.elementData[index].w / 2)

            // this.elementData[index].y = Math.round(
            //   this.pageHeight / 2 - this.elementData[index].h / 2
            // );
            break
          case 'right':
            this.elementData[index].x = Math.round(this.pageWidth - this.elementData[index].w - 1)
            // this.elementData[index].y = Math.round(
            //   this.pageHeight / 2 - this.elementData[index].h / 2
            // );
            break
          default:
            break
        }
      }
    },
    clearImage() {
      this.bgImg = ''
    },

    // 上传背景图
    handleChange(res) {
      if (res.file.status === 'uploading') {
        return
      }
      if (res.file.status === 'done') {
        if (res && res.file && res.file.response) {
          this.bgImg = res.file.response
        }
      }
    },
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
      if (!isJPG) {
        this.$message.error('You can only upload JPG,JPEG,PNG file!')
        return isJPG
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('Image must smaller than 2MB!')
        return isLt2M
      }

      if (this.useType === 2) {
        let bitmap = fs.readFileSync(file.path)
        let bf = new Buffer(bitmap).toString('base64')
        if (this.pageType === 'welcome-page') {
          this.welcomebgImg = 'data:image/png;base64,' + bf
        } else {
          this.signbgImg = 'data:image/png;base64,' + bf
        }
        this.bgImg = 'data:image/png;base64,' + bf
        return false
      }

      return true
    },
  },
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  .content-header {
    height: 80px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(238, 238, 238, 1);
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-right: 16px;
    .content-header-label {
      font-size: 16px;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
      line-height: 22px;
      margin: 0 24px;
    }
    .content-header-button-group {
      display: flex;
      height: 100%;
      align-items: center;
      flex: 1;
      flex-direction: row;
      overflow-x: auto;
      .btn {
        border-radius: 2px;
        & + .btn {
          border: 1px solid rgba(229, 229, 229, 1);
          margin-left: 8px;
        }
      }
    }
  }

  .body {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(238, 238, 238, 1);
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    .body-left {
      flex: 1;

      background: rgba(229, 229, 229, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      .body-left-page {
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 6px 14px 0px rgba(0, 0, 0, 0.05);
        position: relative;
        background-size: 100% 100%;
      }
    }
    .body-right {
      display: flex;
      flex-direction: column;
      padding: 0 24px;
      margin-bottom: 0;
      width: 267px;

      .body-right-page-setting {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        .body-right-page-setting-title {
          display: flex;
          flex: 1;
          justify-content: space-between;
          align-items: center;
          align-content: center;
        }
        .body-right-page-setting-label {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      }
      .body-right-element-setting {
        display: flex;
        flex-direction: column;
      }
    }
  }
}

.a-input {
  width: 48px;
  height: 24px;
  border-radius: 2px;
  border: 1px solid rgba(229, 229, 229, 1);
  margin-right: 8px;
}
.label {
  font-size: 12px;
  font-weight: 400;
  color: rgba(102, 102, 102, 1);
  line-height: 16px;
  margin-right: 16px;
}
.row-margin {
  margin-top: 16px;
  display: flex;
  align-items: center;
}
.align {
  & + .align {
    margin-left: 8px;
  }
}
.textarea {
  max-width: 155px;
  height: 53px;
  border-radius: 2px;
  border: 1px solid rgba(229, 229, 229, 1);
}
.submit-btn {
  margin-top: 8px;
  width: 72px;
  height: 32px;
  border-radius: 2px;
}
.btn-group {
  display: inline;
  display: flex;
  flex-direction: row;
  margin-left: 8px;
}
.clear-span {
  cursor: pointer;
}
.clear-span:hover {
  color: red;
}
</style>
