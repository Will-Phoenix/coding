<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" label-width="110px" :rules="rules">
      <div class="row-flex">
        <el-col :span="8">
          <el-form-item label="年度" prop="budgetYear">
            <el-date-picker
              v-model="formData.budgetYear"
              type="year"
              value-format="yyyy"
              placeholder="选择年度"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </div>
      <div class="mr-b-10">
        <h4>基本信息</h4>
        <el-divider />
        <div class="row-flex">
          <el-col :span="8">
            <el-form-item label="付款类型" prop="payType">
              <el-select v-model="formData.payType" clearable placeholder="请选择">
                <el-option v-for="item in payTypeOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="付款项目" prop="projectId">
              <el-select v-model="formData.projectId" clearable placeholder="请选择" @change="changeProjectId">
                <el-option v-for="item in projectOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="formData.payType === 1">
            <el-form-item label="刷卡日期" prop="payTime">
              <el-date-picker
                v-model="formData.payTime"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="政府经济分类" prop="govClassificationId">
              <el-select v-model="formData.govClassificationId" clearable placeholder="请选择">
                <el-option v-for="item in govClassificationOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </div>
      </div>
      <div class="mr-b-10">
        <h4>支付信息</h4>
        <el-divider />
        <div class="row-flex">
          <el-col :span="8">
            <el-form-item label="支付信息" prop="payInfo">
              <el-cascader
                v-model="formData.payInfo"
                :options="paymentInfoOption"
                :props="cascaderProps"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请金额" prop="amount">
              <el-input v-model="formData.amount" placeholder="请输入" type="number" maxlength="10" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="部门经济分类" prop="classificationId">
              <el-select v-model="formData.classificationId" clearable placeholder="请选择">
                <el-option v-for="item in classificationOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="用途" prop="useFor">
              <el-input v-model="formData.useFor" placeholder="请输入" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="手动选择部门经济分类" prop="manualDeptTypeCode" label-width="192px">
              <el-select v-model="formData.manualDeptTypeCode" clearable placeholder="请选择">
                <el-option v-for="item in manualDeptTypeCodeOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </div>
      </div>
      <div class="mr-b-10">
        <h4>收款人信息</h4>
        <el-divider />
        <div class="row-flex">
          <el-col :span="8">
            <el-form-item label="收款人" prop="payee">
              <el-input v-model="formData.payee" placeholder="请输入" maxlength="10" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="收款人账号" prop="payeeAccount">
              <el-input v-model="formData.payeeAccount" placeholder="请输入" maxlength="20" @change="changePayeeAccount" />
            </el-form-item>
          </el-col>
          <el-col :span="8" v-if="formData.payType !== 1">
            <el-form-item label="收款人开户行" prop="payeeBank">
              <el-input v-model="formData.payeeBank" placeholder="请输入" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="资金往来对象" prop="financialObjects">
              <el-cascader
                v-model="formData.financialObjects"
                :options="financialObjectsOption"
                :props="cascaderProps"
              />
            </el-form-item>
          </el-col>
        </div>
      </div>
      <div class="mr-b-10">
        <h4>其他信息</h4>
        <el-divider />
        <div class="row-flex">
          <el-col :span="8">
            <el-form-item label="是否涉密" prop="classified">
              <el-select v-model="formData.classified" clearable placeholder="请选择">
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </div>
        <div class="row-flex">
          <el-col :span="12">
            <el-form-item label="附件" prop="fids">
              <el-upload
                :action="actionUrl"
                :headers="uploadHeaders"
                :file-list="formData.fidsList"
                :on-success="handleSuccess"
                :on-remove="handleRemove"
              >
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </div>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="buttonLoading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getBudgetList, getSubjectClassificationList } from "@/api/business/budgetItems";
import { getBankName, savePayInfo, updatePayInfo } from "@/api/business/paymentInfo";
import { getDicts } from "@/api/common";
import { downloadFile } from "@/api/business/signature";

