<template>
  <div
    class="approval-list-contain JNPF-preview-main"
    source="src/views/appDashbordHome/components/ApprovaCenterListPop.vue"
  >
    <div class="JNPF-common-page-header">
      <el-page-header @back="goBack">
        <template slot="content">
          <div class="JNPF-page-header-content">审批中心</div>
        </template>
      </el-page-header>
    </div>
    <div class="JNPF-common-layout-center">
      <div style="padding: 0 16px;position: relative;">
        <el-tabs v-model="category" @tab-click="handleClick">
          <el-tab-pane
            v-for="item in categoryList"
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
                <div>{{ scope.row.fullName }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="审批状态" width="100">
              <template slot-scope="scope">
                <span v-if="scope.opType == 2" :class="`${scope.row.status == 1 ? 'success' : 'fail'}`">{{ scope.row.status == 1 ? '通过' : '退回' }}</span>
                <span v-else :class="statusMap[scope.row.status].color">{{
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
                <el-button size="mini" type="text" @click="onDetail(scope.row)">查看</el-button>
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
import { FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
import { FlowLaunchList } from '@/api/workFlow/FlowLaunch'
import { FlowBeforeList } from '@/api/workFlow/FlowBefore'

import { buildUrlParams } from "@/utils/index";

const getFlowStatusList = () => [
  {
    value: 0,
    label: '等待提交',
    color: 'gray',
  },
  {
    value: 1,
    label: '等待审核',
    color: 'orange',
  },
  {
    value: 2,
    label: '审核通过',
    color: 'success',
  },
  {
    value: 3,
    label: '审核退回',
    color: 'fail',
  },
  {
    value: 4,
    label: '已撤回',
    color: 'gray',
  },
  {
    value: 5,
    label: '审核终止',
    color: 'fail',
  },
  {
    value: 6,
    label: '已被挂起',
    color: 'fail',
  },
];

const getFlowStatusMap = () => {
  const ret = {};
  const list = getFlowStatusList();
  list.forEach(v => {
    ret[v.value] = v;
  });
  return ret;
};

const INIT_QUERY = {
  currentPage: 1,
  keyword: "",
  pageSize: 20,
  sort: "desc",

  // minAmount: "",
  // maxAmount: "",
  // pickerVal1: [],
  // pickerVal2: []
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
  name: "ApprovalListPop",
  props: {
    categoryId: {
      type: String,
      default: ""
    },
    approvalCategoryName: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      statusMap: getFlowStatusMap(),
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
      categoryList: [
        { value: '1', label: '待处理' }, // 待办事宜 http://devsaas.smxzhcs.cn:30067/cicada-api/api/workflow/Engine/FlowBefore/List/1?n=1694517920&currentPage=1&pageSize=20&sort=desc&sidx=&keyword=&startTime=&endTime=&templateId=&flowId=&flowUrgent=&flowCategory=&creatorUserId=
        { value: '2', label: '已处理' }, // 已办事宜 http://devsaas.smxzhcs.cn:30067/cicada-api/api/workflow/Engine/FlowBefore/List/2?n=1694517938&currentPage=1&pageSize=20&sort=desc&sidx=&keyword=&startTime=&endTime=&templateId=&flowId=&flowUrgent=&flowCategory=&creatorUserId=
        { value: '0', label: '已发起' }, // 我发起的 http://devsaas.smxzhcs.cn:30067/cicada-api/api/workflow/Engine/FlowLaunch?n=1694517871&currentPage=1&pageSize=20&sort=desc&sidx=&keyword=&startTime=&endTime=&templateId=&flowId=&status=&flowUrgent=&flowCategory=
        { value: '3', label: '我收到的' }, // 抄送事宜 http://devsaas.smxzhcs.cn:30067/cicada-api/api/workflow/Engine/FlowBefore/List/3?n=1694517950&currentPage=1&pageSize=20&sort=desc&sidx=&keyword=&startTime=&endTime=&templateId=&flowId=&flowUrgent=&flowCategory=&creatorUserId=
      ],
      category: '0',
      listLoading: true,
      query: {
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
    this.loadData();
  },
  methods: {
    goBack(isRefresh) {
      this.$emit("close", isRefresh);
    },
    onAdd() {
      this.$openDraw(`/h5-cicada/pages/cicada/expenseAccount/spdIndex?categoryId=${this.categoryId}&categoryName=${this.approvalCategoryName}`, {
        onClose: () => {
          this.loadData();
        }
      });
    },
    async loadData() {
      this.listLoading = true;
      const query = {
        ...this.query
      };
      let res = {};
      console.log(this.category, 'this.category')
      if (['1', '2', '3'].includes(this.category)) {
        res = await FlowBeforeList(this.category, query)
      } else {
        res = await FlowLaunchList(query);
      }

      this.list = res.data.list;
      this.total = res.data.pagination.total;
      this.listLoading = false;
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
      const { formData: { basePrintdevId, orderType, id }} = await this.loadDetail(rec);
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
    async onReUse(rec) {
      const { formData: { bizFlowModuleId, name }, flowTemplateInfo: { templateId }} = await this.loadDetail(rec);
      this.$openDraw(`/h5-cicada/pages/cicada/flowForm/index?orderId=${rec.id}&isAgain=true&bizFlowModuleId=${bizFlowModuleId}&flowTemplateId=${templateId}&name=${name}`, {
        onClose: () => {
          this.loadData();
        }
      });
    },
    async onDetail(d) {
    // opType 取值： -1 - 我发起的新建/编辑; 0 - 我发起的详情; 1 - 待办事宜; 2 - 已办事宜; 3 - 抄送事宜; 4 - 流程监控
    // 0等待提交, 1等待审核, 2审核通过, 3审核退回, 4已撤回, 5审核终止, 6已被挂起  我发起的状态
    // 已处理的流程，只有通过和退回两种状态 status = 1 通过，status ！=1 && status ！= 10 退回
      let opType = '';
      let query = {};
      switch (this.category) {
        case '0': // 我发起的,参考 /xy-cicada-web/src/views/workFlow/flowLaunch/index.vue
        // if (![1, 2, 4, 5].includes(d.status)) {
        //   opType = '-1';
        // } else if (d.status) {
        //   opType = '0';
        // }
          opType = '0';
          query = {
            id: d.id,
            flowId: d.flowId,
            opType: opType,
            status: d.status,
            parentId: d.parentId,
            taskId: d.id,
          };
          break;
        case '1': // 待办事宜, 参考 /xy-cicada-web/src/views/workFlow/flowTodo/index.vue
          opType = '1';
          query = {
            id: d.processId,
            flowId: d.flowId,
            opType: opType,
            taskNodeId: d.thisStepId,
            taskId: d.id,
          };
          break;
        case '2': // 已办事宜, 参考 /xy-cicada-web/src/views/workFlow/flowDone/index.vue
          opType = '2';
          query = {
            id: d.processId,
            flowId: d.flowId,
            opType: opType,
            taskNodeId: d.thisStepId,
            taskId: d.id,
          };
          break;
        case '3': // 抄送事宜, 参考 /xy-cicada-web/src/views/workFlow/flowCirculate/index.vue
          opType = '3';
          query = {
            id: d.processId,
            flowId: d.flowId,
            opType: opType,
            taskNodeId: d.thisStepId,
          };
          break;
        default:
          return;
      }
      if (!opType) return;
      let url = '';
      // 已发起未提交
      if (this.category == '0' && d.status == '0') {
      // 暂存
        if (d.formData && d.formData.staging == '1') {
          url = buildUrlParams(`/pages/cicada/flowForm/index?orderId=${d.id}`);
        } else {
        // 草稿，申请单没有草稿状态，所以此处不做区分申请单和报销单
          url = buildUrlParams(`/pages/cicada/expenseAccount/detail?id=${d.id}`);
        }
      } else {
        url = buildUrlParams('/pages/cicada/approvalCenter/detail', query);
      }
      console.log('跳转详情', url);
      this.$openDraw(`/h5-cicada${url}`, {
        onClose: () => {
          this.loadData();
        }
      });
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
