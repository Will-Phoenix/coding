<template>
  <div :style="pageStyle" t="pageStyle">
    <div v-for="(p,index) in printList" :key="'b_'+index" :style="areaStyle" t="areaStyle">
      <div :style="areaTitleStyle" t="areaTitleStyle">{{ p.title }}</div>
      <print-template-detail
        t="print-template-detail"
        v-if="p.templateDetail.printTemplate"
        ref="printTemplateDetail"
        :page-param="p.templateDetail.pageParam"
        :print-template="p.templateDetail.printTemplate"
        :data="p.templateDetail.printData"
        :stamp-list="p.stampTableData"
        :sign-list="p.signTableData"
        :draggable="false"
      />
    </div>
    <div v-for="(p,index) in applyOrderFileList" :key="'spd_'+index" :style="areaStyle" t="areaStyle">
      <div :style="areaTitleStyle" t="areaTitleStyle">{{ p.title }}</div>
      <div :style="imageWrapperStyle" t="imageWrapperStyle" v-if="p.type=='image'">
        <img :style="imageStyle" t="imageStyle" :src="p.url">
      </div>
      <div :style="fileWrapperStyle" t="fileWrapperStyle" v-else>
        <embed :src="p.previewUrl" style="width: 100vw;height: 40vh;">
      </div>
    </div>
    <div v-for="(p,index) in contractFileList" :key="'contract_'+index" :style="areaStyle" t="areaStyle">
      <div :style="areaTitleStyle" t="areaTitleStyle">{{ p.title }}</div>
      <div :style="imageWrapperStyle" t="imageWrapperStyle" v-if="p.type=='image'">
        <img :style="imageStyle" t="imageStyle" :src="p.url">
      </div>
      <div :style="fileWrapperStyle" t="fileWrapperStyle" v-else>
        <embed :src="p.previewUrl" style="width: 100vw;height: 40vh;">
      </div>
    </div>
    <div v-for="(p,index) in submitSignList" :key="'cpq_'+index" :style="areaStyle" t="areaStyle">
      <div :style="areaTitleStyle" t="areaTitleStyle">{{ p.title }}</div>
      <div :style="imageWrapperStyle" t="imageWrapperStyle">
        <img :style="imageStyle" t="imageStyle" :src="p.url">
      </div>
    </div>
    <div v-for="(p,index) in invoiceList" :key="'in_'+index" :style="areaStyle" t="areaStyle">
      <div :style="areaTitleStyle" t="areaTitleStyle">{{ p.title }}</div>
      <template v-if="p.isElectronicInvoice && invoicePrintObj">
        <print-template-detail
          t="print-template-detail"
          ref="printTemplateDetail2"
          :page-param="invoicePrintObj.templateDetail.pageParam"
          :print-template="invoicePrintObj.templateDetail.printTemplate"
          :data="invoicePrintObj.templateDetail.printData"
          :stamp-list="invoicePrintObj.stampTableData"
          :sign-list="invoicePrintObj.signTableData"
          :background="p.imgFile.url"
          :draggable="false"
        />
      </template>
      <div :style="fileWrapperStyle" t="fileWrapperStyle" v-else-if="p.isElectronicInvoice">
        <embed :src="p.previewOnlineUrl" style="width: 100vw;height: 40vh;">
      </div>
      <div :style="imageWrapperStyle" t="imageWrapperStyle" v-else-if="p.imgFile">
        <img :style="imageStyle" t="imageStyle" :src="p.imgFile.url">
      </div>
      <div :style="imageWrapperStyle" t="imageWrapperStyle" v-for="(item, i) in p.chectSrcList" :key="i">
        <img :style="imageStyle" t="imageStyle" :src="item.url">
      </div>
    </div>
    <div v-for="(p,index) in extraFileList" :key="'exs_'+index" :style="areaStyle" t="areaStyle">
      <div :style="areaTitleStyle" t="areaTitleStyle">{{ p.title }}</div>
      <div :style="imageWrapperStyle" t="imageWrapperStyle" v-if="p.type=='image'">
        <img :style="imageStyle" t="imageStyle" :src="p.url">
      </div>
      <div :style="fileWrapperStyle" t="fileWrapperStyle" v-else>
        <embed :src="p.previewUrl" style="width: 100vw;height: 40vh;">
      </div>
    </div>
    <div v-for="(p,index) in receipts" :key="'exs_'+index" :style="areaStyle" t="areaStyle">
      <div :style="areaTitleStyle" t="areaTitleStyle">结算信息票据附件<span v-if="receipts.length>1">{{ index+1 }}</span></div>
      <div :style="imageWrapperStyle" t="imageWrapperStyle">
        <img :style="imageStyle" t="imageStyle" :src="p.fidUrl">
      </div>
    </div>
  </div>
