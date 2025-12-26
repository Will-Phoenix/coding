<template>
  <div class="approval-center-detail-container">
    <div class="approval-center-detail-content" v-if="info">
      <div class="approval-center-detail-left">
        <div class="approval-center-detail-left-header">
          <div>
            <div>{{ flowTaskFullName }}</div>
            <div class="cacd-flow-tag-wrapper">
              <span
                :class="`cacd-flow-tag theme-${formType}`"
                v-if="applyUserName"
              >{{ applyUserName }}</span>
              <span
                :class="`cacd-flow-tag theme-${formType}`"
                v-if="flowName"
              >{{ flowName }}</span>
            </div>
          </div>
          <img v-if="approveResultImg" class="approve-result-img" :src="approveResultImg" alt="">
        </div>
        <MessageCard :data="errsList" title="信息待调整" type="error" />
        <MessageCard :data="warningsList" title="异常提醒" type="warning" />
        <template v-if="formType === 1">
          <CollapseCard :title="flowName" :collapsible="false">
            <ApprovalPrint :order-id="id" />
          </CollapseCard>
          <CollapseCard title="申请单" :collapsible="false">
            <AnyFormDetail :id="id" />
          </CollapseCard>
        </template>
        <template v-if="formType === 2">
          <ApplyPrint @update="loadData" :no-submit="noSubmit" :order-id="id" :inc="applyOrderIds.join(',')" />
        </template>
      </div>
      <div class="approval-center-detail-right">
        <template v-if="formType === 2">
          <CollapseCard
            title="单据基本信息"
            icon="https://image.smxzhcs.cn/media/M00/00/90/CqDIlGdySXeAGU8TAAABn0bdjjw450.png"
            :collapsible="true"
            :default-collapsed="true"
          >
            <AnyFormDetail v-if="info" :id="id" />
            <template v-if="info.formData.exsCost" #extra>
              <img
                class="cost-icon"
                src="https://image.smxzhcs.cn/smxsc/M00/2C/4D/CqDIlGT3CeWADKE5AAAGRxvT2QE239.png"
                alt=""
              >
              <span class="cost-text">{{ formatCash(info.formData.exsCost) }}</span>
            </template>
          </CollapseCard>
          <div class="custom-center-empty-card" v-if="noSubmit">
            <div v-if="applyOrderIds.length > 0" class="custom-app-title">
              <div class="custom-app-title-text">审批单管理</div>
              <div class="custom-app-title-btn" @click="selectOrderVisible = true">
                <span style="color: #00b4c4;font-size: 20px; vertical-align: middle;" class="el-icon-circle-plus-outline"></span>
                关联审批单
              </div>
            </div>
            <div v-else class="custom-center-upload-con" @click="selectOrderVisible = true">
              <span
                style="font-size: 20px;margin-right: 8px;color:#00B4C4"
                class="el-icon-circle-plus-outline"
              ></span>
              关联审批单
            </div>
          </div>
          <SelectApprovalOrder :visible.sync="selectOrderVisible" :checked-ids="applyOrderIds" @confirm="onSelectOrderResult" />
          <template v-if="applyOrderIds.length > 0">
            <CollapseCard
              v-for="item in applyOrderIds"
              :key="item"
              :title="applyOrderInfo[item] ? applyOrderInfo[item].flowTaskInfo.fullName : '申请基本信息'"
              icon="https://image.smxzhcs.cn/media/M00/00/8F/CqDIk2dyTYmABKMfAAABI7G5lAQ007.png"
              :collapsible="true"
              :default-collapsed="true"
            >
              <AnyFormDetail @load="onLoadApplyOrderInfo" :id="item" />
              <span v-if="noSubmit" slot="extra" class="custom-delete-btn" @click="onDeleteApplyOrder(item)">删除</span>
            </CollapseCard>
          </template>
          <div class="custom-center-empty-card" v-if="showPaymentOrder">
            <div v-if="exsOrderIds.length > 0" class="custom-app-title">
              <div class="custom-app-title-text">请款单管理</div>
              <div class="custom-app-title-btn" @click="selectExsOrderVisible = true">
                <span style="color: #00b4c4;font-size: 20px; vertical-align: middle;" class="el-icon-circle-plus-outline"></span>
                关联请款单
              </div>
            </div>
            <div v-else class="custom-center-upload-con" @click="selectExsOrderVisible = true">
              <span
                style="font-size: 20px;margin-right: 8px;color:#00B4C4"
                class="el-icon-circle-plus-outline"
              ></span>
              关联请款单
            </div>
          </div>
          <SelectApprovalOrder :visible.sync="selectExsOrderVisible" :checked-ids="exsOrderIds" :form-type="2" @confirm="onSelectExsOrderResult" />
          <template v-if="exsOrderIds.length > 0">
            <CollapseCard
              v-for="item in exsOrderIds"
              :key="item"
              :title="applyOrderInfo[item] ? applyOrderInfo[item].flowTaskInfo.fullName : '申请基本信息'"
              icon="https://image.smxzhcs.cn/media/M00/00/8F/CqDIk2dyTYmABKMfAAABI7G5lAQ007.png"
              :collapsible="true"
              :default-collapsed="true"
            >
              <AnyFormDetail @load="onLoadApplyOrderInfo" :id="item" />
              <span v-if="noSubmit" slot="extra" class="custom-delete-btn" @click="onDeleteExsOrder(item)">删除</span>
            </CollapseCard>
          </template>
        </template>
        <travelAssistantCard v-if="showAssistantCard" :data="{ orderId: id }" />
        <CollapseCard title="审批流程" v-if="!noSubmit" :collapsible="false">
          <FlowTaskNodeList
            :on-fast-audit="onFastApproval"
            :on-fast-reject="onFastDeny"
            v-if="info"
            v-bind="info"
          />
        </CollapseCard>
      </div>
    </div>
    <div class="approval-center-detail-bottom">
      <template v-if="noSubmit">
        <el-button class="custom-plan-btn" @click="onEdit">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/smxsc/M00/2C/5C/CqDIk2T9KkCAaaq6AAABUzx1ORo627.png"
            alt=""
          >
          编辑表单
        </el-button>
        <!-- <el-button class="custom-plan-btn" v-if="isFrame !== 'true' && formType == 2" @click="preview">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/smxsc/M00/2C/5C/CqDIk2T9KkCACOS1AAACCVIL72Q381.png"
            alt=""
          >
          预览{{ flowTypeName }}单</el-button> -->
        <el-button class="custom-submit-btn" @click="onJuniorSubmit" :disabled="disabled">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/media/M00/00/90/CqDIlGdzOWWAQNIRAAABGJTEu74929.png"
            alt=""
          >
          提交智能初审
        </el-button>
      </template>
      <template v-else>
        <div v-if="propertyJson && propertyJson.printShow && info && info.formData && info.formData.printNum" style="margin: 0 10px;">已打印（{{ info.formData.printNum }}次）</div>
        <el-button class="custom-plan-btn" v-if="showPrintBtn" @click="goPrint">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/media/M00/00/8F/CqDIk2dzOgiAONLEAAACaXebwWk233.png"
            alt=""
          >
          打印{{ flowTypeName }}单
        </el-button>
        <!-- <el-button class="custom-plan-btn" v-if="isFrame !== 'true' && formType == 2" @click="preview">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/smxsc/M00/2C/5C/CqDIk2T9KkCACOS1AAACCVIL72Q381.png"
            alt=""
          >
          预览{{ flowTypeName }}单</el-button> -->
        <el-button @click="onClickShare" class="custom-plan-btn" v-if="showShareBtn">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/smxsc/M00/30/52/CqDIlGc8X_OAUkNhAAADxS8khS8053.png"
            alt=""
          >
          <div style="display: none;">
            <UserSelect @change="onChangeShare" :parent-id="parentId" ref="shareUsersSelect" v-model="shareIds" placeholder="请选择共享人" multiple :disabled="false" :clearable="true" />
          </div>
          共享{{ flowTypeName }}单
        </el-button>
        <el-button class="custom-plan-btn" v-if="showAuditBtn" @click="onClickPreview">
          <img
            class="custom-btn-icon"
            src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/d23315cc-2f30-4baa-bedf-28289e533e01.png"
            alt=""
          >
          预览报销单
        </el-button>
        <el-button class="custom-plan-btn" v-if="showPressBtn" @click="onClickPress">
          <img
            class="custom-btn-icon"
            src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/0ce20ffc-4e4b-4d61-8eca-5689c18f30b2.png"
            alt=""
          >
          催办
        </el-button>
        <el-button
          class="custom-reject-btn"
          v-if="showAuditBtn"
          type="danger"
          @click="onClickReject"
        >
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/media/M00/00/90/CqDIlGdzOW6ANcv-AAAB4MF2VYA316.png"
            alt=""
          >
          审批驳回
        </el-button>
        <el-button class="custom-submit-btn" v-if="showAuditBtn" @click="onClickApproval">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/media/M00/00/90/CqDIlGdzOWWAQNIRAAABGJTEu74929.png"
            alt=""
          >
          审批通过
        </el-button>
        <el-button class="custom-plan-btn" v-if="showEditBtn && !info.formData.difyType" @click="onEdit">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/smxsc/M00/2C/5C/CqDIk2T9KkCAaaq6AAABUzx1ORo627.png"
            alt=""
          >
          再次提交
        </el-button>
        <el-button class="custom-plan-btn" v-if="showRevokeBtn" @click="onClickRevoke">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/smxsc/M00/2C/6B/CqDIk2UDwC-AdDe3AAAE_4TdStg659.png"
            alt=""
          >
          撤销申请
        </el-button>
        <el-button class="custom-plan-btn" v-if="opType == '0' && !showEditBtn && !info.formData.difyType" @click="again">
          <img
            class="custom-btn-icon"
            src="https://image.smxzhcs.cn/smxsc/M00/2C/5C/CqDIk2T9KkCAaaq6AAABUzx1ORo627.png"
            alt=""
          >
          再次提交
        </el-button>
      </template>
    </div>
    <el-dialog title="审批驳回" :visible.sync="rejectPopupOpen" width="30%">
      <el-input type="textarea" v-model="rejectReason" placeholder="请输入驳回原因" :rows="4" />
      <span slot="footer">
        <el-button type="primary" @click="onConfirmReject(rejectReason)">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="审批通过" :visible.sync="approvalPopupOpen" width="30%">
      <el-input v-if="info && info.approversProperties && info.approversProperties.hasOpinion" type="textarea" v-model="opinion" placeholder="请输入审批意见" :rows="4" />
      <FlowTaskNodeList
        style="margin-top: 20px;"
        is-select
        is-audit
        v-if="showCandidate"
        v-bind="info"
        :on-candidate-list-change="onCandidateListChange"
      />
      <span slot="footer">
        <el-button type="primary" @click="onConfirmApproval(opinion)">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { computed, defineComponent, onMounted, watch } from '@vue/composition-api';
