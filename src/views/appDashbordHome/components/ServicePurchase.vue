<template>
  <el-dialog
    class="purchase-dialog"
    :title="null"
    :show-close="false"
    :visible="dialogVisible"
    :append-to-body="true"
    width="860px"
  >
    <div class="purchase-container">
      <div class="purchase-content">
        <div class="purchase-left">
          <h2 class="title">企业服务购买</h2>

          <div class="service-info" v-if="detail">
            <div class="info-item service-info-time">
              <span style="font-weight: bold;margin-right: 8px;">当前服务</span>
              <span>{{ formatTime(detail.expireTime) }}到期</span>
            </div>
            <div class="info-item service-process">
              <span style="font-weight: bold;margin-right: 8px;">存储空间</span>
              <div class="storage-bar">
                <div class="storage-progress" :style="`width:${detail.spaceScale || 0}`"></div>
              </div>
              <span>{{ detail.usedSpaceDisplay }}G/{{ detail.totalSpace }}G</span>
            </div>
          </div>

          <div class="service-tabs-contain" v-if="list.length">
            <div class="tabs">
              <div @click="active = item.type" :class="`tab ${active === item.type ? active === 1 ? 'active1' : 'active2' : ''}`" v-for="item in list" :key="item.type">{{ item.typeName }}</div>
            </div>

            <div class="sercie-tab-content" v-for="item in list" :key="item.type">
              <div class="tab-content-item" v-show="active === item.type">
                <div class="plans">
                  <div class="plan-card" :class="current.id === plan.id ? 'actived' : ''" @click="onSelect(plan)" v-for="plan in item.productList" :key="plan.id">
                    <!-- <img
                      class="tag"
                      src="https://image.smxzhcs.cn/media/M00/00/8D/CqDIk2dZBIeAKBHoAAAJfIXnd60262.png"
                      alt=""
                    > -->
                    <span class="tag">{{ plan.tag }}</span>
                    <div class="duration">{{ plan.name }}</div>
                    <div class="price">
                      <span class="currency">¥</span>
                      <span class="amount">{{ plan.price }}</span>
                    </div>
                  </div>
                </div>
                <div class="description">
                  <span>包含</span> {{ current.description }}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="purchase-right">
          <div class="diamond-icon">
            <img src="https://image.smxzhcs.cn/media/M00/00/8E/CqDIlGdZCFuAYhyWAABSK--IVmc237.png" alt="Diamond icon" />
          </div>
          <div class="order-summary" v-if="current && current.id">

            <div class="total-amount">
              <div class="label">订单金额</div>
              <div class="price">
                <span class="currency">¥</span>
                <span class="amount">{{ current.price }}</span>
              </div>
            </div>

            <div class="order-details">
              <h3>订单详情</h3>
              <div class="order-details-item">
                <span class="order-details-icon"></span>
                <p class="order-details-text">{{ current.name }}（{{ current.description }}）</p>
              </div>
            </div>

            <div><a href="#" class="terms" @click="onPreview(current.id)">合同模板预览</a></div>

            <button class="confirm-button" @click="onSubmit(current.id)">确认订单</button>
          </div>
        </div>
      </div>
      <span @click="close" class="el-icon-close"></span>
      <PreviewOnline @update:visible="showContract=false" :file-title="contract && contract.name || ''" :file-url="contract && contract.url || ''" :visible="showContract" />
    </div>
  </el-dialog>
</template>

<script>
import dayjs from 'dayjs';
import { getEntServiceDetail, getProductEntOrderList, getContractPreview, postProductEntOrder } from '@/api/business/service';
import { downloadFile } from '@/api/business/signature';
import PreviewOnline from "@/components/preview-online/index.vue";

