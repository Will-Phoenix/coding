<template>
  <el-dialog
    :title="!dataForm.id ? '新建' :'编辑'"
    :close-on-click-modal="false"
    append-to-body
    :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="135px" label-position="right">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="用印名称"
              prop="name"
            >
              <el-input
                v-model="dataForm.name"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="用印文件"
              prop="signSealImgFid"
            >
              <el-upload
                :action="actionUrl"
                :headers="uploadHeaders"
                :limit="1"
                :on-exceed="handleExceed"
                :file-list="dataForm.signSealImgList"
                :on-success="handleSuccess1"
                :on-remove="handleRemove1"
                accept=".jpg,.jpeg,.png"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip">只能上传jpg/png文件</div>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="用印线下签订文件"
              prop="signSealAuthFid"
            >
              <el-upload
                :action="actionUrl"
                :headers="uploadHeaders"
                :limit="1"
                :on-exceed="handleExceed"
                :file-list="dataForm.signSealAuthList"
                :on-success="handleSuccess2"
                :on-remove="handleRemove2"
                accept=".pdf,.jpg,.jpeg,.png"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip">只能上传pdf/jpg/png文件</div>
              </el-upload>
            </el-form-item>
          </el-col>
        </template>
      </el-form>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false"> 取 消</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading"> 确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { createCcdSignSeal, updateCcdSignSeal } from "@/api/business/signature";

export default {
  components: {},
  props: [],
  emits: ["refresh"],
  data() {
    return {
      visible: false,
      loading: false,
      btnLoading: false,
      dataForm: {
        name: "",
        signSealImgList: [], // 回显的文件列表
        signSealAuthList: [],
        signSealImgFid: "", // 文件id
        signSealAuthFid: "",
        signSealImgName: "", // 文件名
        signSealAuthName: "",
        signSealImgUrl: "", // 文件url
        signSealAuthUrl: "",

      },
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      rules:
              {
                name: [
                  {
                    required: true,
                    message: '请输入',
                    trigger: 'blur'
                  },
                ],
                signSealImgFid: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'change'
                  },
                ],
                signSealAuthFid: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'change'
                  },
                ],

              },
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {},
  methods: {
    clearData() {
      this.dataForm.signSealImgFid = "";
      this.dataForm.signSealAuthFid = "";
      this.dataForm.signSealImgName = "";
      this.dataForm.signSealAuthName = "";
      this.dataForm.signSealImgUrl = "";
      this.dataForm.signSealAuthUrl = "";
      this.dataForm.signSealImgList = [];
      this.dataForm.signSealAuthList = [];
    },
    init(id, row) {
      this.clearData();
      this.dataForm.id = id || "";
      this.visible = true;
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields();
        if (this.dataForm.id) {
          this.loading = true;
          // 从列表获取数据并赋值给表单---回显
          Object.keys(this.dataForm).forEach(key => {
            if (row[key]) {
              this.dataForm[key] = row[key];
            }
          });
          // 然后组装signSealAuthFid的数据结构，让文件可以回显
          this.dataForm.signSealImgList = [{ name: this.dataForm.signSealImgName, url: this.dataForm.signSealImgUrl }];
          this.dataForm.signSealAuthList = [{ name: this.dataForm.signSealAuthName, url: this.dataForm.signSealAuthUrl }];
          this.loading = false;
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      console.log("form表单", this.dataForm);
      this.$refs['elForm'].validate((valid) => {
        if (valid) {
          const method = this.dataForm.id ? updateCcdSignSeal : createCcdSignSeal;
          method({ ...this.dataForm, type: 2 }).then(res => {
            this.$message.success("操作成功");
            this.visible = false;
            this.$emit("refresh");
          });
        }
      })
    },
    // 上传文件超过限定数量校验
    handleExceed() {
      this.$message({
        type: "error",
        message: "超过上传数量",
      });
    },
    handleRemove1() {
      if (this.dataForm.signSealImgFid) {
        this.dataForm.signSealImgFid = "";
      }
    },
    handleRemove2() {
      if (this.dataForm.signSealAuthFid) {
        this.dataForm.signSealAuthFid = "";
      }
    },
    handleSuccess2(response, file, fileList) {
      this.dataForm.signSealAuthFid = response.data.id;
    },
    handleSuccess1(response, file, fileList) {
      this.dataForm.signSealImgFid = response.data.id;
    },
  },
}

</script>

