<template>
  <div class="bar" @click="openAssistantCard">
    <img src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/4e38795c-7182-490a-87d0-382e7f7cdf52.png" class="icon">
    <div class="text">{{ title }}</div>
    <div class="border"></div>
    <div class="btn">{{ buttonName }}</div>
    <TravelAssistantDialog :visible.sync="dialog.visible" :data="dialog.data" :type="dialog.type" />
  </div>
</template>

<script>
import TravelAssistantDialog from "@/views/approvalCenter/components/travelAssistantDialog.vue";

export default {
  name: "travelAssistantBar",
  components: { TravelAssistantDialog },
  props: {
    // 1: 申请单表单入口 2：报销单表单入口 3：申请单详情入口
    type: {
      type: String,
      default: "1"
    },
    // 差旅助手请求后端的数据,包括{ userIds: "", areaIds: "", days: "", vehicleType: "", orderId: "" }
    data: {
      type: Object,
      default: () => ({})
    },
    // bar的title
    title: {
      type: String,
      default: "智能AI提醒：差旅目的地报销标准"
    },
    // bar的button的名称
    buttonName: {
      type: String,
      default: "查看"
    }
  },
  data() {
    return {
      dialog: {
        visible: false,
        data: {},
        type: ""
      }
    }
  },
  methods: {
    openAssistantCard() {
      console.log("请求数据：", JSON.stringify(this.data));
      if (!this.data.orderId && (!this.data.userIds || !this.data.areaIds)) {
        this.$message.warning("请先选择出差人和目的地");
        return;
      }
      Object.assign(this.dialog, { visible: true, type: this.type, data: this.data });
    }
  }
}
</script>

<style lang="scss" scoped>
.bar {
  /*min-width: 338px;*/
  height: 40px;
  background: linear-gradient(270deg, #37CDF1 0%, #3779F1 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin-top: 5px;
  cursor: pointer;

  .icon {
    width: 25px;
    height: 28px;
    margin-left: 8px;
  }

  .text {
    font-weight: bold;
    font-size: 12px;
    color: #FFFFFF;
    line-height: 17px;
    margin-left: 5px;
  }

  .border {
    width: 1px;
    height: 16px;
    border: 1px solid #FFFFFF;
    opacity: 0.6;
    margin-left: auto;
  }

  .btn {
    font-weight: bold;
    font-size: 12px;
    color: #FFFFFF;
    line-height: 17px;
    margin-left: 8px;
    margin-right: 12px;
  }
}
</style>
