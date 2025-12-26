<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div class="top-container">
            <div class="top-name">{{ name }}详情</div>
            <div class="row-flex">
              <div class="row-flex">
                <div class="amount-container"><div>总预算金额</div><div class="amount">{{ formatAmount(stats.totalAmount) }}</div></div>
                <div class="amount-container"><div>未分配金额</div><div class="amount">{{ formatAmount(stats.notAssignedAmount) }}</div></div>
                <div class="amount-container"><div>总剩余金额</div><div class="amount">{{ formatAmount(stats.residueAmount) }}</div></div>
              </div>
              <!--              <el-form class="form">
                <el-form-item label="总预算大数据权限">
                  <el-select v-model="permission" clearable placeholder="请选择">
                    <el-option label="普通领导" :value="1" />
                    <el-option label="中层领导" :value="2" />
                    <el-option label="高层领导" :value="3" />
                  </el-select>
                </el-form-item>
              </el-form>-->
            </div>
            <div class="btn-container">
              <el-checkbox v-model="checked">万元展示</el-checkbox>
              <el-upload
                class="mg-r"
                style="margin-left: auto"
                :action="actionUrl"
                :headers="uploadHeaders"
                :data="requestData"
                :on-success="uploadSuccess"
                :on-error="uploadError"
                :show-file-list="false"
              >
                <el-button type="primary">导入预算单</el-button>
              </el-upload>
              <el-button type="primary" @click="exportData()">导出预算单</el-button>
              <el-button type="primary" @click="onAddSubject(null)">新增预算</el-button>
            </div>
          </div>
        </div>
        <vxe-table
          resizable
          style="margin: 0 10px"
          border
          size="small"
          ref="xTable"
          :row-config="{keyField: 'id'}"
          :tree-config="{transform: true, rowField: 'id', parentField: 'parentId', reserve: true}"
          :data="tableData"
          :loading="listLoading"
        >
          <vxe-column type="seq" title="序号" width="70" />
          <vxe-column field="name" title="预算名称" tree-node min-width="160" />
          <vxe-column field="budgetAmount" title="总计金额" min-width="100">
            <template #default="{row}">
              <span>{{ formatAmount(row.budgetAmount) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="notAssignedAmount" title="未分配金额" min-width="100">
            <template #default="{row}">
              <span>{{ formatAmount(row.notAssignedAmount) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="remainingAmount" title="当前剩余" min-width="100">
            <template #default="{row}">
              <span>{{ formatAmount(row.remainingAmount) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="remainingPercent" title="剩余百分比" width="100" />
          <vxe-column field="label" title="预算标签" min-width="160" show-overflow />
          <vxe-column field="organizationName" title="关联部门" min-width="200" show-overflow />
          <vxe-column field="viewUsersName" title="查阅预算用户" min-width="200" show-overflow />
          <vxe-column field="alertThreshold" title="预警阈值" width="80">
            <template #default="{row}">
              <span>{{ row.alertThreshold * 100 }}%</span>
            </template>
          </vxe-column>
          <vxe-column field="action" title="操作" width="280" fixed="right">
            <template #default="{row}">
              <el-button type="text" @click="onEditSubject(row)">编辑</el-button>
              <el-button type="text" @click="onDelete(row)">删除</el-button>
              <el-button type="text" @click="onAddSubject(row.id)">增加下级</el-button>
              <el-button type="text" @click="onAddSubject(row.parentId)">增加同级</el-button>
              <el-button type="text" @click="onDetail(row)">预算明细</el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <add-budget-item
      :visible.sync="addSubject.visible"
      :data="addSubject.data"
      :budget-id="id"
      :loading="addSubject.loading"
      @confirm="onAddSubjectConfirm"
    />
    <budget-list :budget-id="budgetList.budgetId" :visible.sync="budgetList.visible" />
  </div>
</template>
<script>
import AddBudgetItem from "@/views/budgetManagement/components/addBudgetItem.vue";
import BudgetList from "@/views/budgetManagement/components/budgetList.vue";
import { deleteBudgetDetail, getBudgetDetailList, getBudgetMonthStats, budgetExport } from "@/api/business/budgetManagement";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

export default {
  components: { BudgetList, AddBudgetItem },
  data() {
    return {
      id: this.$route.query.id,
      name: this.$route.query.name,
      permission: '',
      listLoading: false,
      tableData: [],
      addSubject: {
        visible: false,
        data: {},
        loading: false,
      },
      checked: false,
      budgetList: {
        visible: false,
        budgetId: '',
      },
      stats: {
        totalAmount: 0,
        residueAmount: 0,
        notAssignedAmount: 0
      },
      actionUrl: process.env.VUE_APP_BASE_API + "/budgetDetail/imports",
      uploadHeaders: { Authorization: this.$store.getters.token },
    }
  },
  computed: {
    requestData() {
      return { budgetId: this.id };
    }
  },
  mounted() {
    this.loadList()
    this.loadStats()
  },
  methods: {
    onAddSubject(parentId) {
      this.addSubject.visible = true
      this.addSubject.data = { parentId: parentId }
    },
    onEditSubject(row) {
      this.addSubject.visible = true
      this.addSubject.data = { ...row }
    },
    onAddSubjectConfirm() {
      this.loadList()
      this.loadStats()
    },
    onDetail(row) {
      this.budgetList.visible = true
      this.budgetList.budgetId = row.id
    },
    async onDelete(row) {
      this.$confirm('确定要删除此预算？', '提示', {
        type: 'warning'
      }).then(async() => {
        // 判断是否末级科目
        let canDelete = true
        for (let i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].parentId === row.id) {
            canDelete = false
            break
          }
        }
        if (!canDelete) {
          this.$message.error("不能删除非末级预算！");
          return
        }
        this.listLoading = true;
        // 请求删除接口
        deleteBudgetDetail({ id: row.id }).then(() => {
          this.$message.success("删除成功");
          this.loadList();
          this.loadStats();
        })
          .finally(() => {
            this.listLoading = false;
          });
      })
    },
    formatAmount(val) {
      if (!this.checked) {
        return val
      }
      return val / 10000 + '万元'
    },
    loadList() {
      this.listLoading = true
      getBudgetDetailList({ budgetId: this.id }).then(res => {
        this.tableData = res.data.map(v => {
          return {
            ...v,
            id: v.idDesc,
            parentId: v.parentIdDesc,
          }
        })
      }).finally(() => {
        this.listLoading = false
      });
    },
    loadStats() {
      getBudgetMonthStats({ id: this.id }).then(res => {
        if (res.data) {
          this.stats.totalAmount = res.data.totalAmount;
          this.stats.residueAmount = res.data.residueAmount;
          this.stats.notAssignedAmount = res.data.notAssignedAmount;
        }
      });
    },
    // 导入文件成功后回调
    uploadSuccess(response, file, fileList) {
      if (response.code === 400) {
        this.$message({
          type: "error",
          message: response.msg,
          duration: 5000,
          showClose: true,
        });
      } else {
        this.$message({
          type: "success",
          message: "导入成功",
          duration: 1500,
          onClose: () => {
            this.loadList();
            this.loadStats();
          }
        });
      }
    },

    // 导入文件失败后回调
    uploadError(err) {
      this.$message({
        type: "error",
        message: err,
      });
    },
    exportData() {
      budgetExport({ budgetId: this.id }).then(res => {
        saveAs(res, dayjs().format("YYYYMMDDHHmmssSSS") + ".csv")
        this.$message.success("操作成功");
      });
    }
  }
}
</script>
<style scoped lang="scss">
.mg-r {
  margin-right: 10px;
}
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  /*justify-content: space-between;*/
  align-items: center;
}

::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
.top-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  .top-name {
    font-size: 24px;
    font-weight: 500;
  }
  .row-flex {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .amount-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px 60px;
      .amount {
        margin-top: 10px;
      }
    }
    .form {
      width: 350px;
    }
  }
}
</style>
