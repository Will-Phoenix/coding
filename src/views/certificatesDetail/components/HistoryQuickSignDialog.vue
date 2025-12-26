<template>
  <el-dialog title="历史凭证列表" :visible.sync="dialogVisible" width="80%" append-to-body>
    <div class="search-box">
      <el-form :inline="true" :model="form" ref="formRef">
        <el-form-item label="年度" prop="year">
          <el-date-picker format="yyyy" value-format="yyyy" v-model="form.year" type="year" placeholder="请选择年度">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="期间/月" prop="month">
          <el-date-picker format="MM" value-format="MM" v-model="form.month" type="month" placeholder="请选择期间/月">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="科目编号" prop="accountCode">
          <el-input v-model="form.accountCode" placeholder="请输入科目编号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">搜索</el-button>
          <el-button type="default" @click="resetForm">清空</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table-box">
      <el-table :data="finallyDatas" border align="center">
        <el-table-column align="center" type="index" label="序号" width="50"></el-table-column>
        <el-table-column align="center" property="businessDate" label="凭证日期" width="150"></el-table-column>
        <el-table-column align="center" property="accountCode" label="凭证编号" width="200"></el-table-column>
        <el-table-column align="center" property="explanation" label="摘要" min-width="200">
          <template slot="header" slot-scope="scope">
            <el-input v-model="summaryQuery" type="mini" placeholder="输入摘要搜索" />
          </template>
        </el-table-column>
        <el-table-column align="center" property="price" label="凭证金额" min-width="150">
          <template slot="header" slot-scope="scope">
            <el-input v-model="moneyQuery" type="mini" placeholder="输入金额搜索" />
          </template>
        </el-table-column>
        <el-table-column align="center" property="createUserName" label="制单人" width="200"></el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">引用该单据</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getHistoricalVouchersList } from '@/api/history';
export default {
  data() {
    return {
      summaryQuery: '',
      moneyQuery: '',
      form: {
        year: '',
        month: '',
        accountCode: '',
      },
      dialogVisible: false,
      gridData: [],
    }
  },
  computed: {
    finallyDatas() {
      // this.summary为空 返回 this.gridData
      // this.money 返回 this.gridData
      // money有值时校验this.gridData每一项的money
      // summary有值时校验this.gridData每一项的summary
      // money和summary都有值时校验 this.gridData每一项的summary和money
      if (this.summaryQuery || this.moneyQuery) {
        if (this.summaryQuery && this.moneyQuery) {
          return this.gridData.filter(item => item.explanation.includes(this.summaryQuery) && (item.price && item.price.includes(this.moneyQuery)))
        } else if (this.summaryQuery) {
          return this.gridData.filter(item => item.explanation.includes(this.summaryQuery))
        } else {
          return this.gridData.filter(item => item.price && item.price.includes(this.moneyQuery))
        }
      }
      return this.gridData
    }
  },
  methods: {
    // 判断入参是否大于0, 入参可能是 null,undefined,"",0.00,0,数字等
    isGreaterThanZero(val) {
      if (val != null) {
        return `${val}` * 1 > 0;
      }
      return false;
    },
    // 获取入参中首个遇到的大于0的值
    getValueGtZero(...values) {
      for (let i = 0; i < values.length; i++) {
        if (this.isGreaterThanZero(values[i])) {
          return values[i]
        }
      }
    },
    resetForm() {
      this.$refs.formRef.resetFields();
      this.getHistorysLists();
    },
    getHistorysLists() {
      getHistoricalVouchersList(this.form).then(res => {
        console.log(res);
        this.gridData = res.data.map(v => {
          v.cashflow = v.cashflow || [];
          v.assvos = v.assvos || [];
          v.price = v.price || "0.00";
          v.createUserName = v.createUserName || "-";
          v.accountCode = v.accountCode || "-";
          const xjll = v.cashflow.map(item => {
            const main = item.mainCodeText ? `【${item.mainCodeText}： ${item.localamount}】` : '';
            const sub = item.subCodeText ? `【${item.subCodeText}： ${item.localamount}】` : ''
            return main + sub;
          }).join("")
          let fzhs = v.assvos.map(v => v.m_checkvaluename ? `【${v.m_checktypename}： ${v.m_checkvaluename}】` : `【${v.m_checktypename}： ~】`).join("");
          return {
            amount: this.getValueGtZero(v.amount, v.debitAmount, v.creditAmount),
            quant: this.getValueGtZero(v.quant, v.debitQuant, v.creditQuant),
            xjll,
            fzhs,
            ...v
          }
        });
      }).catch(err => {
        console.log(err);
      })
    },
    onSubmit() {
      console.log('submit!');
      console.log(this.form);
      this.getHistorysLists();
    },
    init() {
      this.dialogVisible = true;
      this.getHistorysLists();
    },
    handleClick(row) {
      console.log(row);
      this.$emit('historyQuickSign', row);
      this.dialogVisible = false;
    }
  },
}
</script>

<style lang="scss" scoped>
.table-box {}

.dialog-footer {
  text-align: right;
}
</style>
