<template>
  <el-dialog
    :title="typeInfo[type].title"
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
    <el-form ref="form" :model="formData" :rules="rules">
      <el-form-item :label="typeInfo[type].label" prop="fileId">
        <div v-if="formData.fileId">
          <span>{{ fileInfo.name }}</span>
          <span class="delete" @click="onDeleteFile">删除</span>
        </div>
        <el-upload
          v-else
          class="avatar-uploader"
          :action="actionUrl"
          :headers="uploadHeaders"
          :show-file-list="false"
          accept=".pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-progress="handleProgress"
          :disabled="uploading"
        >
          <i class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { postUploadAttachments } from "@/api/business/orderManagement";
import { downloadFile } from "@/api/business/signature";

export default {
  name: 'uploadOrderFile',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: Number,
      default: () => (0)
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
      formData: {
        fileId: ''
      },
      fileInfo: {
        id: '',
        name: '',
        url: '',
      },
      rules: {
        fileId: [{ required: true, message: '请上传文件' }]
      },
      typeInfo: [
        { title: '上传正式合同', label: '上传正式合同PDF文件', key: 'contractFid' },
        { title: '支付确认', label: '上传银行回款单', key: 'bankReceiptFid' },
        { title: '发票上传', label: '上传开票发票', key: 'invoiceFid' }
      ],
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      uploading: false,
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.uploading = false;
        const fileId = this.data[this.typeInfo[this.type].key];
        if (fileId) {
          this.formData.fileId = fileId
          this.loadFileInfo()
        } else {
          this.formData.fileId = '';
          this.fileInfo = {
            id: '',
            name: '',
            url: '',
          }
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    },
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          const params = { orderNo: this.data.orderNo }
          params[this.typeInfo[this.type].key] = this.formData.fileId;
          postUploadAttachments(params).then(() => {
            this.$message.success("操作成功");
            this.$emit('confirm');
            this.updateVisible(false);
          });
        }
      })
    },
    handleSuccess(response) {
      this.uploading = false;
      if (response.code == 200) {
        this.$message.success("上传成功");
        this.formData.fileId = response.data.id;
        this.loadFileInfo();
      } else {
        this.$message.error(response.msg);
      }
    },
    handleProgress() {
      this.uploading = true;
    },
    handleError(err) {
      this.uploading = false;
      this.$message.error(err);
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    loadFileInfo() {
      downloadFile(this.formData.fileId).then(res => {
        // url就是pdf，name是下载文件的名字
        this.fileInfo.url = res.data.url;
        this.fileInfo.name = res.data.name;
        this.fileInfo.id = this.formData.fileId;
      });
    },
    onDeleteFile() {
      this.formData.fileId = '';
      this.fileInfo = {
        id: '',
        name: '',
        url: '',
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.option-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .option-img {
    width: 32px;
    height: 32px;
  }
}
::v-deep .el-select-dropdown__item{
  height: 40px;
}
.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .row-img {
    width: 32px;
    height: 32px;
  }
}
::v-deep .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
::v-deep .avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.delete {
  color: red;
  padding: 0 20px;
  cursor: pointer;
}
</style>
