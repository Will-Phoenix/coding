<template>
  <div class="app-home-index">
    <div class="app-home-warp">

      <div class="app-home-top-main">
        <div class="app-home-note">
          <div>您好！{{ userInfo.userName }}</div>
          <div>欢迎登录电子化凭证报销平台</div>
        </div>
        <div class="app-home-top-right">
          <div class="app-top-list">
            <div class="app-top-item" @click="()=>{onGoApprovalList('1')}">
              <div class="app-top-num t-yellow-1">{{ statistics.applyAuditNum }}</div>
              <div class="app-top-text">审批中</div>
            </div>
            <div class="app-top-drive-line"></div>
            <div class="app-top-item" @click="()=>{onGoApprovalList('3')}">
              <div class="app-top-num text-white">{{ statistics.applyPassNum }}</div>
              <div class="app-top-text">审批完成</div>
            </div>
            <div class="app-top-drive-line"></div>
            <div class="app-top-item" @click="()=>{onGoApplyList('1')}">
              <div class="app-top-num t-yellow-1">{{ statistics.auditNum }}</div>
              <div class="app-top-text">报销中</div>
            </div>
            <div class="app-top-drive-line"></div>
            <div class="app-top-item" @click="()=>{onGoApplyList('3')}">
              <div class="app-top-num text-white">{{ statistics.passNum }}</div>
              <div class="app-top-text">报销完成</div>
            </div>

          </div>
          <StorageInfo
            v-if="showBuyEntrance"
            @showOrderList="onShowOrderList"
            @showBuy="onshowBuy"
          />
        </div>
      </div>
      <div class="app-home-notice" @click="goNotice">
        <div class="app-home-notice-img"></div>
        <div class="app-home-notice-list">
          <el-carousel v-if="notices.length" height="19px" direction="vertical" :autoplay="true">
            <el-carousel-item v-for="item in notices" :key="item.id">
              <div class="app-home-notice-item">
                <span class="app-home-notice-tag">{{ item.createUserName }}</span>
                <span class="app-home-notice-text">{{ item.name }}</span>
              </div>
            </el-carousel-item>
          </el-carousel>

        </div>
        <div class="app-home-app-more">
          <span class="app-home-app-more-num">{{ unread }}</span>
          <span class="app-home-app-more-text">查看更多</span>
          <img
            class="app-home-app-more-img"
            src="https://image.smxzhcs.cn/media/M00/00/8C/CqDIlGc1obKAQSDCAAABCo5JMo4398.png"
            alt=""
          >
        </div>
      </div>
      <div class="app-home-main">
        <div class="app-home-panel">
          <div class="app-home-title">我的审核</div>
          <div class="app-home-my">
            <div class="app-home-need" @click="()=>{$router.push('/approvalCenter/list?status=1')}">
              <div class="app-my-text t-blue">待审核</div>
              <div class="app-my-num t-blue">{{ stat.waitNum }}</div>
            </div>
            <div class="app-home-over" @click="()=>{$router.push('/approvalCenter/list?status=2')}">
              <div class="app-my-text t-yellow-2">已审核</div>
              <div class="app-my-num t-yellow-2">{{ stat.trailNum }}</div>
            </div>
          </div>
        </div>
        <div class="app-home-panel" style="padding-bottom: 0">
          <div class="app-home-title">应用中心</div>
          <div class="app-home-apps">
            <div class="app-home-item" @click="()=>{$router.push('/personalBillManage')}">
              <img
                class="app-home-icon"
                src="https://image.smxzhcs.cn/media/M00/00/8C/CqDIlGc0XcyALOZVAAAFF-061jY370.png"
                alt=""
              >
              <div class="app-home-app-text">发票夹</div>
            </div>
            <div class="app-home-item" @click="()=>{$router.push('/approvalCenter/list?status=0')}">
              <img
                class="app-home-icon"
                src="https://image.smxzhcs.cn/smxsc/M00/2C/4A/CqDIk2T1oQuAIn7BAAAH1QpXk5g790.png"
                alt=""
              >
              <div class="app-home-app-text">审批中心</div>
            </div>
            <template v-if="categories.length>0">
              <div
                @click="onGoList(item)"
                v-for="item in categories"
                :key="item.id"
                class="app-home-item"
              >
                <img class="app-home-icon" :src="item.icon" alt="">
                <div class="app-home-app-text">{{ item.categoryName }}</div>
              </div>
            </template>
            <div class="app-home-item" @click="()=>{$router.push('/personalUserFolderManage')}">
              <img
                class="app-home-icon"
                src="https://image.smxzhcs.cn/smxsc/M00/30/2F/CqDIlGc0XZyATQj8AAADcjC6OjI095.png"
                alt=""
              >
              <div class="app-home-app-text">资料夹</div>
            </div>
            <div class="app-home-item" @click="()=>{$router.push('/aiInvoice')}">
              <img
                class="app-home-icon"
                src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/367f9f32-be3a-41f4-8728-cddc66581a11.png"
                alt=""
              >
              <div class="app-home-app-text">便捷报销</div>
            </div>

            <!-- <div class="app-home-item" @click="()=>{showApprovalCenter = true}">
              <img
                class="app-home-icon"
                src="https://image.smxzhcs.cn/smxsc/M00/30/2F/CqDIlGc0XZyATQj8AAADcjC6OjI095.png"
                alt=""
              >
              <div class="app-home-app-text">审批中心</div>
            </div> -->
          </div>
        </div>

      </div>
    </div>
    <ApprovalListPop
      @close="()=>{
        showApproval = false;
        approvalCategoryId = '';
        approvalCategoryName= ''
      }"
      v-if="approvalCategoryId"
      :category-id="approvalCategoryId"
      :approval-category-name="approvalCategoryName"
      :style="`${showApproval ? 'display:block' : 'display:none'}`"
    />
    <ReimburseListPop
      @close="()=>{
        showReimburse = false;
        reimburseCategoryId = '';
      }"
      v-if="reimburseCategoryId"
      :category-id="reimburseCategoryId"
      :style="`${showReimburse ? 'display:block' : 'display:none'}`"
    />

    <ApprovaCenterListPop
      v-if="showApprovalCenter"
      @close="()=>{
        showApprovalCenter = false;
      }"
      :style="`${showApprovalCenter ? 'display:block' : 'display:none'}`"
    />

    <ExsOrderListPop
      @close="()=>{
        showExsOrder = false;
        orderStatus = '';
      }"
      v-if="orderStatus"
      :order-status="orderStatus"
      :style="`${showExsOrder ? 'display:block' : 'display:none'}`"
    />
    <ServicePurchase @close="showBuy = false" :dialog-visible="showBuy" @submit="onOrder" />
    <OrderDialog v-if="orderNo" @update:orderNo="orderNo = ''" :order-no="orderNo" />
    <OrderList
      @close="showOrderList = false"
      v-if="showOrderList"
      :style="`${showOrderList ? 'display:block' : 'display:none'}`"
    />
    <a-i-invoice-pop
      :visible.sync="aiInvoice.visible"
      :num="aiInvoice.num"
      @confirm="()=>{$router.push('/aiInvoice')}"
    />
  </div>
