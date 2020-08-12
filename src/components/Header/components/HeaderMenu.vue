<template>
  <div class="custom-menu">
    <a-menu v-model="current" mode="horizontal" theme="dark">
      <a-menu-item key="activityList" @click="HandleActivityList"
        >活动列表</a-menu-item
      >
      <a-menu-item
        key="activity"
        v-if="siteId > 0"
        @click="HandleMyActivity"
        id="myActivity"
        >我的活动</a-menu-item
      >
      <a-menu-item
        key="design"
        v-if="siteId > 0 && accoutType === 1"
        @click="HandleDesign"
        >内容设计</a-menu-item
      >
      <a-menu-item
        key="hotel"
        v-if="siteId > 0 && !enabledHotel"
        @click="HandleHotelDesign"
        >酒店分房</a-menu-item
      >
      <a-menu-item key="setting" v-if="siteId > 0" @click="HandleSetting"
        >设置</a-menu-item
      >
    </a-menu>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      current: ['activity']
    };
  },

  computed: {
    ...mapGetters(['UserInfo']),
    accoutType() {
      return this.UserInfo.type;
    },
    siteId() {
      return this.$store.state.user.siteId;
    },
    activityId() {
      return this.$store.state.user.activityId;
    },
    enabledHotel() {
      return this.$store.state.user.enabledHotel;
    }
  },
  methods: {
    HandleDesign() {
      if (this.activityId > 0) {
        this.$router.push({
          name: 'cardDesign',
          params: {
            activityId: this.activityId
          }
        });
      } else {
        // this.$message.error('请选择活动');
      }
    },
    HandleActivityList() {
      this.$router.push({
        name: 'dashboard'
      });
    },
    HandleMyActivity() {
      this.$router.push({
        name: 'activityDetail',
        params: { id: this.activityId },
        query: {
          addressId: this.siteId
        }
      });
    },
    HandleSetting() {
      if (this.activityId > 0) {
        this.$router.push({
          name: 'setting'
        });
      } else {
        // this.$message.error('请选择活动');
      }
    },
    HandleHotelDesign() {
      this.$router.push({
        name: 'hotel',
        params: { id: this.activityId },
        query: {
          addressId: this.siteId
        }
      });
    }
  }
};
</script>

<style lang="scss">
.custom-menu {
  flex: 1;
  margin-left: 25px;
  .ant-menu-item {
    -webkit-app-region: no-drag;
    box-sizing: border-box;
    position: relative;
    &.ant-menu-item-selected::after {
      content: ' ';
      position: absolute;
      display: block;
      left: 50%;
      margin-left: -12px;
      bottom: 2px;
      height: 2px;
      width: 24px;
      background-color: #fff;
    }
  }
}
</style>
