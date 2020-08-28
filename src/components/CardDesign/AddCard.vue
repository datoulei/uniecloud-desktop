<template>
  <div class="content">
    <!-- 头部的按钮 -->
    <div class="content-header">
      <div class="content-header-label">显示字段设置</div>
      <div class="content-header-button-group">
        <a-button class="btn" @click="appendElement('label', '文本标签')">文本标签</a-button>
        <a-button class="btn" @click="appendElement('title', '会议标题')">会议标题</a-button>
        <a-button class="btn" @click="appendElement('avatar', '头像')">头像</a-button>
        <a-button class="btn" @click="appendElement('name', '姓名')">姓名</a-button>
        <a-button class="btn" @click="appendElement('mobile', '手机号码')">手机号码</a-button>
        <a-button class="btn" @click="appendElement('sex', '性别')">性别</a-button>
        <a-button class="btn" @click="appendElement('work', '单位')">单位</a-button>
        <a-button class="btn" @click="appendElement('job', '职位')">职位</a-button>
        <a-button class="btn" @click="appendElement('group', '组别')">组别</a-button>
        <a-button class="btn" @click="appendElement('qrcode', '二维码')">参会二维码</a-button>
        <a-button class="btn" v-for="field in fields" :key="field.id" @click="appendElement(field.id, field.name)">{{ field.name }}</a-button>
      </div>
    </div>

    <div class="body">
      <!-- 设计内容左侧 -->
      <div class="body-left" ref="leftRef">
        <!-- 纸张大小 -->
        <div
          class="body-left-page"
          ref="pageRef"
          v-bind:style="{
            width: pageWidth + 'px',
            height: pageHeight + 'px',
            'background-image': 'url(' + bgImg + ')',
          }"
        >
          <vue-draggable-resizable
            v-for="item in elementData"
            :key="item.id"
            :w="item.w"
            :h="item.h"
            :x="item.x"
            :y="item.y"
            @dragging="onDrag"
            @resizing="onResize"
            :lock-aspect-ratio="['qrcode', 'avatar'].includes(item.type) ? true : false"
            :parent="true"
            @click.right.native="HandleRemove(item)"
            v-bind:style="{
              'text-align': item.align,
              color: item.color ? item.color : '#6b6b6b',
              'font-size': item.fontSize + 'px',
            }"
            @activated="onActivated(item)"
            @deactivated="onDeactivated"
          >
            <!-- <template v-if="['qrcode', 'avatar'].includes(item.type)">
              <img style="width: 100%; height: 100%;" :src="item.value" />
            </template> -->
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
            <span>胸卡纸张尺寸</span>

            <a-upload
              name="file"
              :multiple="true"
              :action="action"
              :headers="headers"
              @change="handleChange"
              :showUploadList="false"
              :beforeUpload="beforeUpload"
            >
              <!-- <span style="cursor:pointer" @click="clearImage">清除</span> -->
              <a-button style="color: red;"> <a-icon type="upload" />上传背景图 </a-button>
            </a-upload>
          </div>
          <div class="body-right-page-setting-label">
            <div class="row-margin">
              <span class="label">纸张宽度</span>
              <a-input class="a-input" v-model="input_w" />
              <span class="label">mm</span>
            </div>
            <div class="row-margin">
              <span class="label">纸张高度</span>
              <a-input class="a-input" v-model="input_h" />
              <span class="label">mm</span>
              <a-button class="resize-page" @click="resizePage" size="small">确认</a-button>
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
            <input type="color" name="bgColor" v-model="color" @change="setColor" />
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
          <div class="row-margin">
            <span class="label">胸卡名称</span>
            <a-input class="a-input" v-model="name" style="width: 120px;" />
          </div>
        </div>
        <div style="width: 100%; padding-left: 65px;">
          <a-button class="submit-btn" type="primary" @click="HandleSubmit" size="small">保存</a-button>
          <a-button class="submit-btn" type="primary" @click="printTest" size="small">测试打印</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueDraggableResizable from 'vue-draggable-resizable-gorkys'
