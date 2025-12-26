<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <el-form @submit.native.prevent>
        <div class="JNPF-common-search-box custom-search-box">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label="关键词">
                <el-input
                  class="custom-input"
                  v-model="keyword"
                  placeholder="请输入关键词查询"
                  clearable
                  @keyup.enter.native="search()"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="日期">
                <el-date-picker
                  class="custom-date-picker"
                  v-model="pickerVal"
                  type="daterange"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="pickerOptions"
                  value-format="timestamp"
                  clearable
                  :editable="false"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="发起人员">
                <user-select :parent-id="parentId" class="custom-user-select" v-model="creatorUserId" placeholder="选择发起人员" />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item>
                <el-button class="custom-btn-search" icon="el-icon-search" @click="search()">
                  {{ $t('common.search') }}</el-button>
                <el-button class="custom-btn-reset" icon="el-icon-refresh-right" @click="refresh()">{{ $t('common.reset') }}
                </el-button>
              </el-form-item>
            </el-col>

          </el-row>
          <el-row>
            <el-col :span="24">
              <el-radio-group class="custom-radio-group" v-model="status" @input="search" text-color="#00B4C4" fill="#e5f7f9">
                <el-radio-button style="margin-right: 10px;" v-for="item in statusList" :key="item.value" :label="item.value">{{ item.label }}</el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <!-- <div>
            <el-button type="primary" icon="el-icon-finished" @click="goBatch">批量审批</el-button>
          </div> -->
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
        <JNPF-table class="custom-jnpf-table" v-loading="listLoading" :data="list">
          <el-table-column prop="fullName" label="流程标题" show-overflow-tooltip min-width="150">
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.delegateUser">委托</el-tag>
              {{ scope.row.fullName }}
            </template>
          </el-table-column>
          <el-table-column prop="flowName" label="所属流程" width="130" />
          <el-table-column
            prop="viewInfo"
            label="重点内容"
            width="220"
          >
            <template slot-scope="scope">
              <div v-for="(item, index) in scope.row.viewInfo" :key="index">
                <span style="margin-right: 10px;">{{ item.label }}:</span>
                <span>{{ item.value }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="发起人员" width="130" />
          <el-table-column prop="organizationName" label="部门" width="130" />
          <el-table-column prop="flowUrgent" label="紧急程度" width="100" align="center">
            <template slot-scope="scope">
              {{ scope.row.flowUrgent | urgentText() }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="流程状态" width="130" align="center">
            <template slot-scope="scope">
              <template v-if="status == 2">
                <span v-if="scope.row.status == 1" class="center-custom-status center-custom-status-success">通过</span>
                <span v-else class="center-custom-status center-custom-status-fail">退回</span>
              </template>
              <template v-else>
                <span :class="`center-custom-status center-custom-status-${statusMap[scope.row.status].color}`">{{ statusMap[scope.row.status].label }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="creatorTime" label="接收时间" width="130">
            <template slot-scope="scope">
              {{ scope.row.creatorTime | toDate() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="50" fixed="right">
            <template slot-scope="scope">
              <el-button class="custom-text-btn" size="mini" type="text" @click="goApprovalDetail(scope.row)">详情</el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination
          class="custom-jnpf-pagination"
          :total="total"
          :page.sync="listQuery.currentPage"
          :limit.sync="listQuery.pageSize"
          @pagination="initData"
        />
      </div>

    </div>
  </div>

</template>
<style>
.custom-radio-group .el-radio-button__inner {
  border-width: 0px;
  background: #F4F8F9;
  font-size: 14px;
  color: #919499;
}
</style>
<style lang="scss" scoped>
.custom-search-box {
  background-color: #fff;
  margin-bottom: 0px;
}
</style>
<script>
import { ref, reactive, onMounted, toRefs, defineComponent } from '@vue/composition-api'
import { FlowBeforeList, applyShareList } from '@/api/workFlow/FlowBefore'
import { FlowEngineListAll, getFlowList } from '@/api/workFlow/FlowEngine'
import { FlowLaunchList } from '@/api/workFlow/FlowLaunch'
import { getFlowStatusMap } from '@/utils/cicada'
import { buildUrlParams } from '@/utils/index'
import router from '@/router'
export default defineComponent({
  name: 'approvalCenterList',
  components: {

  },
  filters: {
    getCategoryText(id, categoryList) {
      let item = categoryList.filter(o => o.enCode == id)[0]
      return item && item.fullName ? item.fullName : ''
    }
  },
  setup(props, { root }) {
    const route = root.$route;
    const status = ref(route.query.status || '1');
    const statusList = ref([
      { value: '1', label: '待处理' },
      { value: '2', label: '已处理' },
      { value: '0', label: '已发起' },
      { value: '3', label: '我收到的' },
      { value: '4', label: '共享给我的' },
    ]);
    const state = reactive({
      list: [],
      total: 0,
      showAll: false,
      listLoading: true,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      },
      urgent: '',
      urgentList: [
        { id: 1, fullName: '普通' },
        { id: 2, fullName: '重要' },
        { id: 3, fullName: '紧急' }
      ],
      formVisible: false,
      batchListVisible: false,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      keyword: '',
      pickerVal: [],
      startTime: '',
      endTime: '',
      templateId: '',
      flowId: '',
      flowCategory: '',
      creatorUserId: '',
      categoryList: [],
      flowEngineList: [],
      flowOptions: []
    })

    const search = () => {
      if (state.pickerVal && state.pickerVal.length) {
        state.startTime = state.pickerVal[0]
        state.endTime = state.pickerVal[1]
      } else {
        state.startTime = ''
        state.endTime = ''
      }
      state.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      initData()
    }

    const getFlowEngineList = () => {
      FlowEngineListAll().then((res) => {
        state.flowEngineList = res.data.list
      })
    }

    const getDictionaryData = () => {
      root.$store.dispatch('base/getDictionaryData', { sort: 'WorkFlowCategory' }).then((res) => {
        state.categoryList = res
      })
    }

    const initData = () => {
      state.listLoading = true
      let query = {
        ...state.listQuery,
        keyword: state.keyword,
        startTime: state.startTime,
        endTime: state.endTime,
        templateId: state.templateId,
        flowId: state.flowId,
        flowUrgent: state.urgent,
        flowCategory: state.flowCategory,
        creatorUserId: state.creatorUserId
      };
      (status.value == '0' ? FlowLaunchList(query) : status.value == '4' ? applyShareList(query) : FlowBeforeList(status.value, query)).then(async res => {
        state.list = res.data.list
        state.total = res.data.pagination.total
        state.listLoading = false
      })
    }

    // const toDetail = (item) => {
    //   let data = {
    //     id: item.processId,
    //     flowId: item.flowId,
    //     opType: 1,
    //     taskNodeId: item.thisStepId,
    //     taskId: item.id
    //   }
    //   state.formVisible = true
    //   root.$nextTick(() => {
    //     console.log('调起FlowBox', { ...data })
    //     refs.FlowBox.init(data)
    //   })
    // }

    // const goBatch = () => {
    //   state.batchListVisible = true
    //   root.$nextTick(() => {
    //     refs.BatchList.init()
    //   })
    // }

    const closeForm = (isRefresh) => {
      state.formVisible = false
      if (isRefresh) refresh()
    }

    const refresh = () => {
      state.pickerVal = ''
      state.startTime = ''
      state.endTime = ''
      state.keyword = ''
      state.templateId = ''
      state.flowId = ''
      state.urgent = ''
      state.flowCategory = ''
      state.creatorUserId = ''
      state.listQuery = {
        currentPage: 1,
        pageSize: 20,
        sort: 'desc',
        sidx: ''
      }
      initData()
    }

    const onTemplateIdChange = (val) => {
      state.flowId = ''
      state.flowOptions = []
      if (!val) return
      getFlowList()
    }

    const getFlowList = () => {
      getFlowList(state.templateId).then(res => {
        state.flowOptions = res.data
      })
    }

    const visibleFlowChange = (val) => {
      if (!val) return
      if (!state.templateId) root.$message.warning('请先选择所属流程')
    }

    onMounted(() => {
      getDictionaryData()
      getFlowEngineList()
      initData()
    })

    const onChangeTab = (tab, event) => {
      console.log(tab, event, '****')
    }

    const goApprovalDetail = d => {
    // opType 取值： -1 - 我发起的新建/编辑; 0 - 我发起的详情; 1 - 待办事宜; 2 - 已办事宜; 3 - 抄送事宜; 4 - 流程监控
    // 0等待提交, 1等待审核, 2审核通过, 3审核退回, 4已撤回, 5审核终止, 6已被挂起  我发起的状态
    // 已处理的流程，只有通过和退回两种状态 status = 1 通过，status ！=1 && status ！= 10 退回
      let opType = '';
      let query = {};
      switch (status.value) {
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
        case '4': // 分享给我的审批单
          opType = '2';
          query = {
            id: d.id,
            flowId: d.flowId,
            opType: opType,
            taskNodeId: d.thisStepId,
            taskId: d.taskId,
          };
          break;
        default:
          return;
      }
      if (!opType) return;
      let url = '';

      // 已发起未提交
      if (status.value == '0' && d.status == '0') {
      // 暂存
        if (d.formData && d.formData.staging == '1') {
          url = buildUrlParams(`/approval?orderId=${d.id}`); // 表单页面
        } else {
        // 草稿，申请单没有草稿状态，所以此处不做区分申请单和报销单 /pages/cicada/expenseAccount/detail
          url = buildUrlParams(`/approvalCenter/detail?id=${d.id}`);
        }
      } else {
        // /pages/cicada/approvalCenter/detail
        url = buildUrlParams('/approvalCenter/detail', query);
      }
      console.log('跳转详情', url);
      router.push(url)
    };

    return {
      ...toRefs(state),
      statusList,
      status,
      onChangeTab,
      search,
      getFlowEngineList,
      getDictionaryData,
      initData,
      closeForm,
      refresh,
      onTemplateIdChange,
      getFlowList,
      visibleFlowChange,
      statusMap: getFlowStatusMap(),
      goApprovalDetail,
      parentId: root.$store.state.user.userInfo.companyId
    }
  }
})
</script>
