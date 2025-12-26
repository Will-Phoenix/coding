<template>
  <el-dialog
    :title="'增加' + type === 'size'? '存储空间' : '企业使用期限'"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="1000px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div>请选择关联订单</div>
    <JNPF-table
      style="margin-top: 20px"
      v-loading="listLoading"
      ref="tableRef"
      :data="list"
      has-c
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        prop="typeStr"
        label="服务类型"
        align="left"
      />
      <el-table-column
        prop="name"
        label="服务名称"
        align="left"
      />
      <el-table-column
        prop="price"
        label="订单金额"
        align="left"
      />
      <el-table-column
        prop="orderNo"
        label="订单号"
        align="left"
        min-width="110"
      />
      <el-table-column
        prop="createTime"
        label="订单创建时间"
        align="left"
        min-width="160"
      />
    </JNPF-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getEntServiceOrderListByEntId, postAddEntService } from "@/api/business/serviceManagement";

export default {
  name: 'addService',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    type: {
      type: Number,
      default: () => (1)
    },
    entId: {
      type: String,
      default: () => ("")
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
      listLoading: false,
      list: [],
      selectionList: [],
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.loadEntOrderList();
        this.selectionList = [];
        this.list = [];
        this.$nextTick(() => this.$refs.tableRef && this.$refs.tableRef.$refs.JNPFTable && this.$refs.tableRef.$refs.JNPFTable.clearSelection())
      }
    },
  },
  methods: {
    onConfirm() {
      if (!this.selectionList || this.selectionList.length === 0) {
        this.$message.error('请选择关联订单！')
        return;
      }
      let orderNo = this.selectionList[0].orderNo;
      postAddEntService({ orderNo, entId: this.entId }).then(() => {
        this.$message.success("操作成功");
        this.$emit('confirm');
        this.updateVisible(false);
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    loadEntOrderList() {
      this.listLoading = true;
      getEntServiceOrderListByEntId({ entId: this.entId, type: this.type }).then(res => {
        this.list = res.data;
        this.listLoading = false;
      })
    },
    handleRowClick(row) {
      if (this.selectionList[0] === row) {
        // 取消
        this.selectionList = [];
        this.$refs.tableRef && this.$refs.tableRef.$refs.JNPFTable && this.$refs.tableRef.$refs.JNPFTable.clearSelection()
      } else {
        this.selectionList = [row];
        this.$refs.tableRef && this.$refs.tableRef.$refs.JNPFTable && this.$refs.tableRef.$refs.JNPFTable.clearSelection()
        this.$refs.tableRef && this.$refs.tableRef.$refs.JNPFTable && this.$refs.tableRef.$refs.JNPFTable.toggleRowSelection(row, true);
      }
    },
    handleSelectionChange(val) {
      this.selectionList = val;
      if (val.length > 1) {
        this.$refs.tableRef && this.$refs.tableRef.$refs.JNPFTable && this.$refs.tableRef.$refs.JNPFTable.clearSelection()
        this.$refs.tableRef && this.$refs.tableRef.$refs.JNPFTable && this.$refs.tableRef.$refs.JNPFTable.toggleRowSelection(val.pop());
      }
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
::v-deep .el-select-dropdown__item{
  height: 40px;
}
.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .row-img {
    width: 32px;
    height: 32px;
  }
}
::v-deep thead .el-table-column--selection .cell {
  display: none;
}
</style>
