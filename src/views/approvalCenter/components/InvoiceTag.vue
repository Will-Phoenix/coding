<template>
  <div class="invoice-tag">
    <div
      v-for="(v, index) in typeList"
      :key="index"
      :class="['tag-s-c', color]"
    >
      {{ v }}
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

export default defineComponent({
  name: 'InvoiceTag',

  props: {
    invoiceType: {
      type: String,
      default: ''
    },
    typeLable: {
      type: String,
      default: ''
    },
    groupId: {
      type: String,
      default: ''
    }
  },

  setup(props) {
    // 发票类型常量定义
    const normalTag = ref([
      'special_vat_invoice', // 增值税专用发票：专
      'normal_invoice', // 增值税普通发票：普
      'roll_normal_invoice', // 增值税普通发票（卷式）：卷
      'motor_vehicle_invoice', // 机动车销售发票：机动车
      'used_vehicle_invoice', // 二手车销售发票：二手车
    ])

    const elecTag = ref([
      'elec_special_vat_invoice', // 增值税电子专票：电、专
      'elec_normal_invoice', // 增值税普通发票（电子）：电、普
      'elec_invoice_special', // 全电发票（专用发票）：全电票、专
      'elec_invoice_normal', // 全电发票（普通发票）：全电票
      'toll_elec_normal_invoice', // 通行费增值税电子普通发票：电、通行
      'printed_elec_invoice', // 通用机打电子发票：电、机打
      'special_freight_transport_invoice', // 货运运输业增值税专用发票：电、货运
    ])

    const blockTag = ref([
      'blockchain_invoice' // 区块链发票：区块链
    ])

    // 计算标签颜色
    const color = computed(() => {
      if (props.invoiceType) {
        if (normalTag.value.findIndex(item => props.invoiceType == item) != -1) {
          return 'tag-b'
        } else if (elecTag.value.findIndex(item => props.invoiceType == item) != -1) {
          return 'tag-p'
        } else if (blockTag.value.findIndex(item => props.invoiceType == item) != -1) {
          return 'tag-q'
        }
      }
      // 把发票组的标签，加到这
      if (props.groupId) {
        return 'tag-g'
      }
      return 'tag-b'
    })

    // 计算标签列表
    const typeList = computed(() => {
      if (props.typeLable) {
        return props.typeLable.split(',')
      }
      return []
    })

    return {
      color,
      typeList
    }
  }
})
</script>

<style lang="scss" scoped>
.invoice-tag {
  display: flex;
  align-items: center;
  .tag-s-c {
    border-radius: 4px;
    font-size: 12px;
    color: #FFFFFF;
    line-height: 19px;
    text-align: center;
    padding: 0 4px;
    height: 19px;
    box-sizing: border-box;
    margin-left: 3px;
  }
  .tag-b {
    background: linear-gradient(180deg, #00B4C4 0%, rgba(0,180,196,0.6) 100%);
  }
  .tag-p {
    background: linear-gradient(180deg, #538EFF 0%, rgba(83,142,255,0.6) 100%);
  }
  .tag-q {
    background: linear-gradient(180deg, #906FFF 0%, rgba(144,111,255,0.6) 100%);
  }
  .tag-g {
    background: linear-gradient(180deg, #F4635A 0%, rgba(244,99,90,0.6) 100%);
  }
}

</style>
