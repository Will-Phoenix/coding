<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div class="btn-container">
            <el-button type="primary" @click="onAdd">新增发票抬头</el-button>
          </div>
        </div>
        <JNPF-table
          style="margin: 0 20px"
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            prop="name"
            label="单位/企业名称"
          />
          <el-table-column
            label="税号"
            prop="tin"
            width="160"
          />
          <el-table-column
            label="单位地址"
            prop="address"
          />
          <el-table-column
            label="电话号码"
            prop="phone"
            width="120"
          />
          <el-table-column
            label="开户银行"
            prop="bankName"
          />
          <el-table-column
            label="银行账户"
            prop="bankAccount"
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
                @click="onEdit(scope.row)"
              >编辑
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
    </div>
    <AddInvoiceTitle
      :visible.sync="addType.visible"
      :loading="addType.loading"
      :data="addType.data"
      @confirm="initData"
    />
  </div>
</template>

<script>
import baseMixin from '@/mixins/print/baseMixin';
import AddInvoiceTitle from "@/views/invoiceTitleManagement/components/addInvoiceTitle.vue";
import { getCcdInvoiceTitlePage, postCcdInvoiceTitleDelete } from "@/api/business/invoiceTitle";

export default {
  name: 'InvoiceTitleManagement',
  components: { AddInvoiceTitle },
  mixins: [baseMixin],
  data() {
    return {
      list: [],
      listLoading: false,
      listQuery: {
        current: 1,
        size: 20,
      },
      addType: {
        visible: false,
        loading: false,
        data: {},
      },
      total: 0,
    }
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
    onAdd() {
      this.addType.visible = true;
      this.addType.data = {};
    },
    onEdit(row) {
      this.addType.visible = true;
      this.addType.data = { ...row };
    },
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
      };
      getCcdInvoiceTitlePage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    onDelete(row) {
      this.$confirm('确定要删除该发票抬头?', '提示', {
        type: 'warning'
      }).then(() => {
        postCcdInvoiceTitleDelete({ id: row.id }).then(() => {
          this.$message.success("删除成功");
          this.initData();
        })
      });
    },
  },
}
</script>
<style lang="scss" scoped>
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.icon-img {
  width: 24px;
  height: 24px;
}
</style>
