<template>
  <div id="wrapper" style="width: 100%;">
    <a-row>
      <a-col :span="12">
        <a-select v-model="status" class="select" @change="handleChange">
          <a-select-option class="select-option" v-for="opt in options" :key="opt.value" :value="opt.value">
            {{ opt.name }}
          </a-select-option>
        </a-select>
        <a-button type="primary" class="add-button" @click="toAdd" :disabled="useType === 2">
          添加参会人员
          <a-icon type="plus" />
        </a-button>
      </a-col>
      <a-col :span="12">
        <div class="search-div">
          <a-input class="search" size="large" type="text" placeholder="姓名/手机/手机后4位/单位" v-model="keyword" @keydown.enter="search">
            <a-icon slot="prefix" type="search" size="large" :style="{ color: 'rgba(0,0,0,.25)' }" @click="search" />
          </a-input>
        </div>
      </a-col>
    </a-row>
    <div style="height: 17px;"></div>
    <!-- 表格数据 -->
    <a-table class="table-list" :columns="columns" :dataSource="tableData" :scroll="{ x: true }" rowKey="id" :pagination="false" @change="handleTableChange">
      <div slot="avatar" slot-scope="text" class="avatar-div">
        <img v-if="text.avatar" :src="text.avatar" target="avatar" style="width: 24px; height: 24px; border-radius: 50%; margin: auto;" />
        <img v-else src="~@/assets/default_avatar.jpg" target="avatar" style="width: 24px; height: 24px; border-radius: 50%; margin: auto;" />
      </div>
      <div slot="action" slot-scope="text, record" class="action-div">
        <span> <img src="~@/assets/查看.png" class="table-icon" @click="handleViewAttendeeDetail(record)" /></span>
        <span> <img src="~@/assets/编辑.png" class="table-icon" @click="HandleEdit(record)" /></span>
        <span>
          <img src="~@/assets/删除.png" class="table-icon" @click="handleDeleteAttande(record)" />
        </span>
      </div>
    </a-table>

    <a-pagination
      style="margin: 8px 0;"
      @change="handlePageChange"
      :current="current"
      :total="total"
      :showTotal="(total) => `共有 ${total} 条数据`"
      :pageSizeOptions="pageSizeOptions"
      showSizeChanger
      @showSizeChange="onShowSizeChange"
    />
  </div>
</template>

