<template>
  <el-form-item
    v-if="showInFormCalc"
    :prop="fieldName"
    :label="label"
    :rules="manuallyTrigger ? rules : []"
  >
    <div class="half-day">
      <el-input class="date" v-model="moduleValue" :placeholder="placeholder" :maxlength="dynamicLimit" :readonly="!manuallyTrigger"></el-input>
      <el-button v-if="manuallyTrigger" class="half" type="text" @click="triggerComputed">智能计算</el-button>
    </div>
  </el-form-item>
</template>
<script>
import { cashToChinese, formatCash } from '@/utils/format'
import ComMixin from './comMixin'
import { APIGetOrderAIRule } from "@/api/cicada/approval"
import dayjs from "dayjs";

export default {
  name: 'TravelAllowance',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {
    dynamicLimit() {
      return this.manuallyTrigger ? this.limit : undefined;
    },
    getStandardData() {
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
        days: _days
      };
    },
    showInFormCalc() {
      let keyName = (this.group.fieldName ? this.group.fieldName + '.' : '') + this.field.fieldName;
      if (this.group.iterable) {
        keyName += '.' + this.groupIterateIndex;
      }
      return !(keyName && !this.fieldVisibleMap.get(keyName));
    }
  },
  watch: {
    sumVal(n) {
      if (!this.manuallyTrigger) {
        this.moduleValue = n;
      }
    },
    moduleValue(n) {
      this.updateHiddenFields({
        sumCostCn: cashToChinese(n)
      })
    },
    getStandardData(n) {
      if (!this.manuallyTrigger && n.userIds && n.areaIds && n.days) {
        APIGetOrderAIRule(n).then(res => {
          console.log("智能计算差旅标准：", res.data);
          this.moduleValue = formatCash(res.data.amount);
        });
      }
    }
  },
  mounted() {

  },
  methods: {
    triggerComputed() {
      console.log("getStandardData", this.getStandardData);
      if (this.getStandardData.userIds && this.getStandardData.areaIds && this.getStandardData.days) {
        APIGetOrderAIRule(this.getStandardData).then(res => {
          console.log("智能计算差旅标准：", res.data);
          this.moduleValue = formatCash(res.data.amount);
        });
      } else {
        this.$message.warning("请先选择出差人、目的地、开始时间和结束时间")
      }
    }
  }
}
</script>

<style scoped>
.half-day {
  display: flex;
  justify-content: space-between;
}
.date {
  flex: 1;
}
.half {
  margin-left: 10px;
}
</style>