export default {
  name: 'editPayment',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: Object,
      default: () => ({})
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      formData: {
        payeeBank: ""
      },
      buttonLoading: false,
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      payTypeOption: [
        { label: "公务卡", value: 1 },
        { label: "单位零余额支付", value: 2 },
      ],
      cascaderProps: { expandTrigger: 'hover', label: 'fullName', value: 'id' },
      projectOption: [],
      paymentInfoOption: [],
      classificationOption: [],
      financialObjectsOption: [],
      govClassificationOption: [],
      manualDeptTypeCodeOption: [],
      rules: {
        payType: [{ required: true, message: '请选择', trigger: 'change' }],
        projectId: [{ required: true, message: '请选择', trigger: 'change' }],
        payTime: [{ required: true, message: '请选择', trigger: 'change' }],
        govClassificationId: [{ required: true, message: '请选择', trigger: 'change' }],
        payInfo: [{ required: true, message: '请选择', trigger: 'change' }],
        amount: [{ required: true, message: '请输入', trigger: 'blur' }],
        classificationId: [{ required: true, message: '请选择', trigger: 'change' }],
        useFor: [{ required: true, message: '请输入', trigger: 'blur' }],
        payee: [{ required: true, message: '请输入', trigger: 'blur' }],
        payeeAccount: [{ required: true, message: '请输入', trigger: 'blur' }],
        payeeBank: [{ required: true, message: '请输入', trigger: 'blur' }],
        financialObjects: [{ required: true, message: '请选择', trigger: 'change' }],
        classified: [{ required: true, message: '请选择', trigger: 'change' }],
        budgetYear: [{ required: true, message: '请选择', trigger: 'change' }],
        manualDeptTypeCode: [{ required: true, message: '请选择', trigger: 'change' }],
      },
    }
  },
  computed: {
    title() {
      return this.data.id ? "编辑录入信息" : "新增录入信息";
    },
  },
  watch: {
    async visible(n) {
      if (n) {
        if (this.data.id) {
          // 如果有项目id，则加载对应项目下的部门经济分类
          if (this.data.projectId) {
            getSubjectClassificationList({ budgetId: this.data.projectId, budgetType: 2 }).then(res => {
              this.classificationOption = res.data.map(v => ({ label: v.classificName, value: v.id }));
            });
            getSubjectClassificationList({ budgetId: this.data.projectId, budgetType: 1 }).then(res => {
              this.govClassificationOption = res.data.map(v => ({ label: v.classificName, value: v.id }));
            });
          }
          // 如果有文件，调整数据格式，回显一下文件
          let fidsList = [];
          if (this.data.fids) {
            for (const v of this.data.fids.split(",")) {
              await downloadFile(v).then(res => {
                fidsList.push({ name: res.data.name, url: res.data.url, response: { data: { id: v }}});
              });
            }
          }
          this.formData = { ...this.data, fidsList };
          // 把两个级联组件，数据恢复
          if (this.formData.payInfo) {
            this.formData.payInfo = this.formData.payInfo.split(",");
          }
          if (this.formData.financialObjects) {
            this.formData.financialObjects = this.formData.financialObjects.split(",");
          }
          // 如果有银行卡号，则要主动查一下对应银行，并塞入对应字段
          /* if (this.formData.payeeAccount) {
            this.changePayeeAccount(this.formData.payeeAccount);
          } */
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      } else {
        this.formData = { payeeBank: "" };
        this.classificationOption = [];
        this.govClassificationOption = [];
      }
    }
  },
  created() {
    // 获取付款项目选项
    getBudgetList().then(res => {
      this.projectOption = res.data.map(v => ({ label: v.budgetName, value: v.id }));
    });
    // 获取所有项目对应的部门经济分类
    getSubjectClassificationList({ budgetType: 2 }).then(res => {
      this.manualDeptTypeCodeOption = res.data.map(v => ({ label: v.classificName, value: v.id }));
    });
    // 获取支付信息选项
    getDicts('payType').then(res => {
      this.paymentInfoOption = res.data.list;
    });
    // 获取往来资金对象选项
    getDicts('fundIntercourseObject').then(res => {
      this.financialObjectsOption = res.data.list;
    });
  },
  methods: {
    onConfirm() {
      if (this.buttonLoading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          try {
            const method = this.data.id ? updatePayInfo : savePayInfo;
            const form = {
              ...this.formData,
              payInfo: this.formData.payInfo.join(","),
              financialObjects: this.formData.financialObjects.join(","),
            };
            method(form).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } finally {
            this.buttonLoading = false;
          }
        }
      })
    },
    updateVisible(val) {
      this.$refs.form.resetFields();
      this.$emit('update:visible', val)
    },
    changeProjectId(value) {
      // 只要项目id变了，先清空对应变化的二个字段值，和选项框
      this.$set(this.formData, "classificationId", "");
      this.$set(this.formData, "govClassificationId", "");
      this.classificationOption = [];
      this.govClassificationOption = [];
      // 如果有值，则重新获取下拉列表
      if (value) {
        getSubjectClassificationList({ budgetId: value, budgetType: 2 }).then(res => {
          this.classificationOption = res.data.map(v => ({ label: v.classificName, value: v.id }));
        });
        getSubjectClassificationList({ budgetId: value, budgetType: 1 }).then(res => {
          this.govClassificationOption = res.data.map(v => ({ label: v.classificName, value: v.id }));
        });
      }
    },
    changePayeeAccount(value) {
      if (value) {
        getBankName(value).then(res => {
          this.formData.payeeBank = res.msg || "";
        });
      }
    },
    handleSuccess(response, file, fileList) {
      console.log("fileList", fileList);
      this.formData.fids = fileList.map(v => v.response.data.id).join(",");
    },
    handleRemove(file, fileList) {
      this.formData.fids = fileList.map(v => v.response.data.id).join(",");
    },
  }
}
</script>
<style lang="scss" scoped>
  .mr-b-10 {
    margin-bottom: 20px;
  }
  .row-flex {
    display: flex;
    flex-wrap: wrap;
  }
</style>