</template>
<script>
import PrintTemplateDetail from '@/components/Cicada/PrintTemplateDetail.vue'
import baseMixin from '@/mixins/print/baseMixin'
import { autoInjectConsole } from '@/utils'

// 页面: h5打印预览, 注意: 本文件内不能有class, 样式只能写内联, 因为涉及到了打印
export default {
  name: "previewH5print",
  components: { PrintTemplateDetail },
  mixins: [baseMixin],
  data() {
    return {
      // 打印模板列表
      printList: [],
      // 发票模版对象
      invoicePrintObj: null,
      // 审批单附件列表
      applyOrderFileList: [
        // fileExtension:"jpeg" , fileSize:"1.54M" , name:"3DU2tWzyWR5cee17f97c7248fbf6c98878e766326a22.jpeg" , title:"附件图片-1", url
      ],
      // 合同
      contractFileList: [
        // {"id":"515414284675677701","name":"批量2222.pdf","url":"https://testminio.smxzhcs.cn:30060/jnpfsoftoss/xy-cicada/public/WebAnnexFile/65a08d47d5de34f9e1e573f1.pdf","fileSize":"625.49K","fileExtension":"pdf","title":"合同附件-1","previewUrl":"https://saas.smxzhcs.cn/kkfileview/onlinePreview?url=aHR0cHM6Ly90ZXN0bWluaW8uc214emhjcy5jbjozMDA2MC9qbnBmc29mdG9zcy94eS1jaWNhZGEvcHVibGljL1dlYkFubmV4RmlsZS82NWEwOGQ0N2Q1ZGUzNGY5ZTFlNTczZjEucGRm"}
      ],
      // 呈批签图片列表
      submitSignList: [
        // {"id":"515414367907446277","name":"58pjTRtffIjRa735618271116fea20ed6c290ccaf565.jpg","url":"https://testminio.smxzhcs.cn:30060/jnpfsoftoss/xy-cicada/public/WebAnnexFile/65a08d5bd5de34f9e1e573f2.jpg","fileSize":"149.49K","fileExtension":"jpg","title":"呈批签附件图片-1"}
      ],
      // 发票以及查验凭证列表
      invoiceList: [
        // { title:'发票1以及查验凭证' , imgFile:{fileExtension:"jpeg" , fileSize:"1.54M" , name:"3DU2tWzyWR5cee17f97c7248fbf6c98878e766326a22.jpeg", url, isElectronicInvoice}, chectFile:{...略} }
      ],
      // 相关资料(图片+其他)
      extraFileList: [],
      formData: {},
      receipts: [], // 结算单附件图片
    };
  },
  computed: {
    pageStyle() {
      return {
        "box-sizing": "border-box",
        'padding-bottom': '10mm'
      }
    },
    areaStyle() {
      return {
        "box-sizing": "border-box",
        "padding-left": "2mm",
        "padding-right": "2mm",
        "padding-top": '2mm',
        "padding-bottom": "8mm"
      }
    },
    areaTitleStyle() {
      return {
        "box-sizing": "border-box",
        "font-size": "5mm",
        "font-weight": "800",
        "padding": "0 0 2mm 0",
        "text-align": "center"
      }
    },
    imageWrapperStyle() {
      return {
        "font-size": '0',
        "width": '210mm',
        "margin": "2mm auto 0 auto"
      }
    },
    fileWrapperStyle() {
      return {
        "font-size": '0',
        "margin": "2mm auto 0 auto"
      }
    },
    imageStyle() {
      // A4 210mm×297mm
      return {
        "max-width": '210mm',
        "max-height": '297mm',
        "object-fit": "contain"
      }
    }
  },
  async created() {
    const title = this.$route.query.title || '';
    if (title) {
      document.title = title;
    }
    this.token = this.$route.query.token || '';
    this.templateId = this.$route.query.templateId || '';
    this.formId = this.$route.query.formId || '';
    this.orderType = this.$route.query.orderType || '';
    if (this.$route.query.hasConsole === 'true') {
      await autoInjectConsole();
    }
    this.init();
    this.fixTouchZoom()
  },
  methods: {
    async init() {
      const loading = this.$loading({
        lock: true,
        text: '拼命加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.1)'
      });
      try {
        await this.loadData()
      } catch (e) {
        console.error(e)
      } finally {
        loading.close();
      }
    },
    async loadData() {
      console.log('loadData')
      this.printList = [];
      this.invoicePrintObj = null
      this.applyOrderFileList = [];
      this.invoiceList = [];
      this.contractFileList = [];
      this.submitSignList = [];
      this.extraFileList = [];
      const { formData } = await this.loadFormDetail({ token: this.token, formId: this.formId })
      if (this.templateId) {
        // 主打印信息
        const mainPrintInfo = await this.loadDataDetail({ token: this.token, formId: this.formId, templateId: this.templateId, orderType: this.orderType, additionPrintId: this.additionPrintId }).then(r => ({ ...r, title: '单据基本信息' }));
        this.printList.push(mainPrintInfo)
      }
      // 其它打印模板(多个)
      const templateArr = await this.loadOtherTemplateList({ token: this.token, additionType: 0, formId: this.formId });
      if (templateArr && templateArr.length > 0) {
        // 其它打印信息(多个)
        const otherPrintInfoArr = await Promise.all((templateArr || []).map(vv => this.loadDataDetail({ token: this.token, formId: this.formId, templateId: vv.basePrintdevId, orderType: this.orderType, additionPrintId: vv.id }).then(r => ({ ...r, title: vv.name }))));
        if (otherPrintInfoArr && otherPrintInfoArr.length > 0) {
          this.printList.push(...otherPrintInfoArr)
        }
      }
      // 特殊情况说明打印模板，跟表单字段有关联，需要判断是否展示
      this.printList = this.printList.filter(v => v.title !== "特殊情况说明" || (v.title === "特殊情况说明" && formData.detailJson && !!JSON.parse(formData.detailJson).specialSituationInfo));
      // 发票模版
      const invoiceArr = await this.loadOtherTemplateList({ token: this.token, additionType: 1, formId: this.formId });
      if (invoiceArr && invoiceArr.length > 0) {
        const invoicePrintInfoArr = await Promise.all((invoiceArr || []).map(vv => this.loadDataDetail({ token: this.token, formId: this.formId, templateId: vv.basePrintdevId, orderType: this.orderType, additionPrintId: vv.id }).then(r => ({ ...r, title: vv.name }))));
        if (invoicePrintInfoArr && invoicePrintInfoArr.length > 0) {
          // 发票模版只会有一个
          this.invoicePrintObj = invoicePrintInfoArr[0];
        }
      }
      if (formData) {
        this.loadApplyOrderPrintList(formData.applyOrderIds);
        this.loadApplyOrderFileList(formData.applyOrderFids);
        this.loadPaymentOrderPrintList(formData.exsOrderIds);
        let detail = null;
        if (formData.detailJson) {
          detail = JSON.parse(formData.detailJson);
        }
        // 关联合同
        this.loadContractFileList(formData.contractFids || (detail && detail.contractFids))
        // 呈批签
        if (formData.submitSignFids) {
          this.loadSubmitSignFileList(formData.submitSignFids);
        } else if (detail && detail.submitSignFids) {
          this.loadSubmitSignFileList(detail.submitSignFids);
        }
        this.loadInvoList(formData.invoiceIds);
        let exsFids = formData.exsFids;
        // 以detailJson里exsFids参数为准
        if (detail && detail.exsFids) {
          exsFids = detail.exsFids;
        }
        this.loadExtraFileList(exsFids);
        // 在这再加载一遍applyFids，是因为，当formId直接为申请单id时，formData返回的就是申请单的详情，需要在这获取applyFids
        // 而当formId为报销单id时，这块代码是放在this.loadApplyOrderPrintList里的
        this.loadExtraFileList(formData.applyFids);
        // 结算信息里面上传的单据图片
        if (detail && detail.bankFids) {
          this.receipts = await this.loadReceipts(detail.bankFids, this.token);
        }
      }
    },
    async loadApplyOrderPrintList(applyOrderIds) {
      if (!applyOrderIds) return;
      const otherOrderArr = await this.loadApplyOrderDetails({ token: this.token, applyOrderIds: applyOrderIds.split(",") });
      // 从申请单详情中获取附件ids，一并当作相关资料进行处理
      let applyFidsList = [];
      otherOrderArr.forEach(v => {
        if (v.applyFids) {
          applyFidsList.push(...v.applyFids.split(","));
        }
      });
      this.loadExtraFileList(applyFidsList.join(","));
      // 下面是申请模板的加载
      if (otherOrderArr && otherOrderArr.length > 0) {
        const spdPrintInfoArr = await Promise.all((otherOrderArr).map(vv => this.loadDataDetail({ token: this.token, formId: vv.id, templateId: vv.basePrintdevId, orderType: vv.orderType, additionPrintId: '' }).then(r => ({ ...r, title: vv.name }))));
        if (spdPrintInfoArr && spdPrintInfoArr.length > 0) {
          this.printList.push(...spdPrintInfoArr)
        }
      }
    },
    // 审批单附件
    async loadApplyOrderFileList(applyOrderFids) {
      if (!applyOrderFids) return;
      const ids = applyOrderFids.split(",");
      const map = await this.loadFileInfos({ token: this.token, ids: ids })
      const arr = (await Promise.all(ids.map((v) => (map[v] || {})).map(async v => {
        if (/^(jpg|jpeg|png|bmp|gif|ico)$/gim.test(v.fileExtension)) {
          return { ...v, type: "image", title: `审批单附件-${v.name}` }
        } else if (/^(txt|doc|docx|pdf|xls|xlsx|ppt|pptx)$/gim.test(v.fileExtension)) {
          const previewUrl = await this.loadPreviewUrl({ fileDownloadUrl: v.url, token: this.token })
          return { ...v, previewUrl, type: "extra", title: `审批单附件-${v.name}` }
        }
      }))).filter(v => v.type)
      if (arr.length > 0) {
        this.applyOrderFileList.push(...arr);
      }
    },
    // 关联的报销单（目前就请款单）
    async loadPaymentOrderPrintList(exsOrderIds) {
      if (!exsOrderIds) return;
      for (const v of exsOrderIds.split(",")) {
        const { formData } = await this.loadFormDetail({ token: this.token, formId: v });
        const paymentOrder = await this.loadDataDetail({ token: this.token, formId: v, templateId: formData.basePrintdevId, orderType: formData.orderType, additionPrintId: '' }).then(r => ({ ...r, title: formData.name }));
        this.printList.push(paymentOrder);
      }
    },
    // 合同附件列表
    async loadContractFileList(contractFids) {
      if (!contractFids) return;
      const ids = contractFids.split(",");
      const map = await this.loadFileInfos({ token: this.token, ids: ids })
      const tempArr = ids.map((v) => (map[v] || {})).filter(v => v.url);
      this.contractFileList = (await Promise.all(tempArr.map(async v => {
        if (/^(jpg|jpeg|png|bmp|gif|ico)$/gim.test(v.fileExtension)) {
          return { ...v, type: "image", title: `合同附件-${v.name}` }
        } else if (/^(txt|doc|docx|pdf|xls|xlsx|ppt|pptx)$/gim.test(v.fileExtension)) {
          const previewUrl = await this.loadPreviewUrl({ fileDownloadUrl: v.url, token: this.token })
          return { ...v, previewUrl, type: "extra", title: `合同附件-${v.name}` }
        }
      }))).filter(v => v.type)
    },
    // 呈批签附件图片列表
    async loadSubmitSignFileList(submitSignFids) {
      if (!submitSignFids) return;
      const ids = submitSignFids.split(",");
      const map = await this.loadFileInfos({ token: this.token, ids: ids })
      this.submitSignList = ids.map((v) => (map[v] || {})).filter(v => v.url).map((v, i) => ({ ...v, title: `呈批签附件图片-${i + 1}` }));
    },
    async loadInvoList(invoiceIds) {
      if (!invoiceIds) return;
      const arr = await this.loadInvoiceList({ token: this.token, ids: invoiceIds.split(",") })
      // 发票以及查验凭证`
      // iList==> [ {imgFid, chectFid } ]
      // 过滤同一发票组的发票，只留一张，即遍历发票组中全部发票
      const newArr = arr.filter((vv, index, self) => !vv.entity.groupId || self.findIndex(item => item.entity.groupId === vv.entity.groupId) === index);
      const iList = newArr.map(v => ({
        // imgFid: v.entity.imgFid,
        fid: v.entity.fid,
        chectFidList: v.entity.groupId ? v.inners.filter(item => !!item.key.chectFid).map(element => element.key.chectFid) : v.entity.chectFid ? [v.entity.chectFid] : [],
        // isElectronicInvoice: v.entity.fid && v.entity.fid !== v.entity.imgFid
      }));
      // iiList ==> [ [发票图片详情,发票查验凭证详情],... ]
      const iiList = await Promise.all(iList.map(async v => {
        const temp = await this.loadFileInfos({ token: this.token, ids: [v.fid, ...v.chectFidList] })
        const chectSrcList = Object.keys(temp).filter(item => item !== v.fid).map(element => temp[element]);
        const isElectronicInvoice = !["jpg", "png", "jpeg"].includes(temp[v.fid].fileExtension);
        let previewOnlineUrl = "";
        if (isElectronicInvoice) {
          // 有了电子发票，存一份kkfile预览的url
          previewOnlineUrl = await this.loadPreviewUrl({ fileDownloadUrl: temp[v.fid].url, token: this.token });
        }
        return [temp[v.fid], chectSrcList, isElectronicInvoice, previewOnlineUrl]
      }))
      // console.log('111111111', { iList, iiList })
      // { title:'发票1以及查验凭证' , imgFile:{fileExtension:"jpeg" , fileSize:"1.54M" , name:"3DU2tWzyWR5cee17f97c7248fbf6c98878e766326a22.jpeg", url}, chectFile:{...略} }
      this.invoiceList = iiList.map((v, i) => {
        return { title: `发票${i + 1}以及查验凭证`, imgFile: v[0], chectSrcList: v[1], isElectronicInvoice: v[2], previewOnlineUrl: v[3] }
      })
    },
    async loadExtraFileList(exsFids) {
      if (!exsFids) return;
      const ids = exsFids.split(",");
      const map = await this.loadFileInfos({ token: this.token, ids: ids })
      const arr = (await Promise.all(ids.map((v) => (map[v] || {})).map(async v => {
        if (/^(jpg|jpeg|png|bmp|gif|ico)$/gim.test(v.fileExtension)) {
          return { ...v, type: "image", title: `相关资料-${v.name}` }
        } else if (/^(txt|doc|docx|pdf|xls|xlsx|ppt|pptx|ofd)$/gim.test(v.fileExtension)) {
          const previewUrl = await this.loadPreviewUrl({ fileDownloadUrl: v.url, token: this.token })
          return { ...v, previewUrl, type: "extra", title: `相关资料-${v.name}` }
        }
      }))).filter(v => v && !!v.type)
      if (arr.length > 0) {
        this.extraFileList.push(...arr);
      }
    }
  }
};
</script>
