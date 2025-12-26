<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-upload
      :action="actionUrl"
      :file-list="fileList"
      :headers="uploadHeaders"
      :on-success="handleSuccess"
      :on-progress="handleProgress"
      :on-preview="handlePreview"
      :on-exceed="handleExceed"
      :on-remove="handleRemove"
      :disabled="readonly"
      :limit="limit"
      :multiple="limit > 1"
    >
      <el-button size="small" type="primary" :loading="buttonLoading">{{ placeholder }}</el-button>
    </el-upload>
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import { downloadFile, downloadFileBatch } from "@/api/business/signature";
import previewOnline from "@/components/preview-online/index";

export default {
  name: 'Attachment',
  components: { previewOnline },
  mixins: [ComMixin],
  data() {
    return {
      fileList: [],
      buttonLoading: false,
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: ""
      }
    }
  },
  computed: {

  },
  watch: {
    fileList(n) {
      this.moduleValue = n.map(v => v.id).join(",");
      // 设置隐藏字段
      this.updateHiddenFields({
        attachmentName: n.map(v => v.name).join(",")
      });
    }
  },
  mounted() {
    if (this.moduleValue) {
      downloadFileBatch(this.moduleValue).then(res => {
        this.fileList = [...res.data];
      });
    }
  },
  methods: {
    handleProgress() {
      this.buttonLoading = true;
    },
    handlePreview(file) {
      console.log("预览的File:", file);
      if (["jpg", "jpeg", "png"].includes(file.fileExtension)) {
        this.$hevueImgPreview(file.url);
      } else {
        Object.assign(this.preview, { visible: true, fileUrl: file.url, fileTitle: file.name });
      }
    },
    handleSuccess(response, file, fileList) {
      // console.log("上传成功的response:", response);
      console.log("上传成功的fileList:", fileList);
      try {
        downloadFile(response.data.id).then(res => {
          this.fileList.push({ name: file.name, url: res.data.url, fileExtension: res.data.fileExtension, id: response.data.id });
          console.log("fileList:", this.fileList);
        });
      } finally {
        this.buttonLoading = false;
      }
    },
    handleExceed() {
      this.$message.warning("上传文件超过数量限制");
    },
    handleRemove(file, fileList) {
      console.log("删除后的fileList:", fileList);
      this.fileList = fileList;
    }
  }
}
</script>
