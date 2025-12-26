<template>
  <el-form-item
    v-if="showInFormCalc"
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <div class="related-approval">
      <template v-if="selectedApprovals.length">
        <div v-for="(approval, index) in selectedApprovals" :key="approval.id" class="selected-approval">
          <div class="approval-info">
            <div class="approval-name">{{ approval.name }}</div>
            <div class="approval-meta">
              <span>申请人: {{ approval.applyUserName }}</span>
              <span>申请时间: {{ approval.applyDate }}</span>
            </div>
          </div>
          <div class="approval-actions">
            <el-button type="text" @click="viewDetail(index)">查看</el-button>
            <el-button v-if="!readonly" type="text" @click="removeApproval(index)">移除</el-button>
          </div>
        </div>
      </template>
      <el-button
        v-if="!readonly && selectedApprovals.length < limit"
        size="small"
        type="primary"
        @click="selectApproval"
      >{{ placeholder }}</el-button>
    </div>
    <SelectApprovalOrder
      :visible.sync="selectVisible"
      :multiple="isMultiple"
      :form-type="1"
      :from-form-type="1"
      :checked-ids="selectedApprovalIds"
      @confirm="onSelectApproval"
    />
    <ApprovalOrderDetail
      v-if="currentViewApproval"
      :visible.sync="detailVisible"
      :data="currentViewApproval"
    />
  </el-form-item>
</template>

<script>
import ComMixin from './comMixin'
import SelectApprovalOrder from "@/views/approvalCenter/components/selectApprovalOrder.vue"
import ApprovalOrderDetail from "@/views/approvalCenter/components/approvalOrderDetail.vue"
import { APIGetBindCompleteOrders } from "@/api/cicada/oa"

export default {
  name: 'RelatedApproval',
  components: {
    SelectApprovalOrder,
    ApprovalOrderDetail
  },
  mixins: [ComMixin],
  data() {
    return {
      selectVisible: false,
      detailVisible: false,
      selectedApprovals: [],
      currentViewApproval: null
    }
  },
  computed: {
    isMultiple() {
      return this.limit > 1
    },
    selectedApprovalIds() {
      return this.selectedApprovals.map(item => item.id)
    },
    showInFormCalc() {
      let keyName = (this.group.fieldName ? this.group.fieldName + '.' : '') + this.field.fieldName;
      if (this.group.iterable) {
        keyName += '.' + this.groupIterateIndex;
      }
      return !(keyName && !this.fieldVisibleMap.get(keyName));
    }
  },
  watch: {
    moduleValue: {
      immediate: true,
      handler(val) {
        if (val) {
          const ids = val.split(',')
          // 初始化时才需要查询详情
          if (this.selectedApprovals.length === 0 && ids.length > 0) {
            this.getApprovalDetail(ids)
          }
        } else {
          this.selectedApprovals = []
        }
      }
    }
  },
  methods: {
    selectApproval() {
      this.selectVisible = true
    },
    onSelectApproval(rows) {
      if (rows && rows.length > 0) {
        const newRows = rows.filter(row => !this.selectedApprovalIds.includes(row.id))

        if (newRows.length + this.selectedApprovals.length > this.limit) {
          this.$message.warning('最多只能选择' + this.limit + '个审批单')
          return
        }

        this.selectedApprovals = [...this.selectedApprovals, ...newRows]

        const ids = this.selectedApprovals.map(item => item.id)
        const titles = this.selectedApprovals.map(item => item.name)

        this.moduleValue = this.isMultiple ? ids.join(',') : ids[0]
        this.updateHiddenFields({
          relatedApprovalTitle: this.isMultiple ? titles.join(',') : titles[0] || ''
        })
      }
    },
    viewDetail(index) {
      this.currentViewApproval = this.selectedApprovals[index]
      this.detailVisible = true
    },
    removeApproval(index) {
      this.selectedApprovals.splice(index, 1)

      const ids = this.selectedApprovals.map(item => item.id)
      const titles = this.selectedApprovals.map(item => item.name)

      this.moduleValue = this.isMultiple ? (ids.length ? ids.join(',') : '') : (ids[0] || '')
      this.updateHiddenFields({
        relatedApprovalTitle: this.isMultiple ? (titles.length ? titles.join(',') : '') : (titles[0] || '')
      })
    },
    async getApprovalDetail(ids) {
      try {
        const res = await APIGetBindCompleteOrders({ exsBindFlag: 0, idList: ids });
        if (res.data?.entityList) {
          // 直接使用接口返回的数据
          this.selectedApprovals = [
            ...(res.data?.entityList || []),
            ...(res.data?.shareEntityList || [])
          ];
        }
      } catch (error) {
        console.error('获取审批单详情失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.related-approval {
  .selected-approval {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 10px;
    }

    .approval-info {
      .approval-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 5px;
      }

      .approval-meta {
        font-size: 12px;
        color: #909399;

        span {
          margin-right: 15px;
        }
      }
    }

    .approval-actions {
      .el-button {
        padding: 0;
        margin-left: 15px;
      }
    }
  }
}
</style>
