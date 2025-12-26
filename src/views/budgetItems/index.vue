<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div>
            <el-button type="primary" icon="el-icon-plus" @click="addHandle()">新增预算项目
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
            label="预算项目名称"
            prop="budgetName"
            algin="left"
          />
          <el-table-column
            label="预算项目代码"
            prop="budgetCode"
            algin="left"
          />
          <el-table-column
            label="关联政府经济分类数"
            prop="govClassficationNum"
            algin="center"
          />
          <el-table-column
            label="关联部门经济分类数"
            prop="depetClassficationNum"
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
                @click="detailHandle(scope.row)"
              >详情
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
import { getBudgetList, budgetDel } from "@/api/business/budgetItems";
import JNPFForm from './edit.vue'
export default {
  name: 'BudgetItemsIndex',
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
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
    }
  },
  methods: {
    async initData() {
      this.listLoading = true;
      getBudgetList().then(res => {
        res.data.forEach((item) => {
          item.govClassficationNum = item.govClassficationNum ? item.govClassficationNum : 0
          item.depetClassficationNum = item.depetClassficationNum ? item.depetClassficationNum : 0
        });
        this.list = res.data;
        this.listLoading = false;
      });
    },
    enableOrDisable(id) {
      this.$confirm('该操作将永久删除数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        budgetDel({ id: id }).then(() => {
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
    detailHandle(row) {
      this.$router.push({
        path: "/budgetItemsDetail",
        query: {
          id: row.id,
          budgetName: row.budgetName,
          classficationNum: row.classficationNum,
        },
      })
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
