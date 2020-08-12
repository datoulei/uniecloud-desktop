<template>
  <div class="v-main">
    <div class="content-wrap m-t-24 flex-box">
      <a-form :form="form" @submit="handleSubmit">
        <a-form-item label="请选择票种" class="cover-form-label">
          <a-select
            disabled
            @change="(value) => getTicket(value)"
            class="long-input"
            v-decorator="[
              'ticketId',
              { rules: [{ required: true, message: '请选择' }] }
            ]"
          >
            <a-select-option
              v-for="(item, index) in ticketOptions"
              :value="item.id"
              :key="index"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <!-- 邀请码-->
        <a-form-item
          label="请输入邀请码"
          class="cover-form-label"
          v-if="inviteCode === true"
        >
          <a-input
            class="long-input"
            placeholder="请输入邀请码"
            v-decorator="[
              'inviteCode',
              { rules: [{ required: true, message: '请输入邀请码' }] }
            ]"
          />
        </a-form-item>
        <!-- 组别 -->
        <a-form-item
          label="请选择组别"
          class="cover-form-label"
          v-if="groupOptions.length > 0"
        >
          <a-select
            class="long-input"
            v-decorator="[
              'groupId',
              { rules: [{ required: false, message: '请选择' }] }
            ]"
          >
            <a-select-option
              v-for="(item, index) in groupOptions"
              :value="item.id"
              :key="index"
              >{{ item.name }}</a-select-option
            >
          </a-select>
        </a-form-item>
        <!--  上传头像 -->
        <a-form-item
          label="请上传头像"
          class="cover-form-label"
          v-if="ticketInfo.showAvatar"
        >
          <FileUploader
            :face="ticketInfo.enableFaceDetect"
            v-decorator="[
              'avatar',
              {
                rules: [
                  {
                    required:
                      activityInfo.enableFaceDetect &&
                      ticketInfo.enableFaceDetect,
                    message: '请上传头像'
                  }
                ]
              }
            ]"
          />
        </a-form-item>
        <a-form-item label="姓名" class="cover-form-label">
          <a-input
            class="long-input"
            placeholder="请输入姓名"
            v-decorator="[
              'name',
              { rules: [{ required: true, message: '请输入姓名' }] }
            ]"
          />
        </a-form-item>

        <a-form-item label="手机号码" class="cover-form-label">
          <a-input
            class="long-input"
            placeholder="请输入手机号码"
            v-decorator="[
              'mobile',
              { rules: [{ required: true, message: '请输入手机号码' }] }
            ]"
          />
        </a-form-item>
        <a-form-item
          label="身份证"
          class="cover-form-label"
          v-if="ticketInfo !== null && ticketInfo.showIdCard"
        >
          <a-input
            class="long-input"
            placeholder="请输入身份证号码"
            v-decorator="[
              'idCard',
              {
                rules: [
                  {
                    required: activityInfo.requiredIdCard,
                    message: '请输入身份证号码'
                  }
                ]
              }
            ]"
          />
        </a-form-item>
        <a-form-item
          label="单位"
          class="cover-form-label"
          v-if="ticketInfo !== null && ticketInfo.showWork"
        >
          <a-input
            class="long-input"
            placeholder="请输入单位"
            v-decorator="[
              'work',
              {
                rules: [
                  { required: activityInfo.requiredWork, message: '请输入单位' }
                ]
              }
            ]"
          />
        </a-form-item>
        <a-form-item
          label="职位"
          class="cover-form-label"
          v-if="ticketInfo !== null && ticketInfo.showJob"
        >
          <a-input
            class="long-input"
            placeholder="请输入职位"
            v-decorator="[
              'job',
              {
                rules: [
                  { required: activityInfo.requiredJob, message: '请输入职位' }
                ]
              }
            ]"
          />
        </a-form-item>
        <a-form-item
          label="性别"
          v-if="ticketInfo !== null && ticketInfo.showSex"
        >
          <a-radio-group
            v-decorator="[
              `sex`,
              {
                rules: [
                  { required: activityInfo.requiredSex, message: '请选择性别' }
                ]
              }
            ]"
          >
            <a-radio :value="0">女</a-radio>
            <a-radio :value="1">男</a-radio>
          </a-radio-group>
        </a-form-item>
        <div v-for="(item, index) in fieldsHiddenFilter" :key="index">
          <a-form-item
            v-if="!fieldRulesMap[item.id].isHidden"
            :key="index"
            :label="item.name"
            class="cover-form-label"
          >
            <a-input
              class="long-input"
              v-if="item.type === 0"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请输入${item.name}`
                    }
                  ]
                }
              ]"
            />
            <a-textarea
              class="long-input"
              v-else-if="item.type === 1"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请输入${item.name}`
                    }
                  ]
                }
              ]"
            />
            <a-radio-group
              @change="(e) => updateEffectRules(item.id, e.target.value)"
              v-else-if="item.type === 2"
              :options="formatOptions(item.options)"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请选择${item.name}`
                    }
                  ]
                }
              ]"
            />
            <a-checkbox-group
              @change="(value) => updateEffectRules(item.id, value, true)"
              v-else-if="item.type === 3"
              :options="formatOptions(item.options)"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请选择${item.name}`
                    }
                  ]
                }
              ]"
            />
            <FileUploader
              v-else-if="item.type === 4"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请上传图片`
                    }
                  ]
                }
              ]"
            />
            <a-select
              @change="(value) => updateEffectRules(item.id, value)"
              class="long-input"
              v-else-if="item.type === 5"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请选择${item.name}`
                    }
                  ]
                }
              ]"
            >
              <a-select-option
                v-for="(field, index) in formatOptions(item.options)"
                :key="index"
                :value="field.value"
                >{{ field.label }}</a-select-option
              >
            </a-select>
            <CascadeSelector
              v-else-if="item.type === 6"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请选择${item.name}`
                    }
                  ]
                }
              ]"
              :field="item"
            />

            <DatePickerTime
              v-else-if="item.type === 8"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请选择${item.name}`
                    }
                  ]
                }
              ]"
            />

            <DatePickerInput
              v-else-if="item.type === 7"
              v-decorator="[
                `values.${item.id}`,
                {
                  rules: [
                    {
                      required: fieldRulesMap[item.id].isRequired,
                      message: `请选择${item.name}`
                    }
                  ]
                }
              ]"
            />
          </a-form-item>
        </div>

        <a-button
          class="m-l-120"
          type="primary"
          html-type="submit"
          :loading="creating"
          >修改</a-button
        >
      </a-form>
    </div>
  </div>
