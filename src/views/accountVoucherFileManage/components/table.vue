<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="180px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="6" v-if="from === 2">
                <el-form-item label="所属公司" prop="entId" label-width="100px">
                  <el-cascader
                    v-model="query.entId"
                    placeholder="请选择企业"
                    :options="entOption"
                    :props="defaultProps"
                    :show-all-levels="false"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item label="文件资料涵盖时间区间" prop="startEndTime">
                  <el-date-picker
                    v-model="query.startEndTime"
                    type="monthrange"
                    range-separator="至"
                    start-placeholder="开始月份"
                    end-placeholder="结束月份"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="50px">
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>

        <div class="buttonHead">
          <el-button type="primary" @click="onCreate">新增记账凭证文件</el-button>
        </div>

        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            prop="fullName"
            label="记账凭证文件名称"
            align="left"
          />
          <el-table-column
            label="所属公司"
            prop="entName"
            algin="left"
            v-if="from === 2"
          />
          <el-table-column
            prop="fileExtension"
            label="文件类型"
            align="left"
          />
          <el-table-column
            prop="time"
            label="文件资料涵盖时间区间"
            align="left"
          >
            <template slot-scope="{ row }">
              <div>{{ row.startTime }} 至 {{ row.endTime }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="文件大小"
            prop="fileSize"
            algin="left"
          />
          <el-table-column
            label="文件上传时间"
            prop="createTime"
            algin="left"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="100"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="goDownload(scope.row)"
              >下载
              </el-button>
              <el-button
                type="text"
                @click="onDelete(scope.row)"
                v-if="from === 1"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
      <VFileAddDialog :visible.sync="createDialog.visible" :loading="createDialog.loading" @confirm="onConfirm" />
    </div>
  </div>
</template>

<script>
import { createAccountingVoucherAttachment, deleteAccountingVoucherAttachment, getAccountingAttachmentPage } from "@/api/business/accountVoucherFile";
import { getOrganizeTree } from "@/api/permission/organize";
import { downloadFile } from "@/api/business/signature";
import { saveAs } from "file-saver"
import VFileAddDialog from "./vFileAddDialog"
import dayjs from "dayjs";

export default {
  components: { VFileAddDialog },
  props: {
    // 从哪一端进入：1. 财务端 2. 票据中心
    from: {
      type: Number,
      default: 1,
    }
  },
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      createDialog: {
        visible: false,
        loading: false,
      },
      query: {
        entId: "",
        startEndTime: undefined,
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      defaultProps: {
        label: "fullName",
        value: "id",
        children: "children",
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      entOption: [], // 企业选项
    }
  },
  created() {
    // 加载企业树
    getOrganizeTree().then(res => {
      this.entOption = res.data.list;
    });
    this.initData();
  },
  methods: {
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      this.listQuery.current = 1;
      // 加载数据
      this.initData();
    },

    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.query.startEndTime = undefined;
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let startTime = "";
      let endTime = "";
      let entId = "";
      if (this.query.startEndTime) {
        startTime = dayjs(this.query.startEndTime[0]).format("YYYYMM");
        endTime = dayjs(this.query.startEndTime[1]).format("YYYYMM");
      }
      // 处理一下企业数据格式
      if (this.query.entId) {
        entId = this.query.entId[this.query.entId.length - 1];
      }
      let _query = {
        ...this.listQuery,
        ...this.query,
        startTime,
        endTime,
        entId,
      };
      getAccountingAttachmentPage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    onCreate() {
      Object.assign(this.createDialog, { visible: true, loading: false });
    },
    async onConfirm(formData) {
      this.createDialog.loading = true;
      try {
        createAccountingVoucherAttachment(formData).then(() => {
          this.$message.success("操作成功");
          // this.createDialog.visible = false;
          this.initData();
        });
      } finally {
        this.createDialog.loading = false;
      }
    },
    onDelete(row) {
      this.$confirm('您确定要删除该文件, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteAccountingVoucherAttachment(row.id).then(() => {
          this.$message.success("删除成功");
          this.initData();
        });
      });
    },
    goDownload(row) {
      this.$confirm('是否下载该文件?', '提示', {
        type: 'warning'
      }).then(() => {
        downloadFile(row.fid).then(res => {
          saveAs(res.data.url, res.data.name);
        });
      });
    },
    refreshOnActive() {
      this.initData();
    },
  }
}
</script>
<style lang="scss" scoped>
.query-flex {
  display: flex;
  flex-wrap: wrap;
}
.align {
  text-align: center;
}
.content {
  padding: 10px;
  display: flex;
  align-items: center;
}

.buttonHead {
  display: flex;
  align-items: center;
  padding: 14px 10px;
  flex-shrink: 0;
}
</style>
