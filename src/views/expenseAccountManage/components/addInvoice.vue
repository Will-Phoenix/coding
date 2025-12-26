<template>
  <el-dialog
    title="添加新的发票"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div v-if="!invoiceId" class="container" v-loading="uploadLoading" element-loading-text="发票上传中，请稍等">
      <el-upload
        :action="actionUrl"
        :headers="uploadHeaders"
        list-type="picture-card"
        :show-file-list="false"
        :on-success="handleSuccess"
        :on-error="uploadError"
        :before-upload="beforeUpload"
        :limit="1"
        :file-list="fileList"
        accept=".pdf"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">点击上传或拖动文件至该区域<br><br>
          仅支持上传一个发票<br><br>
          仅支持PDF文件</div>
      </el-upload>
    </div>
    <div v-else class="container">
      <div><span>发票信息</span><el-button class="verify-info" type="text" style="font-size: 14px" @click="onVerify">发票查验</el-button></div>
      <div class="row-container" v-loading="verifyLoading" element-loading-text="发票查验中，请稍等">
        <div class="item">
          <div v-for="item in invoiceFile" :key="item.id">
            <el-image v-if="item.isImg" :src="item.url" class="img" :preview-src-list="[item.url]" />
            <div v-else class="file-item" @click="previewOther(item)">
              <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/E1/CqDIk2VMpqWAUX0gAAADkvrIDd0808.png" alt="">
              <div class="item-title">{{ item.name }}</div>
              <div class="item-button" style="margin-left: auto">查看</div>
            </div>
          </div>
        </div>
        <div class="item">
          <el-image class="img" v-show="verifyImg" fit="cover" :src="verifyImg" :preview-src-list="[verifyImg]" />
        </div>
      </div>
    </div>
    <div class="error" v-if="showInvoiceError || showVerifyError">
      <span v-if="showInvoiceError">报错提示：未能成功识别发票，部分票据（如深圳区块链票）暂不支持识别，可使用添加报销资料的方式进行添加。</span>
      <span v-if="showVerifyError">报错提示：该票据未能成功查验，若票据无误请等国家税总出结果后再上传（正常情况隔日即可查验）。</span>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </el-dialog>
</template>
<script>
import { getInvoiceDetail, verification } from "@/api/business/pasteTicket";
import { downloadFile } from "@/api/business/signature";
import { postExsOrderRelation } from "@/api/business/expenseAccount";
import previewOnline from "@/components/preview-online/index.vue";

export default {
  name: 'addInvoice',
  components: { previewOnline },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    orderId: {
      type: String,
      default: () => ('')
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      actionUrl: process.env.VUE_APP_BASE_API + "/api/cicada/CcdEntBillCenter/upload",
      uploadHeaders: { Authorization: this.$store.getters.token },
      showInvoiceError: false,
      showVerifyError: false,
      invoiceFile: [],
      verifyImg: '',
      invoiceId: '',
      uploadLoading: false,
      verifyLoading: false,
      fileList: [],
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.invoiceId = '';
        this.invoiceFile = [];
        this.showVerifyError = false;
        this.showInvoiceError = false;
        this.verifyImg = '';
        this.uploadLoading = false;
        this.verifyLoading = false;
      }
    }
  },
  methods: {
    onConfirm() {
      // 已查验成功的发票和报销单绑定
      if (this.invoiceId && this.invoiceFile && this.invoiceFile.length > 0 && this.verifyImg) {
        const params = {
          orderId: this.orderId,
          invoiceId: this.invoiceId,
        }
        postExsOrderRelation(params).then(() => {
          this.$emit('confirm');
          this.updateVisible(false);
        })
      } else {
        if (!this.invoiceId) {
          return this.$message({
            type: "error",
            message: '请上传发票！',
          });
        }
        return this.$message({
          type: "error",
          message: '请查验发票！',
        });
      }
    },
    // 新增发票
    handleSuccess(res) {
      this.uploadLoading = false;
      if (res.code == 200 && res.data.length > 0) {
        this.$message.success("发票上传成功");
        this.showInvoiceError = false;
        this.invoiceId = res.data[0];
        this.loadInvoiceInfo();
      } else {
        this.showInvoiceError = true;
        this.fileList = [];
      }
    },
    beforeUpload() {
      this.uploadLoading = true;
      return true
    },
    loadInvoiceInfo() {
      getInvoiceDetail(this.invoiceId).then(async res => {
        let fileIds = res.data.entity.fid ? res.data.entity.fid.split(',') : [];
        this.invoiceFile = []
        for (let i = 0; i < fileIds.length; i++) {
          await downloadFile(fileIds[i]).then(res2 => {
            this.invoiceFile.push(
              { id: fileIds[i], name: res2.data.name, url: res2.data.url, isImg: ["jpg", "png", "jpeg"].includes(res2.data.fileExtension) }
            )
          });
        }
        // 下载查验发票
        if (res.data.entity.chectFid) {
          downloadFile(res.data.entity.chectFid).then(res3 => {
            this.verifyImg = res3.data.url;
          });
        }
      })
    },
    // 导入文件失败后回调
    uploadError(err) {
      this.uploadLoading = false;
      this.fileList = [];
      this.$message({
        type: "error",
        message: err,
      });
    },
    onVerify() {
      if (this.verifyLoading) {
        return;
      }
      this.verifyLoading = true;
      verification(this.invoiceId).then(() => {
        this.verifyLoading = false;
        this.showVerifyError = false;
        this.$message.success("查验成功");
        this.loadInvoiceInfo();
      }).catch(() => {
        this.verifyLoading = false;
        this.showVerifyError = true;
      });
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    // 预览其他在线文件
    previewOther(item) {
      Object.assign(this.preview, { visible: true, fileUrl: item.src || item.url, fileTitle: item.title || item.name });
    },
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 300px;
  ::v-deep .el-upload-dragger .el-icon-upload {
    margin: 50px 0 20px 0;
  }
  ::v-deep .el-upload-dragger {
    width: 700px;
    height: 300px;
  }
  ::v-deep .el-upload--picture-card {
    line-height: 14px;
  }
  .verify-info {
    margin-left: 200px;
  }
}
.row-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  .item {
    width: calc((100% - 20px)/2);
    display: flex;
    flex-direction: column;
  }
  .file-item {
    width: max(calc(100% - 5px), 180px);
    height: 56px;
    background: #F4F6FA;
    padding: 10px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 8px;
    .icon {
      width: 20px;
      height: 20px;
      margin-right: 3px;
      margin-bottom: 3px;
    }
    .item-title {
      line-height: 20px;
      font-weight: bold;
      color: #292C33;
      word-break: break-all;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-button {
      word-break: keep-all;
      line-height: 20px;
      color: #00B4C4;
    }
  }
  .img {
    width: 100%;
    height: 300px;
    border: solid 1px #f6f6fa;
    border-radius: 8px;
  }
}
.error {
  margin-top: 20px;
  color: red;
}
</style>
