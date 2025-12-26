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
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="120px" label-position="right">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="报销流程名称"
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
              label="关联审批流"
              prop="flowTemplateId"
            >
              <el-select
                v-model="dataForm.flowTemplateId"
                placeholder="请选择"
                clearable
                filterable
                :disabled="dataForm.id !== ''"
              >
                <el-option v-for="(item, index) in workflowOptions" :key="index" :label="item.fullName" :value="item.id" :disabled="item.disabled" />

              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="关联报销模版"
              prop="basePrintdevId"
            >
              <el-select
                v-model="dataForm.basePrintdevId"
                placeholder="请选择"
                clearable
                filterable
              >
                <el-option v-for="(item, index) in templateOptions" :key="index" :label="item.fullName" :value="item.id" :disabled="item.disabled" />

              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="关联账套"
              prop="sobId"
            >
              <el-select
                v-model="dataForm.sobId"
                placeholder="请选择"
                clearable
                filterable
              >
                <el-option v-for="(item, index) in sobIdOptions" :key="index" :label="item.name" :value="item.id" :disabled="item.disabled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="大模型类型" prop="difyType">
              <el-select v-model="dataForm.difyType" placeholder="选择大模型类型">
                <el-option
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  v-for="item in difyTypeList"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="展示排序"
              prop="sort"
            >
              <el-input-number
                :min="0"
                :max="999999"
                v-model="dataForm.sort"
                controls-position="right"
                placeholder="请输入"
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
import { getPrintDevList } from '@/api/system/printDev';
import { FlowEnginePageList, getDifyTypeList } from "@/api/workFlow/FlowEngine";
import { createCcdBizFlowModule, updateCcdBizFlowModule } from "@/api/business/businessApproval";
import { getCcdEntSobList } from "@/api/business/enterpriseAccountSetManagement";

export default {
  components: {},
  props: [],
  data() {
    return {
      visible: false,
      loading: false,
      btnLoading: false,
      difyTypeList: [],
      dataForm: {
        name: "",
        flowTemplateId: "",
        basePrintdevId: null,
        sobId: null,
        sort: undefined,
        status: 1,
        type: 2,
        difyType: '',
        categoryId: undefined,
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
          flowTemplateId: [
            {
              required: true,
              message: '请选择',
              trigger: 'change'
            },
          ],
          basePrintdevId: [
            {
              required: true,
              message: '请选择',
              trigger: 'change'
            },
          ],
          sobId: [
            {
              required: true,
              message: '请选择',
              trigger: 'change'
            },
          ],
        },
      workflowOptions: [],
      templateOptions: [],
      sobIdOptions: [],
    }
  },
  computed: {},
  watch: {},
  created() {
    getDifyTypeList().then(res => {
      const data1 = res.data;
      const list = [];
      for (const key in data1) {
        list.push({ label: data1[key], value: key });
      }
      this.difyTypeList = list;
    })
  },
  mounted() {
  },
  methods: {
    init(id, row, typeId) {
      this.dataForm.id = id || "";
      this.dataForm.categoryId = typeId;
      this.visible = true;
      // 拉取流程列表
      FlowEnginePageList({ currentPage: 1, pageSize: -1 }).then(res => {
        this.workflowOptions = res.data.list;
      });
      // 拉取打印模板
      getPrintDevList({ currentPage: 1, pageSize: -1 }).then(res => {
        this.templateOptions = res.data.list;
      });
      getCcdEntSobList().then(res => {
        this.sobIdOptions = res.data;
      });
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
          const method = this.dataForm.id ? updateCcdBizFlowModule : createCcdBizFlowModule;
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

