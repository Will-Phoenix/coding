<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="180px" style="width: 100%" :rules="rules">
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="报销单（审批单）名称" prop="name">
                  <el-input v-model.trim="query.name" placeholder="请输入报销单或审批单名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="申请时间" prop="applyTime">
                  <el-input v-model.trim="query.applyTime" placeholder="请输入精确的申请时间（例：2024-12-12 17:33:41）" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="单据类型" prop="orderBizType">
                  <el-select v-model="query.orderBizType" style="width: 100%" placeholder="请选择单据类型">
                    <el-option label="审批类单据" :value="1" />
                    <el-option label="报销类单据" :value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <div style="color: red">注：名称和申请时间可以从审批单管理中复制</div>
              </el-col>
            </div>
            <el-col :span="24" class="align">
              <el-form-item>
                <el-button type="primary" :loading="queryLoading" @click="onSearch">查询</el-button>
                <el-button type="primary" @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </div>
        <el-tabs v-model="status" style="margin: 0 0 20px 20px" v-loading="queryLoading" @tab-click="onChangeTab">
          <el-tab-pane label="表单信息" name="1">
            <div class="pane1" v-if="anyForm.formData && anyForm.moduleJson">
              <el-card>
                <AnyForm ref="anyform" :module-json="anyForm.moduleJson" :form-data="anyForm.formData" />
                <div class="btn">
                  <el-button type="primary" :loading="submitLoading" @click="onSubmit">提交</el-button>
                </div>
              </el-card>
            </div>
            <el-empty v-else description="暂无数据，请查询"></el-empty>
          </el-tab-pane>
          <el-tab-pane label="流转记录" name="2">
            <recordList
              :list="flowTaskOperatorRecordList"
              :end-time="endTime"
              :flow-id="setting.flowId"
              :op-type="setting.opType"
              :show-operation="true"
              @updateFlow="updateFlow"
            />
          </el-tab-pane>
          <el-tab-pane label="相关资料" name="3" v-if="query.orderBizType === 2">
            <el-upload
              :action="actionUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-progress="handleProgress"
              :on-success="handleSuccess"
              style="margin-right: 10px;margin-bottom: 10px;text-align: right"
            >
              <el-button type="primary" :loading="btnLoading" icon="el-icon-plus">添加新的报销资料
              </el-button>
            </el-upload>
            <JNPF-table
              :data="exsFidsList"
              :height="null"
            >
              <el-table-column
                prop="name"
                label="文件名称"
                align="left"
              />
              <el-table-column
                prop="fileSize"
                label="文件大小"
                align="left"
              />
              <el-table-column
                label="操作"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button type="text" @click="checkFile(scope.row)">查看</el-button>
                  <el-button type="text" @click="deleteFile(scope.row, scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </JNPF-table>
          </el-tab-pane>
        </el-tabs>
        <editFlowDialog :visible.sync="editFlowDialog.visible" :data="editFlowDialog.data" @refresh="onSearch" />
        <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
      </div>
    </div>
  </div>
</template>

<script>
import recordList from "@/views/workFlow/components/RecordList.vue";
import AnyForm from '@/components/DynamicForm/AnyForm.vue';
import editFlowDialog from "./editFlowDialog";
import { getOrderDetailByName, updateJson } from "@/api/business/modifyFormAndFlow";
import { downloadFileBatch } from "@/api/business/signature";
import { editExsOrder } from "@/api/business/expenseAccount";
import previewOnline from "@/components/preview-online/index";

export default {
  name: 'ExpenseAccountManageIndex',
  components: { recordList, AnyForm, editFlowDialog, previewOnline },
  data() {
    return {
      query: {
        name: "",
        orderBizType: "",
        applyTime: ""
      },
      orderId: "",
      status: "1",
      flowTaskOperatorRecordList: [],
      exsFidsList: [],
      setting: {
        opType: 0,
        flowId: '',
      },
      endTime: 0,
      anyForm: {
        moduleJson: undefined,
        formData: undefined
      },
      editFlowDialog: {
        visible: false,
        data: {}
      },
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: ""
      },
      rules: {
        name: [{ required: true, message: '请输入报销单或审批单名称' }],
        applyTime: [{ required: true, message: '请输入报销单或审批单的申请时间' }],
        orderBizType: [{ required: true, message: '请选择单据类型' }]
      },
      queryLoading: false,
      submitLoading: false,
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
      btnLoading: false
    }
  },
  created() {

  },
  mounted() {
    this.onReset();
  },
  methods: {
    // 搜索
    onSearch() {
      if (this.queryLoading) return;
      this.queryLoading = true;
      this.$refs.formRef.validate(async valid => {
        try {
          if (valid) {
            await getOrderDetailByName(this.query).then(async res => {
              // 加载流转记录
              this.flowTaskOperatorRecordList = res.data.flowTaskOperatorRecordList;
              this.setting.flowId = res.data.flowTaskInfo.flowId;
              // 加载动态表单
              this.anyForm.formData = res.data.formData;
              this.anyForm.moduleJson = res.data.moduleJson;
              // 加载相关资料列表
              if (res.data.formData.exsFids) {
                await downloadFileBatch(res.data.formData.exsFids).then(r => {
                  this.exsFidsList = [...r.data];
                });
              }
            });
          } else {
            this.queryLoading = false;
          }
        } finally {
          this.queryLoading = false;
        }
      });
    },
    async onSubmit() {
      const r = await this.$refs.anyform.collectData(true);
      updateJson({ id: r.id, formData: r }).then(() => {
        this.$message.success("操作成功");
      });
    },
    updateFlow(row) {
      Object.assign(this.editFlowDialog, { visible: true, data: row })
    },
    resetData() {
      this.exsFidsList = [];
      this.flowTaskOperatorRecordList = [];
      this.setting.flowId = "";
      this.anyForm.formData = undefined;
      this.anyForm.moduleJson = undefined;
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.resetData();
    },
    onChangeTab() {

    },
    checkFile(row) {
      Object.assign(this.preview, { visible: true, fileUrl: row.url, fileTitle: row.name });
    },
    deleteFile(row) {
      let ids = this.exsFidsList.filter(v => v.id !== row.id).map(v => v.id).join(",");
      editExsOrder({ id: this.anyForm.formData.id, exsFids: ids }).then(() => {
        this.$message.success("删除成功");
        this.onSearch();
      }
      );
    },
    handleProgress() {
      this.btnLoading = true;
    },
    // 新增其他报销材料
    handleSuccess(response) {
      try {
        let ids = this.exsFidsList.map(v => v.id).join(",");
        if (ids) {
          ids = ids.concat(`,${response.data.id}`);
        } else {
          ids = response.data.id;
        }
        editExsOrder({ id: this.anyForm.formData.id, exsFids: ids }).then(() => {
          this.$message.success("新增成功");
          this.onSearch();
        }
        );
      } finally {
        this.btnLoading = false;
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.query-flex {
  display: flex;
  flex-wrap: wrap;
}
.align {
  text-align: center;
  margin-top: 20px;
}
.content {
  padding: 10px;
  display: flex;
  align-items: center;
}
.sync-btn {
  text-align: right;
  padding-right: 10px;
}
.sobInfo {
  font-size: 16px;
  line-height: 22px;
  font-weight: bold;
  margin-right: 15px;
  margin-bottom: 20px;
  width: 100%;
  .el-select {
    width: 400px;
  }
}
::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
.pane1 {
  padding: 20px 20%;
}
.btn {
  text-align: center;
  margin-top: 20px;
}
</style>
