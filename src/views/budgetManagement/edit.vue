<template>
  <el-dialog
    :title="!dataForm.id ? '新增预算' :'编辑预算'"
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
              label="预算名称"
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
            <el-form-item label="预算类型" prop="budgetType">
              <el-select v-model="dataForm.budgetType" clearable placeholder="请选择">
                <el-option label="普通预算" :value="1" />
                <el-option label="月度预算" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="所属预算年度" prop="year">
              <el-date-picker
                v-model="dataForm.year"
                style="width: 100%"
                type="year"
                placeholder="请选择所属预算年度"
                value-format="yyyy"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="dataForm.budgetType === 1">
            <el-form-item label="开始执行日期" prop="startDate">
              <el-date-picker
                v-model="dataForm.startDate"
                style="width: 100%"
                type="date"
                placeholder="请选择开始执行日期"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="dataForm.budgetType === 1">
            <el-form-item label="结束执行日期" prop="endDate">
              <el-date-picker
                v-model="dataForm.endDate"
                style="width: 100%"
                type="date"
                placeholder="请选择结束执行日期"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions"
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
import { addBudget } from "@/api/business/budgetManagement";
import dayjs from "dayjs";
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
        budgetType: "",
        startDate: "",
        endDate: "",
        year: ""
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
                budgetType: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'blur'
                  },
                ],
                startDate: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'blur'
                  },
                ],
                endDate: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'blur'
                  },
                ],
                year: [
                  {
                    required: true,
                    message: '请选择',
                    trigger: 'blur'
                  },
                ],
              },
    }
  },
  computed: {
    pickerOptions() {
      const that = this;
      return {
        disabledDate(time) {
          return dayjs(time.getTime()).year() != that.dataForm.year;
        }
      };
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
          // 普通预算校验结束日期和开始日期时间
          if (this.dataForm.budgetType === 1) {
            let startDate = dayjs(this.dataForm.startDate, 'YYYY-MM-DD')
            let endDate = dayjs(this.dataForm.endDate, 'YYYY-MM-DD')
            if (startDate.isAfter(endDate) || startDate.isSame(endDate)) {
              this.$message.error("开始执行日期必须小于结束执行日期");
              return
            }
          }
          const method = addBudget;
          const params = { ... this.dataForm }
          if (params.budgetType === 2) {
            delete params.startDate;
            delete params.endDate;
          }
          method(params).then(() => {
            this.$message.success("新增成功");
            this.visible = false;
            this.$emit("refresh");
          });
        }
      })
    },
  },
}

</script>

