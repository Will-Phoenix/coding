<template>
  <div>
    <el-card class="custom-center-card">
      <div slot="header" class="row-flex">
        <div class="sub-title">报销单页</div>
      </div>
      <div class="size4-card" style="text-align: center;" v-for="item in dataList" :key="item.id">
        <h4 style="margin-bottom: 10px;cursor: pointer;" @click="showTemplateDetail(item)">
          {{ item.title }}</h4>
        <el-image v-if="item.url" style="max-width: 297mm" :src="item.url" :preview-src-list="[item.url]" />
      </div>
      <div class="size4-card" style="text-align: center;" v-if="receipts && receipts.length > 0">
        <h4 style="margin-bottom: 10px">结算信息票据附件</h4>
        <el-image
          v-for="(item,index) in receipts"
          :key="index"
          style="max-width: 297mm"
          :src="item.fidUrl"
          :preview-src-list="[item.fidUrl]"
        />
      </div>
    </el-card>

    <!-- <el-card class="custom-center-card size4">
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
    </el-card> -->
    <div class="custom-center-empty-card" v-if="noSubmit">

      <template v-if="relateInvoiceList && relateInvoiceList.length > 0">
        <div class="custom-app-title">
          <div class="custom-app-title-text">发票管理</div>
          <div class="custom-app-title-btn" @click="selectInvoiceVisible = true">
            <span style="color: #00b4c4;font-size: 20px; vertical-align: middle;" class="el-icon-circle-plus-outline"></span>
            关联发票
          </div>
        </div>
        <div class="custom-invoice-list">
          <div class="custom-invoice-item" v-for="item in relateInvoiceList" :key="item.id">
            <div class="custom-invoice-item-top">
              <div class="custom-invoice-item-top-left">{{ item.entity.name }}</div>
              <div class="custom-invoice-item-top-right">
                <div v-if="item.statusEn" :class="['status', item.statusEn.color]">
                  {{ item.statusEn.statusTxt }}
                </div>
              </div>
            </div>
            <div class="custom-invoice-item-content">
              <div>
                发票号码{{ item.entity.code }}
              </div>
              <div>
                <InvoiceTag :invoice-type="item.typeLable" :type-lable="item.typeLable" />
              </div>

            </div>
            <div class="custom-invoice-item-bottom">
              <div class="custom-invoice-item-bottom-left">{{ item.entity.createTime }}</div>
              <div class="custom-invoice-item-bottom-right"><img
                class="custom-invoice-item-bottom-icon"
                src="https://image.smxzhcs.cn/smxsc/M00/2C/4D/CqDIlGT3CeWADKE5AAAGRxvT2QE239.png"
                alt=""
              > {{ item.entity.amount }}</div>
            </div>
            <span
              title="删除"
              @click="deleteInvoice(item.entity.id)"
              class="el-icon-circle-close"
            ></span>
          </div>
        </div>
      </template>
      <div v-else class="custom-center-upload-con" @click="selectInvoiceVisible = true">
        <span style="font-size: 20px;margin-right: 8px;color:#00B4C4" class="el-icon-circle-plus-outline"></span>关联发票
      </div>
    </div>
    <template v-else>
      <el-card
        class="custom-center-card"
        v-if="groupedInvoiceList && groupedInvoiceList.length > 0"
      >
        <div slot="header" class="row-flex">
          <div class="sub-title">发票</div>
        </div>
        <div class="list-invoice-container">
          <div class="invoice-item-row" v-for="item in groupedInvoiceList" :key="item.id">
            <div class="invice-item-top">
              <div class="nvice-item-top-left">发票号码 {{ (item.object || {})[item.field] }}</div>
              <div class="nvice-item-top-right">
                <InvoiceTag
                  v-if="item.entity.groupId"
                  type-lable="发票组"
                  :group-id="item.entity.groupId"
                />
                <div v-if="item.statusEn" :class="['status', item.statusEn.color]">
                  {{ item.statusEn.statusTxt }}
                </div>
                <template v-if="item.typeLable">
                  <InvoiceTag :invoice-type="item.typeLable" :type-lable="item.typeLable" />
                </template>
              </div>
            </div>
            <div class="list-invoice-item-content">
              <div class="list-invoice-item">
                <template
                  v-if="item.entity.groupId && item.inners.filter(element => !!element.key.handleFid).length > 0"
                >
                  <IdImage
                    v-for="subItem in item.inners.filter(element => !!element.key.handleFid)"
                    :id="subItem.key.handleFid"
                    :key="subItem.key.handleFid"
                  />
                </template>
                <template v-else>
                  <InvoiceFile :fid="item.fidFile.id" :preview-img="true" />
                </template>
              </div>
              <div class="list-invoice-item">
                <template v-if="item.entity.groupId">
                  <IdImage
                    v-for="subItem in item.inners.filter(element => !!element.key.chectFid)"
                    :key="subItem.key.chectFid"
                    :id="subItem.key.chectFid"
                  />
                </template>
                <template v-else-if="item.entity.chectFid">
                  <IdImage :id="item.entity.chectFid" />
                </template>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </template>
    <div class="custom-center-empty-card" v-if="noSubmit">
      <template v-if="exsFids && exsFids.length > 0">
        <div class="custom-app-title">
          <div class="custom-app-title-text">资料管理</div>
          <div class="custom-app-title-btn" @click="uploadFile">
            <img
              class="c-upload-icon"
              src="https://image.smxzhcs.cn/media/M00/00/8F/CqDIk2d8kvKAMx8_AAABlzTnkcM531.png"
              alt=""
            >
            上传资料
          </div>
        </div>
        <div class="row-flex my-s-card-container">
          <div
            class="statistic-card my-s-card"
            v-for="item in exsFids"
            :key="item"
          >
            <InvoiceFile :fid="item">
              <span @click="deleteExsFidsItem(item)" class="delete-file-btn">删除</span>
            </InvoiceFile>
          </div>
        </div>
      </template>
      <div v-else @click="uploadFile" class="custom-center-upload-con custom-center-upload-con-1">
        <div class="flex-row-center">
          <img
            class="c-upload-icon"
            src="https://image.smxzhcs.cn/media/M00/00/8F/CqDIk2d8kvKAMx8_AAABlzTnkcM531.png"
            alt=""
          >
          上传资料
        </div>
