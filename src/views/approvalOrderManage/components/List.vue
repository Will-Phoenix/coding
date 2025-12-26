<template>
  <div>
    <JNPF-table
      v-loading="listLoading"
      :data="list"
      :list-query="listQuery"
      :height="null"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        prop="name"
        label="审批单名称"
        align="left"
        min-width="200"
      />
      <el-table-column label="审批中心展示" algin="left" width="160">
        <!-- slot-scope 接收当前行数据 row，手动渲染 viewInfo.value -->
        <template slot-scope="{ row }">
          {{ row.viewInfo[0].value }}
        </template>
      </el-table-column>
      <!-- <el-table-column
        label="审批中心展示"
        prop="viewInfo.value"
        algin="left"
        width="160"
      /> -->
      <el-table-column
        label="审批单类型"
        prop="applyType"
        algin="left"
        width="160"
      />
      <el-table-column
        v-if="type === '1'"
        label="申请人"
        prop="applyUserName"
        algin="left"
        width="120"
      />
      <el-table-column
        v-if="type === '2'"
        label="报销人"
        prop="exsUserName"
        algin="left"
        width="120"
      />
      <el-table-column
        label="申请日期"
        prop="applyDate"
        algin="left"
        width="160"
      />
      <el-table-column label="操作" fixed="right" width="200">
        <template slot-scope="scope">
          <!--          <el-button-->
          <!--            type="text"-->
          <!--            @click="anyFormDetail(scope.row)"-->
          <!--          >表单详情-->
          <!--          </el-button>-->
          <el-button type="text" @click="goToDetail(scope.row, scope.$index)"
            >审批单详情
          </el-button>
          <el-button type="text" @click="onDownload(scope.row, scope.$index)"
            >下载审批单
          </el-button>
          <el-button
            v-if="showDeleteBtn(scope.row)"
            type="text"
            @click="onDelete(scope.row)"
            >删除
          </el-button>
        </template>
      </el-table-column>
    </JNPF-table>
    <pagination
      :total="total"
      :page.sync="listQuery.current"
      :limit.sync="listQuery.size"
      @pagination="initData"
    />
    <formDialog :visible.sync="formDialog.visible" :id="formDialog.id" />
  </div>
</template>
<script>
import baseMixin from "@/mixins/print/baseMixin";
import dayjs from "dayjs";
import { getCcdOrderCategoryPageUserOrderManage } from "@/api/business/approvalTypeManage";
import { getApplyOrder, deleteApplyOrder } from "@/api/business/expenseAccount";
import JSZip from "jszip";
import { downloadFile } from "@/api/business/signature";
import axios from "axios";
import { saveAs } from "file-saver";
import formDialog from "@/views/approvalOrderManage/formDialog.vue";

