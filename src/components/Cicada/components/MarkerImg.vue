<template>
  <div v-if="type === 'opinion'" :style="opinionStyle">{{ opinion }}{{ data.opinion ? "" : index + 1 }}</div>
  <div v-else-if="configureSign" class="image-container" :style="imgStyle">
    <img :src="src" class="background-image">
    <div v-if="data.signType !== 3" class="number" :style="numberStyle">{{ index + 1 }}</div>
  </div>
  <div v-else-if="systemSign" :style="imgStyle">{{ data.signUserName }}</div>
  <div v-else-if="countersign" :style="groupImgStyle[0]">
    <div v-for="(item, index) in data.signSealImgUrls" :key="index" :style="groupImgStyle[1]">
      <img :src="item" :style="groupImgStyle[2]">
    </div>
  </div>
  <img v-else :src="src" :title="title" :style="imgStyle">
</template>
<script>
import { parseJsonObj } from '@/components/Cicada/printHelper';

// 签章图片
export default {
  name: 'MarkerImg',
  inject: ['autoToPx', 'autoToMm', 'pxToMm', 'mmToPx', 'DEFAULT_SING_IMG_URL', 'DEFAULT_GROUP_SING_IMG_URL', 'DEFAULT_SING_IMG_WIDTH', 'DEFAULT_SING_IMG_HEIGHT', 'DEFAULT_WIDTH_TO_FONTSIZE', 'DEFAULT_OPINION_WIDTH', 'DEFAULT_OPINION_HEIGHT'],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    index: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      validator: function(value) {
        return ['stamp', 'sign', 'opinion'].includes(value)
      },
      default: 'stamp'
    },
    pageParamObj: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    systemSign() {
      return this.data.signType === 2 && this.type === "sign" && this.data.signUserName
    },
    countersign() {
      return this.data.signType === 3 && this.type === "sign" && this.data.signSealImgUrls
    },
    src() {
      return this.data.image ? this.data.image : this.data.signType === 3 ? this.DEFAULT_GROUP_SING_IMG_URL : this.DEFAULT_SING_IMG_URL
    },
    opinion() {
      return this.data.opinion || "意见"
    },
    configureSign() {
      // 配置时和真正渲染时区分开来
      return this.type === "sign" && !this.data.image && !this.data.signUserName;
    },
    imgStyle() {
      let obj = { 'box-sizing': 'border-box', 'object-fit': 'contain' };
      try {
        const temp = JSON.parse(this.data.styleJson || '{}')
        Object.assign(obj, temp)
      } catch (e) {
        console.warn('解析签章style失败', e)
      }
      if (this.src === this.DEFAULT_SING_IMG_URL && (!obj.width || !obj.height)) {
        obj.width = `${this.pxToMm(this.DEFAULT_SING_IMG_WIDTH)}mm`
        obj.height = `${this.pxToMm(this.DEFAULT_SING_IMG_HEIGHT)}mm`
      }
      // 对象内的 width,height,left,top 参数值示例: '1mm'
      return obj;
    },
    groupImgStyle() {
      const { width, ml, mr } = this.pageParamObj;
      const styleObj = parseJsonObj(this.data.styleJson);
      const childContainer = parseJsonObj(styleObj.childContainer);
      const childStyle = parseJsonObj(styleObj.childStyleJson);
      delete styleObj.childContainer;
      delete styleObj.childStyleJson;
      styleObj.height = 'auto';
      styleObj.width = `${width - ml - mr - styleObj.left.split("mm")[0]}mm`;
      console.log("处理后的签名组父样式=========>", styleObj);
      console.log("处理后的签名组子容器=========>", childContainer);
      console.log("处理后的签名组子样式=========>", childStyle);
      return [styleObj, childContainer, childStyle];
    },
    opinionStyle() {
      let obj = { 'box-sizing': 'border-box' };
      try {
        const temp = JSON.parse(this.data.opinionStyleJson || '{}')
        Object.assign(obj, temp)
      } catch (e) {
        console.warn('解析意见style失败', e)
      }
      if (!obj.width || !obj.height) {
        obj.width = `${this.pxToMm(this.DEFAULT_OPINION_WIDTH)}mm`
        obj.height = `${this.pxToMm(this.DEFAULT_OPINION_HEIGHT)}mm`
      }
      if (!this.data.opinion) {
        obj['background'] = 'rgba(128, 128, 128, 0.5)';
        obj['font-size'] = '3.175mm';
        obj['display'] = 'flex';
        obj['align-items'] = 'center';
      }
      // 对象内的 width,height,left,top 参数值示例: '1mm'
      return obj;
    },
    numberStyle() {
      const styleObj = {};
      const { width } = this.imgStyle;
      // 宽度转换成字体大小，高度转换成top的值
      if (width) {
        styleObj['font-size'] = (this.autoToMm(width) / this.DEFAULT_WIDTH_TO_FONTSIZE) + 'mm';
        styleObj['top'] = `calc(50% - ${this.autoToPx(styleObj['font-size']) / 2}px)`;
        styleObj['right'] = `${this.autoToPx(styleObj['font-size']) / 2}px`;
      } else {
        styleObj['font-size'] = this.pxToMm(this.DEFAULT_SING_IMG_WIDTH / this.DEFAULT_WIDTH_TO_FONTSIZE) + 'mm';
        styleObj['top'] = `calc(50% - ${this.autoToPx(styleObj['font-size']) / 2}px)`;
        styleObj['right'] = `${this.autoToPx(styleObj['font-size']) / 2}px`;
      }
      return styleObj;
    },
    title() {
      return this.data.name ? `${this.data.name} 打印尺寸(单位毫米): \n宽${this.imgStyle.width} \n高${this.imgStyle.height}` : undefined;
    }
  }
}
</script>

<style scoped>
  .image-container {
    display: inline-block;
  }
  .background-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .number {
    position: absolute;
  }
</style>
