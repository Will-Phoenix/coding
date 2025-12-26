<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center" v-loading="syncLoading" element-loading-text="处理中，请稍等">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="120px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="20">
                <el-form-item label="当前账套" class="sobInfo">
                  <el-select v-model="query.sobId" placeholder="请选择...">
                    <el-option v-for="item in sobOptions" :key="item.value" :label="item.label" :value="item.value"
                      style="width: 400px" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="申请时间" prop="applyTime">
                  <el-date-picker v-model="query.applyTime" type="daterange" start-placeholder="开始日期"
                    end-placeholder="结束日期" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报销人" prop="exsPeople">
                  <el-input v-model="query.exsPeople" placeholder="请输入姓名、电话号码" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报销单类型" prop="type">
                  <el-select v-model="query.type" placeholder="请选择..." style="width: 100%">
                    <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-col :span="12">
                  <el-form-item label="报销金额" prop="minAmount">
                    <!--                    <el-input v-model="query.minAmount" placeholder="请输入最低金额" />-->
                    <el-input-number v-model="query.minAmount" :min="1" :max="999999999" placeholder="请输入最低金额"
                      controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <div style="text-align: center; padding-top: 6px">至</div>
                </el-col>
                <el-col :span="8">
                  <el-form-item prop="maxAmount" label-width="auto">
                    <!--                    <el-input v-model="query.maxAmount" placeholder="请输入最高金额" />-->
                    <el-input-number v-model="query.maxAmount" :min="1" :max="999999999" placeholder="请输入最高金额"
                      controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-col>
              <el-col :span="8" v-if="expenseAccountManage">
                <el-form-item label="记账状态" prop="accountingStatus">
                  <el-select v-model="query.accountingStatus" placeholder="请选择..." style="width: 100%">
                    <el-option v-for="item in accountingStatusOptions" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="expenseAccountManage">
                <el-form-item label="银行付款单" prop="paymentOrderUpload">
                  <el-select v-model="query.paymentOrderUpload" placeholder="请选择..." style="width: 100%">
                    <el-option v-for="item in paymentOrderUploadOptions" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="expenseAccountManage">
                <el-form-item label="付款状态" prop="isPay">
                  <el-select v-model="query.isPay" placeholder="请选择..." style="width: 100%">
                    <el-option label="未付款" :value="0" />
                    <el-option label="已付款" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="expenseAccountManage">
                <el-form-item label="贴票状态" prop="stickerTicketStatus">
                  <el-select v-model="query.stickerTicketStatus" placeholder="请选择..." style="width: 100%">
                    <el-option label="未贴票" :value="0" />
                    <el-option label="已贴票" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="expenseAccountManage">
                <el-form-item label="是否关联请款单" prop="bindPayOrderFlag">
                  <el-select v-model="query.bindPayOrderFlag" placeholder="请选择..." style="width: 100%">
                    <el-option label="否" :value="0" />
                    <el-option label="是" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="审批完成时间" prop="finishTime">
                  <el-date-picker v-model="query.finishTime" type="daterange" start-placeholder="开始日期"
                    end-placeholder="结束日期" style="width: 100%" />
                </el-form-item>
              </el-col>
            </div>
            <el-col :span="24" class="align">
              <el-form-item>
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button type="primary" @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </div>
        <div class="btn">
          <el-button v-if="expenseAccountManage" type="primary" @click="batchDeletePay">批量删除银行回执单</el-button>
          <div class="sync-btn" v-if="expenseAccountManage">
            <el-button type="primary" @click="showBatchPrintDate = true; sortedIdList = [];">批量打印</el-button>
            <el-button type="primary"
              @click="exportQuery.startDate = ''; exportQuery.endDate = ''; showExport = true">导出报销单</el-button>
            <el-button type="primary" @click="showUploadBankPicker = true">批量上传银行回执单</el-button>
            <el-button v-if="financialSystem === 'YouBIP'" type="primary"
              @click="showSyncDatePicker = true">同步用友财会凭证数据</el-button>
          </div>
        </div>
        <el-tabs v-if="fileManage" v-model="status" style="margin: 0 0 20px 20px" @tab-click="onChangeTab">
          <el-tab-pane label="未推送归档报销单" name="noPush">
            <expense-account-list ref="noPushRef" :query="query" :status="0" :financial-system="financialSystem"
              :platform="platform" @selectChange="selectChange" />
          </el-tab-pane>
          <el-tab-pane label="已推送归档报销单" name="push">
            <expense-account-list ref="pushRef" :query="query" :status="1" :financial-system="financialSystem"
              :platform="platform" @selectChange="selectChange" />
          </el-tab-pane>
        </el-tabs>
        <expense-account-list v-if="expenseAccountManage" ref="allRef" :query="query" :status="undefined"
          :financial-system="financialSystem" :platform="platform" @editCert="onEditCert"
          @selectChange="selectChange" />
      </div>
      <CertificatesDetailDialog v-if="showCertDialog" :data="certDialogData" :readonly="certDialogReadonly"
        @close="onCloseCertDialog" />
      <syncDatePicker :visible.sync="showSyncDatePicker" @confirm="syncFromYouBIP" />
      <batchUploadBankBill :visible.sync="showUploadBankPicker" @confirm="batchUpload" />
      <batchPrintDate :visible.sync="showBatchPrintDate" @confirm="batchPrint" />
    </div>
    <el-dialog title="导出报销单" :close-on-click-modal="false" :visible.sync="showExport"
      class="JNPF-dialog JNPF-dialog_center" lock-scroll width="600px">
      <div>请选择需要导出的报销单日期（注意：该功能不支持报销单资料导出）</div>
      <div style="padding: 30px 0">
        <el-date-picker v-model="exportQuery.startDate" placeholder="选择开始日期" value-format="yyyy-MM-dd" type="date" /> -
        <el-date-picker v-model="exportQuery.endDate" value-format="yyyy-MM-dd" placeholder="选择结束日期" type="date" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showExport = false">取 消</el-button>
        <el-button type="primary" :loading="exportLoading" @click="onExport">导出</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { orderTypeSelect, batchUploadBillBankSlip, batchDelBankSlip } from "@/api/business/expenseAccount";
