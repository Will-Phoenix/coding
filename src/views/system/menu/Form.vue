<template>
  <el-dialog :title="!dataForm.id ? '新建应用' : '编辑应用'" :close-on-click-modal="false"
    :close-on-press-escape="false" :visible.sync="visible" lock-scroll
    class="JNPF-dialog JNPF-dialog_center" width="600px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px"
      v-loading="formLoading" class="menuForm">
      <el-form-item label="应用名称" prop="fullName">
        <el-input v-model="dataForm.fullName" placeholder="输入名称" />
      </el-form-item>
      <el-form-item label="应用编码" prop="enCode">
        <el-input v-model="dataForm.enCode" placeholder="输入编码" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-row type="flex">
          <div style="flex:1;margin-right:10px">
            <el-input v-model="dataForm.icon" placeholder="请选择图标" readonly
              :suffix-icon="dataForm.icon">
              <el-button slot="append" @click="openIconBox">选择</el-button>
            </el-input>
          </div>
          <el-color-picker v-model="dataForm.propertyJson.iconBackgroundColor"
            :predefine="['#188ae2', '#35b8e0', '#26bf8c','#f9c851','#ff5b5b', '#5b69bc', '#ff8acc', '#3b3e47','#282828' ]" />
        </el-row>
      </el-form-item>
      <el-form-item label="排序" prop="sortCode">
        <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
          controls-position="right" />
      </el-form-item>
      <el-form-item label="状态" prop="enabledMark">
        <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
      </el-form-item>
      <el-form-item label="说明" prop="bodyText">
        <el-input v-model="dataForm.description" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
        {{$t('common.confirmButton')}}</el-button>
    </span>
    <icon-box :visible.sync="iconBoxVisible" ref="iconBox" :current="dataForm.icon"
      @choiceIcon="choiceIcon" />
  </el-dialog>
</template>

<script>

import iconBox from '@/components/JNPF-iconBox'
import { create, update, info } from "@/api/system/system";
export default {
  components: { iconBox },
  data() {
    return {
      visible: false,
      dataForm: {
        id: '',
        fullName: '',
        enCode: '',
        sortCode: 0,
        icon: '',
        enabledMark: 1,
        description: '',
        propertyJson: {
          iconBackgroundColor: ''
        },
      },
      dataRule: {
        fullName: [
          { required: true, message: '应用不能为空', trigger: 'blur' },
        ],
        enCode: [
          { required: true, message: '应用编码不能为空', trigger: 'blur' },
        ],
        icon: [
          { required: true, message: '应用图标不能为空', trigger: 'click' }
        ],
      },
      formLoading: false,
      iconBoxVisible: false,
      btnLoading: false,
    }
  },
  methods: {
    init(id) {
      this.dataForm.id = id || ''
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.formLoading = true
          info(this.dataForm.id).then(res => {
            this.dataForm = res.data
            const propertyJson = res.data.propertyJson ? JSON.parse(res.data.propertyJson) : null
            this.dataForm.propertyJson = propertyJson || { iconBackgroundColor: '' }
            this.$nextTick(() => { this.formLoading = false })
          }).catch(() => { })
        } else {
          this.dataForm.propertyJson.iconBackgroundColor = ''
          this.dataForm.description = ''
        }
      })
    },
    openIconBox() {
      this.iconBoxVisible = true
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const query = {
            ...this.dataForm,
            propertyJson: JSON.stringify(this.dataForm.propertyJson)
          }
          const formMethod = this.dataForm.id ? update : create
          formMethod(query).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('refreshDataList')
              }
            })
          }).catch(() => {
            this.btnLoading = false
          })
        }

      })
    },
    choiceIcon(value) {
      this.dataForm.icon = value
    }
  },

}
</script>