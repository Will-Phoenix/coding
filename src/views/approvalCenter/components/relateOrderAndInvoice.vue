<template>
  <div>
    <div class="table-container">
      <div class="table-header">
        <div class="divider-v" />
        <div class="header-title">关联审批单</div>
        <div class="header-add" @click="onSelectOrder">
          <img class="add-icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/05b5b404-3924-4e66-b982-d5fa6d0a2539.png" alt="" />
          <div class="add-text">添加审批单</div>
        </div>
      </div>
      <div class="custom-vxe-table-container">
        <vxe-table
          resizable
          stripe
          size="small"
          ref="xOrderTable"
          :data="relateOrderList"
          style="margin: 10px 0 0 0"
        >
          <vxe-column type="seq" title="序号" width="68" />
          <vxe-column field="name" title="审批单名称" min-width="260" />
          <vxe-column field="applyUserName" title="申请人" min-width="100" />
          <vxe-column field="applyDate" title="申请时间" min-width="100" />
          <vxe-column field="status" title="状态" min-width="50">
            <template #default="{row}">
              <span :class="`center-custom-status center-custom-status-${statusMap[row.status].color}`">{{ statusMap[row.status].label }}</span>
            </template>
          </vxe-column>
          <vxe-column field="action" title="操作" width="140" fixed="right">
            <template #default="{row}">
              <div class="custom-operate-btn-container">
                <div
                  class="btn-link"
                  @click="onOrderDetail(row)"
                >详情
                </div>
                <div class="btn-divider" />
                <div
                  class="btn-link"
                  @click="cancelOrderRelate(row)"
                >取消关联
                </div>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <div class="table-container" v-if="relateInvoice">
      <div class="table-header">
        <div class="divider-v" />
        <div class="header-title">关联发票</div>
        <div class="header-add" @click="onSelectInvoice">
          <img class="add-icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/05b5b404-3924-4e66-b982-d5fa6d0a2539.png" alt="" />
          <div class="add-text">添加发票</div>
        </div>
      </div>
      <data-from-invoice v-if="Object.keys(dataFromInvoice).length > 0" :data="dataFromInvoice" :invoice-num="relateInvoiceList.length" @onDetail="onDataFromInvoiceDetail" />
      <div class="custom-vxe-table-container">
        <vxe-table
          resizable
          stripe
          border
          class="custom-vxe-table"
          size="small"
          ref="xTable"
          :data="relateInvoiceList"
          style="margin: 10px 0 0 0"
          :merge-cells="mergeCells"
        >
          <vxe-column type="seq" title="序号" width="68" />
          <vxe-column field="typeLable" title="发票类型" min-width="80" />
          <vxe-column field="code" title="发票号码" min-width="180" />
          <vxe-column field="groupId" title="是否为发票组" min-width="100">
            <template #default="{row}">
              <span>{{ row.groupId ? "是" : "否" }}</span>
            </template>
          </vxe-column>
          <vxe-column field="name" title="开票方" min-width="220" />
          <vxe-column field="amount" title="发票金额" min-width="100" />
          <vxe-column field="checkStatus" title="查验状态" min-width="100">
            <template #default="{row}">
              <span v-if="row.checkStatus == '1' || row.checkStatus == '2'" class="center-custom-status center-custom-status-success">{{ checkStatusMap(row) }}</span>
              <span v-else-if="row.checkStatus == '-1'" class="center-custom-status center-custom-status-red">{{ checkStatusMap(row) }}</span>
              <span v-else class="center-custom-status center-custom-status-orange">{{ checkStatusMap(row) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="date" title="开票日期" min-width="100">
            <template #default="{row}">
              <span>{{ formatDate(row.date) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="action" title="操作" width="140" fixed="right">
            <template #default="{row}">
              <div class="custom-operate-btn-container">
                <div
                  class="btn-link"
                  @click="onInvoiceDetail(row)"
                >详情
                </div>
                <div class="btn-divider" />
                <div
                  class="btn-link"
                  @click="cancelInvoiceRelate(row)"
                >取消关联
                </div>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <select-invoice :visible.sync="selectInvoiceVisible" :checked-ids="relateInvoiceList.map(v=>v.id)" @confirm="onSelectInvoiceResult" />
    <select-approval-order :visible.sync="selectOrderVisible" :checked-ids="relateOrderList.map(v=>v.id)" :order-type="smartApprovalOrderType" :multiple="false" @confirm="onSelectOrderResult" />
    <approval-order-detail :visible.sync="orderDetail.visible" :data="orderDetail.data" />
    <personal-invoice-detail-dialog :visible.sync="invoiceDetail.visible" :editable="false" :data="invoiceDetail.data" />
  </div>
</template>
<script>
import dayjs from "dayjs";
import SelectInvoice from "@/views/approvalCenter/components/selectInvoice.vue";
import SelectApprovalOrder from "@/views/approvalCenter/components/selectApprovalOrder.vue";
import DataFromInvoice from "@/views/approvalCenter/components/DataFromInvoice.vue";
import ApprovalOrderDetail from "@/views/approvalCenter/components/approvalOrderDetail.vue";
import PersonalInvoiceDetailDialog from "@/views/pasteTicketCenter/component/personalInvoiceDetail.vue";

const getSpdStatus = () => [
  { value: "-1", label: "全部", color: "gray" },
  { value: "0", label: "草稿", color: "gray" },
  { value: "4", label: "被驳回", color: "red" },
  { value: "1", label: "审批中", color: "orange" },
  { value: "2", label: "已撤回", color: "gray" },
  { value: "3", label: "审批完成", color: "success" }
];

const getSpdStatusMap = () => {
  const ret = {};
  const list = getSpdStatus();
  list.forEach(v => {
    ret[v.value] = v;
  });
  return ret;
};
export default {
  name: 'relateOrderAndInvoice',
  components: { PersonalInvoiceDetailDialog, ApprovalOrderDetail, DataFromInvoice, SelectApprovalOrder, SelectInvoice },
  props: {
    relateInvoice: {
      type: Boolean,
      default: false
    },
    dataFromInvoice: {
      type: Object,
      default: () => {}
    },
    smartApprovalOrderType: Number
  },
  data() {
    return {
      statusMap: getSpdStatusMap(),
      relateOrderList: [],
      relateInvoiceList: [],
      selectInvoiceVisible: false,
      selectOrderVisible: false,
      orderDetail: {
        visible: false,
        data: {},
      },
      invoiceDetail: {
        visible: false,
        data: {},
      },
    }
  },
  computed: {
    mergeCells() {
      if (!this.relateInvoiceList || this.relateInvoiceList.length === 0) return []
      let rules = [];
      for (let i = 0; i < this.relateInvoiceList.length; i++) {
        let cell = this.relateInvoiceList[i];
        if (cell.groupId && this.relateInvoiceList.findIndex(v => v.groupId === cell.groupId) === i) {
          rules.push({ row: i, col: 3, rowspan: this.relateInvoiceList.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
          rules.push({ row: i, col: 8, rowspan: this.relateInvoiceList.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
        }
      }
      return rules;
    }
  },
  methods: {
    cancelOrderRelate(row) {
      this.relateOrderList = this.relateOrderList.filter(v => v.id !== row.id)
      this.onRelateChange(false);
    },
    cancelInvoiceRelate(row) {
      this.relateInvoiceList = this.relateInvoiceList.filter(v => {
        if (row.groupId) {
          return v.groupId !== row.groupId
        } else {
          return v.id !== row.id
        }
      })
      this.onRelateChange(true);
    },
    onOrderDetail(row) {
      Object.assign(this.orderDetail, { visible: true, data: row });
    },
    onInvoiceDetail(row) {
      Object.assign(this.invoiceDetail, { visible: true, data: row });
    },
    checkStatusMap(row) {
      const statusMap = {
        '-1': '核验不通过',
        '0': '未核验',
        '1': '核验通过',
        '2': '个人核验通过',
      };
      if (row.checkType == "0" && row.checkStatus == "1") {
        return "人工核验通过"
      }
      return statusMap[row.checkStatus] || row.checkStatus;
    },
    formatDate(date) {
      return dayjs(date).format("YYYY-MM-DD");
    },
    onSelectInvoice() {
      this.selectInvoiceVisible = true
    },
    onSelectOrder() {
      this.selectOrderVisible = true
    },
    onSelectInvoiceResult(rows) {
      this.relateInvoiceList = [];
      this.relateInvoiceList.push(...rows);
      this.onRelateChange(true);
    },
    onSelectOrderResult(rows) {
      this.relateOrderList = [];
      this.relateOrderList.push(...rows);
      this.onRelateChange(false);
    },
    onRelateChange(isInvoiceChange) {
      this.$emit('change', { relateInvoiceList: this.relateInvoiceList, relateOrderList: this.relateOrderList, isInvoiceChange: isInvoiceChange });
    },
    onDataFromInvoiceDetail() {
      this.$emit('showDataFromInvoiceDetail')
    }
  }
}
</script>
<style lang="scss" scoped>
.table-container {
  margin-top: 20px;
  .table-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: #F8FAFD;
    padding: 12px 20px;
    .divider-v {
      width: 3px;
      height: 17px;
      background: #00B4C4;
    }
    .header-title {
      flex: 1;
      font-weight: 500;
      font-size: 16px;
      color: #041332;
      line-height: 22px;
      text-align: left;
      margin-left: 7px ;
    }
    .header-add {
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer;
      .add-icon {
        width: 18px;
        height: 18px;
      }
      .add-text {
        font-weight: 400;
        font-size: 14px;
        color: #00B4C4;
        line-height: 20px;
        margin-left: 4px;
      }
    }
  }
}
.type-container {
  background: #00B4C4;
  border-radius: 12px;
  font-weight: 400;
  font-size: 12px;
  color: #FFFFFF;
  line-height: 17px;
  padding: 3px 12px;
  white-space: nowrap;
  word-break: keep-all
}
</style>
