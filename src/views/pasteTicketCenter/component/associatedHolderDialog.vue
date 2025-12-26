<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="50%"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="formRef" :model="query" label-width="150px">
      <el-col :span="12">
        <el-form-item label="搜索" prop="searchKey">
          <el-input v-model="query.searchKey" placeholder="请输入" clearable />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label-width="20px">
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button type="primary" @click="onReset">重置</el-button>
        </el-form-item>
      </el-col>
    </el-form>
    <JNPF-table
      ref="tableRef"
      v-loading="listLoading"
      :list-query="listQuery"
      :data="list"
      :has-c="false"
      highlight-current-row
      @row-click="singleSelect"
      style="width: 100%;height: 450px"
    >
      <el-table-column
        label="选择"
        align="left"
        width="60"
      >
        <template slot-scope="scope">
          <el-radio v-model="radioSelect" :label="scope.row.userId">&nbsp</el-radio>
        </template>
      </el-table-column>
      <el-table-column
        prop="realName"
        label="姓名"
        align="left"
        min-width="100"
      />
      <el-table-column
        label="电话"
        prop="mobilePhone"
        algin="left"
        min-width="100"
      />
      <el-table-column
        label="公司"
        prop="companyName"
        algin="left"
        min-width="200"
      />
      <el-table-column
        label="部门"
        prop="deptName"
        algin="left"
        min-width="120"
      />
    </JNPF-table>
    <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { holderUserPage, postShareBill, setHolder, setHolderBatch } from "@/api/business/pasteTicket";
import { setHolderToUserFolder } from "@/api/business/userFolder";

export default {
  name: 'holderRefDialog',
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
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: [Object, Array],
      default: () => ({})
    },
    from: {
      type: Number,
      default: 1, // 1. 发票 2. 资料 3. 共享发票
    },
  },
  data() {
    return {
      query: {
        searchKey: "",
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      list: [],
      total: 0,
      listLoading: false,
      selection: [],
      radioSelect: "",
    }
  },
  computed: {
    title() {
      if (this.from === 1) {
        return Array.isArray(this.data) ? "批量关联持有人" : this.data.holderName ? '变更发票持有人' : '关联发票持有人';
      } else if (this.from === 3) {
        return '共享发票';
      } else {
        return Array.isArray(this.data) ? "批量关联持有人" : this.data.holderName ? '变更持有人' : '关联持有人';
      }
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.onSearch();
      }
    }
  },
  methods: {
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      this.listQuery.current = 1;
      // 加载数据
      this.initData();
    },

    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      this.radioSelect = "";
      holderUserPage({ ...this.listQuery, ...this.query }).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    onConfirm() {
      if (this.loading) return;
      if (this.radioSelect === "") {
        this.$message.warning("请点击选择一个");
      } else {
        // 由于两个业务需要用到，因此两个接口，如果后续比较多模块用到，该组件需要把提交请求接口部分提取到各自业务页面，该组件只返回userID
        let method = "";
        if (this.from === 1) {
          if (Array.isArray(this.data)) {
            method = setHolderBatch;
          } else {
            method = setHolder;
          }
        } else if (this.from === 2) {
          method = setHolderToUserFolder;
        } else if (this.from === 3) {
          method = postShareBill;
        }
        // 对于用户资料，如果是多选，则处理ids
        let folderIds = [];
        if (Array.isArray(this.data)) {
          folderIds = this.data.map(v => v.id);
        } else {
          folderIds = [this.data.id];
        }
        let requestData = ""
        if (this.from === 1) {
          if (Array.isArray(this.data)) {
            requestData = { billIds: folderIds, userId: this.radioSelect }
          } else {
            requestData = { billId: this.data.id, userId: this.radioSelect }
          }
        } else if (this.from === 2) {
          requestData = { folderIds: folderIds, userId: this.radioSelect }
        } else if (this.from === 3) {
          requestData = { id: this.data.id, userIds: [this.radioSelect] }
        }
        method(requestData).then(() => {
          this.$message.success("操作成功");
          this.updateVisible(false);
          this.$emit("confirm");
        });
      }
    },
    updateVisible(val) {
      this.$refs.formRef.resetFields();
      this.$emit('update:visible', val);
    },
    selectChange(selection, row) {
      if (selection.length > 1) {
        this.$refs.tableRef.toggleRowSelection(row, false);
        this.$message.warning("只能勾选一条");
        selection.pop();
      }
      this.selection = selection;
    },
    singleSelect(row) {
      this.radioSelect = row.userId;
    },
  }
}
</script>
<style lang="scss" scoped></style>
