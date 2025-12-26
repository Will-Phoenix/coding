<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main org-form">
      <div class="JNPF-common-page-header">
        <el-page-header
          @back="goBack"
          :content="!dataForm.id ? $t(`Organize.addCompany`) : $t(`Organize.editCompany`)"
        />
        <div class="options">
          <el-button type="primary" :loading="btnLoading" @click="handleConfirm()">
            {{ $t('common.confirmButton') }}</el-button>
          <el-button @click="goBack">{{ $t('common.cancelButton') }}</el-button>
        </div>
      </div>
      <div class="main" v-loading="formLoading">
        <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px">
          <div class="JNPF-common-title mb-20">
            <h2 class="bold">基础信息</h2>
          </div>
          <el-row :gutter="20" class="custom-row">
            <el-col :sm="12" :xs="24">
              <el-form-item label="上级公司" prop="parentId">
                <ComSelect
                  v-model="organizeIdTree"
                  placeholder="选择上级公司"
                  auth
                  is-only-org
                  @change="onOrganizeChange"
                  :curr-org-id="dataForm.id||'0'"
                  :parent-id="parentId||'0'"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司名称" prop="fullName">
                <el-input v-model="dataForm.fullName" placeholder="输入名称" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司LOGO" prop="logoFid">
                <el-upload
                  :action="actionUrl"
                  :headers="uploadHeaders"
                  list-type="picture-card"
                  :limit="1"
                  :on-exceed="handleExceed"
                  :on-success="handleSuccess"
                  :on-remove="handleRemove"
                  :file-list="fileList"
                >
                  <i class="el-icon-plus" />
                </el-upload>
                <!--                <JNPF-UploadImg-->
                <!--                  v-model="dataForm.logo"-->
                <!--                  :file-size="10"-->
                <!--                  size-unit="MB"-->
                <!--                  :limit="1"-->
                <!--                />-->
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司编码" prop="enCode">
                <el-input v-model="dataForm.enCode" placeholder="输入公司编码" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司简称" prop="propertyJson.shortName">
                <el-input v-model="dataForm.propertyJson.shortName" placeholder="输入公司简称" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司性质" prop="propertyJson.enterpriseNature">
                <JNPF-TreeSelect
                  v-model="dataForm.propertyJson.enterpriseNature"
                  :options="natureData"
                  :props="{value: 'enCode', label: 'fullName'}"
                  placeholder="请选择公司性质"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="所属行业" prop="propertyJson.industry">
                <JNPF-TreeSelect
                  v-model="dataForm.propertyJson.industry"
                  :options="industryData"
                  placeholder="请选择所属行业"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="成立时间" prop="propertyJson.foundedTime">
                <el-date-picker
                  v-model="dataForm.propertyJson.foundedTime"
                  type="date"
                  value-format="timestamp"
                  placeholder="选择日期"
                  :picker-options="pickerOptions"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司电话" prop="propertyJson.telePhone">
                <el-input v-model="dataForm.propertyJson.telePhone" placeholder="输入公司电话" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司传真" prop="propertyJson.fax">
                <el-input v-model="dataForm.propertyJson.fax" placeholder="输入公司传真" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司主页" prop="propertyJson.webSite">
                <el-input v-model="dataForm.propertyJson.webSite" placeholder="输入公司主页" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="所在城市" prop="areaIdChain">
                <JNPF-Address
                  v-model="dataForm.areaIdChain"
                  placeholder="请选择"
                  clearable
                  :level="1"
                  @change="addressChange(arguments)"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="6" :xs="24">
              <el-form-item label-width="210px" label="是否允许拍照上传发票和资料" prop="isPhotographUpload">
                <el-select
                  v-model="dataForm.isPhotographUpload"
                  placeholder="请选择"
                  style="width: 100px"
                >
                  <el-option :key="1" label="否" :value="0" />
                  <el-option :key="2" label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="6" :xs="24">
              <el-form-item label-width="200px" label="是否允许用户查看付款状态" prop="allowPayStatus">
                <el-select
                  v-model="dataForm.allowPayStatus"
                  placeholder="请选择"
                  style="width: 100px"
                >
                  <el-option :key="1" label="否" :value="0" />
                  <el-option :key="2" label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label-width="148px" label="AI对话免登窗口地址" prop="propertyJson.gptShareUrl">
                <el-input v-model="dataForm.propertyJson.gptShareUrl" placeholder="取值示例 https://fastgpt.smxzhcs.cn/chat/share?shareId=..." />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label-width="148px" label="AI管家对话地址" prop="propertyJson.assistantChatUrl">
                <el-input v-model="dataForm.propertyJson.assistantChatUrl" placeholder="取值示例 /agent-city-web/cicada/assistant?hasConsole=true" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="公司地址" prop="propertyJson.address">
                <el-input v-model="dataForm.propertyJson.address" placeholder="输入公司地址" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="排序" prop="sortCode">
                <el-input-number
                  :min="0"
                  :max="999999"
                  v-model="dataForm.sortCode"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
            <el-col :sm="6" :xs="24">
              <el-form-item label-width="200px" label="企业是否需要打印次数水印" prop="printShow">
                <el-select
                  v-model="dataForm.propertyJson.printShow"
                  placeholder="请选择"
                  style="width: 100px"
                >
                  <el-option :key="1" label="否" :value="0" />
                  <el-option :key="2" label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="6" :xs="24">
              <el-form-item label-width="200px" label="企业是否需要发票查验功能" prop="billCheck">
                <el-select
                  v-model="dataForm.billCheck"
                  placeholder="请选择"
                  style="width: 100px"
                >
                  <el-option :key="1" label="否" :value="0" />
                  <el-option :key="2" label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :sm="6" :xs="24">
              <el-form-item label-width="200px" label="已付款单据不允许打印" prop="propertyJson.printFlag">
                <el-select
                  v-model="dataForm.propertyJson.printFlag"
                  placeholder="请选择"
                  style="width: 100px"
                >
                  <el-option :key="1" label="否" :value="0" />
                  <el-option :key="2" label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="说明" prop="description">
                <el-input v-model="dataForm.description" type="textarea" :rows="3" />
              </el-form-item>
            </el-col>
          </el-row>
          <div class="JNPF-common-title mb-20">
            <h2 class="bold">经营信息</h2>
          </div>
          <el-row :gutter="20" class="custom-row">
            <el-col :sm="12" :xs="24">
              <el-form-item label="公司法人" prop="propertyJson.managerName">
                <el-input v-model="dataForm.propertyJson.managerName" placeholder="输入公司法人" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="联系电话" prop="propertyJson.managerTelePhone">
                <el-input v-model="dataForm.propertyJson.managerTelePhone" placeholder="输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="联系手机" prop="propertyJson.managerMobilePhone">
                <el-input v-model="dataForm.propertyJson.managerMobilePhone" placeholder="输入联系手机" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="联系邮箱" prop="propertyJson.manageEmail">
                <el-input v-model="dataForm.propertyJson.manageEmail" placeholder="输入联系邮箱" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="开户银行" prop="propertyJson.bankName">
                <el-input v-model="dataForm.propertyJson.bankName" placeholder="输入开户银行" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="银行账户" prop="propertyJson.bankAccount">
                <el-input v-model="dataForm.propertyJson.bankAccount" placeholder="输入银行账户" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label="企业税号" prop="propertyJson.tin">
                <el-input v-model="dataForm.propertyJson.tin" placeholder="输入企业税号" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="经营范围" prop="propertyJson.businessscope">
                <el-input v-model="dataForm.propertyJson.businessscope" type="textarea" :rows="3" />
              </el-form-item>
            </el-col>
          </el-row>
          <div class="JNPF-common-title mb-20">
            <h2 class="bold">预算一体化对接信息</h2>
          </div>
          <el-row :gutter="20" class="custom-row">
            <el-col :sm="12" :xs="24">
              <el-form-item label-width="200px" label="MOF_DIV_CODE区划" prop="propertyJson.administrativeDivision">
                <el-input v-model="dataForm.propertyJson.administrativeDivision" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label-width="200px" label="AGENCY_CODE单位" prop="propertyJson.unitCode">
                <el-input v-model="dataForm.propertyJson.unitCode" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <el-col :sm="12" :xs="24">
              <el-form-item label-width="200px" label="AGENCY_NAME单位name" prop="propertyJson.unitName">
                <el-input v-model="dataForm.propertyJson.unitName" placeholder="请输入" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
  </transition>
