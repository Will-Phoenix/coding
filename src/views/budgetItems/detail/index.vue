<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <el-card>
          <div slot="header" style="font-weight: bold">
            <span>项目名称：{{ this.budgetName }}</span>
          </div>
          <div class="JNPF-common-head">
            <div style="font-weight: bold">
              <span>部门经济分类</span>
            </div>
            <div class="JNPF-common-head-right">
              <el-button type="primary" icon="el-icon-plus" @click="addHandle(2)">新增部门经济分类</el-button>
            </div>
          </div>
          <JNPF-table
            v-loading="listLoading"
            :data="list"
          >
            <el-table-column
              label="部门经济分类名称"
              prop="classificName"
              algin="left"
            />
            <el-table-column
              label="分类编码"
              prop="classificCode"
              algin="left"
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
                  @click="enableOrDisable(scope.row.id)"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </JNPF-table>
          <div class="JNPF-common-head">
            <div style="font-weight: bold">
              <span>政府经济分类</span>
            </div>
            <div class="JNPF-common-head-right">
              <el-button type="primary" icon="el-icon-plus" @click="addHandle(1)">新增政府经济分类</el-button>
            </div>
          </div>
          <JNPF-table
            v-loading="listLoading"
            :data="detailList"
          >
            <el-table-column
              label="政府经济分类名称"
              prop="classificName"
              algin="left"
            />
            <el-table-column
              label="分类编码"
              prop="classificCode"
              algin="left"
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
                  @click="enableOrDisable(scope.row.id)"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </JNPF-table>
        </el-card>
      </div>
    </div>
    <JNPF-Form ref="JNPFForm" @refresh="initData" />
  </div>
</template>

<script>
import { getSubjectClassificationList, subjectClassificationDel } from "@/api/business/budgetItems";

import JNPFForm from './edit.vue'
export default {
  components: { JNPFForm },
  data() {
    return {
      list: [],
      detailList: [],
      listLoading: true,
      total: 0,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
      },
      budgetInfo: { }, // 项目管理详情数据
      classficationNum: { }, // 经济分类项
      budgetName: { }, // 项目名称
    }
  },
  created() {
    this.budgetId = this.$route.query.id;
    this.budgetName = this.$route.query.budgetName;
    this.classficationNum = this.$route.query.classficationNum;
    this.initData();
  },
  methods: {
    async initData() {
      this.listLoading = true;
      getSubjectClassificationList({ budgetId: this.budgetId, budgetType: 2 }).then(res => {
        this.list = res.data;
        this.listLoading = false;
      });
      getSubjectClassificationList({ budgetId: this.budgetId, budgetType: 1 }).then(res => {
        this.detailList = res.data;
        this.listLoading = false;
      });
    },
    enableOrDisable(id) {
      this.$confirm('该操作将永久删除数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        subjectClassificationDel({ budgetId: id }).then(() => {
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
    addHandle(data) {
      const param = {
        type: data,
        budgetId: this.budgetId
      }
      this.$nextTick(() => {
        this.$refs.JNPFForm.init(null, param);
      });
    },
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-card__body {
  padding: 0 0 0 16px;
}
::v-deep .el-table__body-wrapper {
  height:auto!important;
}
::v-deep .el-card {
overflow: auto;
}

</style>
