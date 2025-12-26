<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div>
            <el-button type="primary" icon="el-icon-plus" @click="addHandle()">新增账套
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
            label="账套名称"
            prop="name"
            algin="left"
          />
          <el-table-column
            label="账套ID"
            prop="tppSobId"
            algin="left"
          />
          <el-table-column
            label="账套税号"
            prop="taxNum"
            algin="center"
          />
          <el-table-column
            label="关联报销流程数"
            prop="flowNum"
            algin="center"
          />
          <el-table-column
            label="是否自动拉取税局发票"
            prop="pullStatus"
            algin="center"
            width="160"
          >
            <template slot-scope="scope">
              <div>{{ scope.row.pullStatus === 0 ? '否' : '是' }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            prop="status"
            algin="center"
            width="120"
          >
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status === 1">已启用</el-tag>
              <el-tag type="danger" v-else>已禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="展示排序"
            prop="sortNum"
            algin="center"
          />
          <el-table-column
            label="最后修改时间"
            prop="updateTime"
            algin="center"
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
                @click="enableOrDisable1(scope.row)"
              >{{ scope.row.status === 1 ? "禁用" : "启用" }}
              </el-button>
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
import JNPFForm from './edit.vue'
import { ccdEntSobEnableOrDisable, ccdEntSobDel, getCcdEntSobList } from "@/api/business/enterpriseAccountSetManagement";
export default {
  name: 'EnterpriseAccountSetManagementIndex',
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
      this.initData()
    }
  },
  methods: {
    async initData() {
      this.listLoading = true;
      getCcdEntSobList().then(res => {
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
        ccdEntSobDel(id).then(() => {
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
    enableOrDisable1(row) {
      this.$confirm('该操作会影响流程, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        const newRow = { ...row };
        newRow.status = row.status === 1 ? 0 : 1;
        ccdEntSobEnableOrDisable(newRow).then(() => {
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
