<template>
  <div>
    <div ref="templateContainer" :style="templateContainerStyle">
      <div ref="containerPage" :style="containerPageStyle">
        <div v-html="printTemplateStr" style="width: 100%; height: 100%;" :style="backgroundPic" />
        <template v-if="draggable">
          <marker-drag v-for="item in stampList" ref="stampList" :key="`stamp__${item.id}`" :data="item" type="stamp" />
          <marker-drag v-for="(item, index) in signList" ref="signList" :key="`sign__${item.id}`" :data="item" :index="index" type="sign" />
          <marker-drag v-for="item in opinionList" ref="opinionList" :key="`opinion__${item.id}`" :data="item" :index="item.index" type="opinion" />
        </template>
        <template v-else>
          <marker-img v-for="item in stampList" :key="`img_stamp__${item.id}`" :data="item" type="stamp" />
          <marker-img v-for="(item, index) in signList" :key="`img_sign__${item.id}`" :data="item" :pageParamObj="pageParamObj" :index="index" type="sign" />
          <marker-img v-for="item in opinionList" :key="`img_opinion__${item.id}`" :data="item" :index="item.index" type="opinion" />
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import Handlebars from 'handlebars'
import html2canvas from 'html2canvas'
import MarkerDrag from './components/MarkerDrag.vue'
import MarkerImg from './components/MarkerImg.vue'
import { genPrintHtml, handleReplace, preprocessTemplate } from '@/components/Cicada/printHelper'

const DEFAULT_SING_IMG_URL = 'http://minio.smxzhcs.cn/smxol-pre/TuChuang/public/d7f020ec-216b-4178-b8f9-c1add7c379b3.png'
const DEFAULT_GROUP_SING_IMG_URL = 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/499ac4cb-bb28-4065-81b2-1ac0724c906e.png'
const DEFAULT_SING_IMG_WIDTH = 210
const DEFAULT_SING_IMG_HEIGHT = 90
const DEFAULT_OPINION_WIDTH = 300
const DEFAULT_OPINION_HEIGHT = 90
const DEFAULT_WIDTH_TO_FONTSIZE = 4

