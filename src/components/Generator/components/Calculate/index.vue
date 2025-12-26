<template>
  <div>
    <template v-if="!detailed">
      <el-input v-model="innerValue" v-if="isStorage==1" readonly placeholder="用于展示计算结果，且数据不会保存" />
      <el-input v-model="innerValue" v-else readonly placeholder="用于展示计算结果，且数据同时会保存入库" />
    </template>
    <p v-else class="jnpf-detail-text">{{innerValue}}</p>
  </div>
</template>
<script>
import { mergeNumberOfExps, validExp, toRPN, calcRPN, debounce } from '../../utils'
export default {
  model: {
    prop: 'value',
    event: 'input'
  },
  props: [
    "value",
    "formData",
    "expression",
    "tableVModel",
    "componentVModel",
    'isStorage',
    "rowIndex", // 计算公式放在表格中时， 需要获取在表格中的行位置
    "detailed"
  ],
  name: 'calculate',
  data() {
    return {
      innerValue: this.value,
      RPN_EXP: toRPN(mergeNumberOfExps(this.expression))
    }
  },
  computed: {
    rootFormData() {
      return this.formData || this.getFormData()
    },
  },
  methods: {
    getFormData() {
      var root = this.$parent
      while (root) {
        if ('vmFormData' in root) {
          return root.vmFormData
        }
        root = root.$parent
      }
    },
    /**
     * 获取指定组件的值
     */
    getFormVal(vModel) {
      try {
        if (vModel.indexOf('.') > -1) {
          let [tableVModel, cmpVModel] = vModel.split('.')
          if (typeof this.rowIndex === 'number') {
            return this.rootFormData[tableVModel][this.rowIndex][cmpVModel] || 0
          } else {
            return this.rootFormData[tableVModel].reduce((sum, c) => (c[cmpVModel] ? Number(c[cmpVModel]) : 0) + sum, 0)
          }
        }
        return this.rootFormData[vModel] || 0
      } catch (error) {
        console.warn('计算公式出错, 可能包含无效的组件值', error)
        return 0
      }
    },
    /**
     * 计算表达式
     */
    execRPN() {
      const temp = this.RPN_EXP.map(t => typeof t === 'object' ? this.getFormVal(t.__vModel__) : t)
      this.innerValue = Number.parseFloat(calcRPN(temp)).toFixed(2)
      if (isNaN(this.innerValue)) this.innerValue = 0
      this.$emit('input', this.innerValue)
      if (this.rowIndex >= 0 && this.componentVModel && this.tableVModel) {
        if (this.rootFormData[this.tableVModel][this.rowIndex][this.componentVModel] !== this.innerValue) {
          this.$emit('change', this.innerValue)
        }
      }
    }
  },
  watch: {
    formData: {
      handler: function (val) {
        if (!val) return
        if (!this.computeExps) { // formData更新可能比较频繁
          this.computeExps = debounce(this.execRPN, 100)
        }
        this.computeExps()
      },
      deep: true,
      immediate: true
    }
  }
}
</script>