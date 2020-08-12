<template>
  <div class="box">
    <a-icon
      class="btn minimize"
      type="minus"
      @click="handleClick('minimize')"
    />
    <a-icon
      v-show="iconType === 'border'"
      class="btn maximize"
      type="border"
      @click="handleClick('maximize')"
    />
    <a-icon
      v-show="iconType === 'switcher'"
      class="btn maximize"
      type="switcher"
      @click="handleClick('maximize')"
    />
    <a-icon class="btn close" type="close" @click="handleClick('close')" />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      iconType: 'border'
    };
  },
  created() {
    ipcRenderer.on('set-app-bound', (event, data) => {
      this.$store.commit('SET_WINDOW_HEIGHT', data.height);
      this.$store.commit('SET_WINDOW_WIDTH', data.width);
    });
  },
  methods: {
    handleClick(type) {
      if ('maximize' === type) {
        let width = this.$store.state.user.windowWidth;
        if (width > 1000) {
          this.iconType = 'border';
          // this.$store.commit('SET_WINDOW_WIDTH', 1000);
          // this.$store.commit('SET_WINDOW_HEIGHT', 700);
        } else {
          this.iconType = 'switcher';
          // this.$store.commit('SET_WINDOW_WIDTH', window.screen.width);
          // this.$store.commit('SET_WINDOW_HEIGHT', window.screen.height);
        }
      }
      ipcRenderer.sendSync('window', type);
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  margin-right: 8px;
}
.btn {
  -webkit-app-region: no-drag;
  display: inline-block;
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.4);
  margin-right: 8px;
  cursor: pointer;
}
</style>
