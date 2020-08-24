<template>
  <div class="root">
    <a-button type="primary" class="add-button" @click="toAddCard">
      新建胸卡
      <a-icon type="plus" />
    </a-button>
    <div class="list">
      <div v-for="card in cardList" :key="card.id" class="card card-margin">
        <div class="cover">
          <div class="card-remark">
            {{ card.name ? card.name : card.type === 0 ? '默认胸卡' : '暂无备注' }}
          </div>
          <img src="~@/assets/cardCover.png" alt />
        </div>
        <div class="button-group">
          <span class="site">{{ card.site ? card.site.name : card.type === 0 ? '默认' : '' }}</span>
          <span>
            <a-popover placement="top" :autoAdjustOverflow="false">
              <template slot="content">
                <span class="item" @click="edit(card)">编辑</span>
                <div v-if="card.type !== 0">
                  <a-divider style="margin: 8px 0;" />
                  <span class="item" @click="unBind(card)">解绑签到点</span>
                  <a-divider style="margin: 8px 0;" />
                  <span class="item" @click="useToSite(card)">应用到签到点</span>
                  <a-divider style="margin: 8px 0;" />
                  <span class="item" @click="deleteCard(card)">删除</span>
                </div>
              </template>
              <img src="~@/assets/more.png" alt />
            </a-popover>
          </span>
        </div>
      </div>
    </div>
    <CustomModal :visible="isShow" @cancel="HandleCancel" title="选择签到" @ok="HandleOk" width="360px">
      <a-list itemLayout="horizontal" :dataSource="siteList">
        <a-list-item slot="renderItem" slot-scope="item" @click="handleClick(item)" style="height: 46.8px;">
          <span v-if="item.id === siteId" class="line item-red">{{ item.name }}</span>
          <span v-else class="line">{{ item.name }}</span>
          <a-icon type="check-circle" class="a-list-item-icon" slot="actions" v-if="siteId === item.id" />
        </a-list-item>
      </a-list>
    </CustomModal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CustomModal from '@/components/CustomModal/CustomModal'
import db from '../../db'
import offlinedb from '../../offlinedb'
export default {
  data() {
    const activityId = this.$route.params.activityId
    return {
      cardList: [], // 胸卡列表
      siteList: [], // 签到地点列表
      activityId, // 活动的ID
      isShow: false,
      siteId: 0,
      cardId: 0,
      useType: 1,
    }
  },
  components: {
    CustomModal,
  },
  created() {
    this.useType = db.get('useType').value()

    this.getCardList().then((result) => {
      this.cardList = result
    })
    this.getSiteList().then((result) => {
      this.siteList = result.rows
    })
  },
  computed: {
    ...mapGetters(['UserInfo']),
    accoutType() {
      return this.UserInfo.type
    },
  },
  methods: {
    // 添加
    toAddCard() {
      this.$router.push({
        name: 'addCard',
        query: {
          activityId: this.activityId,
          cardId: '',
        },
      })
    },
    // 编辑
    edit(card) {
      this.$router.push({
        name: 'addCard',
        query: {
          activityId: this.activityId,
          cardId: card.id,
        },
      })
    },
    // 解绑
    unBind(card) {
      if (!card.site) {
        this.$message.info('该胸卡未绑定到签到点')
        return
      }
      this.$confirm({
        title: '提示',
        content: '确定要解除绑定到此签到点?',
        onOk: async () => {
          try {
            if (this.useType === 2) {
              this.cardList = this.cardList.map((item) => {
                if (item.id === card.id) {
                  item.site = null
                }
                return item
              })

              offlinedb.getDB('cards').set('cardList', this.cardList).write()
              this.$message.success('解绑成功', 1)
              return
            }

            await this.$http.patch(`/activities/${this.activityId}/cards/${card.id}/unbind`)
            this.cardList = await this.getCardList()
            this.$message.success('解绑成功', 1)
          } catch (error) {}
        },
        onCancel() {},
      })
    },
    // 应用到签到点
    useToSite(card) {
      if (card.site) {
        this.$message.info('请先解除绑定', 1)
        return
      }
      this.cardId = card.id
      this.isShow = true
    },
    // 删除
    deleteCard(card) {
      this.$confirm({
        title: '提示',
        content: '确定要删除此胸卡?',
        onOk: async () => {
          try {
            if (this.useType === 2) {
              this.cardList = this.cardList.filter((item) => item.id !== card.id)
              offlinedb.getDB('cards').set('cardList', this.cardList).write()
              return
            }

            await this.$http.delete(`/activities/${this.activityId}/cards/${card.id}`)
            this.cardList = await this.getCardList()
          } catch (error) {}
        },
        onCancel() {},
      })
    },

    async getCardList() {
      try {
        if (this.useType === 2) {
          return await offlinedb.getDB('cards').get('cardList').value()
        }
        return await this.$http.get(`/activities/${this.activityId}/cards`, {
          params: {
            type: 0,
          },
        })
      } catch (error) {
        console.log('TCL -> getSiteList throw exception')
        return []
      }
    },
    async getSiteList() {
      try {
        if (this.useType === 2) {
          return await offlinedb.getDB('sites').get('siteList').value()
        }
        return await this.$http.get(`/activities/${this.activityId}/sign-sites`)
      } catch (error) {
        console.log('TCL -> getSiteList throw exception')
        return []
      }
    },
    HandleCancel() {
      this.isShow = false
    },
    async HandleOk() {
      try {
        if (this.useType === 2) {
          this.cardList = this.cardList.map((item) => {
            if (item.id === this.cardId) {
              item.site = {
                id: this.siteId,
                name: this.siteList.filter((site) => site.id === this.siteId)[0].name,
              }
            }
            return item
          })
          offlinedb.getDB('cards').set('cardList', this.cardList).write()
          this.isShow = false
          return
        }
        await this.$http.patch(`/activities/${this.activityId}/cards/${this.cardId}/bind`, {
          siteId: this.siteId,
        })
        this.$message.success('设置成功')
        this.cardList = await this.getCardList()
      } catch (error) {}
      this.isShow = false
    },
    handleClick(item) {
      this.siteId = item.id
    },
  },
}
</script>

<style lang="scss" scoped>
.root {
  margin: 0;
  .list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin: 0px;
    .card {
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
}
.card-margin {
  margin-right: 9px;
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

.cover {
  position: relative;
  .card-remark {
    font-size: 16px;
    font-weight: 600;
    color: #000;
    position: absolute;
    float: left;
    top: 0px;
    height: 30px;
    width: 100%;
    text-align: center;
  }
}
</style>
