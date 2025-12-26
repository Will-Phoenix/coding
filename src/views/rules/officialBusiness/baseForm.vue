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
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="180px" label-position="left">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="岗位类型"
              prop="positionType"
            >
              <el-select
                v-model="dataForm.positionType"
                placeholder="请选择..."
              >
                <el-option
                  v-for="item in positionOption"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.enCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="住宿标准费（元）"
              prop="accommodationFee"
            >
              <el-input-number
                v-model="dataForm.accommodationFee"
                placeholder="请输入"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="伙食补助费（元）"
              prop="foodAllowance"
            >
              <el-input-number
                v-model="dataForm.foodAllowance"
                placeholder="请输入"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="公杂费（元）"
              prop="publicMiscellaneousFees"
            >
              <el-input-number
                v-model="dataForm.publicMiscellaneousFees"
                placeholder="请输入"
                :max="999999999"
                :step="1"
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
import { saveBaseRules, updateBaseRules } from "@/api/business/travelRules";

export default {
  components: {},
  props: [],
  emits: ["refresh"],
  data() {
    return {
      visible: false,
      loading: false,
      btnLoading: false,
      selectDialogVisible: false,
      currTableConf: {},
      addTableConf: {
      },
      tableRows: {
      },
      currVmodel: "",
      dataForm: {
        accommodationFee: undefined,
        positionType: "",
        foodAllowance: undefined,
        publicMiscellaneousFees: undefined,
        transportationOutAllowance: undefined,
      },
      rules:
      {
        positionType: [
          {
            required: true,
            message: '请选择',
            trigger: 'click'
          },
        ],
        accommodationFee: [
          {
            required: true,
            message: '请输入',
            trigger: ["blur", "change"]
          },
        ],
        foodAllowance: [
          {
            required: true,
            message: '请输入',
            trigger: ["blur", "change"]
          },
        ],
        publicMiscellaneousFees: [
          {
            required: true,
            message: '请输入',
            trigger: ["blur", "change"]
          },
        ],
        transportationOutAllowance: [
          {
            required: true,
            message: '请输入',
            trigger: ["blur", "change"]
          },
        ],
      },
      positionOption: []
    }
  },
  methods: {
    init(id, row) {
      this.dataForm.id = id || "";
      this.visible = true;
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields();
        // 获取岗位类型
        this.$store.dispatch('base/getDictionaryData', { sort: 'PositionType' }).then(res => {
          this.positionOption = res;
        });
        if (this.dataForm.id) {
          // 从列表获取数据并赋值给表单---回显
          Object.keys(this.dataForm).forEach(key => {
            this.dataForm[key] = row[key];
          });
        }
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['elForm'].validate((valid) => {
        if (valid) {
          const method = this.dataForm.id ? updateBaseRules : saveBaseRules;
          method(this.dataForm).then(() => {
            this.$message({
              type: "success",
              message: "操作成功",
              onClose: () => {
                this.visible = false;
                this.$emit("refresh");
              },
            });
          });
        }
      })
    },
  },
}

</script>
<style lang="scss" scoped>
::v-deep .el-cascader,
::v-deep .el-select,
::v-deep .el-date-editor--daterange.el-input__inner {
  width: 100%;
}
</style>