import baseMixin from '@/mixins/print/baseMixin';
import ExpenseAccountList from "@/views/expenseAccountManage/components/List.vue";
import syncDatePicker from "@/views/expenseAccountManage/components/syncDatePicker.vue";
import CertificatesDetailDialog from '@/views/certificatesDetail/dialog.vue';
import batchPrintDate from "@/views/pasteTicketCenter/component/batchPrintDate.vue";
import { exportDataBx, syncVoucherFromYouBIP } from "@/api/business/youBIP";
import batchUploadBankBill from "@/views/expenseAccountManage/components/batchUploadBankBill";
import { getCcdEntSobList } from "@/api/business/enterpriseAccountSetManagement";
import { getExsOrderCenterList, stickerTicketStatus } from "@/api/business/pasteTicket";
import { printPdf } from '@/utils/pdf';
import { mapGetters } from "vuex";
import { APIPostCreateBatchOrderPrintRecord } from "@/api/workFlow/FlowBefore";

export default {
  name: 'ExpenseAccountManageIndex',
  components: { CertificatesDetailDialog, ExpenseAccountList, syncDatePicker, batchUploadBankBill, batchPrintDate },
  mixins: [baseMixin],
  props: {
    financialSystem: {
      // common是无对接的普通报销单管理  YouBIP是用友财务对接的报销单管理
      type: String,
      default: "common"
    },
    platform: {
      // 功能平台：expenseAccountManage为财务端-报销单管理功能集   fileManage为归档功能集
      type: String,
      default: "expenseAccountManage"
    }
  },
  data() {
    return {
      showExport: false,
      exportLoading: false,
      exportQuery: {
        startDate: "",
        endDate: ""
      },
      query: {
        exsPeople: "",
        applyTime: undefined,
        finishTime: undefined,
        type: "",
        minAmount: undefined,
        maxAmount: undefined,
        accountingStatus: "",
        paymentOrderUpload: "",
        isPay: "",
        sobId: "",
        stickerTicketStatus: "",
        bindPayOrderFlag: ""
      },
      status: undefined,
      typeOptions: [], // 报销单类型选项
      sobOptions: [], // 账套选项
      pushStatusOptions: [
        { label: "未推送", value: 0 },
        { label: "已推送", value: 1 }
      ], // 推送状态选项
      accountingStatusOptions: [
        { label: "未记账", value: 0 },
        { label: "已记账", value: 1 }
      ], // 记账状态选项
      paymentOrderUploadOptions: [
        { label: "未录入", value: 0 },
        { label: "已录入", value: 1 }
      ], // 银行付款单选项
      formVisible: false,
      showCertDialog: false,
      showSyncDatePicker: false,
      showUploadBankPicker: false,
      certDialogData: undefined,
      certDialogReadonly: false,
      syncLoading: false,
      showBatchPrintDate: false,
      sortedIdList: [], // 存放需要批量打印的报销单id
      multipleSelection: [], // 列表勾选
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    expenseAccountManage() {
      return this.platform === "expenseAccountManage";
    },
    fileManage() {
      return this.platform === "fileManage";
    }
  },
  created() {
    // 若是归档功能集，初始化status，和query数据
    if (this.fileManage) {
      this.status = "noPush";
      this.query.accountingStatus = 1;
      this.query.paymentOrderUpload = 1;
      this.query.isPay = 1;
    }
    // 加载报销单类型
    orderTypeSelect({ type: 2 }).then(res => {
      this.typeOptions = res.data.map(v => ({ label: v.name, value: v.id }))
    });
    // 加载账套列表
    getCcdEntSobList().then(res => {
      this.sobOptions = res.data.map(v => ({ label: v.name, value: v.id }))
      if (this.sobOptions && this.sobOptions.length > 0) {
        this.query.sobId = this.sobOptions[0].value;
        this.onSearch();
      }
    });
    this.$eventBus.$on('changeReadonlyEventBus', (bol) => {
      this.certDialogReadonly = bol;
    })
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.refreshList(false);
    }
  },
  methods: {
    // 搜索
    onSearch() {
      // 加载数据
      this.refreshList(true);
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.query.applyTime = undefined;
      this.query.finishTime = undefined;
      this.onSearch();
    },
    onChangeTab() {
      this.refreshList(false);
    },
    refreshList(resetPageNum) {
      if (this.status === "noPush") {
        this.$refs.noPushRef.refresh(resetPageNum);
      } else if (this.status === "push") {
        this.$refs.pushRef.refresh(resetPageNum);
      } else {
        this.$refs.allRef.refresh(resetPageNum);
      }
    },
    onExport() {
      if (!this.exportQuery.startDate || !this.exportQuery.endDate) {
        this.$message.warning("请选择导出报销单的月份");
        return;
      }
      this.exportLoading = true;
      exportDataBx({
        ...this.exportQuery
      }).then(res => {
        this.jnpf.downloadFile(res.data.url)
      }).finally(() => {
        this.exportLoading = false;
      })
    },
    onEditCert(row) {
      console.log('onEditCert', { row })
      this.certDialogReadonly = row.accountingStatus == 1;
      this.certDialogData = row;
      this.showCertDialog = true;
    },
    onCloseCertDialog(flag) {
      this.showCertDialog = false;
      this.certDialogData = null;
      if (flag) {
        this.refreshList(false)
      }
    },
    // 从用友财务系统，同步记账凭证到本系统
    syncFromYouBIP(val) {
      this.syncLoading = true;
      console.log("勾选的时间：", val.voucherYearMonth);
      // 处理一下入参
      // val.voucherYearMonth的格式为["2024-03", "2024-11"]
      const months = val.voucherYearMonth.map(v => v.split("-")[1]).join(",");
      const year = val.voucherYearMonth[0].split("-")[0];
      console.log("年：", year);
      console.log("月：", months);
      syncVoucherFromYouBIP({ year, periods: months }).then(res => {
        if (res.data.allSuccess) {
          this.$message.success("同步成功");
        } else {
          this.$message.error("同步失败，请重新操作");
        }
      })
        .finally(() => {
          this.syncLoading = false;
          this.refreshList(false);
        });
    },
    // 批量上传银行回执单
    batchUpload(val) {
      console.log("选择的月份和上传的文件：", val);
      this.syncLoading = true;
      batchUploadBillBankSlip(val).then(res => {
        // 遍历报销单列表实体，添加字段，用来判断是否匹配上银行回执单
        const matchedBankFlexDTOS = res.data.bankFlexDTOS.filter(v => !!v.ccdExsOrderEntity);
        res.data.exsOrderEntities.forEach(v => {
          if (matchedBankFlexDTOS.findIndex(item => item.ccdExsOrderEntity.id === v.id) !== -1) {
            v.isMatch = "是";
          } else {
            v.isMatch = "否";
          }
        });
        if (res.data.bankFlexDTOS.length > 0) {
          sessionStorage.setItem("matchData", JSON.stringify(res.data));
          this.$router.push("/bankBillMatchingResult");
        } else {
          this.$message.error("所上传的银行回执单付款人并非当前公司，无法匹配报销单！")
        }
      })
        .finally(() => {
          this.syncLoading = false;
        });
    },
    batchDeletePay() {
      if (this.multipleSelection.length === 0) {
        this.$message.warning("请至少勾选一个报销单");
        return;
      }
      this.$confirm('确定要批量删除勾选的报销单的银行回执单？删除后数据无法恢复，请确认！', '提示', {
        type: 'warning'
      }).then(() => {
        batchDelBankSlip(this.multipleSelection.map(v => v.id)).then(async () => {
          this.$message.success("删除成功");
          this.refreshList(false);
        });
      });
    },
    batchPrint(val) {
      this.syncLoading = true;
      console.log("选择的年月：", val.voucherYearMonth);
      // 获取要打印年月的报销单
      let query = { current: 1, size: -1, applyMonth: val.voucherYearMonth, stickerTicketStatus: 0 };
      // 票据中心可以不传企业id，但企业端必须传该用户所在企业的id；通过用户登录的userInfo中，组织list的元素个数，因为如果是企业元素个数一定大于1
      if (this.userInfo.organizeIdList && this.userInfo.organizeIdList.length > 1) {
        query.entId = this.userInfo.companyId;
      }
      getExsOrderCenterList(query).then(async res => {
        // 排顺序：有凭证号的报销单，按照凭证号从小到大排序；没有凭证号的，按照申请时间从小到大排序
        const list = [...res.data.records];
        const voucherList = list.filter(v => !!v.voucherNo);
        const noVoucherList = list.filter(v => !v.voucherNo);
        voucherList.sort((a, b) => {
          return new Date(`${a.voucherYear}-${a.voucherMonth}-${a.voucherNo}`) - new Date(`${b.voucherYear}-${b.voucherMonth}-${b.voucherNo}`);
        });
        noVoucherList.sort((a, b) => {
          return new Date(a.applyTime) - new Date(b.applyTime);
        });
        // 合并排序好的两个数组，只保留id
        console.log("排序后的数据：", [...voucherList, ...noVoucherList]);
        this.sortedIdList = [...voucherList, ...noVoucherList].map(v => v.id);
        // 批量打印
        const pdfList = await this.downloadAllByOrders(this.sortedIdList, false);
        if (pdfList.length === 0) {
          this.$message.warning("无可打印数据");
          return;
        }
        this.intervalCancel = await printPdf(pdfList.map(v => v.pdfDocumentObj), this.finishPrint)
      })
        .finally(() => {
          this.syncLoading = false;
        });
    },
    finishPrint(error) {
      if (error) {
        console.log(error);
        return;
      }
      if (this.sortedIdList.length > 0) {
        const orderIds = [];
        for (let i = 0; i < this.sortedIdList.length; i++) {
          orderIds.push({ orderId: this.sortedIdList[i] });
        }
        APIPostCreateBatchOrderPrintRecord(orderIds);
        this.$confirm('是否将本次打印预览的报销单，标记为已贴票?', '提示', {
          type: 'warning'
        }).then(() => {
          stickerTicketStatus({ ids: this.sortedIdList, status: 1 }).then(() => {
            this.$message.success("操作成功");
            this.refreshList(true);
          });
        });
      }
    },
    selectChange(val) {
      this.multipleSelection = val;
    }
  },
}
</script>
<style lang="scss" scoped>
.query-flex {
  display: flex;
  flex-wrap: wrap;
}

.align {
  text-align: center;
}

.content {
  padding: 10px;
  display: flex;
  align-items: center;
}

.btn {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-right: 10px;
  padding-left: 20px;

  .sync-btn {
    margin-left: auto;
  }
}

.sobInfo {
  font-size: 16px;
  line-height: 22px;
  font-weight: bold;
  margin-right: 15px;
  margin-bottom: 20px;
  width: 100%;

  .el-select {
    width: 400px;
  }
}

::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
</style>
