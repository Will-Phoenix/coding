<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-input v-model="moduleValue" :maxlength="limit" :placeholder="placeholder" :readonly="readonly" />
    <travelAssistantBar v-if="showAssistantBar" :type="type" :data="assistantData" />
  </el-form-item>
</template>
<script>
import { cashToChinese } from '@/utils/format'
import ComMixin from './comMixin'
import travelAssistantBar from "@/views/approvalCenter/components/travelAssistantBar.vue";
import dayjs from "dayjs";

export default {
  name: 'AmountInput',
  components: { travelAssistantBar },
  mixins: [ComMixin],
  data() {
    return {

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
    showAssistantBar() {
      // 勾选了“智能差旅助手”的差旅报销单，展示在字段设置为standardCost的金额输入组件下
      return this.appFormConf.relTravelAssist && this.field.fieldName === "standardCost" && this.appFormConf.orderType == "2";
    },
    type() {
      return this.appFormConf.formType.toString();
    },
    assistantData() {
      let _days = this.getValueFromCurrentGroup("days");
      // 若是没有days这个字段，检查是否有beginTime和endTime字段，若有则计算出来
      if (!_days) {
        const beginTime = this.getValueFromCurrentGroup("beginTime");
        const endTime = this.getValueFromCurrentGroup("endTime");
        if (beginTime && endTime) {
          const getDays = dayjs(endTime).diff(dayjs(beginTime), 'day');
          if (!isNaN(getDays)) {
            _days = getDays < 0 ? getDays - 1 : getDays + 1;
          }
        }
      }
      return {
        userIds: this.getValueFromCurrentGroup("travelUserIds"),
        areaIds: this.getValueFromCurrentGroup("dest"),
        days: _days,
        vehicleType: this.getValueFromCurrentGroup("vehicleType")
      };
    }
  },
  watch: {
    moduleValue(n) {
      this.updateHiddenFields({
        exsCostCn: cashToChinese(n)
      })
    }
  },
  mounted() {

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
    }
  }
}
</script>
