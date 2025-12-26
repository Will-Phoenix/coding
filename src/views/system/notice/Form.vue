<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" :content="!dataForm.id ? '新建公告' : '编辑公告'" />
        <div class="options">
          <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
            {{$t('common.confirmButton')}}</el-button>
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
        label-width="60px" class="main">
        <el-form-item label="标题" prop="title">
          <el-input v-model="dataForm.title" placeholder="公告标题" />
        </el-form-item>
        <el-form-item label="用户" prop="toUserIds">
          <usersSelect v-model="toUserIds" placeholder="全部用户" multiple clearable />
        </el-form-item>
        <el-form-item label="附件" prop="files">
          <JNPF-UploadFz v-model="files" />
        </el-form-item>
        <el-form-item label="正文" prop="bodyText">
          <JNPFQuill v-model="dataForm.bodyText" />
        </el-form-item>
      </el-form>
    </div>
  </transition>
</template>

<script>
import { createNotice, updateNotice, getNoticeInfo } from '@/api/system/message'
export default {
  data() {
    return {
      visible: false,
      formLoading: false,
      btnLoading: false,
      dataForm: {
        id: '',
        toUserIds: '',
        title: '',
        files: '',
        bodyText: ''
      },
      toUserIds: [],
      files: [],
      dataRule: {
        title: [
          { required: true, message: '公告标题不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    goBack() {
      this.$emit('close')
    },
    init(id) {
      this.dataForm.id = id || 0
      this.files = []
      this.toUserIds = []
      this.visible = true
      this.formLoading = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          getNoticeInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.files = res.data.files ? JSON.parse(res.data.files) : []
            this.toUserIds = res.data.toUserIds ? res.data.toUserIds.split(',') : []
          })
        }
        this.formLoading = false
      })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          this.dataForm.files = JSON.stringify(this.files)
          this.dataForm.toUserIds = this.toUserIds.join(',')
          const formMethod = this.dataForm.id ? updateNotice : createNotice
          formMethod(this.dataForm).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('refreshDataList')
                this.goBack()
              }
            })
          }).catch(() => {
            this.btnLoading = false
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.JNPF-preview-main {
  .content {
    >>> {
      p {
        line-height: 30px;
        img {
          display: block;
          margin-right: auto;
          margin-left: auto;
        }
      }
    }
  }
  .vab-quill-content {
    >>> {
      .el-form-item__content {
        line-height: normal;
      }
    }
  }
}
.transfer-pane__body-tab {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .el-tabs__header {
    margin-bottom: 0;
    flex-shrink: 0;

    .el-tabs__nav {
      width: 100%;

      .el-tabs__item {
        width: 25%;
        text-align: center;
        padding: 0 20px;
      }
    }
  }

  &.hasSys-tab {
    .el-tabs__header .el-tabs__nav .el-tabs__item {
      width: 25%;
    }
  }

  .el-tabs__content {
    flex: 1;

    .el-tab-pane {
      height: 100%;
      padding: 10px;
      overflow: auto;

      .JNPF-common-el-tree {
        margin: 0;
      }
    }
  }
}
</style>