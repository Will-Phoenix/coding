<template>
  <el-dialog
    :title="`关联${text}`"
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
      <div class="operate-container mg-b12" v-if="formType === 1">
        <el-radio-group v-model="status2" text-color="#00B4C4" fill="#e5f7f9">
          <el-radio-button label="1">{{ `我的${text}` }}</el-radio-button>
          <el-radio-button label="2">{{ `共享给我的${text}` }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="operate-container">
        <el-radio-group v-model="status" text-color="#00B4C4" fill="#e5f7f9">
          <el-radio-button label="1">{{ unLink }}</el-radio-button>
          <el-radio-button label="2">{{ link }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="custom-vxe-table-container">
        <vxe-table
          resizable
          stripe
          class="custom-vxe-table"
          size="small"
          ref="xTable"
          :data="list"
          :loading="listLoading"
          :max-height="480"
          @checkbox-all="selectAllChangeEvent"
          @checkbox-change="selectChangeEvent"
          @radio-change="radioChangeEvent"
        >
          <vxe-column v-if="multiple" type="checkbox" width="60"></vxe-column>
          <vxe-column v-else type="radio" width="60"></vxe-column>
          <vxe-column field="name" :title="`${text}名称`" min-width="260" />
          <vxe-column :field="formType === 1 ? 'applyUserName' : 'exsUserName'" title="申请人" min-width="100" />
          <vxe-column :field="formType === 1 ? 'applyDate' : 'applyTime'" title="申请时间" min-width="100" />
          <vxe-column field="status" title="状态" min-width="50">
            <template #default="{row}">
              <span :class="`center-custom-status center-custom-status-${statusMap[row.status].color}`">{{ statusMap[row.status].label }}</span>
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
    <approval-order-detail :visible.sync="orderDetail.visible" :data="orderDetail.data" />
    <span slot="footer" class="dialog-footer">
      <el-button class="btn-cancel" @click="updateVisible(false)">取消</el-button>
      <el-button class="btn-confirm" @click="onConfirm">提交</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { APIGetListCompleteOrdersByType, listForPayment } from "@/api/business/expenseAccount";
import { APIGetListCompleteOrders, APIGetBindCompleteOrders } from "@/api/cicada/oa";
import ApprovalOrderDetail from "@/views/approvalCenter/components/approvalOrderDetail.vue";
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
  name: 'selectApprovalOrder',
  components: { ApprovalOrderDetail },
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
    },
    orderType: Number,
    formType: {
      type: Number,
      default: 1
    },
    multiple: {
      type: Boolean,
      default: true // 是否多选
    },
    // 只有当formType为1时，即审批单时，有效。此字段代表从哪里调起的审批单选择弹窗，影响获取可关联审批单列表接口的参数
    fromFormType: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      listLoading: false,
      list: [],
      allList: {
        notUsedList: [],
        usedList: [],
        sharedNotUsedList: [],
        sharedUsedList: []
      },
      buttonLoading: false, // 上传列表loading
      status: "1",
      status2: "1",
      detail: {
        visible: false,
        data: {},
      },
      orderDetail: {
        visible: false,
        data: {},
      },
      statusMap: getSpdStatusMap(),
      checkedRows: {
        notUsedRows: [],
        usedRows: [],
        sharedNotUsedRows: [],
        sharedUsedRows: []
      },
    }
  },
  computed: {
    text() {
      return this.formType === 1 ? "审批单" : "报销单";
    },
    unLink() {
      return this.fromFormType === 1 ? "未关联" : "未报销";
    },
    link() {
      return this.fromFormType === 1 ? "已关联" : "已报销";
    }
  },
  watch: {
    visible(n) {
      if (n) {
        // 清除选中行
        if (this.multiple) {
          this.$refs.xTable && this.$refs.xTable.clearCheckboxRow();
        } else {
          this.$refs.xTable && this.$refs.xTable.clearRadioRow();
        }
        this.resetCheckedRows();
        if (this.checkedIds && this.checkedIds.length > 0) {
          for (let i = 0; i < this.allList.notUsedList.length; i++) {
            let cell = this.allList.notUsedList[i];
            if (this.checkedIds.includes(this.allList.notUsedList[i].id)) {
              this.checkedRows.notUsedRows.push(cell)
            }
          }
        }
        if (this.checkedIds && this.checkedIds.length > 0) {
          for (let i = 0; i < this.allList.usedList.length; i++) {
            let cell = this.allList.usedList[i];
            if (this.checkedIds.includes(this.allList.usedList[i].id)) {
              this.checkedRows.usedRows.push(cell)
            }
          }
        }
        if (this.checkedIds && this.checkedIds.length > 0) {
          for (let i = 0; i < this.allList.sharedNotUsedList.length; i++) {
            let cell = this.allList.sharedNotUsedList[i];
            if (this.checkedIds.includes(this.allList.sharedNotUsedList[i].id)) {
              this.checkedRows.sharedNotUsedRows.push(cell)
            }
          }
        }
        if (this.checkedIds && this.checkedIds.length > 0) {
          for (let i = 0; i < this.allList.sharedUsedList.length; i++) {
            let cell = this.allList.sharedUsedList[i];
            if (this.checkedIds.includes(this.allList.sharedUsedList[i].id)) {
              this.checkedRows.sharedUsedRows.push(cell)
            }
          }
        }
        this.updateListAndCheckByStatus();
      }
    },
    status() {
      this.updateListAndCheckByStatus();
    },
    status2() {
      this.updateListAndCheckByStatus();
    },
    orderType() {
      this.initData();
    }
  },
  async mounted() {
    await this.initData();
  },
  methods: {
    async initData() {
      let res;
      if (this.formType === 1) {
        res = await APIGetBindCompleteOrders({ orderType: this.orderType, exsBindFlag: this.fromFormType === 1 ? 0 : 1 });
        const entityList = res.data?.entityList || [];
        const shareEntityList = res.data?.shareEntityList || [];
        this.allList.usedList = entityList.filter(v => v.isUsed === 1)
        this.allList.notUsedList = entityList.filter(v => v.isUsed === 0)
        this.allList.sharedUsedList = shareEntityList.filter(v => v.isUsed === 1)
        this.allList.sharedNotUsedList = shareEntityList.filter(v => v.isUsed === 0)
      } else if (this.formType === 2) {
        res = await listForPayment()
        this.allList.usedList = (res.data || []).filter(v => v.isUsed === 1)
        this.allList.notUsedList = (res.data || []).filter(v => v.isUsed === 0)
      }
    },
    updateListAndCheckByStatus() {
      if (this.status2 === '1' && this.status === '1') {
        this.list = this.allList.notUsedList;
        this.$nextTick(() => {
          if (this.multiple) {
            this.$refs.xTable && this.$refs.xTable.setCheckboxRow(this.checkedRows.notUsedRows, true);
          } else {
            this.checkedRows.notUsedRows.length > 0 && this.$refs.xTable && this.$refs.xTable.setRadioRow(this.checkedRows.notUsedRows[0]);
          }
        })
      } else if (this.status2 === '1' && this.status === '2') {
        this.list = this.allList.usedList;
        this.$nextTick(() => {
          if (this.multiple) {
            this.$refs.xTable && this.$refs.xTable.setCheckboxRow(this.checkedRows.usedRows, true);
          } else {
            this.checkedRows.usedRows.length > 0 && this.$refs.xTable && this.$refs.xTable.setRadioRow(this.checkedRows.usedRows[0]);
          }
        })
      } else if (this.status2 === '2' && this.status === '1') {
        this.list = this.allList.sharedNotUsedList;
        this.$nextTick(() => {
          if (this.multiple) {
            this.$refs.xTable && this.$refs.xTable.setCheckboxRow(this.checkedRows.sharedNotUsedRows, true);
          } else {
            this.checkedRows.sharedNotUsedRows.length > 0 && this.$refs.xTable && this.$refs.xTable.setRadioRow(this.checkedRows.sharedNotUsedRows[0]);
          }
        })
      } else {
        this.list = this.allList.sharedUsedList;
        this.$nextTick(() => {
          if (this.multiple) {
            this.$refs.xTable && this.$refs.xTable.setCheckboxRow(this.checkedRows.sharedUsedRows, true);
          } else {
            this.checkedRows.sharedUsedRows.length > 0 && this.$refs.xTable && this.$refs.xTable.setRadioRow(this.checkedRows.sharedUsedRows[0]);
          }
        })
      }
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    onConfirm() {
      let rows = []
      rows.push(...this.checkedRows.usedRows)
      rows.push(...this.checkedRows.notUsedRows)
      rows.push(...this.checkedRows.sharedNotUsedRows)
      rows.push(...this.checkedRows.sharedUsedRows)
      console.log('onConfirm===rows', rows);
      if (rows.length === 0) {
        return this.$message.warning(`请选择${this.text}！`)
      }
      this.updateVisible(false);
      this.$emit('confirm', rows);
    },
    goToDetail(row) {
      /* let opType = '0';
      let query = {
        id: row.id,
        flowId: row.flowId,
        opType: opType,
        taskId: row.id,
      };
      this.$router.push({ path: '/approvalCenter/detail', query }) */
      this.orderDetail.data = row;
      this.orderDetail.visible = true;
    },
    selectAllChangeEvent({ checked }) {
      const $table = this.$refs.xTable
      if ($table) {
        const records = $table.getCheckboxRecords()
        this.updateCheckedRows(records)
        console.log(checked ? '所有勾选事件' : '所有取消事件', records)
      }
    },
    selectChangeEvent({ checked }) {
      const $table = this.$refs.xTable
      if ($table) {
        const records = $table.getCheckboxRecords()
        this.updateCheckedRows(records)
        console.log(checked ? '勾选事件' : '取消事件', records)
      }
    },
    updateCheckedRows(rows) {
      if (this.status2 === '1' && this.status === '1') {
        this.checkedRows.notUsedRows = rows;
      } else if (this.status2 === '1' && this.status === '2') {
        this.checkedRows.usedRows = rows;
      } else if (this.status2 === '2' && this.status === '1') {
        this.checkedRows.sharedNotUsedRows = rows;
      } else {
        this.checkedRows.sharedUsedRows = rows;
      }
    },
    resetCheckedRows() {
      this.checkedRows = {
        notUsedRows: [],
        usedRows: [],
        sharedNotUsedRows: [],
        sharedUsedRows: []
      };
    },
    radioChangeEvent({ newValue }) {
      this.resetCheckedRows();
      if (this.status2 === '1' && this.status === '1') {
        this.checkedRows.notUsedRows = [newValue];
      } else if (this.status2 === '1' && this.status === '2') {
        this.checkedRows.usedRows = [newValue];
      } else if (this.status2 === '2' && this.status === '1') {
        this.checkedRows.sharedNotUsedRows = [newValue];
      } else {
        this.checkedRows.sharedUsedRows = [newValue];
      }
    },
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
    background: #ECFDFF;
  }
}
.mg-b12 {
  margin-bottom: 12px;
}
</style>