<!--        <div class="upload-info">PS：建议上传10M以内的文件或分开上传</div>-->
      </div>
    </div>
    <template v-else>
      <el-card class="custom-center-card" v-if="pictureList.length > 0 || relevantPdf.length > 0">
        <div slot="header" class="row-flex">
          <div class="sub-title">相关资料</div>
        </div>
        <div class="row-flex">
          <div
            class="statistic-card size2-card"
            v-for="(item, index) in pictureList"
            :key="item.index"
            @click="previewImg(item.src)"
          >
            <img
              class="icon"
              src="https://image.smxzhcs.cn/smxsc/M00/2C/DF/CqDIlGVMpq2AR05ZAAACul9brhY625.png"
            >
            <div class="item-title">{{ item.title }}</div>
            <div class="item-button" style="margin-left: auto">查看</div>
          </div>
          <div
            class="statistic-card size2-card"
            v-for="(item, index) in relevantPdf"
            :key="item.index"
            @click="previewOther(item)"
          >
            <img
              class="icon"
              src="https://image.smxzhcs.cn/smxsc/M00/2C/E1/CqDIk2VMpqWAUX0gAAADkvrIDd0808.png"
            >
            <div class="item-title">{{ item.name }}</div>
            <div class="item-button" style="margin-left: auto">查看</div>
          </div>
        </div>
      </el-card>
    </template>
    <previewOnline
      :visible.sync="preview.visible"
      :file-url="preview.fileUrl"
      :file-title="preview.fileTitle"
    />
    <select-invoice
      :visible.sync="selectInvoiceVisible"
      :checked-ids="relateInvoiceList.map(v=>v.entity.id)"
      @confirm="onSelectInvoiceResult"
    />
    <file-oversize-pop :visible.sync="showFileOversizePop" />
  </div>
