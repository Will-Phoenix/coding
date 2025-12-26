<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="mailbox-flex">
          <div class="company-mail">
            <span class="bold">企业邮箱配置</span>
            <span v-if="!mailboxInfo || !mailboxInfo.id" class="color-red ml-20">未配置</span>
            <span v-if="mailboxInfo && mailboxInfo.id" class="color-green ml-20">已配置</span>
            <span v-if="mailboxInfo && mailboxInfo.id" class="ml-20">{{ mailboxInfo.email }}</span>
          </div>
          <div class="btn-container">
            <el-button v-if="mailboxInfo && mailboxInfo.id" type="primary" @click="onVerifyMailbox">邮箱验证</el-button>
            <el-button class="ml-20" type="primary" @click="onSetMailbox">配置企业邮箱</el-button>
          </div>
        </div>
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="12">
                <el-col :span="10">
                  <el-form-item label="金额区间" prop="minAmount">
                    <el-input-number v-model="query.minAmount" :min="1" :max="999999999" placeholder="请输入最低金额" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="2">
                  <div style="text-align: center; padding-top: 6px">至</div>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="maxAmount" label-width="maxAmount">
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
              <el-col :span="8" class="align">
                <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>

        <JNPF-table
          v-loading="listLoading"
          :data="list"
        >
          <el-table-column
            prop="typeLable"
            label="发票类型"
            width="100"
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
            label="备注信息"
            prop="remark"
            algin="left"
          />
          <el-table-column
            label="当前关联人"
            prop="currentAffiliates"
            algin="left"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="associatedHolder(scope.row)"
              >修改关联人
              </el-button>
              <el-button
                type="text"
                @click="goToDetail(scope.row)"
              >详情
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <setMailbox
      :visible.sync="setMailbox.visible"
      :data="setMailbox.data"
      :loading="setMailbox.loading"
      @confirm="onSetMailboxConfirm"
    />
    <holderRefDialog :visible.sync="dialog.visible" :loading="dialog.loading" :data="dialog.data" @confirm="initData" />
    <invoiceDetailDialog :visible.sync="detail.visible" :data="detail.data" />
  </div>
</template>

<script>
import { getInvoiceTypeList } from "@/api/business/pasteTicket";
import dayjs from "dayjs";
import holderRefDialog from "@/views/pasteTicketCenter/component/associatedHolderDialog.vue";
import { getMailboxInfo, getMailboxTicketPoolList, verifyMail } from "@/api/business/mailboxTicketPool";
import invoiceDetailDialog from "@/views/pasteTicketCenter/component/invoiceDetail.vue";
import setMailbox from "@/views/mailboxTicketPool/components/setMailbox.vue";

export default {
  name: 'MailboxTicketPoolIndex',
  components: { setMailbox, invoiceDetailDialog, holderRefDialog },
  data() {
    return {
      list: [],
      listLoading: true,
      total: 0,
      query: {
        startDate: undefined,
        endDate: undefined,
        invoiceType: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        applyMonth: undefined,
      },
      invoiceTypeOptions: [], // 发票类型
      listQuery: {
        current: 1,
        size: 20,
      },
      mailboxInfo: {},
      orderTypeOption: [],
      dialog: {
        visible: false,
        loading: false,
        data: {},
      },
      detail: {
        visible: false,
        data: {},
      },
      setMailbox: {
        visible: false,
        data: {},
      }
    }
  },
  created() {
    // 加载发票类型
    getInvoiceTypeList().then(res => {
      this.invoiceTypeOptions = res.data;
    });
    this.initData();
    this.loadMailInfo();
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
    associatedHolder(row = {}) {
      Object.assign(this.dialog, { visible: true, loading: false, data: row });
    },
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      this.listQuery.current = 1;
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
    onSetMailbox() {
      this.setMailbox.visible = true
      this.setMailbox.data = { ...this.mailboxInfo }
    },
    onVerifyMailbox() {
      verifyMail().then((res) => {
        if (res.data) {
          this.$message.success("邮箱验证成功");
        } else {
          this.$message.error('邮箱验证不通过')
        }
      })
    },
    onSetMailboxConfirm() {
      this.loadMailInfo()
    },
    initData() {
      this.listLoading = true;
      let startDate = "";
      let endDate = "";
      if (this.query.applyMonth && this.query.applyMonth.length > 1) {
        startDate = dayjs(this.query.applyMonth[0]).format("YYYY-MM-DD");
        endDate = dayjs(this.query.applyMonth[1]).format("YYYY-MM-DD");
      }
      let _query = {
        ...this.query,
        ...this.listQuery,
        startDate,
        endDate
      };
      getMailboxTicketPoolList(_query).then(res => {
        const records = res.data.ccdEntBillPageChildPage.records;
        this.list = records;
        this.total = res.data.totalSize;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    goToDetail(row) {
      Object.assign(this.detail, { visible: true, data: row });
    },
    loadMailInfo() {
      getMailboxInfo().then(res => {
        this.mailboxInfo = res.data
      })
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
.mailbox-flex {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dcdfe6;
  .company-mail {
    .bold {
      font-weight: 500;
    }
    .color-red {
      color: red;
    }
    .color-green {
      color: green;
    }
  }
}
.ml-20 {
  margin-left: 20px;
}
.btn-container {
  display: flex;
  flex-direction: row;
}
</style>
