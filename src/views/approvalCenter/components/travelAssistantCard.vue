<template>
  <div>
    <travelAssistantBar :type="type" :data="data" :title="title" :button-name="buttonName" />
    <div class="info">
      <div class="title">共{{ detail.userNum }}人出差</div>
      <div class="line">
        <div class="filed">预计(不含路费)补助总金额</div>
        <img class="mg-l-auto icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/1690c3ca-7bb0-40a4-9745-a646c2a0a6c0.png"/>
        <div class="money">{{ detail.amount }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import travelAssistantBar from "@/views/approvalCenter/components/travelAssistantBar.vue";
import { APIGetRulesByOrderId } from "@/api/cicada/approval";

export default {
  name: "travelAssistantCard",
  components: { travelAssistantBar },
  props: {
    // 1: 申请单表单入口 2：报销单表单入口 3：申请单详情入口
    type: {
      type: String,
      default: "3"
    },
    // 差旅助手请求后端的数据,包括{ userIds: "", areaIds: "", days: "", vehicleType: "", orderId: "" }
    data: {
      type: Object,
      default: () => ({})
    },
    // travelAssistantBar组件中title
    title: {
      type: String,
      default: "智能差旅助手"
    },
    // travelAssistantBar组件中button的名称
    buttonName: {
      type: String,
      default: "查看详情"
    }
  },
  data() {
    return {
      detail: {}
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      APIGetRulesByOrderId(this.data.orderId).then(res => {
        this.detail = res.data;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.info {
  height: 74px;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px 12px 14px 12px;
  margin-bottom: 7px;
  margin-top: -3px;
}
.title {
  font-weight: bold;
  font-size: 14px;
  color: #333333;
  line-height: 20px;
}
.line {
  display: flex;
  align-items: center;
  .filed {
    font-size: 12px;
    color: #919499;
    line-height: 17px;
  }

  .mg-l-auto {
    margin-left: auto;
  }

  .icon {
    width: 18px;
    height: 18px;
    margin-right: 2px;
  }

  .money {
    font-weight: bold;
    font-size: 16px;
    color: #292C33;
    line-height: 22px;
  }
}
</style>
