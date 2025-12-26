<template>
  <div class="dashboard-container">
    <img class="img" :src="specialAccount? 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/0a1237e4-55c9-4754-9699-256234028a2d.png' : 'https://image.smxzhcs.cn/smxsc/M00/2C/98/CqDIlGUiWACAcAWsAALYXTzVAeY832.png'" alt="">
    <div class="text">
      <span>欢迎使用 </span>
      <span class="green">{{ specialAccount? "增信融资平台" : "电子凭证会计数据标准化平台" }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: 'Dashboard',
  data() {
    return {}
  },
  computed: {
    ...mapGetters(["userInfo"]),
    specialAccount() {
      return this.userInfo.userAccount === "rzadmin";
    }
  }
}
</script>
<style lang="scss" scoped>
.dashboard-container {
  background-color: white;
  width: 100%;
  height: 100%;
  min-width: 700px;
  min-height: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: auto;
  .img {
    width: 697px;
    height: 500px;
  }
  .text {
    font-size: 24px;
    font-weight: 500;
    color: #292C33;
    line-height: 33px;
    margin-top: 50px;
    white-space: nowrap;
    .green {
      color: #00B4C4;
    }
  }
}
</style>