// https://image.smxzhcs.cn/media/M00/00/8D/CqDIk2dZBKGAEhwwAAAJxtZxyfU388.png
export default {
  name: 'ServicePurchase',
  components: {
    PreviewOnline
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showContract: false,
      contract: null,
      current: null,
      active: 1,
      detail: null,
      list: []
    }
  },
  watch: {
    'current.id': {
      immediate: true,
      handler(val) {
        if (val) {
          // this.onPreview(val)
        }
      }
    }
  },
  created() {
    this.loadDetail();
    this.loadData();
  },

  methods: {
    formatTime(time) {
      if (!time) {
        return ''
      }
      // 年 月 日
      return dayjs(time).format('YYYY年MM月DD日')
    },
    onSelect(plan) {
      this.current = plan
    },
    onPreview(productId) {
      getContractPreview({ productId }).then(res => {
        if (res.data) {
          downloadFile(res.data).then(response => {
            this.contract = response.data
            this.showContract = true
          })
        }
      })
    },
    onSubmit(productId) {
      postProductEntOrder({
        productId
      }).then(res => {
        if (res.data) {
          this.$emit('submit', res.data)
        }
      })
    },
    loadDetail() {
      getEntServiceDetail().then(res => {
        this.detail = res.data
      })
    },
    loadData() {
      getProductEntOrderList().then((res) => {
        this.list = res.data;
        this.current = this.list[0].productList[0];
      }).catch((err) => {
        console.log(err, 'err');
      });
    },
    close() {
      this.$emit('close', false)
    }
  }
}
</script>
<style>
.purchase-dialog .el-dialog__header {
  display: none;
}
.purchase-dialog .el-dialog__body,
.purchase-dialog .el-dialog {
  padding: 0;
  background-color: transparent;
  border: 0;
  box-shadow: none;
}
</style>
<style lang="scss" scoped>
.purchase-container {
  width: 860px;
  height: 446px;
  background: linear-gradient(180deg, #dafffe 0%, #f3ffff 100%);
  border-radius: 16px;
  padding: 19px 14px;
  position: relative;
  .el-icon-close{
    position: absolute;
    padding: 5px;
    right: 20px;
    top: 20px;
    font-size: 20px;
    cursor: pointer;
    color:#00727C
  }

  .purchase-content {
    display: flex;
    gap: 14px;
  }

  .purchase-left {
    width: 526px;
  }

  .title {
    font-weight: bold;
    font-size: 24px;
    color: #007580;
    line-height: 27px;
    padding-left: 18px;
  }

  .service-info {
    margin-top: 13px;
    margin-bottom: 8px;
    padding-left: 18px;
    color: #007580;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .service-info-time {
    }
    .service-process {
      flex: 1;
      margin-left: 20px;
    }
    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
    }

    .storage-bar {
      width: 115px;
      height: 6px;
      background: #fff;
      overflow: hidden;
      margin-right: 12px;

      .storage-progress {
        height: 100%;
        background: #00b4c4;
      }
    }
  }

  .service-tabs-contain {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    padding-bottom: 20px;
  }
  .tabs {
    display: flex;
    background: linear-gradient(180deg, #00b4c4 0%, rgba(0, 180, 196, 0.6) 100%);

    .tab {
      height: 47px;
      line-height: 47px;
      cursor: pointer;
      position: relative;
      font-size: 14px;
      color: #fff;
      flex: 1;
      text-align: center;
      transition: width 0.3s;

      &.active1 {
        width: 273px;
        color: #00727c;
        font-weight: 500;
        background: url(https://image.smxzhcs.cn/media/M00/00/8D/CqDIk2daiYmAQpUNAAAEEqs2COU192.png) no-repeat;
        flex: none;
      }
      &.active2 {
        width: 273px;
        color: #00727c;
        font-weight: 500;
        background: url(https://image.smxzhcs.cn/smxsc/M00/30/81/CqDIlGdajUmAbcbRAAADFKzgT6A062.png) no-repeat;
        flex: none;
      }
    }
  }

  .plans {
    display: flex;
    gap: 24px;
    padding: 20px;
    padding-top: 39px;

    .plan-card {
      cursor: pointer;
      flex: 1;
      width: 149px;
      height: 180px;
      box-sizing: border-box;
      border: 1px solid #edeff2;
      border-radius: 8px;
      padding: 24px;
      position: relative;
      text-align: center;

      &.actived {
        border: 1px solid #ffe6b5;
        background: linear-gradient(180deg, rgba(255, 237, 203, 0.25) 0%, rgba(255, 247, 231, 0) 100%);
      }

      .tag {
        position: absolute;
        top: -22px;
        left: 0;
        background: url(https://image.smxzhcs.cn/media/M00/00/8E/CqDIlGdf4raAWwFSAAAEt-gDPH8980.png) no-repeat;
        width: 67px;
        line-height: 22px;
        height: 22px;
        text-align: center;
        color: #fff;
        font-size: 12px;
        font-weight: bold;
      }

      .duration {
        font-weight: 500;
        font-size: 14px;
        color: #292c33;
        line-height: 22px;
        margin-bottom: 16px;
        margin-top: 12px;
      }

      .price {
        color: #FF6600;

        .currency {
          font-size: 12px;
        }

        .amount {
          font-size: 30px;
          font-weight: bold;
        }
      }
    }

  }
  .description {
    padding: 0 11px;
    height: 32px;
    background: #fffbf5;
    border-radius: 8px;
    border: 1px solid #ffedca;
    font-weight: 400;
    font-size: 12px;
    color: #8c560b;
    line-height: 32px;
    margin: 0 20px;
    span{
      font-weight: 500;
      font-size: 12px;
      color: #FF7113;
      margin-right: 7px;
    }
  }

  .purchase-right {
    width: 288px;

    .order-summary {
      border-radius: 16px;
      padding: 22px;
      background: #FFFFFF;
    }

    .diamond-icon {
      text-align: center;
      height: 72px;
      overflow: hidden;
    }

    .total-amount {
      text-align: center;
      margin-bottom: 20px;

      .label {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
      }

      .price {
        color: #FF6600;

        .currency {
          font-size: 12px;
        }

        .amount {
          font-size: 32px;
          font-weight: bold;
        }
      }
    }

    .order-details {
      padding-top: 16px;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        margin-bottom: 12px;
        color: #111827;
        line-height: 27px;
      }

      .order-details {

        &-item{
          display: flex;
        }
        &-icon {
          width: 8px;
          height: 8px;
          background: #FED7AA;
          border-radius: 50%;
          margin-right: 8px;
          margin-top: 6px;

        }
        &-text{
          font-size: 12px;
        color: #292C33;
        line-height: 22px;
        flex: 1;
        }
      }
    }

    .terms {
      display: block;
      color: #00B4C4;
      text-decoration: none;
      font-size: 12px;
      margin-bottom: 45px;

      &:hover {
        text-decoration: underline;
      }
    }

    .confirm-button {
      width: 100%;
      background: linear-gradient( 180deg, #00B4C4 0%, rgba(0,180,196,0.6) 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
