<template>
  <div class="data-from-invoice">
    <img class="img" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/56110514-fdc0-44bc-8122-e58216db7181.png" alt="" />
    <div class="info ">{{ `已关联${invoiceNum}张发票，合计${sum}元` }}</div>
    <div v-if="showSwitch" class="operate" @click="onSwitch">切换发票</div>
    <div v-if="showSwitch" class="divider" />
    <div v-if="showDetail" class="operate" @click="onDetail">查看详情</div>
  </div>
</template>
<script>
export default {
  name: 'DataFromInvoice',
  props: {
    data: {
      type: Object,
      default: () => {}
    },
    invoiceNum: {
      type: Number,
      default: 0
    },
    showSwitch: {
      type: Boolean,
      default: false
    },
    showDetail: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    sum() {
      return Object.keys(this.data).length > 0 ? this.data?.billTotalCost : 0
    },
  },
  methods: {
    onDetail() {
      this.$emit('onDetail')
    },
    onSwitch() {
      this.$emit('onSwitch')
    }
  }
}
</script>
<style lang="scss" scoped>
.data-from-invoice {
  background: #FFF7F2;
  padding: 8px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  .img {
    width: 18px;
    height: 18px;
  }
  .info {
    flex: 1;
    font-weight: 500;
    font-size: 14px;
    color: #FA914B;
    line-height: 20px;
    margin-left: 5px;
  }
  .operate {
    font-weight: 500;
    font-size: 14px;
    color: #FA914B;
    line-height: 20px;
    cursor: pointer;
  }
  .divider {
    width: 1px;
    height: 11px;
    border: 1px solid #FA914B;
    margin: 0 7px 0 9px;
  }
}
</style>
