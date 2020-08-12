<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'unite-conference-desktop'
};
</script>

<style lang="less">
@import '~normalize.css/normalize.css';
/* CSS */
body {
  background-color: #f5f5f5 !important;
  font-family: 'Microsoft Yahei';
}

.ant-select-dropdown-menu-item-active {
  background-color: #f7f7f7 !important;
}

.ant-table-thead
  > tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
  > td,
.ant-table-tbody
  > tr.ant-table-row-hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
  > td,
.ant-table-thead
  > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
  > td,
.ant-table-tbody
  > tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
  > td {
  background: #f7f7f7;
}
</style>
