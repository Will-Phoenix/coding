import Handlebars from 'handlebars'
import { getCcdSignSealRecordList, getData, getPrintDevInfo, getlistTravelUsersSign } from '@/api/system/printDev'
import dayjs from 'dayjs'
import { additionPrintListByOrder, getUserFilesByIds } from '@/api/business/businessApproval'
import { FlowBeforeInfo } from '@/api/workFlow/FlowBefore'
import { getOtherOrdersDetail } from '@/api/business/expenseAccount'
import { downloadFileBatch, previewFileOnline, downloadFile } from '@/api/business/signature'
import { getInvoiceDetail } from '@/api/business/pasteTicket'
import { handleReplace, objToInlineStyle, parseJsonObj, preprocessTemplate } from '@/components/Cicada/printHelper'
import html2canvas from 'html2canvas'
import { readPdfFile, imgToMergedFormatPdf, mergePdf, addWatermark } from '@/utils/pdf';
import axios from "axios";
import { numToChinese } from "@/utils/format";

export default {
  data() {
    return {
      statusList: ['退回', '同意', '发起', '撤回', '终止', '指派', '后加签', '转办', '变更', '复活', '前加签', '挂起', '恢复'],
      intervalCancel: null, // 清除定时器的方法
    }
  },
  beforeMount() {
    // 若是中途离开页面，也要销毁定时器
    if (this.intervalCancel) {
      this.intervalCancel();
    }
  },
  computed: {
    infoByOrderId() {
      return (orderId) => {
        return this.$store.state.form.module[orderId];
      };
    }
  },
  methods: {
    // 加载打印模板(签名+用印), 附加打印模板以及其(签名+用印)
    async loadDataDetail(params = { token: '', templateId: '', formId: '', orderType: '', additionPrintId: '', withoutSign: false }) {
      let templateDetail = {},
        signTableData = [],
        stampTableData = [];
      try {
        const headers = params.token ? { Authorization: params.token } : {}
        if (params.templateId) {
          if (params.formId) {
            const res = await getData({ id: params.templateId, formId: params.formId }, headers);
            templateDetail = res.data || {};
            // 梳理总结操作历史
            const obj = {};
            const operatorRecordList = (res.data || {}).operatorRecordList.filter(vv => vv.userName) || [];
            obj.SYS_FLOW_TASK_OPERATOR_HISTORY = operatorRecordList.map(v => {
              const name = v.userName && v.userName.indexOf("/") > 0 ? v.userName.split("/")[0] : v.userName
              const time = dayjs(v.handleTime).format("YYYY-MM-DD HH:mm:ss")
              // 参考 src/views/workFlow/components/RecordList.vue
              return `${name} ${v.nodeName}（${this.statusList[v.handleStatus]}）${time}`
            }).join("\n")
            console.log('----SYS_FLOW_TASK_OPERATOR_HISTORY----')
            console.log(obj.SYS_FLOW_TASK_OPERATOR_HISTORY)
            console.log('----SYS_FLOW_TASK_OPERATOR_HISTORY----\n')
            obj.SYS_FLOW_TASK_CIRCULATE = (res.data || {}).circulateUserName
            console.log('----SYS_FLOW_TASK_CIRCULATE----')
            console.log(obj.SYS_FLOW_TASK_CIRCULATE)
            console.log('----SYS_FLOW_TASK_CIRCULATE----\n')
            // 新增一个内置字段，且以SYS_NO_XSS_开头，代表“出差人”
            // 当前只有差旅报销单，才增加该字段，做个判断
            if (params.orderType == 2) {
              obj.SYS_NO_XSS_TRAVEL_PEOPLE = [];
              await getlistTravelUsersSign(params.formId, headers).then(res3 => {
                res3.data.forEach(v => {
                  obj.SYS_NO_XSS_TRAVEL_PEOPLE.push(`<img src="${v.signSealImgUrl}" style="width: 49%" />`)
                });
                obj.SYS_NO_XSS_TRAVEL_PEOPLE = obj.SYS_NO_XSS_TRAVEL_PEOPLE.join("");
              });
            }
            templateDetail = { ...templateDetail, printData: Object.assign({}, templateDetail.printData || {}, obj) }
            if (params.orderType && !params.withoutSign) {
              const res2 = await getCcdSignSealRecordList({ orderId: params.formId, orderType: params.orderType, additionPrintId: params.additionPrintId }, headers);
              const arr = res2.data || []
              const signList = [];
              const stampList = [];
              arr.forEach(v => {
                const { id, signSealImgUrl, signSealImgUrls, type, styleJson, signType, signUserName, opinion, opinionStyleJson } = v;
                // type 类型，1:签名 2:印章
                if (type == 1) {
                  signList.push({ id, signType, signUserName, image: signSealImgUrl, signSealImgUrls, styleJson, opinion, opinionStyleJson })
                } else if (type == 2) {
                  stampList.push({ id, image: signSealImgUrl, styleJson })
                }
              })
              signTableData = signList;
              stampTableData = stampList;
            }
          } else {
            const res3 = await getPrintDevInfo(params.templateId, headers);
            templateDetail = res3.data || {};
          }
        }
      } catch (e) {
        console.error(e);
      }
      return {
        templateDetail,
        signTableData,
        stampTableData
      }
    },
    async genPrintResultHtml(params = { templateDetail: {}, signTableData: [], stampTableData: [] }, backgroundImage = "") {
      const { templateDetail, stampTableData, signTableData } = params;
      console.log('loadDataDetailAndGenHtml', { templateDetail, stampTableData, signTableData })
      const template = Handlebars.compile(preprocessTemplate(templateDetail.printTemplate || ''))
      const printTemplateStr = template(templateDetail.printData || {})

      const pageParamObj = templateDetail.pageParam ? JSON.parse(templateDetail.pageParam) : {}
      const { width, height, mt, mb, ml, mr } = pageParamObj
      const containerPageStyle = Object.assign({
        "position": "relative",
        "boxSizing": "border-box"
      }, width && height ? {
        width: `${width}mm`,
        height: `${height}mm`,
        paddingTop: `${mt || 0}mm`,
        paddingBottom: `${mb || 0}mm`,
        paddingLeft: `${ml || 0}mm`,
        paddingRight: `${mr || 0}mm`,
      } : {});

      const stampHtml = stampTableData.map(v => {
        const { image, styleJson } = v;
        return `<img style="${objToInlineStyle(parseJsonObj(styleJson))}" src="${image}" />`
      }).join("");
      const signHtml = signTableData.map(v => {
        const { image, styleJson, signType, signUserName, signSealImgUrls } = v;
        if (signType === 1) {
          return `<img style="${objToInlineStyle(parseJsonObj(styleJson))}" src="${image}" />`
        } else if (signType === 2) {
          return `<div style="${objToInlineStyle(parseJsonObj(styleJson))}">${signUserName}</div>`
        } else {
          const styleObj = parseJsonObj(styleJson);
          const childContainer = parseJsonObj(styleObj.childContainer);
          const childStyle = parseJsonObj(styleObj.childStyleJson);
          delete styleObj.childContainer;
          delete styleObj.childStyleJson;
          // 外层宽高更改，从原先的拖动样式，变为父容器，用来渲染一组签名
          styleObj.height = 'auto';
          styleObj.width = `${width - ml - mr - styleObj.left.split("mm")[0]}mm`;
          console.log("处理后的签名组父样式=========>", styleObj);
          console.log("处理后的签名组子容器=========>", childContainer);
          console.log("处理后的签名组子样式=========>", childStyle);
          return `<div style="${objToInlineStyle(styleObj)}">${(signSealImgUrls || []).map(vv => (`<div style="${objToInlineStyle(childContainer)}"><img style="${objToInlineStyle(childStyle)}" src="${vv}" /></div>`)).join("")}</div>`
        }
      }).join("");
      const opinionHtml = signTableData.filter(item => !!item.opinion).map(v => {
        const { opinionStyleJson, opinion } = v;
        return `<div style="${objToInlineStyle(parseJsonObj(opinionStyleJson))}">${opinion}</div>`
      }).join("");
      let html = "";
      if (backgroundImage !== "") {
        html = `
        <div style="${objToInlineStyle(containerPageStyle)}">
          <img src="${backgroundImage}" style="position: absolute;top: 0;left: 0;width: 100%;z-index: 0"/>
          <div style="width: 100%; height: 100%;position: relative;z-index: 1">${printTemplateStr}</div>
          ${stampHtml}
          ${signHtml}
          ${opinionHtml}
        </div>
      `;
      } else {
        html = `
        <div style="${objToInlineStyle(containerPageStyle)}">
          <div style="width: 100%; height: 100%;">${printTemplateStr}</div>
          ${stampHtml}
          ${signHtml}
          ${opinionHtml}
        </div>
      `;
      }
      return html
    },
    // html字符串 转 canvas, 注意: 入参是字符串, 不是dom元素; 第二个参数 options 对应 html2canvas 库的options参数;
    async htmToCanvas(html = '', options = {}) {
      const dom = document.createElement("div");
      dom.innerHTML = html;
      dom.style.position = 'fixed';
      dom.style.left = '999999px';
      dom.style.top = '999999px';
      document.body.appendChild(dom)
      const canvas = await html2canvas(dom, {
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true,
        scale: 2.5,
        ...options
      })
      dom.remove();
      return canvas;
    },
    async canvasToBlob(canvas) {
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => {
          resolve(b);
        }, 'image/png', 1);
      })
      return blob
    },
    canvasToImage(canvas) {
      return canvas.toDataURL('image/png', 1);
    },
    async templateToImageDirectly(templateId, formId, orderType, additionPrintId = "", backgroundImage = "") {
      const ret1 = await this.loadDataDetail({
        templateId,
        formId,
        orderType,
        additionPrintId,
      });
      const html = await this.genPrintResultHtml(ret1, backgroundImage);
      const canvas = await this.htmToCanvas(html);
      const blob = await this.canvasToBlob(canvas);
      const dataUrl = this.canvasToImage(canvas);
      const url = window.URL.createObjectURL(blob);
      return { url, src: blob, dataUrl, html };
    },
    async templateToHtmlWithoutSign(templateId, formId, orderType, additionPrintId = "", backgroundImage = "") {
      const ret1 = await this.loadDataDetail({
        templateId,
        formId,
        orderType,
        additionPrintId,
        withoutSign: true
      });
      const params = { templateDetail: ret1.templateDetail, signTableData: [], stampTableData: [] };
      const html = await this.genPrintResultHtml(params, backgroundImage);
      return html;
    },
    // 查询其它打印模板列表, additionType: 1:发票类, 0:其它
    async loadOtherTemplateList(params = { token: '', formId: '', additionType: 0 }) {
      let ret = []
      try {
        const headers = params.token ? { Authorization: params.token } : {}
        const res = await additionPrintListByOrder({ orderId: params.formId, additionType: params.additionType }, headers)
        ret = res.data || []
      } catch (e) {
        console.warn(e)
      }
      return ret;
    },
    // 根据表单id查详情
    async loadFormDetail(params = { token: '', formId: '' }) {
      let ret = {}
      try {
        const headers = params.token ? { Authorization: params.token } : {}
        const res = await FlowBeforeInfo(params.formId, undefined, headers);
        ret = res.data || {};
      } catch (e) {
        console.warn(e)
      }
      return ret;
    },
    // 查询多个审批单详情
    async loadApplyOrderDetails(params = { token: '', applyOrderIds: [] }) {
      let ret = []
      try {
        const headers = params.token ? { Authorization: params.token } : {}
        const res = await getOtherOrdersDetail(params.applyOrderIds, headers)
        ret = res.data || [];
      } catch (e) {
        console.warn(e)
      }
      return ret;
    },
    // 根据文件(图片)id 查询文件下载地址, map ==> key是文件id, value是文件详情
    async loadFileInfos(params = { token: '', ids: [] }) {
      let map = {}
      try {
        const headers = params.token ? { Authorization: params.token } : {}
        const arr = (await downloadFileBatch(params.ids.filter(v => !!v).join(","), headers)).data || []
        arr.forEach(v => {
          map[v.id] = v;
        })
      } catch (e) {
        console.warn(e)
      }
      return map;
    },
    // 根据发票id(多个) 查询发票详情列表
    async loadInvoiceList(params = { token: '', ids: [] }) {
      let ret = []
      try {
        const headers = params.token ? { Authorization: params.token } : {}
        const arr = await Promise.all(params.ids.map(v => getInvoiceDetail(v, headers)))
        ret = arr.map(v => v.data || [])
      } catch (e) {
        console.warn(e)
      }
      return ret;
    },
    fixTouchZoom() {
      const arr = document.head.getElementsByTagName('meta');
      for (let i = 0; i < arr.length; i++) {
        const name = arr[i].getAttribute("name")
        if (name === 'viewport') {
          arr[i].setAttribute('content', 'initial-scale=0.1')
        }
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
    // 根据文件下载资质, 获取文件预览地址
    async loadPreviewUrl(params = { token: '', fileDownloadUrl: '' }) {
      let previewUrl = ''
      try {
        if (params.fileDownloadUrl) {
          const headers = params.token ? { Authorization: params.token } : {}
          const res = await previewFileOnline(params.fileDownloadUrl, headers)
          previewUrl = res.data
        }
      } catch (e) {
        console.warn(e)
      }
      return previewUrl;
    },
    // 根据orderId获取订单的所有数据，包括：moduleJson和formData
    async getOrderInfoById(orderId) {
      if (!this.infoByOrderId(orderId)) {
        await this.$store.dispatch('form/getModule', orderId);
      }
      console.log("通过orderId获取的所有信息======>", this.infoByOrderId(orderId));
      return this.infoByOrderId(orderId);
    },
    // 获取表单中为attachment组件所上传的文件id
    async getAttachmentFiles(params = { formId: "", moduleJson: "", detailJson: "" }) {
      // 如果moduleJson和detailJson任一为空，则通过formId查询
      let moduleJson = parseJsonObj(params.moduleJson, params.moduleJson);
      let detailJson = parseJsonObj(params.detailJson, params.detailJson);
      if (!params.moduleJson || !params.detailJson) {
        if (!params.formId) {
          return "";
        }
        const info = await this.getOrderInfoById(params.formId);
        moduleJson = parseJsonObj(info.moduleJson);
        detailJson = parseJsonObj(info.formData.detailJson);
      }
      console.log("拿到的moduleJson============>", moduleJson);
      console.log("拿到的detailJson============>", detailJson);
      // 拿到了moduleJson和detailJson后，开始循环查出所有attachment组件和其在detailJson中对应的数据
      let fidList = [];
      moduleJson.groups.forEach(g => {
        // 对于迭代的group，要遍历detailJson中对应group的一组数据，把为attachment组件数据塞入fidList
        if (g.iterable) {
          g.fields.forEach(item => {
            if (item.component === "attachment") {
              detailJson[g.fieldName].forEach(v => {
                if (v[item.fieldName]) {
                  fidList.push(...v[item.fieldName].split(","));
                }
              });
            }
          });
        } else {
          // 非迭代group，直接从detailJson的外层获取对应的值塞入fidList
          g.fields.forEach(item => {
            if (item.component === "attachment") {
              if (detailJson[item.fieldName]) {
                fidList.push(...detailJson[item.fieldName].split(","));
              }
            }
          });
        }
      });
      console.log("表单中所有attachment文件集合==========>", fidList);
      return fidList;
    },
    // 统一处理不同类型的文件，并返回pdf对象
    async fileToMergedFormatPdf(fileData = { url: "", fileExtension: "" }) {
      /* url文件链接，fileExtension文件类型 */
      let pdfDocumentObj = "";
      if (["jpg", "png", "jpeg"].includes(fileData.fileExtension)) {
        // 图片
        pdfDocumentObj = await imgToMergedFormatPdf([fileData.url])
      } else if (fileData.fileExtension === 'pdf') {
        // pdf
        pdfDocumentObj = await readPdfFile(fileData.url);
      }
      return pdfDocumentObj;
    },
    /** 根据一组报销单，按顺序，批量打印银行付款证明、报销单主页、报销单其他模版和图片、发票以及查验凭证、oa前置审批单、其余相关材料
    * @param formIdList 数组，元素为报销单id
     * @param directlyMerge, 默认true, 把所有资料直接合成到一个pdf并预览；
     * 若false，则只返回所有资料的pdfList数组，元素中对象包含PDFDocument对象，可进行数组筛选后，自行调用mergePdf方法合并预览
    * */
    async downloadAllByOrders(formIdList, directlyMerge = true) {
      // PDFDocument对象数组，用于合并
      // 其中每个元素是一个对象{ name: xx, url: xx, fileExtension: xx, id: xx, pdfDocumentObj: xx}，name、url、fileExtension用来展示在列表中，pdfDocumentObj用来合并生产pdf文件
      const pdfList = [];
      // 循环每一个报销单，获取相关数据，生成pdf
      for (const v of formIdList) {
        // 查询报销单详情，所有报销单相关数据都在报销单详情中
        const { formData } = await this.loadFormDetail({ formId: v });

        /* ------- 1. 银行付款证明，pdf或图片格式 ------ */
        if (formData.paymentOrderFid) {
          const bankApproveMap = await this.loadFileInfos({ ids: formData.paymentOrderFid.split(",") });
          for (const key of Object.keys(bankApproveMap)) {
            const pdfDocumentObj = await this.fileToMergedFormatPdf({ url: bankApproveMap[key].url, fileExtension: bankApproveMap[key].fileExtension });
            pdfList.push({ name: bankApproveMap[key].name, url: bankApproveMap[key].url, fileExtension: bankApproveMap[key].fileExtension, id: key, pdfDocumentObj });
          }
        }

        /* ------- 2. 报销单主页 ------ */
        if (formData.basePrintdevId) {
          const result = await this.templateToImageDirectly(formData.basePrintdevId, v, formData.orderType);
          // imgList.push({ name: "报销单主页", url: result.dataUrl, fileExtension: "png", id: formData.basePrintdevId });
          let basePrintPdfDocumentObj = await imgToMergedFormatPdf([result.dataUrl]);
          await this.$store.dispatch('orgInfo/getOrgAllInfo');
          const propertyJson = this.$store.state.orgInfo.propertyJson;
          if (propertyJson.printShow) {
            basePrintPdfDocumentObj = await addWatermark(basePrintPdfDocumentObj, "第" + numToChinese((formData.printNum || 0) + 1) + "次打印");
          }
          pdfList.push({ name: "报销单主页", url: result.dataUrl, fileExtension: "png", id: formData.basePrintdevId, pdfDocumentObj: basePrintPdfDocumentObj });
        }

        /* ------- 3. 报销单其他模版（例如：结算单报销页）和对应的单据图片（结算单中会有单据图片，要展示在其后面） ------ */
        const templateArr = await this.loadOtherTemplateList({ additionType: 0, formId: v });
        if (templateArr && templateArr.length > 0) {
          for (const vv of templateArr) {
            const result = await this.templateToImageDirectly(vv.basePrintdevId, v, formData.orderType, vv.id);
            // 去掉配置特殊情况说明却未填写的情况
            if (vv.name === '特殊情况说明') {
              if (formData.detailJson && !!JSON.parse(formData.detailJson).specialSituationInfo) {
                pdfList.push({ name: vv.name, url: result.dataUrl, fileExtension: "png", id: vv.basePrintdevId, pdfDocumentObj: await imgToMergedFormatPdf([result.dataUrl]) });
              }
            } else {
              pdfList.push({ name: vv.name, url: result.dataUrl, fileExtension: "png", id: vv.basePrintdevId, pdfDocumentObj: await imgToMergedFormatPdf([result.dataUrl]) });
            }
          }
          // 在有报销单其他模版的情况下，可能会有单据图片
          if (formData.detailJson) {
            const detail = JSON.parse(formData.detailJson);
            if (detail && detail.bankFids) {
              const receiptsList = await this.loadReceipts(detail.bankFids);
              pdfList.push(...receiptsList.map(async vv => ({ name: vv.fullName, url: vv.fidUrl, fileExtension: "png", id: vv.fid, pdfDocumentObj: await imgToMergedFormatPdf([vv.fidUrl]) })));
            }
          }
        }

        /* ------- 4. 发票和其对应的查验凭证，一组一组的顺序打印；当然特殊情况是发票套打 ------ */
        // 请求获取所有发票
        if (formData.invoiceIds) {
          // 查询发票打印模版：如果配置，则需要和每一张电子发票套在一起打印；如果没配置，则只打印发票就行
          const invoiceArr = await this.loadOtherTemplateList({ additionType: 1, formId: v });
          const invoiceList = await this.loadInvoiceList({ ids: formData.invoiceIds.split(",") });
          // 由于报销单中关联的发票，可能有些是同一个发票组的，因此过滤一下，同一个发票组的只留一张发票，即可以遍历同一组的所有发票
          const invoiceGroupList = invoiceList.filter((vv, index, self) => !vv.entity.groupId || self.findIndex(item => item.entity.groupId === vv.entity.groupId) === index);
          for (const [index, vv] of invoiceGroupList.entries()) {
            // 首先：打印发票
            let invoice = null;
            if (vv.entity.imgFid) {
              invoice = (await downloadFile(vv.entity.imgFid)).data;
            }
            const sourceInvoice = (await downloadFile(vv.entity.fid)).data;
            // 如果是电子发票
            if (!["jpg", "png", "jpeg"].includes(sourceInvoice.fileExtension)) {
              // 判断是否配置了发票打印模版
              // *******注意：今后可能电子发票都不会转成图片了，因此如果是电子发票vv.entity.imgFid没有值，下面这个套打会出问题，但暂时不改，套打这块目前没人用（暂时废弃）********
              if (invoiceArr && invoiceArr.length > 0 && invoice) {
                const result = await this.templateToImageDirectly(invoiceArr[0].basePrintdevId, v, formData.orderType, invoiceArr[0].id, invoice.url);
                pdfList.push({ name: `发票${index + 1}`, url: result.dataUrl, fileExtension: "png", id: vv.entity.fid, pdfDocumentObj: await imgToMergedFormatPdf([result.dataUrl]) });
              } else {
                // 没有配置发票打印模版
                // ****电子发票直接取vv.entity.fid进行下载，后端不会再转图片塞到vv.entity.imgFid
                let pdf = "";
                if (sourceInvoice.fileExtension === "pdf") {
                  pdf = await readPdfFile(sourceInvoice.url);
                }
                pdfList.push({ name: `发票${index + 1}`, url: sourceInvoice.url, fileExtension: sourceInvoice.fileExtension, id: vv.entity.fid, pdfDocumentObj: pdf });
              }
            } else {
              // 非电子发票
              pdfList.push({ name: `发票${index + 1}`, url: sourceInvoice.url, fileExtension: sourceInvoice.fileExtension, id: vv.entity.fid, pdfDocumentObj: await imgToMergedFormatPdf([sourceInvoice.url]) });
            }
            // 其次：打印该发票对应的查验凭证；查验凭证需要判断是否是发票组，因为如果是发票组，会有多个查验凭证
            if (vv.entity.groupId) {
              // 发票组
              for (const v3 of vv.inners) {
                if (v3.key.chectFid) {
                  const chectUrl = (await downloadFile(v3.key.chectFid)).data.url;
                  pdfList.push({ name: `发票${index + 1}的查验凭证`, url: chectUrl, fileExtension: "png", id: v3.key.chectFid, pdfDocumentObj: await imgToMergedFormatPdf([chectUrl]) });
                }
              }
            } else {
              // 非发票组
              if (vv.entity.chectFid) {
                const chectUrl = (await downloadFile(vv.entity.chectFid)).data.url;
                pdfList.push({ name: `发票${index + 1}的查验凭证`, url: chectUrl, fileExtension: "png", id: vv.entity.chectFid, pdfDocumentObj: await imgToMergedFormatPdf([chectUrl]) });
              }
            }
          }
        }

        /* ------- 5. OA前置审批单 ------ */
        // 佐证材料，在第6步，需要用到，放到相关资料中
        const applyFidsList = [];
        if (formData.applyOrderIds) {
          const otherOrderArr = await this.loadApplyOrderDetails({ applyOrderIds: formData.applyOrderIds.split(",") });
          if (otherOrderArr && otherOrderArr.length > 0) {
            for (const vv of otherOrderArr) {
              const result = await this.templateToImageDirectly(vv.basePrintdevId, vv.id, vv.orderType);
              pdfList.push({ name: vv.name, url: result.dataUrl, fileExtension: "png", id: vv.basePrintdevId, pdfDocumentObj: await imgToMergedFormatPdf([result.dataUrl]) });
              // 佐证材料
              if (vv.applyFids) {
                applyFidsList.push(...(vv.applyFids.split(",")));
              }
            }
          }
        }

        /* ------- 新增步骤. 关联的报销单（目前只有请款单） ------ */
        if (formData.exsOrderIds) {
          for (const v of formData.exsOrderIds.split(",")) {
            const res = await this.loadFormDetail({ formId: v });
            const result = await this.templateToImageDirectly(res.formData.basePrintdevId, v, res.formData.orderType);
            pdfList.push({ name: res.formData.name, url: result.dataUrl, fileExtension: "png", id: res.formData.basePrintdevId, pdfDocumentObj: await imgToMergedFormatPdf([result.dataUrl]) });
          }
        }

        /** ------- 6. 其余相关资料：合同、呈批签、报销单中OA审批单的附件、OA审批单佐证材料、报销单的相关资料） ------
         * 关键：相关资料中的可能是图片、pdf文件、doc文件等等，每一种都有独有的处理方式；因此当前只支持图片和pdf
         * */
        // 存放所有资料的文件id
        const ids = [];
        // 合同和呈批签
        const { contractFids, submitSignFids } = parseJsonObj(formData.detailJson);
        if (contractFids) {
          ids.push(...(contractFids.split(",")));
        }
        if (submitSignFids) {
          ids.push(...(submitSignFids.split(",")));
        }
        // 报销单中OA审批单的附件
        if (formData.applyOrderFids) {
          ids.push(...(formData.applyOrderFids.split(",")));
        }
        // 报销单的相关资料
        if (formData.exsFids) {
          ids.push(...(formData.exsFids.split(",")));
        }
        // OA审批单佐证材料
        // applyFidsList在第5步赋值的
        if (applyFidsList.length > 0) {
          ids.push(...applyFidsList);
        }
        // 下载所有文件，并判断其类型：图片、pdf分别处理
        // const onlyPdfList = []; // 单独筛出pdf，要等所有图片都转为pdf合并后，再把这些pdf合并，目的：保证顺序
        if (ids.length > 0) {
          const allFileMap = await this.loadFileInfos({ ids });
          for (const key of Object.keys(allFileMap)) {
            const pdfDocumentObj = await this.fileToMergedFormatPdf({ url: allFileMap[key].url, fileExtension: allFileMap[key].fileExtension });
            pdfList.push({ name: allFileMap[key].name, url: allFileMap[key].url, fileExtension: allFileMap[key].fileExtension, id: key, pdfDocumentObj });
          }
        }

        // /** ------- 7.
        //  * 1> 把imgList里的图片转为pdf，并放入pdfList
        //  * 2> 把onlyPdfList中的也放入并放入pdfList------ */
        // for (const vv of imgList) {
        //   pdfList.push({ name: vv.name, url: vv.url, fileExtension: vv.fileExtension, id: vv.id, pdfDocumentObj: await imgToMergedFormatPdf([vv.url]) });
        // }
        // if (onlyPdfList.length > 0) {
        //   for (const vv of onlyPdfList) {
        //     const pdf = await readPdfFile(vv.url);
        //     pdfList.push({ name: vv.name, url: vv.url, fileExtension: vv.fileExtension, id: vv.id, pdfDocumentObj: pdf });
        //   }
        // }
      }
      // 判断是否存在pfd和图片之外的格式，如果存在，弹出提示
      if (pdfList.filter(vv => !vv.pdfDocumentObj).length > 0) {
        setTimeout(() => { this.$message.warning("存在ofd或其他格式文件，无法统一打印，请单独处理"); }, 2000);
      }
      if (directlyMerge) {
        // 最后：合并打印
        await mergePdf(pdfList.filter(vv => vv.pdfDocumentObj).map(vv => vv.pdfDocumentObj));
      } else {
        // 否则返回pdfLIst
        return pdfList.filter(vv => vv.pdfDocumentObj);
      }
    },
    /** 根据一组报销单，按顺序，批量打印银行付款证明、报销单主页、报销单其他模版和图片、发票以及查验凭证、oa前置审批单、其余相关材料
     * @param id 数组，元素为报销单id
     * */
    async downloadAllZipByOrders(id) {
      // PDFDocument对象数组，用于合并
      const downloadList = [];
      // 图片数组
      const imgList = [];
      // 查询报销单详情，所有报销单相关数据都在报销单详情中
      const { formData } = await this.loadFormDetail({ formId: id });
      /* ------- 1. 银行付款证明 ------ */
      const payFids = [];
      if (formData.paymentOrderFid) {
        payFids.push(...formData.paymentOrderFid.split(","));
      }

      /* ------- 2. 报销单主页 ------ */
      if (formData.basePrintdevId) {
        const result = await this.templateToImageDirectly(formData.basePrintdevId, id, formData.orderType);
        imgList.push({ name: '标准模版' + '.png', url: result.dataUrl });
      }

      /* ------- 3. 报销单其他模版（例如：结算单报销页）和对应的单据图片（结算单中会有单据图片，要展示在其后面） ------ */
      const templateArr = await this.loadOtherTemplateList({ additionType: 0, formId: id });
      if (templateArr && templateArr.length > 0) {
        for (const vv of templateArr) {
          const result = await this.templateToImageDirectly(vv.basePrintdevId, id, formData.orderType, vv.id);
          // 去掉配置特殊情况说明却未填写的情况
          if (vv.name === '特殊情况说明') {
            if (formData.detailJson && !!JSON.parse(formData.detailJson).specialSituationInfo) {
              imgList.push({ name: vv.name + '.png', url: result.dataUrl });
            }
          } else {
            imgList.push({ name: vv.name + '.png', url: result.dataUrl });
          }
        }
        // 在有报销单其他模版的情况下，可能会有单据图片
        if (formData.detailJson) {
          const detail = JSON.parse(formData.detailJson);
          if (detail && detail.bankFids) {
            const receiptsList = await this.loadReceipts(detail.bankFids);
            for (const vv of receiptsList) {
              imgList.push({ name: vv.fullName.indexOf(".") > -1 ? vv.fullName : vv.fullName + '.' + vv.type, url: vv.fidUrl });
            }
          }
        }
      }

      /* ------- 4. 发票和其对应的查验凭证，一组一组的顺序打印；当然特殊情况是发票套打 ------ */
      // 请求获取所有发票
      if (formData.invoiceIds) {
        // 查询发票打印模版：如果配置，则需要和每一张电子发票套在一起打印；如果没配置，则只打印发票就行
        const invoiceArr = await this.loadOtherTemplateList({ additionType: 1, formId: id });
        const invoiceList = await this.loadInvoiceList({ ids: formData.invoiceIds.split(",") });
        // 由于报销单中关联的发票，可能有些是同一个发票组的，因此过滤一下，同一个发票组的只留一张发票，即可以遍历同一组的所有发票
        const invoiceGroupList = invoiceList.filter((vv, index, self) => !vv.entity.groupId || self.findIndex(item => item.entity.groupId === vv.entity.groupId) === index);
        for (let i = 0; i < invoiceGroupList.length; i++) {
          let vv = invoiceGroupList[i];
          // 首先：打印发票
          const invoiceFile = (await downloadFile(vv.entity.fid)).data;
          console.log('invoiceFile', invoiceFile);
          // 如果是电子发票
          if (!["jpg", "png", "jpeg"].includes(invoiceFile.fileExtension)) {
            // 判断是否配置了发票打印模版
            if (invoiceArr && invoiceArr.length > 0) {
              const result = await this.templateToImageDirectly(invoiceArr[0].basePrintdevId, id, formData.orderType, invoiceArr[0].id, invoiceFile.url);
              imgList.push({ name: '发票' + (i + 1) + '.png', url: result.dataUrl });
            } else {
              // 没有配置发票打印模版
              imgList.push({ name: '发票' + (i + 1) + '.' + invoiceFile.fileExtension, url: invoiceFile.url });
            }
          } else {
            // 非电子发票
            imgList.push({ name: '发票' + (i + 1) + '.' + invoiceFile.fileExtension, url: invoiceFile.url });
          }
          // 其次：打印该发票对应的查验凭证；查验凭证需要判断是否是发票组，因为如果是发票组，会有多个查验凭证
          if (vv.entity.groupId) {
            // 发票组
            let j = 0;
            for (const v3 of vv.inners) {
              if (v3.key.chectFid) {
                const chectUrl = (await downloadFile(v3.key.chectFid)).data.url;
                imgList.push({ name: ('发票' + (i + 1) + '-查验凭证' + (j + 1) + '.png'), url: chectUrl });
                j++;
              }
            }
          } else {
            // 非发票组
            if (vv.entity.chectFid) {
              const chectUrl = (await downloadFile(vv.entity.chectFid)).data.url;
              imgList.push({ name: ('发票' + (i + 1) + '-查验凭证.png'), url: chectUrl });
            }
          }
        }
      }

      /* ------- 5. OA前置审批单 ------ */
      // 佐证材料，在第6步，需要用到，放到相关资料中
      const applyFidsList = [];
      if (formData.applyOrderIds) {
        const otherOrderArr = await this.loadApplyOrderDetails({ applyOrderIds: formData.applyOrderIds.split(",") });
        if (otherOrderArr && otherOrderArr.length > 0) {
          for (const vv of otherOrderArr) {
            const result = await this.templateToImageDirectly(vv.basePrintdevId, vv.id, vv.orderType);
            imgList.push({ name: vv.name + '.png', url: result.dataUrl });
            // 佐证材料
            if (vv.applyFids) {
              applyFidsList.push(...(vv.applyFids.split(",")));
            }
          }
        }
      }

      /** ------- 6. 其余相关资料：合同、呈批签、报销单中OA审批单的附件、OA审批单佐证材料、报销单的相关资料） ------
         * 关键：相关资料中的可能是图片、pdf文件、doc文件等等，每一种都有独有的处理方式；因此当前只支持图片和pdf
         * */
      // 存放所有资料的文件id
      const ids = [];
      // 合同和呈批签
      const { contractFids, submitSignFids } = parseJsonObj(formData.detailJson);
      if (contractFids) {
        ids.push(...(contractFids.split(",")));
      }
      if (submitSignFids) {
        ids.push(...(submitSignFids.split(",")));
      }
      // 报销单中OA审批单的附件
      if (formData.applyOrderFids) {
        ids.push(...(formData.applyOrderFids.split(",")));
      }
      // 报销单的相关资料
      if (formData.exsFids) {
        ids.push(...(formData.exsFids.split(",")));
      }
      // OA审批单佐证材料
      // applyFidsList在第5步赋值的
      if (applyFidsList.length > 0) {
        ids.push(...applyFidsList);
      }
      // 付款证明
      if (payFids.length > 0) {
        ids.push(...payFids);
      }
      if (ids.length > 0) {
        const allFileMap = (await this.loadFileInfos({ ids }));
        for (const key of Object.keys(allFileMap)) {
          imgList.push({
            name: allFileMap[key].name,
            url: allFileMap[key].url,
          })
        }
      }
      /* const res = await Promise.allSettled(imgList.map(v => axios.get(v.url, {
        responseType: 'blob'
      })));
      res.map((v, i) => {
        if (v.status === 'fulfilled') {
          downloadList.push({ name: imgList[i].name, blob: v.value.data });
        }
      }); */
      for (const v of imgList) {
        await axios.get(v.url, {
          responseType: 'blob'
        }).then(res => {
          downloadList.push({ name: v.name, blob: res.data });
        });
      }
      return downloadList;
    },
    /** 打印审批单和附件
     * @param id 审批单id
     * @param directlyMerge
     * 若false，则只返回所有资料的pdfList数组，元素中对象包含PDFDocument对象，可进行数组筛选后，自行调用mergePdf方法合并预览
     * */
    async downloadAllByApplyOrder(id, directlyMerge = true) {
      // PDFDocument对象数组，用于合并
      // 其中每个元素是一个对象{ name: xx, url: xx, fileExtension: xx, id: xx, pdfDocumentObj: xx}，name、url、fileExtension用来展示在列表中，pdfDocumentObj用来合并生产pdf文件
      const pdfList = [];
      const { formData } = await this.loadFormDetail({ formId: id });
      /* ------- 2. 报销单主页 ------ */
      if (formData.basePrintdevId) {
        const result = await this.templateToImageDirectly(formData.basePrintdevId, id, formData.orderType);
        pdfList.push({ name: "审批单主页", url: result.dataUrl, fileExtension: "png", id: formData.basePrintdevId, pdfDocumentObj: await imgToMergedFormatPdf([result.dataUrl]) });
      }
      // 存放所有资料的文件id
      const ids = [];
      // 审批单附件
      const { exsFids, attachmentUrl } = parseJsonObj(formData.detailJson);
      let fidsStr = exsFids || attachmentUrl;
      if (fidsStr) {
        ids.push(...(fidsStr.split(",")));
      }
      if (ids.length > 0) {
        const allFileMap = await this.loadFileInfos({ ids });
        for (const key of Object.keys(allFileMap)) {
          const pdfDocumentObj = await this.fileToMergedFormatPdf({ url: allFileMap[key].url, fileExtension: allFileMap[key].fileExtension });
          pdfList.push({ name: allFileMap[key].name, url: allFileMap[key].url, fileExtension: allFileMap[key].fileExtension, id: key, pdfDocumentObj });
        }
      }
      // 判断是否存在pfd和图片之外的格式，如果存在，弹出提示
      if (pdfList.filter(vv => !vv.pdfDocumentObj).length > 0) {
        setTimeout(() => { this.$message.warning("存在ofd等格式文件，无法统一打印，请单独处理"); }, 2000);
      }
      if (directlyMerge) {
        // 最后：合并打印
        await mergePdf(pdfList.filter(vv => vv.pdfDocumentObj).map(vv => vv.pdfDocumentObj));
      } else {
        // 否则返回pdfLIst
        return pdfList.filter(vv => vv.pdfDocumentObj);
      }
    }
  }
}
