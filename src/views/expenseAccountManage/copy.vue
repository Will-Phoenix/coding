<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main">
        <div class="content" v-loading="loading">
          <!-- <h3 class="mb20">{{ title }}</h3> -->
          <div class="align-right" v-if="toolbarVisible">
            <el-button type="primary" :loading="btnLoading" @click="genPDF()">
              批量打印
            </el-button>
            <!--            <el-button type="primary" :loading="btnLoading" @click="downloadAll()">-->
            <!--              批量下载原件-->
            <!--            </el-button>-->
            <el-button v-if="showButton" type="primary" @click="flagToPasted()">
              标记为已贴票
            </el-button>
          </div>
          <ApprovalItem v-for="(item, index) in dataList" :key="item.id" :data="item" ref="printTemplateDetail" class="small-block" />
          <template v-if="hasPaperInvoice">
            <ApprovalItem v-for="(item, index) in invoiceDataList" :key="item.id" :data="item" ref="printTemplateDetail3" class="small-block" />
          </template>
          <el-card class="small-block" v-for="(item, index) in invoiceListNew" :key="item.id">
            <div slot="header">
              <h4 class="title">{{ item.title }}</h4>
            </div>
            <template v-if="invoiceDataList.length > 0 && item.isElectronicInvoice === 1">
              <ApprovalItem v-for="(item2, index2) in invoiceDataList" :key="item2.id" :data="item2" :background="item.src" ref="printTemplateDetail2" class="small-block" />
            </template>
            <embed v-else-if="item.previewOnlineUrl" class="img" style="height: 500px" :src="item.previewOnlineUrl">
            <el-image v-else :src="item.src" class="img" :preview-src-list="[item.src]" />
            <div v-for="(item3, index3) in item.checkSrcList" :key="index3">
              <el-image :src="item3" class="img" :preview-src-list="[item3]" />
            </div>
          </el-card>

          <el-card class="small-block" v-for="(item, index) in pictureList" :key="item.id">
            <div slot="header">
              <h4 class="title">{{ item.title }}</h4>
            </div>
            <el-image :src="item.src" class="img" :preview-src-list="[item.src]" />
          </el-card>
          <el-card v-if="receipts && receipts.length > 0" class="small-block">
            <div slot="header">
              <h4 class="title">结算信息票据附件</h4>
            </div>
            <el-image v-for="(item, index) in receipts" :key="index" :src="item.fidUrl" class="img" :preview-src-list="[item.fidUrl]" />
          </el-card>
          <el-card class="small-block" v-if="docList && docList.length">
            <div slot="header">
              <h4 class="title">电子发票原件</h4>
            </div>
            <div v-for="(item, index) in docList" :key="item.url">
              <el-link type="primary" @click="previewOther(item)" style="margin-bottom: 10px">{{ item.title }}</el-link>
            </div>
          </el-card>

          <el-card class="small-block" v-if="contractList && contractList.length">
            <div slot="header">
              <h4 class="title">关联合同</h4>
            </div>
            <div v-for="(item, index) in contractList" :key="item.url">
              <el-link type="primary" @click="downloadSingleFile(item.title, item.url)" style="margin-bottom: 10px">{{ item.title }}</el-link>
            </div>
          </el-card>

          <el-card class="small-block" v-if="relevantPdf && relevantPdf.length">
            <div slot="header">
              <h4 class="title">相关资料</h4>
            </div>
            <div v-for="(item, index) in relevantPdf" :key="item.url">
              <el-link type="primary" @click="previewOther(item)" style="margin-bottom: 10px">{{ item.title }}</el-link>
            </div>
          </el-card>
          <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOtherOrdersDetail } from "@/api/business/expenseAccount";
