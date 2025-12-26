<template>
  <el-dialog
    title="预算明细"
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
    <div class="content-container">
      <el-form ref="formRef" :model="query" label-width="120px">
        <el-col :span="12">
          <el-form-item label="报销单类型" prop="type">
            <el-select v-model="query.type" placeholder="请选择..." style="width: 100%">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报销人" prop="exsPeople">
            <el-input v-model="query.exsPeople" placeholder="请输入姓名、电话号码" />
          </el-form-item>
        </el-col>
        <el-col :span="14">
          <el-col :span="14">
            <el-form-item label="报销金额" prop="minAmount">
              <el-input-number v-model="query.minAmount" :min="1" :max="999999999" placeholder="请输入最低金额" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <div style="text-align: center; padding-top: 6px">至</div>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="maxAmount" label-width="auto">
              <el-input-number v-model="query.maxAmount" :min="1" :max="999999999" placeholder="请输入最高金额" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="10" class="align">
          <el-form-item>
            <el-button type="primary" @click="onSearch">查询</el-button>
            <el-button type="primary" @click="onReset">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
      <vxe-table
        resizable
        border
        size="small"
        ref="xTable"
        :data="list"
        :loading="listLoading"
        height="300"
      >
        <vxe-column type="seq" title="序号" width="70" />
        <vxe-column field="budgetName" title="预算名称" min-width="160" />
        <vxe-column field="name" title="报销单名称" min-width="160" />
        <vxe-column field="bizFlowModuleName" title="报销单类型" min-width="160" />
        <vxe-column field="status" title="报销状态" min-width="160">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 0">待提交</el-tag>
            <el-tag v-else-if="scope.row.status == 1" type="warning">审核中</el-tag>
            <el-tag v-else-if="scope.row.status == 2" type="info">已撤回</el-tag>
            <el-tag v-else-if="scope.row.status == 3" type="success">审核通过</el-tag>
            <el-tag v-else-if="scope.row.status == 4" type="danger">审核失败</el-tag>
          </template>
        </vxe-column>
        <vxe-column field="entName" title="所属企业" min-width="160" />
        <vxe-column field="exsUserName" title="报销人" min-width="160" />
        <vxe-column field="exsCost" title="报销金额" min- width="160" />
        <vxe-column field="exsUserPhone" title="报销人电话" min-width="160" />
        <vxe-column field="applyTime" title="申请时间" min-width="160" />
        <vxe-column field="action" title="操作" width="100" fixed="right">
          <template #default="{row}">
            <el-button
              type="text"
              @click="goToDetail(row)"
            >票据详情</el-button>
          </template>
        </vxe-column>
      </vxe-table>
      <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="loadData" />
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { orderTypeSelect } from "@/api/business/expenseAccount";
import { getBudgetDetailOrderPage } from "@/api/business/budgetManagement";

export default {
  name: 'budgetList',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    budgetId: {
      type: String,
      default: ''
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    financialSystem: {
      // common是无对接的普通报销单管理  YouBIP是用友财务对接的报销单管理
      type: String,
      default: "common"
    }
  },
  data() {
    return {
      query: {
        exsPeople: "",
        type: "",
        minAmount: undefined,
        maxAmount: undefined,
        budgetDetailId: this.budgetId,
      },
      typeOptions: [], // 报销单类型选项
      list: [],
      listLoading: false,
      listQuery: {
        current: 1,
        size: 20,
      },
      realQuery: {},
      total: 0,
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
        this.list = [];
        this.query = {
          exsPeople: "",
          type: "",
          minAmount: undefined,
          maxAmount: undefined,
          budgetDetailId: this.budgetId,
        };
        this.loadData();
      }
    }
  },
  created() {
    // 加载报销单类型
    orderTypeSelect({ type: 2, status: 1 }).then(res => {
      this.typeOptions = res.data.map(v => ({ label: v.name, value: v.id }))
    });
  },
  methods: {
    loadData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
        ...this.query,
      };
      this.realQuery = _query;
      getBudgetDetailOrderPage(_query).then(res => {
        this.list = res.data.records.map((v, i) => {
          return {
            ...v,
            index: i
          }
        });
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    // 搜索
    onSearch() {
      // 加载数据
      this.listQuery.current = 1;
      this.loadData();
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.onSearch();
    },
    onConfirm() {},
    goToDetail(row) {
      this.$router.push({
        path: "/expenseAccountDetail",
        query: {
          id: row.id,
          from: 3, // 1是报销单管理 2是票据中心 3预算管理 4归档管理
          financialSystem: this.financialSystem, // YouBIP是用友V8财务系统
          queryData: JSON.stringify(this.realQuery), // 当前列表的查询条件
          listQuery: JSON.stringify(this.listQuery), // 当前数据在第几页，一页几个数据
          index: row.index, // 当前数据所在列的第几个，从0开始(下标)
        }
      });
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-divider--horizontal {
  margin: 12px 0;
}
.content-container {
  display: flex;
  flex-direction: column;
}
</style>
