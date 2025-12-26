<template>
  <div>
    <JNPF-table
      v-loading="listLoading"
      :data="list"
      :list-query="listQuery"
      :height="null"
      :has-c="expenseAccountManage"
       @selection-change="handleSelectionChange">
    >
      <el-table-column
        prop="name"
        label="报销单名称"
        align="left"
        width="180"
      />
      <el-table-column
        label="报销单类型"
        prop="bizFlowModuleName"
        algin="left"
      />
      <el-table-column
        v-if="fileManage"
        label="推送归档状态"
        prop="pushStatus"
        algin="left"
        min-width="100"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.pushStatus == 0" type="danger">未推送</el-tag>
          <el-tag v-if="scope.row.pushStatus == 1" type="success">已推送</el-tag>
        </template>
      </el-table-column>
      <!--      <el-table-column-->
      <!--        label="版式文件"-->
      <!--        prop="layoutFileUpload"-->
      <!--        algin="left"-->
      <!--      >-->
      <!--        <template slot-scope="scope">-->
      <!--          <el-tag v-if="scope.row.layoutFileUpload == 0" type="danger">未生成</el-tag>-->
      <!--          <el-tag v-if="scope.row.layoutFileUpload == 1" type="success">已生成</el-tag>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column
        v-if="expenseAccountManage"
        label="贴票状态"
        algin="left"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.stickerTicketStatus == 0" type="danger">未贴票</el-tag>
          <el-tag v-if="scope.row.stickerTicketStatus == 1" type="success">已贴票</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="expenseAccountManage"
        label="付款状态"
        algin="left"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isPay == 0" type="danger">未付款</el-tag>
          <el-tag v-if="scope.row.isPay == 1" type="success">已付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="expenseAccountManage"
        label="记账状态"
        prop="accountingStatus"
        algin="left"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.accountingStatus == 0" type="danger">未记账</el-tag>
          <el-tag v-if="scope.row.accountingStatus == 1" type="success">已记账</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-if="expenseAccountManage"
        label="银行付款单"
        prop="paymentOrderUpload"
        algin="left"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.paymentOrderUpload == 0" type="danger">未录入</el-tag>
          <el-tag v-if="scope.row.paymentOrderUpload == 1" type="success">已录入</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="记账凭证"
        algin="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.voucherYear && scope.row.voucherMonth && scope.row.voucherNo">{{ scope.row.voucherYear }}年{{ scope.row.voucherMonth }}月记{{ scope.row.voucherNo }}号</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="expenseAccountManage"
        label="是否关联请款单"
        prop="exsOrderIds"
        algin="left"
      >
        <template slot-scope="scope">
          <div>{{ scope.row.exsOrderIds ? "是" : "否" }}</div>
        </template>
      </el-table-column>
      <el-table-column
        label="所属企业"
        prop="entName"
        algin="left"
      />
      <el-table-column
        label="报销人"
        prop="exsUserName"
        algin="left"
      />
      <el-table-column
        label="报销金额"
        prop="exsCost"
        algin="left"
      />
      <el-table-column
        label="报销人电话"
        prop="exsUserPhone"
        width="100"
        algin="left"
      />
      <el-table-column v-if="propertyJson && propertyJson.printShow" prop="printNum" algin="left" label="已打印次数" min-width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.printNum ? ( scope.row.printNum + '次' ) : '' }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="申请时间"
        prop="applyTime"
        algin="left"
        min-width="140"
      />
      <el-table-column
        label="审批完成时间"
        prop="finishTime"
        algin="left"
        min-width="140"
      />
      <el-table-column
        label="操作"
        fixed="right"
        width="240"
      >
        <template slot-scope="scope">
          <el-button
            v-if="financialSystem !== 'common' && expenseAccountManage"
            type="text"
            @click="addOrEditCert(scope.row)"
          >{{ scope.row.accountingStatus == 0 ? "制单" : "查看凭证" }}
          </el-button>
          <el-button
            v-if="financialSystem !== 'common' && expenseAccountManage && scope.row.voucherId && scope.row.accountingStatus == 0"
            type="text"
            @click="pushCert(scope.row)"
          >推送凭证
          </el-button>
          <el-button
            v-if="fileManage"
            type="text"
            @click="pushTo(scope.row)"
          >{{ status === 0 ? "推送归档" : "重新归档" }}
          </el-button>
          <!--          <el-button-->
          <!--            type="text"-->
          <!--            @click="generateLayoutFile(scope.row)"-->
          <!--          >生成版式文件-->
          <!--          </el-button>-->
          <el-button
            type="text"
            v-if="expenseAccountManage"
            @click="changeTickerTicketStatus(scope.row)"
          >{{ scope.row.stickerTicketStatus ? "标记未贴票" : "标记已贴票" }}
          </el-button>
          <el-button
            type="text"
            v-if="expenseAccountManage"
            @click="changeIsPay(scope.row)"
          >{{ scope.row.isPay ? "标记未付款" : "标记已付款" }}
          </el-button>
          <el-button
            type="text"
            v-if="financialSystem === 'common' && expenseAccountManage"
            @click="changeAccountingStatus(scope.row)"
          >{{ scope.row.accountingStatus ? "标记未记账" : "标记已记账" }}
          </el-button>
          <el-button
            type="text"
            @click="goToDetail(scope.row, scope.$index)"
          >票据详情
          </el-button>
          <el-button
            type="text"
            v-if="expenseAccountManage"
            @click="onDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </JNPF-table>
    <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
    <accountVoucher :visible.sync="accountVoucher.visible" :data="accountVoucher.data" :loading="accountVoucher.loading" @confirm="finishAccountingStatus" />
  </div>
