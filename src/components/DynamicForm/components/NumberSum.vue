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
import { add } from '@/utils/format'
import ComMixin from './comMixin'

export default {
  name: 'NumberSum',
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
      // 结构示例 a+b+c.d  解析后为 ['a','b',['c','d']] 意为 字段a + 字段b + 迭代组c内的d
      const kArr = (this.field.calc || '').split('+');
      kArr.forEach((k, i) => {
        if (typeof k === 'string' && k.indexOf('.') > 0) {
          let [k1, k2] = k.split('.');
          // 如果 k1 是 `x[0]` 格式, 则
          const r = /^([^ .]+)\[(\d+)\]$/gim.exec(k1);
          if (r) {
            k1 = { key: r[1], index: parseInt(r[2]) };
          }
          kArr[i] = [k1, k2];
        }
      });
      return kArr;
    },
    sumVal() {
      let fd = this.detailJson;
      let sumVal = 0;
      try {
        if (this.group.iterable && this.group.fieldName) {
          fd = this.detailJson[this.group.fieldName][this.groupIterateIndex];
        }
        // console.log('AnyForm::amountSum', { kArr, fd, _fd });
        this.kArr.forEach(k => {
          if (k instanceof Array) {
            const k1 = k[0];
            const k2 = k[1];
            if (typeof k1 === 'object' && k1.key) {
              const _v = ((fd[k1.key] || {})[k1.index] || {})[k2];
              const nv = Number(_v);
              sumVal = isNaN(nv) ? sumVal : add(sumVal, nv);
            } else {
              (fd[k1] || []).forEach(v => {
                const nv = Number(v[k2]);
                sumVal = isNaN(nv) ? sumVal : add(sumVal, nv);
              });
            }
          } else {
            const nv = Number(fd[k]);
            sumVal = isNaN(nv) ? sumVal : add(sumVal, nv);
          }
        });
      } catch (e) {
        console.warn(`numberSum组件[${this.fieldName}]计算时发生异常错误`, e);
      }
      return sumVal;
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
    }
  },
  mounted() {
    if (this.sumVal) {
      this.moduleValue = this.sumVal;
    }
  },
  methods: {
    triggerComputed() {
      if (this.sumVal) {
        this.moduleValue = this.sumVal;
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
