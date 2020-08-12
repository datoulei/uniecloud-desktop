<template>
  <!-- <div class="app"> -->
  <div
    class="page"
    :style="{
        width:page.pageWidth+'px',
        height:page.pageHeight+'px'}"
  >
    <!-- <img
      src="http://uniecloud-turtle.oss-cn-hongkong.aliyuncs.com/6319d0bd-ee42-4ab3-a64a-502b62fc0ff9/background-image.png"
      style="position: absolute;top:0;left: 0; width: 100%;height: 100%;z-index:1;"
    />-->
    <div
      v-for="item in elements"
      :key="item.id"
      v-bind:style="{
                    position:'absolute',
                    top:item.y+'px',
                    left:item.x+'px',
                    height:item.h+'px',
                    width:item.w+'px',
                    'text-align':item.align,
                    'font-size':item.fontSize + 'px',
                    'z-index':999,
                }"
    >
      <template v-if="['qrcode','avatar'].includes(item.type)">
        <img style="width:100%;height:100%" :src="item.value" />
      </template>
      <template v-else>
        <span>{{ item.value }}</span>
      </template>
    </div>
  </div>
  <!-- </div> -->
</template>
<script>
const ipcRenderer = require('electron').ipcRenderer;
export default {
  data() {
    return {
      page: {
        pageWidth: 359,
        pageHeight: 491
      },
      elements: []
    };
  },
  created() {
    document.body.style.overflow = 'hidden';
    console.log('window', window.innerHeight, window.innerWidth);
    console.log(
      'scroll',
      document.body.scrollHeight,
      document.body.scrollWidth
    );
    console.log('window-screen', window.screen.height, window.screen.width);
  },
  mounted() {
    ipcRenderer.on('print-data', (event, data) => {
      //this.page = data.template.page;
      this.page = {
        pageWidth: window.innerWidth,
        pageHeight: window.innerHeight
      };
      const Q = window.innerWidth / data.template.page.pageWidth;
      this.elements = data.template.elements.map(item => {
        item.x = item.x * Q;
        item.y = item.y * Q;
        item.w = item.w * Q;
        item.h = item.h * Q;
        item.fontSize = item.fontSize * Q;
        return item;
      });
      this.$nextTick(() => {
        ipcRenderer.send('complete', 'ok');
      });
    });
    ipcRenderer.send('init-print-complete', 'ok');
  },
  methods: {}
};
</script>
<style lang="scss" scoped>
@page {
  margin: 0;
  /* size: 95mm 130mm; */
}

body {
  background-size: cover;
  margin: 0;
}

.page {
  overflow: hidden;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 1);
  color: #000 !important;
  /** 阴影 */
  //box-shadow: 0px 6px 14px 0px rgba(0, 0, 0, 0.05);
  position: relative;
  background-size: 100% 100%;
  // background-image: url('http://uniecloud-turtle.oss-cn-hongkong.aliyuncs.com/card_bg.jpg');
}

.app {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
</style>