</template>
<script>
import { batchSave, deleteExsOrder, finEntVoucherPush, getExsOrderList, pushElecArch, editExsOrder } from "@/api/business/expenseAccount";
import { downloadFile } from "@/api/business/signature";
import { uploadBase64Data } from "@/utils/fileUtils";
import { stickerTicketStatus } from "@/api/business/pasteTicket";
import baseMixin from '@/mixins/print/baseMixin';
import { mapGetters } from "vuex";
import dayjs from "dayjs";
import accountVoucher from "@/views/expenseAccountManage/components/accountVoucher.vue";
import { editVoucherNo } from "@/api/business/expenseAccount";

export default {
  name: "ExpenseAccountList",
  components: { accountVoucher },
  mixins: [baseMixin],
  props: {
    query: {
      type: Object,
      default: () => ({})
    },
    status: {
      type: Number || undefined
    },
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
      list: [],
      listLoading: false,
      listQuery: {
        current: 1,
        size: 20,
      },
      realQuery: {},
      total: 0,
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      accountVoucher: {
        visible: false,
        data: {},
        loading: false,
      },
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    expenseAccountManage() {
      return this.platform === "expenseAccountManage";
    },
    fileManage() {
      return this.platform === "fileManage";
    },
    propertyJson() {
      return this.$store.state.orgInfo.propertyJson;
    },
  },
  mounted() {
    if (!this.propertyJson) {
      this.$store.dispatch('orgInfo/getOrgAllInfo');
    }
  },
  methods: {
    initData() {
      this.listLoading = true;
      let applyStartTime = "";
      let applyEndTime = "";
      if (this.query.applyTime) {
        applyStartTime = dayjs(this.query.applyTime[0]).format("YYYY-MM-DD") + ' 00:00:00';
        applyEndTime = dayjs(this.query.applyTime[1]).format("YYYY-MM-DD") + ' 23:59:59';
      }
      let finishStartTime = "";
      let finishEndTime = "";
      if (this.query.finishTime) {
        finishStartTime = dayjs(this.query.finishTime[0]).format("YYYY-MM-DD") + ' 00:00:00';
        finishEndTime = dayjs(this.query.finishTime[1]).format("YYYY-MM-DD") + ' 23:59:59';
      }
      let _query = {
        ...this.listQuery,
        ...this.query,
        pushStatus: this.status,
      };
      if (applyStartTime && applyEndTime) {
        _query['applyStartTime'] = applyStartTime;
        _query['applyEndTime'] = applyEndTime;
      }
      delete _query.applyTime;
      if (finishStartTime && finishEndTime) {
        _query['finishStartTime'] = finishStartTime;
        _query['finishEndTime'] = finishEndTime;
      }
      delete _query.finishTime;
      this.realQuery = _query;
      getExsOrderList(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    goToDetail(row, index) {
      this.$router.push({
        path: "/expenseAccountDetail",
        query: {
          id: row.id,
          from: this.expenseAccountManage ? 1 : this.fileManage ? 4 : null, // 1是报销单管理 2是票据中心 3预算管理 4归档管理
          financialSystem: this.financialSystem, // YouBIP是用友V8财务系统
          queryData: JSON.stringify(this.realQuery), // 当前列表的查询条件
          listQuery: JSON.stringify(this.listQuery), // 当前数据在第几页，一页几个数据
          index: index, // 当前数据所在列的第几个，从0开始(下标)
        }
      });
    },
    async pushTo(row) {
      await this.generateLayoutFile(row);
      if (row.accountingStatus == 1 && row.layoutFileUpload == 1) {
        this.listLoading = true;
        pushElecArch({ id: row.id }).then(() => {
          this.$message.success("推送成功");
          this.initData();
        })
          .finally(() => {
            this.listLoading = false;
          });
      } else {
        this.$message.warning("请先完成记账、生成版式文件");
      }
    },
    async pushCert(row) {
      if (!row.voucherId) return this.$message.warning("请先制单")
      this.$confirm('确认推送凭证？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        finEntVoucherPush(row.voucherId).then(() => {
          this.$message.success("推送成功");
          this.initData();
        })
          .finally(() => {
            this.listLoading = false;
          });
      });
    },
    async loadApplyOrderPrintList(applyOrderIds) {
      if (!applyOrderIds) return;
      const otherOrderArr = await this.loadApplyOrderDetails({ token: this.$store.getters.token, applyOrderIds: applyOrderIds.split(",") });
      if (otherOrderArr && otherOrderArr.length > 0) {
        const spdPrintInfoArr = otherOrderArr.map(vv => ({ formId: vv.id, templateId: vv.basePrintdevId, orderType: vv.orderType, panelId: "0", title: vv.name }));
        if (spdPrintInfoArr && spdPrintInfoArr.length > 0) {
          this.printList.push(...spdPrintInfoArr)
        }
      }
    },
    async generateLayoutFile(row) {
      if (row.accountingStatus == 1) {
        await this.$confirm('确定要推送归档？归档后若新增或修改报销材料，需要重新推送归档，是否继续？', '提示', {
          type: 'warning'
        }).then(async() => {
          this.listLoading = true;
          try {
            this.printList = [];
            this.invoicePrintList = [];
            const { formData } = await this.loadFormDetail({ token: this.$store.getters.token, formId: row.id })
            if (formData.basePrintdevId) {
              // 主打印信息
              this.printList.push({
                formId: row.id,
                templateId: formData.basePrintdevId,
                orderType: formData.orderType,
                panelId: "0",
                title: formData.name
              })
            }
            // 其它打印模板(多个)
            const templateArr = await this.loadOtherTemplateList({
              token: this.$store.getters.token,
              additionType: 0,
              formId: row.id
            });
            if (templateArr && templateArr.length > 0) {
              // 其它打印信息(多个)
              const otherPrintInfoArr = (templateArr || []).map(vv => ({
                formId: row.id,
                templateId: vv.basePrintdevId,
                orderType: formData.orderType,
                panelId: vv.id,
                title: vv.name
              }));
              if (otherPrintInfoArr && otherPrintInfoArr.length > 0) {
                this.printList.push(...otherPrintInfoArr)
              }
            }
            // 发票模版
            const invoiceArr = await this.loadOtherTemplateList({
              token: this.$store.getters.token,
              additionType: 1,
              formId: row.id
            });
            if (invoiceArr && invoiceArr.length > 0) {
              const invoicePrintInfoArr = (invoiceArr || []).map(vv => ({
                formId: row.id,
                templateId: vv.basePrintdevId,
                orderType: formData.orderType,
                panelId: vv.id,
                title: vv.name
              }));
              // 请求获取所有发票
              if (formData.invoiceIds) {
                const invoiceList = await this.loadInvoiceList({ token: this.$store.getters.token, ids: formData.invoiceIds.split(",") });
                for (const v of invoiceList) {
                  // 找到电子发票
                  if (v.entity.fid && v.entity.fid !== v.entity.imgFid) {
                    await downloadFile(v.entity.imgFid).then(res2 => {
                      v.src = res2.data.url
                      v.name = res2.data.name
                    });
                    const result = await this.templateToImageDirectly(invoicePrintInfoArr[0].templateId, invoicePrintInfoArr[0].formId, invoicePrintInfoArr[0].orderType, invoicePrintInfoArr[0].panelId, v.src);
                    this.invoicePrintList.push({ formId: row.id, orderType: formData.orderType, panelId: v.id, title: v.name, dataUrl: result.dataUrl });
                  }
                }
              }
            }
            if (formData) {
              await this.loadApplyOrderPrintList(formData.applyOrderIds);
            }
            // 可能的关联请款单
            if (formData.exsOrderIds) {
              for (const v of formData.exsOrderIds.split(",")) {
                const res = await this.loadFormDetail({ formId: v });
                this.printList.push({
                  formId: v,
                  templateId: res.formData.basePrintdevId,
                  orderType: res.formData.orderType,
                  panelId: "0",
                  title: res.formData.name
                });
              }
            }
            // 先获取所有模版的图片blob
            for (const v of this.printList) {
              const result = await this.templateToImageDirectly(v.templateId, v.formId, v.orderType, v.panelId === "0" ? "" : v.panelId);
              v.dataUrl = result.dataUrl;
            }
            // 把所有模版图片上传，获取文件id
            for (const v of [...this.printList, ...this.invoicePrintList]) {
              await uploadBase64Data(this.actionUrl, v.dataUrl, v.title + ".jpg", this.$store.getters.token).then(vv => {
                v.fileId = vv.data.data.id;
              });
            }
            console.log("所有上传的文件已经成功拿到fileId", this.printList, this.invoicePrintList);
            // 调生成接口
            const fileList = this.printList.map(vv => ({
              entId: this.userInfo.companyId,
              fid: vv.fileId,
              orderId: vv.formId,
              panelType: "print",
              panelId: vv.panelId
            }));
            const fileList2 = this.invoicePrintList.map(vv => ({
              entId: this.userInfo.companyId,
              fid: vv.fileId,
              orderId: vv.formId,
              panelType: "bill_merge_print",
              panelId: vv.panelId
            }));
            await batchSave([{ extOrderId: row.id, panelFiles: [...fileList, ...fileList2] }]).then(() => {
              row.layoutFileUpload = 1;
              // this.$message.success("版式文件生成成功");
              // this.initData();
            });
          } finally {
            this.listLoading = false;
          }
        });
      } else {
        this.$message.warning("请先完成记账");
      }
    },
    async onDelete(row) {
      this.$confirm('确定要删除此报销单？', '提示', {
        type: 'warning'
      }).then(async() => {
        this.listLoading = true;
        // 请求删除接口
        deleteExsOrder(row.id).then(() => {
          this.$message.success("删除成功");
          this.initData();
        })
          .finally(() => {
            this.listLoading = false;
          });
      })
    },
    refresh(resetPageNum) {
      if (resetPageNum) {
        // 先把页码设置到第一页
        this.listQuery.current = 1;
      }
      this.initData();
    },
    addOrEditCert(row) {
      this.$emit("editCert", row)
    },
    changeTickerTicketStatus(row) {
      stickerTicketStatus({ ids: [row.id], status: row.stickerTicketStatus ? 0 : 1 }).then(() => {
        this.$message.success("操作成功");
        // 手动改状态，避免刷新页面变位置
        row.stickerTicketStatus = row.stickerTicketStatus ? 0 : 1;
      });
    },
    changeIsPay(row) {
      editExsOrder({ id: row.id, isPay: row.isPay ? 0 : 1 }).then(() => {
        this.$message.success("操作成功");
        // 手动改状态，避免刷新页面变位置
        row.isPay = row.isPay ? 0 : 1;
      });
    },
    changeAccountingStatus(row) {
      if (row.accountingStatus) {
        // 要标记为未记账，直接调修改接口
        editVoucherNo({
          id: row.id,
          voucherYear: "",
          voucherMonth: "",
          voucherNo: "",
          accountingStatus: 0
        }).then(() => {
          this.$message.success("操作成功");
          // 手动改这4个字段的值，避免刷新页面变位置
          row.voucherYear = "";
          row.voucherMonth = "";
          row.voucherNo = "";
          row.accountingStatus = 0;
        });
      } else {
        // 要标记为已记账，需要完善几个字段
        Object.assign(this.accountVoucher, {
          visible: true,
          loading: false,
          data: {
            id: row.id,
            voucherYear: row.voucherYear,
            voucherMonth: row.voucherMonth,
            voucherNo: row.voucherNo,
            accountingStatus: row.accountingStatus ? 0 : 1
          }
        });
      }
    },
    finishAccountingStatus(formData) {
      this.$message.success("操作成功");
      // 手动改4个字段的值，避免刷新页面变位置
      const index = this.list.findIndex(v => v.id === formData.id);
      if (index > -1) {
        this.list[index].voucherYear = formData.voucherYear;
        this.list[index].voucherMonth = formData.voucherMonth;
        this.list[index].voucherNo = formData.voucherNo;
        this.list[index].accountingStatus = 1;
      }
    },
    handleSelectionChange(val) {
      this.$emit("selectChange", val);
    }
  }
}
</script>
<style scoped lang="scss">

</style>
