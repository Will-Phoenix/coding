<template>
  <el-dialog
    :title="(data && data.id? '编辑':'新增')+'支付信息'"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="付款类型" prop="paymentType">
        <el-select v-model="formData.paymentType" placeholder="请选择付款类型">
          <el-option label="银行支付" :value="1" />
          <el-option label="公务卡支付" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请金额" prop="payMoney">
        <el-input v-model="formData.payMoney" placeholder="请输入申请金额" />
      </el-form-item>
      <el-form-item label="用途" prop="useDes">
        <el-select v-model="formData.useDes" filterable allow-create placeholder="请输入用途">
          <el-option v-for="(item, index) in useOptions" :key="index" :label="item" :value="item"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="收款人" prop="payeeUserName">
        <div class="row-container">
          <!-- <el-input class="flex1" v-model="formData.payeeUserName" placeholder="请输入收款人" /> -->
          <el-autocomplete
            v-model="formData.payeeUserName"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入收款人"
            @select="handleSelect"
            class="flex1"
          />
          <el-button @click="() => { selectBankCardInfoVisible = true; }">选择</el-button>
          <div class="auto-fill" v-if="currUserBankInfo" @click="onSelect(currUserBankInfo)">自动填入</div>
        </div>
      </el-form-item>
      <el-form-item label="收款人账号" prop="payeeNo">
        <el-input v-model="formData.payeeNo" placeholder="请输入收款人账号" />
      </el-form-item>
      <el-form-item label="收款人开户行" prop="payeeBankName">
        <el-input v-model="formData.payeeBankName" placeholder="请输入收款人开户行" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
    <select-bank-card-info :visible.sync="selectBankCardInfoVisible" @confirm="onSelect" />
  </el-dialog>
</template>
<script>

import SelectBankCardInfo from "@/views/payInfoManagement/components/selectBankCardInfo.vue";
import { getListUseDes, postCcdBankCardReimbursementEntitySaveOrUpdate } from "@/api/business/payInfoManagement";
import { getCcdUserBankPage } from "@/api/business/bankCardInfoManagement";

export default {
  name: 'addPayInfo',
  components: { SelectBankCardInfo },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: Object,
      default: () => ({})
    },
    orderId: {
      type: String,
      default: ""
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      formData: {
        paymentType: '',
        payMoney: '',
        useDes: '',
        payeeUserName: '',
        payeeNo: '',
        payeeBankName: '',
      },
      rules: {
        paymentType: [{ required: true, message: '请选择' }],
        payMoney: [{ required: true, validator: this.validateAmount, trigger: 'blur' }],
        useDes: [{ required: true, message: '请输入' }],
        payeeUserName: [{ required: true, message: '请输入' }],
        payeeNo: [{ required: true, message: '请输入' }],
        payeeBankName: [{ required: true, message: '请输入' }],
      },
      selectBankCardInfoVisible: false,
      currUserBankInfo: undefined,
      userList: [],
      useOptions: []
    }
  },
  watch: {
    visible(n) {
      if (n) {
        // 编辑
        if (this.data.rpayId) {
          for (const key in this.formData) {
            this.formData[key] = this.data[key]
          }
        }
        this.loadBankInfo();
        this.loadUseOptions();
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.formData = {
          paymentType: '',
          payMoney: '',
          useDes: '',
          payeeUserName: '',
          payeeNo: '',
          payeeBankName: '',
        }
        this.currUserBankInfo = undefined;
      }
    },
  },
  mounted() {
    this.loadUserInfo();
  },
  methods: {
    querySearchAsync(queryString, cb) {
      var links = this.userList;
      var results = queryString ? links.filter(this.createFilter(queryString)) : links;
      console.log(results, 'queeeeeee', links, this.userList);
      cb(results);
    },
    createFilter(queryString) {
      return (link) => {
        return link.value.toLowerCase().includes(queryString);
      };
    },
    handleSelect(item) {
      this.formData.payeeUserName = item.name;
      this.formData.payeeBankName = item.baseOpened;
      this.formData.payeeNo = item.bankNumber;
    },
    loadBankInfo() {
      // 判断有用户名、无银行卡号和开户行的时候查询
      if (this.formData.payeeUserName && (!this.formData.payeeNo || !this.formData.payeeBankName)) {
        getCcdUserBankPage({ name: this.formData.payeeUserName, current: 1, size: 1000 }).then(res => {
          const list = res.data.records;
          if (list && list.length === 1) {
            this.currUserBankInfo = list[0];
          }
        })
      }
    },
    loadUserInfo() {
      getCcdUserBankPage({ name: "", current: 1, size: 1000 }).then(res => {
        this.userList = res.data.records.map(item => {
          return {
            value: item.name + ' ' + item.bankNumber + ' ' + item.cardTypeStr + ' ' + item.baseOpened,
            ...item,
          }
        });
      })
    },

    loadUseOptions() {
      getListUseDes().then(res => {
        this.useOptions = res.data;
      })
    },
    validateAmount(rule, value, callback) {
      if (value === '' || value == null) {
        callback(new Error("请输入金额"));
      } else if (!/^(([1-9]{1}\d*)|(0{1}))(\.\d{1,2})?$/.test(`${value}`)) {
        callback(new Error("请输入金额"));
      } else {
        callback();
      }
    },
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.data.rpayId) {
            postCcdBankCardReimbursementEntitySaveOrUpdate({ ...this.formData, rpayId: this.data.rpayId, billId: this.orderId }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } else {
            postCcdBankCardReimbursementEntitySaveOrUpdate({ ...this.formData, billId: this.orderId }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          }
        }
      })
    },
    onSelect(row) {
      this.formData.payeeUserName = row.name;
      this.formData.payeeNo = row.bankNumber;
      this.formData.payeeBankName = row.baseOpened;
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped>
.option-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .option-img {
    width: 32px;
    height: 32px;
  }
}
.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .flex1 {
    flex: 1;
  }
}
.auto-fill {
  color: #00B4C4;
  margin-left: 8px;
  cursor: pointer;
}
</style>
