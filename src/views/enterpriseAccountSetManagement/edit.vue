<template>
  <el-dialog
    :title="!dataForm.id ? '新增账套' :'编辑账套'"
    :close-on-click-modal="false"
    append-to-body
    :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="165px" label-position="right">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="账套名称"
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
              label="H6账套识别ID"
              prop="tppSobId"
            >
              <el-input
                v-model="dataForm.tppSobId"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="账套税号"
              prop="taxNum"
            >
              <el-input
                v-model="dataForm.taxNum"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="账套统一社会信用代码"
              prop="registerNum"
            >
              <el-input
                v-model="dataForm.registerNum"
                placeholder="请输入"
                :maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="是否自动拉取税局发票"
              prop="pullStatus"
            >
              <el-select v-model="dataForm.pullStatus" placeholder="请选择">
                <el-option label="否" :value="0" />
                <el-option label="是" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="排序"
              prop="sortNum"
            >
              <el-input-number style="width: 100%" v-model="dataForm.sortNum" controls-position="right" :min="0" :max="999999"></el-input-number>
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
import { ccdEntSobCreate, ccdEntSobUpdate } from "@/api/business/enterpriseAccountSetManagement";
export default {
  components: {},
  props: [],
  data() {
    const validator = (rule, value, callback) => {
      if (this.dataForm.pullStatus === 1 && !value) {
        callback(new Error('请输入账套统一社会信用代码'));
      } else {
        callback();
      }
    };
    return {
      visible: false,
      loading: false,
      btnLoading: false,
      dataForm: {
        name: "",
        tppSobId: "",
        taxNum: "",
        registerNum: "",
        tppCode: "h6",
        status: 0,
        pullStatus: 0,
        sortNum: ""
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
                registerNum: [
                  { validator: validator, trigger: 'blur' }
                ],
                /* tppSobId: [
                  {
                    required: true,
                    message: '请输入',
                    trigger: 'blur'
                  },
                ],
                taxNum: [
                  {
                    required: true,
                    message: '请输入',
                    trigger: 'blur'
                  },
                ],
               */
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
          const saveOrUpdate = this.dataForm.id ? ccdEntSobUpdate : ccdEntSobCreate
          saveOrUpdate(this.dataForm).then(() => {
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