<script>
import moment from 'moment'
import db from '../../db'
import offlinedb from '../../offlinedb'
import { mapGetters } from 'vuex'
export default {
  name: 'sign-list',
  data() {
    return {
      keyword: '', // 搜索框
      attendeeList: [],
      fields: [], // 动态表头数据
      defaultIcon: '~@/assets/default_avatar.jpg',
      useType: 1,
      current: 1,
      total: 0,
      pageSize: 10,
      pageSizeOptions: ['10', '20', '30', '50'], // 分页
      sorter: {}, // 排序
      loading: false, // 加载
      queryList: {}, // 查询条件
      status: this.$route.query.status,
      options: [
        { value: '', name: '全部' },
        { value: 0, name: '未签到' },
        { value: 1, name: '已签到' },
      ],
    }
  },
  created() {
    this.useType = db.get('useType').value()
    this.getAttendeeList()
    this.getFields()
      .then((result) => {
        this.fields = result
      })
      .catch((error) => {
        console.log('TCL： =>' + error.response.data.message)
      })
  },
  computed: {
    ...mapGetters(['UserInfo']),
    tableHeight() {
      const height = this.$store.state.user.windowHeight
      if (height > 700) {
        return Number(height * 0.7)
      } else {
        return 400
      }
    },
    enableEdit() {
      return this.UserInfo.type == 1 || this.UserInfo.enableAttendeeManage
    },
    // 活动ID
    activityId() {
      return this.$route.params.activityId
    },
    // 签到点ID
    siteId() {
      return this.$route.params.siteId
    },

    columns() {
      const originMap = {
        1: '网站报名',
        2: '中台导入',
        3: '中台添加',
        4: '签到添加',
      }
      const fixedColumnsstart = [
        {
          title: '性别',
          key: 'sex',
          dataIndex: 'sex',
          width: 100,
          customRender: (index) => ['女', '男'][index] || '',
          sorter: true,
        },
        {
          title: '单位',
          key: 'work',
          dataIndex: 'work',
          width: 200,
          sorter: true,
        },
        {
          title: '职位',
          key: 'job',
          dataIndex: 'job',
          width: 160,
          sorter: true,
        },
        {
          title: '身份证',
          key: 'idCard',
          dataIndex: 'idCard',
          width: 160,
          sorter: true,
        },
      ]
      const fixedColumnsend = [
        {
          title: '来源',
          key: 'origin',
          dataIndex: 'origin',
          width: 160,
          customRender: (index) => originMap[index] || '',
          sorter: true,
        },
        {
          title: '票种名称',
          key: 'ticket',
          dataIndex: 'ticket',
          width: 200,
          sorter: true,
        },
        {
          title: '报名时间',
          key: 'createdAt',
          dataIndex: 'createdAt',
          width: 200,
          customRender: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
          sorter: true,
        },
        {
          title: '组别',
          key: 'groupName',
          dataIndex: 'group',
          width: 160,
          sorter: true,
        },
        {
          title: '邀约码',
          key: 'inviteCode',
          dataIndex: 'inviteCode.code',
          width: 160,
          sorter: true,
        },
        {
          title: '签到码',
          key: 'signCode',
          dataIndex: 'signCode',
          width: 160,
          sorter: true,
        },
        {
          title: '签到状态',
          key: 'signTime',
          dataIndex: 'signTime',
          width: 160,
          customRender: (signTime) => (signTime ? '已签到' : '未签到'),
        },
      ]
      const fieldColumns = this.fields.map((item) => {
        return {
          title: item.name,
          dataIndex: item.id,
          width: 200,
          key: item.id,
          sorter: true,
        }
      })
      return [
        {
          title: '操作',
          key: 'action',
          fixed: 'left',
          width: 100,
          scopedSlots: { customRender: 'action' },
        },
        {
          title: '头像',
          key: 'avatar',
          fixed: 'left',
          width: 50,
          scopedSlots: { customRender: 'avatar' },
        },
        {
          title: '姓名',
          key: 'name',
          fixed: 'left',
          width: 100,
          dataIndex: 'name',
          sorter: true,
        },
        {
          title: '手机号码',
          key: 'mobile',
          fixed: 'left',
          dataIndex: 'mobile',
          width: 130,
          sorter: true,
        },
        ...fixedColumnsstart,
        ...fieldColumns,
        ...fixedColumnsend,
      ]
    },

    tableWidth() {
      return this.columns.reduce((width, column) => {
        return width + (column.width || 100)
      }, 65)
    },
    tableData() {
      return this.attendeeList.map((item) => {
        const attendee = {
          id: item.id,
          name: item.name,
          mobile: item.mobile,
          origin: item.origin,
          signCode: item.signCode,
          inviteCode: item.inviteCode,
          group: item.group !== null ? item.group.name : '未分组',
          ticket: item.ticket != null ? item.ticket.name : '',
          avatar: item.avatar,
          work: item.work,
          job: item.job,
          sex: item.sex,
          createdAt: item.createdAt,
          signTime: item.signTime,
          idCard: item.idCard,
        }
        // 此处应该计算fieldValues中的内容
        const json = {}

        item.fieldValues.map((_item) => {
          json[_item.fieldId] = _item.value
        })
        return Object.assign(attendee, json)
      })
    },
  },
  components: {},
  methods: {
    handleChange() {
      this.current = 1
      this.getAttendeeList()
    },
    search() {
      this.current = 1
      this.getAttendeeList()
    },

    onShowSizeChange(current, pageSize) {
      this.pageSize = pageSize
      this.current = 1
      this.getAttendeeList()
    },
    // 通过活动的ID获取参会人员信息
    async getAttendeeList() {
      let result = []
      let attendees = []
      // 离线
      if (this.useType === 2) {
        attendees = await offlinedb.getDB('attendees', this.siteId).get('attendeeList').value()
        if (this.keyword) {
          attendees = attendees.filter((attendee) => {
            if (
              attendee.name.indexOf(this.keyword) === 0 ||
              attendee.letter.indexOf(this.keyword) === 0 ||
              attendee.firstLetter.indexOf(this.keyword) === 0 ||
              attendee.mobile === this.keyword ||
              attendee.rfid === this.keyword ||
              attendee.mobile.substr(-4) === this.keyword
            ) {
              attendee.avatar = offlinedb.getDB(attendee.id, this.siteId).get('base64').value()
              return attendee
            }
          })
        }

        result = attendees.slice((this.current - 1) * this.pageSize, this.current * this.pageSize)
        this.total = attendees.length
      } else {
        const url = `/activities/${this.activityId}/sign-sites/${this.siteId}/attendees`
        const params = this.buildQueryList()
        attendees = await this.$http.get(url, {
          params,
        })
        result = attendees.rows
        this.total = attendees.count
      }
      this.attendeeList = []
      this.attendeeList = result
      this.loading = false
    },
    toAdd() {
      if (!this.enableEdit) {
        this.$message.info('该账号没有添加权限')
        return
      }
      if (this.useType !== 2) {
        this.$router.push({
          name: 'addAttendee',
          params: { activityId: this.activityId },
          query: { siteId: this.siteId },
        })
      } else {
        this.$message.info('离线模式不允许添加参会人员', 1)
      }
    },
    // 获取活动表头信息
    async getFields() {
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
    },
    async HandleEdit(record) {
      if (this.useType === 2) {
        this.$message.info('离线模式不能操作此功能', 0.5)
        return
      }
      if (!this.enableEdit) {
        this.$message.info('该账号没有添加权限')
        return
      }
      this.$router.push({
        name: 'editAttendee',
        params: { activityId: this.activityId },
        query: {
          siteId: this.siteId,
          attendeeId: record.id,
        },
      })
    },
    handlePageChange(currentPage) {
      this.loading = true
      this.current = currentPage
      this.getAttendeeList()
    },

    handleTableChange(pagination, filters, sorter) {
      console.log('handleTableChange -> sorter', sorter)
      this.sorter = sorter
      this.loading = true
      this.getAttendeeList()
    },

    async handleDeleteAttande(record) {
      if (this.useType === 2) {
        this.$message.info('离线模式不能操作此功能', 0.5)
        return
      }
      this.$confirm({
        title: '提示',
        content: '确定要删除该参会人员?',
        onOk: async () => {
          const url = `/activities/${this.activityId}/attendees`
          try {
            await this.$http.delete(url, {
              params: {
                activityId: this.activityId,
                ids: record.id,
              },
            })
            await this.getAttendeeList()
          } catch (error) {}
        },
        onCancel() {},
      })
    },

    //构建查询条件
    buildQueryList() {
      this.queryList.status = this.status
      this.queryList.offset = (this.current - 1) * this.pageSize
      this.queryList.limit = this.pageSize
      this.queryList.keyword = this.keyword

      if (this.sorter) {
        if (this.sorter.order === 'ascend') {
          // 升序
          this.queryList.order = this.sorter.columnKey
        } else if (this.sorter.order === 'descend') {
          // 降序
          this.queryList.order = `-${this.sorter.columnKey}`
        } else {
          // 默认排序
          delete this.queryList.order
        }
      }
      return this.queryList
    },

    handleViewAttendeeDetail(record) {
      this.$router.push({
        name: 'viewAttendee',
        params: { activityId: this.activityId, id: record.id },
      })
    },
  },
}
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
<style lang="scss" scoped>
/deep/.ant-input-lg {
  height: 32px;
  border-radius: 0px;
}

/deep/.ant-table th {
  white-space: nowrap;
}
/deep/.ant-table-thead > tr > th {
  padding: 16px 12px;
}

//修改列表文字、背景颜色
/deep/.ant-table-tbody > tr > td {
  padding: 16px 12px;
}

// /deep/ .ant-table-tbody > tr:hover > td {
//   background-color: #f7f7f7 !important;
// }

.notclick {
  pointer-events: none;
}
// ----------
.select {
  text-align: center;
  text-align-last: center;
  width: 96px;
  height: 32px;
  font-size: 12px;
}
.select-option {
  font-size: 12px;
}

.add-button {
  margin-left: 16px;
  height: 32px;
  font-size: 12px;
  padding: 0 16px;
}
.search-div {
  display: flex;
  flex-direction: row-reverse;

  .search {
    width: 228px;
    height: 32px;
    background: rgba(255, 255, 255, 1);
    border-radius: 2px;
    border: 1px solid rgba(229, 229, 229, 1);
    display: flex;
    align-items: center;
  }
}

.avatar-div {
  display: flex;
  justify-content: flex-start;
}

.table-icon {
  color: #f60f0f;
  margin-right: 6px;
}
.table-list {
  background-color: #fff;
}
.action-div {
  display: flex;
}
</style>
