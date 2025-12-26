<template>
  <el-dialog :title="$t(`user.resetPassword`)" :close-on-click-modal="false"
    :close-on-press-escape="false" :visible.sync="visible" lock-scroll
    class="JNPF-dialog JNPF-dialog_center" width="600px">
    <el-form ref="dataForm" v-loading="formLoading" :model="dataForm" :rules="dataRule"
      label-width="100px">
      <el-form-item label="账户" prop="account">
        <el-input v-model="dataForm.account" placeholder="账户" readonly />
      </el-form-item>
      <el-form-item label="新密码" prop="userPassword">
        <el-input v-model="dataForm.userPassword" type="password" autocomplete="off"
          placeholder="输入新密码" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="validatePassword">
        <el-input v-model="dataForm.validatePassword" type="password" autocomplete="off"
          placeholder="确认新密码" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
        {{$t('common.confirmButton')}}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  resetUserPassword
} from '@/api/permission/user'
import md5 from 'js-md5'
import { getSystemConfig } from '@/api/system/sysConfig'

export default {
  data() {
    const validateUserPassword = (rule, value, callback) => {
      //是否包含数字
      const containsNumbers = /[0-9]+/
      //是否包含小写字符
      const includeLowercaseLetters = /[a-z]+/
      //是否包含大写字符
      const includeUppercaseLetters = /[A-Z]+/
      //是否包含字符
      const containsCharacters = /\W/

      if (value === '') {
        callback(new Error('新密码不能为空'));
      } else if(this.baseForm.passwordStrengthLimit == 1){
        if(this.baseForm.passwordLengthMin){
          if(value.length<this.baseForm.passwordLengthMinNumber){
            callback(new Error('新密码长度不能小于'+this.baseForm.passwordLengthMinNumber+'位'));
          }
        }
        if(this.baseForm.containsNumbers){
          if (!containsNumbers.test(value)) {
            callback(new Error('新密码必须包含数字'));
          }
        }
        if(this.baseForm.includeLowercaseLetters){
          if (!includeLowercaseLetters.test(value)) {
            callback(new Error('新密码必须包含小写字母'));
          }
        }
        if(this.baseForm.includeUppercaseLetters){
          if (!includeUppercaseLetters.test(value)) {
            callback(new Error('新密码必须包含大写字字母'));
          }
        }
        if(this.baseForm.containsCharacters){
          if (!containsCharacters.test(value)) {
            callback(new Error('新密码必须包含字符'));
          }
        }
        if (this.dataForm.password2 !== '') {
          this.$refs.dataForm.validateField('password2');
        }
        callback();
      }else{
        if (this.dataForm.password2 !== '') {
          this.$refs.dataForm.validateField('password2');
        }
        callback();
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.dataForm.userPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    }
    return {
      visible: false,
      formLoading: false,
      btnLoading: false,
      dataForm: {
        id: '',
        account: '',
        userPassword: '',
        validatePassword: ''
      },
      baseForm:{
        passwordStrengthLimit:0,
        passwordLengthMin:false,
        passwordLengthMinNumber:0,
        containsNumbers:false,
        includeLowercaseLetters:false,
        includeUppercaseLetters:false,
        containsCharacters:false,
      },
      dataRule: {
        userPassword: [
          { required: true, validator: validateUserPassword, trigger: 'blur' }
        ],
        validatePassword: [
          { required: true, validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.listLoading = true
      this.$nextTick(() => {
        getSystemConfig().then(res => {
          this.baseForm = res.data
          this.baseForm.passwordLengthMin = this.baseForm.passwordLengthMin ? true : false
          this.baseForm.containsNumbers = this.baseForm.containsNumbers ? true : false
          this.baseForm.includeLowercaseLetters = this.baseForm.includeLowercaseLetters ? true : false
          this.baseForm.includeUppercaseLetters = this.baseForm.includeUppercaseLetters ? true : false
          this.baseForm.containsCharacters = this.baseForm.containsCharacters ? true : false
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      })
    },
    init(id, account) {
      this.visible = true
      this.formLoading = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm.id = id
        this.dataForm.account = account
        this.formLoading = false
      })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const formData = {
            id: this.dataForm.id,
            userPassword: md5(this.dataForm.userPassword),
            validatePassword: md5(this.dataForm.validatePassword)
          }
          resetUserPassword(formData).then(res => {
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
    }
  }
}
</script>
