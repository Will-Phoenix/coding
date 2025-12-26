<template>
  <div class="JNPF-common-layout">
    <div class="content" v-loading="loading">
      <div class="content-flex">
        <div class="left">
          <el-card class="size1">
            <div class="row-flex" style="margin-top: 9px">
              <div class="title" style="margin-right: auto">{{ title }}</div>
            </div>
            <div class="row-flex" style="margin-bottom: 12px">
              <div class="statistic-card size1-card">
                <div class="statistic-title">专票税额</div>
                <p class="statistic-data-size color1">{{ statisticData.totalTax }}</p>
              </div>
              <div class="statistic-card size1-card">
                <div class="statistic-title">专票金额</div>
                <p class="statistic-data-size color1">{{ statisticData.totalFee }}</p>
              </div>
              <div class="statistic-card size1-card">
                <div class="statistic-title">价税合计</div>
                <p class="statistic-data-size color2">{{ statisticData.amountInFiguers }}</p>
              </div>
              <div class="statistic-card size1-card">
                <div class="statistic-title">附件总量</div>
                <p class="statistic-data-size">{{ statisticData.exsFileNum }}</p>
              </div>
            </div>
          </el-card>
          <el-card class="size2">
            <div slot="header" class="row-flex">
              <div class="sub-title">报销单页</div>
            </div>
            <div class="size4-card" style="text-align: center;" v-for="item in dataList" :key="item.id">
              <h4 style="margin-bottom: 10px;cursor: pointer;" @click="showTemplateDetail(item)">{{ item.title }}</h4>
              <el-image style="max-width: 297mm" :src="item.url" :preview-src-list="[item.url]" />
            </div>
            <div class="size4-card" style="text-align: center;" v-if="receipts && receipts.length > 0">
              <h4 style="margin-bottom: 10px">结算信息票据附件</h4>
              <el-image v-for="(item,index) in receipts" :key="index" style="max-width: 297mm" :src="item.fidUrl" :preview-src-list="[item.fidUrl]" />
            </div>
          </el-card>
          <el-card class="size3" v-if="applyDataList.length > 0">
            <div slot="header" class="row-flex">
              <div class="sub-title">关联审批单</div>
            </div>
            <div class="size4-card row-flex flex-center">
              <el-image class="small" v-for="item in applyDataList" :key="item.id" :src="item.url" :preview-src-list="[item.url]" />
            </div>
          </el-card>
          <el-card class="size3" v-if="exsOrderList.length > 0">
            <div slot="header" class="row-flex">
              <div class="sub-title">关联请款单</div>
            </div>
            <div class="size4-card row-flex flex-center">
              <el-image class="small" v-for="item in exsOrderList" :key="item.id" :src="item.url" :preview-src-list="[item.url]" />
            </div>
          </el-card>
          <el-card v-if="pictureList.length > 0 || relevantPdf.length > 0">
            <div slot="header" class="row-flex">
              <div class="sub-title">相关资料</div>
            </div>
            <div class="row-flex">
              <div class="statistic-card size2-card" v-for="(item, index) in pictureList" :key="item.index" @click="previewImg(item.src)">
                <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/DF/CqDIlGVMpq2AR05ZAAACul9brhY625.png">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-button" style="margin-left: auto">查看</div>
              </div>
              <div class="statistic-card size2-card" v-for="(item, index) in relevantPdf" :key="item.index" @click="previewOther(item)">
                <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/E1/CqDIk2VMpqWAUX0gAAADkvrIDd0808.png">
                <div class="item-title">{{ item.name }}</div>
                <div class="item-button" style="margin-left: auto">查看</div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="right">
          <el-card class="size4">
            <div slot="header" class="row-flex">
              <div class="sub-title">发票</div>
            </div>
            <div>
              <div class="size3-card" v-for="item in invoiceList" :key="item.id">
                <embed v-if="item.previewOnlineUrl" style="width: 66%;margin-right: 10px;" :src="item.previewOnlineUrl">
                <el-image v-else style="width: 66%;margin-right: 10px;" :src="item.src" :preview-src-list="[item.src]" />
                <div class="invoice-bar black-bar">
                  <div>{{ item.title }}</div>
                  <div v-if="item.previewOnlineUrl" style="cursor: pointer" @click="previewOther(item)">点击放大查看</div>
                  <div v-if="item.isElectronicInvoice === 1" @click="downloadSingleFile(item.title, item.url)" style="cursor: pointer;">发票原件下载</div>
                </div>
                <el-image style="flex: 1" v-if="item.checkSrc" fit="cover" :src="item.checkSrc" :preview-src-list="[item.checkSrc]" />
                <div class="check-bar black-bar">
                  <div>{{ item.title }}查验</div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
      </div>
      <div class="bottom-bar">
        <el-button type="primary" :loading="btnLoading" @click="openOptionalDialog()">
          批量打印
        </el-button>
        <!--        <el-button type="primary" :loading="btnLoading" @click="downloadAll()">-->
        <!--          批量下载原件-->
        <!--        </el-button>-->
        <template v-if="pageList.length > 0">
          <el-button style="margin-left: auto" type="primary" @click="goToNextOrLast(-1)">
            上一页
          </el-button>
          <el-button type="primary" @click="goToNextOrLast(1)">
            下一页
          </el-button>
        </template>
      </div>
    </div>
    <HtmlDetailDialog :loading="htmlDetail.loading" :visible.sync="htmlDetail.visible" :html="htmlDetail.data" />
    <optionalBatchPrint :visible.sync="optionalBatchPrint.visible" :data="optionalBatchPrint.data" :func="loadPreviewUrl" @confirm="confirmPrint" />
  </div>
