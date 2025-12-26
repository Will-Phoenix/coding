<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-input v-model="value" :maxlength="limit" :placeholder="placeholder" :readonly="true" @click.native="onOpenDialog" />
    <amount-calc-dialog :visible.sync="visible" :limit="limit" :exs-cost="exsCost" :exs-pay-list="exsPayList" :index="groupIterateIndex" @confirm="onConfirm" />
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import AmountCalcDialog from "@/components/Dialog/AmountCalcDialog.vue";
import { cashToChinese } from "@/utils/format";

export default {
  name: 'AmountInputCalc',
  components: { AmountCalcDialog },
  mixins: [ComMixin],
  data() {
    return {
      visible: false,
      value: '',
    }
  },
  computed: {
    rules() {
      return [
        {
          validator: this.validateAmount,
          trigger: 'change',
          required: !!this.required
        }
      ]
    },
    exsCost() {
      return this.detailJson.exsCost;
    },
    exsPayList() {
      return this.detailJson[this.group.fieldName];
    },
  },
  watch: {
    moduleValue(n) {
      this.updateHiddenFields({
        exsCostCn: cashToChinese(n)
      })
    }
  },
  mounted() {
    console.log("AmountInputCalc,mounted");
    if (this.moduleValue) {
      this.value = this.moduleValue;
    }
  },
  methods: {
    validateAmount(rule, value, callback) {
      if (value === '' || value == null) {
        if (this.required) {
          callback(new Error(this.requiredMessage));
        } else {
          callback();
        }
      } else if (!/^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/.test(`${value}`)) {
        callback(new Error(this.requiredMessage));
      } else {
        callback();
      }
    },
    onOpenDialog() {
      this.visible = true;
    },
    onConfirm(val) {
      this.value = val;
      this.moduleValue = val;
    }
  }
}
</script>
