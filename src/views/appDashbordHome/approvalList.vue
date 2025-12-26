<template>
  <div
    class="approval-list-contain JNPF-preview-main"
    source="src/views/appDashbordHome/approvalList.vue"
  >
    <div class="JNPF-common-layout-center">
      <el-row class="JNPF-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>

          <el-col :span="6">
            <el-form-item label="申请通过日期">
              <el-date-picker
                v-model="query.pickerVal1"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd"
                clearable
                :editable="false"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="审批发起日期">
              <el-date-picker
                v-model="query.pickerVal2"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="pickerOptions"
                value-format="yyyy-MM-dd"
                clearable
                :editable="false"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="search()">
                {{ $t("common.search") }}</el-button>
              <el-button
                icon="el-icon-refresh-right"
                @click="refresh()"
              >{{ $t("common.reset") }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div style="padding: 0 16px;position: relative;">
        <el-button class="new-add-btn" type="primary" @click="onAdd">
          发起审批申请</el-button>
        <el-tabs v-model="query.status" @tab-click="handleClick">
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
              label="审批单名称"
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
            <el-table-column prop="flowName" label="审批单类型" width="200" />
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
            <el-table-column prop="applyUserName" label="发起人" width="130" />
            <el-table-column prop="applyDate" label="发起日期" width="130" />
            <el-table-column
              prop="finallyTime"
              label="审批通过日期"
              width="130"
            />
            <el-table-column label="操作" width="300" fixed="right">
              <template slot-scope="scope">
                <el-button
                  @click="goPreview(scope.row)"
                  size="mini"
                  type="text"
                >预览审批单</el-button>
                <el-button v-if="scope.row.status != 0" @click="onReUse(scope.row)" size="mini" type="text">再次发起</el-button>
                <el-button size="mini" type="text" @click="onDetail(scope.row)">查看审批单详情</el-button>
                <!-- <el-button v-if="[0,2,4].includes(scope.row.status)" @click="onEdit(scope.row)" size="mini" type="text">编辑</el-button> -->
                <el-button v-if="[0,2,4].includes(scope.row.status)" @click="onDelete(scope.row)" size="mini" type="text">删除</el-button>
              </template>
            </el-table-column>
          </JNPF-table>
          <pagination
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
import { getApplyOrderList, FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
import { buildUrlParams } from "@/utils/index";
import { deleteApplyOrder } from '@/api/business/expenseAccount'

const INIT_QUERY = {
  currentPage: 1,
  keyword: "",
  pageSize: 20,
  sort: "desc",
  status: "-1",
  // minAmount: "",
  // maxAmount: "",
  pickerVal1: [],
  pickerVal2: []
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
  name: "ApprovalList",
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
      categoryId: "",
      approvalCategoryName: "",
      query: {
        categoryId: "",
        ...INIT_QUERY
      },
      total: -1,
      list: []
    };
  },
  computed: {
    ...mapGetters(['userInfo', 'token']),
  },
  created() {
    this.categoryId = this.$route.query.categoryId;
    this.approvalCategoryName = this.$route.query.approvalCategoryName;
    this.query.categoryId = this.categoryId;
    this.loadData();
  },
  methods: {
    goBack(isRefresh) {
      this.$emit("close", isRefresh);
    },
    onAdd() {
      this.$openDraw(`/h5-cicada/pages/cicada/oa/index?categoryId=${this.categoryId}&categoryName=${this.approvalCategoryName}`, {
        onClose: () => {
          this.loadData();
        }
      });
    },
    loadData() {
      this.listLoading = true;
      const query = {
        ...this.query
      };
      const [startTimePass, endTimePass] = query.pickerVal1 || [];
      const [startTimeInit, endTimeInit] = query.pickerVal2 || [];
      delete query.pickerVal1;
      delete query.pickerVal2;
      if (query.status === "-1") {
        query.status = "";
      }
      getApplyOrderList({
        ...query,
        startTimePass,
        endTimePass,
        startTimeInit,
        endTimeInit
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
    async goPreview(rec) {
      // const { formData: { basePrintdevId, orderType, id }} = await this.loadDetail(rec);
      // window.open(
      //   `/cicada-web/preview/h5print?templateId=${basePrintdevId}&formId=${id}&orderType=${orderType}&title=${
      //     rec.name
      //   }`
      // );
      // this.$openDraw(`/cicada-web/preview/h5print?templateId=${basePrintdevId}&formId=${id}&orderType=${orderType}&title=${rec.name}`,
      //   {
      //     size: '50%',
      //     onClose: () => {
      //       this.loadData();
      //     }
      //   });
      this.$router.push({
        path: "/approvalDetail",
        query: {
          id: rec.id,
        }
      });
    },
    async onEdit(rec) {
      this.$openDraw('/h5-cicada/pages/cicada/flowForm/index?orderId=' + rec.id + '&isRevoked=true', {
        onClose: () => {
          this.loadData();
        }
      });
    },
    async onDelete(rec) {
      this.$confirm("确定删除该审批单吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteApplyOrder(rec.id).then(suc => {
          this.$message.success("删除成功");
          this.loadData();
        });
      })
    },
    async onReUse(rec) {
      const { formData: { bizFlowModuleId, name }, flowTemplateInfo: { templateId }} = await this.loadDetail(rec);
      this.$openDraw(`/h5-cicada/pages/cicada/flowForm/index?orderId=${rec.id}&isAgain=true&bizFlowModuleId=${bizFlowModuleId}&flowTemplateId=${templateId}&name=${name}`, {
        onClose: () => {
          this.loadData();
        }
      });
    },
    async onDetail(rec) {
      if (rec.status == 0) {
        let id = rec.id;
        this.$openDraw('/h5-cicada/pages/cicada/flowForm/index?orderId=' + id);
      } else {
        let opType = '0';
        let query = {
          id: rec.id,
          flowId: rec.flowId,
          opType: opType,
          taskId: rec.id,
          isFrame: true
        };
        this.$openDraw(buildUrlParams('/h5-cicada/pages/cicada/approvalCenter/detail', query));
      }
    }
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
