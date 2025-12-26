<template>
  <div>
    <JNPF-table
      v-loading="listLoading"
      :data="list"
      :list-query="listQuery"
      :height="null"
    >
      <el-table-column
        prop="name"
        label="报销单名称"
        align="left"
      />
      <el-table-column
        label="报销单类型"
        prop="bizFlowModuleName"
        algin="left"
        width="160"
      />
      <el-table-column
        label="所属企业"
        prop="entName"
        algin="left"
      />
      <el-table-column
        label="报销人"
        prop="exsUserName"
        algin="left"
        width="120"
      />
      <el-table-column
        label="报销金额"
        prop="exsCost"
        algin="left"
        width="160"
      />
      <el-table-column
        v-if="propertyJson && propertyJson.allowPayStatus"
        label="付款状态"
        algin="left"
        width="160"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isPay" type="success">已付款</el-tag>
          <el-tag v-else type="info">未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="报销人电话"
        prop="exsUserPhone"
        width="120"
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
          >票据打印
          </el-button>
        </template>
      </el-table-column>
    </JNPF-table>
    <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
  </div>
</template>
<script>
import { getExsOrderPageByUser } from "@/api/business/expenseAccount";
import baseMixin from '@/mixins/print/baseMixin';
import { mapGetters } from "vuex";

export default {
  name: "ExpenseAccountList",
  mixins: [baseMixin],
  props: {
    query: {
      type: Object,
      default: () => ({})
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
      realQuery: {},
      total: 0,
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    propertyJson() {
      return this.$store.state.orgInfo.propertyJson;
    }
  },
  mounted() {
    this.initData();
    if (!this.propertyJson) {
      this.$store.dispatch('orgInfo/getOrgAllInfo');
    }
  },
  methods: {
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
        ...this.query,
      };
      this.realQuery = _query;
      getExsOrderPageByUser(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    goToDetail(row, index) {
      if (row.isPay && this.propertyJson?.printFlag) {
        this.$message.warning("已付款单据不允许打印");
        return;
      }
      this.$router.push({
        path: "/expenseAccountPrintDetail",
        query: {
          id: row.id,
          queryData: JSON.stringify(this.realQuery), // 当前列表的查询条件
          listQuery: JSON.stringify(this.listQuery), // 当前数据在第几页，一页几个数据
          index: index, // 当前数据所在列的第几个，从0开始(下标)
        }
      });
    },
    refresh(resetPageNum) {
      if (resetPageNum) {
        // 先把页码设置到第一页
        this.listQuery.current = 1;
      }
      this.initData();
    },
  }
}
</script>
<style scoped lang="scss">

</style>
