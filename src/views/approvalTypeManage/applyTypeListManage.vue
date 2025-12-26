<template>

  <div class="JNPF-common-layout">

    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="name">{{ typeName }}管理</div>
        <div class="JNPF-common-head">
          <div class="btn-container">
            <el-button type="primary" icon="el-icon-plus" @click="addHandle()">新增审批
            </el-button>
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
          >
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="editWorkFlowEngine(scope.row)">{{ scope.row.flowTemplateName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="关联审批模板"
            prop="basePrintDevName"
            algin="left"
          >
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="editPrintTemplateForm(scope.row)">{{ scope.row.basePrintDevName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="展示排序"
            prop="sort"
            algin="center"
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
      </div>
    </div>
    <JNPF-Form ref="JNPFForm" @refresh="initData" />
    <FlowEngineForm ref="FlowEngineForm" @close="initData" />
    <PrintTemplateForm ref="PrintTemplateForm" @close="initData" />
  </div>
</template>

<script>
import { getCcdBizFlowModuleList, updateCcdBizFlowModule } from "@/api/business/businessApproval";
import { FlowEnginePageList } from "@/api/workFlow/FlowEngine";
import JNPFForm from "@/views/approvalTypeManage/components/addApplyTypeItem.vue"
import FlowEngineForm from "@/views/workFlow/flowEngine/Form.vue";
import PrintTemplateForm from "@/views/system/printDev/Form.vue";

export default {
  components: { PrintTemplateForm, FlowEngineForm, JNPFForm },
  data() {
    return {
      typeName: this.$route.query.name || '',
      typeId: this.$route.query.id || '',
      list: [],
      listLoading: true,
      total: 0,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
      },
      flowList: [], // 工作流模版列表
      formVisible: false,
      workFlowEngineVisible: false, // 流程编辑弹窗
      printTemplateVisible: false, // 打印模板编辑弹窗
      workFlowEngineCategoryList: [],
      printTemplateCategoryList: [],
    }
  },
  created() {
    this.getWorkFlowEngineDictionaryData();
    this.getPrintTemplateDictionaryData();
    this.initData()
  },
  methods: {
    async initData() {
      this.listLoading = true;
      await FlowEnginePageList({ currentPage: 1, pageSize: -1 }).then(res => {
        this.flowList = res.data.list;
      });
      getCcdBizFlowModuleList({ type: 1, categoryId: this.typeId }).then(res => {
        res.data.forEach(v => {
          let index = this.flowList.findIndex(v2 => v2.id === v.flowTemplateId);
          if (index > -1) {
            v.flowTemplateName = this.flowList[index].fullName;
          }
        });
        this.list = res.data;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    enableOrDisable(row) {
      this.$confirm('该操作会影响流程, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        const newRow = {};
        newRow.status = row.status === 1 ? 0 : 1;
        newRow.id = row.id;
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
    addHandle() {
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.JNPFForm.init(null, null, this.typeId);
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
    editPrintTemplateForm(row) {
      this.printTemplateVisible = true
      this.$nextTick(() => {
        this.$refs.PrintTemplateForm.init(this.printTemplateCategoryList, row.basePrintdevId)
      })
    },
    editWorkFlowEngine(row) {
      this.workFlowEngineVisible = true
      this.$nextTick(() => {
        this.$refs.FlowEngineForm.init(this.workFlowEngineCategoryList, row.flowTemplateId);
      })
    },
    getWorkFlowEngineDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        this.workFlowEngineCategoryList = res
      })
    },
    getPrintTemplateDictionaryData() {
      this.$store.dispatch('base/getDictionaryData', { sort: 'printDev' }).then((res) => {
        this.printTemplateCategoryList = res
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.name {
  font-size: 24px;
  font-weight: 500;
  margin: 20px 20px;
}
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
</style>
