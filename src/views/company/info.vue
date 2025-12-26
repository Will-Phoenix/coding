<template>
  <div class="app-container JNPF-flex-main padbox">
    <el-form ref="elForm" :model="dataForm" :rules="dataRule" size="small" label-width="120px" label-position="right" :disabled="setting.readonly">
      <el-row :gutter="24">
        <el-col
          :span="12"
        >
          <el-form-item
            label="企业名称"
            prop="objecttype"
          >
            <el-input
              v-model="dataForm.objecttype"
              placeholder="请输入"
              :maxlength="50"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            label="企业税号"
            prop="objectid"
          >
            <el-input
              v-model="dataForm.objectid"
              placeholder="请输入"
              :maxlength="50"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            label="所在城市"
            prop="description"
          >
            <JNPF-Address
              v-model="dataForm.description"
              placeholder="请选择"
              clearable
              :level="1"
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            label="企业地址"
            prop="enabledmark"
          >
            <el-input
              v-model="dataForm.enabledmark"
              placeholder="请输入"
              :maxlength="50"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            label="银行账户"
            prop="creatortime"
          >
            <el-input
              v-model="dataForm.creatortime"
              placeholder="请输入"
              :maxlength="50"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            label="开户银行"
            prop="creatoruserid"
          >
            <el-input
              v-model="dataForm.creatoruserid"
              placeholder="请输入"
              :maxlength="50"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            label="企业电话"
            prop="deletetime"
          >
            <el-input
              v-model="dataForm.deletetime"
              placeholder="请输入"
              :maxlength="11"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            label="纳税人识别号"
            prop="systemid"
          >
            <el-input
              v-model="dataForm.systemid"
              placeholder="请输入"
              :maxlength="50"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="24"
        >
          <el-form-item
            label="企业LOGO"
            prop="tenantid"
          >
            <JNPF-UploadImg
              v-model="dataForm.tenantid"
              :file-size="10"
              size-unit="MB"
              :limit="1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label-width="0" style="text-align: center;">
            <el-button type="primary" @click="dataFormSubmit">保 存</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script>
import request from '@/utils/request'
export default {
  components: {},
  props: [],
  data() {
    return {
      visible: false,
      loading: false,
      setting: {},
      eventType: '',
      userBoxVisible: false,
      currTableConf: {},
      addTableConf: {
      },
      tableRows: {
      },
      dataForm: {
        id: '',
        flowId: '',
        status: 1,
        freeapproveruserid: '',
        flowUrgent: 1,
        objecttype: undefined,
        objectid: undefined,
        description: [],
        enabledmark: undefined,
        creatortime: undefined,
        creatoruserid: undefined,
        deletetime: undefined,
        systemid: undefined,
        tenantid: [],
      },
      tableRequiredData: {},
      dataRule: {
        objecttype: [
          { required: true, message: '企业名称不能为空', trigger: 'change' }
        ],
        objectid: [
          { required: true, message: '企业税号不能为空', trigger: 'change' }
        ],
        description: [
          { required: true, message: '所在城市不能为空', trigger: 'change' }
        ],
        enabledmark: [
          { required: true, message: '企业地址，电话不能为空', trigger: 'change' }
        ],
        creatortime: [
          { required: true, message: '银行账户不能为空', trigger: 'change' }
        ],
        creatoruserid: [
          { required: true, message: '开户银行不能为空', trigger: 'change' }
        ],
        deletetime: [
          { required: true, message: '银行电话信息不能为空', trigger: 'change' }
        ],
        systemid: [
          { required: true, message: '纳税人识别号不能为空', trigger: 'change' }
        ]
      },

    }
  },
  computed: {
    formOperates() {
      return this.setting.formOperates
    }
  },
  watch: {},
  created() {
  },
  mounted() {},
  methods: {
    init(data) {
      this.dataForm.id = data.id || "";
      this.setting = data;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields();
        if (this.dataForm.id) {
          this.loading = true
          request({
            url: '/api/system/Base_appdata/' + this.dataForm.id,
            method: 'get'
          }).then(res => {
            this.dataInfo(res.data)
            this.loading = false
          })
        }
        this.$emit('setPageLoad')
      })
      this.$store.commit('generator/UPDATE_RELATION_DATA', {})
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['elForm'].validate((valid) => {
        if (valid) {
          // if (this.eventType === 'submit') {
          //   this.$confirm('您确定要提交当前流程吗, 是否继续?', '提示', {
          //     type: 'warning'
          //   }).then(() => {
          //     this.request()
          //   }).catch(() => { });
          // } else {
          //   this.request()
          // }
        }
      })
    },
    request() {
      var _data = this.dataList()
      if (!this.dataForm.id) {
        request({
          url: '/api/system/Base_appdata',
          method: 'post',
          data: _data
        }).then((res) => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.visible = false
              this.$emit('close', true)
            }
          })
        })
      } else {
        request({
          url: '/api/system/Base_appdata/' + this.dataForm.id,
          method: 'PUT',
          data: _data
        }).then((res) => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.visible = false
              this.$emit('close', true)
            }
          })
        })
      }
    },
    openSelectDialog(key) {
      this.currTableConf = this.addTableConf[key]
      this.currVmodel = key
      this.selectDialogVisible = true
      this.$nextTick(() => {
        this.$refs.selectDialog.init()
      })
    },
    addForSelect(data) {
      for (let i = 0; i < data.length; i++) {
        let item = { ...this.tableRows[this.currVmodel], ...data[i] }
        this.dataForm[this.currVmodel].push(item)
      }
    },
    dataList() {
      var _data = JSON.parse(JSON.stringify(this.dataForm));

      _data.description = JSON.stringify(_data.description)

      _data.tenantid = JSON.stringify(_data.tenantid)

      return _data;
    },
    dataInfo(dataAll) {
      let _dataAll = dataAll
      _dataAll.description = JSON.parse(_dataAll.description)
      _dataAll.tenantid = JSON.parse(_dataAll.tenantid)
      this.dataForm = _dataAll
    },
  },
}

</script>
<style lang="scss" scoped>
.padbox {
  padding: 48px 24px;
}
</style>
