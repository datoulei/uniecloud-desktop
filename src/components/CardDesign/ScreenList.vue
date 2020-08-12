<template>
  <div>
    <a-button type="primary" class="add-button" @click="toAddScreen">
      新建拓展屏
      <a-icon type="plus" />
    </a-button>
    <div class="list">
      <div
        :class="index % 3 === 0 ?'screen':'screen card-margin'"
        v-for="(screen,index) in screenList"
        :key="screen.id"
      >
        <div class="cover">
          <img src="~@/assets/screen.png" alt />
        </div>
        <div class="button-group">
          <span class="site">{{ screen.site?screen.site.name:"" }}</span>
          <span>
            <a-popover placement="bottom" :autoAdjustOverflow="false">
              <template slot="content">
                <span class="item" @click="edit(card)">编辑</span>
                <a-divider style="margin:8px 0;" />
                <span class="item" @click="useToSite(card)">应用到签到点</span>
                <a-divider style="margin:8px 0;" />
                <span class="item" @click="deleteScreen(card)">删除</span>
              </template>
              <img src="~@/assets/more.png" alt />
            </a-popover>
          </span>
        </div>
      </div>
    </div>
    <CustomModal :visible="isShow" @cancel="HandleCancel" title="选择签到" @ok="HandleOk" width="360px">
      <a-list itemLayout="horizontal" :dataSource="siteList">
        <a-list-item
          slot="renderItem"
          slot-scope="item"
          @click="handleClick(item)"
          style="height:46.8px;"
        >
          <span v-if="item.id === siteId" class="line item-red">{{item.name}}</span>
          <span v-else class="line">{{item.name}}</span>
          <a-icon
            type="check-circle"
            class="a-list-item-icon"
            slot="actions"
            v-if="siteId === item.id"
          />
        </a-list-item>
      </a-list>
    </CustomModal>
  </div>
</template>

<script>
import CustomModal from '@/components/CustomModal/CustomModal';
export default {
  data() {
    return {
      screenList: [],
      siteList: [], // 签到地点列表
      activityId: this.$route.params.id, // 活动的ID
      isShow: false,
      siteId: 0,
      cardId: 0
    };
  },
  components: {
    CustomModal
  },
  async created() {
    this.screenList = await this.getScreenList();
    this.siteList = await this.getSiteList();
  },
  methods: {
    // 添加
    toAddScreen() {
      this.$router.push({
        name: 'addScreen',
        query: {
          activityId: this.activityId,
          screenId: ''
        }
      });
    },
    // 编辑
    edit(screen) {
      this.$router.push({
        name: 'addScreen',
        query: {
          activityId: this.activityId,
          screenId: screen.id
        }
      });
    },

    // 删除
    deleteScreen(screen) {
      this.$confirm({
        title: '提示',
        content: '确定要删除此拓展屏?',
        onOk: async () => {
          await this.$http.delete(
            `/activities/${this.activityId}/cards/${screen.id}`
          );
          this.screenList = await this.getScreenList();
        },
        onCancel() {}
      });
    },
    // 拓展屏列表
    async getScreenList() {
      const result = await this.$http.get(
        `/activities/${this.activityId}/cards`,
        {
          query: {
            type: 1
          }
        }
      );
      return result;
    },
    // 签到地点列表
    async getSiteList() {
      const result = await this.$http.get(
        `/activities/${this.activityId}/sign-sites`
      );
      return result;
    },
    HandleCancel() {
      this.isShow = false;
    },
    async HandleOk() {
      try {
        await this.$http.put(
          `/activities/${this.activityId}/cards/${this.cardId}`,
          {
            siteId: this.siteId
          }
        );
        this.$message.success('设置成功');
        this.cardList = await this.getScreenList();
      } catch (error) {}
      this.isShow = false;
    },
    handleClick(item) {
      this.siteId = item.id;
    }
  }
};
</script>


<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .screen {
    width: 292px;
    height: 232px;
    margin-top: 10px;
    border: 1px solid grey;
    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 23px;
      padding: 0 24px;
      .site {
        display: inline-block;
        align-items: center;
        max-width: 150px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}

.card-margin {
  margin-left: 14px;
}
.item {
  cursor: pointer;
  width: 100%;
  margin-top: 16px;
}
.item:hover {
  color: red;
}
.a-list-item-icon {
  color: #f60f0f;
  font-size: 14px;
}
.item-red {
  color: #f60f0f;
}
.line {
  display: inline-block;
  width: 250px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>


