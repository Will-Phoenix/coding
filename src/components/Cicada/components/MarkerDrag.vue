<template>
  <vue-drag-resize
    ref="drag"
    :minw="10"
    :minh="10"
    :aspect-ratio="type !== 'opinion'"
    :sticks="['tl', 'tr', 'br', 'bl']"
    :title="title"
    v-bind="dragResizeProps"
    @dragstop="onDragStop"
    @resizing="onResizing"
  >
    <div v-if="type === 'opinion'" :style="opinionPreviewStyle">意见{{ index + 1 }}</div>
    <div v-else class="image-container">
      <img :src="src" class="background-image">
      <div v-if="!data.image && data.signType !== 3" class="number" :style="numberStyle">{{ index + 1 }}</div>
    </div>
  </vue-drag-resize>
</template>
<script>
import VueDragResize from 'vue-drag-resize'

// 签章拖拽
export default {
  name: 'MarkerDrag',
  components: { VueDragResize },
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
    }
  },
  data() {
    return {
      positionAndSize: {}
    }
  },
  computed: {
    src() {
      return this.data.image ? this.data.image : this.data.signType === 3 ? this.DEFAULT_GROUP_SING_IMG_URL : this.DEFAULT_SING_IMG_URL
    },
    dragResizeProps() {
      const { width, height, left, top } = this.styles
      let w = this.autoToPx(width);
      let h = this.autoToPx(height);
      let x = Number(this.autoToPx(left));
      let y = Number(this.autoToPx(top));
      if (this.type === "sign" && (!w || !h)) {
        w = this.DEFAULT_SING_IMG_WIDTH
        h = this.DEFAULT_SING_IMG_HEIGHT
      }
      if (this.type === "opinion" && (!w || !h)) {
        w = this.DEFAULT_OPINION_WIDTH;
        h = this.DEFAULT_OPINION_HEIGHT;
      }
      if (!w || !h) {
        console.warn('图片尺寸参数无效!', { w, h })
      }
      // 参数值都是数字, 单位:px
      return { w, h, x, y, }
    },
    opinionPreviewStyle() {
      return {
        background: 'rgba(128, 128, 128, 0.5)',
        height: '100%',
        'font-size': '3.175mm',
        display: 'flex',
        'align-items': 'center'
      };
    },
    numberStyle() {
      const styleObj = {};
      const { width } = this.styles;
      const width2 = this.positionAndSize.width;
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
      // 若拖动了，则用拖动后的覆盖
      if (width2) {
        styleObj['font-size'] = (this.pxToMm(width2) / this.DEFAULT_WIDTH_TO_FONTSIZE) + 'mm';
        styleObj['top'] = `calc(50% - ${this.autoToPx(styleObj['font-size']) / 2}px)`;
        styleObj['right'] = `${this.autoToPx(styleObj['font-size']) / 2}px`;
      }
      return styleObj;
    },
    styles() {
      let obj = { };
      let temp = {};
      try {
        if (this.type === "opinion") {
          temp = JSON.parse(this.data.opinionStyleJson || '{}')
        } else {
          temp = JSON.parse(this.data.styleJson || '{}');
        }
        Object.assign(obj, temp)
      } catch (e) {
        console.warn('解析签章意见style失败', e)
      }
      return obj;
    },
    title() {
      let w, h;
      const { width, height } = this.positionAndSize;
      if (width && height) {
        w = this.pxToMm(width);
        h = this.pxToMm(height);
      }
      return `${this.data.name}` + (w & h ? ` 当前尺寸(单位毫米): \n宽${w}mm \n高${h}mm` : '')
    }
  },
  methods: {
    getRect() {
      const { width, height, left, top, right, bottom, x, y } = this.$refs.drag;
      return { width, height, left, top, right, bottom, x, y }
    },
    onDragStop(params) {
      this.positionAndSize = params
    },
    onResizing(params) {
      this.positionAndSize = params
    }
  }
}
</script>

<style scoped>
  .image-container {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
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
