<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main" element-loading-text="处理中，请稍等">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="申请月份" prop="applyMonth">
                  <el-date-picker
                    v-model="query.applyMonth"
                    type="month"
                    placeholder="选择月"
                    value-format="yyyy-MM"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
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

              <el-col :span="8">
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
              <el-col :span="8" v-if="propertyJson && propertyJson.allowPayStatus">
                <el-form-item label="付款状态" prop="isPay">
                  <el-select v-model="query.isPay" placeholder="请选择..." style="width: 100%">
                    <el-option label="已付款" :value="1"/>
                    <el-option label="未付款" :value="0"/>
                  </el-select>
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
        <expense-account-list ref="listRef" :query="query" />
      </div>
    </div>
  </div>
</template>

<script>
import { orderTypeSelect } from "@/api/business/expenseAccount";
import baseMixin from '@/mixins/print/baseMixin';
import ExpenseAccountList from "@/views/expenseAccountPrintManage/components/List.vue";

export default {
  name: 'ExpenseAccountPrintManageIndex',
  components: { ExpenseAccountList },
  mixins: [baseMixin],
  props: {
    financialSystem: {
      // common是无对接的普通报销单管理  YouBIP是用友财务对接的报销单管理
      type: String,
      default: "common"
    }
  },
  data() {
    return {
      query: {
        applyMonth: "",
        type: "",
        minAmount: undefined,
        maxAmount: undefined,
        isPay: undefined
      },
      typeOptions: [], // 报销单类型选项
    }
  },
  computed: {
    propertyJson() {
      return this.$store.state.orgInfo.propertyJson;
    }
  },
  created() {
    // 加载报销单类型
    orderTypeSelect({ type: 2, status: 1 }).then(res => {
      this.typeOptions = res.data.map(v => ({ label: v.name, value: v.id }))
    });
    if (!this.propertyJson) {
      this.$store.dispatch('orgInfo/getOrgAllInfo');
    }
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
      this.onSearch();
    },
    refreshList(resetPageNum) {
      this.$refs.listRef.refresh(resetPageNum);
    },
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
.sync-btn {
  text-align: right;
  padding-right: 10px;
}
::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
</style>