</template>

<script>
import { createOrganize, updateOrganize, getOrganizeInfo } from '@/api/permission/organize'
import { downloadFile } from "@/api/business/signature";

export default {
  data() {
    return {
      visible: false,
      btnLoading: false,
      formLoading: false,
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      fileList: [],
      dataForm: {
        id: '',
        parentId: '',
        fullName: '',
        enCode: '',
        enabledMark: 1,
        sortCode: 0,
        description: '',
        logoFid: "", // 公司logo
        isPhotographUpload: 0, // 是否支持发票拍照上传，0：不支持，1：支持 默认0
        areaIdChain: [], // 公司所在城市全层级
        allowPayStatus: 0,
        billCheck: 0, // 发票是否需要查验功能
        propertyJson: {
          shortName: '',
          enterpriseNature: '',
          industry: '',
          foundedTime: '',
          telePhone: '',
          fax: '',
          webSite: '',
          address: '',
          managerName: '',
          managerTelePhone: '',
          managerMobilePhone: '',
          manageEmail: '',
          bankName: '',
          bankAccount: '',
          businessscope: '',
          tin: "", // 企业税号
          cityCode: "", // 公司所在城市id
          areaIdChain: "", // 公司所在城市全层级
          cityName: "", // 公司所在城市,
          gptShareUrl: '',
          assistantChatUrl: '',
          allowPayStatus: 0,
          printFlag: 0, // 已付款申请单不允许打印
          printShow: 0, // 企业是否需要打印次数水印
          administrativeDivision: '', // 预算一体化-行政区划
          unitCode: '', // 预算一体化-单位code
          unitName: '', // 预算一体化-单位名称
        }
      },
      parentId: '',
      organizeIdTree: [],
      natureData: [],
      industryData: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      dataRule: {
        parentId: [
          { required: true, message: '上级公司不能为空', trigger: 'change' }
        ],
        fullName: [
          { required: true, message: '请输入公司名称', trigger: 'blur' }
        ],
        isPhotographUpload: [
          { required: true, message: '请选择是否支持发票拍照上传', trigger: 'blur' }
        ],
        allowPayStatus: [
          { required: true, message: '请选择是否允许用户查看付款状态', trigger: 'blur' }
        ],
        billCheck: [
          { required: true, message: '请选择是否需要发票查验功能', trigger: 'blur' }
        ],
        enCode: [
          { required: true, message: '请输入公司编码', trigger: 'blur' },
          { validator: this.formValidate('enCode', '公司编码只能输入英文、数字和小数点且小数点不能放在首尾'), trigger: 'blur' },
          { max: 50, message: '公司编码最多为50个字符！', trigger: 'blur' }
        ],
        areaIdChain: [
          { required: true, message: '请选择所在城市', trigger: 'blur' }
        ],
      }
    }
  },
  methods: {
    init(id, parentId) {
      this.visible = true
      this.dataForm.id = id || ''
      this.parentId = parentId || ''
      this.organizeIdTree = []
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields();
        // 获取公司性质
        this.$store.dispatch('base/getDictionaryData', { sort: 'EnterpriseNature' }).then(res => {
          this.natureData = res
        })
        // 获取所属行业
        this.$store.dispatch('base/getDictionaryData', { sort: 'IndustryType' }).then(res => {
          this.industryData = res
        })
        if (this.dataForm.id) {
          this.formLoading = true
          getOrganizeInfo(this.dataForm.id).then(res => {
            const propertyJson = res.data.propertyJson ? JSON.parse(res.data.propertyJson) : {}
            // 默认为0
            if (res.data.isPhotographUpload * 1 !== 1) {
              res.data.isPhotographUpload = 0
            }
            if (propertyJson.allowPayStatus !== 1) {
              propertyJson.allowPayStatus = 0
            }
            if (propertyJson.billCheck !== 1) {
              propertyJson.billCheck = 0
            }
            if (propertyJson.printFlag !== 1) {
              propertyJson.printFlag = 0
            }
            if (propertyJson.printShow !== 1) {
              propertyJson.printShow = 0
            }
            res.data.allowPayStatus = propertyJson.allowPayStatus
            res.data.billCheck = propertyJson.billCheck
            this.dataForm = res.data
            this.organizeIdTree = res.data.organizeIdTree || []
            this.dataForm.propertyJson = propertyJson
            if (propertyJson.areaIdChain) {
              this.dataForm.areaIdChain = propertyJson.areaIdChain
            }
            // 处理一下公司LOGO，由于返回的是文件id，需要下载拼装后，回显
            if (this.dataForm.logoFid) {
              downloadFile(this.dataForm.logoFid).then(res => {
                this.fileList = [{ url: res.data.url }];
              });
            }
            this.formLoading = false
          }).catch(() => { this.formLoading = false })
        }
      })
    },
    goBack() {
      this.$emit('close')
    },
    onOrganizeChange(val) {
      if (!val || !val.length) return this.dataForm.parentId = ''
      this.dataForm.parentId = val[val.length - 1]
    },
    // 上传文件超过限定数量校验
    handleExceed() {
      this.$message({
        type: "error",
        message: "超过上传数量",
      });
    },
    // 监听address组件，获取节点信息
    addressChange(data) {
      // 获取到信息，直接给cityName赋值
      this.dataForm.propertyJson.cityName = data[1][data[1].length - 1].fullName;
    },
    handleSuccess(response, file, fileList) {
      this.dataForm.logoFid = response.data.id;
    },
    handleRemove() {
      if (this.dataForm.logoFid) {
        this.dataForm.logoFid = "";
      }
    },
    handleConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          const formMethod = this.dataForm.id ? updateOrganize : createOrganize
          let dataForm = { ...this.dataForm };
          // 处理一下地区字段
          if (this.dataForm.areaIdChain) {
            dataForm.propertyJson.areaIdChain = this.dataForm.areaIdChain
            dataForm.propertyJson.cityCode = this.dataForm.areaIdChain[this.dataForm.areaIdChain.length - 1];
          }
          delete dataForm.areaIdChain;
          // 处理一下是否允许查看付款状态字段
          dataForm.propertyJson.allowPayStatus = this.dataForm.allowPayStatus
          dataForm.propertyJson.billCheck = this.dataForm.billCheck
          delete dataForm.allowPayStatus;
          delete dataForm.billCheck;
          formMethod(dataForm).then(res => {
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
    },
  }
}
</script>
<style lang="scss" scoped>
.main {
  padding: 10px 30px 0;
}
</style>
