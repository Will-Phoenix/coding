<template>
  <el-dialog
    v-bind="$attrs"
    :close-on-click-modal="false"
    :modal-append-to-body="false"
    v-on="$listeners"
    @open="onOpen"
    fullscreen
    lock-scroll
    class="JNPF-full-dialog"
    :show-close="false"
    :modal="false"
  >
    <div class="JNPF-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/jnpf.png" class="header-logo">
        <p class="header-txt"> · 打印预览</p>
      </div>
      <div class="options">
        <el-button type="primary" size="small" @click="toImage('view')">生成图片并查看</el-button>
        <el-button type="primary" size="small" @click="toImage('download')">生成图片并下载</el-button>
        <el-button type="primary" size="small" @click="print">打印</el-button>
        <el-button @click="closeDialog()">{{ $t('common.cancelButton') }}</el-button>
      </div>
    </div>
    <div class="main" v-loading="loading">
      <div>
        <div ref="tsPrint" class="print-content" :style="printContentStyle" t="123" v-html="data" />
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getPrintDevInfo } from '@/api/system/printDev'
import html2canvas from 'html2canvas'
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'

export default {
  props: ['id'],
  data() {
    return {
      data: '',
      info: {},
      loading: false
    }
  },
  computed: {
    printContentStyle() {
      let ret = {}
      if (this.info.pageParam) {
        let pageParamObj = {};
        try {
          pageParamObj = JSON.parse(this.info.pageParam)
        } catch (e) {
          console.warn(e)
        }
        const { width, height, mt, mb, ml, mr } = pageParamObj
        if (width && height) {
          ret = {
            "box-sizing": "border-box",
            width: `${width}mm`,
            height: `${height}mm`,
            paddingTop: `${mt || 0}mm`,
            paddingBottom: `${mb || 0}mm`,
            paddingLeft: `${ml || 0}mm`,
            paddingRight: `${mr || 0}mm`,
          }
        }
      }
      return ret;
    }
  },
  methods: {
    onOpen() {
      this.loading = true
      getPrintDevInfo(this.id).then(res => {
        this.info = res.data
        this.data = res.data.printTemplate
        this.loading = false
      })
    },
    closeDialog() {
      this.$emit('update:visible', false)
    },
    word() {
      let print = this.$refs.tsPrint.innerHTML
      const blob = new Blob([print], {
        type: ''
      })
      const name = '下载文档.doc'
      this.downloadFile(blob, name)
    },
    downloadFile(data, name, type) {
      let blob = new Blob([data], {
        type: type || ''
      })
      let downloadElement = document.createElement('a')
      let href = window.URL.createObjectURL(blob)
      downloadElement.href = href
      downloadElement.download = name
      document.body.appendChild(downloadElement)
      downloadElement.click()
      document.body.removeChild(downloadElement)
      window.URL.revokeObjectURL(href)
    },
    print() {
      let print = this.$refs.tsPrint.innerHTML
      let newWindow = window.open('_blank')
      newWindow.document.body.innerHTML = print
      newWindow.print()
      newWindow.close()
    },
    toImage(type) {
      // 参考 https://html2canvas.hertzen.com/configuration
      return html2canvas(this.$refs.tsPrint, {
        backgroundColor: "#ffffff",
        allowTaint: true,
        useCORS: true,
        scale: 2.5
      }).then((canvas) => {
        if (type === 'download') {
          const dataURL = canvas.toDataURL('image/png', 1)
          saveAs(dataURL, `导出-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.png`)
        } else if (type === 'view') {
          canvas.toBlob((blob) => {
            const uri = window.URL.createObjectURL(blob);
            window.open(uri);
          }, 'image/png', 1)
        }
      });
    }
  }
}
</script>
<style lang="scss" scoped>
  .print-content {
    background: white;
    padding: 40px 30px;
    margin: 0 auto;
    border-radius: 4px;
    width: 776px;
    height: 100%;
    overflow: hidden auto;
  }
</style>
