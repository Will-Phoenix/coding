<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div>
            <el-button type="primary" icon="el-icon-plus" @click="addHandle()">新增辅助核算
            </el-button>
          </div>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link
                icon="icon-ym icon-ym-Refresh JNPF-common-head-icon"
                :underline="false"
                @click="initData()"
              />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table
          v-loading="listLoading"
          :data="list"
        >
          <el-table-column
            label="辅助核算编码"
            prop="code"
            algin="left"
          />
          <el-table-column
            label="辅助核算名称"
            prop="name"
            algin="left"
          />
          <el-table-column
            label="数据对象来源"
            prop="sourceTypeName"
            algin="center"
          />
          <el-table-column
            label="配置内容"
            prop="content"
            algin="center"
          />
          <el-table-column
            label="创建时间"
            prop="createTime"
            algin="center"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="updateHandle(scope.row.id, scope.row)"
              >编辑
              </el-button>
              <el-button
                type="text"
                @click="enableOrDisable(scope.row.id)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <!--        <pagination :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="initData" />-->
      </div>
    </div>
    <JNPF-Form ref="JNPFForm" @refresh="initData" />
  </div>
</template>

<script>
import { getFinAssistAccountingList, finAssistAccountingDelete } from "@/api/business/auxiliaryAccountingConfiguration";
import JNPFForm from './edit.vue'
export default {
  components: { JNPFForm },
  data() {
    return {
      list: [],
      listLoading: true,
      total: 0,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
      },
    }
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      this.listLoading = true;
      getFinAssistAccountingList().then(res => {
        this.list = res.data;
        this.listLoading = false;
      });
    },
    enableOrDisable(id) {
      this.$confirm('该操作将永久删除数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        finAssistAccountingDelete({ id: id }).then(() => {
          this.$message({
            type: 'success',
            message: "操作成功",
            onClose: () => {
              this.initData()
            }
          });
        })
      }).catch(() => {
      });
    },
    updateHandle(id, row) {
      this.$nextTick(() => {
        this.$refs.JNPFForm.init(id, row);
      });
    },
    addHandle() {
      this.$nextTick(() => {
        this.$refs.JNPFForm.init();
      });
    },
  }
}
</script>
