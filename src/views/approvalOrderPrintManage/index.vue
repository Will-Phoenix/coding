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
                <el-form-item label="审批单类型" prop="type">
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
                <el-form-item label="申请人" prop="applyPeople">
                  <el-input v-model="query.applyPeople" placeholder="请输入姓名、电话号码" />
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
        <JNPF-table
          style="margin: 0 20px"
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            prop="name"
            label="审批单名称"
            align="left"
          />
          <el-table-column
            label="审批单类型"
            prop="applyTypeCn"
            algin="left"
            width="160"
          />
          <el-table-column
            label="所属企业"
            prop="entName"
            algin="left"
          />
          <el-table-column
            label="申请人"
            prop="applyUserName"
            algin="left"
            width="120"
          />
          <el-table-column
            label="申请人电话"
            prop="applyUserMobile"
            width="120"
            algin="left"
          />
          <el-table-column
            label="申请时间"
            prop="applyDate"
            algin="left"
            width="160"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="goToDetail(scope.row, scope.$index)"
              >详情
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
  </div>
</template>

<script>
import { getApplyOrderPageByUser, orderTypeSelect } from "@/api/business/expenseAccount";
import baseMixin from '@/mixins/print/baseMixin';

export default {
  name: 'ApprovalOrderPrintManageIndex',
  mixins: [baseMixin],
  data() {
    return {
      query: {
        applyMonth: "",
        type: "",
        applyPeople: "",
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
  created() {
    // 加载报销单类型
    orderTypeSelect({ type: 1, status: 1 }).then(res => {
      this.typeOptions = res.data.map(v => ({ label: v.name, value: v.id }))
    });
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    // 搜索
    onSearch() {
      // 加载数据
      this.listQuery.current = 1;
      this.initData();
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
        ...this.query,
      };
      this.realQuery = _query;
      getApplyOrderPageByUser(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    goToDetail(row) {
      this.$router.push({
        path: "/approvalOrderPrintDetail",
        query: {
          id: row.id,
        }
      });
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