import 'vue-draggable-resizable-gorkys/dist/VueDraggableResizable.css'
import { v4 } from 'uuid'
const ipcRenderer = require('electron').ipcRenderer
import db from '../../db'
import offlinedb from '../../offlinedb'
const fs = require('fs')
export default {
  components: {
    VueDraggableResizable,
  },
  data: function () {
    const activityId = this.$route.query.activityId
    const cardId = this.$route.query.cardId
    return {
      activityId, // 活动ID
      cardId, // 卡片ID
      elementId: '',
      bgImg: '', // 背景图片地址
      pageWidth: 359, // 初始化背景的宽
      pageHeight: 491, // 初始化背景的高
      fontSize: '32px', // 初始化字体大小
      color: '#6b6b6b', // 颜色
      value: '',
      input: {
        width: 95,
        height: 130,
      },
      input_w: 95,
      input_h: 130,
      disabled: true, // 是否可编辑
      elementData: [],
      headers: {}, // 上传背景图用存放token
      fields: [],
      isShowAreaText: true, //是否显示多行文本框
      name: '',
      oPageW: 359, //第一次加载记录的页面宽度
      Q: 1,
      useType: 1, // 1在线，2离线
    }
  },
  computed: {
    printURL() {
      return `${__static}/print.html`
    },
    action() {
      const url = `${process.env.VUE_APP_API}/files`
      return url
    },
  },
  async created() {
    try {
      this.useType = db.get('useType').value()
      if (this.cardId) {
        // 存在cardId说明是编辑
        const result = await this.getCardTemplate()

        this.elementData = result.template.elements ? result.template.elements : []
        // this.pageWidth = result.template.page.pageWidth;
        // this.pageHeight = result.template.page.pageHeight;
        this.input = result.template.page.input
        this.input_h = this.input.height
        this.input_w = this.input.width
        this.bgImg = result.template.page.bgImg
        this.name = result.name
        this.oPageW = result.template.page.pageWidth

        let wrapWidth = this.$refs.leftRef.clientWidth
        let wrapHeight = this.$refs.leftRef.clientHeight

        let maxWidth = wrapWidth * 0.8
        let maxHeight = wrapHeight * 0.8

        if (Number(this.input.width) > Number(this.input.height)) {
          this.pageWidth = Math.floor(maxWidth)
          this.pageHeight = Math.floor((maxWidth / this.input.width) * this.input.height)
        } else {
          this.pageHeight = Math.floor(maxHeight)
          this.pageWidth = Math.floor((maxHeight / this.input.height) * this.input.width)
        }

        // 页面的缩放 = 当前页面大小 / 记录的页面大小
        let Q1 = this.pageWidth / this.oPageW

        // 页面内的元素相对应的调整大小
        const temp = this.elementData.map((item) => {
          item.x = Math.floor((item.x / this.Q) * Q1)
          item.y = Math.floor((item.y / this.Q) * Q1)
          item.w = Math.floor((item.w / this.Q) * Q1)
          item.h = Math.floor((item.h / this.Q) * Q1)
          item.fontSize = Math.floor((item.fontSize / this.Q) * Q1)
          return item
        })
        setTimeout(() => {
          this.elementData = []
        }, 10)
        setTimeout(() => {
          this.elementData = temp
        }, 30)
        this.Q = Q1
      } else {
        console.log(this.cardId)
      }
    } catch (error) {}

    this.getFields()
      .then((result) => {
        this.fields = result
      })
      .catch((error) => {
        console.log('TCL： =>' + error.response.data.message)
      })
  },

  mounted() {
    //监听窗口变化,通过页面切换的方式达到调整大小数据不乱
    ipcRenderer.on('resize-window', (event, text) => {
      this.HandleSubmit('hidden').then((rst) => {
        this.$router.push({
          name: 'cardDesign-direction',
          query: {
            cardId: this.cardId ? this.cardId : rst.id,
            activityId: this.activityId,
          },
        })
      })
    })
  },

  beforeDestroy() {
    ipcRenderer.removeAllListeners('resize-window')
  },

  methods: {
    // 获取胸卡模板
    async getCardTemplate() {
      if (this.useType === 2) {
        const bg = await offlinedb.getDB(this.cardId, 'card').get('base64').value() //背景图
        const cards = await offlinedb.getDB('cards').get('cardList').value()
        const card = cards.filter((card) => card.id === this.cardId)
        const _card = card[0]
        _card.template.page.bgImg = bg
        return _card
      }
      const url = `/activities/${this.activityId}/cards/${this.cardId}`
      return await this.$http.get(url)
    },

    // 获取活动表头信息
    async getFields() {
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
    // 设置背景的大小
    resizePage: function () {
      this.$confirm({
        title: '提示',
        content: '调整胸卡会清除节点，确定要修改?',
        onOk: async () => {
          this.input.width = this.input_w
          this.input.height = this.input_h
          this.elementData = []
          const maxWidth = this.$refs.leftRef.clientWidth * 0.8
          const maxHeight = this.$refs.leftRef.clientHeight * 0.8
          if (Number(this.input.width) > Number(this.input.height)) {
            this.pageWidth = maxWidth
            this.pageHeight = (maxWidth / this.input.width) * this.input.height
          } else {
            this.pageHeight = maxHeight
            this.pageWidth = (maxHeight / this.input.height) * this.input.width
          }
        },
        onCancel: async () => {
          this.input_h = this.input.height
          this.input_w = this.input.width
        },
      })
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
    async HandleSubmit(text) {
      try {
        let result
        if (this.cardId) {
          if (this.useType === 2) {
            const { template } = this.setParams()
            const cards = await offlinedb.getDB('cards').get('cardList').value()
            const cardList = cards.map((card) => {
              if (card.id === this.cardId) {
                card.template = template
                card.name = this.name
              }
              return card
            })

            offlinedb.getDB(this.cardId, 'card').set('base64', this.bgImg).write()
            offlinedb.getDB('cards').set('cardList', cardList).write()
            if ('hidden' !== text) {
              this.$message.success('保存成功')
            }
            return
          }

          result = await this.$http.put(`/activities/${this.activityId}/cards/${this.cardId}`, {
            ...this.setParams(),
            name: this.name,
          })
          if ('hidden' !== text) {
            this.$message.success('保存成功')
          }
          return result
        } else {
          // 离线
          if (this.useType === 2) {
            const { template } = this.setParams()
            const id = v4()
            let cards = await offlinedb.getDB('cards').get('cardList').value()
            cards.push({
              id: id,
              activityId: this.activityId,
              type: 1,
              template: template,
              name: this.name,
            })

            offlinedb.getDB(id, 'card').set('base64', this.bgImg).write()
            offlinedb.getDB('cards').set('cardList', cards).write()
            if ('hidden' !== text) {
              this.$message.success('保存成功')
            }
            return { id }
          }
          result = await this.$http.post(`/activities/${this.activityId}/cards`, {
            type: 0,
            ...this.setParams(),
            name: this.name,
          })
          this.cardId = result.id
          if ('hidden' !== text) {
            this.$message.success('保存成功')
          }
          return result
        }
      } catch (error) {
        console.log(error)
      }
    },
    setParams: function () {
      return {
        template: {
          elements: this.elementData,
          page: {
            pageWidth: this.pageWidth,
            pageHeight: this.pageHeight,
            input: this.input,
            bgImg: this.bgImg,
          },
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
    setColor: function () {
      const index = this.elementData.findIndex((ele) => ele.id === this.elementId)

      if (index === -1) {
        return
      }
      this.elementData[index].color = this.color
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
            this.elementData[index].y = Math.round(this.pageHeight / 2 - this.elementData[index].h / 2)
            break
          case 'center':
            this.elementData[index].x = Math.round(this.pageWidth / 2 - this.elementData[index].w / 2)

            this.elementData[index].y = Math.round(this.pageHeight / 2 - this.elementData[index].h / 2)
            break
          case 'right':
            this.elementData[index].x = Math.round(this.pageWidth - this.elementData[index].w - 1)
            this.elementData[index].y = Math.round(this.pageHeight / 2 - this.elementData[index].h / 2)
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
      if (this.useType === 2) {
        let bitmap = fs.readFileSync(file.path)
        let bf = new Buffer(bitmap).toString('base64')
        this.bgImg = 'data:image/png;base64,' + bf
        return false
      }
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
      if (!isJPG) {
        this.$message.error('You can only upload JPG,JPEG,PNG file!')
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('Image must smaller than 2MB!')
      }
      return isJPG && isLt2M
    },

    printTest() {
      console.log('print card ... ')
      ipcRenderer.send('createPrintWindow', Math.ceil(this.input.width * (359 / 95)), Math.ceil(this.input.height * (359 / 95)), this.setParams())
    },
  },
}
</script>

<style lang="scss" scoped>
.content {
  flex: 1;
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
    flex: 1;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(238, 238, 238, 1);
    margin-top: 8px;
    display: flex;

    // height: 100%;
    flex-direction: row;
    .body-left {
      margin-bottom: 0;
      flex: 1px;
      background-color: rgba(229, 229, 229, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      .body-left-page {
        background-size: cover;
        background-color: rgba(255, 255, 255, 1);
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
.resize-page {
  border: none;
  background-color: red;
  color: #fff;
  border-radius: 2px;
}
.resize-page:hover {
  cursor: pointer;
}
</style>
