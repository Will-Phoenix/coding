<template>
  <el-dialog
    title="智能差旅助手"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="30%"
    append-to-body
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div v-loading="loading">
      <div class="content-area mg-b-12" v-if="allData.amount">
        <div class="line">
          <div class="desc1">共{{ allData.userNum }}人出差</div>
          <div class="desc2 mg-l-auto">按照单位最新标准实时计算</div>
        </div>
        <div class="line mg-t-8">
          <div class="desc2">预计(不含路费)补助总金额</div>
          <img class="mg-l-auto icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/1690c3ca-7bb0-40a4-9745-a646c2a0a6c0.png" />
          <div class="money">{{ allData.amount }}</div>
        </div>
        <div class="tip-area" v-if="type === '3' && allData.leaderStandardFlag === '1'">
          <div class="tip">
            <div class="tip-icon"></div>
            <div class="tip-desc">与领导同行，可按照领导标准进行报销</div>
          </div>
        </div>
      </div>
      <div class="content-area">
        <el-tabs v-if="allData.diffStandardsList.length > 1" v-model="activeName" @tab-click="handleClick">
          <el-tab-pane v-for="(item, index) in allData.diffStandardsList" :key="index" :label="`报销标准${index + 1}`" :name="item.userNames" />
        </el-tabs>
        <div class="desc1 mg-b-12">{{ currentStandardsData.userNames }}</div>
        <el-tabs v-if="type === '3'" v-model="activeName2" type="card" @tab-click="handleClick2">
          <el-tab-pane v-for="(item, index) in currentStandardsData.diffDestList" :key="index" :label="item.destDistStr" :name="item.destDistStr" />
        </el-tabs>
        <table class="table">
          <tbody>
            <tr class="tr">
              <td class="td1">住宿费</td>
              <td class="td2">{{ currentStandardsData.peekAllowance }}元/日</td>
            </tr>
            <tr class="tr">
              <td class="td1 border-top">伙食费</td>
              <td class="td2 border-top">{{ currentStandardsData.foodAllowance }}元/日</td>
            </tr>
            <tr class="tr">
              <td class="td1 border-top">公杂费</td>
              <td class="td2 border-top">{{ currentStandardsData.publicMiscellaneousFees }}元/日</td>
            </tr>
            <tr class="tr" v-if="currentStandardsData.vehicleType">
              <td class="td1 border-top">交通工具</td>
              <td class="td2 border-top">{{ currentStandardsData.vehicleType }}</td>
            </tr>
            <tr class="tr" v-if="currentStandardsData.seat">
              <td class="td1 border-top">可乘坐座席</td>
              <td class="td2 border-top">{{ currentStandardsData.seat }}</td>
            </tr>
          </tbody>
        </table>
        <div class="travel-apply-standard-card-hotel-expense" v-if="currentStandardsData.peakSeasonfloatingDate1 || currentStandardsData.peakSeasonfloatingDate2 || currentStandardsData.peakSeasonfloatingDate3">
          <div class="travel-apply-standard-card-hotel-expense-title">该地区住宿费用的旺季浮动期间</div>
          <div class="flex mg-t-12" v-if="currentStandardsData.peakSeasonfloatingDate1">
            <div class="travel-apply-standard-card-hotel-expense-time">{{ currentStandardsData.peakSeasonfloatingDate1 }}</div>
            <div class="travel-apply-standard-card-hotel-expense-expense">住宿费用{{ currentStandardsData.peakSeasonFloatingRange1 }}元</div>
          </div>
          <div class="flex mg-t-12" v-if="currentStandardsData.peakSeasonfloatingDate2">
            <div class="travel-apply-standard-card-hotel-expense-time">{{ currentStandardsData.peakSeasonfloatingDate2 }}</div>
            <div class="travel-apply-standard-card-hotel-expense-expense">住宿费用{{ currentStandardsData.peakSeasonFloatingRange2 }}元</div>
          </div>
          <div class="flex mg-t-12" v-if="currentStandardsData.peakSeasonfloatingDate3">
            <div class="travel-apply-standard-card-hotel-expense-time">{{ currentStandardsData.peakSeasonfloatingDate3 }}</div>
            <div class="travel-apply-standard-card-hotel-expense-expense">住宿费用{{ currentStandardsData.peakSeasonFloatingRange3 }}元</div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import { APIGetOrderAIRule, APIGetApplyAIRule, APIGetRulesByOrderId } from "@/api/cicada/approval";

