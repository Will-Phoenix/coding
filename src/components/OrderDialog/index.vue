<template>
  <el-dialog
    class="service-order-dialog"
    :title="null"
    :show-close="false"
    :visible.sync="dialogVisible"
    :append-to-body="true"
    width="860px"
  >
    <div class="service-order-container" v-if="detail">
      <div :class="`service-order-content ${detail.status === 5 ? 'service-order-content-finish' : ''}`">
        <div class="service-order-content-left">
          <div class="service-order-top-content">
            <div class="service-order-top-title">{{ detail.status === 5 ? '订单已取消' : '订单创建成功，感谢您的信任与支持' }}</div>
            <div class="order-number-con">
              <span class="order-number">订单号 {{ detail.orderNo }}</span> <span v-if="detail.status !== 5" @click="onCopy(detail.orderNo,$event)" class="order-number-copy">复制</span>
            </div>
          </div>
          <div class="service-service-order-panel">
            <template v-if="contract">
              <div class="service-order-content-title">合同预览</div>
              <div class="service-order-card">
                <div class="service-order-card-left">
                  <div class="service-order-card-left-file">
                    <img class="service-order-card-left-icon" src="https://image.smxzhcs.cn/media/M00/00/8D/CqDIk2daqwmAAaCdAAACMBILG6I821.png" alt="">
                    {{ contract.name }}</div>
                </div>
                <div class="service-order-card-right" @click="onPreviewContract">预览</div>
              </div>
            </template>
            <div class="service-order-content-title" style="margin-top: 5px;">公对公转账</div>
            <div class="service-order-content-note">
              您也可以直接进行公对公转账，转账完成后，我们会第一时间为您开通服务
            </div>
            <div class="service-order-bank-con">
              <div class="service-order-bank-left">
                <div class="service-order-bank-item">
                  <div class="service-order-bank-item-label">账号名称  </div>
                  <div class="service-order-bank-item-value">{{ detail.bankName }}</div>
                </div>
                <div class="service-order-bank-item">
                  <div class="service-order-bank-item-label">开  户 行  </div>
                  <div class="service-order-bank-item-value">{{ detail.bankDeposit }}</div>
                </div>
                <div class="service-order-bank-item">
                  <div class="service-order-bank-item-label">银行账号  </div>
                  <div class="service-order-bank-item-value">{{ formatCardNumber(detail.bankAccount) }}</div>
                </div>
                <div class="service-order-bank-item">
                  <div class="service-order-bank-item-label">转账金额</div>
                  <div class="service-order-bank-item-value orange-color">{{ detail.price }}元</div>
                </div>
                <div class="service-order-bank-item">
                  <div class="service-order-bank-item-label">转账备注</div>
                  <div class="service-order-bank-item-value orange-color">{{ detail.orderNo }}</div>
                  <div class="service-order-bank-item-copy orange-color">
                    <span @click="onCopy(detail.orderNo,$event)">复制</span>
                  </div>
                </div>

              </div>
              <div class="service-order-bank-right" v-if="detail.status !== 5">
                <el-upload
                  :action="actionUrl"
                  :file-list="fileList"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  accept=".png,.jpg,.jpeg"
                  :on-success="handleSuccess"
                  :on-error="handleError"
                  :on-progress="handleProgress"
                >
                  <div :style="`background-image: url(${payProveUrl})`" class="service-order-bank-right-img" v-if="detail.payProveFid">
                    <div class="service-order-bank-right-img-reupload">重新上传</div>
                  </div>
                  <div v-else>
                    <img src="https://image.smxzhcs.cn/media/M00/00/8E/CqDIlGdarDeAEj6-AAABlzTnkcM281.png" alt="">
                    <div style="margin-top: 12px;">上传转账记录</div>
                  </div>
                </el-upload>

              </div>
            </div>
            <div class="service-order-card" v-if="detail.status !== 5">
              <div class="service-order-card-left">转账成功后，可申请开票</div>
              <div @click="onApplicationInvoice" v-if="detail.openInvoiceStatus === 0 && detail.contractFid && detail.status !== 5" class="service-order-card-right">申请发票</div>
              <div v-if="!detail.invoiceFid && detail.openInvoiceStatus === 1" style="cursor: auto;" class="service-order-card-right">申请中，请耐心等待</div>
              <div v-if="detail.invoiceFid && detail.openInvoiceStatus === 1 " class="service-order-card-right">
                <span @click="onPreviewInvoice" class="service-order-card-right-btn">查看发票</span>
                <span class="service-order-card-right-line">|</span>
                <span @click="onDownloadInvoice" class="service-order-card-right-btn">下载发票</span>
              </div>

            </div>
          </div>
        </div>
        <div class="service-order-content-right">
          <div class="service-order-right-icon">
            <img src="https://image.smxzhcs.cn/media/M00/00/8E/CqDIlGdZCFuAYhyWAABSK--IVmc237.png" alt="Diamond icon" />
          </div>
          <div class="service-order-right-content">
            <div class="service-order-right-title">订单金额</div>
            <div class="service-order-right-amount">
              <span class="currency">¥</span>
              <span class="amount">{{ detail.price }}</span>
            </div>
            <div class="cancel-order-con"> <span v-if="[1].includes(detail.status)" class="cancel-order" @click="onCancelOrder">取消订单</span><div style="height: 22px;" v-else></div></div>
            <div class="order-details">
              <h3>订单详情</h3>
              <div class="order-details-item">
                <span class="order-details-icon"></span>
                <div>
                  <p class="order-details-text">
                    <template v-if="detail && detail.productInfo && detail.productInfo.name">
                      {{ detail.productInfo.name }}
                    </template>
                    <template v-if="detail && detail.productInfo && detail.productInfo.description">
                      （{{ detail.productInfo.description }}）
                    </template> </p>
                  <div class="order-details-terms-con"><a v-if="contract" @click="onPreviewContract" href="#" class="terms">合同模板预览</a> <div v-else style="height: 14px"></div></div>
                </div>
              </div>

            </div>

            <div class="service-order-right-bottom">
              <div class="service-order-right-bottom-icon">
                <img class="service-order-right-bottom-icon-img" src="https://image.smxzhcs.cn/media/M00/00/8D/CqDIk2djYk-ASXhMAACkSaFLfe4327.jpg" alt="">
              </div>
              <div class="service-order-right-bottom-right">
                <div class="service-order-right-bottom-title">如有疑问，联系企业客服</div>
                <div class="service-order-right-bottom-text">扫码添加企业客服微信</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span @click="dialogVisible = false" class="el-icon-close"></span>
      <PreviewOnline @update:visible="showContract=false" v-if="contract" :file-title="contract.name" :file-url="contract.url" :visible="showContract" />
      <PreviewOnline @update:visible="showInvoice=false" v-if="invoice" :file-title="invoice.name" :file-url="invoice.url" :visible="showInvoice" />
    </div>

  </el-dialog>
