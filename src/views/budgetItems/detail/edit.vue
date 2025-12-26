<template>
  <el-dialog
    :title="dataForm.budgetType===1 ? '新增政府经济分类' :'新增部门经济分类'"
    :close-on-click-modal="false"
    append-to-body
    :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="140px" label-position="right">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="政府经济分类名称"
              prop="classificName"
              v-if="dataForm.budgetType===1"
            >
              <el-input
                v-model="dataForm.classificName"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="部门经济分类名称"
              prop="classificName"
              v-if="dataForm.budgetType===2"
            >
              <el-input
                v-model="dataForm.classificName"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="分类编码"
              prop="classificCode"
            >
              <el-input
                v-model="dataForm.classificCode"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
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
import { subjectClassificationSaveOrUpdate } from "@/api/business/budgetItems";

export default {
  components: {},
  props: [],
  data() {
    return {
      visible: false,
      loading: false,
      btnLoading: false,
      dataForm: {
        classificName: "",
        budgetId: "",
        classificCode: "",
        status: 0,
      },
      rules:
              {
                classificName: [
                  {
                    required: true,
                    message: '请输入',
                    trigger: 'blur'
                  },
                ],
                classificCode: [
                  {
                    required: true,
                    message: '请输入',
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
    init(id, row) {
      this.dataForm.id = id || "";
      this.visible = true;
      this.dataForm.budgetId = row.budgetId
      this.dataForm.budgetType = row.type
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
          subjectClassificationSaveOrUpdate(this.dataForm).then(() => {
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

