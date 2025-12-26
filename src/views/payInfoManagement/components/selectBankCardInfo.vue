<template>
  <el-dialog
    title="选择收款人"
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
    <div class="dialog-container">
      <el-form :model="query" ref="formRef" label-width="80px" style="width: 100%">
        <div class="query-flex">
          <el-col :span="8">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="query.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="银行卡号" prop="bankNumber">
              <el-input v-model="query.bankNumber" placeholder="请输入银行卡号" />
            </el-form-item>
          </el-col>
        </div>
        <el-col :span="8" class="align">
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button type="primary" @click="onReset">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
      <JNPF-table
        v-loading="listLoading"
        :data="list"
        :list-query="listQuery"
      >
        <el-table-column
          prop="name"
          label="姓名"
          width="120"
        />
        <el-table-column
          label="银行卡号"
          prop="bankNumber"
          width="150"
        />
        <el-table-column
          label="银行卡类型"
          prop="cardTypeStr"
          width="120"
        />
        <el-table-column
          label="开户银行"
          prop="baseOpened"
        />
        <el-table-column
          label="操作"
          fixed="right"
          width="100"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="onSelect(scope.row)"
            >选择
            </el-button>
          </template>
        </el-table-column>
      </JNPF-table>
      <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
    </div>
  </el-dialog>
</template>
<script>
import { getCcdUserBankPage } from "@/api/business/bankCardInfoManagement";

export default {
  name: 'selectBankCardInfo',
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
  },
  data() {
    return {
      list: [],
      listLoading: false,
      listQuery: {
        current: 1,
        size: 20,
      },
      total: 0,
      query: {
        name: undefined,
        bankNumber: undefined,
      },
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.onSearch();
      }
    },
  },
  methods: {
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.query,
        ...this.listQuery,
      };
      getCcdUserBankPage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    onSelect(row) {
      this.$emit('confirm', row);
      this.updateVisible(false);
    },
    updateVisible(val) {
      this.$refs.formRef && this.$refs.formRef.resetFields();
      this.$emit('update:visible', val)
    },
    // 搜索
    onSearch() {
      this.listQuery.current = 1;
      this.initData();
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef && this.$refs.formRef.resetFields();
      this.onSearch();
    },
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 10px 10px !important;
}
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
.dialog-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}
</style>
