<template>
  <div class="page">
    <div class="banner"></div>
    <div class="main">
      <div class="header">
        <a-icon class="btn close-btn" type="close" @click="handleClose" />
      </div>
      <div class="body">
        <div class="title">欢迎使用</div>
        <a-form ref="form" :form="form">
          <a-form-item>
            <a-input
              v-decorator="['username', { rules: [{ required: true, message: '该项不能为空' }] }]"
              class="input"
              placeholder="请输入手机号码/签到账号"
              @keyup.enter="handleSubmit"
            ></a-input>
          </a-form-item>
          <a-form-item>
            <a-input
              v-decorator="['password', { rules: [{ required: true, message: '该项不能为空' }] }]"
              type="password"
              class="input"
              placeholder="请输入密码"
              @keyup.enter="handleSubmit"
            ></a-input>
          </a-form-item>
        </a-form>
        <a-button class="login-btn" type="primary" @click="handleSubmit">登录</a-button>
      </div>
      <div class="footer">
        <span @click="openURL('http://event.uniecloud.com/#/forget')">忘记密码</span>
        <div class="divider"></div>
        <span @click="openURL('http://event.uniecloud.com/#/register')">注册</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { rejects } from 'assert'

export default {
  data() {
    return {
      form: this.$form.createForm(this),
    }
  },
  // created() {
  //   const map = [{ id: 1 }, { id: 2 }, { id: 3 }];
  //   this.Test(map).then(rst => {
  //     console.log(JSON.stringify(rst));
  //   });
  // },
  methods: {
    // Test(arr) {
    //   return Promise.all(
    //     arr.map(item => {
    //       return new Promise(resolve => {
    //         switch (item.id) {
    //           case 1:
    //             setTimeout(() => {
    //               item.id = 10;
    //               resolve(item);
    //             }, 1000);
    //             break;
    //           case 2:
    //             setTimeout(() => {
    //               item.id = 20;
    //               resolve(item);
    //             }, 2000);
    //             break;
    //           case 3:
    //             setTimeout(() => {
    //               item.id = 30;
    //               resolve(item);
    //             }, 3000);
    //             break;
    //           default:
    //             break;
    //         }
    //       });
    //     })
    //   );
    // },
    async handleSubmit() {
      try {
        const form = await this.form.validateFields()
        const { token } = await this.$http.post('/auth/login', {
          ...form,
          type: 2,
        })
        await this.$message.success('登录成功！', 1)
        ipcRenderer.sendSync('login', token)
      } catch (error) {
        console.log(error)
      }
    },
    handleClose() {
      ipcRenderer.send('window', 'close')
    },
    openURL(url) {
      this.$electron.remote.shell.openExternal(url)
    },
  },
}
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: row;
  & > div {
    flex: 1;
  }
  .banner {
    background-image: url('~@/assets/login-banner.png');
    background-size: cover;
    -webkit-app-region: drag;
  }
  .main {
    height: 434px;
    display: flex;
    flex-direction: column;
    .header {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      .close-btn {
        margin-top: 16px;
        margin-right: 16px;
        width: 12px;
        height: 12px;
        cursor: pointer;
      }
    }
    .body {
      flex: 1;
      margin: 52px 48px 0;
      .title {
        font-size: 24px;
        font-weight: 500;
        color: rgba(51, 51, 51, 1);
        line-height: 33px;
        margin-bottom: 24px;
      }
      .input {
        width: 282px;
        height: 40px;
        background: rgba(243, 243, 243, 1);
        border-radius: 2px;
        border: 1px solid rgba(229, 229, 229, 1);
      }
      .login-btn {
        margin-top: 16px;
        width: 282px;
        height: 40px;
        background: rgba(246, 15, 15, 1);
        border-radius: 2px;
      }
    }
    .footer {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(153, 153, 153, 1);
      line-height: 16px;
      & > span {
        cursor: pointer;
      }
      .divider {
        margin: 0 16px;
        width: 1px;
        height: 8px;
        background: rgba(238, 238, 238, 1);
      }
    }
  }
}
</style>
