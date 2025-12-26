<template>
  <div>
    <template v-if="isImage && previewImg">
      <el-image
        :src="info.url"
        class="preview-img"
        fit="fill"
        @click="preview"
        :preview-src-list="[info.url]"
      />
    </template>
    <template v-else>
      <div class="invoice-file-item">
        <el-image
          v-if="icon"
          :src="icon"
          class="icon"
        />
        <div class="name">{{ info.name }}</div>
        <div>
          <span class="btn-view" @click="previewFile">查看</span>
          <slot :fileInfo="info"></slot>
        </div>
      </div>
    </template>
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'
import { FILE_TYPE_ICON_UNKNOWN, getFileTypeIconMap } from '@/utils/cicada'
import previewOnline from '@/components/preview-online'
import { downloadFile } from "@/api/business/signature";

export default defineComponent({
  name: 'InvoiceFile',
  components: {
    previewOnline
  },
  props: {
    fid: {
      type: String,
      required: true
    },
    previewImg: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    // 状态定义
    const info = ref({
      url: '',
      name: '',
      fileExtension: ''
    })
    const preview = ref({
      visible: false,
      fileUrl: '',
      fileTitle: ''
    })

    // 计算属性
    const extension = computed(() => info.value?.fileExtension || '')

    const icon = computed(() => {
      return getFileTypeIconMap()[extension.value.toLowerCase()] || FILE_TYPE_ICON_UNKNOWN
    })

    const isImage = computed(() => {
      return ['png', 'jpeg', 'jpg'].includes(extension.value.toLowerCase())
    })

    // 方法定义
    const loadFileInfo = async() => {
      if (props.fid) {
        const result = await downloadFile(props.fid)
        info.value = result.data
      } else {
        info.value = {}
      }
    }

    const previewFile = async() => {
      // https://docs.taro.zone/docs/apis/files/openDocument/
      const url = info.value.url
      if (!url) return
      console.log(url, info)
      preview.value = { visible: true, fileUrl: url, fileTitle: info.value.name }
    }

    // 监听 fid 变化
    watch(() => props.fid, () => {
      loadFileInfo()
    }, { immediate: true })

    // 暴露给模板
    return {
      preview,
      info,
      extension,
      icon,
      isImage,
      previewFile
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-img {
  width: 100%;
  height: auto;
}

.invoice-file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #F7F8FA;
  border-radius: 4px;
  margin-bottom: 8px;

  .icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
  }

  .name {
    flex: 1;
    font-size: 14px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-view {
    padding: 4px 12px;
    color: #00b4c4;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
