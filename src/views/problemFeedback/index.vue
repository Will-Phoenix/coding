<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="反馈时间" prop="applyTime">
                  <el-date-picker
                    v-model="query.applyTime"
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>
        <el-tabs v-model="status" style="margin: 0 0 0 20px" @tab-click="onChangeTab">
          <el-tab-pane label="全部" name="-1"></el-tab-pane>
          <el-tab-pane label="未回复" name="0"></el-tab-pane>
          <el-tab-pane label="已回复" name="1"></el-tab-pane>
        </el-tabs>
        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
          style="margin: 0 20px"
        >
          <el-table-column
            prop="userName"
            label="反馈人姓名"
            width="120"
            align="left"
          />
          <el-table-column
            prop="userPhone"
            label="反馈人电话"
            width="120"
            align="left"
          />
          <el-table-column
            prop="entName"
            label="企业名称"
            align="left"
          />
          <el-table-column
            prop="type"
            label="反馈类型"
            align="left"
          />
          <el-table-column
            prop="feedbackTime"
            label="反馈时间"
            align="left"
            width="160"
          />
          <el-table-column
            prop="feedbackContent"
            label="用户反馈内容"
            align="left"
          />
          <el-table-column
            prop="contentAttachments"
            label="用户上传附件"
            align="left"
          >
            <template slot-scope="scope">
              <div v-for="item in scope.row.contentAttachments" :key="item.id" class="attachment-item" @click="onPreview(item.id)">
                {{ item.fullName }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="replyContent"
            label="回复用户内容"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.status === 1"
                type="text"
                @click="onLookup(scope.row.replyContent)"
              >查看
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="160"
          >
            <template slot-scope="scope">
              <div class="btn-container">
                <el-button
                  v-if="scope.row.status === 0"
                  class="btn"
                  type="text"
                  @click="onReply(scope.row)"
                >回复
                </el-button>
                <el-button
                  v-else
                  class="btn"
                  type="text"
                  @click="onReply(scope.row)"
                >重新回复
                </el-button>
              </div>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <reply-content
      :visible.sync="dialog.visible"
      :loading="dialog.loading"
      :data="dialog.data"
      @confirm="initData"
    />
    <lookup-content
      :visible.sync="lookup.visible"
      :data="lookup.data"
    />
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </div>
</template>

<script>
import dayjs from "dayjs";
import ReplyContent from "@/views/problemFeedback/components/replyContent.vue";
import LookupContent from "@/views/problemFeedback/components/lookupContent.vue";
import previewOnline from "@/components/preview-online/index.vue";
import { getFeedbackPage } from "@/api/business/problemFeedback";
import { downloadFile } from "@/api/business/signature";

export default {
  name: "ProblemFeedbackIndex",
  components: { previewOnline, LookupContent, ReplyContent },
  data() {
    return {
      status: "0",
      list: [],
      listLoading: false, // 列表loading
      buttonLoading: false, // 上传列表loading
      total: 0,
      query: {
        applyTime: undefined,
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      dialog: {
        visible: false,
        loading: false,
        data: {},
      },
      lookup: {
        visible: false,
        data: '',
      },
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
    }
  },
  created() {
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
    onChangeTab() {
      this.onSearch();
    },
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
      this.query.applyTime = undefined;
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let startTime = "";
      let endTime = "";
      if (this.query.applyTime) {
        startTime = dayjs(this.query.applyTime[0]).format("YYYY-MM-DD") + ' 00:00:00';
        endTime = dayjs(this.query.applyTime[1]).format("YYYY-MM-DD") + ' 23:59:59';
      }
      let _query = {
        ...this.listQuery,
        ...this.query,
      };
      if (startTime && endTime) {
        _query['startTime'] = startTime;
        _query['endTime'] = endTime;
      }
      delete _query.applyTime;
      if (this.status === '0' || this.status === '1') {
        _query['status'] = this.status;
      }
      getFeedbackPage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    onReply(row) {
      this.dialog.data = { ...row };
      this.dialog.visible = true;
    },
    async onPreview(fid) {
      const res = await downloadFile(fid);
      if (["jpg", "png", "jpeg"].includes(res.data.fileExtension)) {
        this.$hevueImgPreview({
          url: res.data.url,
          clickMaskCLose: true,
        });
      } else {
        this.preview.fileUrl = res.data.url;
        this.preview.fileTitle = res.data.name;
        this.preview.visible = true;
      }
    },
    onLookup(content) {
      this.lookup.data = content;
      this.lookup.visible = true;
    }
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
::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
.btn-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .btn + .btn {
    margin-left: 10px;
  }
}
.attachment-item {
  color: #1890ff;
  cursor: pointer;
}
</style>
