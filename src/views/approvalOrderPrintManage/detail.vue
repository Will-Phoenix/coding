<template>
  <div class="JNPF-common-layout">
    <div class="content">
      <el-card class="size1">
        <div style="margin-top: 9px">
          <div class="title" style="margin-right: auto">{{ applyInfo.name }}</div>
          <div class="row-flex mb-20">
            <div>申请人：{{ applyInfo.applyUserName }} </div>
            <div class="ml-100">审批单类型：{{ applyInfo.applyTypeCn }} </div>
          </div>
          <div class="row-flex mb-20">
            <div>申请时间：{{ applyInfo.applyDate }}</div>
          </div>
        </div>
        <div class="size4-card row-flex flex-center">
          <el-image class="small" v-if="applyTemplateInfo.url" :src="applyTemplateInfo.url" :preview-src-list="[applyTemplateInfo.url]" />
          <i v-else class="el-icon-loading"></i>
        </div>
      </el-card>
      <div class="bottom-bar">
        <el-button type="primary" :loading="btnLoading" @click="genPDFNew()">
          直接打印
        </el-button>
        <el-button type="primary" :loading="btnLoading" @click="downloadAll()">
          下载原件
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getApplyOrder
} from "@/api/business/expenseAccount";
import { saveAs } from "file-saver";
import JSZip from 'jszip'
import previewOnline from "@/components/preview-online/index";
import baseMixin from '@/mixins/print/baseMixin'
import HtmlDetailDialog from '@/views/expenseAccountManage/components/HtmlDetailDialog'
import { imgToMergedFormatPdf, mergePdf } from "@/utils/pdf";

