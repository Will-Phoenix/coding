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
import ComMixin from './comMixin'
import dayjs from 'dayjs';

export default {
  name: 'DaysDiff',
  mixins: [ComMixin],
  data() {
    return {

    }
  },
  computed: {
    dynamicLimit() {
      return this.manuallyTrigger ? this.limit : undefined;
    },
    kArr() {
      // 结构示例 a-b  解析后为 [a,b] 意为 字段a 减 字段b
      return (this.field.calc || '').split('-');
    },
    diffVal() {
      let fd = this.detailJson;
      let diffVal = '';
      try {
        if (this.group.iterable && this.group.fieldName) {
          fd = this.detailJson[this.group.fieldName][this.groupIterateIndex];
        }
        const beginTime = fd[this.kArr[1]];
        const endTime = fd[this.kArr[0]];
        if (beginTime && endTime) {
          // console.log('AnyForm::daysDiff::', { beginTime, endTime });
          // 如果是 半天选择器得到的值, 则其值会包含上午下午
          if (/午/.test(beginTime) || /午/.test(endTime)) {
            const [b1, beginHDay] = beginTime.split(' ');
            const [e1, endHDay] = endTime.split(' ');
            const days = dayjs(e1).diff(dayjs(b1), 'day');
            if (!isNaN(days)) {
              diffVal = days;
              if (days >= 0) {
                if (days === 0 && endHDay == '上午' && beginHDay == '下午') {
                  diffVal = -1;
                } else if (beginHDay == endHDay) {
                  diffVal = diffVal + 0.5;
                } else if (endHDay == '上午' && beginHDay == '下午') {
                } else if (endHDay == '下午' && beginHDay == '上午') {
                  diffVal = diffVal + 1;
                }
              } else {
                if (beginHDay == endHDay) {
                  diffVal = diffVal - 0.5;
                } else if (endHDay == '上午' && beginHDay == '下午') {
                  diffVal = diffVal - 1;
                } else if (endHDay == '下午' && beginHDay == '上午') {
                }
              }
            }
          } else {
            const days = dayjs(endTime).diff(dayjs(beginTime), 'day');
            // console.log('AnyForm::daysDiff::days', { days });
            if (!isNaN(days)) {
              diffVal = days < 0 ? days - 1 : days + 1;
            }
          }
        }
      } catch (e) {
        console.warn(`numberSum组件[${this.fieldName}]计算时发生异常错误`, e);
      }
      return diffVal;
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
    diffVal(n) {
      if (!this.manuallyTrigger) {
        this.moduleValue = n;
      }
    }
  },
  mounted() {
    if (this.moduleValue && parseInt(this.moduleValue) === this.moduleValue * 1) {
      this.moduleValue = parseInt(this.moduleValue) + ''
    }
  },
  methods: {
    triggerComputed() {
      if (this.diffVal) {
        this.moduleValue = this.diffVal;
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
