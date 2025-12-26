<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="12">
                <el-col :span="10">
                  <el-form-item label="金额区间" prop="minAmount">
                    <!--                    <el-input v-model="query.minAmount" placeholder="请输入最低金额" />-->
                    <el-input-number v-model="query.minAmount" :min="1" :max="999999999" placeholder="请输入最低金额" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="2">
                  <div style="text-align: center; padding-top: 6px">至</div>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="maxAmount" label-width="maxAmount">
                    <!--                    <el-input v-model="query.maxAmount" placeholder="请输入最高金额" />-->
                    <el-input-number v-model="query.maxAmount" :min="1" :max="999999999" placeholder="请输入最高金额" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-col>
              <el-col :span="8">
                <el-form-item label="开票日期" prop="applyMonth">
                  <el-date-picker
                    v-model="query.applyMonth"
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="发票类型" prop="invoiceType">
                  <el-select v-model="query.invoiceType" placeholder="请选择..." style="width: 100%">
                    <el-option
                      v-for="(value, key) in invoiceTypeOptions"
                      :key="key"
                      :label="value"
                      :value="key"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报销单类型" prop="orderType">
                  <el-select v-model="query.orderType" placeholder="请选择..." style="width: 100%">
                    <el-option
                      v-for="(value, key) in orderTypeOption"
                      :key="key"
                      :label="value"
                      :value="key"
                    />
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

        <JNPF-table
          v-loading="listLoading"
          :data="list"
        >
          <el-table-column
            prop="invoiceTypeName"
            label="发票类型"
            width="160"
            align="left"
          />
          <el-table-column
            prop="invoiceBillCode"
            label="发票代码"
            align="left"
          />
          <el-table-column
            prop="code"
            label="发票号码"
            align="left"
          />
          <el-table-column
            label="开票日期"
            prop="date"
            algin="left"
          >
            <template slot-scope="scope">
              <div>{{ formatDate(scope.row.date) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="销售方开户行号码"
            prop="sellerBank"
            algin="left"
          />
          <el-table-column
            label="销售方名称"
            prop="sellerName"
            algin="left"
          />
          <el-table-column
            label="校验码"
            prop="checkCode"
            algin="left"
            width="160"
          />
          <el-table-column
            label="金额"
            prop="amount"
            algin="left"
          />
          <el-table-column
            label="发票真伪"
            algin="left"
            :formatter="checkStatusMap"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="100"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="goToDetail(scope.row)"
              >详情
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <!--        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />-->
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderUsedBillList, getInvoiceTypeList, getOrderTypeList } from "@/api/business/pasteTicket";
import dayjs from "dayjs";

export default {
  name: 'ElectronicCertificatesManageIndex',
  data() {
    return {
      list: [],
      listLoading: true,
      total: 0,
      query: {
        startDate: undefined,
        endDate: undefined,
        invoiceType: undefined,
        orderType: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        applyMonth: undefined,
      },
      typeOptions: [], // 报销单类型选项
      invoiceTypeOptions: [], // 发票类型
      listQuery: {
        current: 1,
        size: 20,
      },
      formVisible: false,
      orderTypeOption: [],
    }
  },
  created() {
    // 加载报销单类型
    getOrderTypeList().then(res => {
      this.orderTypeOption = res.data;
    });
    // 加载发票类型
    getInvoiceTypeList().then(res => {
      this.invoiceTypeOptions = res.data;
    });

    this.initData();
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData()
    }
  },
  methods: {
    checkStatusMap(row) {
      const statusMap = {
        '-1': '核验不通过',
        '0': '未核验',
        '1': '核验通过',
        '2': '个人核验通过',
      };
      if (row.checkType == "0" && row.checkStatus == "1") {
        return "人工核验通过"
      }
      return statusMap[row.checkStatus] || row.checkStatus;
    },
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      // this.listQuery.current = 1;
      // 加载数据
      this.initData();
    },
    formatDate(date) {
      return dayjs(date).format("YYYY-MM-DD");
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.query.applyMonth = undefined;
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let startDate = "";
      let endDate = "";
      if (this.query.applyMonth) {
        startDate = dayjs(this.query.applyMonth[0]).format("YYYY-MM-DD");
        endDate = dayjs(this.query.applyMonth[1]).format("YYYY-MM-DD");
      }
      let _query = {
        ...this.query,
        startDate,
        endDate
      };
      getOrderUsedBillList(_query).then(res => {
        res.data.map((item) => {
          Object.keys(item).forEach(k => item[k] = item[k] || '-');
        })
        this.list = res.data;
        this.total = res.data.totalSize;
        this.listLoading = false;
      });
    },
    goToDetail(row) {
      this.$router.push({
        path: "/electronicCertificatesTemplateDetail",
        query: {
          data: JSON.stringify(row),
        }
      });
    }
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
</style>
