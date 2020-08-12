<template>
  <div>
    <a-modal
      v-bind="$attrs"
      v-on="$listeners"
      @cancel="$emit('cancel')"
      wrapClassName="sign-modal"
      :footer="null"
      :destroyOnClose="destroyOnClose"
    >
      <slot name="title">
        <div class="title" slot="title">
          <span>{{ title || '标题' }}</span>
        </div>
      </slot>
      <slot></slot>
    </a-modal>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    destroyOnClose: Boolean
  }
};
</script>

<style lang="scss" scoped>
.title {
  display: flex;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: rgba(51, 51, 51, 1);
}
</style>
<style lang="scss">
.sign-modal {
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

