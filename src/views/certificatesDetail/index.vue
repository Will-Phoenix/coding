<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="page">
        <div class="page-head">
          <el-form ref="baseForm" :inline="true" :model="form" :rules="rules" class="base-form">
            <el-form-item label="单位账簿" prop="accbook_code">
              <el-select placeholder="请选择" v-model="form.accbook_code" :disabled="readonly">
                <el-option v-for="item in accbookList" :key="item.id" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="制单日期" prop="prepareddate">
              <el-date-picker v-model="form.prepareddate" type="date" value-format="yyyy-MM-dd" placeholder="请选择日期"
                :disabled="readonly" />
            </el-form-item>
            <el-form-item label="会计期间">
              <el-date-picker :value="yearAndPeriod" type="date" format="yyyy-MM" value-format="yyyy-MM"
                :disabled="true" />
            </el-form-item>
            <el-form-item label="凭证类别" prop="vouchertype_code">
              <el-select placeholder="请选择" v-model="form.vouchertype_code" :disabled="readonly">
                <el-option v-for="item in vouchertypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="凭证号" prop="num">
              <el-input v-model.trim="form.num" :readonly="!enableRefreshNum" />
            </el-form-item>
            <el-form-item label="附单据数" prop="attachment">
              <el-input v-model="form.attachment" :readonly="readonly" />
            </el-form-item>
            <el-form-item>
              <el-button @click="openXjll">现金流量</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="page-table">
          <vxe-table ref="table" border size="small" resizable show-overflow height="auto" :data="tableData"
            :row-config="{ isCurrent: true, isHover: true }"
            :edit-config="readonly ? undefined : { trigger: 'click', mode: 'row', showIcon: false }"
            :menu-config="readonly ? undefined : tableMenu"
            :checkbox-config="readonly ? undefined : { range: true, highlight: true }"
            :mouse-config="readonly ? undefined : { selected: true }"
            :keyboard-config="readonly ? undefined : { isArrow: true, isDel: true, isEnter: true, isTab: true, isEdit: true, enterToTab: true }"
            @menu-click="onContextMenuClick" @cell-click="onCellClick">
            <vxe-column v-if="!readonly" type="checkbox" width="60" />
            <vxe-column type="seq" width="60" title="行号" />
            <vxe-column field="explanation" title="*摘要" :edit-render="{ autofocus: '.vxe-input--inner' }"
              min-width="200">
              <template #edit="{ row }">
                <vxe-input v-model="row.explanation" @blur="onBlurExplanation($event, row)" @focus="onFocusExplanation"
                  type="text" />
              </template>
            </vxe-column>
            <vxe-column field="accountCode" title="*会计科目" :edit-render="{ autofocus: '.vxe-input--inner' }"
              min-width="200">
              <template #default="{ row }">
                <span>{{ row.accountName }}</span>
              </template>
              <template #edit="{ row }">
                <vxe-input v-model="row.accountName" readonly placeholder="请选择" type="text" @focus="onFocusKjkm(row)"
                  @blur="onBlurKjkm(row)">
                  <template #suffix>
                    <i class="vxe-icon-menu suffix-clickable" @click="onClickKjkmSuffix(row)" />
                  </template>
                </vxe-input>
              </template>
            </vxe-column>
            <vxe-column field="fzhs" title="辅助核算" :edit-render="{ autofocus: '.vxe-input--inner' }" min-width="200">
              <template #default="{ row }">
                <span :title="row.fzhs">{{ row.fzhs }}</span>
              </template>
              <template #edit="{ row }">
                <vxe-input v-model="row.fzhs" readonly placeholder="请选择" type="text" @focus="onFocusFzhs(row)"
                  @blur="onBlurFzhs(row)" @click="onClickFzhsSuffix(row)">
                  <template #suffix>
                    <i class="vxe-icon-menu suffix-clickable" @click="onClickFzhsSuffix(row)" />
                  </template>
                </vxe-input>
              </template>
            </vxe-column>
            <vxe-column field="quant" title="数量" :edit-render="{ autofocus: '.vxe-input--inner' }" width="100">
              <template #edit="{ row }">
                <vxe-input v-model="row.quant" @blur="onBlurSl($event, row)" type="float" min="0" :controls="false" />
              </template>
            </vxe-column>
            <vxe-column field="price" title="单价" :edit-render="{ autofocus: '.vxe-input--inner' }" width="100">
              <template #edit="{ row }">
                <vxe-input v-model="row.price" @blur="onBlurDj($event, row)" type="float" min="0" :controls="false" />
              </template>
            </vxe-column>
            <vxe-column field="amount" title="原币" :edit-render="{ autofocus: '.vxe-input--inner' }">
              <template #edit="{ row }">
                <vxe-input v-model="row.amount" @blur="onBlurYb($event, row)" type="float" :controls="false" />
              </template>
            </vxe-column>
            <vxe-column field="debitAmount" title="账簿本币(借方)" :edit-render="{ autofocus: '.vxe-input--inner' }">
              <template #edit="{ row }">
                <vxe-input v-model="row.debitAmount" @blur="onBlurJf($event, row)" type="float" :controls="false" />
              </template>
            </vxe-column>
            <vxe-column field="creditAmount" title="账簿本币(贷方)" :edit-render="{ autofocus: '.vxe-input--inner' }">
              <template #edit="{ row }">
                <vxe-input v-model="row.creditAmount" @blur="onBlurDf($event, row)" type="float" :controls="false" />
              </template>
            </vxe-column>
          </vxe-table>
        </div>
        <div class="page-bottom">
          <div class="analysis" t="合计">
            <div class="kv"><span class="k">合计差额：</span><span class="v">{{ analysis.totalDiff }}</span></div>
            <div class="kv"><span class="k">组织借方合计：</span><span class="v">{{ analysis.debitAmountSum }}</span></div>
            <div class="kv"><span class="k">组织贷方合计：</span><span class="v">{{ analysis.creditAmountSum }}</span></div>
            <div class="kv last"><span class="k">大写合计：</span><span class="v">{{ chineseSum }}</span></div>
          </div>
          <div class="ass" t="现金流量" v-show="aCurRow.xjll">现金流量：{{ aCurRow.xjll }}</div>
          <div class="ass" t="辅助核算" v-show="aCurRow.fzhs">辅助核算：{{ aCurRow.fzhs }}</div>
        </div>
      </div>
    </div>
    <km-dialog :visible.sync="showKmDialog" :readonly="readonly" @confirm="onConfirmKjkm" t="科目" />
    <cash-flow :visible.sync="cashFlowVisible" :tb-data="tbData" :readonly="readonly" @confirm="onConfirmXjll"
      t="现金流量" />
    <auxiliaryAccounting :visible.sync="showAuxiliaryAccounting" :data="aCurRow" :readonly="readonly"
      @confirm="onConfirmFzhs" t="辅助核算" />
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { getBreakNo, getFinEntVoucherDetail } from '@/api/business/youBIP'
import { cashToChinese, formatCash } from '@/utils/format'
import KmDialog from './components/kmDialog.vue'
import CashFlow from './components/cashflow.vue'
import auxiliaryAccounting from "./components/auxiliaryAccounting"
import { getModelList } from '@/api/onlineDev/visualDev'
import { getDicts } from '@/api/common'
import { ccdExsOrderTaxStatistic } from '@/api/business/expenseAccount'