import { useApproval } from './hooks/useApproval';
import AnyFormDetail from '@/components/AnyFormDetail';
import FlowTaskNodeList from '@/components/FlowTaskNodeList';
import CollapseCard from '@/components/CollapseCard';
import ApprovalPrint from './components/ApprovalPrint';
import ApplyPrint from './components/ApplyPrint';
import MessageCard from './components/MessageCard';
import SelectApprovalOrder from "./components/selectApprovalOrder.vue";
import { formatCash } from '@/utils/format';
import _ from 'lodash';
import travelAssistantCard from "@/views/approvalCenter/components/travelAssistantCard.vue";

export default defineComponent({
  name: 'ApprovalCenterDetail',
  components: {
    AnyFormDetail,
    FlowTaskNodeList,
    CollapseCard,
    ApprovalPrint,
    ApplyPrint,
    MessageCard,
    SelectApprovalOrder,
    travelAssistantCard
  },
  setup(props, { root }) {
    const { id, flowId, opType, taskNodeId, taskId, isFrame } = root.$route.query;
    const approvalLogic = useApproval(root, { id, flowId, opType, taskNodeId, taskId });

    onMounted(async() => {
      root.$loading('加载中...');
      await approvalLogic.loadData();
    });
    const orderId = computed(() => root.$route.query.id);
    watch(orderId, async(n) => {
      if (id && id !== n) {
        // 刷新页面
        await root.$store.dispatch('tagsView/delCachedView', root.$route)
        root.$nextTick(() => {
          root.$router.replace({
            path: '/redirect' + root.$route.fullPath
          })
        })
      }
    }, {
      immediate: true,
      deep: true
    });

    return {
      ...approvalLogic,
      id,
      opType,
      taskNodeId,
      taskId,
      isFrame,
      formatCash,
      get: _.get,
      parentId: root.$store.state.user.userInfo.companyId
    };
  }
});
</script>
<style lang="scss" scoped>
.approval-center-detail-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding-bottom: 80px;
}
.approval-center-detail-left {
  flex: 1;
  height: 100%;
  margin-right: 12px;
}
.approval-center-detail-right {
  width: 383px;
  height: 100%;
}
.approval-center-detail-bottom {
  width: 100%;
  padding: 20px 30px;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  .custom-btn-icon {
    width: 22px;
    height: 22px;
    margin-right: 4px;
    vertical-align: middle;
  }
  .custom-submit-btn {
    background: linear-gradient(180deg, #00b4c4 0%, rgba(0, 180, 196, 0.6) 100%);
    color: #fff;
    border-color: rgba(0, 180, 196, 0.3);
    line-height: 22px;
    font-size: 14px;
    &.is-disabled,&.is-disabled:hover {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  .custom-reject-btn {
    background: rgba(242, 92, 92, 0.1);
    color: #f05248;
    border-color: rgba(242, 92, 92, 0.1);
    line-height: 22px;
    font-size: 14px;
  }
  .custom-plan-btn {
    border: 1px solid #edeff2;
    color: #292c33;
    line-height: 22px;
    font-size: 14px;
    &:hover {
      background: #fff;
      opacity: 0.8;
    }
  }
}
.cost-icon {
  width: 18px;
  height: 18px;
  margin-right: 4px;
}
.cost-text {
  font-weight: 500;
  font-size: 16px;
}

.approval-center-detail-left-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 13px;
  .cacd-flow-tag-wrapper {
    display: flex;
    font-size: 12px;
  }
  .approve-result-img {
    width: 74px;
    height: 74px;
  }
  .cacd-flow-tag {
    margin-right: 4px;
    margin-top: 8px;
    line-height: 17px;
    border-radius: 4px;
    padding: 1px 4px;
    font-weight: 400;
    &.theme-1 {
      color: #00b4c4;
      background: #e5f7f9;
    }
    &.theme-2 {
      color: #fa914b;
      background: #fff5ea;
    }
  }
}

.custom-center-empty-card {
  .custom-center-upload-con {
    background: #fff;
    border-radius: 8px;
    border: 1px dashed #00b4c4;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    font-weight: 500;
    font-size: 14px;
    color: #292c33;
    cursor: pointer;
    margin-bottom: 12px;
    .c-upload-icon {
      margin-right: 8px;
    }
  }
  .custom-app-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    .custom-app-title-text {
      font-size: 16px;
      font-weight: bold;
      color: #292c33;
    }
    .custom-app-title-btn {
      cursor: pointer;
      font-size: 14px;
    }
  }
}
.custom-delete-btn{
  color: #00b4c4;
  font-size: 14px;
  cursor: pointer;
}
</style>