</template>

<script>
import {
  mapGetters
} from 'vuex'
import ApprovalListPop from './components/ApprovalListPop'
import ReimburseListPop from './components/ReimburseListPop';
import ApprovaCenterListPop from './components/ApprovaCenterListPop';
import ExsOrderListPop from "./components/ExsOrderListPop";
import StorageInfo from './components/StorageInfo'
import ServicePurchase from './components/ServicePurchase'
import OrderDialog from '@/components/OrderDialog/index.vue'
import OrderList from './components/OrderList'
import { getDicts } from '@/api/common'

import {
  APIGetAppIndexStatistics,
  APIGetOrderCategoryList,
  APIGetStatusNum,
  getCcdNoticePage,
  getCcdNoticeUnreadNum
} from "@/api/workFlow/FlowBefore";
import AIInvoicePop from "@/views/aiInvoice/components/aiInvoicePop.vue";
import { getMapFastApply } from "@/api/business/pasteTicket";

export default {
  name: "AppDashbordHome",
  components: {
    AIInvoicePop,
    ApprovalListPop,
    ReimburseListPop,
    ApprovaCenterListPop,
    ExsOrderListPop,
    StorageInfo,
    ServicePurchase,
    OrderDialog,
    OrderList
  },
  data() {
    return {
      orderNo: '',
      showBuy: false,
      showOrder: false,
      showOrderList: false,
      showApproval: false,
      showReimburse: false,
      showApprovalCenter: false,
      showExsOrder: false,
      aiInvoice: {
        visible: false,
        num: 0,
      },
      approvalCategoryId: '',
      approvalCategoryName: '',
      reimburseCategoryId: '',
      orderStatus: '',
      stat: {
        waitNum: 0,
        trailNum: 0
      },
      statistics: {
        auditNum: 0,
        passNum: 0
      },
      categories: [],
      noticeParam: {
        current: 1,
        size: 10
      },
      unread: 0,
      notices: [],
      showBuyEntrance: false
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  activated() {
    this.init();
  },
  created() {
    this.init();
    this.loadAiInvoice();
  },
  methods: {
    init() {
      APIGetStatusNum().then(res => {
        this.stat = res.data;
        // this.statistics = res.data;
      })
      APIGetAppIndexStatistics().then(res => {
        this.statistics = res.data;
      })
      APIGetOrderCategoryList().then(res => {
        this.categories = res.data;
      })
      getCcdNoticeUnreadNum().then(res => {
        this.unread = res.data;
      })
      getDicts("XSHTQY").then(res => {
        this.showBuyEntrance = res.data.list[0].enCode === "1";
      });
      this.loadNotice()
    },
    loadAiInvoice() {
      getMapFastApply().then(res => {
        const idMap = res.data;
        if (idMap && Object.keys(idMap).length > 0) {
          this.aiInvoice.visible = true;
          this.aiInvoice.num = Object.keys(idMap).length;
        }
      })
    },
    loadNotice() {
      getCcdNoticePage(this.noticeParam).then(res => {
        this.notices = res.data.records;
      })
    },
    onGoList(item) {
      if (item.orderBizType === 1) {
        /* this.showApproval = true;
        this.approvalCategoryId = item.id
        this.approvalCategoryName = item.categoryName */
        this.$router.push({ path: '/approvalList', query: { categoryId: item.id, categoryName: item.categoryName }})
      } else {
        // this.showReimburse = true;
        // this.reimburseCategoryId = item.id
        this.$router.push({ path: '/applyList', query: { categoryId: item.id, categoryName: item.categoryName }})
      }
    },
    onGoApplyList(orderStatus) {
      console.log('orders1111', orderStatus)

      this.$router.push({ path: '/applyList', query: { status: orderStatus }})
    },
    onGoApprovalList(orderStatus) {
      console.log('orders2222', orderStatus)
      this.$router.push({ path: '/approvalList', query: { status: orderStatus }})
    },
    onShowOrderList() {
      this.showOrderList = true;
    },
    onshowBuy() {
      this.showBuy = true;
    },
    onOrder(orderNo) {
      this.orderNo = orderNo;
      this.showBuy = false;
    },
    goNotice() {
      this.$router.push({ path: '/userNoticeIndex' })
    }
  }
}
</script>
<style lang="scss" scoped>
.app-home-index {
  height: 100%;
  position: relative;
  .app-home-warp {
    .app-home-top {
      height: 83px;
      color: #fff;
    }
    .app-home-panel {
      background: #ffffff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      .app-home-title {
        font-weight: 500;
        font-size: 16px;
        color: #292c33;
        padding-bottom: 20px;
      }
    }
    .app-home-my {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .app-home-need {
        background-color: rgba(0, 180, 196, 0.1);
        background-image: url(https://image.smxzhcs.cn/media/M00/00/8C/CqDIlGc1pAqAX4XnAAAzAA6yVN0839.png);
        background-repeat: no-repeat;
        background-position: right 38px bottom;
      }
      .app-home-over {
        background-color: rgba(250, 145, 75, 0.1);
        background-image: url(https://image.smxzhcs.cn/media/M00/00/8C/CqDIlGc1pHqAcvAdAAAtVX-7NE0663.png);
        background-repeat: no-repeat;
        background-position: right 38px bottom;
      }
      > div {
        flex: 1;
        height: 113px;
        border-radius: 16px;
        padding-left: 40px;
        padding-top: 24px;
        padding-bottom: 20px;
        cursor: pointer;
        &:not(:first-child) {
          margin-left: 20px;
        }
        .app-my-text {
          font-size: 14px;
        }
        .app-my-num {
          margin-top: 4px;
          font-weight: 500;
          font-size: 32px;
        }
      }
    }

    .app-home-top-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 128px;
      background: #01a8b7 url(https://image.smxzhcs.cn/smxsc/M00/30/52/CqDIlGc8VNKAEtoXAAGNpA1Q3is078.png) no-repeat;
      border-radius: 8px;
      padding: 0 20px 0 40px;
      align-items: center;
      margin-bottom: 16px;
      .app-home-note {
        font-weight: 500;
        font-size: 20px;
        color: #ffffff;
        line-height: 33px;
      }
      .app-home-top-right {
        display: flex;
        align-items: center;
      }
      .app-top-list {
        display: flex;
        align-items: center;
        margin-right: 20px;
        .app-top-item {
          padding: 10px 7px;
          text-align: center;
          color: #fff;
          cursor: pointer;
          .app-top-text {
            font-size: 14px;
          }
          .app-top-num {
            font-size: 32px;
            margin-top: 2px;
            font-weight: bold;
          }
        }
        .app-top-drive-line {
          height: 35px;
          width: 1px;
          background: #fff;
          margin: 0 30px;
        }
      }
    }
    .app-home-notice {
      height: 64px;
      display: flex;
      align-content: space-between;
      align-items: center;
      background: linear-gradient(264deg, #ffffff 0%, #f9feff 100%);
      border-radius: 8px;
      margin-bottom: 16px;
      .app-home-notice-img {
        width: 110px;
        height: 64px;
        background: url(https://image.smxzhcs.cn/smxsc/M00/30/52/CqDIlGc8U9eAQs_WAAAUjDPfyNo123.png) no-repeat left bottom;
      }
      .app-home-notice-list {
        flex: 1;
        .app-home-notice-item {
          .app-home-notice-tag {
            display: inline-block;
            background: #00b4c4;
            border-radius: 4px;
            color: #fff;
            padding: 1px 4px;
            margin-right: 8px;
            font-size: 11px;
            line-height: 13px;
          }
          .app-home-notice-text {
            font-size: 12px;
            color: #5c5f66;
            line-height: 16px;
          }
        }
      }
      .app-home-app-more {
        padding-right: 22px;
        cursor: pointer;
        .app-home-app-more-num {
          display: inline-block;
          padding: 1px 4px;
          border-radius: 14px;
          background-color: rgba(250, 145, 75, 1);
          color: #fff;
          font-size: 11px;
          line-height: 13px;
        }
        .app-home-app-more-text {
          font-size: 12px;
          color: #919499;
          margin-left: 8px;
        }
        .app-home-app-more-img {
          vertical-align: middle;
        }
      }
    }
    .app-home-main {
    }
    .app-home-apps {
      margin-left: -20px;
      .app-home-item {
        cursor: pointer;
        width: 275px;
        padding: 20px 24px;
        margin-left: 20px;
        display: inline-flex;
        align-items: center;
        margin-bottom: 20px;
        background: rgba(252, 252, 252, 0.95);
        border-radius: 8px;
        border: 1px solid #edeff2;
      }
      .app-home-icon {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
      .app-home-app-text {
        font-size: 14px;
        font-weight: 500;
        color: #292c33;
      }
    }
  }
  .t-yellow-1 {
    color: #ffdbc3;
  }
  .t-blue {
    color: rgba(0, 180, 196, 1);
  }
  .t-yellow-2 {
    color: rgba(250, 145, 75, 1);
  }
}
</style>
