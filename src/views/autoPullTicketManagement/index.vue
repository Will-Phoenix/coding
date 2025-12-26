<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div class="btn-container">
            <el-button type="primary" @click="onAdd">新增自动拉取票据账套</el-button>
          </div>
        </div>
        <JNPF-table
          style="margin: 0 20px"
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            prop="entName"
            label="单位名称"
            align="center"
          />
          <el-table-column
            label="所属账套"
            prop="name"
            algin="center"
          />
          <el-table-column
            label="所属地区"
            prop="nuoqiAreaCode"
            algin="center"
          ><template slot-scope="scope">{{ scope.row.nuoqiTaxAreaCode + scope.row.nuoqiAreaCode }}</template></el-table-column>
          <el-table-column
            label="手机号"
            prop="nuoqiContactPhone"
            algin="center"
          />
          <el-table-column
            label="虚拟号"
            prop="nuoqiVirtualPhone"
            algin="center"
          />
          <el-table-column
            label="状态"
            algin="center"
          >
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.nuoqiStatus === 1">已启用</el-tag>
              <el-tag type="danger" v-if="scope.row.nuoqiStatus === 0">已停用</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
          >
            <template slot-scope="scope">
              <!--              <el-button
                type="text"
                @click="onEdit(scope.row)"
              >编辑
              </el-button>-->
              <el-button
                type="text"
                @click="onUpdateStatus(scope.row)"
              >{{ scope.row.nuoqiStatus === 0 ? '启用' : '停用' }}
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <AddAccount
      :visible.sync="addType.visible"
      :loading="addType.loading"
      :data="addType.data"
      @confirm="initData"
    />
  </div>
</template>

<script>
import baseMixin from '@/mixins/print/baseMixin';
import AddAccount from "@/views/autoPullTicketManagement/components/addAccount.vue";
import { getRegisterNuoqiPage, postUpdateNuoqiStatus } from "@/api/business/autoPullTicketManagement";

export default {
  name: 'NoticeManagement',
  components: { AddAccount },
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
      getRegisterNuoqiPage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    onUpdateStatus(row) {
      postUpdateNuoqiStatus({ id: row.id, nuoqiStatus: row.nuoqiStatus === 0 ? 1 : 0 }).then(() => {
        this.$message.success("操作成功");
        this.initData();
      });
    },
  },
}
</script>
<style lang="scss" scoped>
.head-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

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