</template>

<script>
import request from '@/utils/request'

import {
  getOtherOrdersDetail,
  ccdExsOrderTaxStatistic,
  getExsOrderPageByUser
} from "@/api/business/expenseAccount";
import { APIcreateFlowTask } from '@/api/cicada/oa';
import { additionPrintListByOrder } from "@/api/business/businessApproval";
import { FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
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
import { checkInvoiceStatus } from '@/utils/cicada';
import { InvoiceNumberField, openFileOrFiles } from '@/utils/cicada';
import _ from 'lodash';
import IdImage from "@/components/IdImage/index.vue";
import InvoiceTag from './InvoiceTag.vue'
import InvoiceFile from './InvoiceFile.vue'
import SelectInvoice from "@/views/approvalCenter/components/selectInvoice.vue";
import { autoAddCashPrefix } from '@/utils/format'
import FileOversizePop from "@/views/userFolderManage/component/fileOversizePop.vue";

export default {
  name: 'ApplyPrint',
  components: { FileOversizePop, HtmlDetailDialog, previewOnline, optionalBatchPrint, IdImage, InvoiceTag, InvoiceFile, SelectInvoice },
  mixins: [baseMixin],
  props: {
    orderId: {
      type: String,
      required: true
    },
    noSubmit: {
      type: Boolean,
      default: false
    },
    inc: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      data: {},
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
      showFileOversizePop: false,
      detailData: {},
      dataList: [],
      orderType: '',
      title: '',
      invoiceList: [],
      applyDataList: [],
      receipts: [],
      pictureList: [],
      relevantPdf: [],
      applyFidsList: [],
      invoiceDataList: [],
      hasPaperInvoice: false,
      invoiceListNew: [],
      groupedInvoiceList: [],
      relateInvoiceList: [],
      selectInvoiceVisible: false,
    }
  },
  computed: {
    exsFids: {
      get() {
        return this.data?.formData?.exsFids ? this.data?.formData?.exsFids.split(',') : [];
      },
      set(value) {
        this.onSave('exsFids', value.join(','));
      }
    }
  },
  watch: {
    'inc': {
      handler() {
        this.loadData();
      }
    },
    'data.formData.invoiceIds': {
      async handler(newVal) {
        if (newVal) {
          this.relateInvoiceList = await Promise.all(newVal.split(',').map(v => getInvoiceDetail(v).then(res => ({ ...res.data, statusEn: checkInvoiceStatus(res.data.entity.checkType, res.data.entity.checkStatus) }))));
        } else {
          this.relateInvoiceList = [];
        }
      },
      immediate: true
    },

  },
  created() {
    if (this.orderId) {
      this.loadPageData();
    }
  },
  methods: {
    autoAddCashPrefix,
    onSelectInvoiceResult(rows) {
      console.log("选中发票===============>", rows);
      this.onSave('invoiceIds', rows.map(v => v.id).join(','));
    },
    deleteInvoice(id) {
      this.onSave('invoiceIds', this.data.formData.invoiceIds.split(',').filter(v => v != id).join(','));
    },
    async uploadFile() {
      try {
        const result = await openFileOrFiles(true);
        if (result && result.length > 0) {
          /* let oversize = false;
          // 校验文件小于10M
          for (let i = 0; i < result.length; i++) {
            if (result[i].size > 10 * 1024 * 1024) {
              oversize = true;
              break;
            }
          }
          if (oversize) {
            this.showFileOversizePop = true;
            return;
          } */
          const res = await Promise.all(result.map(v => {
            const formData = new FormData();
            formData.append('file', v);
            return request({
              url: "/api/biz/ccdFile/uploader",
              method: 'POST',
              data: formData,
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }).then(res => {
              return res.data.id;
            });
          }));
          this.exsFids = [...this.exsFids, ...res]
        }
      } catch (e) {
        console.log("e", e);
      }
    },
    deleteExsFidsItem(id) {
      this.exsFids = this.exsFids.filter(v => v != id)
    },
    onSave(key, value) {
      console.log("key", key, value);
      if (key == 'submitSignFids' || key == 'contractFids') {
        let json = parseJsonObj(this.data.formData.detailJson);
        json[key] = value;
        this.data.formData.detailJson = JSON.stringify(json);
      } else {
        this.$set(this.data.formData, key, value);
      }
      APIcreateFlowTask({
        ...this.data
      }).then(res => {
        if (res.code === 200) {
          this.$message.success("操作成功");
          this.$emit('update');
        }
      })
    },
    async loadData() {
      await FlowBeforeInfo(this.orderId).then(res => {
        this.data = {
          id: this.orderId,
          formData: { ...res.data.formData },
          flowId: res.data.flowTemplateInfo.id,
          candidateType: 1,
          flowUrgent: 1,
          status: 1,
        };
        this.detailData = res.data.formData;
      })
    },
    // 请求报销单详情接口，获取报销单模板id，发票id，申请单id，申请单附件文件，报销单附件文件（全部初始数据处理）
    async getExsOrderDetail() {
      await FlowBeforeInfo(this.orderId).then(async res => {
        this.data = {
          id: this.orderId,
          formData: { ...res.data.formData },
          flowId: res.data.flowTemplateInfo.id,
          candidateType: 1,
          flowUrgent: 1,
          status: 1,
        };
        this.detailData = res.data.formData;
        let data = res.data.formData;
        if (data.basePrintdevId) {
          // 主打印信息
          this.dataList.push({ formId: this.orderId, templateId: data.basePrintdevId, orderType: data.orderType, panelId: "0", title: "" })
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
        this.getCcdExsOrderTaxStatistic();
        // this.getInvoiceDetail();
        this.getInvoiceList();
        this.getCertificateList();
        this.updateRelevantList(); // 获取申请附件和相关资料，并加载数据
      } finally {
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
    getInvoiceList() {
      if (!this.detailData?.invoiceIds) return;
      const invoiceIdArr = this.detailData.invoiceIds.split(",");
      Promise.all(invoiceIdArr.map(v => getInvoiceDetail(v).then(res => res.data))).then(arr => {
        const newArr = arr.filter(
          (vv, index, self) => !vv.entity.groupId || self.findIndex(item => item.entity.groupId === vv.entity.groupId) === index,
        );
        newArr.forEach(element => {
          element.statusEn = checkInvoiceStatus(element.entity.checkType, element.entity.checkStatus);
          element.field = InvoiceNumberField[_.camelCase(element.type)];
        });
        this.groupedInvoiceList = newArr;
      })
    },
    // 请求发票详情接口-获取发票和查验，并下载获取url
    getInvoiceDetail() {
      if (this.detailData.invoiceIds) {
        console.log("发票*****", this.detailData.invoiceIds);
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
    // 查询银行付款证明
    async getCertificateList() {
      if (this.detailData.paymentOrderFid) {
        const list = this.detailData.paymentOrderFid.split(",").map(v => ({ id: v })) || [];
        await this.downloadFromId(list);
        this.payCertificateList = list;
      } else {
        this.payCertificateList = [];
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
      const method = getExsOrderPageByUser;
      await method({ ...this.queryData, ...this.listQuery }).then(res => {
        this.pageList = res.data.records;
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
          path: "/expenseAccountPrintDetail",
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
.statistic-card {
  background: #f9fbff;
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
    color: #fa914b;
  }
  .color2 {
    color: #00b4c4;
  }
  .item-title {
    line-height: 20px;
    font-weight: bold;
    color: #292c33;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }
  .item-button {
    word-break: keep-all;
    line-height: 20px;
    color: #00b4c4;
  }
}
.my-s-card-container{
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  .my-s-card{
    width: 49.2%;
    text-align: left;
    background: transparent;
    padding:0;
    .delete-file-btn{
      color:#00b4c4;
      font-size:14px;
      padding: 0 6px;
      cursor: pointer;
    }
  }
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
.icon {
  width: 20px;
  height: 20px;
  margin-right: 3px;
  margin-bottom: 3px;
}
.custom-center-empty-card {
  background-color: #fff;
  margin-bottom: 12px;
  border-radius: 8px;
  padding: 20px;
  .flex-row-center {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .custom-center-upload-con-1 {
    flex-direction: column;
  }
  .custom-center-upload-con {
    border-radius: 8px;
    border: 1px dashed #00b4c4;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 120px;
    font-weight: 500;
    font-size: 14px;
    color: #292c33;
    cursor: pointer;
    margin-bottom: 12px;
    .c-upload-icon {
      margin-right: 8px;
    }
    .upload-info {
      margin-top: 8px;
      color: #969799;
      font-size: 12px;
      line-height: 16px;
    }
  }
  .custom-app-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    .custom-app-title-text {
      font-size: 16px;
      font-weight: bold;
      color: #292c33;
    }
    .custom-app-title-btn {
      cursor: pointer;
      font-size: 14px;
    }
  }
  .custom-invoice-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    .custom-invoice-item {
      width: 49%;

      background: #fff;
      border-radius: 8px;
      border: 1px solid #edeff2;
      padding: 8px;
      margin-bottom: 12px;
      position: relative;
      .el-icon-circle-close {
        position: absolute;
        right: -8px;
        top: -8px;
        cursor: pointer;
        font-size: 22px;
        color: #00b4c4;
      }
      .custom-invoice-item-top{
        height: 40px;
      }
      .custom-invoice-item-top,
      .custom-invoice-item-bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .custom-invoice-item-top-left {
        font-weight: bold;
      }
      .custom-invoice-item-content {
        font-size: 14px;
        > div {
          margin-bottom: 8px;
        }
      }
      .custom-invoice-item-bottom {
        margin: 0 -8px;
        padding: 14px 8px 6px 8px;
        border-top: 1px solid #edeff2;
        margin-top: 8px;
        .custom-invoice-item-bottom-left {
          color: #919499;
        }
        .custom-invoice-item-bottom-right {
          display: flex;
          align-items: center;
          font-weight: bold;
        }
        .custom-invoice-item-bottom-icon {
          width: 18px;
          height: 18px;
          margin-right: 8px;
        }
      }
    }
  }
}
.list-invoice-container {
  .invoice-item-row {
    background: #f4f8f9;
    border-radius: 8px;
    border: 1px solid #edeff2;
    padding: 8px;
    margin-bottom: 12px;
    .invice-item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .nvice-item-top-right {
        display: flex;
        align-items: center;
      }
    }
  }
  .list-invoice-item-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .list-invoice-item {
      flex: 1;
      &:first-child {
        margin-right: 16px;
      }
    }
  }
}
.status {
  margin: 0 10px;
  font-size: 14px;
  font-weight: 400;
  line-height: 40px;
  white-space: nowrap;
}
.orange {
  color: #fa914b;
}
.gray {
  color: #919499;
}
.success {
  color: #00b4c4;
}
.fail {
  color: #f05248;
}

.size3-card {
  height: 268px;
  background: #f4f6fa;
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
  background: #f4f6fa;
  border-radius: 12px;
  width: 100%;
  padding: 20px;

  .small {
    height: 365px;
    width: auto;
    margin-right: 2%;
    margin-bottom: 10px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #eaeef5;
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
  background: rgba(41, 44, 51, 0.6);
  border-radius: 0 0 12px 12px;
  position: absolute;
  bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: #ffffff;
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
</style>
