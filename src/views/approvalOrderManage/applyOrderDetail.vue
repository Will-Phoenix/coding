<template>
  <div class="JNPF-common-layout">
    <div class="content">
      <div style="margin-top: 9px">
        <div class="title" style="margin-right: auto">{{ applyInfo.name }}</div>
      </div>
      <el-tabs class="JNPF-el_tabs">
        <el-tab-pane label="表单信息">
          <!-- 企业管理员可以重置审批通过的单子签名 -->
          <el-button v-if="isEntAdmin && applyInfo && applyInfo.status === 3" type="primary" style="margin-bottom: 12px" @click="resetSign">重置签名</el-button>
          <div class="size4-card row-column flex-center">
            <el-image class="small" v-if="applyTemplateInfo.url" :src="applyTemplateInfo.url" :preview-src-list="[applyTemplateInfo.url]" />
            <i v-else class="el-icon-loading" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="流转记录">
          <recordList
            :list="flowTaskOperatorRecordList"
            :end-time="endTime"
            :flow-id="setting.flowId"
            :op-type="setting.opType"
          />
        </el-tab-pane>
        <el-tab-pane label="审批单附件">
          <div v-if="pictureList.length > 0 || relevantPdf.length > 0">
            <div class="statistic-card size2-card" v-for="item in pictureList" :key="item.index" @click="previewImg(item.src)">
              <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/DF/CqDIlGVMpq2AR05ZAAACul9brhY625.png">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-button" style="margin-left: auto">查看</div>
            </div>
            <div class="statistic-card size2-card" v-for="item in relevantPdf" :key="item.index" @click="previewOther(item)">
              <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/E1/CqDIk2VMpqWAUX0gAAADkvrIDd0808.png">
              <div class="item-title">{{ item.name }}</div>
              <div class="item-button" style="margin-left: auto">查看</div>
            </div>
          </div>
          <div v-else>暂无附件</div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </div>
</template>

<script>
import {
  getApplyOrder
} from "@/api/business/expenseAccount";
import baseMixin from '@/mixins/print/baseMixin'
import recordList from "@/views/workFlow/components/RecordList.vue";
import { APIPostRebuildSignSealRecord, FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
import { downloadFile } from "@/api/business/signature";
import previewOnline from "@/components/preview-online/index.vue";
import { mapGetters } from "vuex";

export default {
  components: { previewOnline, recordList },
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
      flowTaskOperatorRecordList: [],
      endTime: 0,
      setting: {
        opType: 0,
        flowId: '',
      },
      pictureList: [], // 其他图片列表
      relevantPdf: [], // 相关资料中的非图片
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isEntAdmin() {
      return this.userInfo && this.userInfo.roleCodes && this.userInfo.roleCodes.indexOf('entAdmin') > -1
    }
  },
  created() {
    this.orderId = this.$route.query.id;
    if (this.orderId) {
      this.loadPageData();
    }
  },
  methods: {
    // 重新加载整个页面的数据
    loadPageData() {
      this.getApplyOrderDetail();
      this.getFlowInfo();
    },
    resetPageData() {
      this.applyTemplateInfo = {};
      this.flowTaskOperatorRecordList = [];
      this.pictureList = [];
      this.relevantPdf = [];
    },
    // 申请单详情，获取申请单模板id
    getApplyOrderDetail() {
      this.applyFidsList = [];
      this.loading = true;
      getApplyOrder(this.orderId).then(async res => {
        let data = res.data;
        this.applyInfo = data;
        // let detail = JSON.parse(res.data.detailJson);
        /* 当前改为只要是attachment组件的数据，都获取并加载
        // 统一为exsFids字段，老数据为attachmentUrl字段，兼容下
        if (detail && (detail.attachmentUrl || detail.exsFids)) {
          let fidsStr = detail.exsFids || detail.attachmentUrl;
          let fids = fidsStr.split(',');
          this.downloadAndJudge(fids);
        } */
        // 当前改为只要是attachment组件的数据，都获取并加载
        let fidS = await this.getAttachmentFiles({ formId: this.orderId });
        this.downloadAndJudge(fidS);
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
    // 下载文件id后，再判断是什么类型的文件，图片塞入图片列表，非图片塞入对应列表
    downloadAndJudge(list) {
      // let index = 1; // 相关资料图片序号
      this.pictureList = [];
      this.relevantPdf = [];
      list.forEach(v => {
        downloadFile(v).then(res => {
          if (["jpg", "png", "jpeg"].includes(res.data.fileExtension)) {
            this.pictureList.push({ id: v, title: res.data.name, src: res.data.url });
          } else {
            this.relevantPdf.push({ id: v, name: res.data.name, url: res.data.url });
          }
        });
      });
    },
    getFlowInfo() {
      FlowBeforeInfo(this.orderId).then(res => {
        this.flowTaskOperatorRecordList = res.data.flowTaskOperatorRecordList;
        this.setting.flowId = res.data.flowTaskInfo.flowId;
      });
    },
    // 预览图片
    previewImg(src) {
      this.$hevueImgPreview({
        url: src,
        clickMaskCLose: true,
      });
    },
    // 预览其他在线文件
    previewOther(item) {
      Object.assign(this.preview, { visible: true, fileUrl: item.src || item.url, fileTitle: item.title || item.name });
    },
    resetSign() {
      APIPostRebuildSignSealRecord({ orderId: this.orderId }).then(() => {
        this.$message.success("操作成功");
        this.resetPageData();
        this.loadPageData();
      });
    }
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
  padding: 20px;
  background-color: #ffffff;

  ::v-deep .el-tabs__nav-wrap::after {
    height: 0;
  }
  ::v-deep .JNPF-el_tabs .el-tabs__content {
    overflow: unset;
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
    flex-direction: column;
    .text-button {
      /*color: #00B4C4;*/
      font-size: 14px;
      margin-left: auto;
    }
  }
  .row-column {
    display: flex;
    flex-direction: column;
  }
  .mb-20 {
    margin-bottom: 20px;
  }
  .ml-100 {
    margin-left: 100px;
  }
  .flex-center {
    justify-content: center;
    align-items: center;
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
  .size2-card {
    width: max(calc(70% - 5px), 180px);
    height: 56px;
    background: #F4F6FA;
    padding: 10px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    cursor: pointer;
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
}
</style>
