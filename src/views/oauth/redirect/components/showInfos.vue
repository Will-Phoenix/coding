<template>
  <div class="container">
    <img
      class="tips"
      src="https://image.smxzhcs.cn/media/M00/00/8D/CqDIlGdG4BqARa5_AAScsAd-G-I329.png"
      alt=""
    />
    <div class="btn-button" @click="toLogin">我已了解</div>
  </div>
</template>

<script>
export default {
  methods: {
    async toLogin() {
      await this.$store.dispatch('user/logout');
      this.$router.replace(`/login`);
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  width: 100vw;
  background: url("https://image.smxzhcs.cn/media/M00/00/8C/CqDIk2dG3_iANJ9qAApUFUN_G1k274.png")
    no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .tips {
    width: calc(1230 / 1920 * 100%);
    height: calc(804 / 1080 * 100%);
    object-fit: contain;
  }

  .btn-button {
    cursor: pointer;
    width: calc(335 / 1920 * 100%);
    height: calc(52 / 1080 * 100%);
    background: #e45b57;
    border-radius: calc(26 / 1080 * 100vh);
    font-size: calc(22 / 1920 * 100vw);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: calc(30 / 1080 * 100vw);
  }
}
</style>