export default {
  name: "CertificatesDetailIndex",
  components: { KmDialog, auxiliaryAccounting, CashFlow },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showKmDialog: false,
      showAuxiliaryAccounting: false,
      cashFlowVisible: false,
      form: { "accbook_code": undefined, "prepareddate": undefined, "vouchertype_code": undefined, num: "", attachment: "" },
      accbookList: [],
      vouchertypeList: [],
      rules: {
        accbook_code: [
          { required: true, message: '请选择单位账簿', trigger: 'change' }
        ],
        prepareddate: [
          { required: true, message: '请选择制单日期', trigger: 'change' }
        ],
        vouchertype_code: [
          { required: true, message: '请选择制凭证类别', trigger: 'change' }
        ],
        num: [
          { required: true, message: '凭证号必填', trigger: 'change' }
        ],
        attachment: [
          { pattern: /^[1-9]\d*$/, message: '只允许正整数', trigger: 'change' }
        ]
      },
      tableMenu: {
        body: {
          options: [
            [
              {
                code: 'insert', name: '向上插入', prefixIcon: 'vxe-icon-arrow-up', disabled: false,
                children: [
                  { code: 'insert-1', name: '1行', disabled: false },
                  { code: 'insert-2', name: '2行', disabled: false },
                  { code: 'insert-3', name: '3行', disabled: false },
                  { code: 'insert-4', name: '4行', disabled: false },
                  { code: 'insert-5', name: '5行', disabled: false },
                  { code: 'insert-6', name: '6行', disabled: false },
                  { code: 'insert-7', name: '7行', disabled: false },
                  { code: 'insert-8', name: '8行', disabled: false },
                  { code: 'insert-9', name: '9行', disabled: false },
                  { code: 'insert-10', name: '10行', disabled: false },
                  { code: 'insert-20', name: '20行', disabled: false },
                  { code: 'insert-30', name: '30行', disabled: false },
                  { code: 'insert-50', name: '50行', disabled: false }
                ]
              },
              {
                code: 'add', name: '向下插入', prefixIcon: 'vxe-icon-arrow-down', disabled: false,
                children: [
                  { code: 'add-1', name: '1行', disabled: false },
                  { code: 'add-2', name: '2行', disabled: false },
                  { code: 'add-3', name: '3行', disabled: false },
                  { code: 'add-4', name: '4行', disabled: false },
                  { code: 'add-5', name: '5行', disabled: false },
                  { code: 'add-6', name: '6行', disabled: false },
                  { code: 'add-7', name: '7行', disabled: false },
                  { code: 'add-8', name: '8行', disabled: false },
                  { code: 'add-9', name: '9行', disabled: false },
                  { code: 'add-10', name: '10行', disabled: false },
                  { code: 'add-20', name: '20行', disabled: false },
                  { code: 'add-30', name: '30行', disabled: false },
                  { code: 'add-50', name: '50行', disabled: false }
                ]
              },
              { code: 'remove', name: '删行', prefixIcon: 'vxe-icon-delete', disabled: false }
            ],
            [
              { code: 'copy', name: '复制', prefixIcon: 'vxe-icon-copy', disabled: false },
              { code: 'cut', name: '剪切', prefixIcon: 'vxe-icon-cut', disabled: false },
              { code: 'paste', name: '粘贴', prefixIcon: 'vxe-icon-paste', disabled: false }
            ]
          ]
        },
        visibleMethod: this.visibleMethod
      },
      tableData: [],
      analysis: {
        // 合计差额
        totalDiff: "0.00",
        // 组织借方合计
        debitAmountSum: "0.00",
        // 组织贷方合计
        creditAmountSum: "0.00"
      },
      tbData: [],
      // 当前选中的表格行数据
      aCurRow: {},
      // 是否启用自动刷新凭证号机制(应当在数据回填完成后启用, 然后 [会计年度，会计期间，帐薄编码] 任意发生变化时,刷新凭证号)
      enableRefreshNum: false
    }
  },
  computed: {
    // 会计期间  会计年度 - 期间
    yearAndPeriod() {
      return this.form.prepareddate ? dayjs(this.form.prepareddate).format("YYYY-MM") : '';
    },
    // 凭证号所依赖的字段项合集
    breakNoDependency() {
      return `${this.form.accbook_code}__${this.yearAndPeriod}__${this.form.vouchertype_code}`
    },
    accbook_name() {
      const item = this.accbookList.find(v => v.value === this.form.accbook_code)
      return item ? item.label : '';
    },
    vouchertype_name() {
      const item = this.vouchertypeList.find(v => v.value === this.form.vouchertype_code)
      return item ? item.label : '';
    },
    // 借贷平衡后的金额
    legalAmountSum() {
      return (this.analysis.debitAmountSum === this.analysis.creditAmountSum && this.analysis.debitAmountSum) ? this.analysis.debitAmountSum : ""
    },
    chineseSum() {
      return this.legalAmountSum ? cashToChinese(this.legalAmountSum) : ""
    },
    // 默认生成的摘要
    defaultExplanation() {
      return `${this.data.exsUserName}请付${this.data.bizFlowModuleName}付款`
    }
  },
  watch: {
    breakNoDependency() {
      if (this.enableRefreshNum) {
        this.refreshNum()
      }
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.$clipboardData = null;
  },
  methods: {
    useThisOrder(data) {
      this.tableData = [{ ...data }];
      this.$refs.table.insert(this.tableData)
    },
    async init() {
      this.$clipboardData = null;
      await this.loadAccbookList();
      await this.loadVouchertypeList();
      let tableData = [];
      const isAdd = !this.data.voucherId;
      if (isAdd) {
        Object.assign(this.form, { prepareddate: dayjs().format("YYYY-MM-DD") })
      } else { // 编辑
        const res = await getFinEntVoucherDetail(this.data.voucherId)
        console.log(`数据回填,[voucherId=${this.data.voucherId}]拉取凭证详情`, res)
        const { details = [], ...form } = res.data || {};
        this.form = { ...this.form, ...form }
        tableData = details.map(v => {
          v.cashflow = v.cashflow || [];
          v.assvos = v.assvos || []
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
      }
      if (isAdd && !this.form.attachment) { // 新增, 获取附件数量, 异步, 不需要等待
        this.loadExsFileNum();
      }
      this.setDefaultFormData();
      // 应当在数据回填完成后, 将enableRefreshNum置为true
      this.enableRefreshNum = !this.readonly;
      if (!this.readonly) { // 只要不是只读状态, 每次打开都应该尝试获取空凭证号
        this.refreshNum();
      }
      if (tableData.length > 0) {
        this.$refs.table.insert(tableData)
      }
      this.checkInsertAtLeastOneRow();
      this.updateAnalysis();
    },
    async collectData() {
      const ret = {};
      try {
        const valid = await this.$refs.baseForm.validate();
        Object.assign(ret, {
          // 核算账簿编码
          accbook_code: this.form.accbook_code,
          accbook_name: this.accbook_name,
          // 制单日期，yyyy-MM-dd编码
          prepareddate: this.form.prepareddate,
          // 会计年度
          year: dayjs(this.form.prepareddate).format("YYYY"),
          // 期间
          period: dayjs(this.form.prepareddate).format("MM"),
          // 凭证类别编码
          vouchertype_code: this.form.vouchertype_code,
          vouchertype_name: this.vouchertype_name,
          // 制单人编码, 前端拿不到, 非必填
          // prepared_code: undefined,
          // 凭证号 Integer
          num: this.form.num,
          // 附单据数 Integer
          attachment: this.form.attachment
        })
      } catch (e) {
        console.warn(e)
        // this.$message.warning("请完善基本信息")
        // return;
      }
      this.updateAnalysis();
      if (this.analysis.debitAmountSum !== this.analysis.creditAmountSum) {
        // this.$message.warning("借贷金额不平")
        // return;
      }
      this.checkAndUpdateDetailIndex();
      const tbData = this.getTableData();
      // 最后一行不算
      if (tbData.length < 2) {
        // this.$message.warning("请完善分录信息")
        // return;
      }
      const arr = [];
      for (let i = 0; i < tbData.length - 1; i++) {
        const d = tbData[i]
        if (!d.explanation) {
          // this.$message.warning(`请完善表格第${i + 1}行的摘要`)
          // return;
        }
        if (!d.accountCode) {
          // this.$message.warning(`请完善表格第${i + 1}行的会计科目`)
          // return;
        }
        // 校验: 会计科目对应的辅助核算项有必填项但是没填
        if (d.assvos && d.assvos.length > 0) {
          for (let j = 0; j < d.assvos.length; j++) {
            const a = d.assvos[j];
            if (a.isMustFillIn == 1 && !a.m_checkvaluecode) {
              // this.$message.warning(`请完善表格第${i + 1}行的辅助核算项`)
              // return;
            }
          }
        }
        let temp = { price: d.price, amount: d.amount };
        if (this.isGreaterThanZero(d.debitAmount)) {
          // 借
          Object.assign(temp, {
            debitQuant: d.quant,
            debitAmount: d.amount,
            debitLocAmount: d.debitAmount,
            debitGroupAmount: d.debitAmount,
            debitGlobalAmount: d.debitAmount
          })
        } else if (this.isGreaterThanZero(d.creditAmount)) {
          // 贷
          Object.assign(temp, {
            creditQuant: d.quant,
            creditAmount: d.amount,
            creditLocAmount: d.creditAmount,
            creditGroupAmount: d.creditAmount,
            creditGlobalAmount: d.creditAmount
          })
        } else {
          // 都没填
          // this.$message.warning(`请完善表格第${i + 1}行的借方或贷方金额`)
          // return;
        }
        const dd = {
          // 分录号
          detailIndex: d.detailIndex,
          // 摘要
          explanation: d.explanation,
          // 会计科目编码
          accountCode: d.accountCode,
          // 会计科目名称
          accountName: d.accountName,
          // 币种  CNY
          currtype_code: d.currtype_code,
          // 币种 人民币
          currtype_name: d.currtype_name,
          ...temp,
          // 业务日期
          businessDate: dayjs().format("YYYY-MM-DD"),
          // 辅助核算
          assvos: d.assvos,
          // assvos ==> [
          //   {
          //     m_checktypecode: "0022",
          //     m_checktypename: "银行类别",
          //     m_checkvaluecode: "02",
          //     m_checkvaluename: "中国农业银行",
          //     isMustFillIn: 1, // 是否必填
          //   }
          // ]
          // 现金流量
          cashflow: d.cashflow
        }
        arr.push(dd)
      }
      ret.details = arr;
      return ret;
    },
    // 摘要
    onFocusExplanation() {
      console.log('onFocus摘要', arguments)
    },
    // 摘要
    onBlurExplanation() {
      console.log('onBlur摘要', arguments)
    },
    // 会计科目
    onFocusKjkm(row) {
      console.log('onFocus会计科目', arguments)
      this.showKmDialog = true;
    },
    // 会计科目
    onBlurKjkm(row) {
      console.log('onBlur会计科目', arguments);
    },
    // 会计科目
    onClickKjkmSuffix(row) {
      console.log('点击会计科目suffix', row)
      this.showKmDialog = true;
    },
    // 会计科目
    onConfirmKjkm(data) {
      console.log('会计科目confirm', data)
      const arr = [];
      data.forEach((d) => {
        const r = {
          accountCode: d.code,
          accountName: `${d.code}\\${d.names.join('\\')}`,
          fzhs: '',
          assvos: (d.relations || []).map(v => ({
            m_checktypecode: v.code,
            m_checktypename: v.name,
            m_checkvaluecode: undefined,
            m_checkvaluename: undefined,
            dynamicFormId: v.dynamicFormId,
            menuId: v.menuId,
            isMustFillIn: v.isMustFillIn,
            isMustSelectLast: v.isMustSelectLast
          }))
        };
        arr.push(r);
      })
      const insertRows = [];
      arr.forEach((d, i) => {
        if (i === 0) {
          if (d.accountCode === this.aCurRow.accountCode) {
            // 说明当前编辑行的科目未变, 不需要重置辅助核算
          } else {
            // 更新当前行(科目+辅助核算)
            Object.assign(this.aCurRow, d)
          }
        } else {
          insertRows.push(Object.assign(this.pickCopy(this.aCurRow), d))
        }
      })
      if (insertRows.length > 0) {
        this.$refs.table.insertNextAt(insertRows, this.aCurRow)
      }
      this.showKmDialog = false;
    },
    // 辅助核算
    onFocusFzhs(row) {
      console.log('onFocus辅助核算', arguments)
    },
    // 辅助核算
    onBlurFzhs(row) {
      console.log('onBlur辅助核算', arguments)
    },
    // 辅助核算
    onClickFzhsSuffix(row) {
      this.aCurRow = row;
      if (row.assvos && row.assvos.length > 0) {
        this.showAuxiliaryAccounting = true;
      } else {
        this.$message.warning("没有关联的辅助核算项");
      }
    },
    // 辅助核算
    onConfirmFzhs(data) {
      console.log('confirm辅助核算', arguments)
      this.aCurRow.assvos = [...data];
      this.aCurRow.fzhs = data.map(v => v.m_checkvaluename ? `【${v.m_checktypename}： ${v.m_checkvaluename}】` : `【${v.m_checktypename}： ~】`).join("");
    },
    // 现金流量
    openXjll() {
      // 先修正 分录号
      this.checkAndUpdateDetailIndex();
      this.tbData = this.getTableData();
      // 然后打开现金流量弹窗
      this.cashFlowVisible = true;
    },
    // 现金流量
    onConfirmXjll() {
      console.log('confirm现金流量', arguments)
    },
    // 数量
    onBlurSl(e, row) {
      console.log('onBlur数量', arguments)
      if (this.isGreaterThanZero(e.value) && this.isGreaterThanZero(row.price)) {
        this.syncAmount(row, (e.value * row.price).toFixed(2))
      }
    },
    // 单价
    onBlurDj(e, row) {
      console.log('onBlur单价', arguments)
      if (this.isGreaterThanZero(e.value) && this.isGreaterThanZero(row.quant)) {
        this.syncAmount(row, (e.value * row.quant).toFixed(2))
      }
    },
    // 原币
    onBlurYb(e, row) {
      console.log('onBlur原币', arguments)
      this.syncAmount(row, e.value)
    },
    // 入参: 行数据,原币值, 功能: 同步借贷关系
    syncAmount(row, val) {
      row.amount = val;
      if (row.direction === "C") {
        row.creditAmount = val;
        row.debitAmount = '';
      } else { // 默认: 借
        row.debitAmount = val;
        row.creditAmount = '';
      }
    },
    // 借方  【 direction: "D", // 借贷方向: D代表debit(借), C代表credit(贷), 默认:借 】
    onBlurJf(e, row) {
      console.log('onBlur借方', arguments)
      if (e.value) {
        // if (!this.isGreaterThanZero(e.value)) {
        //   row.debitAmount = '';
        //   row.amount = row.creditAmount
        // } else {
        //   // 贷方金额清空, 借贷方向改为借
        //   row.creditAmount = '';
        //   row.direction = "D";
        //   row.amount = row.debitAmount
        // }

        // 新需求：允许输入为负数
        row.creditAmount = '';
        row.direction = "D";
        row.amount = row.debitAmount
      } else {
        row.amount = row.creditAmount
      }
      this.updateAnalysis()
    },
    // 贷方
    onBlurDf(e, row) {
      console.log('onBlur贷方', arguments)
      if (e.value) {
        // if (!this.isGreaterThanZero(e.value)) {
        //   row.creditAmount = '';
        //   row.amount = row.debitAmount
        // } else {
        //   // 借方金额清空, 借贷方向改为贷
        //   row.debitAmount = '';
        //   row.direction = "C";
        //   row.amount = row.creditAmount
        // }
        // 新需求：允许输入为负数
        row.debitAmount = '';
        row.direction = "C";
        row.amount = row.creditAmount
      } else {
        row.amount = row.debitAmount
      }
      this.updateAnalysis()
    },
    onCellClick({ $table, columnIndex, rowIndex, data, row }) {
      // rowIndex 和 data 参数不可靠
      console.log('onCellClick', arguments[0])
      this.aCurRow = row;
      if (this.readonly) return;
      const tbData = this.getTableData();
      const lastRowData = tbData[tbData.length - 1]
      if (columnIndex > 0 && lastRowData._X_ROW_KEY === row._X_ROW_KEY) {
        if (tbData.length > 1) {
          const lastRow2 = tbData[tbData.length - 2];
          Object.assign(lastRowData, this.pickCopy(lastRow2))
        } else {
          Object.assign(lastRowData, { explanation: this.defaultExplanation })
        }
        $table.insertNextAt([this.pickCopy()], lastRowData)
      }
    },
    onContextMenuClick({ $event, $table, cell, column, columnIndex, columns, menu, options, row, rowIndex, type }) {
      console.log('onContextMenuClick', arguments)
      if (menu.code.indexOf("-") > 0) {
        const type = menu.code.split("-")[0]
        const num = parseInt(menu.code.split("-")[1])
        switch (type) {
          case 'add':
            $table.insertNextAt(new Array(num).fill(this.pickCopy(row)), row)
            break;
          case 'insert':
            $table.insertAt(new Array(num).fill(this.pickCopy(row)), row)
            break;
        }
      } else {
        const checkedData = $table.getCheckboxRecords() || [];
        if (menu.code === 'remove') {
          checkedData.length > 0 ? $table.remove(checkedData) : (row && $table.remove(row))
          this.checkInsertAtLeastOneRow($table)
        } else if (menu.code === 'copy' || menu.code === 'cut') {
          let arr = checkedData.length > 0 ? checkedData : (row ? [row] : [])
          if (arr.length > 0) {
            this.$clipboardData = arr.map(v => {
              let { _X_ROW_KEY, ...ext } = v;
              return ext
            })
          }
          if (menu.code === 'cut') {
            checkedData.length > 0 ? $table.remove(checkedData) : (row && $table.remove(row))
            this.checkInsertAtLeastOneRow($table)
          }
        } else if (menu.code === 'paste') {
          if (this.$clipboardData && this.$clipboardData.length > 0) {
            $table.insertNextAt(JSON.parse(JSON.stringify(this.$clipboardData)), row)
          }
        }
      }
    },
    // 检查并自动插入至少一行(尾空行)
    checkInsertAtLeastOneRow($table = this.$refs.table) {
      const tbData = this.getTableData();
      if (tbData.length < 1) {
        !this.readonly && $table.insertAt([this.pickCopy()])
      } else {
        const lastRow = tbData[tbData.length - 1];
        // 如果最后一行有 有效数据, 则还需要再加一行
        if (lastRow.explanation) {
          !this.readonly && $table.insertNextAt([this.pickCopy()], lastRow)
        }
      }
    },
    // 检查并更新分录号(即行号)
    checkAndUpdateDetailIndex() {
      this.getTableData().forEach((d, i) => {
        this.$set(d, "detailIndex", i + 1)
      })
    },
    // 新增或插入时用到, 返回需要copy的对象
    pickCopy(row = {}) {
      // unitCode (非必填)业务单元编码; accountCode:"100201" ; accountName:"100201\银行存款\活期"
      return {
        explanation: row.explanation,
        currtype_code: "CNY",
        currtype_name: "人民币",
        accountCode: undefined,
        accountName: undefined,
        quant: undefined,
        price: undefined,
        amount: undefined,
        debitAmount: undefined,
        creditAmount: undefined,
        direction: "D", // 借贷方向: D代表debit(借), C代表credit(贷), 默认:借
        assvos: [],
        fzhs: undefined,
        xjll: undefined,
        cashflow: []
      }
    },
    // 获取最新的当前表格的全量数据
    getTableData() {
      // $table.getTableData() 获取当前表格的数据（完整的全量表体数据、处理条件之后的全量表体数据、当前渲染中的表体数据、当前渲染中的表尾数据）  {fullData, visibleData, tableData, footerData}
      // 注意: 在不分页不筛选的情况下,虽然 fullData 和 tableData 长度相同, 但是内部数据的顺序不一样.  fullData内的数据的顺序与当前页面上看到的数据不一样.  所以要用 tableData
      const { tableData } = this.$refs.table.getTableData()
      return tableData
    },
    updateAnalysis() {
      const tbData = this.getTableData();
      let diff = 0;
      let debitSum = 0;
      let creditSum = 0;
      tbData.forEach(v => {
        const { debitAmount, creditAmount } = v
        if (debitAmount) {
          debitSum = debitSum + (debitAmount * 1)
        }
        if (creditAmount) {
          creditSum = creditSum + (creditAmount * 1)
        }
      })
      diff = debitSum > creditSum ? debitSum - creditSum : creditSum - debitSum
      Object.assign(this.analysis, { totalDiff: formatCash(diff), debitAmountSum: formatCash(debitSum), creditAmountSum: formatCash(creditSum) })
    },
    async refreshNum() {
      if (this.form.accbook_code && this.form.prepareddate && this.form.vouchertype_code) {
        const d = dayjs(this.form.prepareddate);
        const res = await getBreakNo({
          accbookCode: this.form.accbook_code,
          year: d.format("YYYY"),
          period: d.format("MM"),
          voucherTypeCode: this.form.vouchertype_code
        })
        const num = (res.data || {}).breakNo;
        if (num) {
          if (this.form.num && `${this.form.num}` !== `${num}`) {
            this.$message.info("已更新凭证号，请注意保存！")
          }
          this.form.num = num;
        } else {
          this.form.num = '';
        }
      }
    },
    // 拉取账簿列表
    async loadAccbookList() {
      // 拉取账簿动态表单id
      const { id, name, menuId } = await this.$store.dispatch("cache/getFormInfoByCode", 'ZBGL')
      console.log('账簿动态表单', { id, name, menuId })
      const res = await getModelList(id, { "currentPage": 1, "pageSize": 100, menuId })
      this.accbookList = res.data.list.map(v => ({ value: v.push_code, label: v.push_title, id: v.id }))
    },
    // 加载凭证类别下拉
    async loadVouchertypeList() {
      const res = await getDicts("YYPZLB");
      this.vouchertypeList = res.data.list.map(v => ({ value: v.enCode, label: v.fullName }))
    },
    // 填充表单默认数据
    setDefaultFormData() {
      if (this.accbookList.length > 0 && !this.form.accbook_code) {
        this.form.accbook_code = this.accbookList[0].value;
      }
      if (this.vouchertypeList.length > 0 && !this.form.vouchertype_code) {
        this.form.vouchertype_code = this.vouchertypeList[0].value;
      }
    },
    // 加载单据张数
    async loadExsFileNum() {
      const res = await ccdExsOrderTaxStatistic(this.data.id);
      this.form.attachment = res.data.exsFileNum;
    },
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
    visibleMethod() {
      console.log('visibleMethod', arguments)
      return true;
    }
  }
}
</script>
<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  display: flex;
  flex-flow: column;

  .page-head {}

  .page-table {
    height: 0;
    flex: 1;
  }

  .page-bottom {
    .analysis {
      width: 100%;
      box-sizing: border-box;
      padding: 5px 10px;
      font-size: 12px;
      background-color: #fffddf;
      display: flex;
      align-items: center;

      .kv {
        display: flex;

        .k {
          color: rgba(0, 0, 0, .85);
        }

        .v {
          color: #ff6607;
        }

        &.last {
          flex: 1;
          justify-content: flex-end;
        }
      }

      .kv+.kv {
        margin-left: 20px;
      }
    }

    .ass {
      padding: 5px 10px;
      font-size: 12px;
    }
  }
}

.base-form {
  padding: 20px 0 0 20px;
}

.suffix-clickable {
  cursor: pointer;
}
</style>