export default {
  name: "TravelAssistantDialog",
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 1: 申请单表单入口 2：报销单表单入口 3：申请单详情入口
    type: {
      type: String,
      default: "1"
    },
    // 差旅助手请求后端的数据,包括{ userIds: "", areaIds: "", days: "", vehicleType: "", orderId: "" }
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      activeName: "报销标准1",
      activeName2: "",
      allData: {
        diffStandardsList: [], // 不同标准的报销
        // hotelExpenseList: [],
        amount: "", // 差旅总金额
        userNum: "", // 出差人数
        leaderStandardFlag: 0 // 是否允许按同行领导标准报销（type==3时有）
      },
      currentStandardsData: {},
      loading: false
    }
  },
  computed: {
    method() {
      if (this.type === "1") {
        return APIGetApplyAIRule;
      } else if (this.type === "2") {
        if (this.data.days) {
          return APIGetOrderAIRule;
        } else {
          return APIGetApplyAIRule;
        }
      } else if (this.type === "3") {
        return APIGetRulesByOrderId;
      } else {
        return undefined;
      }
    },
    requestData() {
      if (this.type === "1") {
        return {
          userIds: this.data.userIds,
          areaIds: this.data.areaIds
        };
      } else if (this.type === "2") {
        if (this.data.days) {
          return {
            userIds: this.data.userIds,
            areaIds: this.data.areaIds,
            days: this.data.days,
            vehicleType: this.data.vehicleType
          };
        } else {
          return {
            userIds: this.data.userIds,
            areaIds: this.data.areaIds
          };
        }
      } else if (this.type === "3") {
        return this.data.orderId;
      } else {
        return {};
      }
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.init();
      } else {
        this.allData = {
          diffStandardsList: [],
          amount: "",
          userNum: ""
        };
      }
    }
  },
  methods: {
    init() {
      this.loading = true;
      this.method(this.requestData).then(res => {
        console.log("智能助手收据:", res.data)
        if (Array.isArray(res.data)) {
          this.allData.userNum = this.data.userIds.split(",").length; // 接口没有返回，直接从请求参数取
          this.allData.diffStandardsList = res.data;
        } else {
          if (this.type === "2") {
            this.allData.userNum = this.data.userIds.split(",").length; // 接口没有返回，直接从请求参数取
            this.allData.diffStandardsList = res.data.ruleListVOList.map(v => {
              return { userNames: v.userNames, ...v.ruleListVO[0] };
            });
          } else if (this.type === "3") {
            this.allData.userNum = res.data.userNum;
            this.allData.leaderStandardFlag = res.data.leaderStandardFlag;
            this.allData.diffStandardsList = res.data.applyOrderRuleUserVOS.map(v => {
              return { userNames: v.userNames, ...v.ruleListVO[0], diffDestList: v.ruleListVO };
            });
            this.activeName2 = this.allData.diffStandardsList[0].destDistStr;
          }
          this.allData.amount = res.data.amount;
        }
        this.activeName = this.allData.diffStandardsList[0].userNames;
        this.currentStandardsData = this.allData.diffStandardsList[0];
      })
        .finally(() => {
          this.loading = false;
        });
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    // 不同标准tab切换
    handleClick(row) {
      this.currentStandardsData = this.allData.diffStandardsList.filter(v => v.userNames === row.name)[0];
      this.activeName2 = this.currentStandardsData.destDistStr; // 切换标准tab后，把地区tab重置为对于标准下先前选择的地区
    },
    // 不同目的地tab切换
    handleClick2(row) {
      this.currentStandardsData = Object.assign(this.currentStandardsData, { ...this.currentStandardsData.diffDestList.filter(v => v.destDistStr === row.name)[0] });
    },
  }
}
</script>
<style scoped lang="scss">
.content-area {
  /*height: 124px;*/
  background: #fff;
  border-radius: 8px;
  padding: 17px 19px 16px 16px;
}

