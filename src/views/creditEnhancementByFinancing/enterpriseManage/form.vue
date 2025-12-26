<template>
  <el-dialog
    :title="!dataForm.id ? '新增企业' :'编辑企业'"
    :close-on-click-modal="false"
    append-to-body
    :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="120px" label-position="right">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="企业名称"
              prop="entName"
            >
              <el-input
                v-model="dataForm.entName"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="企业税号"
              prop="tax"
            >
              <el-input
                v-model="dataForm.tax"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="企业法定代表人"
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
export default {
  components: {},
  props: [],
  data() {
    return {
      visible: false,
      loading: false,
      btnLoading: false,
      dataForm: {
        entName: "",
        tax: "",
        name: ""
      },
      rules:
          {
            entName: [
              {
                required: true,
                message: '请输入',
                trigger: 'blur'
              },
            ],
            tax: [
              {
                required: true,
                message: '请输入',
                trigger: 'blur'
              },
            ]
          },
    }
  },
  methods: {
    init() {
      this.visible = true;
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields();
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['elForm'].validate((valid) => {
        if (valid) {
          this.$message.success("新增成功");
          this.visible = false;
          this.$emit("refresh");
        }
      })
    },
  },
}

</script>

