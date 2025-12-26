import dayjs from 'dayjs'
import { saveAs } from "file-saver"
import baseMixin from './baseMixin'

// 页面: h5打印预览, 注意: 本文件内不能有class, 样式只能写内联, 因为涉及到了打印
export default {
  mixins: [baseMixin],
  data() {
    return {
      stampTableData: [
        // { id: 1, name: "印章A", flow: "A", stamp: "1", image: 'https://image.smxzhcs.cn/smxsc/M00/2B/CC/CqDIlGSMMzSAF6B-AAG16Q47dYk892.png', styleJson: '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"60.28215767634855mm","left":"61.60995850622407mm","width":"7.966804979253112mm","height":"7.966804979253112mm"}' },
        // { id: 2, name: "印章B", flow: "B", stamp: "2", image: 'https://image.smxzhcs.cn/smxsc/M00/2C/4A/CqDIk2T1tIyAVvDlAAAp4R6YpdU186.png', styleJson: '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"48.33195020746888mm","left":"30.804979253112034mm","width":"11.153526970954356mm","height":"11.153526970954356mm"}' },
      ],
      signTableData: [
        // { id: 1, name: "签名C", flow: "B", styleJson: '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"112.06639004149378mm","left":"164.38174273858922mm","width":"17.79253112033195mm","height":"7.625370480142282mm"}' }
      ],
      templateDetail: {},
      token: '',
      // 模板ID
      templateId: '',
      // 表单ID- 用于填充数据
      formId: '',
      // 扩展单据id，用于查询其他类型报销模版的签名和用印
      additionPrintId: '',
      // 后端要求查询签名和印章要用的参数
      orderType: ''
    };
  },
  computed: {
    printData() {
      return this.templateDetail.printData || {};
    },
    pageStyle() {
      return {
        "box-sizing": "border-box",
      }
    },
    detailContainerStyle() {
      return {
        "box-sizing": "border-box",
        paddingTop: '2mm'
      }
    }
  },
  methods: {
    loadData() {
      return this.loadDataDetail({ token: this.token, formId: this.formId, templateId: this.templateId, orderType: this.orderType, additionPrintId: this.additionPrintId }).then(res => {
        this.templateDetail = res.templateDetail;
        this.signTableData = res.signTableData;
        this.stampTableData = res.stampTableData;
      })
    },
    async toImg() {
      const dataURL = await this.$refs.printTemplateDetail.toImage();
      saveAs(dataURL, `导出-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.png`)
    }
  }
};
