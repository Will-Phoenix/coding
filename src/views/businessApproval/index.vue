<template>

  <div class="JNPF-common-layout">

    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div>
            <el-button type="primary" icon="el-icon-plus" @click="addHandle()">新增审批
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
            prop="name"
            label="业务审批名称"
            align="left"
          />
          <el-table-column
            label="关联审批流"
            prop="flowTemplateName"
            algin="left"
          />
          <el-table-column
            label="关联审批模板"
            prop="basePrintDevName"
            algin="left"
          />
          <el-table-column
            label="状态"
            algin="center"
          >
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status === 1">已启用</el-tag>
              <el-tag type="danger" v-if="scope.row.status === 0">已禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="最后修改时间"
            prop="updateTime"
            algin="left"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="enableOrDisable(scope.row)"
              >{{ scope.row.status === 1 ? "禁用" : "启用" }}
              </el-button>
              <el-button
                type="text"
                @click="updateHandle(scope.row)"
              >详情 </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <!--        <pagination :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="initData" />-->
      </div>
    </div>
    <JNPF-Form v-if="formVisible" ref="JNPFForm" @refresh="initData" />
  </div>
</template>

<script>
import { getCcdBizFlowModuleList, updateCcdBizFlowModule } from "@/api/business/businessApproval";
import { FlowEnginePageList } from "@/api/workFlow/FlowEngine";
import JNPFForm from './form'

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
      formVisible: false,
      flowList: [], // 工作流模版列表
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      this.listLoading = true;
      await FlowEnginePageList({ currentPage: 1, pageSize: -1 }).then(res => {
        this.flowList = res.data.list;
      });
      getCcdBizFlowModuleList({ type: 1 }).then(res => {
        res.data.forEach(v => {
          v.flowTemplateName = (this.flowList[this.flowList.findIndex(v2 => v2.id === v.flowTemplateId)] || {}).fullName;
        });
        this.list = res.data;
        this.listLoading = false;
      });
    },
    enableOrDisable(row) {
      this.$confirm('该操作会影响流程, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        const newRow = { ...row };
        newRow.status = row.status === 1 ? 0 : 1;
        updateCcdBizFlowModule(newRow).then(() => {
          this.$message({
            type: 'success',
            message: row.status === 1 ? "禁用成功" : "启用成功",
            duration: 1000,
            onClose: () => {
              this.initData()
            }
          });
        })
      }).catch(() => {
      });
    },
    // addOrUpdateHandle(id, row) {
    //   this.formVisible = true;
    //   this.$nextTick(() => {
    //     this.$refs.JNPFForm.init(id, row);
    //   })
    // }
    addHandle() {
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.JNPFForm.init();
      });
    },
    updateHandle(row) {
      this.$router.push({
        path: "/reimbursementTemplateDetail",
        query: {
          data: JSON.stringify(row),
        },
      })
    },
  }
}
</script>