</template>

<script>
import { getOrderDetail, uploadTransferRecord, applicationInvoice, cancelOrder } from '@/api/business/service';
import { downloadFile } from '@/api/business/signature';
import PreviewOnline from "@/components/preview-online/index.vue";
import clipboard from '@/utils/clipboard'
import { downloadFileByUrl } from "@/utils/fileUtils";
export default {
  name: 'OrderDialog',
  components: {
    PreviewOnline
  },
  props: {
    orderNo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      fileList: [],
      showContract: false,
      detail: null,
      contract: null,
      showInvoice: false,
      invoice: null,
      payProveUrl: ''
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return !!this.orderNo
      },
      set(val) {
        if (!val) {
          this.$emit('update:orderNo', '')
        }
      }
    }
  },
  watch: {
    'detail.payProveFid': {
      immediate: true,
      handler(val) {
        if (val) {
          downloadFile(val).then(res => {
            this.payProveUrl = res.data.url
          })
        }
      }
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    formatCardNumber(cardNumber) {
      // 去除所有非数字字符
      const onlyNumbers = cardNumber.replace(/\D/g, '');
      // 将卡号分成4个部分
      const parts = onlyNumbers.match(/\d{4,4}/g);
      // 如果没有分成4部分,则返回原始输入
      if (!parts) {
        return cardNumber;
      }
      // 将4个部分用空格连接起来
      return parts.join(' ');
    },
    handleSuccess(response) {
      uploadTransferRecord({ payProveFid: response.data.id, orderNo: this.orderNo }).then(res => {
        if (res.code === 200) {
          this.$message.success("上传成功");
          this.detail.payProveFid = response.data.id
        }
      })
    },
    handleError() {},
    handleProgress() {},
    onApplicationInvoice() {
      applicationInvoice({ openInvoiceStatus: 1, orderNo: this.orderNo }).then(res => {
        if (res.code === 200) {
          this.$message.success("申请成功");
          this.detail.openInvoiceStatus = 1
        }
      })
    },
    onCancelOrder() {
      cancelOrder({ orderNo: this.orderNo }).then(res => {
        if (res.code === 200) {
          this.$message.success("取消成功");
          this.dialogVisible = false;
        }
      })
    },
    onCopy(text, event) {
      clipboard(text, event)
    },
    onPreviewContract() {
      if (this.detail.status === 5) {
        return this.$message.warning("订单已取消，无法查看合同")
      }
      this.showContract = true;
    },
    onPreviewInvoice() {
      downloadFile(this.detail.invoiceFid).then(res => {
        if (["jpg", "png", "jpeg"].includes(res.data.fileExtension)) {
          this.$hevueImgPreview({
            url: res.data.url,
            clickMaskCLose: true,
          });
        } else {
          this.invoice = res.data
          this.showInvoice = true;
        }
      })
    },
    onDownloadInvoice() {
      downloadFile(this.detail.invoiceFid).then(res => {
        // window.open(res.data.url)
        // 下载图片而不是在新页面打开图片
        downloadFileByUrl(res.data.url, res.data.name)
      })
    },
    loadData() {
      if (this.orderNo) {
        getOrderDetail({ orderNo: this.orderNo }).then(res => {
          this.detail = res.data
          if (this.detail.contractFid || this.detail.previewContractFid) {
            downloadFile(this.detail.contractFid || this.detail.previewContractFid).then(res => {
              this.contract = res.data
            })
          }
        })
      }
    }
  }
}
</script>
<style>
.service-order-dialog .el-dialog__header {
  display: none;
}
.service-order-dialog .el-dialog__body,
.service-order-dialog .el-dialog {
  padding: 0;
  background-color: transparent;
  border: 0;
  box-shadow: none;
}
</style>

