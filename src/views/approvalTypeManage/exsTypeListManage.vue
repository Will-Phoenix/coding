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
            label="报销流程名称"
          />
          <el-table-column
            label="关联审批流"
            prop="flowTemplateName"
          >
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="editWorkFlowEngine(scope.row)">{{ scope.row.flowTemplateName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="关联报销模板"
            prop="basePrintDevName"
          >
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="editPrintTemplateForm(scope.row)">{{ scope.row.basePrintDevName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="关联智能初审规则"
            prop="auditRuleNumber"
          />
          <el-table-column
            label="关联账套"
            prop="sobName"
          />
          <el-table-column
            label="展示排序"
            prop="sort"
          />
          <el-table-column
            label="状态"
          >
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status === 1">已启用</el-tag>
              <el-tag type="danger" v-if="scope.row.status === 0">已禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="最后修改时间"
            prop="updateTime"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="100"
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
              >详情
              </el-button>
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
import JNPFForm from "@/views/approvalTypeManage/components/addExsTypeItem.vue"
import PrintTemplateForm from "@/views/system/printDev/Form.vue";
import FlowEngineForm from "@/views/workFlow/flowEngine/Form.vue";

export default {
  components: { FlowEngineForm, PrintTemplateForm, JNPFForm },
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
    this.initData();
  },
  methods: {
    async initData() {
      this.listLoading = true;
      await FlowEnginePageList({ currentPage: 1, pageSize: -1 }).then(res => {
        this.flowList = res.data.list;
      });
      getCcdBizFlowModuleList({ type: 2, categoryId: this.typeId }).then(res => {
        res.data.forEach(v => {
          const index = this.flowList.findIndex(v2 => v2.id === v.flowTemplateId);
          if (index > -1) {
            v.flowTemplateName = this.flowList[index].fullName;
          }
          // 新增一个字段，用来显示关联规则的数量
          if (v.auditRuleIds) {
            v.auditRuleNumber = v.auditRuleIds.split(",").length;
          } else {
            v.auditRuleNumber = 0;
          }
        });
        this.list = res.data;
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
