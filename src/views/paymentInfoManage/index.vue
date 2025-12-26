<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="buttonHead">
          <el-button size="small" type="primary" @click="exportData" style="margin-right: 10px">添加到录入机器人</el-button>
          <el-button size="small" type="primary" @click="goToEdit()">新增录入信息</el-button>
        </div>
        <div class="tab">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="`待付款（${statistics.unpaidTotal}）`" name="0" />
            <el-tab-pane :label="`标记为已付款（${statistics.paidTotal}）`" name="1" />
            <el-tab-pane :label="`已删除付款（${statistics.deletedTotal}）`" name="2" />
          </el-tabs>
        </div>
        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :has-c="true"
          :list-query="listQuery"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            prop="amount"
            label="待付款金额"
            align="left"
          />
          <el-table-column
            prop="useFor"
            label="报销用途及原因"
            align="left"
          />
          <el-table-column
            label="报销类型"
            prop="payType"
            algin="left"
          >
            <template slot-scope="{ row }">
              <span>{{ row.payType === 1 ? "公务卡" : row.payType === 2 ? "银行支付" : "" }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="信息录入状态"
            prop="status"
            algin="left"
          >
            <template slot-scope="{ row }">
              <el-tag type="success" v-if="row.status === 1">已录入</el-tag>
              <el-tag type="danger" v-if="row.status === 0">待录入</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="所属报销单"
            prop="orderName"
            algin="left"
          />
          <el-table-column
            label="报销单类型"
            prop="orderTypeName"
            algin="left"
          />
          <el-table-column
            label="申请时间"
            prop="applyTime"
            algin="left"
          />
          <el-table-column
            label="操作"
            width="200"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="goToEdit(scope.row)"
              >编辑
              </el-button>
              <el-button
                type="text"
                v-if="scope.row.payStatus === 0"
                @click="flagStatus(scope.row)"
              >标记为已付款
              </el-button>
              <el-button
                type="text"
                @click="onDelete(scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
      <editPayment :visible.sync="payment.visible" :data="payment.data" @confirm="initData" />
    </div>
  </div>
</template>

<script>
import { getPayInfoList, exportPayInfo, getStatistic, updatePageStatus, removePayInfo } from "@/api/business/paymentInfo";
import dayjs from "dayjs";
import editPayment from "./components/editPayment";
import { saveAs } from "file-saver"

export default {
  name: 'PaymentInfoManage',
  components: { editPayment },
  data() {
    return {
      list: [],
      listLoading: false, // 列表loading
      total: 0,
      statistics: {
        unpaidTotal: 0,
        paidTotal: 0,
        deletedTotal: 0,
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      payment: {
        visible: false,
        data: {},
      },
      activeName: 0,
      multipleSelection: [],
    }
  },
  created() {
    this.initData();
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
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
      this.getStatistics();
      let _query = {
        ...this.listQuery,
        payStatus: this.activeName,
      };
      getPayInfoList(_query).then(res => {
        const records = res.data.records;
        // 添加按钮loading给每行数据
        records.forEach(v => {
          if (v.status === 0) {
            v.top = true; // 设置top后，该条无法被选中
          }
        });
        this.list = records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    getStatistics() {
      getStatistic().then(res => {
        this.statistics.unpaidTotal = res.data["0"];
        this.statistics.paidTotal = res.data["1"];
        this.statistics.deletedTotal = res.data["2"];
      });
    },
    goToEdit(row = {}) {
      Object.assign(this.payment, { visible: true, data: row });
    },
    exportData() {
      if (this.multipleSelection.length > 0) {
        exportPayInfo(this.multipleSelection.map(v => v.id)).then(res => {
          console.log('导出---res', res)
          saveAs(res, dayjs().format("YYYYMMDDHHmmssSSS") + ".csv")
          this.$message.success("操作成功");
        });
      } else {
        this.$message.warning("请至少选择一个");
      }
    },
    onDelete(row) {
      this.$confirm('确定要删除?', '提示', {
        type: 'warning'
      }).then(() => {
        removePayInfo(row.id).then(() => {
          this.$message.success("删除成功");
          this.initData();
        });
      });
    },
    handleClick() {
      this.$nextTick(() => {
        this.initData();
      });
    },
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    flagStatus(row) {
      updatePageStatus(row.id).then(() => {
        this.$message.success("操作成功");
        this.initData();
      });
    },
  }
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
.buttonHead {
  display: flex;
  align-items: center;
  padding: 14px 10px;
  flex-shrink: 0;
}
.tab {
  padding: 14px 10px;
}
</style>
