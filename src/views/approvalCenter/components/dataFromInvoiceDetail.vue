<template>
  <el-dialog
    title="发票核算"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="520px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="dialog-content">
      <data-from-invoice :data="data" :invoice-num="invoiceNum" :show-detail="false" />
      <div v-if="travelList && travelList.length > 0">
        <div v-for="(v, index) in travelList" :key="index" class="item-container">
          <div class="flex-row">
            <div class="index">行程{{ index + 1 }}</div>
            <div class="name">{{ v.names ? v.names.join("、") : "" }}</div>
          </div>
          <div class="flex-row space-between">
            <div class="time">{{ v.beginTime }}</div>
            <div class="time" v-if="v.departValue">{{ v.departFullName.replaceAll(",", "/") + '-' + v.destFullName.replaceAll(",", "/") }}</div>
          </div>
          <div v-if="getKeys(v).length > 0" class="amount-container">
            <div v-for="v1 in getKeys(v)" :key="v1.key + index" class="amount">
              <div class="type">{{ v1.name }}</div>
              <div class="money">{{ v[v1.key] }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import DataFromInvoice from "@/views/approvalCenter/components/DataFromInvoice.vue";

export default {
  name: 'dataFromInvoiceDetail',
  components: { DataFromInvoice },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => {}
    },
    invoiceNum: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      keyList: [
        { key: 'trainCost', name: '火车费' },
        { key: 'nightVehicleCost', name: '夜间停车费' },
        { key: 'airAndShipCost', name: '飞机票' },
        { key: 'carCost', name: '汽车费' },
        { key: 'roomCost', name: '住宿费' },
        { key: 'otherCost', name: '其他费用' },
      ]
    }
  },
  computed: {
    travelList() {
      return (Object.keys(this.data).length > 0 && this.data?.travelList) ? this.data?.travelList : []
    },
  },
  methods: {
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    getKeys(v) {
      let v1 = []
      for (let i = 0; i < this.keyList.length; i++) {
        if (v[this.keyList[i].key]) {
          v1.push(this.keyList[i])
        }
      }
      return v1
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 0 20px 20px 20px !important;
}
.item-container {
  margin-top: 12px;
  background: #F4FAFB;
  border-radius: 8px;
  padding: 10px 10px;
  .flex-row {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .space-between {
    justify-content: space-between;
  }
  .index {
    height: 20px;
    background: #00B4C4;
    border-radius: 4px;
    font-weight: 500;
    font-size: 12px;
    color: #FFFFFF;
    text-align: center;
    line-height: 20px;
    padding: 0 10px;
  }
  .name {
    font-weight: 500;
    font-size: 14px;
    color: #292C33;
    line-height: 20px;
    margin-left: 8px;
  }
  .time {
    margin-top: 6px;
    font-weight: 400;
    font-size: 12px;
    color: #5C5F66;
    line-height: 17px;
  }
  .amount-container {
    border-radius: 4px;
    border-left: 1px solid #DBF2F5;
    border-top: 1px solid #DBF2F5;
    border-bottom: 1px solid #DBF2F5;
    margin-top: 5px;
    display: flex;
    flex-direction: row;
    background-color: #ffffff;
    .amount {
      flex: 1;
      border-right: 1px solid #DBF2F5;
      display: flex;
      flex-direction: column;
      align-items: center;
      .type {
        font-weight: 400;
        font-size: 12px;
        color: #00B4C4;
        line-height: 17px;
        margin-top: 2px;
      }
      .money {
        font-weight: 400;
        font-size: 12px;
        color: #292C33;
        line-height: 17px;
        margin-bottom: 2px;
      }
    }
  }
}
</style>
