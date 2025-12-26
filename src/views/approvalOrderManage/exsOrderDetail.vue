<template>
  <div class="JNPF-common-layout">
    <div class="content">
      <div style="margin-top: 9px">
        <div class="title" style="margin-right: auto">{{ title }}</div>
      </div>
      <el-tabs class="JNPF-el_tabs">
        <el-tab-pane label="表单信息">
          <div class="row-flex">
            <div class="sub-title">报销单页</div>
            <!-- 企业管理员可以重置审批通过的单子签名 -->
            <el-button v-if="isEntAdmin && detailData && detailData.status === 3" type="primary" style="margin-bottom: 12px" @click="resetSign">重置签名</el-button>
          </div>
          <div class="size4-card row-column flex-center" v-for="item in dataList" :key="item.id">
            <h4 style="margin-bottom: 10px;cursor: pointer;" @click="showTemplateDetail(item)">{{ item.title }}</h4>
            <el-image v-if="item.url" class="small" :src="item.url" :preview-src-list="[item.url]" />
          </div>
          <div class="size4-card row-column flex-center" style="text-align: center;" v-if="receipts && receipts.length > 0">
            <h4 style="margin-bottom: 10px">结算信息票据附件</h4>
            <el-image v-for="(item,index) in receipts" :key="index" style="max-width: 297mm" :src="item.fidUrl" :preview-src-list="[item.fidUrl]" />
          </div>
          <div class="row-flex" v-if="applyDataList && applyDataList.length > 0">
            <div class="sub-title">关联审批单</div>
          </div>
          <div class="size4-card row-flex flex-center flex-wrap" v-if="applyDataList && applyDataList.length > 0">
            <el-image class="small" v-for="item in applyDataList" :key="item.id" :src="item.url" :preview-src-list="[item.url]" />
          </div>
          <div class="row-flex" v-if="exsOrderList && exsOrderList.length > 0">
            <div class="sub-title">关联请款单</div>
          </div>
          <div class="size4-card row-flex flex-center flex-wrap" v-if="exsOrderList && exsOrderList.length > 0">
            <el-image class="small" v-for="item in exsOrderList" :key="item.id" :src="item.url" :preview-src-list="[item.url]" />
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
          <div v-if="pictureList.length > 0 || relevantPdf.length > 0 || payCertificateList.length > 0 || invoiceList.length > 0">
            <div class="row-flex" v-if="pictureList.length > 0 || relevantPdf.length > 0">
              <div class="sub-title">相关资料</div>
            </div>
            <div class="size2-card" v-for="item in pictureList" :key="item.index" @click="previewImg(item.src)">
              <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/DF/CqDIlGVMpq2AR05ZAAACul9brhY625.png">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-button" style="margin-left: auto">查看</div>
            </div>
            <div class="size2-card" v-for="item in relevantPdf" :key="item.index" @click="previewOther(item)">
              <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/E1/CqDIk2VMpqWAUX0gAAADkvrIDd0808.png">
              <div class="item-title">{{ item.name }}</div>
              <div class="item-button" style="margin-left: auto">查看</div>
            </div>
            <div class="row-flex" v-if="payCertificateList && payCertificateList.length > 0">
              <div class="sub-title">银行付款证明</div>
            </div>
            <div class="statistic-card size2-card" v-for="item in payCertificateList" :key="item.src" @click="previewFile(item)">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-button" style="margin-left: auto">查看</div>
            </div>
            <div class="row-flex" v-if="invoiceList && invoiceList.length > 0">
              <div class="sub-title">发票</div>
            </div>
            <div class="size3-card" v-for="item in invoiceList" :key="item.id">
              <embed v-if="item.previewOnlineUrl" style="width: 66%;margin-right: 10px;" :src="item.previewOnlineUrl">
              <el-image v-else style="width: 66%;margin-right: 10px;" :src="item.src" :preview-src-list="[item.src]" />
              <div class="invoice-bar black-bar">
                <div>{{ item.title }}</div>
                <div v-if="item.previewOnlineUrl" style="cursor: pointer" @click="previewOther(item)">点击放大查看</div>
              </div>
              <el-image style="flex: 1" v-if="item.checkSrc" fit="cover" :src="item.checkSrc" :preview-src-list="[item.checkSrc]" />
              <div class="check-bar black-bar">
                <div>{{ item.title }}查验</div>
              </div>
            </div>
          </div>
          <div v-else>暂无附件</div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
    <HtmlDetailDialog :loading="htmlDetail.loading" :visible.sync="htmlDetail.visible" :html="htmlDetail.data" />
  </div>
