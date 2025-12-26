<template>
  <div v-loading="loading">
    <el-card header="支付信息">
      <div class="row-container">
        <div class="item">报销单名称：<span class="text-bold">{{ title }}</span></div>
        <div class="item">报销单总金额：<span class="text-bold">{{ exsCost }}</span></div>
        <div class="item">推送状态：<span :class="{'text-red' : payPushStatus === 0, 'text-green' : payPushStatus === 1}">{{ payPushStatusStr }}</span></div>
      </div>
      <el-form style="margin-top: 10px;" ref="form" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="报销单类型" prop="provinceBillType">
          <el-select v-model="formData.provinceBillType" placeholder="请选择" @change="onSelectChange">
            <el-option v-for="item in billTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="btn-container">
        <el-button v-if="payPushStatus === 0" class="btn" type="primary" @click="onAdd">添加支付信息</el-button>
        <el-button v-if="payPushStatus === 0" class="btn" type="primary" @click="onPush" :loading="submitLoading">推送到预算一体化</el-button>
        <el-button v-if="payPushStatus === 1" class="btn" type="primary" @click="onRevoke">撤回推送</el-button>
      </div>
      <JNPF-table
        class="table"
        :data="treeList"
        row-key="id"
        :has-n-o="false"
        :default-expand-all="true"
        :tree-props="{children: 'cardReimbursementInfoVOList', hasChildren: ''}"
      >
        <el-table-column prop="index" width="80" label="序号" />
        <el-table-column prop="payMoney" width="120" label="申请支付金额" />
        <el-table-column prop="paymentTypeStr" width="120" label="支付类型" />
        <el-table-column prop="payeeUserName" width="120" label="收款人姓名" />
        <el-table-column prop="payeeNo" width="150" label="收款银行卡号" />
        <el-table-column prop="payeeBankName" min-width="120" label="银行开户行" />
        <el-table-column prop="payStatusStr" width="120" label="付款状态" />
        <el-table-column prop="useDes" width="120" label="用途" />
        <el-table-column prop="bizCardDate" width="120" label="刷卡日期" />
        <el-table-column v-if="payPushStatus === 0" label="操作" width="240">
          <template slot-scope="scope">
            <tableOpts
              @edit="handleEdit(scope.row)"
              @del="handleDel(scope.row)"
            >
              <el-button v-if="scope.row.paymentType === 2 && !scope.row.costId" type="text" slot="center" @click="onAddBizCardPayInfo(scope.row)">新增公务卡支付明细</el-button>
            </tableOpts>
          </template>
        </el-table-column>
      </JNPF-table>
    </el-card>
    <div class="order-detail-container">
      <el-card class="pay-container" v-if="exsPayList.length > 0">
        <div slot="header" class="row-flex">
          <div class="sub-title">支付明细</div>
        </div>
        <JNPF-table
          class="table"
          :data="exsPayList"
          :border="true"
        >
          <el-table-column prop="payeeName" label="姓名" />
          <el-table-column prop="payeeWay" label="转账类型" />
          <el-table-column prop="payeeCost" label="金额" />
        </JNPF-table>
      </el-card>
      <el-card class="flex1">
        <div slot="header" class="row-flex">
          <div class="sub-title">报销单明细</div>
        </div>
        <div class="size4-card" style="text-align: center;" v-for="item in dataList" :key="item.id">
          <h4 style="margin-bottom: 10px;cursor: pointer;" @click="showTemplateDetail(item)">{{ item.title }}</h4>
          <el-image style="max-width: 297mm" :src="item.url" :preview-src-list="[item.url]" />
        </div>
        <div class="size4-card" style="text-align: center;" v-if="receipts && receipts.length > 0">
          <h4 style="margin-bottom: 10px">结算信息票据附件</h4>
          <el-image v-for="(item,index) in receipts" :key="index" style="max-width: 297mm" :src="item.fidUrl" :preview-src-list="[item.fidUrl]" />
        </div>
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
        <el-card class="size1" v-if="payCertificateList.length > 0">
          <div slot="header" class="row-flex">
            <div class="sub-title">记账凭证</div>
          </div>
          <div class="row-flex">
            <div class="statistic-card size2-card" v-for="item in payCertificateList" :key="item.src" @click="previewFile(item)">
              <div class="item-title">{{ item.title }}</div>
              <div class="item-button" style="margin-left: auto">查看</div>
            </div>
          </div>
        </el-card>
        <el-card class="size4" v-if="invoiceList.length > 0">
          <div slot="header" class="row-flex">
            <div class="sub-title">发票</div>
          </div>
          <div class="size3-card" v-for="item in invoiceList" :key="item.id">
            <embed v-if="item.previewOnlineUrl" style="width: 66%;margin-right: 10px;" :src="item.previewOnlineUrl">
            <el-image v-else style="width: 66%;margin-right: 10px;" :src="item.src" :preview-src-list="[item.src]" />
            <div class="invoice-bar black-bar">
              <div>{{ item.title }}</div>
              <div v-if="item.previewOnlineUrl" style="cursor: pointer" @click="previewOther(item)">点击放大查看</div>
              <div v-if="item.isElectronicInvoice === 1" @click="downloadSingleFile(item.title, item.url)" style="cursor: pointer">发票原件下载</div>
            </div>
            <el-image style="flex: 1" v-if="item.checkSrc" fit="cover" :src="item.checkSrc" :preview-src-list="[item.checkSrc]" />
            <div class="check-bar black-bar">
              <div>{{ item.title }}查验</div>
            </div>
          </div>
        </el-card>
      </el-card>
    </div>
    <HtmlDetailDialog :loading="htmlDetail.loading" :visible.sync="htmlDetail.visible" :html="htmlDetail.data" />
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
    <add-pay-info
      :visible.sync="addType.visible"
      :loading="addType.loading"
      :data="addType.data"
      :order-id="orderId"
      @confirm="loadTreeData"
    />
    <add-biz-card-pay-info
      :visible.sync="addBizCardPayInfo.visible"
      :loading="addBizCardPayInfo.loading"
      :data="addBizCardPayInfo.data"
      @confirm="loadTreeData"
    />
  </div>
