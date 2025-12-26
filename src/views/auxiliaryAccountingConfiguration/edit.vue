<template>
  <el-dialog
    :title="!dataForm.id ? '新增辅助核算' :'编辑辅助核算'"
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
              label="辅助核算编码"
              prop="code"
            >
              <el-input
                v-model="dataForm.code"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="辅助核算名称"
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
            <el-form-item label="配置方式" prop="sourceType">
              <el-select v-model="dataForm.sourceType" clearable placeholder="请选择">
                <el-option label="动态表单" :value="1"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="配置内容" prop="dynamicFormId">
              <el-select v-model="dataForm.dynamicFormId" clearable placeholder="请选择">
                <el-option v-for="item in dynamicFormOption" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
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
import { finAssistAccountingSave, finAssistAccountingEdit, getDynamicTableList } from "@/api/business/auxiliaryAccountingConfiguration";
export default {
  components: {},
  props: [],
  data() {
    return {
      visible: false,
      loading: false,
      btnLoading: false,
      dynamicFormOption: [],
      dataForm: {
        name: "",
        code: "",
        dynamicFormId: "",
        financialChannelCode: "YouBIP",
        sourceType: 1
      },
      rules:
              {
                name: [
                  {
                    required: true,
                    message: '请输入',
                    trigger: 'blur'
                  },
                ],
                code: [
                  {
                    required: true,
                    message: '请输入',
                    trigger: 'blur'
                  },
                ],
                dynamicFormId: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'blur'
                  },
                ],
                sourceType: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'blur'
                  },
                ],
              },
    }
  },
  computed: {},
  watch: {},
  created() {
    // 获取付款项目选项
    getDynamicTableList().then(res => {
      this.dynamicFormOption = res.data.map(v => ({ label: v.name, value: v.id }));
    });
  },
  mounted() {},
  methods: {
    init(id, row) {
      this.dataForm.id = id || "";
      this.visible = true;
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields();
        if (this.dataForm.id) {
          this.loading = true
          // 从列表获取数据并赋值给表单---回显
          Object.keys(this.dataForm).forEach(key => {
            if (row[key]) {
              this.dataForm[key] = row[key];
            }
          });
          this.loading = false;
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['elForm'].validate((valid) => {
        if (valid) {
          const method = this.dataForm.id ? finAssistAccountingEdit : finAssistAccountingSave;
          method(this.dataForm).then(() => {
            this.$message.success(this.dataForm.id ? "编辑成功" : "新增成功");
            this.visible = false;
            this.$emit("refresh");
          });
        }
      })
    },
  },
}

</script>

