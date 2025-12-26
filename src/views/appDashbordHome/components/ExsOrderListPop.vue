<template>
  <div
    class="approval-list-contain JNPF-preview-main"
    source="src/views/appDashbordHome/components/ApprovalListPop.vue"
  >
    <div class="JNPF-common-page-header">
      <el-page-header @back="goBack">
        <template slot="content">
          <div class="JNPF-page-header-content">报销列表</div>
        </template>
      </el-page-header>
    </div>
    <div class="JNPF-common-layout-center">
      <el-row class="JNPF-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item label="关键字">
              <el-input
                v-model="query.keyword"
                placeholder="请输入报销单名称"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item>
              <el-button class="custom-btn-search" type="primary" icon="el-icon-search" @click="search()">
                {{ $t("common.search") }}</el-button>
              <el-button
                class="custom-btn-reset"
                icon="el-icon-refresh-right"
                @click="refresh()"
              >{{ $t("common.reset") }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div style="padding: 0 16px;position: relative;">
        <el-tabs class="custom-jnpf-tabs" v-model="query.status" @tab-click="handleClick">
          <el-tab-pane
            v-for="item in statusList"
            :label="item.label"
            :key="item.value"
            :name="item.value"
          ></el-tab-pane>
        </el-tabs>
        <div>
          <JNPF-table
            v-loading="listLoading"
            :data="list"
            style="height:calc(100vh - 360px)"
          >
            <el-table-column
              prop="name"
              label="报销单名称"
              show-overflow-tooltip
              width="260"
            >
              <template slot-scope="scope">
                <div>{{ scope.row.name }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="审批状态" width="100">
              <template slot-scope="scope">
                <span :class="statusMap[scope.row.status].color">{{
                  statusMap[scope.row.status].label
                }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="flowName" label="报销单类型" width="200" />
            <el-table-column prop="viewInfo" label="重点内容" min-width="350">
              <template slot-scope="scope">
                <div v-if="scope.row.moduleJson && scope.row.viewInfo">
                  <div v-for="item in scope.row.viewInfo" :key="item.label">
                    <span>{{ item.label }}:</span>
                    <span style="margin-left: 8px">{{ item.value }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="exsCost" label="金额" width="130" />
            <el-table-column prop="invoiceNum" label="关联发票" width="130">
              <template slot-scope="scope">
                {{ scope.row.invoiceNum ? scope.row.invoiceNum+'张': '未关联发票' }}
              </template>
            </el-table-column>
            <el-table-column prop="applyTime" label="发起日期" width="160" />
            <!-- <el-table-column
              prop="finallyTime"
              label="审批通过日期"
              width="160"
            /> -->
            <el-table-column label="操作" width="300" fixed="right">
              <template slot-scope="scope">
                <!-- status = 0 草稿（staging=0）、暂存（staging=1） 草稿与暂存不可再次发起 -->
                <!-- 暂存只有编辑 -->
                <!-- 审核被退回和已撤回的可以重新编辑表单 -->
                <!-- 0等待提交, 1审批中, 2已撤回, 3审批完成, 4被驳回 -->
                <el-button class="custom-text-btn" @click="goPreview(scope.row, scope.$index)" size="mini" type="text">
                  预览报销单
                </el-button>
                <el-button class="custom-text-btn" @click="goDetails(scope.row)" size="mini" type="text">查看报销单详情</el-button>
                <template v-if="scope.row.status">
                  <el-button class="custom-text-btn" v-if="[1,3].includes(scope.row.status)" @click="goAgain(scope.row)" size="mini" type="text">再次发起</el-button>
                  <el-button class="custom-text-btn" v-if="[2,4].includes(scope.row.status)" @click="goEdit(scope.row)" size="mini" type="text">再次提交</el-button>
                  <el-button class="custom-text-btn" v-if="[2,4].includes(scope.row.status)" @click="goDelete(scope.row)" size="mini" type="text">删除</el-button>
                </template>
                <template v-else>
                  <el-button class="custom-text-btn" @click="goEditStaging(scope.row)" v-if="scope.row.staging===1" size="mini" type="text">编辑报销单</el-button>
                  <el-button class="custom-text-btn" @click="goDelete(scope.row)" v-else size="mini" type="text">删除</el-button>
                  <!-- 草稿0-0、撤回2、驳回4状态 -->
                </template>
              </template>
            </el-table-column>
          </JNPF-table>
          <pagination
            class="custom-jnpf-pagination"
            :total="total"
            :page.sync="query.currentPage"
            :limit.sync="query.pageSize"
            @pagination="loadData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
import { deleteExsOrder, getOrderList } from '@/api/business/expenseAccount'

const INIT_QUERY = {
  currentPage: 1,
  keyword: "",
  pageSize: 20,
  sort: "desc",
  status: "-1",
};

const getSpdStatus = () => [
  { value: "-1", label: "全部", color: "gray" },
  { value: "0", label: "草稿", color: "gray" },
  { value: "4", label: "被驳回", color: "red" },
  { value: "1", label: "审批中", color: "orange" },
  { value: "2", label: "已撤回", color: "gray" },
  { value: "3", label: "审批完成", color: "success" }
];

const getSpdStatusMap = () => {
  const ret = {};
  const list = getSpdStatus();
  list.forEach(v => {
    ret[v.value] = v;
  });
  return ret;
};

export default {
  name: "ExsOrderListPop",
  props: {
    orderStatus: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      statusMap: getSpdStatusMap(),
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      statusList: getSpdStatus(),
      listLoading: true,
      query: {
        ...INIT_QUERY,
        status: this.orderStatus
      },
      total: -1,
      list: []
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'token']),
  },
  created() {
    this.loadData();
  },
  methods: {
    goBack(isRefresh) {
      this.$emit("close", isRefresh);
    },
    loadData() {
      this.listLoading = true;
      const query = {
        ...this.query,
        status: this.query.status === '-1' ? '' : this.query.status
      };

      getOrderList({
        ...query,
      }).then(res => {
        this.list = res.data.list;
        this.total = res.data.pagination.total;
        this.listLoading = false;
      });
    },
    handleClick() {
      this.query.currentPage = 1;
      this.loadData();
    },
    search() {
      this.query.currentPage = 1;
      this.loadData();
    },
    refresh() {
      this.query = {
        categoryId: this.categoryId,
        ...INIT_QUERY
      };
      this.loadData();
    },
    async loadDetail(rec) {
      const res = await FlowBeforeInfo(rec.id, { flowId: rec.flowId });
      return res.data;
    },
    async goPreview(row, index) {
      this.$router.push({
        path: "/reimburseDetail",
        query: {
          id: row.id,
          queryData: JSON.stringify({}), // 当前列表的查询条件
          listQuery: JSON.stringify(this.query), // 当前数据在第几页，一页几个数据
          index: index, // 当前数据所在列的第几个，从0开始(下标)
        }
      });
    },
    goDelete(data) {
      this.$confirm('确定要删除此报销单？', '提示', {
        type: 'warning'
      }).then(async() => {
        this.listLoading = true;
        // 请求删除接口
        deleteExsOrder(data.id).then(() => {
          this.$message.success("删除成功");
          this.search();
        })
          .finally(() => {
            this.listLoading = false;
          });
      })
    },
    goDetails(data) {
      const { status, id, staging, flowId } = data;
      if (status == 0) {
        // 暂存状态
        if (staging == 1) {
          this.$router.push(`/approvalCenter/detail?orderId=${id}`)
          // this.$openDraw(`/h5-cicada/pages/cicada/flowForm/index?orderId=${id}`, {
          //   onClose: () => {
          //     console.log(2);
          //     // this.goBack(true)
          //   }
          // });
        } else {
          this.$router.push(`/approvalCenter/detail?orderId=${id}`)

          // this.$openDraw(`/h5-cicada/pages/cicada/expenseAccount/detail?id=${id}`, {
          //   onClose: () => {
          //     console.log(3);
          //     // this.goBack(true)
          //   }
          // });
        }
      } else {
        let opType = '';
        opType = '0';
        this.$router.push(`/approvalCenter/detail?id=${id}&flowId=${flowId}&opType=${opType}&taskId=${id}&isFrame=true`)

        // /h5-cicada/pages/cicada/approvalCenter/detail?id=606736054787038149&flowId=568715102941910021&opType=0&taskId=606736054787038149
        // this.$openDraw(`/h5-cicada/pages/cicada/approvalCenter/detail?id=${id}&flowId=${flowId}&opType=${opType}&taskId=${id}&isFrame=true`, {
        //   onClose: () => {
        //     console.log(4);
        //     // this.goBack(true)
        //   }
        // });
      }
    },
    goEditStaging(data) {
      this.$openDraw(`/h5-cicada/pages/cicada/flowForm/index?orderId=${data.id}`, {
        onClose: () => {
          console.log(5);
          // this.goBack(true)
        }
      });
    },
    goEdit(data) {
      // 审核被退回和已撤回的可以重新编辑表单
      console.log(data.status);
      this.$router.push(`/approval?orderId=${data.id}&isRevoked=true`);
      // this.$openDraw(`/h5-cicada/pages/cicada/flowForm/index?orderId=${data.id}&isRevoked=true`, {
      //   onClose: () => {
      //     console.log(6);
      //     // this.goBack(true)
      //   }
      // });
    },
    goAgain(data) {
      console.log(data.status);
      this.$router.push(`/approval?orderId=${data.id}&isAgain=true`);

      // this.$openDraw(`/h5-cicada/pages/cicada/flowForm/index?orderId=${data.id}&isAgain=true`, {
      //   onClose: () => {
      //     console.log(7);
      //     // this.goBack(true)
      //   }
      // });
    },
  }
};
</script>

<style>
.approval-list-contain .el-tabs__nav-wrap::after {
  display: none;
}
.approval-list-contain .JNPF-common-layout-center {
  height: auto;
}
</style>
<style lang="scss" scoped>
.approval-list-contain {
  .red,
  .orange,
  .gray,
  .success {
    color: #00b4c4;
    line-height: 44px;
    white-space: nowrap;
    word-break: keep-all;
  }
  .orange {
    color: #fa914b;
  }
  .gray {
    color: #919499;
  }
  .red {
    color: #f05248;
  }
  .new-add-btn{
    position: absolute;
    right: 16px;
    top: 15px;
    z-index: 100;
  }
}
</style>