export default {
  components: { HtmlDetailDialog, previewOnline },
  mixins: [baseMixin],
  data() {
    return {
      applyInfo: {},
      applyTemplateInfo: {},
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
      htmlDetail: {
        visible: false,
        loading: false,
        data: ''
      },
      orderId: "", // 订单id,
      loading: false,
      btnLoading: false, // 批量下载按钮
    }
  },
  created() {
    this.orderId = this.$route.query.id;
    if (this.orderId) {
      this.loadPageData();
    }
  },
  methods: {
    downloadAll() {
      this.btnLoading = true;
      this.__downloadAll().catch(e => {
        // 提示下载失败
      }).finally(() => {
        this.btnLoading = false;
      })
    },
    // 下载所有文件
    async __downloadAll() {
      // 需要下载的文件或图片列表
      const downloadList = await this.__genDownloadList(false);
      // 放入zip并下载
      const zip = new JSZip();
      downloadList.forEach(v => {
        zip.file(v.name, v.blob, { binary: true });
      });
      const blob = await zip.generateAsync({
        type: 'blob',
        // Available compression methods are STORE (no compression) and DEFLATE.
        compression: 'DEFLATE',
        compressionOptions: {
          // you can give the compression level with compressionOptions : {level:6} (or any level between 1 (best speed) and 9 (best compression))
          level: 1
        },
        mimeType: 'application/zip'
      });
      saveAs(blob, "审批单文件压缩包.zip");
      this.$message.success("下载中，请在浏览器下载列表中查看");
    },
    async __genDownloadList(onlyImg = true) {
      // 需要下载的文件或图片列表
      const downloadList = [];
      // 申请单模版图片塞入downloadList
      if (this.applyTemplateInfo.src) {
        downloadList.push({ name: this.applyTemplateInfo.title + '.png', blob: this.applyTemplateInfo.src });
      }
      this.checkSameFilename(downloadList);
      return downloadList
    },
    checkSameFilename(fileList) {
      // 同名文件检查，发现同名的重命名
      // fileList为一组{name: xx, blob: xx}对象的数据
      let differentFile = {};
      fileList.forEach(v => {
        if (!differentFile[v.name]) {
          differentFile[v.name] = 1;
        } else {
          differentFile[v.name]++;
          v.name = v.name.slice(0, v.name.lastIndexOf(".")) + `(${differentFile[v.name]})` + v.name.slice(v.name.lastIndexOf("."));
        }
      });
      console.log("不同文件及数量", differentFile)
    },
    // 新的打印要求，调用新写的方法
    async genPDFNew() {
      this.btnLoading = true;
      await this.printALl();
      this.btnLoading = false;
    },
    async printALl() {
      // 图片数组，存放需要转化成pdf的图片
      const imgList = [];
      const pdfList = [];
      // 审批单模板
      if (this.applyTemplateInfo.src) {
        imgList.push(this.applyTemplateInfo.url);
      }
      pdfList.push(await imgToMergedFormatPdf(imgList));
      await mergePdf(pdfList);
    },
    // 重新加载整个页面的数据
    async loadPageData() {
      this.loading = true;
      try {
        await this.getApplyOrderDetail();
      } finally {
        this.loading = false;
      }
    },
    // 申请单详情，获取申请单模板id
    getApplyOrderDetail() {
      this.applyFidsList = [];
      this.loading = true;
      getApplyOrder(this.orderId).then(async res => {
        let data = res.data;
        this.applyInfo = data;
        const result = await this.templateToImageDirectly(data.basePrintdevId, data.id, data.orderType);
        this.loading = false;
        this.applyTemplateInfo = {
          url: result.url,
          src: result.src,
          title: data.name,
        }
      }).catch(() => {
        this.loading = false;
      });
    },
  }
}
</script>
<style lang="scss" scoped>
.content {
  flex: 1;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  padding-bottom: 60px;

  .bottom-bar {
    height: 60px;
    background: #FFFFFF;
    box-shadow: 0px -2px 10px 0px rgba(0, 0, 0, 0.1);
    position: fixed;
    bottom: 0;
    right: 0;
    left: 210px;
    display: flex;
    align-items: center;
    padding: 0 30px;
  }

  .content-flex {
    display: flex;

    .size1 {
        height: 217px;
        margin-bottom: 20px;
        overflow: auto;
      }
  }

  .align-right {
    text-align: right;
    margin: 10px 0;
  }
  .title {
    margin-bottom: 16px;
    font-size: 20px;
    font-weight: bold;
    color: #292C33;
  }
  .sub-title {
    height: 22px;
    font-size: 16px;
    line-height: 22px;
    font-weight: bold;
    margin-right: 15px;
  }
  .row-flex {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    .text-button {
      /*color: #00B4C4;*/
      font-size: 14px;
      margin-left: auto;
    }
  }
  .mb-20 {
    margin-bottom: 20px;
  }
  .ml-100 {
    margin-left: 100px;
  }
  .flex-center {
    justify-content: center;
  }
  .flex-between {
    justify-content: space-between;
  }
  .tag-fail {
    margin-right: 10px;
    background-color: #FA914B;
    border-color: #FA914B;
  }
  .tag-success {
    margin-right: 10px;
    background-color: #00B4C4;
    border-color: #00B4C4;
  }
  .tag-plain {
    margin-right: 10px;
    background-color: #F4FEFF;
    border-color: #00B4C4;
    color: #00B4C4;
  }
  .statistic-card {
    background: #F9FBFF;
    border-radius: 8px;
    text-align: center;
    padding: 0 20px;

    .statistic-title {
      height: 20px;
      line-height: 20px;
    }
    .statistic-data-size {
      font-size: 24px;
      font-weight: bold;
      margin-top: 3px;
      height: 33px;
      line-height: 33px;
    }
    .color1 {
      color: #FA914B;
    }
    .color2 {
      color: #00B4C4;
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
  .size1-card {
      height: 75px;
      margin-right: 13px;
      padding-top: 10px;
      flex: 1;
    }
  .size2-card {
      width: max(calc(50% - 5px), 180px);
      height: 56px;
      margin-right: 10px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
    }
  .size2-card:nth-child(even) {
    margin-right: 0;
  }
  .size3-card {
    height: 268px;
    background: #F4F6FA;
    border-radius: 12px;
    width: 100%;
    display: flex;
    margin-bottom: 12px;
    padding: 10px;
    position: relative;
    font-size: 12px;
  }
  .size4-card {
    height: 405px;
    margin-bottom: 10px;
    background: #F4F6FA;
    border-radius: 12px;
    width: 100%;
    padding: 20px;

    .small {
      height: 365px;
      width: auto;
      margin-right: 2%;
      margin-bottom: 10px;
      background: #FFFFFF;
      border-radius: 12px;
      border: 1px solid #EAEEF5;
    }
  }

  ::v-deep .el-card__body {
    padding-bottom: 0;
  }
  ::v-deep .el-upload--picture-card {
    width: 100%;
    height: 124px;
    line-height: 124px;
  }
  .template-block {
    overflow: auto;
  }
  .black-bar {
    background: rgba(41,44,51,0.6);
    border-radius: 0 0 12px 12px;
    position: absolute;
    bottom: 10px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    color: #FFFFFF;
  }
  .invoice-bar {
    height: 39px;
    width: calc((100% - 20px) * 0.66);
  }
  .check-bar {
    height: 39px;
    width: calc((100% - 20px) * 0.34 - 10px);
    left: calc((100% - 20px) * 0.66 + 20px);
  }
  .icon {
    width: 20px;
    height: 20px;
    margin-right: 3px;
    margin-bottom: 3px;
  }
}
</style>
