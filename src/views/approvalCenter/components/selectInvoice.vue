<template>
  <el-dialog
    title="关联发票"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="927px"
    :modal-append-to-body="false"
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="dialog-content">
      <div class="operate-container mg-b12">
        <el-radio-group v-model="status2" text-color="#00B4C4" fill="#e5f7f9">
          <el-radio-button label="1">我的发票</el-radio-button>
          <el-radio-button label="2">共享给我的发票</el-radio-button>
        </el-radio-group>
      </div>
      <div class="operate-container">
        <el-radio-group v-model="status" text-color="#00B4C4" fill="#e5f7f9">
          <el-radio-button label="1">未报销</el-radio-button>
          <el-radio-button label="2">已报销</el-radio-button>
        </el-radio-group>
        <el-button size="small" type="primary" class="custom-btn-search" :loading="buttonLoading" @click="uploadInvoice.visible = true">新增发票</el-button>
      </div>
      <div class="custom-vxe-table-container">
        <vxe-table
          resizable
          stripe
          border
          class="custom-vxe-table"
          size="small"
          ref="xTable"
          :data="list"
          :loading="listLoading"
          :max-height="480"
          :merge-cells="mergeCells"
          :checkbox-config="checkboxConfig"
          @checkbox-change="selectChangeEvent"
        >
          <vxe-column v-if="status === '1'" type="checkbox" width="60"></vxe-column>
          <vxe-column field="typeLable" title="发票类型" min-width="80" />
          <vxe-column field="code" title="发票号码" min-width="180" />
          <vxe-column field="groupId" title="是否为发票组" min-width="100">
            <template #default="{row}">
              <span>{{ row.groupId ? "是" : "否" }}</span>
            </template>
          </vxe-column>
          <vxe-column title="发票信息" min-width="150">
            <template #default="{row}">
              <div v-if="['air_ticket', 'train_ticket'].includes(row.invoiceType)">
                <div v-if="row.object">
                  <div>{{ row.object.name }}</div>
                  <div>{{ row.object.startingStation }}-{{ row.object.destinationStation }}</div>
                </div>
                <div v-else-if="row.inners">
                  <div>{{ row.inners.filter(v => v.value.billId === row.id)[0].value.name }}</div>
                  <div>{{ row.inners.filter(v => v.value.billId === row.id)[0].value.startingStation }}-{{ row.inners.filter(v => v.value.billId === row.id)[0].value.destinationStation }}</div>
                </div>
              </div>
              <div v-else>-</div>
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
          <vxe-column field="action" title="操作" width="60" fixed="right">
            <template #default="{row}">
              <div class="custom-operate-btn-container">
                <div
                  class="btn-link"
                  @click="goToDetail(row)"
                >详情
                </div>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button class="btn-cancel" @click="updateVisible(false)">取消</el-button>
      <el-button class="btn-confirm" @click="onConfirm">提交</el-button>
    </span>
    <personal-invoice-detail-dialog :visible.sync="detail.visible" :editable="false" :data="detail.data" />
    <batch-upload-invoice :visible.sync="uploadInvoice.visible" @confirm="initData" />
  </el-dialog>
</template>
<script>
import dayjs from "dayjs";
import PersonalInvoiceDetailDialog from "@/views/pasteTicketCenter/component/personalInvoiceDetail.vue";
import { getCcdBillPage } from "@/api/business/pasteTicket";
import BatchUploadInvoice from "@/views/pasteTicketCenter/billManage/components/BatchUploadInvoice.vue";

