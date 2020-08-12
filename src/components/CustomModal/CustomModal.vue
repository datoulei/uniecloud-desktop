<template>
  <a-modal
    v-bind="$attrs"
    v-on="$listeners"
    wrapClassName="custom-modal"
    @cancel="$emit('cancel')"
    :destroyOnClose="destroyOnClose"
  >
    <slot name="okText"></slot>
    <slot name="cancelText"></slot>
    <div class="title" slot="title">
      <slot name="title">
        <span>{{ title || '标题' }}</span>
      </slot>
    </div>
    <slot></slot>
    <div class="button-group" slot="footer">
      <slot name="footer" :cancel="() => $emit('cancel')" :ok="() => $emit('ok')">
        <a-button class="a-button" type="primary" @click="$emit('ok')">{{ okText || '确认' }}</a-button>
        <a-button
          class="a-button"
          @click="$emit('cancel')"
          v-if="hiddenCancel === false"
        >{{ cancelText || '取消' }}</a-button>
      </slot>
    </div>
  </a-modal>
</template>
<script>
export default {
  props: {
    okText: String,
    cancelText: String,
    title: String,
    hiddenCancel: Boolean,
    destroyOnClose: Boolean
  }
};
</script>

<style lang="scss" scoped>
.button-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.title {
  display: flex;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
}
.a-button {
  height: 32px;
  & + .a-button {
    margin-left: 16px;
  }
}
</style>
<style lang="scss">
.custom-modal {
  .ant-modal-close-x {
    width: 46px;
    height: 46px;
    line-height: 46px;
  }
  .ant-modal-header {
    background-color: #f7f7f7;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 46px;
  }
  .ant-modal-footer {
    background-color: #f7f7f7;
    font-size: 14px;
    padding-top: 16px;
    padding-bottom: 16px;
  }
  .ant-modal-body {
    padding: 0 24px;
  }
}
</style>