</template>
<script>
import { FlowBeforeInfo } from "@/api/workFlow/FlowBefore";
import { additionPrintListByOrder, getUserFilesByIds } from "@/api/business/businessApproval";
import { editExsOrder, getOtherOrdersDetail } from "@/api/business/expenseAccount";
import { getInvoiceDetail } from "@/api/business/pasteTicket";
import { downloadFile } from "@/api/business/signature";
import { parseJsonObj } from "@/components/Cicada/printHelper";
import baseMixin from "@/mixins/print/baseMixin";
import HtmlDetailDialog from "@/views/expenseAccountManage/components/HtmlDetailDialog.vue";
import previewOnline from "@/components/preview-online/index.vue";
import { saveAs } from "file-saver";
import AddPayInfo from "@/views/payInfoManagement/components/addPayInfo.vue";
import AddBizCardPayInfo from "@/views/payInfoManagement/components/addBizCardPayInfo.vue";
import {
  getCcdBankCardReimbursementEntity,
  postCcdBankCardReimbursementEntityRemove,
  postCcdBusinessCardReimbursementEntityRemove, postDeleteReimburseData, postSaveReimburseDatas
} from "@/api/business/payInfoManagement";
import { getDicts } from "@/api/common";

export default {
  name: 'payInfoDetail',
  components: { AddBizCardPayInfo, AddPayInfo, previewOnline, HtmlDetailDialog },
  mixins: [baseMixin],
  data() {
    return {
      orderId: '',
      title: '',
      exsCost: '',
      payPushStatus: 0,
      payPushStatusStr: '',
      // 所有模板列表，dataList中，id为模版id；title为要展示区域的标题；
      dataList: [],
      detailData: {}, // 报销单详情数据
      applyFidsList: [], // 所有报销单关联的审批单的附件
      invoiceList: [], // 发票图片列表，其中有电子发票的，可以下载
      invoiceDataList: [], // 电子发票模版
      pictureList: [], // 其他图片列表
      relevantInfoList: [], // 相关资料中，非图片部分，点击下载；图片部分直接塞入pictureList去进行展示
      relevantPdf: [], // 相关资料中的非图片
      applyDataList: [], // 申请模版列表
      exsOrderList: [], // 报销单列表（目前就请款单）
      receipts: [], // 结算单附件图片
      treeList: [],
      payCertificateList: [],
      htmlDetail: {
        visible: false,
        loading: false,
        data: ''
      },
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
      loading: false,
      addType: {
        visible: false,
        loading: false,
        data: {},
      },
      addBizCardPayInfo: {
        visible: false,
        loading: false,
        data: {},
      },
      formData: {
        provinceBillType: undefined
      },
      rules: {
        provinceBillType: [{ required: true, message: '请选择' }],
      },
      billTypeOptions: [],
      submitLoading: false
    }
  },
  computed: {
    exsPayList() {
      if (this.detailData && this.detailData.detailJson) {
        const detailJson = this.detailData.detailJson;
        const detail = JSON.parse(detailJson);
        if (detail.exsPayList && detail.exsPayList.length > 0) {
          return detail.exsPayList;
        }
      }
      return [];
    }
  },
  created() {
    this.orderId = this.$route.query.id;
    if (this.orderId) {
      this.loadPageData();
      this.loadTreeData();
      this.loadBillTypeOptions();
    }
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      console.log("activated");
      if (this.orderId === this.$route.query.id) {
        return;
      }
      this.orderId = this.$route.query.id || "";
      // 下面这些容器需要先置空，否则会累加其他页面的数据
      this.dataList = [];
      this.invoiceList = [];
      this.applyDataList = [];
      this.exsOrderList = [];
      this.invoiceDataList = [];
      this.receipts = [];
      this.detailData = {}
      this.applyFidsList = [];
      this.pictureList = [];
      this.relevantInfoList = [];
      this.relevantPdf = [];
      this.treeList = [];
      this.payCertificateList = [];
      this.title = "";
      this.exsCost = "";
      if (this.orderId) {
        this.loadPageData();
        this.loadTreeData();
        this.loadBillTypeOptions();
      }
    }
  },
  methods: {
    // 重新加载整个页面的数据, 包括: 下拉源,用印表格,签名表格,模板,基本信息等
    async loadPageData() {
      this.loading = true;
      try {
        // 先获取报销单模板id
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
    loadBillTypeOptions() {
      getDicts('provinceBillType').then(res => {
        this.billTypeOptions = res.data.list.map(v => ({ value: v.id, label: v.fullName }));
      });
    },
    loadTreeData() {
      getCcdBankCardReimbursementEntity({ orderId: this.orderId }).then(res => {
        const data = res.data;
        this.title = data.name;
        this.exsCost = data.exsCost;
        this.payPushStatus = data.payPushStatus;
        this.payPushStatusStr = data.payPushStatusStr;
        const list = data.cardReimbursementInfoVOList || [];
        for (let i = 0; i < list.length; i++) {
          list[i].id = list[i].rpayId;
          list[i].index = i + 1;
          const subList = list[i].cardReimbursementInfoVOList || [];
          for (let j = 0; j < subList.length; j++) {
            subList[j].id = subList[j].rpayId + subList[j].costId;
          }
        }
        this.treeList = list;
      });
    },
    async getExsOrderDetail() {
      await FlowBeforeInfo(this.orderId).then(async res => {
        this.detailData = res.data.formData;
        this.formData.provinceBillType = this.detailData.provinceBillType;
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
            // 查看是否电子发票，有的话塞成url
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
    // 结算单小票附件
    async loadReceipts(ids, token) {
      let ret = {}
      try {
        const headers = token ? { Authorization: token } : {}
        const res = await getUserFilesByIds(ids, headers);
        ret = res.data || {};
      } catch (e) {
        console.warn(e)
      }
      return ret;
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
    async showTemplateDetail(v) {
      Object.assign(this.htmlDetail, { visible: true, loading: true, data: '' })
      const html = await this.templateToHtmlWithoutSign(v.templateId, v.formId, v.orderType, v.panelId === "0" ? "" : v.panelId)
      Object.assign(this.htmlDetail, { visible: true, loading: false, data: html })
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
    downloadSingleFile(name, url) {
      this.$confirm('确认下载该文件?', '提示', {
        type: 'warning'
      }).then(() => {
        saveAs(url, name);
        this.$message.success("下载中，请在浏览器下载列表中查看");
      });
    },
    handleEdit(row) {
      if (row.costId) {
        // 公务卡支出明细
        this.addBizCardPayInfo.visible = true;
        this.addBizCardPayInfo.data = { ...row };
      } else {
        // 支付明细
        this.addType.visible = true;
        this.addType.data = { ...row };
      }
    },
    handleDel(row) {
      this.$confirm('确定要删除此条明细？', '提示', {
        type: 'warning'
      }).then(() => {
        const request = row.costId ? postCcdBusinessCardReimbursementEntityRemove({ costId: row.costId }) : postCcdBankCardReimbursementEntityRemove({ rpayId: row.rpayId });
        request.then(() => {
          this.$message.success("删除成功");
          this.loadTreeData();
        });
      })
    },
    onAdd() {
      this.addType.visible = true;
      this.addType.data = {};
    },
    onPush() {
      // 检查是否有报销单类型字段
      this.$refs.form.validate(valid => {
        if (valid) {
          // 检查支付信息
          // 检查推送金额与报销单总金额是否一致
          // 检查用途、账号、开户行信息是否填写
          let pushAmount = 0;
          for (let i = 0; i < this.treeList.length; i++) {
            const item = this.treeList[i];
            // 检查用途、账号、开户行信息是否完成
            if (!item.useDes || !item.payeeNo || !item.payeeBankName) {
              if (!item.payeeNo) {
                this.$message.error("请填写" + item.payeeUserName + "收款银行账号！");
                return;
              }
              if (!item.payeeBankName) {
                this.$message.error("请填写" + item.payeeUserName + "银行开户行！");
                return;
              }
              if (!item.useDes) {
                // this.$message.error("请填写" + item.payeeUserName + "用途！");
                this.$message.error("请填写" + item.payeeUserName + "的付款用途！");

                return;
              }
            }
            pushAmount += item.payMoney;
            const list = item.cardReimbursementInfoVOList || [];
            // 公务卡校验明细总金额和公务卡支付金额是否一致
            if (item.paymentType === 2) {
              if (list.length === 0) {
                this.$message.error("请给" + item.payeeUserName + "公务卡添加支付明细！");
                return;
              }
              let subAmount = 0;
              for (let j = 0; j < list.length; j++) {
                subAmount += list[j].payMoney;
              }
              if (subAmount !== item.payMoney) {
                this.$message.error(item.payeeUserName + "公务卡支付金额与公务卡支付明细总金额不一致！");
                return;
              }
            }
          }
          if (pushAmount !== this.exsCost) {
            // console.log('onPush', { pushAmount, exsCost: this.exsCost });
            /* this.$confirm('推送金额与总金额不一致，是否推送？', '提示', {
              type: 'warning'
            }).then(() => {
              postSaveReimburseDatas(this.orderId).then(() => {
                this.$message.success("推送成功");
                this.loadTreeData();
              })
            }) */
            this.$message.error("支付总金额与报销单金额不匹配！");
            return;
          }
          this.submitLoading = true;
          postSaveReimburseDatas(this.orderId).then(() => {
            this.submitLoading = false;
            this.$message.success("推送成功");
            this.loadTreeData();
          }).finally(() => {
            this.submitLoading = false;
          })
        }
      });
    },
    onRevoke() {
      postDeleteReimburseData(this.orderId).then(() => {
        this.$message.success("已撤回推送");
        this.loadTreeData();
      })
    },
    onAddBizCardPayInfo(row) {
      this.addBizCardPayInfo.visible = true;
      this.addBizCardPayInfo.data = {
        rpayId: row.rpayId,
      };
    },
    onSelectChange() {
      // 保存报销单中此字段
      editExsOrder({ id: this.detailData.id, provinceBillType: this.formData.provinceBillType }).then(() => {
        this.$message.success("保存成功");
      });
    }
  },
}
</script>
<style lang="scss" scoped>
.table {
  min-height: 300px;
}
.row-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 10px 40px;
  .item {
    word-break: keep-all;
    white-space: nowrap;
    .text-red {
      color: red;
    }
    .text-green {
      color: green;
    }
    .text-bold {
      font-weight: 600;
    }
  }
  .item + .item {
    margin-left: 40px;
  }
}
.btn-container {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 10px 40px;
  .btn + .btn {
    margin-left: 15px;
  }
}
.order-detail-container {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  .pay-container {
    width: 400px;
    margin-right: 5px;
  }
  .flex1 {
    flex: 1;
  }
    .size1 {
      height: 217px;
      margin-bottom: 20px;
      overflow: auto;
    }
    .size4-card {
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
    .size3 {
      height: 531px;
      margin-bottom: 20px;
      overflow: auto;
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
  .icon {
    width: 20px;
    height: 20px;
    margin-right: 3px;
    margin-bottom: 3px;
  }
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
</style>