// 打印模板预览
export default {
  name: 'PrintTemplateDetail',
  components: { MarkerImg, MarkerDrag },
  props: {
    pageParam: {
      type: String,
    },
    printTemplate: {
      type: String
    },
    // 模板占位填充数据
    data: {
      type: Object,
      default: () => ({})
    },
    // 签章列表(只需要id,image,styleJson)
    stampList: {
      type: Array,
      default: () => []
    },
    // 签名列表(只需要id,image,styleJson)
    signList: {
      type: Array,
      default: () => []
    },
    draggable: {
      type: Boolean,
      default: false
    },
    background: {
      type: String,
      default: ""
    },
  },
  data() {
    return {
      ratio: 1,
    }
  },
  computed: {
    printTemplateStr() {
      const template = Handlebars.compile(preprocessTemplate(this.printTemplate || ''))
      return template(this.data || {})
    },
    pageParamObj() {
      return this.pageParam ? JSON.parse(this.pageParam) : {}
    },
    templateContainerStyle() {
      const { width } = this.pageParamObj
      return Object.assign({
        "box-sizing": "border-box",
        "margin": "0 auto",
        "box-shadow": "0 2px 12px 0 rgba(0,0,0,.1)"
      }, width ? {
        width: `${width}mm`,
      } : {})
    },
    containerPageStyle() {
      const { width, height, mt, mb, ml, mr } = this.pageParamObj
      return Object.assign({
        "position": "relative",
        "box-sizing": "border-box"
      }, width && height ? {
        width: `${width}mm`,
        height: `${height}mm`,
        paddingTop: `${mt || 0}mm`,
        paddingBottom: `${mb || 0}mm`,
        paddingLeft: `${ml || 0}mm`,
        paddingRight: `${mr || 0}mm`,
      } : {});
    },
    backgroundPic() {
      if (this.background !== "") {
        return {
          background: `url(${this.background})`,
          "background-size": "contain",
          "background-repeat": "no-repeat"
        }
      } else {
        return {}
      }
    },
    opinionList() {
      const list1 = this.signList.map((v, index) => {
        return { ...v, index };
      });
      return list1.filter(v => v.showOpinion === "1" || !!v.opinion) || [];
    }
  },
  watch: {

  },
  created() {
    this.ratio = this.calcPxOf1mm()
  },
  methods: {
    // 返回 { stampList , signList }
    getCalcPosition() {
      console.log('getCalcPosition')
      const ret = { stampList: [], signList: [] };
      if (this.$refs.stampList) {
        ret.stampList = this.stampList.map((stamp, i) => {
          const { width, height, left, top } = this.$refs.stampList[i].getRect()
          return { ...stamp, styleJson: JSON.stringify({
            'box-sizing': 'border-box',
            'object-fit': 'contain',
            position: 'absolute',
            top: `${this.pxToMm(top)}mm`,
            left: `${this.pxToMm(left)}mm`,
            width: `${this.pxToMm(width)}mm`,
            height: `${this.pxToMm(height)}mm`
          }) }
        })
      }
      if (this.$refs.signList) {
        ret.signList = this.signList.map((sign, i) => {
          const { width, height, left, top } = this.$refs.signList[i].getRect()
          let obj = {};
          // 如果是系统签名，添加宽度转成字体大小
          if (sign.signType === 2) {
            obj = { ...sign, styleJson: JSON.stringify({
              'box-sizing': 'border-box',
              'object-fit': 'contain',
              position: 'absolute',
              top: `${this.pxToMm(top)}mm`,
              left: `${this.pxToMm(left)}mm`,
              width: `${this.pxToMm(width)}mm`,
              height: `${this.pxToMm(height)}mm`,
              'font-size': `${this.pxToMm(width / 4)}mm`,
              display: 'flex',
              'justify-content': 'center',
              'align-items': 'center',
              "font-family": "STSongti-SC, STSongti-SC"
            }) }
          } else if (sign.signType === 1) {
            obj = { ...sign, styleJson: JSON.stringify({
              'box-sizing': 'border-box',
              'object-fit': 'contain',
              position: 'absolute',
              top: `${this.pxToMm(top)}mm`,
              left: `${this.pxToMm(left)}mm`,
              width: `${this.pxToMm(width)}mm`,
              height: `${this.pxToMm(height)}mm`
            }) }
          } else if (sign.signType === 3) {
            // 手写签名组
            obj = {
              ...sign, styleJson: JSON.stringify({
                'box-sizing': 'border-box',
                position: 'absolute',
                top: `${this.pxToMm(top)}mm`,
                left: `${this.pxToMm(left)}mm`,
                width: `${this.pxToMm(width)}mm`,
                height: `${this.pxToMm(height)}mm`,
                display: 'flex',
                'flex-wrap': 'wrap',
                'align-items': 'center',
                childContainer: JSON.stringify({
                  flex: `0 0 calc(100% / ${sign.signGroupRow})`,
                  'margin-bottom': '5mm'
                }),
                childStyleJson: JSON.stringify({
                  'box-sizing': 'border-box',
                  'object-fit': 'contain',
                  width: `${this.pxToMm(width)}mm`,
                  height: `${this.pxToMm(height)}mm`
                })
              }),
            }
          }
          // 是否显示意见，显示则把意见样式插入
          if (sign.showOpinion === "1") {
            const index = this.opinionList.findIndex(v => v.id === sign.id);
            const { width, height, left, top } = this.$refs.opinionList[index].getRect()
            obj = {
              ...obj, opinionStyleJson: JSON.stringify({
                'box-sizing': 'border-box',
                'object-fit': 'contain',
                position: 'absolute',
                top: `${this.pxToMm(top)}mm`,
                left: `${this.pxToMm(left)}mm`,
                width: `${this.pxToMm(width)}mm`,
                height: `${this.pxToMm(height)}mm`,
                'font-size': '3.175mm',
                "font-family": "STSongti-SC, STSongti-SC",
                'overflow': 'hidden',
                display: 'flex',
                'align-items': 'center'
              }
              )
            }
          }
          return obj;
        })
      }
      console.log(JSON.stringify(ret))
      return ret;
    },
    print() {
      let print = this.$refs.templateContainer.innerHTML;
      let printPart = genPrintHtml(print);
      let newTab = window.open('about:_blank');
      newTab.document.body.innerHTML = printPart;
      newTab.print();
      // newTab.close();
    },
    toCanvas() {
      // 参考 https://html2canvas.hertzen.com/configuration
      return html2canvas(this.$refs.containerPage, {
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true,
        scale: 2.5
      });
    },
    toImage() {
      return this.toCanvas().then((canvas) => {
        console.log('toImage', { canvas })
        const dataURL = canvas.toDataURL('image/png', 1)
        console.log('toImage', { dataURL })
        return dataURL
      });
    },
    toBlob() {
      return this.toCanvas().then((canvas) => {
        return new Promise(resolve => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png', 1);
        });
      });
    },
    // 入参可能是 '1px' '1mm' , 如果是纯数字,则原封不动,因为不知道单位, 返回 像素值
    autoToPx(val) {
      if (typeof val === 'string') {
        let matcher = /([\d.]+)mm/i.exec(val)
        if (matcher && matcher.length === 2) {
          return this.mmToPx(matcher[1])
        } else {
          matcher = /([\d.]+)px/i.exec(val)
          if (matcher && matcher.length === 2) {
            return matcher[1] * 1
          }
        }
      }
      return val;
    },
    // 入参可能是 '1px' '1mm' , 如果是纯数字,则原封不动,因为不知道单位, 返回 毫米值
    autoToMm(val) {
      if (typeof val === 'string') {
        let matcher = /([\d.]+)px/i.exec(val)
        if (matcher && matcher.length === 2) {
          return this.pxToMm(matcher[1])
        } else {
          matcher = /([\d.]+)mm/i.exec(val)
          if (matcher && matcher.length === 2) {
            return matcher[1] * 1
          }
        }
      }
      return val;
    },
    pxToMm(val) {
      return val / this.ratio
    },
    mmToPx(val) {
      return val * this.ratio
    },
    // 测算1毫米对应的像素值
    calcPxOf1mm() {
      let div = document.createElement("div");
      div.style.width = "1000mm";
      div.style.position = 'fixed';
      div.style.left = '9999px';
      div.style.bottom = '9999px';
      document.body.appendChild(div);
      const mm1 = div.getBoundingClientRect();
      div.remove();
      return mm1.width / 1000;
    }
  },
  provide() {
    return {
      autoToPx: this.autoToPx,
      autoToMm: this.autoToMm,
      pxToMm: this.pxToMm,
      mmToPx: this.mmToPx,
      DEFAULT_SING_IMG_URL: DEFAULT_SING_IMG_URL,
      DEFAULT_GROUP_SING_IMG_URL: DEFAULT_GROUP_SING_IMG_URL,
      DEFAULT_SING_IMG_WIDTH: DEFAULT_SING_IMG_WIDTH,
      DEFAULT_SING_IMG_HEIGHT: DEFAULT_SING_IMG_HEIGHT,
      DEFAULT_WIDTH_TO_FONTSIZE: DEFAULT_WIDTH_TO_FONTSIZE,
      DEFAULT_OPINION_WIDTH: DEFAULT_OPINION_WIDTH,
      DEFAULT_OPINION_HEIGHT: DEFAULT_OPINION_HEIGHT
    }
  }
}
</script>
