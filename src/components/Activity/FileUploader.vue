<template>
  <a-upload
    class="avatar-uploader"
    :showUploadList="false"
    listType="picture-card"
    accept="image/*"
    :action="action"
    :data="extraData"
    @change="handleAfterUpload"
  >
    <img
      v-if="value"
      style="width: 64px; height: 64px;"
      :src="value"
      alt="file"
    />
    <div v-else class="avatar">
      <a-icon style="font-size: 20px;" :type="uploading ? 'loading' : 'plus'" />
      <div class="ant-upload-text">上传</div>
    </div>
  </a-upload>
</template>

<script>
import _ from 'lodash';
export default {
  props: {
    value: {
      required: true
    },
    face: {
      required: false
    }
  },
  computed: {
    action() {
      return process.env.VUE_APP_API + '/files';
    },
    extraData() {
      return { face: this.face };
    }
  },
  data() {
    return {
      uploading: false
    };
  },
  methods: {
    handleAfterUpload(result) {
      const url = _.get(result, 'file.response');
      if (url) {
        this.$emit('change', url);
      }
    }
  }
};
</script>

<style lang="less">
.avatar-uploader > .ant-upload {
  min-width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
