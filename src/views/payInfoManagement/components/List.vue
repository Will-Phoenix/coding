<template>
  <div>
    <JNPF-table
      v-loading="listLoading"
      :data="list"
      :list-query="listQuery"
      :height="null"
    >
      >
      <el-table-column
        prop="exsCost"
        label="报销单待付款金额"
        align="left"
        width="120"
      />
      <el-table-column
        prop="name"
        label="所属报销单"
        align="left"
        min-width="180"
      />
      <el-table-column
        label="报销单类型"
        prop="bizFlowModuleName"
        algin="left"
        width="180"
      />
      <el-table-column
        label="报销完成时间"
        prop="finishTime"
        algin="left"
        width="140"
      />
      <el-table-column
        prop="paymentNumber"
        label="付款笔数"
        align="left"
        width="100"
      />
      <el-table-column
        label="推送状态"
        prop="pushStatus"
        algin="left"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.payPushStatus * 1 === 0" type="danger">未推送</el-tag>
          <el-tag v-if="scope.row.payPushStatus * 1 === 1" type="success">已推送</el-tag>
          <el-tag v-if="scope.row.payPushStatus * 1 === 2" type="info">处理完成</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        fixed="right"
        width="240"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="goToDetail(scope.row)"
          >支付信息
          </el-button>
          <el-button
            v-if="status === 1"
            type="text"
            @click="onCancelPush(scope.row)"
          >撤回推送
          </el-button>
          <el-button
            v-if="status === 0"
            type="text"
            @click="onRemarkFinished(scope.row, 2)"
          >标记为处理完成
          </el-button>
          <el-button
            v-if="status === 2"
            type="text"
            @click="onRemarkFinished(scope.row, 0)"
          >取消标记
          </el-button>
        </template>
      </el-table-column>
    </JNPF-table>
    <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
  </div>
</template>
<script>
import { getExsOrderList } from "@/api/business/expenseAccount";
import baseMixin from '@/mixins/print/baseMixin';
import { mapGetters } from "vuex";
import dayjs from "dayjs";
import { postDeleteReimburseData, postUpdatePayPushStatus } from "@/api/business/payInfoManagement";

export default {
  name: "PayInfoList",
  mixins: [baseMixin],
  props: {
    query: {
      type: Object,
      default: () => ({})
    },
    status: {
      type: Number || undefined
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
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.refresh(false);
    }
  },
  methods: {
    initData() {
      this.listLoading = true;
      let finishStartTime = "";
      let finishEndTime = "";
      if (this.query.finishTime) {
        finishStartTime = dayjs(this.query.finishTime[0]).format("YYYY-MM-DD") + ' 00:00:00';
        finishEndTime = dayjs(this.query.finishTime[1]).format("YYYY-MM-DD") + ' 23:59:59';
      }
      let _query = {
        ...this.listQuery,
        ...this.query,
        payPushStatus: this.status,
      };
      if (finishStartTime && finishEndTime) {
        _query['finishStartTime'] = finishStartTime;
        _query['finishEndTime'] = finishEndTime;
      }
      delete _query.finishTime;
      this.realQuery = _query;
      getExsOrderList(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    goToDetail(row) {
      this.$router.push({
        path: "/payInfoDetail",
        query: {
          id: row.id,
        }
      });
    },
    onCancelPush(row) {
      postDeleteReimburseData(row.id).then(() => {
        this.$message.success("已撤回推送");
        this.refresh(false);
      })
    },
    onRemarkFinished(row, status) {
      postUpdatePayPushStatus({ id: row.id, payPushStatus: status }).then(() => {
        this.$message.success(status === 0 ? "已取消标记" : '标记成功');
        this.refresh(false);
      })
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
