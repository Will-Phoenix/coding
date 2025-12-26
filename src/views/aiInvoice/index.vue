<template>
  <div class="page-ai-invoice-index">
    <div v-if="aiMap && Object.keys(aiMap).length > 0" class="sum-container">
      <img class="sum-img" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/803fb0fc-f4e8-4f99-bd0e-35cf0048505a.png" alt="" />
      <div class="sum-text">当前{{ Object.keys(aiMap).length }}张发票可便捷报销</div>
    </div>
    <div class="custom-vxe-table-container custom-vxe-table-container-2">
      <vxe-table
        resizable
        stripe
        border
        size="small"
        ref="xTable"
        :data="list"
        :loading="listLoading"
        class="custom-vxe-table"
        max-height="100%"
      >
        <vxe-column type="seq" title="序号" width="68" />
        <vxe-column field="typeLable" title="发票类型" min-width="80" />
        <vxe-column field="code" title="发票号码" min-width="160" />
        <vxe-column field="groupId" title="是否为发票组" min-width="100">
          <template #default="{row}">
            <span>{{ row.groupId ? "是" : "否" }}</span>
          </template>
        </vxe-column>
        <vxe-column field="name" title="开票方" min-width="220" />
        <vxe-column field="amount" title="发票金额" min-width="100" />
        <vxe-column field="checkStatus" title="查验状态" min-width="100">
          <template #default="{row}">
            <span v-if="row.checkStatus == '1' || row.checkStatus == '2'" class="center-custom-status center-custom-status-success">{{ checkStatusMap(row) }}</span>
            <span v-else-if="row.checkStatus == '-1'" class="center-custom-status center-custom-status-red">{{ checkStatusMap(row) }}</span>
            <span v-else class="center-custom-status center-custom-status-orange">{{ checkStatusMap(row) }}</span>
          </template>
        </vxe-column>
        <vxe-column field="date" title="开票日期" min-width="100">
          <template #default="{row}">
            <span>{{ formatDate(row.date) }}</span>
          </template>
        </vxe-column>
        <vxe-column field="aiOrderName" title="推荐发票类型" min-width="120" />
        <vxe-column field="action" title="操作" width="180" fixed="right">
          <template #default="{row}">
            <div class="custom-operate-btn-container">
              <div
                class="btn-link"
                @click="goToDetail(row)"
              >详情
              </div>
              <div class="btn-divider" />
              <div
                class="btn-link"
                @click="goAIInvoice(row)"
              >便捷报销
              </div>
              <div class="btn-divider" />
              <div
                class="btn-link"
                @click="goIgnore(row)"
              >忽略
              </div>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <personal-invoice-detail-dialog :visible.sync="detail.visible" :editable="false" :data="detail.data" />
  </div>
</template>

<script>
import {
  getMapFastApply, postCountByFastApply, postListByBillIds
} from "@/api/business/pasteTicket";
import dayjs from "dayjs";
import PersonalInvoiceDetailDialog from "@/views/pasteTicketCenter/component/personalInvoiceDetail.vue";

export default {
  name: "AIInvoice",
  components: { PersonalInvoiceDetailDialog },
  data() {
    return {
      list: [],
      listLoading: false, // 列表loading
      total: 0,
      listQuery: {
        current: 1,
        size: 20,
      },
      detail: {
        visible: false,
        data: {},
      },
      aiMap: {},
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
    formatDate(date) {
      return dayjs(date).format("YYYY-MM-DD");
    },
    async initData() {
      const res = await getMapFastApply();
      this.aiMap = res.data;
      if (!this.aiMap || Object.keys(this.aiMap).length === 0) {
        return;
      }
      this.listLoading = true;
      const params = {
        billAndOrderIds: this.aiMap
      }
      postListByBillIds(params).then(res => {
        this.list = res.data;
        this.listLoading = false;
      });
    },
    goToDetail(row) {
      Object.assign(this.detail, { visible: true, data: row });
    },
    goAIInvoice(row) {
      this.$router.push({ path: '/approval', query: { orderId: this.aiMap[row.id], billId: row.id, isAgain: 'true' }});
    },
    goIgnore(row) {
      this.$confirm('确定要忽略该发票?', '提示', {
        type: 'warning'
      }).then(() => {
        postCountByFastApply({ code: row.code }).then(() => {
          this.$message.success("忽略成功");
          this.initData();
        });
      });
    },
  }
}
</script>
<style lang="scss" scoped>
.page-ai-invoice-index {
  background-color: #ffffff;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  .sum-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: #E5F7F9;
    border-radius: 4px;
    opacity: 0.9;
    padding: 8px 8px;
    .sum-img {
      width: 72px;
      height: 16px;
    }
    .sum-text {
      font-weight: 400;
      font-size: 13px;
      color: #00B4C4;
      line-height: 17px;
      margin-left: 4px;
      margin-top: 4px;
    }
  }
  .custom-vxe-table-container-2 {
    margin-top: 12px;
    height: calc(100% - 60px);
  }
}
</style>
