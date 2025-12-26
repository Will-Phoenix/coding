<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <!--              <el-col :span="8" v-if="userInfo.organizeIdList && userInfo.organizeIdList.length === 1">
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
                            </el-col>-->
              <el-col :span="8">
                <el-form-item label="上传日期" prop="startEndTime">
                  <el-date-picker
                    v-model="query.startEndTime"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="文件类型" prop="fileType">
                  <el-select v-model="query.fileType" placeholder="请选择..." style="width: 100%">
                    <el-option
                      v-for="item in fileTypeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <!--              <el-col :span="8">
                <el-form-item label="持有人" prop="holderName">
                  <el-input v-model="query.holderName" placeholder="请输入" />
                </el-form-item>
              </el-col>-->
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>

        <div class="buttonHead">
          <!--          <gpy-selector style="margin-right: 10px" @select="openGPY">高拍仪上传资料</gpy-selector>-->
          <el-upload
            :action="actionUrl"
            :file-list="fileList"
            :headers="uploadHeaders"
            :show-file-list="false"
            accept=".pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg"
            :on-success="handleSuccess"
            :on-error="handleError"
            :on-progress="handleProgress"
          >
            <!--            :before-upload="handleBeforeUpload"-->
            <el-button size="small" type="primary" :loading="buttonLoading">上传资料</el-button>
          </el-upload>
