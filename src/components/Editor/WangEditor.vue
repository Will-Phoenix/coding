<template>
  <div :class="prefixCls">
    <div ref="editor" class="editor-wrapper" />
  </div>
</template>

<script>
import WEditor from 'wangeditor'
import store from "@/store";
import { getToken } from "@/utils/auth";
import { downloadFile } from "@/api/business/signature";

export default {
  name: 'WangEditor',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-editor-wang'
    },
    // eslint-disable-next-line
    value: {
      type: String
    }
  },
  data() {
    return {
      editor: null,
      editorContent: null
    }
  },
  watch: {
    value(val) {
      if (this.editorContent !== val) {
        this.editorContent = val
        this.editor.txt.html(val)
      }
    }
  },
  mounted() {
    this.initEditor()
  },
  methods: {
    initEditor() {
      const that = this
      this.editor = new WEditor(this.$refs.editor)
      this.editor.onchangeTimeout = 200
      this.editor.customConfig.menus = [
        'head', // 标题
        'bold', // 粗体
        'fontSize', // 字号
        'fontName', // 字体
        'italic', // 斜体
        'underline', // 下划线
        'strikeThrough', // 删除线
        'foreColor', // 文字颜色
        'backColor', // 背景颜色
        'link', // 插入链接
        'list', // 列表
        'justify', // 对齐方式
        'quote', // 引用
        'emoticon', // 表情
        'image', // 插入图片
        'table', // 表格
        'code', // 插入代码
        'undo', // 撤销
        'redo' // 重复
      ]
      this.editor.customConfig.uploadImgShowBase64 = true
      this.editor.customConfig.showLinkImg = false
      // 配置服务器端地址
      this.editor.customConfig.uploadImgServer = process.env.VUE_APP_BASE_API + '/api/biz/ccdFile/uploader'
      // 配置服务器header
      this.editor.customConfig.uploadImgHeaders = {
        Authorization: store.getters.token || getToken()
      }
      // 配置图片filename
      this.editor.customConfig.uploadFileName = 'file'
      // 监听函数
      this.editor.customConfig.uploadImgHooks = {
        before: function(xhr, editor, files) {
          // 图片上传之前触发
          // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，files 是选择的图片文件
          // 如果返回的结果是 {prevent: true, msg: 'xxxx'} 则表示用户放弃上传
          // return {
          //     prevent: true,
          //     msg: '放弃上传'
          // }
        },
        success: function(xhr, editor, result) {
          // 图片上传并返回结果，图片插入成功之后触发
          // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        },
        fail: function(xhr, editor, result) {
          // 图片上传并返回结果，但图片插入错误时触发
          // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        },
        error: function(xhr, editor) {
          // 图片上传出错时触发
          // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
        },
        timeout: function(xhr, editor) {
          // 图片上传超时时触发
          // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
        },

        // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
        // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
        customInsert: function(insertImg, result, editor) {
          // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
          // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果

          // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
          if (result && result.code === 200) {
            let fid = result.data.id;
            // 下载文件
            downloadFile(fid).then(res => {
              insertImg(res.data.url)
            });
          }
          /* result.data.forEach((e) => {
            insertImg(e)
          }) */

          // result 必须是一个 JSON 格式字符串！！！否则报错
        }
      }
      this.editor.customConfig.onchange = (html, aaaa) => {
        this.editorContent = html
        if (this.editorContent === '<p><br></p>') {
          this.editorContent = ''
          this.editor.txt.clear()
        }
        this.$emit('change', this.editorContent)
        that.$emit('input', this.editorContent)
      }
      this.editor.create()
    },
    clearEdtitor() {
      this.editor.txt.clear()
    },
    appendEdtitor(e) {
      this.editor.txt.html(e)
    }
  }
}
</script>

<style lang="scss" scoped>
.ant-editor-wang {
  .editor-wrapper {
    text-align: left;
  }
}
::v-deep .w-e-toolbar {
  flex-wrap: wrap;
}
</style>
