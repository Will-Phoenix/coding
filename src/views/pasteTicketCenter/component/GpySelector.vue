<template>
  <el-dropdown>
    <el-button type="primary">
      <slot name="default">高拍仪</slot>
      <i class="el-icon-arrow-down el-icon--right" />
    </el-button>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item @click.native="handleCommand('1')">汉王/科密高拍仪</el-dropdown-item>
      <el-dropdown-item @click.native="handleCommand('2')">良田高拍仪</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>

export default {
  name: 'GpySelector',
  data() {
    return {}
  },
  methods: {
    // deviceType 就是 GpyDialog.vue 组件所需的 deviceType 参数
    handleCommand(deviceType) {
      // console.log('handleCommand', deviceType)
      this.$emit("select", deviceType)
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
