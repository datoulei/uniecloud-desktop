<template>
  <div class="extra-content">
    <!-- 导航栏 -->
    <div class="box">
      <a-icon class="btn minimize" type="minus" @click="handleClick('minimize')"></a-icon>
      <a-icon class="btn maximize" type="border" @click="handleClick('maximize')"></a-icon>
      <a-icon class="btn close" type="close" @click="handleClick('close')"></a-icon>
    </div>
    <!-- 内容 -->
    <div
      class="screen"
      :style="{ 
          'width':page.pageWidth+'px',
          'height':page.pageHeight+'px',
          'transform':'scale('+percent+')',
          'background-image':'url('+page.bgImg+')',
          'background-color':page.bgColor,
          'background-size': '100% 100%',
          }"
    >
      <div
        v-for="ele in elements"
        :key="ele.id"
        :style="{
                  position:'absolute',
                  top:ele.y+'px',
                  left:ele.x+'px',
                  height:ele.h+'px',
                  width:ele.w+'px',
                  'text-align':ele.align,
                  'font-size':ele.fontSize + 'px',
                  'color':ele.color?ele.color:'black'
                }"
      >
        <template v-if="['qrcode','avatar'].includes(ele.type)">
          <img style="width:100%;height:100%" :src="ele.value" />
        </template>
        <template v-else>
          <span>{{ ele.value }}</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
  data() {
    return {
      page: {},
      elements: [],
      percent: 1,
      welcomeInfo: {
        page: {
          bgImg:
            'http://uniecloud-turtle.oss-cn-hongkong.aliyuncs.com/b4b15670-01ff-4dfe-87b9-5c472d0b7664/extra.jpg'
        },
        elements: []
      }
    };
  },
  created() {},
  computed: {},
  mounted() {
    ipcRenderer.on('extra-data', (event, data, type) => {
      if (type === 'welcome') {
        console.log('TCL => ', '等于 welcome');
        this.welcomeInfo.page = data.page;
        this.welcomeInfo.elements = data.elements;
      } else {
        console.log('TCL => ', '不等于 welcome');
        setTimeout(() => {
          console.log('开始执行setTimeout');
          this.page = this.welcomeInfo.page;
          this.elements = this.welcomeInfo.elements;
          this.$set(this, 'page', this.welcomeInfo.page);
          this.$set(this, 'elements', this.welcomeInfo.elements);
          console.log('执行setTimeout结束');
        }, 5000);
      }
      this.page = data.page;
      this.elements = data.elements;
    });
    ipcRenderer.send('init-extra-screen-complete', 'ok');
  },
  methods: {
    // 拓展三大金刚事件
    handleClick(opt) {
      ipcRenderer.send('setExtraWindow', opt);
      const max = window.screen.height / this.page.pageHeight;
      if (opt === 'maximize') {
        this.percent = this.percent !== 1 ? 1 : max;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.extra-content {
  width: 100vw;
  height: 100vh;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  .box {
    -webkit-app-region: drag;
    display: flex;
    justify-content: flex-end;
    background-color: black;
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    z-index: 999;
  }
  .btn {
    -webkit-app-region: no-drag;
    display: inline-block;
    width: 16px;
    height: 16px;
    color: rgba(255, 255, 255, 0.4);
    margin-right: 4px;
    cursor: pointer;
  }
  .screen {
    border: 1px solid black;
    position: fixed;
  }
}
</style>