export default {
  name: "ApprovalOrderList",
  components: { formDialog },
  mixins: [baseMixin],
  props: {
    query: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: () => "1"
    }
  },
  data() {
    return {
      // 多选框 默认无
      hasC: {
        type: Boolean,
        default: true
      },
      list: [],
      listLoading: false,
      listQuery: {
        current: 1,
        size: 20
      },
      total: 0,
      applyFids: [],
      downloadData: {
        data: {},
        loading: false
      },
      formDialog: {
        visible: false,
        id: ""
      }
    };
  },
  computed: {
    showDeleteBtn() {
      return row => {
        return this.type === "1" && row.status === 3;
      };
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      this.listLoading = true;
      let startTime = "";
      let endTime = "";
      if (this.query.applyMonth) {
        startTime = dayjs(this.query.applyMonth[0]).format("YYYY-MM-DD");
        endTime = dayjs(this.query.applyMonth[1]).format("YYYY-MM-DD");
      }
      let _query = {
        ...this.listQuery,
        ...this.query,
        startTime,
        endTime,
        orderBizType: this.type
      };
      if (!startTime) {
        delete _query.startTime;
      }
      if (!endTime) {
        delete _query.endTime;
      }
      delete _query.applyMonth;
      getCcdOrderCategoryPageUserOrderManage(_query)
        .then(res => {
          this.list = res.data.records;
          this.total = res.data.total;
          this.listLoading = false;
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    goToDetail(row) {
      if (this.type === "1") {
        this.$router.push({
          path: "/approvalOrderDetail",
          query: {
            id: row.id
          }
        });
      } else {
        this.$router.push({
          path: "/exsOrderDetail",
          query: {
            id: row.id
          }
        });
      }
    },
    anyFormDetail(row) {
      Object.assign(this.formDialog, { visible: true, id: row.id });
    },
    refresh(resetPageNum) {
      if (resetPageNum) {
        // 先把页码设置到第一页
        this.listQuery.current = 1;
      }
      this.initData();
    },
    onDownload(row) {
      if (this.downloadData.loading) {
        this.$message.error("正在下载中");
        return;
      }
      this.$message.info("开始下载");
      this.downloadData.loading = true;
      this.downloadAll(row.id)
        .catch(e => {
          console.log(e);
          // 提示下载失败
          this.$message.error("下载失败");
        })
        .finally(() => {
          this.downloadData.loading = false;
        });
    },
    // 删除审批单
    onDelete(row) {
      // 已经关联过的审批单，删除需要提醒
      if (row?.isUsed) {
        this.$confirm("该审批单已被关联，确定删除吗？", "提示", {
          type: "warning"
        }).then(() => {
          deleteApplyOrder(row.id).then(() => {
            this.$message.success("删除成功");
            this.initData();
          });
        });
      } else {
        // 直接删除
        deleteApplyOrder(row.id).then(() => {
          this.$message.success("删除成功");
          this.initData();
        });
      }
    },
    // 下载所有文件
    async downloadAll(id) {
      // 需要下载的文件或图片列表
      let downloadList = [];
      if (this.type === "1") {
        downloadList = await this.__genDownloadList(id);
      } else {
        downloadList = await this.downloadAllZipByOrders(id);
      }
      this.checkSameFilename(downloadList);
      // 放入zip并下载
      const zip = new JSZip();
      downloadList.forEach(v => {
        zip.file(v.name, v.blob, { binary: true });
      });
      const blob = await zip.generateAsync({
        type: "blob",
        // Available compression methods are STORE (no compression) and DEFLATE.
        compression: "DEFLATE",
        compressionOptions: {
          // you can give the compression level with compressionOptions : {level:6} (or any level between 1 (best speed) and 9 (best compression))
          level: 1
        },
        mimeType: "application/zip"
      });
      saveAs(blob, "审批单压缩包.zip");
      this.$message.success("下载中，请在浏览器下载列表中查看");
    },
    async __genDownloadList(id) {
      const order = (await getApplyOrder(id)).data;
      // 需要下载的文件或图片列表
      const downloadList = [];
      // 申请单模版图片塞入downloadList
      const result = await this.templateToImageDirectly(
        order.basePrintdevId,
        order.id,
        order.orderType
      );
      downloadList.push({ name: order.name + ".png", blob: result.src });
      // 申请单附件
      // let detail = JSON.parse(order.detailJson);
      // if (detail && (detail.attachmentUrl || detail.exsFids)) {
      //   let fidsStr = detail.exsFids || detail.attachmentUrl;
      //   let fids = fidsStr.split(',');
      //   if (fids && fids.length > 0) {
      //     for (const v of fids) {
      //       let res = await downloadFile(v);
      //       await axios.get(res.data.url, {
      //         responseType: 'blob'
      //       }).then(res1 => {
      //         downloadList.push({ name: res.data.name, blob: res1.data });
      //       });
      //     }
      //   }
      // }
      // 当前改为只要是attachment组件的数据，都获取并加载
      let fids = await this.getAttachmentFiles({ formId: this.orderId });
      if (fids && fids.length > 0) {
        for (const v of fids) {
          let res = await downloadFile(v);
          await axios
            .get(res.data.url, {
              responseType: "blob"
            })
            .then(res1 => {
              downloadList.push({ name: res.data.name, blob: res1.data });
            });
        }
      }
      return downloadList;
    },
    checkSameFilename(fileList) {
      // 同名文件检查，发现同名的重命名
      // fileList为一组{name: xx, blob: xx}对象的数据
      let differentFile = {};
      fileList.forEach(v => {
        if (!differentFile[v.name]) {
          differentFile[v.name] = 1;
        } else {
          differentFile[v.name]++;
          v.name =
            v.name.slice(0, v.name.lastIndexOf(".")) +
            `(${differentFile[v.name]})` +
            v.name.slice(v.name.lastIndexOf("."));
        }
      });
      console.log("不同文件及数量", differentFile);
    },
    handleSelectionChange(val) {
      console.log(val, "选中");
      this.$emit("selection-change", val);
    }
  }
};
</script>
<style scoped lang="scss"></style>
