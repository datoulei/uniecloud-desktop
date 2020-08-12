<template>
  <div class="layout">
    <div class="moveBar">
      <ActionBar />
    </div>
    <div class="weui-border"></div>
    <div class="v-header">
      <v-header />
    </div>
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header';
import ActionBar from '@/components/Header/components/ActionBar';
export default {
  components: {
    'v-header': Header,
    ActionBar
  }
};
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100vh;
}
.v-header {
  height: 48px;
}
.container {
  display: flex;
  flex: 1;
  padding: 24px 48px 0;
  overflow-y: auto;
}

/*webkit内核*/
.container {
  overflow: auto;
}
.container::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
.container::-webkit-scrollbar-button {
  background-color: rgba(0, 0, 0, 0);
}
.container::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
.container::-webkit-scrollbar-track-piece {
  background-color: rgba(0, 0, 0, 0);
}
.container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0);
}
.container::-webkit-scrollbar-corner {
  background-color: rgba(0, 0, 0, 0);
}
.container::-webkit-scrollbar-resizer {
  background-color: rgba(0, 0, 0, 0);
}

.moveBar {
  height: 30px;
  width: 100%;
  background-color: #222;
  -webkit-app-region: drag;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.weui-border {
  position: relative;
}
.weui-border:after {
  content: ' ';
  width: 100%;
  height: 1px;
  position: absolute;
  top: 0;
  left: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 1);
  -webkit-transform: scale(0.5);
  transform: scaleY(0.2);
  -webkit-transform-origin: 0 0;
  transform-origin: 0 0;
  box-sizing: border-box;
}
</style>
