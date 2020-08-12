<template>
  <div class="wrap">
    <!-- 胸卡 -->
    <div class="card">
      <div class="cover">
        <img src="~@/assets/cardCover.png" @click="HandleCardList" />
      </div>
      <div class="label">胸卡设计</div>
    </div>
    <!-- 拓展屏 -->
    <div class="card">
      <div class="cover">
        <img
          src="~@/assets/screen.png"
          @click="HandleDesignScreen"
          class="cover-img"
        />
      </div>
      <div class="label">拓展屏设计</div>
    </div>
  </div>
</template>
<script>
const ipcRenderer = require('electron').ipcRenderer;
export default {
  data() {
    return {
      activityId: this.$route.params.activityId
    };
  },
  created() {
    ipcRenderer.send('close-extra'); // 关闭扩展屏幕
  },
  methods: {
    HandleCardList: function () {
      this.$router.push({
        name: 'cardList',
        params: { activityId: this.activityId }
      });
    },
    HandleDesignScreen: function () {
      this.$router.push({
        name: 'addScreen',
        query: {
          activityId: this.activityId
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.wrap {
  margin-top: 88;
  display: flex;
  flex: 1;
  justify-content: center;
  .card {
    width: 320px;
    height: 289px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    border: 1px solid rgba(229, 229, 229, 1);
    & + .card {
      margin-left: 24px;
    }
    display: flex;
    flex-direction: column;
    align-items: center;
    .cover {
      margin-left: 24px;
      margin-top: 24px;
      margin-right: 24px;
      cursor: pointer;
      .cover-img {
        width: 290px;
        height: 162px;
      }
    }
    .label {
      text-align: center;
      font-size: 24px;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
      line-height: 32px;
      margin-top: 40px;
    }
  }
}
</style>
