<template>
  <div class="approval-center-container">
    <!-- <div class="breadcrumb-container">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/appDashbordHome/index' }">
          <i class="el-icon-s-home"></i>
        </el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/approvalCenter/list' }">审批中心</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/approvalCenter/detail' }">申请单详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="back-button">
        <i class="el-icon-arrow-left"></i>
        返回
      </div>
    </div> -->
    <div class="approval-center-content">
      <transition name="fade-transform" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>
<script>

</script>
  <style lang="scss" scoped>
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}
.approval-center-container{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.breadcrumb-container {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;

}
.approval-center-content{
  // height: calc(100% - 120px);
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 58px;
  height: 23px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #edeff2;
  line-height: 23px;
  justify-content: center;
  font-size: 12px;
  color: #5c5f66;
}
</style>
