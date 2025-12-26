<template>
  <div
    class="order-list-contain JNPF-preview-main"
    source="src/views/appDashbordHome/components/OrderList.vue"
  >
    <div class="JNPF-common-page-header">
      <el-page-header @back="goBack">
        <template slot="content">
          <div class="JNPF-page-header-content">订单中心</div>
        </template>
      </el-page-header>
    </div>
    <div class="JNPF-common-layout-center">
      <div style="padding: 0 16px;position: relative;">
        <JNPF-table
          v-loading="listLoading"
          :data="list"
          style="height:calc(100vh - 360px)"
        >
          <el-table-column prop="typeStr" label="服务类型" width="100" />
          <el-table-column prop="name" label="服务名称" min-width="100" />
          <el-table-column prop="price" label="订单金额" width="100" />
          <el-table-column prop="orderNo" label="订单号" width="150" />
          <el-table-column prop="createTime" label="创建时间" width="200" />
          <el-table-column prop="status" label="订单状态" width="100">
            <template slot-scope="scope">
              <span v-if="scope.row.status==1">待签订合同</span>
              <span v-else-if="scope.row.status==2">公对公转账</span>
              <span v-else-if="scope.row.status==3">待开票</span>
              <span v-else-if="scope.row.status==4" style="color: green">订单完成</span>
              <span v-else-if="scope.row.status==5" style="color: red">订单取消</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="orderNo = scope.row.orderNo" type="text" size="small">订单详情</el-button>
            </template>
          </el-table-column>
        </JNPF-table>
      </div>
    </div>
    <OrderDialog v-if="orderNo" @update:orderNo="onOrderNoUpdate" :order-no="orderNo" />
  </div>
</template>
<script>
import OrderDialog from '@/components/OrderDialog/index.vue'
import { pageEntOrder } from '@/api/business/service'

export default {
  components: {
    OrderDialog
  },
  data() {
    return {
      query: {
        size: 50,
        current: 1
      },
      orderNo: '',
      list: [],
      listLoading: false
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    getOrderList() {
      this.listLoading = true;
      pageEntOrder({ ...this.query }).then(res => {
        this.list = res.data.records;
        this.listLoading = false;
      });
    },
    onOrderNoUpdate() {
      this.orderNo = '';
      this.getOrderList();
    },
    goBack(isRefresh) {
      this.$emit("close", isRefresh);
    },
  },

};
</script>
<style>
.order-list-contain .el-tabs__nav-wrap::after {
  display: none;
}
.order-list-contain .JNPF-common-layout-center {
  height: auto;
}
</style>
<style lang="scss" scoped>

</style>
