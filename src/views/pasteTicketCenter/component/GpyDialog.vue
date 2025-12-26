<template>
  <el-dialog
    :close-on-click-modal="false"
    class="JNPF-dialog"
    lock-scroll
    append-to-body
    width="1200px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
    custom-class="dialog-custom-nopd"
  >
    <div slot="title">{{ title }} <a :href="downSdkUrl" target="_blank" class="adown">高拍仪驱动下载</a></div>
    <div class="content">
      <div class="left" v-if="visible">
        <iframe :src="support.src" class="iiframe" />
      </div>
      <div class="right" v-if="imgList.length>0">
        <div class="images-wrapper">
          <div class="images">
            <div v-for="(s,index) in imgList" :key="index" class="img-wrapper">
              <el-image :src="s" fit="contain" :preview-src-list="imgList" class="image" />
              <i class="el-icon-delete-solid btn-del" @click="remove(index)" />
            </div>
          </div>
        </div>
        <div class="submit-line">
          <el-button type="primary" block class="btn-submit" @click="onConfirm" :loading="loading||selfLoading" :disabled="loading||selfLoading">上传当前{{ imgList.length }}张</el-button>
          <el-button v-if="supportPdf" type="primary" block class="btn-submit" @click="onConfirmPdf" :loading="loading||selfLoading" :disabled="loading||selfLoading">合并成PDF并上传</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { imgToPdf } from '@/utils/pdf'

export default {
  name: 'GpyDialog',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 提交按钮的loading状态
    loading: {
      type: Boolean,
      default: false
    },
    // 是否支持合并图片生成PDF
    supportPdf: {
      type: Boolean,
      default: false,
    },
    // 生成的PDF 页面内边距, 默认值: 10 ,单位: 毫米
    pdfPagePadding: {
      type: Number,
      default: 10
    },
    // 设备类型: 1.汉王/科密高拍仪; 2.良田高拍仪;
    deviceType: {
      type: [Number, String],
      default: 1
    }
  },
  data() {
    return {
      imgList: [],
      selfLoading: false
    }
  },
  computed: {
    SERVER_URL() {
      return this.$route.query.SERVER_URL || ''
    },
    downSdkUrl() {
      return `${process.env.VUE_APP_PUBLIC_PATH}downloads/gpy-sdk.html`
    },
    support() {
      switch (`${this.deviceType}`) {
        case '1':
          return { supportTip: "（支持设备：汉王、科密）", src: `${location.origin}${process.env.VUE_APP_PUBLIC_PATH}gpy/index.html?SOCKET_SERVER_URL=${this.SERVER_URL || 'ws://127.0.0.1:22225'}` }
        case "2":
          return { supportTip: "（支持设备：良田）", src: `${location.origin}${process.env.VUE_APP_PUBLIC_PATH}gpy2/index.html?SERVER_URL=${this.SERVER_URL || 'http://127.0.0.1:38088'}` }
        default:
          return { supportTip: "", src: '' }
      }
    },
    title() {
      return `高拍仪${this.support.supportTip}`
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.init();
      } else {
        this.destroy();
        this.imgList = [];
      }
    }
  },
  beforeDestroy() {
    this.destroy();
  },
  methods: {
    remove(index) {
      this.imgList.splice(index, 1)
    },
    onConfirm() {
      this.$emit('confirm', [...this.imgList], 'img')
    },
    async onConfirmPdf() {
      this.selfLoading = true;
      try {
        const blob = await imgToPdf(this.imgList, this.pdfPagePadding);
        this.$emit('confirm', blob, 'pdf')
      } catch (e) {
        console.error(e);
        const msg = e ? typeof e === 'string' ? e : (e.msg || e.message) : ''
        this.$message.warning(msg || "生成失败");
      } finally {
        this.selfLoading = false;
      }
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    init() {
      this.destroy();
      this.$handleMsg = (e) => {
        if (e && e.data && e.data.type === "takePhoto") {
          const dataURL = e.data.data;
          if (dataURL) {
            this.imgList.push(dataURL)
          }
        }
      }
      window.addEventListener("message", this.$handleMsg, false);
    },
    destroy() {
      if (this.$handleMsg) {
        window.removeEventListener("message", this.$handleMsg);
        this.$handleMsg = null;
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.content {
  display: flex;
  box-sizing: border-box;
  height: 600px;
  -moz-osx-font-smoothing: unset;
  -webkit-font-smoothing: auto;
  .left {
    width: 750px;
    padding-left: 10px;
    padding-right: 10px;
    .iiframe {
      width: 100%;
      height: 100%;
      border: none;
      padding: 0;
      margin: 0;
    }
  }
  .right {
    width: 0;
    flex: 1;
    padding-top: 10px;
  }
  .images-wrapper {
    height: calc(100% - 86px);
    overflow: auto;
    width: 100%;
  }
  .images {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    .img-wrapper {
      position: relative;
      width: calc((100% - 24px) / 2);
      height: 140px;
      margin-right: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
      .image {
        width: 100%;
        height: 100%;
        ::v-deep .el-image__preview {
          cursor: zoom-in;
        }
      }
    }
  }
  .btn-del {
    color: red;
    font-size: 16px;
    position: absolute;
    right: 0px;
    top: 0px;
    cursor: pointer;
  }
  .submit-line {
    width: 100%;
    padding-right: 10px;
    display: flex;
    align-items: center;
  }
  .btn-submit {
    height: 76px;
    width: 100%;
    border-radius: 8px;
    font-size: 16px;
    font-weight: normal;
    color: #FFFFFF;
    border: none;
    background-color: rgba(0, 180, 196, 1);
  }
  .btn-submit.is-disabled {
    background-color: rgba(0, 180, 196, 0.5);
    border: none;
    color: #ffffff;
  }
  .btn-submit:active {
    background-color: rgba(0, 180, 196, 0.8);
    border: none;
    color: #ffffff;
  }
  .btn-submit:focus, .btn-submit:hover {
    background-color: rgba(0, 180, 196, 0.9);
    border: none;
    color: #ffffff;
  }
}
.adown {
  color: blue;
  font-size: 14px;
  text-decoration: underline;
  margin-left: 20px;
  cursor: pointer;
}
</style>
