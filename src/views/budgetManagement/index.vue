<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div>
            <el-button type="primary" icon="el-icon-plus" @click="addHandle()">新增预算
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
            label="预算名称"
            prop="name"
            algin="left"
          />
          <el-table-column
            label="所属预算财年"
            prop="year"
            algin="left"
          />
          <el-table-column
            label="预算类型"
            prop="budgetType"
            algin="center"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.budgetType * 1 === 1">普通预算</div>
              <div v-else>月度预算</div>
            </template>
          </el-table-column>
          <el-table-column
            label="开始执行日期"
            prop="startDate"
            algin="center"
          />
          <el-table-column
            label="结束执行日期"
            prop="endDate"
            algin="center"
          />
          <el-table-column
            label="创建时间"
            prop="createTime"
            algin="center"
          />
          <el-table-column
            label="状态"
            prop="newStatus"
            algin="center"
          >
            <template slot-scope="scope">
              <div v-if="scope.row.newStatus * 1 === 2">已结束</div>
              <div v-else-if="scope.row.newStatus * 1 === 1" class="status-green">已启用</div>
              <div v-else class="status-red">未启用</div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="enableOrDisable(scope.row)"
              >{{ scope.row.newStatus * 1 === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button
                type="text"
                @click="goDetail(scope.row.id, scope.row)"
              >详情
              </el-button>
              <el-button
                v-if="scope.row.newStatus * 1 === 0"
                type="text"
                @click="onDelete(scope.row.id)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <JNPF-Form ref="JNPFForm" @refresh="initData" />
  </div>
</template>

<script>
import JNPFForm from './edit.vue'
import { deleteBudget, getBudgetManagementList, updateBudgetStatus } from "@/api/business/budgetManagement";
export default {
  name: 'BudgetManagementIndex',
  components: { JNPFForm },
  data() {
    return {
      list: [],
      listLoading: true,
      total: 0,
      listQuery: {
        current: 1,
        size: 20,
      },
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
      this.initData()
    }
  },
  methods: {
    async initData() {
      this.listLoading = true;
      getBudgetManagementList({ ...this.listQuery }).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    onDelete(id) {
      this.$confirm('该操作将永久删除数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteBudget({ id: id }).then(() => {
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
    enableOrDisable(row) {
      updateBudgetStatus({ id: row.id, status: row.newStatus * 1 === 1 ? 0 : 1 }).then(() => {
        this.$message({
          type: 'success',
          message: "操作成功",
          onClose: () => {
            this.initData()
          }
        });
      })
    },
    goDetail(id, row) {
      if (row.budgetType * 1 === 1) {
        this.$router.push({
          path: "/budgetDetail",
          query: {
            id: row.id,
            name: row.name,
          }
        });
      } else {
        this.$router.push({
          path: "/budgetMonthDetail",
          query: {
            id: row.id,
            name: row.name,
          }
        });
      }
    },
    addHandle() {
      this.$nextTick(() => {
        this.$refs.JNPFForm.init();
      });
    },
  }
}
</script>
<style lang="scss" scoped>
.status-red {
  color: red;
}
.status-green {
  color: green;
}
</style>
