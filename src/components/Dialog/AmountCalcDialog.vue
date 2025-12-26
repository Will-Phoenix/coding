<template>
  <el-dialog
    title="收款金额"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center form-script-dialog"
    lock-scroll
    append-to-body
    width="500px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div>
      <div class="text-5">报销支付明细{{ index + 1 }}</div>
      <el-form ref="form" :model="formData" :rules="rules">
        <el-form-item prop="amount">
          <el-input v-model="formData.amount" :limit="limit" placeholder="请输入金额" />
          <div class="row-flex mt-8">
            <div class="text-1 flex1">报销单剩余金额<span class="text-2">￥{{ calAmount }}</span></div>
            <div class="text-3" style="cursor: pointer;" @click="onFill">填充剩余金额</div>
          </div>
        </el-form-item>
      </el-form>
      <div class="text-5">支付明细</div>
      <div v-for="(item, i) in exsPayList" :key="i">
        <div class="row-flex bg mb-8">
          <img class="img" :src="payeeWayIcon[item.payeeWay]" alt="" />
          <div class="flex1 ml-8">
            <div class="text-2">{{ item.payeeName || '-' }}</div>
            <div class="text-1">{{ item.payeeWay || '-' }}</div>
          </div>
          <div class="ta-r">
            <div class="text-1">支付明细{{ i + 1 }}</div>
            <div class="text-2">￥{{ item.payeeCost }}</div>
          </div>
        </div>
      </div>
      <div class="row-flex mt-8">
        <div class="text-2 flex1">报销单总金额</div>
        <div class="text-4">￥{{ exsCost }}</div>
      </div>
      <span slot="footer" class="btn-container">
        <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
        <el-button type="primary" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
      </span>
    </div>
  </el-dialog>
</template>

<script>

export default {
  name: 'AmountCalcDialog',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时会更新
    exsPayList: {
      type: Array,
      default: []
    },
    exsCost: {
      type: String,
      default: ''
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: 10
    },
    index: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      formData: {
        amount: ''
      },
      rules: {
        amount: [{
          validator: this.validateAmount,
          trigger: 'change',
          required: !!this.required
        }],
      },
      payeeWayIcon: {
        '公务卡': 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/168f0dc3-484c-4bea-ba7b-b40afc699ba5.png',
        '银行卡': 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/bc119794-9119-49b4-824b-95990cdfe8d8.png',
        '': 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/bc119794-9119-49b4-824b-95990cdfe8d8.png',
      }
    }
  },
  computed: {
    calAmount() {
      let sum = parseFloat(this.exsCost);
      if (sum != null && !isNaN(sum)) {
        if (this.exsPayList && this.exsPayList.length > 0) {
          this.exsPayList.forEach((v, i) => {
            if (i !== this.index) {
              let temp = parseFloat(v.payeeCost);
              if (temp != null && !isNaN(temp)) {
                sum = sum - temp;
              }
            }
          });
        }
        return sum.toFixed(2);
      }
      return '';
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.formData.amount = this.exsPayList[this.index].payeeCost;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    },
    formData: {
      handler: function handler() {
        this.onInputChange();
      },
      deep: true
    },
  },
  methods: {
    init() {
      this.text = this.value
    },
    onConfirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('confirm', this.formData.amount)
          this.updateVisible(false);
        }
      });
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    validateAmount(rule, value, callback) {
      if (value === '' || value == null) {
        callback(new Error("请输入金额"));
      } else if (!/^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/.test(`${value}`)) {
        callback(new Error("请输入正确的金额"));
      } else {
        if (this.formData.amount && this.calAmount) {
          const val1 = parseFloat(this.formData.amount);
          const val2 = parseFloat(this.calAmount);
          if (val1 > val2) {
            callback(new Error("请输入不超过" + this.calAmount + "的金额"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
    },
    onInputChange() {
      console.log('onInputChange====', this.calAmount);
      this.exsPayList[this.index].payeeCost = this.formData.amount;
    },
    onFill() {
      this.formData.amount = this.calAmount;
      this.exsPayList[this.index].payeeCost = this.calAmount;
    }
  }
}
</script>
<style lang="scss" scoped>
.row-flex {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.text-1 {
  font-weight: 400;
  font-size: 12px;
  color: #919499;
  line-height: 21px;
}
.text-2 {
  font-size: 14px;
  color: #292C33;
  line-height: 21px;
  font-weight: 500;
}
.text-3 {
  font-weight: 400;
  font-size: 12px;
  color: #00B4C4;
  line-height: 21px;
}
.text-4 {
  font-weight: 400;
  font-size: 16px;
  color: #00B4C4;
  line-height: 21px;
}
.text-5 {
  font-weight: 400;
  font-size: 14px;
  color: #5C5F66;
  line-height: 21px;
  margin: 0 0 12px 0;
}
.flex1 {
  flex: 1;
}
.img {
  width: 32px;
  height: 32px;
}
.bg {
  background: #F9FBFF;
  border-radius: 8px;
  padding: 8px 12px;
}
.mt-8 {
  margin-top: 8px;
}
.mb-8 {
  margin-bottom: 8px;
}
.ml-8 {
  margin-left: 8px;
}
.ta-r {
  text-align: right;
}
.btn-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
</style>