.mg-l-auto {
  margin-left: auto;
}

.mg-t-8 {
  margin-top: 8px;
}
.mg-t-12 {
  margin-top: 12px;
}
.mg-b-12 {
  margin-bottom: 12px;
}

.flex {
  display: flex;
  align-items: center;
}

.line {
  display: flex;
  align-items: center;
}

.desc1 {
  font-weight: bold;
  font-size: 14px;
  color: #333333;
  line-height: 20px;
}
.icon {
  width: 18px;
  height: 18px;
  margin-right: 2px;
}

.desc2 {
  font-size: 12px;
  color: #919499;
  line-height: 17px;
}

.money {
  font-weight: bold;
  font-size: 16px;
  color: #292C33;
  line-height: 22px;
}

.tip-area {
  margin-top: 12px;
  /*height: 34px;*/
  background: #FFF5EF;
  border-radius: 4px;
  opacity: 0.9;
  padding: 8px;

  .tip {
    display: flex;
    align-items: center;

    .tip-icon {
      width: 8px;
      height: 8px;
      background: #FA914B;
      border-radius: 50%;
      margin-right: 3px;
    }

    .tip-desc {
      font-size: 13px;
      color: #FF8635;
      line-height: 18px;
    }
  }
}
.table {
  border: 1px solid #E6EAED;
  border-collapse: collapse;
  width: 100%;

  .tr {
    height: 38px;
  }
  .td1 {
    width:156px;
    border-right: 1px solid #E6EAED;
    padding-left: 12px;
    background: #F9F9F9;
    font-weight: bold;
    font-size: 14px;
    color: #5C5F66;
  }
  .td2 {
    padding-left: 26px;
    font-size: 14px;
    color: #292C33;
  }
  .border-top {
    border-top: 1px solid #E6EAED;
  }
}

.travel-apply-standard-card-hotel-expense {
    margin: 12px 12px 0 0;
    .travel-apply-standard-card-hotel-expense-title {
      font-weight: bold;
      font-size: 14px;
      color: #333333;
      line-height: 20px;
      position: relative;
      text-align: left;
      font-style: normal;
      padding-left: 12px;
      &:before {
        position: absolute;
        content: " ";
        width: 8px;
        height: 8px;
        left: 0;
        top: 6px;
        background-color: #00B4C4;
        border-radius: 50%;
      }
    }
    .travel-apply-standard-card-hotel-expense-time {
      font-size: 14px;
      color: #5C5F66;
      line-height: 20px;
    }
    .travel-apply-standard-card-hotel-expense-expense {
      font-weight: bold;
      font-size: 14px;
      color: #00B4C4;
      line-height: 20px;
      margin-left: 4px;
    }
  }

::v-deep .el-dialog__header {
  background: #00B4C4;
  border-bottom: none !important;
  padding-left: 54px !important;
}
::v-deep .el-dialog__body {
  background: #00B4C4;
  padding: 0 20px 20px !important;
}
::v-deep .el-dialog__headerbtn .el-dialog__close {
  color: #FFFFFF;
  font-size: 16px !important;
}
::v-deep .el-dialog__title {
  color: #FFFFFF;
  font-size: 16px;
}
::v-deep .el-dialog__title:before {
  background: url("https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/fb9e0a40-1016-42d8-9643-2505aff59c2a.png") no-repeat;
  background-size: 28px 32px;
  width: 28px;
  height: 32px;
  left: -34px;
  top: calc((100% - 31px) / 2);
}
</style>
