<template>
  <a-form class="form" :form="form" layout="horizontal">
    <div v-for="(index, i) in count" :key="i">
      <p class="title">参会人员{{index}}</p>
      <a-form-item label="姓名">
        <a-input
          placeholder="请输入姓名"
          v-decorator="[`data[${i}].name`, {rules: [{ required: true, message: '请输入姓名' }]}]"
        />
      </a-form-item>
      <a-form-item label="手机号码">
        <a-input
          placeholder="请输入手机号码"
          v-decorator="[`data[${i}].mobile`, {rules: [{ required: true, message: '请输入手机号码' }]}]"
        />
      </a-form-item>
      <!-- 自定义字段 -->
      <template v-for="(item, index) in fields">
        <a-form-item v-if="!item.isHidden" class="cover-form-label" :key="index" :label="item.name">
          <a-input
            class="long-input"
            v-if="item.type === 0"
            v-decorator="[`data[${i}].${item.id}`, {rules: [{ required: item.isRequired, message: `请输入${item.name}` }]}]"
          />
          <a-textarea
            class="long-input"
            v-else-if="item.type === 1"
            v-decorator="[`data[${i}].${item.id}`, {rules: [{ required: item.isRequired, message: `请输入${item.name}` }]}]"
          />
          <a-radio-group
            v-else-if="item.type === 2"
            :options="formatOptions(item.options)"
            v-decorator="[`data[${i}].${item.id}`, {rules: [{ required: item.isRequired, message: `请选择${item.name}` }]}]"
          />
          <a-checkbox-group
            v-else-if="item.type === 3"
            :options="formatOptions(item.options)"
            v-decorator="[`data[${i}].${item.id}`, {rules: [{ required: item.isRequired, message: `请选择${item.name}` }]}]"
          />
          <FileUploader
            v-else-if="item.type === 4"
            v-decorator="[`data[${i}].${item.id}`, {rules: [{ required: item.isRequired, message: `请上传图片` }]}]"
          />
          <!-- <a-upload
          v-else-if="item.type === 4"
          name="file"
          :showUploadList="false"
          accept="image/*"
          :action="action"
          @change="handleFieldUploadChange"
          :beforeUpload="handleBeforeFieldUpload(item, index)"
        >
          <img
            v-if="uploadMap[`data[${i}].${item.id}`]"
            style="width:64px;height:64px;"
            :src="uploadMap[`data[${i}].${item.id}`]"
            alt="file"
          />
          <div v-else class="avatar">
            <a-icon style="font-size:20px" :type="uploadingIndex === index ? 'loading' : 'plus'" />
            <div class="ant-upload-text">上传</div>
          </div>
          </a-upload>-->
          <a-select
            class="long-input"
            v-else-if="item.type === 5"
            v-decorator="[`data[${i}].${item.id}`, {rules: [{ required: item.isRequired, message: `请选择${item.name}` }]}]"
          >
            <a-select-option
              v-for="(field, index) in formatOptions(item.options)"
              :key="index"
              :value="field.value"
            >{{field.label}}</a-select-option>
          </a-select>
          <CascadeSelector
            v-else-if="item.type === 6"
            v-decorator="[`data[${i}].${item.id}`, {rules: [{ required: item.isRequired, message: `请选择${item.name}` }]}]"
            :field="item"
          />
        </a-form-item>
      </template>
    </div>
  </a-form>
</template>

<script>
import _ from 'lodash';
import CascadeSelector from './CascadeSelector';
import FileUploader from './FileUploader';
export default {
  props: {
    count: {
      type: Number,
      required: true
    },
    ticket: {
      type: Object,
      required: true
    }
  },
  components: {
    CascadeSelector,
    FileUploader
  },
  computed: {
    action() {
      return '/api/files';
    },
    fields() {
      try {
        return this.$store.state.fields;
      } catch (error) {
        return [];
      }
    },
    activity() {
      return this.$store.state.activity;
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      uploadMap: {},
      collectSelectMap: {},
      uploadingIndex: '',
      uploadingItem: {}
    };
  },
  methods: {
    formatOptions(options) {
      const result = Object.keys(options).map(key => ({
        label: key,
        value: options[key]
      }));
      return result;
    },
    handleBeforeUpload() {
      this.uploading = true;
    },
    handleUploadChange(result) {
      if (result && result.file && result.file.response) {
        this.avatar = result.file.response;
        this.uploading = false;
      }
    },
    handleBeforeFieldUpload(item, index) {
      return () => {
        this.uploadingIndex = index;
        this.uploadingItem = item;
      };
    },
    handleFieldUploadChange(result) {
      if (result && result.file && result.file.response) {
        this.uploadMap[this.uploadingItem.id + ''] = result.file.response;
        this.uploadingIndex = '';
        this.uploadingItem = {};
      }
    },
    formatCollectOptions(option, level, filter) {
      if (level === 0) {
        return Object.keys(option).map(item => {
          return { label: item, value: item };
        });
      } else if (level === 1) {
        const result = [];
        for (let key of Object.keys(option)) {
          if (option[key] && key === filter) {
            Object.keys(option[key]).map(item => {
              result.push({ label: item, value: item, parent: key });
            });
          }
        }
        return result;
      } else if (level === 2) {
        const result = [];
        for (let key of Object.keys(option)) {
          if (option[key]) {
            for (let subKey of Object.keys(option[key])) {
              if (option[key][subKey] && subKey === filter) {
                Object.keys(option[key][subKey]).map(item => {
                  result.push({ label: item, value: item, parent: subKey });
                });
              }
            }
          }
        }
        return result;
      }
    },
    generateCollectSelectMap(fields) {
      const collectSelectMap = {};
      for (let item of fields) {
        if (item.type === 6) {
          collectSelectMap[item.id + ''] = {
            first: '',
            second: '',
            third: ''
          };
        }
      }
      this.collectSelectMap = collectSelectMap;
    },
    async validate() {
      try {
        const values = await this.form.validateFields();
        console.log('TCL: validate -> values', values);
        this.register(values.data);
      } catch (error) {}
    },
    async register(forms) {
      try {
        await this.$axios.post(
          `/api/activities/${this.activity.id}/tickets/${this.ticket.id}/register`,
          { forms }
        );
        this.$router.replace({ name: 'pc-success', query: this.$route.query });
      } catch (error) {
        this.$message.error(_.get(error, 'response.data.message'));
      }
    }
  }
};
</script>

<style lang="less" scoped>
.title {
  margin-top: 60px;
  font-size: 20px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
  line-height: 28px;
  margin-bottom: 30px;
}
</style>
