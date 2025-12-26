<template>
  <el-dialog
    title="批量打印确认"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <JNPF-table
      ref="tableRef"
      :data="tableList"
      :hasC="true"
      style="width: 100%;height: 450px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column label="文件名称" prop="name" algin="left" style="width: 20%">
        <template slot-scope="{ row }">
          <div>
            <span>{{ row.name }}</span>
            <span v-if="row.top" style="color: red;margin-left: 8px;"
              >（加密文档请下载到本地打印）</span
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column label="文件预览" algin="left" style="width: 75%">
        <template slot-scope="{ row }">
          <div v-if="['jpg', 'png', 'jpeg'].includes(row.fileExtension)">
            <el-image
              style="width: 100%"
              :src="row.url"
              :preview-src-list="[row.url]"
              fit="contain"
            />
          </div>
          <div v-else>
            <embed style="width: 100%" :src="row.previewUrl" />
            <el-link type="primary" @click="openDialog(row)"
              >点击放大查看</el-link
            >
          </div>
        </template>
      </el-table-column>
    </JNPF-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{
        $t("common.cancelButton")
      }}</el-button>
      <el-button type="primary" @click="onConfirm">{{
        $t("common.confirmButton")
      }}</el-button>
    </span>
    <previewOnline
      :visible.sync="previewOnline.preview"
      :file-url="previewOnline.currentUrl"
      :file-title="previewOnline.titleName"
    />
  </el-dialog>
</template>
<script>
import previewOnline from "@/components/preview-online/index";

export default {
  components: { previewOnline },
  model: {
    prop: "visible",
    event: "update:visible"
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default: () => ({})
    },
    func: {
      type: Function,
      default: () => ({})
    }
  },
  data() {
    return {
      tableList: [],
      selectedList: [],
      previewOnline: {
        preview: false,
        currentUrl: "",
        titleName: ""
      }
    };
  },
  watch: {
    async visible(n) {
      if (n) {
        const tableList = this.data;
        for (const v of tableList) {
          // 判断每个元素url，如果不是图片，则把url转换成在线预览的url
          if (!["jpg", "png", "jpeg"].includes(v.fileExtension)) {
            v.previewUrl = await this.func({ fileDownloadUrl: v.url });
          }
          v.top = v.pdfDocumentObj && v.pdfDocumentObj.isEncrypted;
        }
        this.tableList = tableList;
        // 默认全选
        this.$nextTick(() => {
          this.tableList.forEach(row => {
            !row.top && this.$refs.tableRef.toggleRowSelection(row, true);
          });
        });
      }
    }
  },
  methods: {
    handleSelectionChange(val) {
      console.log("勾选事件：", val);
      this.selectedList = val;
    },
    onConfirm() {
      this.$emit("confirm", this.selectedList);
      this.updateVisible(false);
    },
    updateVisible(val) {
      this.$emit("update:visible", val);
    },
    openDialog(row) {
      Object.assign(this.previewOnline, {
        preview: true,
        currentUrl: row.url,
        titleName: row.name
      });
    }
  }
};
</script>
<style lang="scss" scoped></style>