</template>

<script>
import baseMixin from '@/mixins/print/baseMixin'
import recordList from "@/views/workFlow/components/RecordList.vue";
import { APIPostRebuildSignSealRecord, FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
import { downloadFile } from "@/api/business/signature";
import previewOnline from "@/components/preview-online/index.vue";
import { additionPrintListByOrder } from "@/api/business/businessApproval";
import { getOtherOrdersDetail } from "@/api/business/expenseAccount";
import { getInvoiceDetail } from "@/api/business/pasteTicket";
import { parseJsonObj } from "@/components/Cicada/printHelper";
import HtmlDetailDialog from "@/views/expenseAccountManage/components/HtmlDetailDialog.vue";
import { mapGetters } from "vuex";
export default {
  components: { HtmlDetailDialog, previewOnline, recordList },
  mixins: [baseMixin],
  data() {
    return {
      orderId: "", // 订单id,
      title: "",
      // 所有模板列表，dataList中，id为模版id；title为要展示区域的标题；
      dataList: [],
      detailData: {}, // 报销单详情数据
      applyFidsList: [], // 所有报销单关联的审批单的附件
      statisticData: {}, // 税额统计数据
      applyDataList: [], // 申请模版列表
      exsOrderList: [], // 关联请款单列表
      invoiceDataList: [], // 电子发票模版
      receipts: [], // 结算单附件图片
      payCertificateList: [],
      invoiceList: [], // 发票图片列表，其中有电子发票的，可以下载
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
    async loadPageData() {
      this.loading = true;
      try {
        this.getFlowInfo();
        await this.getExsOrderDetail();
        await this.getOtherTemplate();
        await this.getApplyOrderDetail();
        await this.loadExsOrderTemplate();
        this.getInvoiceDetail();
        this.getCertificateList();
        this.updateRelevantList(); // 获取申请附件和相关资料，并加载数据
      } finally {
        this.loading = false;
      }
    },
    resetPageData() {
      this.dataList = [];
      this.detailData = {};
      this.applyFidsList = [];
      this.statisticData = {};
      this.applyDataList = [];
      this.exsOrderList = [];
      this.invoiceDataList = [];
      this.receipts = [];
      this.payCertificateList = [];
      this.invoiceList = [];
      this.flowTaskOperatorRecordList = [];
      this.pictureList = [];
      this.relevantPdf = [];
    },
    // 请求报销单详情接口，获取报销单模板id，发票id，申请单id，申请单附件文件，报销单附件文件（全部初始数据处理）
    async getExsOrderDetail() {
      await FlowBeforeInfo(this.orderId).then(async res => {
        this.detailData = res.data.formData;
        let data = res.data.formData;
        if (data.basePrintdevId) {
          // 主打印信息
          this.dataList.push({ formId: this.orderId, templateId: data.basePrintdevId, orderType: data.orderType, panelId: "0", title: "标准模版" })
        }
        // 其它打印模板(多个)
        const templateArr = await this.loadOtherTemplateList({ token: this.$store.getters.token, additionType: 0, formId: this.orderId });
        if (templateArr && templateArr.length > 0) {
          // 其它打印信息(多个)
          const otherPrintInfoArr = (templateArr || []).map(vv => ({ formId: this.orderId, templateId: vv.basePrintdevId, orderType: data.orderType, panelId: vv.id, title: vv.name }));
          if (otherPrintInfoArr && otherPrintInfoArr.length > 0) {
            this.dataList.push(...otherPrintInfoArr)
          }
        }
        // 特殊情况说明打印模板，跟表单字段有关联，需要判断是否展示
        this.dataList = this.dataList.filter(v => v.title !== "特殊情况说明" || (v.title === "特殊情况说明" && data.detailJson && !!JSON.parse(data.detailJson).specialSituationInfo));
        // 把dataList中的模版生成图片
        for (const v of this.dataList) {
          const result = await this.templateToImageDirectly(v.templateId, v.formId, v.orderType, v.panelId === "0" ? "" : v.panelId);
          v.url = result.url;
          v.src = result.src;
          v.html = result.html;
        }
        // 从详情获取订单类型
        this.orderType = data.orderType;
        // 从详情获取订单名称
        this.title = data.name;
        // // 把发票id合集处理后，放入发票列表
        // if (data.invoiceIds) {
        //   this.invoiceList = data.invoiceIds.split(",").map((v1, index) => ({ id: v1, title: "发票" + (index + 1), src: "", checkSrc: "", url: "", previewOnlineUrl: "", xmlUrl: "", name: "", xmlName: "", isElectronicInvoice: 0 }));
        // }
        // 把申请单id合集处理后，放入模板列表
        if (data.applyOrderIds) {
          const applyList = data.applyOrderIds.split(",").map((v1, index) => ({ id: index, url: "", src: "", orderId: v1 }));
          this.applyDataList.push(...applyList);
        }
        // 把请款单id合集处理后，放入模板列表
        if (data.exsOrderIds) {
          const paymentList = data.exsOrderIds.split(",").map((v1, index) => ({ id: index, url: "", src: "", orderId: v1 }));
          this.exsOrderList.push(...paymentList);
        }
        // 结算信息里面上传的单据照片
        this.receipts = []
        const detailJson = this.detailData.detailJson;
        if (detailJson) {
          const detail = JSON.parse(detailJson);
          if (detail && detail.bankFids) {
            this.receipts = await this.loadReceipts(detail.bankFids);
          }
        }
      });
    },
    // 获取报销模版中的-发票模版
    async getOtherTemplate() {
      // 发票类
      await additionPrintListByOrder({ orderId: this.orderId, additionType: 1 }).then(res => {
        res.data.forEach(v => {
          this.invoiceDataList.push({ formId: this.orderId, templateId: v.basePrintdevId, orderType: this.orderType, panelId: v.id, title: v.name })
        });
      });
    },
    // 申请单详情，获取申请单模板id
    async getApplyOrderDetail() {
      const orderIds = this.applyDataList.map(v => v.orderId);
      this.applyFidsList = [];
      await getOtherOrdersDetail(orderIds).then(async res => {
        for (const v of res.data) {
          // 处理一下申请单中的附件
          if (v.applyFids) {
            this.applyFidsList.push(...v.applyFids.split(","));
          }
          // 直接使用模板id生成模板图片
          const item = this.applyDataList[this.applyDataList.findIndex(v1 => v1.orderId === v.id)];
          const result = await this.templateToImageDirectly(v.basePrintdevId, v.id, v.orderType);
          item.url = result.url;
          item.src = result.src;
          item.title = v.name;
        }
      });
    },
    // 报销单详情，生成对应模板
    async loadExsOrderTemplate() {
      for (const v of this.exsOrderList) {
        const res = await this.loadFormDetail({ formId: v.orderId });
        // 直接使用模板id生成模板图片
        const result = await this.templateToImageDirectly(res.formData.basePrintdevId, v.orderId, res.formData.orderType);
        v.url = result.url;
        v.src = result.src;
        v.title = res.formData.name;
      }
    },
    // 请求发票详情接口-获取发票和查验，并下载获取url
    getInvoiceDetail() {
      if (this.detailData.invoiceIds) {
        this.invoiceList = this.detailData.invoiceIds.split(",").map((v1, index) => ({
          id: v1,
          title: "发票" + (index + 1),
          src: "",
          checkSrc: "",
          url: "",
          xmlUrl: "",
          name: "",
          xmlName: "",
          isElectronicInvoice: 0,
          previewOnlineUrl: ""
        }));
      }
      this.invoiceList.forEach(v => {
        getInvoiceDetail(v.id).then(async res => {
          if (res.data) {
            // 下载发票src
            const sourceInvoice = (await downloadFile(res.data.entity.handleFid ? res.data.entity.handleFid : res.data.entity.fid)).data;
            if (["jpg", "png", "jpeg"].includes(sourceInvoice.fileExtension)) {
              v.src = sourceInvoice.url;
            }
            // 下载查验发票
            if (res.data.entity.chectFid) {
              downloadFile(res.data.entity.chectFid).then(res3 => {
                v.checkSrc = res3.data.url;
              });
            }
            // 下载发票的xml文件
            if (res.data.entity.xmlFid) {
              downloadFile(res.data.entity.xmlFid).then(res3 => {
                v.xmlUrl = res3.data.url;
                v.xmlName = res3.data.name;
              });
            }
            // 查看是否有电子发票原件，有的话塞成url
            if (!["jpg", "png", "jpeg"].includes(sourceInvoice.fileExtension)) {
              v.isElectronicInvoice = 1;
              // url就是pdf，name是下载文件的名字
              v.url = sourceInvoice.url;
              v.name = sourceInvoice.name;
              // 有了电子发票，存一份kkfile预览的url
              v.previewOnlineUrl = await this.loadPreviewUrl({ fileDownloadUrl: v.url });
              // 是电子发票的，直接套打并生成图片
              if (this.invoiceDataList.length > 0) {
                const result = await this.templateToImageDirectly(this.invoiceDataList[0].templateId, this.invoiceDataList[0].formId, this.invoiceDataList[0].orderType, this.invoiceDataList[0].panelId, v.src);
                // 生成套打发票图片后，直接替换上面发票的图片
                v.src = result.url;
              }
            }
          }
        });
      });
    },
    // 查询银行付款证明
    async getCertificateList() {
      if (this.detailData.paymentOrderFid) {
        const list = this.detailData.paymentOrderFid.split(",").map(v => ({ id: v })) || [];
        await this.downloadFromId(list);
        this.payCertificateList = list;
      }
    },
    // 下载传入列表中v的所有id，并塞入url
    async downloadFromId(picList) {
      for (const v of picList) {
        if (v.id) {
          await downloadFile(v.id).then(res => {
            v.src = res.data.url;
            v.title = res.data.name;
            v.fileType = res.data.fileExtension;
          })
            .catch((error) => {
              console.log(error);
            });
        }
      }
    },
    // 重新加载相关资料列表
    updateRelevantList() {
      this.relevantInfoList = [];
      // 合同和呈批签
      const { contractFids, submitSignFids } = parseJsonObj(this.detailData.detailJson)
      if (contractFids) {
        this.relevantInfoList.push(...(contractFids.split(",").map((v1) => ({ id: v1, title: "" }))));
      }
      if (submitSignFids) {
        this.relevantInfoList.push(...(submitSignFids.split(",").map((v1) => ({ id: v1, title: "" }))));
      }
      // 申请单附件
      if (this.detailData.applyOrderFids) {
        this.relevantInfoList.push(...(this.detailData.applyOrderFids.split(",").map((v1) => ({ id: v1, title: "" }))));
      }
      // 报销单附件
      if (this.detailData.exsFids) {
        this.relevantInfoList.push(...(this.detailData.exsFids.split(",").map((v1) => ({ id: v1, title: "" }))));
      }
      // 申请单新增了一个佐证材料，一起放到相关资料中展示
      // applyFidsList是在请求申请单详情时，赋值的
      if (this.applyFidsList.length > 0) {
        const list = this.applyFidsList.map((v1) => ({ id: v1, title: "" }));
        this.relevantInfoList.push(...list);
      }
      this.downloadAndJudge(this.relevantInfoList);
    },
    // 下载文件id后，再判断是什么类型的文件，图片塞入图片列表，非图片塞入对应列表
    downloadAndJudge(list) {
      // let index = 1; // 相关资料图片序号
      this.pictureList = [];
      this.relevantPdf = [];
      list.forEach(v => {
        downloadFile(v.id).then(res => {
          if (["jpg", "png", "jpeg"].includes(res.data.fileExtension)) {
            this.pictureList.push({ id: v.id, title: res.data.name, src: res.data.url });
            // index += 1;
          } else {
            this.relevantPdf.push({ id: v.id, name: res.data.name, url: res.data.url });
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
    async showTemplateDetail(v) {
      Object.assign(this.htmlDetail, { visible: true, loading: true, data: '' })
      const html = await this.templateToHtmlWithoutSign(v.templateId, v.formId, v.orderType, v.panelId === "0" ? "" : v.panelId)
      Object.assign(this.htmlDetail, { visible: true, loading: false, data: html })
    },
    // 预览图片或其他在线文件
    previewFile(item) {
      if (["jpg", "png", "jpeg"].includes(item.fileType)) {
        this.previewImg(item.src);
      } else {
        // 不是图片的要调在线预览接口，获取在线预览url
        this.previewOther(item);
      }
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
    flex: 1;
    height: 22px;
    font-size: 16px;
    line-height: 22px;
    font-weight: bold;
    margin: 10px 0;
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
  .flex-wrap {
    flex-wrap: wrap;
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
  .size3-card {
    height: 268px;
    background: #F4F6FA;
    border-radius: 12px;
    width: max(calc(70% - 5px), 180px);
    min-width: 300px;
    display: flex;
    margin-bottom: 12px;
    padding: 10px;
    position: relative;
    font-size: 12px;
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
    justify-content: space-between;
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