<style lang="scss" scoped>
.service-order-container{
  background: linear-gradient( 180deg, #DAFFFE 0%, #F3FFFF 100%);
  padding: 20px 14px;
  border-radius: 16px;
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
  .service-service-order-panel{
    height: 380px;
    background: #FFFFFF;
    border-radius: 16px;
    padding: 12px 20px;
    .service-order-content-title{
      font-weight: 500;
      font-size: 14px;
      color: #111827;
      line-height: 27px;
      margin-bottom: 3px;
    }
    .service-order-content-note{
      font-size: 12px;
      color: #5C5F66;
      line-height: 17px;
    }
    .service-order-card{
      background: #FFFBF5;
      border-radius: 8px;
      border: 1px solid #FFEDCA;
      padding: 9px 12px;
      display: flex;
      justify-content: space-between;
      .service-order-card-left{
        font-weight: 500;
        font-size: 12px;
        color: #292C33;
        line-height: 24px;
        .service-order-card-left-file{
          display: flex;
          align-items: center;
        }
        .service-order-card-left-icon{
          margin-right: 4px;
        }
      }
      .service-order-card-right{
        font-weight: 500;
        font-size: 12px;
        color: #FF7113;
        line-height: 22px;
        cursor: pointer;
        .service-order-card-right-line{
          color:#FA914B;
          margin: 0 9px;
        }
      }

    }
  }
  .service-order-bank-con{
    margin-top: 12px;
    margin-bottom: 12px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    .service-order-bank-left{
      box-sizing: border-box;
      width: 293px;
      border-radius: 8px;
      border: 1px solid #EDEFF2;
      padding: 15px 12px;
      font-size: 12px;
      line-height: 22px;
      .service-order-bank-item{
        display: flex;
        align-content: center;
        margin-bottom: 4px;
        .service-order-bank-item-label{
          width: 48px;
          margin-right: 8px;
        }
        .service-order-bank-item-value{
          font-weight: bold;
          color:#292C33;
          font-weight: bold;
        }
        .orange-color{
          color: #FF7113;

        }
        .service-order-bank-item-copy{
          flex: 1;
          text-align: right;
          cursor: pointer
        }

      }
    }
    .service-order-bank-right{
      width: 182px;
      height: 160px;
      border-radius: 8px;
      border: 1px solid #EDEFF2;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      text-align: center;
      color: #00B4C4;
      font-size: 12px;
      .service-order-bank-right-img{
        position: relative;
        width: 182px;
        height: 160px;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center center;
        .service-order-bank-right-img-reupload{
          height:  22px;
          line-height: 22px;
          text-align: center;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.6);
          border-radius: 0px 0px 8px 8px;
          backdrop-filter: blur(2px);
          color: #FFFFFF;
        }
      }
    }

  }
  .service-order-content{
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    .service-order-content-left{
      width: 526px;

      .service-order-top-content{
        padding-left: 18px;
        padding-bottom: 11px;
        padding-top: 5px;
        .service-order-top-title{
          font-weight: bold;
          font-size: 24px;
          color: #007580;
          line-height: 27px;
          margin-bottom: 7px;
        }
        .order-number-con{

        }
        .order-number{
          font-weight: 500;
          font-size: 12px;
          color: #007580;
          line-height: 22px;
        }
        .order-number-copy{
          font-weight: 500;
          font-size: 12px;
          color: #00B4C4;
          line-height: 22px;
          margin-left: 8px;
          cursor: pointer;
          cursor: pointer;
        }
      }
    }
    .service-order-content-right{
      width: 288px;
      .service-order-right-icon{
        text-align: center;
        height: 72px;
        overflow: hidden;
        img{

        }
      }
      .service-order-right-content{
        background: #FFFFFF;
        border-radius: 16px;
        padding: 12px;
        .service-order-right-title{
          text-align: center;
          font-size: 14px;
          color: #292C33;
          line-height: 22px;
          padding-top: 20px;
        }
        .service-order-right-amount{
          color: #FF6600;
          text-align: center;
          margin-bottom: 4px;

          .currency{
            font-size: 12px;
          }
          .amount{
            line-height: 48px;
            font-size: 30px;
            font-weight: bold;
          }
        }
        .cancel-order-con{
          text-align: center;
        }
        .cancel-order{
          display:inline-block;
          width: 72px;
          height: 22px;
          border-radius: 11px;
          border: 1px solid #00B4C4;
          line-height: 22px;
          text-align: center;
          color: #00B4C4;
          cursor: pointer;
          font-size: 12px;
        }
        .order-details {
          padding-top: 6px;
          margin-bottom: 16px;

          h3 {
            font-size: 16px;
            margin-bottom: 12px;
            color: #111827;
            line-height: 27px;
          }

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
            .order-details-terms-con{
              margin-top: 8px;
            }
            .terms {
              display: block;
              color: #00B4C4;
              text-decoration: none;
              font-size: 12px;

              &:hover {
                text-decoration: underline;
              }
            }

        }
      }
    }
    &.service-order-content-finish{
      .service-service-order-panel{
        .service-order-card{
          background: #FCFCFC;
          border: 1px solid #EDEDED;
          .service-order-card-right{
            color: #919499
          }
        }
      }
      .service-order-bank-left{
        color: #919499;
        .service-order-bank-item-value{
          color: #919499;
        }
        .service-order-bank-item-copy{
          display: none;
        }
      }
      .service-order-content-right{
        .service-order-right-content {
          .service-order-right-amount{
            color: #919499;
          }
          .terms{
            color: #919499;
          }
        }
      }
    }
  }
  .service-order-right-bottom{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F2FCFB;
    border-radius: 8px;
    padding: 8px;
    margin-top: 30px;
    .service-order-right-bottom-icon-img{
      width: 82px;
      height: 82px;
      margin-right: 8px;
    }
    .service-order-right-bottom-right{
      flex: 1;
    }
    .service-order-right-bottom-title{
      font-weight: 500;
      font-size: 14px;
      color: #111827;
      line-height: 27px;
    }
    .service-order-right-bottom-text{
      font-size: 12px;
      color: #00B4C4;
      line-height: 22px;
    }
  }
}
</style>