</template>

<script>
import FileUploader from './FileUploader';
import CascadeSelector from './CascadeSelector';
import DatePickerTime from './DatePickerTime';
import DatePickerInput from './DatePickerInput';

export default {
  data() {
    const activityId = this.$route.params.activityId; // 活动ID
    const siteId = this.$route.query.siteId; // 签到地点ID
    const attendeeId = this.$route.query.attendeeId; // 参会人员ID
    const siteInfo = this.$store.state.user.siteInfo;
    return {
      avatar: '',
      activityId,
      attendeeId,
      siteInfo,
      siteId,
      creating: false,
      uploading: false,
      ticketOptions: [],
      groupOptions: [],
      attendeeInfo: {},
      rules: [],
      effectRules: [],
      form: this.$form.createForm(this, {
        onValuesChange: (_, values) => {
          if (values.ticketId) {
            this.ticketOptions.map((tikect) => {
              if (tikect.id === values.ticketId) {
                if (tikect.type === 2) {
                  this.inviteCode = true;
                } else {
                  this.inviteCode = false;
                }
              }
            });
          }
        }
      }),
      fields: [],
      inviteCode: false,
      activityInfo: {},
      ticketInfo: {},
      ticketFields: []
    };
  },
  components: {
    FileUploader,
    CascadeSelector,
    DatePickerTime,
    DatePickerInput
  },
  computed: {
    fieldsHiddenFilter() {
      return this.fields.filter((item) => {
        for (let i = 0; i < this.ticketFields.length; i++) {
          if (
            item.id === this.ticketFields[i].fieldId &&
            this.ticketFields[i].isHidden
          ) {
            return false;
          }
        }
        return true;
      });
    },
    fieldRulesMap() {
      let map = {};
      if (Array.isArray(this.fields)) {
        this.fieldsHiddenFilter.reduce((result, field) => {
          // 原有规则
          result[field.id] = {
            isHidden: field.isHidden,
            isRequired: field.isRequired
          };
          // 查找是否有匹配规则
          const effectRules = this.effectRules.filter(
            (rule) => rule.effectFieldId === field.id
          );
          effectRules.forEach((rule) => {
            // 影响类型 0-显示 1-隐藏 2-必填 3-选填
            switch (rule.effectType) {
              case 0:
                result[field.id].isHidden = false;
                break;
              case 1:
                result[field.id].isHidden = true;
                break;
              case 2:
                result[field.id].isRequired = true;
                break;
              case 3:
                result[field.id].isRequired = false;
                break;
              default:
                break;
            }
          });
          return result;
        }, map);
      }
      return map;
    }
  },
  created() {
    this.getActivity(this.activityId);

    this.getActivityTickets().then((result) => {
      if (this.siteInfo.scopeType === 1) {
        this.ticketOptions = result.filter((ticket) => {
          return this.siteInfo.scope.includes(ticket.id);
        });
      } else {
        this.ticketOptions = result;
      }
    });
    this.getGroups().then((result) => {
      if (this.siteInfo.scopeType === 2) {
        this.groupOptions = result.rows.filter((group) => {
          return this.siteInfo.scope.includes(group.id);
        });
      } else {
        this.groupOptions = result.rows;
      }
    });
    this.getActivityFields().then(async (result) => {
      this.fields = result;
      if (!!this.attendeeId) {
        this.attendeeInfo = await this.getAttdendeeInfo();

        this.$nextTick(() => {
          setTimeout(() => {
            this.form.setFieldsValue({ ticketId: this.attendeeInfo.ticketId });
            this.form.setFieldsValue({ groupId: this.attendeeInfo.groupId });
            this.form.setFieldsValue({ avatar: this.attendeeInfo.avatar });
            this.form.setFieldsValue({ name: this.attendeeInfo.name });
            this.form.setFieldsValue({ mobile: this.attendeeInfo.mobile });
          }, 500);
          // 票种读取过滤字段
          this.getTicket(this.attendeeInfo.ticketId);
        });
      }
    });
    this.getRule().then((result) => {
      this.rules = result;
    });
  },
  methods: {
    // 提交
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields(async (err, formData) => {
        if (!err) {
          let values = [];
          const filterArray = [
            'ticketId',
            'groupId',
            'inviteCode',
            'avatar',
            'name',
            'mobile',
            'work',
            'sex',
            'job',
            'idCard'
          ];
          Object.keys(formData).map((key) => {
            if (!filterArray.includes(key)) {
              values = Object.keys(formData.values).map((_key) => ({
                fieldId: _key,
                value: Array.isArray(formData.values[_key])
                  ? formData.values[_key].join(',')
                  : formData.values[_key]
              }));
            }
          });

          values = values.filter((key) => key.value);

          const orginFormData = JSON.parse(
            JSON.stringify(formData, filterArray)
          );

          try {
            await this.$http.put(
              `/activities/${this.activityId}/attendees/${this.attendeeId}`,
              {
                ...orginFormData,
                values,
                origin: 4
              }
            );
            this.$message.success('修改成功');
            this.$router.push({
              name: 'attendeeList',
              params: {
                activityId: this.activityId,
                siteId: this.siteId
              },
              query: {
                status: -1
              }
            });
          } catch (error) {
            this.$message.error('添加失败');
          }
        }
      });
    },
    formatOptions(options) {
      const result = [];
      for (let key of Object.keys(options)) {
        result.push({
          label: options[key],
          value: options[key]
        });
      }
      return result;
    },

    // 获取门票种类
    async getActivityTickets() {
      try {
        const url = `/activities/${this.activityId}/tickets`;
        return await this.$http.get(url, {
          query: {
            silent: true
          }
        });
      } catch (error) {
        return [];
      }
    },
    // 获取组别信息
    async getGroups() {
      try {
        const url = `/activities/${this.activityId}/groups`;
        return await this.$http.get(url, {
          query: {
            silent: true
          }
        });
      } catch (error) {
        return [];
      }
    },
    async getAttdendeeInfo() {
      try {
        const uri = `/activities/${this.activityId}/attendees/${this.attendeeId}`;
        const result = await this.$http.get(uri);

        return result;
      } catch (error) {
        this.$message.error('获取参会人员信息出错');
        return {};
      }
    },
    async getActivityFields() {
      try {
        const uri = `/activities/${this.activityId}/fields`;
        return await this.$http.get(uri);
      } catch (error) {
        return [];
      }
    },

    // 获取添加规则
    async getRule() {
      try {
        const url = `/activities/${this.activityId}/rules`;
        return await this.$http.get(url, {
          query: {
            silent: true
          }
        });
      } catch (error) {
        return [];
      }
    },

    // 触发规则
    updateEffectRules(fieldId, key = '', isArray = false) {
      // 过滤当前id已有规则
      const newEffectRules = this.effectRules.filter(
        (rule) => rule.conditionFieldId !== fieldId
      );
      // 根据当前id添加规则
      const nowEffectRules = this.rules.filter((rule) => {
        if (isArray) {
          return (
            rule.conditionFieldId === fieldId &&
            key.split(',').includes(rule.conditionOptionKey)
          );
        } else {
          return (
            rule.conditionFieldId === fieldId && rule.conditionOptionKey === key
          );
        }
      });
      this.effectRules = [...newEffectRules, ...nowEffectRules];
    },

    // 活动详情
    async getActivity(activityId) {
      this.activityInfo = await this.$http.get(`/activities/${activityId}`);
    },

    // 获取门票信息
    async getTicket(ticketId) {
      this.ticketInfo = await this.$http.get(
        `/activities/${this.activityId}/tickets/${ticketId}`
      );
      this.ticketFields = await this.GetTicketFields(ticketId);

      this.$nextTick(() => {
        this.form.setFieldsValue({ idCard: this.attendeeInfo.idCard });
        this.form.setFieldsValue({ work: this.attendeeInfo.work });
        this.form.setFieldsValue({ sex: this.attendeeInfo.sex });
        this.form.setFieldsValue({ job: this.attendeeInfo.job });

        const fieldValues = this.attendeeInfo.fieldValues;
        fieldValues.map((fields) => {
          const type = fields.field.type;
          const fieldsValue = {};
          let key = `values.${fields.fieldId}`;
          if (type === 3) {
            fieldsValue[key] = fields.value.split(',');
          } else {
            fieldsValue[key] = fields.value;
          }
          this.form.setFieldsValue(fieldsValue);
        });
      });
    },

    // 门票显示隐藏添加报名字段
    async GetTicketFields(ticketId) {
      try {
        const uri = `/activities/${this.activityId}/tickets/${ticketId}/fields`;
        return await this.$http.get(uri);
      } catch (error) {
        return [];
      }
    }
  }
};
</script>

<style lang="scss">
@import '../../common/scss/index.scss';
</style>
