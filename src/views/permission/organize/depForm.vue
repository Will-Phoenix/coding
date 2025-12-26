<template>
  <el-dialog
    :title="!dataForm.id ? $t(`department.addDepartment`) : $t(`department.editDepartment`)"
    :close-on-click-modal="false" :close-on-press-escape="false" :visible.sync="visible" lock-scroll
    class="JNPF-dialog JNPF-dialog_center" width="600px">
    <el-form ref="dataForm" v-loading="formLoading" :model="dataForm" :rules="dataRule"
      label-width="100px">
      <el-form-item label="所属组织" prop="parentId">
        <ComSelect v-model="organizeIdTree" placeholder="选择所属组织" auth @change="onOrganizeChange"
          :currOrgId="dataForm.id||'0'" />
      </el-form-item>
      <el-form-item label="部门名称" prop="fullName">
        <el-input v-model="dataForm.fullName" placeholder="输入名称" />
      </el-form-item>
      <el-form-item label="部门编码" prop="enCode">
        <el-input v-model="dataForm.enCode" placeholder="输入编码" />
      </el-form-item>
      <el-form-item label="部门负责人" prop="orgLeaderId">
        <user-select v-model="dataForm.orgLeaderId" placeholder="选择部门负责人" multiple :parent-id="userInfo.companyId || '0'" />
      </el-form-item>
      <el-form-item label="分管领导" prop="managerId">
        <user-select v-model="dataForm.managerId" placeholder="选择分管领导" multiple :parent-id="userInfo.companyId || '0'" />
      </el-form-item>
      <el-form-item label="排序" prop="sortCode">
        <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
          controls-position="right" />
      </el-form-item>
      <el-form-item label="说明" prop="description">
        <el-input v-model="dataForm.description" type="textarea" :rows="3" />
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
import { createDepartment, updateDepartment, getDepartmentInfo } from '@/api/permission/department'
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      visible: false,
      formLoading: false,
      btnLoading: false,
      dataForm: {
        id: '',
        parentId: '',
        managerId: [],
        orgLeaderId: [],
        fullName: '',
        enCode: '',
        sortCode: 0,
        enabledMark: 1,
        description: ''
      },
      organizeIdTree: [],
      dataRule: {
        parentId: [
          { required: true, message: '所属组织不能为空', trigger: 'change' }
        ],
        fullName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' },
          { max: 50, message: '部门名称最多为50个字符！', trigger: 'blur' }
        ],
        enCode: [
          { required: true, message: '请输入部门编码', trigger: 'blur' },
          { validator: this.formValidate('enCode', '部门编码只能输入英文、数字和小数点且小数点不能放在首尾'), trigger: 'blur' },
          { max: 50, message: '部门编码最多为50个字符！', trigger: 'blur' }
        ],
        /* orgLeaderId: [
          { required: true, message: '请选择部门负责人', trigger: 'blur' }
        ],
        managerId: [
          { required: true, message: '请选择分管领导', trigger: 'blur' }
        ], */
      }
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
  },
  methods: {
    init(id) {
      this.visible = true
      this.dataForm.id = id || ''
      this.organizeIdTree = []
      this.formLoading = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          getDepartmentInfo(this.dataForm.id).then(res => {
            res.data.managerId = res.data.managerId ? res.data.managerId.split(',') : []
            res.data.orgLeaderId = res.data.orgLeaderId ? res.data.orgLeaderId.split(',') : []
            this.dataForm = res.data
            this.organizeIdTree = res.data.organizeIdTree
            this.formLoading = false
          })
        } else {
          this.formLoading = false
        }
      })
    },
    onOrganizeChange(val) {
      if (!val || !val.length) return this.dataForm.parentId = ''
      this.dataForm.parentId = val[val.length - 1]
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const formMethod = this.dataForm.id ? updateDepartment : createDepartment
          const params = {
            ...this.dataForm,
            orgLeaderId: this.dataForm.orgLeaderId ? this.dataForm.orgLeaderId.join(',') : '',
            managerId: this.dataForm.managerId ? this.dataForm.managerId.join(',') : '',
          }
          formMethod(params).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$store.commit('generator/SET_COMPANY_TREE', [])
                this.$store.commit('generator/SET_DEP_TREE', [])
                this.$emit('close', true)
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
