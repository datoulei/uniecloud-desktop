<template>
  <a-modal :visible="visible" title="采集人像" width="360px" @cancel="close">
    <div class="sign-result">
      <video ref="video" class="video" />
      <div style="text-align: center;">
        <img src="~@/assets/carema.png" />
      </div>
    </div>
  </a-modal>
</template>

<script>
import { desktopCapturer } from 'electron'
export default {
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    open() {
      this.visible = true
      this.openCamera()
    },
    close() {
      this.visible = false
    },
    openCamera() {
      navigator.getUserMedia({ video: true }, this.handleStream, this.handleError)
    },
    handleStream(stream) {
      console.log('handleStream -> stream', stream)
      // const video = this.$refs.video.$el
      // video.srcObject = stream
      // video.onloadedmetadata = (e) => video.play()
    },
    handleError(err) {
      console.log('handleError -> err', err)
    },
  },
}
</script>

<style lang="scss" scoped>
.video {
  width: 320px;
  height: 240px;
  text-align: center;
  margin: 0 auto;
}
</style>