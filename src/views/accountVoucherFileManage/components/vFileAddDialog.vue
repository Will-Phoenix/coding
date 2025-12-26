<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    append-to-body
    :visible="visible"
    @update:visible="updateVisible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="135px" label-position="right">
        <el-col :span="24">
          <el-form-item
            label="选择起止月份"
            prop="startEndTime"
          >
            <el-date-picker
              v-model="dataForm.startEndTime"
              type="monthrange"
              range-separator="-"
              start-placeholder="开始月份"
              end-placeholder="截止月份"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="上传文件"
            prop="fid"
          >
            <el-upload
              :action="actionUrl"
              :headers="uploadHeaders"
              :limit="1"
              :on-exceed="handleExceed"
              :file-list="dataForm.signSealAuthList"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              accept=".rar,.zip,.xml,.dbf,.xlsx"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip">请上传 rar/zip/xml/dbf/xlsx 文件</div>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)"> 取 消</el-button>
      <el-button type="primary" @click="dataFormSubmit" :loading="loading"> 确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'VFileAddDialog',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 提交按钮的loading状态
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      default: '新增记账凭证文件'
    }
  },
  data() {
    return {
      btnLoading: false,
      dataForm: {
        fid: "",
        startEndTime: undefined,
      },
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      rules: {
        startEndTime: [
          {
            required: true,
            type: "array",
            message: '请选择',
            trigger: 'change'
          },
        ],
        fid: [
          {
            required: true,
            message: '请上传',
            trigger: 'change'
          },
        ],
      },
    }
  },
  watch: {
    visible(n) {
      if (n) {
      } else {
        this.dataForm.fid = "";
        this.dataForm.startEndTime = undefined;
        this.dataForm.signSealAuthList = [];
        this.$refs.elForm.clearValidate();
      }
    }
  },
  methods: {
    dataFormSubmit() {
      this.$refs.elForm.validate((valid) => {
        if (valid) {
          const data = {
            fid: this.dataForm.fid,
            startTime: dayjs(this.dataForm.startEndTime[0]).format("YYYYMM"),
            endTime: dayjs(this.dataForm.startEndTime[1]).format("YYYYMM"),
          }
          console.log('--confirm--', JSON.stringify(data))
          this.$emit("confirm", data);
          this.updateVisible(false);
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
      this.$refs.elForm.resetFields();
    },
    handleRemove() {
      if (this.dataForm.signSealImgFid) {
        this.dataForm.fid = "";
      }
    },
    handleSuccess(response, file, fileList) {
      this.dataForm.fid = response.data.id;
      this.$refs.elForm.validateField(["fid"])
    },
    // 上传文件超过限定数量校验
    handleExceed() {
      this.$message({
        type: "error",
        message: "超过上传数量",
      });
    },
  }
}
</script>
<style lang="scss" scoped>

</style>
