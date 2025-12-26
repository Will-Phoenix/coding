<template>
  <el-card class="page-preview-helper-file">
    <embed :src="previewUrl" style="width: 100%;height: 80vh">
  </el-card>
</template>
<script>
import { previewFileOnline } from "@/api/business/signature";

export default {
  name: 'previewHelperFile',
  data() {
    return {
      previewUrl: "", // 可以直接预览的url
      fileTitle: '操作手册',
      fileUrl: "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/6d21c507-4f08-4daa-bb2f-a56059ad0d3d.pdf",
    }
  },
  created() {
    previewFileOnline(this.fileUrl).then(res => {
      this.previewUrl = res.data;
    });
  }
}
</script>
<style scoped lang="scss">
.page-preview-helper-file {
  width: 100%;
  height: 100%;
}
</style>