<!--          <div class="upload-info">PS：建议上传10M以内的文件或分开上传</div>-->
          <!--          <el-button size="small" type="primary" @click="batchAssociatedHolder(multipleSelection)" style="margin-left: 10px">批量关联持有人</el-button>-->
        </div>

        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
          :has-c="false"
          @selection-change="handleSelectionChange"
        >
          <!--          <el-table-column
                      v-if="userInfo.organizeIdList && userInfo.organizeIdList.length === 1"
                      label="所属公司"
                      prop="entName"
                      algin="left"
                    />-->
          <el-table-column
            prop="fullName"
            label="文件名称"
            align="left"
            min-width="180"
          >
            <template slot-scope="scope">
              <el-link type="primary" @click="previewImgOrOther(scope.row)">{{ scope.row.fullName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="文件大小"
            prop="fileSizeFormat"
            algin="left"
            width="120"
          />
          <!--          <el-table-column
            label="持有人姓名"
            prop="holderName"
            algin="left"
          />-->
          <el-table-column
            prop="type"
            label="文件类型"
            align="left"
            width="120"
          />
          <el-table-column
            label="文件上传时间"
            prop="createTime"
            algin="left"
            min-width="180"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="230"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="updateFileName(scope.row)"
              >修改文件名称
              </el-button>
              <!--              <el-button
                type="text"
                @click="associatedHolder(scope.row)"
              >{{ !scope.row.holderName ? "关联持有人" : "变更持有人" }}
              </el-button>-->
              <el-button
                type="text"
                @click="onDelete(scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
        <gpy-dialog :visible.sync="gpy.visible" :loading="gpy.loading" :device-type="gpy.deviceType" :support-pdf="true" @confirm="onConfirm" />
        <holderRefDialog :visible.sync="dialog.visible" :loading="dialog.loading" :data="dialog.data" :from="2" @confirm="initData" />
        <editForm :visible.sync="update.visible" :data="update.data" @confirm="initData" />
        <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
        <file-oversize-pop :visible.sync="showFileOversizePop" />
      </div>
    </div>
  </div>
</template>

<script>
import {
  createCcdUserFolder,
  deleteCcdUserFolder, getPersonalCcdUserFolderPage,
} from "@/api/business/userFolder";
import { downloadFile } from "@/api/business/signature";
import GpyDialog from "@/views/pasteTicketCenter/component/GpyDialog";
import holderRefDialog from "@/views/pasteTicketCenter/component/associatedHolderDialog";
import editForm from "./component/editForm";
import { saveAs } from "file-saver"
import dayjs from "dayjs";
import { uploadBase64Data, uploadBlobData } from "@/utils/fileUtils";
import { mapGetters } from "vuex";
import previewOnline from "@/components/preview-online/index.vue";
import FileOversizePop from "@/views/userFolderManage/component/fileOversizePop.vue";

export default {
  name: 'PersonalUserFolderManage',
  components: { FileOversizePop, previewOnline, GpyDialog, holderRefDialog, editForm },
  data() {
    return {
      list: [],
      listLoading: false,
      buttonLoading: false, // 上传列表loading
      fileList: [],
      total: 0,
      multipleSelection: [],
      showFileOversizePop: false,
      gpy: {
        visible: false,
        loading: false,
        deviceType: '1',
      },
      dialog: {
        visible: false,
        loading: false,
        data: {},
      },
      update: {
        visible: false,
        data: {},
      },
      query: {
        startEndTime: undefined,
        fileType: "",
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
      defaultProps: {
        label: "fullName",
        value: "id",
        children: "children",
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      entOption: [], // 企业选项
      fileTypeOptions: [
        { label: "jpg", value: "jpg" },
        // { label: "gif", value: "gif" },
        { label: "png", value: "png" },
        // { label: "bmp", value: "bmp" },
        { label: "jpeg", value: "jpeg" },
        { label: "doc", value: "doc" },
        { label: "docx", value: "docx" },
        { label: "ppt", value: "ppt" },
        { label: "pptx", value: "pptx" },
        { label: "xls", value: "xls" },
        { label: "xlsx", value: "xlsx" },
        { label: "pdf", value: "pdf" },
        // { label: "txt", value: "txt" },
        // { label: "rar", value: "rar" },
        // { label: "zip", value: "zip" },
        // { label: "csv", value: "csv" },
        // { label: "mp3", value: "mp3" },
      ], // 文件类型选项
      actionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      uploadHeaders: { Authorization: this.$store.getters.token },
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
  },
  created() {
    // 加载企业树
    /* getOrganizeTree().then(res => {
      this.entOption = res.data.list;
    }); */
    this.initData();
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
    }
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
      let uploadMinDate = "";
      let uploadMaxDate = "";
      if (this.query.startEndTime) {
        uploadMinDate = dayjs(this.query.startEndTime[0]).format("YYYY-MM-DD");
        uploadMaxDate = dayjs(this.query.startEndTime[1]).format("YYYY-MM-DD");
      }
      /* // 处理一下企业数据格式，这个是当为票据中心时，企业的搜索
      if (this.query.entId) {
        entId = this.query.entId[this.query.entId.length - 1];
      }
      // 需要判断是票据中心，还是企业端
      // 票据中心可以不传企业id，但企业端必须传该用户所在企业的id；通过用户登录的userInfo中，组织list的元素个数，因为如果是企业元素个数一定大于1
      if (this.userInfo.organizeIdList && this.userInfo.organizeIdList.length > 1) {
        entId = this.userInfo.companyId;
      } */
      let _query = {
        ...this.listQuery,
        ...this.query,
        uploadMinDate,
        uploadMaxDate,
      };
      delete _query.startEndTime
      getPersonalCcdUserFolderPage(_query).then(res => {
        this.list = res.data.page.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    openGPY(deviceType) {
      Object.assign(this.gpy, { visible: true, loading: false, deviceType });
    },
    associatedHolder(row = {}) {
      Object.assign(this.dialog, { visible: true, loading: false, data: row });
    },
    batchAssociatedHolder(select = []) {
      if (select.length > 0) {
        Object.assign(this.dialog, { visible: true, loading: false, data: select });
      } else {
        this.$message.warning("请至少选择一个");
      }
    },
    // 预览图片或其他文件
    previewImgOrOther(row) {
      if (["jpg", "png", "jpeg"].includes(row.type)) {
        this.$hevueImgPreview({
          url: row.fidUrl,
          clickMaskCLose: true,
        });
      } else {
        Object.assign(this.preview, { visible: true, fileUrl: row.fidUrl, fileTitle: row.fullName });
      }
    },
    async onConfirm(data, type) {
      this.gpy.loading = true;
      try {
        if (type === 'img') {
          for (const v of data) {
            const res = await uploadBase64Data(this.actionUrl, v, `${dayjs().format("YYYYMMDDHHmmssSSS")}.jpg`, this.$store.getters.token);
            await createCcdUserFolder({ fid: res.data.data.id });
          }
        } else if (type === 'pdf') { // 此时 data 是blob对象
          // saveAs(data, `${dayjs().format("YYYYMMDDHHmmss")}.pdf`);
          const res = await uploadBlobData(this.actionUrl, data, `${dayjs().format("YYYYMMDDHHmmssSSS")}.pdf`, this.$store.getters.token);
          await createCcdUserFolder({ fid: res.data.data.id });
        }
        this.$message.success("上传成功");
        this.initData();
      } finally {
        Object.assign(this.gpy, { visible: false, loading: false });
      }
    },
    onDelete(row) {
      this.$confirm('您确定要删除该文件, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteCcdUserFolder(row.id).then(() => {
          this.$message.success("删除成功");
          this.initData();
        });
      });
    },
    updateFileName(row) {
      Object.assign(this.update, { visible: true, data: { id: row.id, name: row.fullName }});
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
    handleSuccess(response) {
      // if (response.code == 200) {
      //   this.$message.success("上传成功");
      //   this.initData();
      // } else {
      //   this.$message.error(response.msg);
      // }
      createCcdUserFolder({ fid: response.data.id, isRel: 1 }).then(() => {
        this.$message.success("上传成功");
        this.buttonLoading = false;
        this.initData();
      });
    },
    handleBeforeUpload(file) {
      let isRightSize = file.size <= 10 * 1024 * 1024
      if (!isRightSize) this.showFileOversizePop = true
      return isRightSize
    },
    handleProgress() {
      this.buttonLoading = true;
    },
    handleError(err) {
      this.buttonLoading = false;
      this.$message.error(err);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
  .upload-info {
    margin-left: 10px;
    color: #969799;
    font-size: 14px;
    line-height: 20px;
  }
}
</style>
