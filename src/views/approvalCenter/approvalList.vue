<template>
  <div class="page-approval-center-approval-list">
    <el-form :model="query" ref="formRef" label-width="70px" style="width: 100%">
      <div class="query-flex">
        <el-col style="width: 290px">
          <el-form-item label="审批单名称" label-width="90px" prop="keyword">
            <el-input v-model="query.keyword" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col style="width: 320px" v-if="showAddBtn">
          <el-form-item label="申请时间" label-width="90px" prop="applyTime">
            <el-date-picker v-model="query.applyTime" type="daterange" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="yyyy-MM-dd" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col style="width: 150px">
          <el-form-item label-width="20px">
            <el-button class="custom-btn-search" @click="onSearch">查询</el-button>
            <el-button class="custom-btn-reset" @click="onReset">重置</el-button>
          </el-form-item>
        </el-col>
      </div>
    </el-form>
    <div class="operate-container">
      <el-radio-group v-model="status" @input="onChangeTab" text-color="#00B4C4" fill="#e5f7f9">
        <el-radio-button v-for="item in statusList" :key="item.value"
          :label="item.value">{{ item.label }}</el-radio-button>
      </el-radio-group>

      <el-button class="custom-btn-search" @click="onAddType" v-if="showAddBtn">发起审批</el-button>
    </div>
    <div class="operate-container-1">
      <el-radio-group v-model="isRelation" @input="onChangeRelate" text-color="#00B4C4"
        fill="#e5f7f9">
        <el-radio-button v-for="item in relationList" :key="item.value"
          :label="item.value">{{ item.label }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="custom-vxe-table-container custom-vxe-table-container-1">
      <vxe-table resizable stripe size="small" ref="xTable" :data="list" :loading="listLoading"
        class="custom-vxe-table" max-height="100%">
        <vxe-column type="seq" title="序号" width="68" />
        <vxe-column field="name" title="审批单名称" min-width="260" />
        <vxe-column field="flowName" title="审批类型" min-width="160">
          <template #default="{row}">
            <span class="type-container">{{ row.flowName }}</span>
          </template>
        </vxe-column>
        <vxe-column field="viewInfo" title="重点内容" min-width="220">
          <template #default="{row}">
            <div v-if="row.moduleJson && row.viewInfo">
              <div v-for="item in row.viewInfo" :key="item.label">
                <span>{{ item.label }}:</span>
                <span style="margin-left: 8px">{{ item.value }}</span>
              </div>
            </div>
          </template>
        </vxe-column>
        <vxe-column field="applyDate" title="申请时间" min-width="100" />
        <vxe-column field="status" title="状态" min-width="50">
          <template #default="{row}">
            <span :class="
                `center-custom-status center-custom-status-${
                  statusMap[row.status].color
                }`
              ">{{ statusMap[row.status].label }}</span>
          </template>
        </vxe-column>
        <vxe-column field="action" title="操作" width="140" fixed="right">
          <template #default="{row}">
            <div class="custom-operate-btn-container">
              <div class="btn-link" @click="goToDetail(row)">详情</div>
              <div v-if="row.status === 0 || row.status === 2 || row.status === 4"
                class="btn-divider" />
              <el-dropdown v-if="row.status === 0 || row.status === 2 || row.status === 4">
                <i class="el-icon-more" style="color: #00B4C4;cursor: pointer"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <div v-if="
                        row.status === 0 || row.status === 2 || row.status === 4
                      " class="btn-link" @click="onDelete(row)">
                      删除
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <pagination class="custom-jnpf-pagination" :total="total" :page.sync="listQuery.currentPage"
      :limit.sync="listQuery.pageSize" layout="prev, pager, next" background @pagination="initData" />
    <add-o-a-type :visible.sync="dialog.visible" :category-id="categoryId"
      :category-name="categoryName" @confirm="onAddOrder" />
  </div>
</template>

<script>
import { getApplyOrderList } from '@/api/workFlow/FlowBefore'
import AddOAType from '@/views/approvalCenter/components/addOAType.vue'
import { deleteApplyOrder } from '@/api/business/expenseAccount'

const getSpdStatus = () => [
  { value: '-1', label: '全部', color: 'gray' },
  { value: '0', label: '草稿', color: 'gray' },
  { value: '4', label: '被驳回', color: 'red' },
  { value: '1', label: '审批中', color: 'orange' },
  { value: '2', label: '已撤回', color: 'gray' },
  { value: '3', label: '审批完成', color: 'success' }
]
const getSpdRelate = () => [
  { value: '2', label: '未关联', color: 'gray' },
  { value: '1', label: '已关联', color: 'gray' }
]

const getSpdStatusMap = () => {
  const ret = {}
  const list = getSpdStatus()
  list.forEach((v) => {
    ret[v.value] = v
  })
  return ret
}
const getSpdRelateMap = () => {
  const ret = {}
  const list = getSpdRelate()
  list.forEach((v) => {
    ret[v.value] = v
  })
  return ret
}

export default {
  name: 'approvalCenterApprovalList',
  components: { AddOAType },
  data() {
    return {
      categoryId: this.$route.query.categoryId || '',
      categoryName: this.$route.query.categoryName || '',
      status: '-1',
      isRelation: '',
      list: [],
      statusList: getSpdStatus(),
      statusMap: getSpdStatusMap(),
      relationList: getSpdRelate(),
      relationMap: getSpdRelateMap(),
      listLoading: false, // 列表loading
      buttonLoading: false, // 上传列表loading
      total: 0,
      query: {
        keyword: '',
        applyTime: []
      },
      listQuery: {
        currentPage: 1,
        pageSize: 20
      },
      dialog: {
        visible: false
      },
      showAddBtn: false,
    }
  },
  mounted() {
    this.showAddBtn = !!this.categoryId;
    this.status = this.$route.query.status || '-1';
    this.initData()
  },
  deactivated() {
    this.$deactivedLast = true
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData()
    }
  },
  methods: {
    onChangeRelate(val) {
      console.log('changeRelate', val, this.isRelation);
      this.status = '3';
      this.onSearch();
    },
    onChangeTab() {
      if (this.status !== '3') {
        this.isRelation = '';
      }
      this.onSearch()
    },
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      this.listQuery.currentPage = 1
      // 加载数据
      this.initData()
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields()
      this.query.applyTime = undefined
      this.onSearch()
    },
    initData() {
      this.listLoading = true
      const query = {
        ...this.listQuery,
        ...this.query
      }
      const [startTimeInit, endTimeInit] = query.applyTime || []
      delete query.applyTime
      getApplyOrderList({
        categoryId: this.categoryId,
        sort: 'desc',
        status: this.status === '-1' ? '' : this.status,
        isRelation: this.isRelation,
        ...query,
        startTimeInit,
        endTimeInit
      }).then((res) => {
        console.log('res', res, 'data', res.data);
        if (res.data.list) {
          this.list = res.data.list
          this.total = res.data.pagination.total
        } else {
          this.list = []
          this.total = 0
        }

        this.listLoading = false
      })
    },
    goToDetail(row) {
      // 草稿
      if (row.status === 0) {
        const id = row.id
        this.$router.push({
          path: '/approval',
          query: { orderId: id, name: row.flowName }
        })
      } else {
        let opType = '0'
        let query = {
          id: row.id,
          flowId: row.flowId,
          opType: opType,
          taskId: row.id
        }
        this.$router.push({ path: '/approvalCenter/detail', query })
      }
    },
    onDelete(row) {
      this.$confirm('确认删除该申请单吗?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteApplyOrder(row.id).then(() => {
          this.$message.success('删除成功')
          this.initData()
        })
      })
    },
    onAddType() {
      this.dialog.visible = true
    },
    onAddOrder(item) {
      this.$router.push({
        path: '/approval',
        query: {
          bizFlowModuleId: item.id,
          flowTemplateId: item.flowTemplateId,
          name: item.name
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-approval-center-approval-list {
  background-color: #ffffff;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  ::v-deep .el-form-item__label {
    font-weight: 400;
    font-size: 14px;
    color: #292c33;
  }
  ::v-deep .el-radio-button__inner {
    height: 35px;
    background: #f4f8f9;
    border-radius: 4px;
    border: none;
    font-weight: 400;
    font-size: 14px;
    color: #919499;
    line-height: 35px;
    padding: 0 12px;
    text-align: center;
    margin-right: 8px;
  }
  .operate-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    &-1 {
      margin-top: 12px;
    }
  }
  .query-flex {
    display: flex;
    flex-wrap: wrap;
  }
  .type-container {
    background: #00b4c4;
    border-radius: 12px;
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    line-height: 17px;
    padding: 3px 12px;
    white-space: nowrap;
    word-break: keep-all;
  }
}
</style>