import { additionPrintListByOrder } from "@/api/business/businessApproval";
import { FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
import { flagStickerTicket, getInvoiceDetail } from "@/api/business/pasteTicket";
import { downloadFile } from "@/api/business/signature";
import { saveAs } from "file-saver";
import axios from 'axios';
import JSZip from 'jszip'
import ApprovalItem from './components/ApprovalItem.vue'
import previewOnline from "@/components/preview-online/index";
import baseMixin from "@/mixins/print/baseMixin";

export default {
  components: { ApprovalItem, previewOnline },
  mixins: [baseMixin],
  props: {
    propOrderId: {
      type: String,
      default: "",
    },
    toolbarVisible: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "报销详情",
    },
    subTitle: {
      type: String,
      default: "报销单页",
    }
  },
  data() {
    return {
      draggable: false,
      // 所有模板列表，dataList中，id为模版id；title为要展示区域的标题；
      dataList: [
        {
          id: "",
          orderId: "",
          title: "报销单页",
          orderType: "",
        },
      ],
      detailData: {}, // 报销单详情数据
      applyDataList: [], // 申请模版列表
      invoiceDataList: [], // 电子发票模版
      showButton: false, // 是否展示“标记发票”按钮
      orderId: "", // 订单id,
      orderType: "", // 订单类型
      applyPrintTemplate: "", // 申请单打印模板
      loading: false,
      btnLoading: false, // 批量下载按钮
      invoiceList: [], // 发票图片列表
      invoiceListNew: [], // 新定义的发票图片列表
      pictureList: [], // 其他图片列表
      docList: [], // 电子发票，点击下载
      contractList: [], // 合同pdf，点击下载
      relevantInfoList: [], // 相关资料中，非图片部分，点击下载；图片部分直接塞入pictureList去进行展示
      relevantPdf: [], // 相关资料中的非图片
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
      receipts: [], // 结算单附件图片
    }
  },
  computed: {
    hasElectronicInvoice() {
      return this.invoiceListNew.filter(v => v.isElectronicInvoice === 1).length > 0;
    },
    hasPaperInvoice() {
      return this.invoiceListNew.filter(v => v.isElectronicInvoice === 0).length > 0;
    },
  },
  watch: {
    propOrderId(value) {
      if (value) {
        this.orderId = value || "";
        this.loadPageData();
      }
    },
  },
  created() {
    this.orderId = this.$route.query.id || this.propOrderId || "";
    if (this.orderId) {
      this.loadPageData();
    }
  },
  methods: {
    // 请求报销单详情接口，获取报销单模板id，发票id，申请单id，申请单附件文件，报销单附件文件（全部初始数据处理）
    async getExsOrderDetail() {
      await FlowBeforeInfo(this.orderId).then(async res => {
        let data = res.data.formData;
        this.detailData = res.data.formData;
        // 从详情获取订单类型
        this.orderType = data.orderType;
        // 由于基础报销模板改成了非必填项，当没有基础报销模板时，把dataList置空
        if (data.basePrintdevId) {
          this.dataList[0].id = data.id;
          this.dataList[0].basePrintdevId = data.basePrintdevId;
          this.dataList[0].orderId = this.orderId;
          this.dataList[0].orderType = data.orderType;
          if (this.subTitle) {
            this.dataList[0].title = this.subTitle;
          }
        } else {
          this.dataList = [];
        }
        this.showButton = data.stickerTicketStatus !== 1 && this.$route.query.from === 2;
        // 把发票id合集处理后，放入发票列表
        if (data.invoiceIds) {
          this.invoiceList = data.invoiceIds.split(",").map((v1, index) => ({
            id: v1,
            title: "发票" + (index + 1),
            src: "",
            checkSrc: "",
            isElectronicInvoice: 0
          }));
        }
        // 把申请单id合集处理后，放入模板列表
        if (data.applyOrderIds) {
          const applyList = data.applyOrderIds.split(",").map((v1, index) => ({
            id: index,
            basePrintdevId: '',
            orderId: v1,
            title: "关联审批单" + (index + 1),
            orderType: ""
          }));
          this.applyDataList.push(...applyList);
        }
        // 审批单附件放到相关资料里展示
        if (data.applyOrderFids) {
          this.relevantInfoList = data.applyOrderFids.split(",").map((v1) => ({ id: v1, title: "" }));
        }
        // 获取合同呈批签，并塞入其他图片列表
        if (data.submitSignFids) {
          const pictureList = data.submitSignFids.split(",").map((v1, index) => ({
            id: v1,
            title: "关联合同呈批签" + (index + 1),
            src: ""
          }));
          this.pictureList.push(...pictureList);
        }
        // 获取合同，并塞入合同列表
        if (data.contractFids) {
          this.contractList = data.contractFids.split(",").map((v1) => ({ id: v1, title: "", url: "" }));
        }
        // 获取相关资料，并塞入相关资料列表
        if (data.exsFids) {
          this.relevantInfoList.push(...data.exsFids.split(",").map((v1) => ({ id: v1, title: "" })));
        }
        // 由于申请单详情中，会有附件，需要拿出来，放到相关资料中容器中，统一处理
        // 申请单详情接口那已经有这段代码了，还在这加一遍是为了兼容：传进来的orderId直接就是申请单的，此时只会执行该方法
        // FlowBeforeInfo接口就变成了请求申请单formData（而不是报销单formData）
        if (data.applyFids) {
          this.relevantInfoList.push(...data.applyFids.split(",").map((v1) => ({ id: v1, title: "" })));
        }
        // 结算信息里面上传的单据照片, 合同和呈批签
        this.receipts = []
        const detailJson = data.detailJson;
        if (detailJson) {
          const detail = JSON.parse(detailJson);
          // 由于申请单详情中，会有附件，需要拿出来，放到相关资料中容器中，统一处理
          // 申请单详情接口那已经有这段代码了，还在这加一遍是为了兼容：传进来的orderId直接就是申请单的，此时只会执行该方法
          // FlowBeforeInfo接口就变成了请求申请单formData（而不是报销单formData）
          if (detail && detail.attachmentUrl) {
            this.relevantInfoList.push(...detail.attachmentUrl.split(",").map((v1) => ({ id: v1, title: "" })));
          }
          if (detail && detail.contractFids) {
            this.contractList = detail.contractFids.split(",").map((v1) => ({ id: v1, title: "", url: "" }));
          }
          if (detail && detail.submitSignFids) {
            const pictureList = detail.submitSignFids.split(",").map((v1, index) => ({
              id: v1,
              title: "关联合同呈批签" + (index + 1),
              src: ""
            }));
            this.pictureList.push(...pictureList);
          }
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
      // 把所有模板转换成blob放入downloadList
      for (const [index, v] of this.dataList.entries()) {
        await this.$refs.printTemplateDetail[index].toBlob().then(res => {
          downloadList.push({ name: v.title + '.png', blob: res });
        });
      }
      // 把所有电子发票且有发票模版的，套在一起放入downloadList
      const electronicInvoiceList = this.invoiceList.filter(v => v.isElectronicInvoice === 1);
      if (this.invoiceDataList.length > 0 && this.hasElectronicInvoice) {
        for (const [index, v] of electronicInvoiceList.entries()) {
          await this.$refs.printTemplateDetail2[index].toBlob().then(res => {
            downloadList.push({ name: v.title + '.png', blob: res });
          });
        }
      }
      // 没有电子发票但有其他发票，且有发票模版的，要把发票模版下载下来
      if (this.invoiceDataList.length > 0 && this.hasPaperInvoice) {
        for (const [index, v] of this.invoiceDataList.entries()) {
          await this.$refs.printTemplateDetail3[index].toBlob().then(res => {
            downloadList.push({ name: v.title + '.png', blob: res });
          });
        }
      }
      // 把【发票图片】【其他图片】【电子发票文件】中的url转换成blob，放入downloadList
      const otherList = [...this.invoiceList, ...this.pictureList, ...this.docList, ...this.contractList, ...this.relevantPdf];
      for (const v of otherList) {
        if ((v.src && !(v.isElectronicInvoice && this.invoiceDataList.length > 0))) {
          // src代表图片
          await axios.get(v.src, {
            responseType: 'blob'
          }).then(res => {
            downloadList.push({ name: v.title + '.png', blob: res.data });
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
        if (!onlyImg && v.url) {
          // url代表是pdf
          await axios.get(v.url, {
            responseType: 'blob'
          }).then(res => {
            downloadList.push({ name: v.title, blob: res.data });
          });
        }
      }
      return downloadList
    },
    genPDF() {
      this.btnLoading = true;
      this.__genPDF().catch(e => {
        // 提示下载失败
        console.warn(e);
      }).finally(() => {
        this.btnLoading = false;
      })
    },
    async __genPDF() {
      const downloadList = await this.__genDownloadList(true);
      const arr = await Promise.all(downloadList.map(v => new Promise(resolve => {
        const url = window.URL.createObjectURL(v.blob)
        resolve({ name: v.name, url: url })
      })))
      // API 文档 https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html
      // const doc = new jsPDF({ unit: "mm", format: [148, 210] });
      const wrapper = document.createElement("div");
      wrapper.style.width = '210mm';
      wrapper.style.margin = '0 auto';
      arr.forEach((v, i) => {
        const con = document.createElement("div");
        con.style.pageBreakInside = 'avoid';
        con.style.pageBreakAfter = 'always';
        const img = document.createElement("img");
        img.src = v.url;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '297mm';
        con.appendChild(img)
        wrapper.append(con)
      })
      let newTab = window.open('about:_blank');
      const style = document.createElement('style');
      style.innerHTML = `html,body{margin:0;padding:0;}`
      newTab.document.head.appendChild(style);
      newTab.document.body.appendChild(wrapper);
      setTimeout(() => newTab.print(), 1000);
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

    // 预览其他在线文件
    previewOther(item) {
      Object.assign(this.preview, { visible: true, fileUrl: item.src || item.url, fileTitle: item.title || item.name });
    },

    // 标记为已贴票
    flagToPasted() {
      flagStickerTicket(this.orderId).then(() => {
        this.$message.success("标记成功");
        this.showButton = false;
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
        this.getInvoiceDetail();
        this.downloadFromId(this.pictureList); // 加载除发票外的其他所有图片
        this.downloadPdf(this.contractList); // 下载合同pdf
        this.downloadAndJudge(this.relevantInfoList);
      } finally {
        console.log("发票", this.invoiceList);
        this.loading = false;
      }
    },
    // 获取报销模版的附属模版
    async getOtherTemplate() {
      // 非发票类
      await additionPrintListByOrder({ orderId: this.orderId, additionType: 0 }).then(res => {
        res.data.forEach(v => {
          this.dataList.push({ id: v.id, basePrintdevId: v.basePrintdevId, orderId: this.orderId, title: v.name, orderType: this.orderType, additionPrintId: v.id })
        });
      });
      // 特殊情况说明打印模板，跟表单字段有关联，需要判断是否展示
      this.dataList = this.dataList.filter(v => v.title !== "特殊情况说明" || (v.title === "特殊情况说明" && this.detailData.detailJson && !!JSON.parse(this.detailData.detailJson).specialSituationInfo));
      // 发票类
      await additionPrintListByOrder({ orderId: this.orderId, additionType: 1 }).then(res => {
        res.data.forEach(v => {
          this.invoiceDataList.push({ id: v.id, basePrintdevId: v.basePrintdevId, orderId: this.orderId, title: v.name, orderType: this.orderType, additionPrintId: v.id })
        });
      });
    },
    // 下载传入列表中v的所有id，并塞入url
    downloadFromId(picList) {
      picList.forEach(v => {
        if (v.id) {
          downloadFile(v.id).then(res => {
            v.src = res.data.url;
          })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    },
    // 下载pdf
    downloadPdf(pdfList) {
      pdfList.forEach(v => {
        if (v.id) {
          downloadFile(v.id).then(res => {
            v.url = res.data.url;
            v.title = res.data.name;
          })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    },
    // 下载文件id后，再判断是什么类型的文件，图片塞入图片列表，非图片塞入对应列表
    downloadAndJudge(list) {
      let index = 1; // 相关资料图片序号
      list.forEach(v => {
        downloadFile(v.id).then(res => {
          if (["jpg", "png", "jpeg"].includes(res.data.fileExtension)) {
            this.pictureList.push({ id: v.id, title: "相关资料图片" + index, src: res.data.url });
            index += 1;
          } else {
            this.relevantPdf.push({ id: v.id, title: res.data.name, url: res.data.url });
          }
        });
      });
    },
    // 请求发票详情接口-获取发票和查验，并下载获取url
    async getInvoiceDetail() {
      /* 本方法进行改造，对于发票组的发票，只展示一张发票图片和多张查验图片；只对展示进行改造，下载相关功能本页面已废弃，不做更新*/
      const invoiceDetailList = await this.loadInvoiceList({ ids: this.invoiceList.map(v => v.id) });
      // 由于报销单中关联的发票，可能有些是同一个发票组的，因此过滤一下，同一个发票组的只留一张发票，即可以遍历同一组的所有发票
      const invoiceGroupList = invoiceDetailList.filter((vv, index, self) => !vv.entity.groupId || self.findIndex(item => item.entity.groupId === vv.entity.groupId) === index);
      // const invoiceListNew = [];
      for (const [index, v] of invoiceGroupList.entries()) {
        this.invoiceListNew.push({ id: v.entity.id, title: "发票" + (index + 1), src: "", previewOnlineUrl: "", checkSrcList: [], isElectronicInvoice: 0 });
        // 下载发票src
        const sourceInvoice = (await downloadFile(v.entity.fid)).data;
        if (["jpg", "png", "jpeg"].includes(sourceInvoice.fileExtension)) {
          this.invoiceListNew[index].src = sourceInvoice.url;
        }
        // 下载查验发票
        if (v.entity.groupId) {
          // 发票组
          for (const vv of v.inners) {
            if (vv.key.chectFid) {
              this.invoiceListNew[index].checkSrcList.push((await downloadFile(vv.key.chectFid)).data.url);
            }
          }
        } else {
          // 普通发票
          if (v.entity.chectFid) {
            this.invoiceListNew[index].checkSrcList.push((await downloadFile(v.entity.chectFid)).data.url);
          }
        }
        // 查看是否有电子发票，有的话塞入电子发票list
        if (!["jpg", "png", "jpeg"].includes(sourceInvoice.fileExtension)) {
          this.invoiceListNew[index].isElectronicInvoice = 1;
          // kkfile的url塞入
          this.invoiceListNew[index].previewOnlineUrl = await this.loadPreviewUrl({ fileDownloadUrl: sourceInvoice.url });
          this.docList.push({ title: sourceInvoice.name, url: sourceInvoice.url });
        }
      }
      // this.invoiceListNew = invoiceListNew;
      // this.invoiceList.forEach(v => {
      //   getInvoiceDetail(v.id).then(res => {
      //     if (res.data) {
      //       // 下载发票url
      //       if (res.data.entity.imgFid) {
      //         downloadFile(res.data.entity.imgFid).then(res2 => {
      //           v.src = res2.data.url;
      //         });
      //       }
      //       // 下载查验发票
      //       if (res.data.entity.chectFid) {
      //         downloadFile(res.data.entity.chectFid).then(res3 => {
      //           v.checkSrc = res3.data.url;
      //         });
      //       }
      //       // 查看是否有电子发票，有的话塞入电子发票list
      //       if (res.data.entity.fid && res.data.entity.fid !== res.data.entity.imgFid) {
      //         downloadFile(res.data.entity.fid).then(res3 => {
      //           v.isElectronicInvoice = 1;
      //           this.docList.push({ title: res3.data.name, url: res3.data.url });
      //         });
      //       }
      //     }
      //   });
      // });
    },
    // 申请单详情，获取申请单模板id
    async getApplyOrderDetail() {
      // for (let item of this.applyDataList) {
      //   await getOtherOrdersDetail([item.orderId]).then(res => {
      //     if (res.data && res.data.length > 0) {
      //       item.id = res.data[0].id;
      //       item.basePrintdevId = res.data[0].basePrintdevId;
      //       item.orderType = res.data[0].orderType;
      //     }
      //   });
      // }
      const orderIds = this.applyDataList.map(v => v.orderId);
      await getOtherOrdersDetail(orderIds).then(res => {
        res.data.forEach(v => {
          // 由于申请单详情中，会有附件，需要拿出来，放到相关资料中
          if (v.applyFids) {
            this.relevantInfoList.push(...v.applyFids.split(",").map((v1) => ({ id: v1, title: "" })));
          }
          const item = this.applyDataList[this.applyDataList.findIndex(v1 => v1.orderId === v.id)];
          item.id = v.id;
          item.basePrintdevId = v.basePrintdevId;
          item.orderType = v.orderType;
        });
      });
      this.dataList.push(...this.applyDataList);
    },
  }
}
</script>
<style lang="scss" scoped>
.query-flex {
  display: flex;
  flex-wrap: wrap;
}
.align {
  text-align: center;
}
.content {
  padding: 10px;
  height: auto;
  /*display: flex;*/
  /*align-items: center;*/

  .align-right {
    text-align: right;
    margin: 10px 0;
  }
  .title {
    margin-bottom: 10px;
  }
  .small-block {
    margin-bottom: 10px;
  }
}

.img {
  width: 50%;
  height: auto;
  display: block;
  margin: auto;
}
  .mb20 {
  margin-bottom: 20px;
}

</style>
