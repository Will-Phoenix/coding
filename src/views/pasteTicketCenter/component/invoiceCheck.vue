<template>
  <el-dialog
    title="定额发票系统查验"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="600px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="150px">
      <el-form-item label="发票代码" prop="fpdm">
        <el-input v-model="formData.fpdm" placeholder="请输入" clearable maxlength="30" disabled />
      </el-form-item>
      <el-form-item label="发票号码" prop="fphm">
        <el-input v-model="formData.fphm" placeholder="请输入" clearable maxlength="30" disabled />
      </el-form-item>
      <el-form-item v-if="showManual" label="发票开具省" prop="payChannel">
        <el-select v-model="formData.payChannel" clearable placeholder="请选择" @change="payChannelChange">
          <el-option v-for="item in payChannelOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!--      <el-form-item v-if="showCodeBox" label="收款方纳税识别号" prop="nsrsbh">-->
      <!--        <el-input v-model="formData.nsrsbh" placeholder="请输入" clearable maxlength="30" />-->
      <!--      </el-form-item>-->
      <el-form-item v-if="showCodeBox" label="验证码" prop="code">
        <div class="code">
          <el-input class="box" v-model="formData.code" placeholder="请输入验证码" clearable maxlength="30" />
          <el-image :src="codeImgSrc" class="img" alt="" @click="reload" />
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="buttonLoading" @click="onConfirm">{{ showCodeBox ? "开始查验" : "人工查验通过" }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { sspCheck, getPictureCode, getInvoiceDetail, checkToSuccess } from "@/api/business/pasteTicket";

export default {
  name: 'invoiceCheckDialog',
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
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
    showManual: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      formData: {
        fpdm: "",
        fphm: "",
        payChannel: "",
        code: "",
      },
      rules: {
        payChannel: [{ required: true, message: '请选择' }],
        code: [{ required: true, message: '请输入', trigger: 'click' }],
      },
      payChannelOption: [
        { label: "河南省", value: "河南省" },
        { label: "其他", value: "其他" }
      ],
      codeImgSrc: "", // 验证码图片
      buttonLoading: false,
      codeId: ""
    }
  },
  computed: {
    showCodeBox() {
      return this.formData.payChannel === '河南省';
    },
  },
  watch: {
    visible(n) {
      if (n) {
        this.reload();
        this.init();
        if (!this.showManual) {
          this.formData.payChannel = '河南省';
        } else {
          this.formData.payChannel = ''
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate());
      }
    }
  },
  methods: {
    init() {
      getInvoiceDetail(this.data.id).then(res => {
        this.formData.fpdm = res.data.object.code;
        this.formData.fphm = res.data.object.number;
      });
    },
    reload() {
      getPictureCode({ billId: this.data.id }).then(res => {
        let data = res.data;
        this.codeImgSrc = data.rcodeBase64;
        this.formData.code = data.code;
        this.codeId = data.id;
      });
    },
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          try {
            if (this.formData.payChannel === "河南省") {
              sspCheck([{ ...this.formData, billId: this.data.id, billIdList: [this.data.id], id: this.codeId }]).then(res => {
                if (res.code == 200) {
                  this.$message.success("查验成功");
                  this.$emit('confirm');
                  this.updateVisible(false);
                } else {
                  this.$message.error(res.msg);
                  this.reload();
                }
              });
            } else {
              checkToSuccess(this.data.id).then(() => {
                this.$message.success("人工查验通过");
                this.$emit('confirm');
                this.updateVisible(false);
              });
            }
          } finally {
            this.buttonLoading = false;
          }
        }
      })
    },
    updateVisible(val) {
      this.$refs.form.resetFields();
      this.formData.code = "";
      this.$emit('update:visible', val)
    },
    payChannelChange(val) {
      if (val === "河南省") {
        this.reload();
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .code {
    display: flex;
    .img {
      margin-left: 10px;
      cursor: pointer;
    }
    .box {
    }
  }
</style>
