<template>
  <el-dialog
      :title="title"
      :close-on-click-modal="false"
      class="JNPF-dialog JNPF-dialog_center form-script-dialog"
      lock-scroll
      append-to-body width="80vw"
      :modal-append-to-body="false"
      destroy-on-close
      :visible="visible"
      @update:visible="updateVisible"
  >
    <div class="form-script-dialog-body">
      <div class="right-main">
        <div class="codeEditor">
          <JNPFCodeEditor v-model="text" :options="options" ref="CodeEditor"/>
        </div>
        <slot name="tips"></slot>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import JNPFCodeEditor from '@/components/JNPFEditor/monaco'

export default {
  name: 'CodeEditDialog',
  components: { JNPFCodeEditor },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时会更新
    value: {
      type: String,
      default: ''
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    title: {
      default: '编辑'
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      text: ''
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.init()
      } else {

      }
    }
  },
  methods: {
    init() {
      this.text = this.value
      this.$nextTick(() => {
        this.$refs.CodeEditor.changeEditor({
          value: this.text,
          options: this.options
        })
      })
    },
    onConfirm() {
      this.$emit('update:value', this.text)
      this.$emit('confirm', this.text)
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>