export default {
  name: 'selectInvoice',
  components: { BatchUploadInvoice, PersonalInvoiceDetailDialog },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    checkedIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      listLoading: false,
      list: [],
      allList: {
        notUsedList: [],
        usedList: [],
      },
      buttonLoading: false, // 上传列表loading
      status: "1",
      status2: "1",
      detail: {
        visible: false,
        data: {},
      },
      uploadInvoice: {
        visible: false,
      },
      checkboxConfig: {
        checkMethod: ({ row }) => {
          return row.checkable
        }
      },
      checkedRows: [], // 勾选的行数据，用于渲染
      myCheckedIds: [], // 勾选的发票id，由于切换radio导致列表数据对象变化，无法保留勾选状态，只能通过id反查
      showAllList: [], // 我的发票和共享发票的未报销list合集，用于通过发票id查找发票信息
    }
  },
  computed: {
    mergeCells() {
      if (!this.list || this.list.length === 0) return []
      let rules = [];
      for (let i = 0; i < this.list.length; i++) {
        let cell = this.list[i];
        if (cell.groupId && this.list.findIndex(v => v.groupId === cell.groupId) === i) {
          if (this.status === '1') {
            rules.push({ row: i, col: 0, rowspan: this.list.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
            rules.push({ row: i, col: 3, rowspan: this.list.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
            rules.push({ row: i, col: 8, rowspan: this.list.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
          } else {
            rules.push({ row: i, col: 2, rowspan: this.list.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
            rules.push({ row: i, col: 7, rowspan: this.list.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
          }
        }
      }
      return rules;
    },
  },
  watch: {
    visible(n) {
      if (n) {
        // 清除选中行
        this.checkedRows = [];
        this.myCheckedIds = [];
        this.$refs.xTable && this.$refs.xTable.clearCheckboxRow();
        this.status = '1';
        this.status2 = '1';
        console.log(this.checkedIds, this.list.length, '*******')
        if (this.checkedIds && this.checkedIds.length > 0) {
          this.myCheckedIds = [...this.checkedIds];
          this.updateCheckedRowsByCheckedIds();
        }
      }
    },
    status() {
      if (this.status === '1') {
        this.list = this.allList.notUsedList;
        this.$nextTick(() => {
          this.updateCheckedRowsByCheckedIds();
        });
      } else {
        this.list = this.allList.usedList;
      }
    },
    status2() {
      this.status = "1";
      this.initData();
    }
  },
  mounted() {
    this.loadShowAllList();
    this.initData();
  },
  methods: {
    async initData() {
      this.listLoading = true;
      try {
        const params = { current: 1, size: 1000 };
        if (this.status2 === "2") {
          params.shareFlag = 1;
        }
        const res = await getCcdBillPage({ ...params, reimbursementStatus: 1 })
        const records = res.data.ccdEntBillPageChildPage.records;
        // 添加按钮loading给每行数据
        records.forEach((v, index) => {
          // 对于发票组的，非第一个的，禁用checkbox
          v.checkable = !(v.groupId && records.findIndex(item => item.groupId === v.groupId) !== index);
        });
        this.allList.notUsedList = records;
        const res1 = await getCcdBillPage({ ...params, reimbursementStatus: 2 })
        const records1 = res1.data.ccdEntBillPageChildPage.records;
        // 添加按钮loading给每行数据
        records1.forEach((v, index) => {
          // 对于发票组的，非第一个的，禁用checkbox
          v.checkable = !(v.groupId && records1.findIndex(item => item.groupId === v.groupId) !== index);
        });
        this.allList.usedList = records1;
        if (this.status === '1') {
          this.list = this.allList.notUsedList;
          this.$nextTick(() => {
            this.updateCheckedRowsByCheckedIds();
          });
        } else {
          this.list = this.allList.usedList;
        }
      } catch (e) {
        console.log(e);
      } finally {
        this.listLoading = false;
      }
    },
    async loadShowAllList() {
      const params = { current: 1, size: 1000, reimbursementStatus: 1 };
      const myInvoiceList = (await getCcdBillPage({ ...params })).data.ccdEntBillPageChildPage.records;
      params['shareFlag'] = 1;
      const shareInvoiceList = (await getCcdBillPage({ ...params })).data.ccdEntBillPageChildPage.records;
      const newShareInvoiceList = shareInvoiceList.filter(v => !myInvoiceList.map(v2 => v2.id).includes(v.id));
      this.showAllList = [...myInvoiceList, ...newShareInvoiceList];
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    onConfirm() {
      this.updateVisible(false);
      this.$emit('confirm', this.myCheckedAllInfo());
    },
    formatDate(date) {
      return dayjs(date).format("YYYY-MM-DD");
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
    // 找到一组发票
    findSameGroupId(row) {
      // return this.allList.notUsedList.filter(item => item.groupId === row.groupId);
      // 对于发票组，目前发票列表只返回了发票组中的一个发票，因此不能通过列表查出所有
      return row.inners.map(v => v.key);
    },
    goToDetail(row) {
      Object.assign(this.detail, { visible: true, data: row });
    },
    selectChangeEvent({ checked }) {
      const $table = this.$refs.xTable;
      if ($table) {
        const records = $table.getCheckboxRecords();
        // records为当前列表list所勾选的，更新this.myCheckedIds
        this.updateMyCheckedIds(records);
        console.log(checked ? '勾选事件' : '取消事件', records)
      }
    },
    updateMyCheckedIds(rows = []) {
      rows.forEach(v => {
        if (!this.myCheckedIds.includes(v.id)) {
          this.myCheckedIds.push(v.id);
        }
      });
    },
    updateCheckedRowsByCheckedIds() {
      const rows = [];
      for (let i = 0; i < this.list.length; i++) {
        let cell = this.list[i];
        if (this.myCheckedIds.includes(cell.id)) {
          rows.push(cell);
        }
      }
      this.checkedRows = [...rows];
      this.$refs.xTable && this.$refs.xTable.setCheckboxRow(this.checkedRows, true);
    },
    myCheckedAllInfo() {
      const rows = [];
      this.myCheckedIds.forEach(id => {
        const index = this.showAllList.findIndex(v => v.id === id);
        if (index > -1) {
          if (this.showAllList[index].groupId) {
            this.showAllList[index].inners.forEach(v => {
              if (!rows.map(v2 => v2.id).includes(v.key.id)) {
                rows.push({ ...v.key, typeLable: this.showAllList[index].typeLable });
              }
            });
          } else {
            rows.push(this.showAllList[index]);
          }
        }
      });
      return rows;
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 20px 20px 0 20px !important;
}
>>> .el-dialog__footer {
  padding: 24px 0 !important;
}

::v-deep .el-radio-button__inner {
  height: 35px;
  background: #F4F8F9;
  border-radius: 4px;
  border: none;
  font-weight: 400;
  font-size: 14px;
  color: #919499;
  line-height: 35px;
  padding: 0 12px;
  text-align: center;
  margin-right: 8px;
}
::v-deep .el-button--text {
  color: #00B4C4;
}
::v-deep .el-radio-button:first-child .el-radio-button__inner {
  border-left: none;
}
.operate-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.custom-vxe-table {
  width: 100%;
  margin-top: 12px;
}
.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .btn-confirm {
    width: 120px;
    height: 42px;
    background: #00B4C4;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 20px;
    margin-left: 20px;
  }
  .btn-cancel {
    width: 120px;
    height: 42px;
    border-radius: 8px;
    border: 1px solid #00B4C4;
    font-weight: 500;
    font-size: 14px;
    color: #00B4C4;
    line-height: 20px;
  }
}
.mg-b12 {
  margin-bottom: 12px;
}
</style>