</template>

<script>
import {
  getOtherOrdersDetail,
  ccdExsOrderTaxStatistic,
} from "@/api/business/expenseAccount";
import { additionPrintListByOrder } from "@/api/business/businessApproval";
import { FlowBeforeInfo, getReimburseOrderList } from "@/api/workFlow/FlowBefore";
import { getInvoiceDetail } from "@/api/business/pasteTicket";
import { downloadFile } from "@/api/business/signature";
import { saveAs } from "file-saver";
import axios from 'axios';
import JSZip from 'jszip'
import previewOnline from "@/components/preview-online/index";
import baseMixin from '@/mixins/print/baseMixin'
import HtmlDetailDialog from '@/views/expenseAccountManage/components/HtmlDetailDialog'
import { parseJsonObj } from '@/components/Cicada/printHelper'
import optionalBatchPrint from "@/views/expenseAccountManage/components/optionalBatchPrint.vue";
import { mergePdf } from '@/utils/pdf';

export default {
  components: { HtmlDetailDialog, previewOnline, optionalBatchPrint },
  mixins: [baseMixin],
  data() {
    return {
      // 所有模板列表，dataList中，id为模版id；title为要展示区域的标题；
      dataList: [],
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
      optionalBatchPrint: {
        visible: false,
        data: [],
      },
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      detailData: {}, // 报销单详情数据
      applyFidsList: [], // 所有报销单关联的审批单的附件
      statisticData: {}, // 税额统计数据
      applyDataList: [], // 申请模版列表
      exsOrderList: [], // 报销单列表（目前就请款单）
      invoiceDataList: [], // 电子发票模版
      orderId: "", // 订单id,
      orderType: "", // 订单类型
      title: "", // 订单名称
      loading: false,
      btnLoading: false, // 批量下载按钮
      btnLoading2: false, // 添加新报销材料
      btnLoading3: false, // 添加银行付款证明
      isPayButton: false,
      invoiceList: [], // 发票图片列表，其中有电子发票的，可以下载
      pictureList: [], // 其他图片列表
      relevantInfoList: [], // 相关资料中，非图片部分，点击下载；图片部分直接塞入pictureList去进行展示
      relevantPdf: [], // 相关资料中的非图片
      payCertificateList: [],
      pageList: [], // 当前数据列表，用来存本页所有数据，以用来上一页、下一页
      pageIndex: "", // 当前是列表中第几个数据
      queryData: {}, // 查询条件
      listQuery: {}, // 当前页码
      isPay: false, // 是否付款
      receipts: [], // 结算单附件图片
    }
  },
  computed: {
    hasPaperInvoice() {
      return this.invoiceList.filter(v => v.isElectronicInvoice === 0).length > 0;
    },
  },
  // 更新路由守卫，在同一个页面之间跳转
  beforeRouteUpdate(to, from, next) {
    // 下面这三个参数，由于会变化，需要取路由中最新的
    this.orderId = to.query.id || this.propOrderId || "";
    this.pageIndex = Number(to.query.index);
    this.listQuery = JSON.parse(to.query.listQuery ? to.query.listQuery : '[]');
    // 下面这些容器需要先置空，否则会累加其他页面的数据
    this.dataList = [];
    this.invoiceList = [];
    this.applyDataList = [];
    this.exsOrderList = [];
    this.invoiceDataList = [];
    this.receipts = [];
    if (this.orderId) {
      this.loadPageData();
      next();
    }
  },
  created() {
    this.orderId = this.$route.query.id || this.propOrderId || "";
    this.pageIndex = Number(this.$route.query.index);
    this.listQuery = JSON.parse(this.$route.query.listQuery ? this.$route.query.listQuery : '[]');
    // 下面这个参数，只有从其他页面，跳转到该页面时，才初始化，因为没有啥变化
    this.queryData = JSON.parse(this.$route.query.queryData ? this.$route.query.queryData : '{}');
    if (this.orderId) {
      this.getCurrentPageList();
      this.loadPageData();
    }
  },
  methods: {
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
        // 把发票id合集处理后，放入发票列表
        if (data.invoiceIds) {
          this.invoiceList = data.invoiceIds.split(",").map((v1, index) => ({ id: v1, title: "发票" + (index + 1), src: "", checkSrc: "", url: "", previewOnlineUrl: "", xmlUrl: "", name: "", xmlName: "", isElectronicInvoice: 0 }));
        }
        // 把申请单id合集处理后，放入模板列表
        if (data.applyOrderIds) {
          const applyList = data.applyOrderIds.split(",").map((v1, index) => ({ id: index, url: "", src: "", orderId: v1 }));
          this.applyDataList.push(...applyList);
        }
        // 把报销单id合集处理后，放入模板列表
        if (data.exsOrderIds) {
          const applyList = data.exsOrderIds.split(",").map((v1, index) => ({ id: index, url: "", src: "", orderId: v1 }));
          this.exsOrderList.push(...applyList);
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
      saveAs(blob, "票据文件压缩包.zip");
      this.$message.success("下载中，请在浏览器下载列表中查看");
    },
    async __genDownloadList(onlyImg = true) {
      // 需要下载的文件或图片列表
      const downloadList = [];
      // 没有电子发票但有其他发票，且有发票模版的，要把发票模版下载下来
      if (this.invoiceDataList.length > 0 && this.hasPaperInvoice) {
        const result = await this.templateToImageDirectly(this.invoiceDataList[0].templateId, this.invoiceDataList[0].formId, this.invoiceDataList[0].orderType, this.invoiceDataList[0].panelId);
        downloadList.push({ name: this.invoiceDataList[0].title + '.png', blob: result.src });
      }
      // 报销模版图片塞入downloadList
      this.dataList.forEach(v => {
        downloadList.push({ name: v.title + '.png', blob: v.src });
      });
      // 申请单模版图片塞入downloadList
      this.applyDataList.forEach(v => {
        downloadList.push({ name: v.title + '.png', blob: v.src });
      });
      // 把【发票图片】【其他图片】【电子发票文件】等其他所有图片和pdf转换成blob，放入downloadList
      const otherList = [...this.invoiceList, ...this.pictureList, ...this.relevantPdf, ...this.receipts];
      for (const v of otherList) {
        if (v.src) {
          // src代表图片
          await axios.get(v.src, {
            responseType: 'blob'
          }).then(res => {
            downloadList.push({ name: v.title.indexOf(".") > -1 ? v.title : v.title + '.png', blob: res.data });
          });
        }
        if (v.fidUrl) {
          // fidUrl是receipts(公务卡小票)中的图片或文件
          await axios.get(v.fidUrl, {
            responseType: 'blob'
          }).then(res => {
            downloadList.push({ name: v.fullName.indexOf(".") > -1 ? v.fullName : v.fullName + '.' + v.type, blob: res.data });
          });
        }
        if (v.checkSrc) {
          // checkSrc代表是发票的查验凭证
          await axios.get(v.checkSrc, {
            responseType: 'blob'
          }).then(res => {
            downloadList.push({ name: `${v.title}-查验凭证.png`, blob: res.data });
          });
        }
        if (!onlyImg && v.xmlUrl) {
          // xmlUrl代表是发票的xml文件
          await axios.get(v.xmlUrl, {
            responseType: 'blob'
          }).then(res => {
            downloadList.push({ name: v.xmlName, blob: res.data });
          });
        }
        if (!onlyImg && v.url) {
          // url代表是pdf
          await axios.get(v.url, {
            responseType: 'blob'
          }).then(res => {
            downloadList.push({ name: v.name, blob: res.data });
          });
        }
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
      await this.downloadAllByOrders([this.orderId]);
      this.btnLoading = false;
    },
    async openOptionalDialog() {
      this.btnLoading = true;
      // 请求批量打印方法，但只获取pdfList
      const pdfList = await this.downloadAllByOrders([this.orderId], false);
      this.btnLoading = false;
      console.log("批量打印pdfList：", pdfList);
      Object.assign(this.optionalBatchPrint, { visible: true, data: pdfList });
    },
    async confirmPrint(pdfList) {
      await mergePdf(pdfList.map(v => v.pdfDocumentObj));
    },
    // 下载pdf文件
    downloadSingleFile(name, url) {
      this.$confirm('确认下载该文件?', '提示', {
        type: 'warning'
      }).then(() => {
        saveAs(url, name);
        this.$message.success("下载中，请在浏览器下载列表中查看");
      });
    },
    // 重新加载整个页面的数据, 包括: 下拉源,用印表格,签名表格,模板,基本信息等
    async loadPageData() {
      this.loading = true;
      try {
        // 先获取报销单模板id
        await this.getExsOrderDetail();
        await this.getOtherTemplate();
        await this.getApplyOrderDetail();
        await this.loadExsOrderTemplate();
        this.getCcdExsOrderTaxStatistic();
        this.getInvoiceDetail();
        this.updateRelevantList(); // 获取申请附件和相关资料，并加载数据
      } finally {
        console.log("发票", this.invoiceList);
        this.loading = false;
      }
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
    // 请求发票详情接口-获取发票和查验，并下载获取url
    getInvoiceDetail() {
      if (this.detailData.invoiceIds) {
        this.invoiceList = this.detailData.invoiceIds.split(",").map((v1, index) => ({
          id: v1,
          title: "发票" + (index + 1),
          src: "",
          checkSrc: "",
          url: "",
          previewOnlineUrl: "",
          xmlUrl: "",
          name: "",
          xmlName: "",
          isElectronicInvoice: 0
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
      Object.assign(this.preview, { visible: true, fileUrl: item.url || item.src, fileTitle: item.title || item.name });
    },
    handleProgress() {
      this.btnLoading3 = true;
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
    // 获取税额统计
    getCcdExsOrderTaxStatistic() {
      ccdExsOrderTaxStatistic(this.orderId).then(res => {
        this.statisticData = res.data;
      });
    },
    // 使用从列表待过来的页码、查询条件等来查询列表，以用来上一页、下一页
    async getCurrentPageList() {
      const method = getReimburseOrderList;
      await method({ ...this.queryData }).then(res => {
        console.log(res);
        this.pageList = res.data.list || [];
      });
    },
    async updatePageList(flag) {
      // 说明本页数据轮循完了，需要请求列表新页码了
      if (this.pageIndex + flag + 1 > this.listQuery.size || this.pageIndex + flag + 1 < 1) {
        if (this.listQuery.current + flag > 0) {
          this.listQuery.current += flag;
          await this.getCurrentPageList();
          // 请求后有数据的，才需要重置下标
          if (this.pageList.length > 0) {
            // 更新完数据，下标也要重置
            if (flag == -1) {
            // 往上翻，下标是新页的最后一个
              this.pageIndex = this.listQuery.size;
            } else if (flag == 1) {
            // 往下翻，下标是新页的第一个
              this.pageIndex = -1;
            }
          }
        }
      }
    },
    async goToNextOrLast(flag) {
      if (Object.keys(this.queryData).length === 0) {
        return;
      }
      await this.updatePageList(flag);
      // 通过updatePageList后，会有三种情况，需要抛出错误提示
      // 1. 无需翻页但是已经是最后一条数据的，不会走getCurrentPageList代码；
      // 2. 已经是第一页第一条数据的，也不会走getCurrentPageList代码；
      // 3. 翻页后没有数据的，走了getCurrentPageList代码，需要恢复页码
      if (this.pageList.length > 0 && this.pageIndex + flag > this.pageList.length - 1) {
        this.$message.warning("已经是最后一条数据了");
      } else if (this.pageList.length === 0) {
        this.$message.warning("已经是最后一条数据了");
        this.listQuery.current -= flag; // 页码改变后，请求后没有数据，则恢复页码
      } else if (this.pageIndex === 0 && this.listQuery.current === 1 && flag === -1) {
        this.$message.warning("已经是第一条数据了");
      } else {
        this.pageIndex += flag;
        console.log("现在第几页，哪个下标的数据", this.listQuery.current, this.pageIndex);
        const row = this.pageList[this.pageIndex];
        this.$router.push({
          path: "/reimburseDetail",
          query: {
            id: row.id,
            queryData: JSON.stringify(this.queryData),
            listQuery: JSON.stringify(this.listQuery),
            index: this.pageIndex,
          }
        });
      }
    },
    async showTemplateDetail(v) {
      Object.assign(this.htmlDetail, { visible: true, loading: true, data: '' })
      const html = await this.templateToHtmlWithoutSign(v.templateId, v.formId, v.orderType, v.panelId === "0" ? "" : v.panelId)
      Object.assign(this.htmlDetail, { visible: true, loading: false, data: html })
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

    .left {
      width: 60%;
      margin-right: 23px;
      display: flex;
      flex-direction: column;
  }
    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .size1 {
        height: 172px;
        margin-bottom: 20px;
        overflow: auto;
      }
    .size2 {

        /*height: 634px;*/
        margin-bottom: 20px;
      }
    .size3 {
        height: 531px;
        margin-bottom: 20px;
        overflow: auto;
      }
    .size4 {
      /*flex: 1;*/
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
    /*height: 417px;*/
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
