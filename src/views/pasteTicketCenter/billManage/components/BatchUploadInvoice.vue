<template>
  <el-dialog
    :title="step === 0?'上传发票':'解析结果'"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="1000px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="upload-container" v-if="step === 0">
      <el-upload
        drag
        :action="actionUrl"
        :file-list="fileList"
        :headers="uploadHeaders"
        :on-success="handleSuccess"
        :on-error="handleError"
        :on-progress="handleProgress"
        :before-remove="onBeforeRemove"
        :disabled="uploading"
        :data="isAirTicket?uploadParams:{}"
        accept=".pdf,.jpg,.jpeg,.png,.ofd"
        :limit="10"
        multiple
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传pdf、ofd、jpg、jpeg、png文件</div>
      </el-upload>
    </div>
    <div v-else>
      <div class="result-sum">解析结果通知：共上传文件数: {{ fileList.length }}个，成功解析{{ fileList.filter(v=> v.status === 'success' && v.code).length }}个，解析失败{{ fileList.filter(v=> v.status === 'error').length }}个</div>
      <div class="result-title">解析成功</div>
      <JNPF-table
        :data="invoiceList"
        :span-method="arraySpanMethod"
        border
        style="margin: 0 20px"
        :height="300"
      >
        <el-table-column
          prop="type"
          label="发票类型"
          align="left"
        >
          <template slot-scope="scope">
            <div>{{ INVOICE_TYPE[scope.row.type] }}</div>
          </template>
        </el-table-column>
        <el-table-column
          prop="code"
          label="发票号码"
          align="left"
        />
        <el-table-column
          prop="groupId"
          label="是否为发票组"
          align="left"
        >
          <template slot-scope="scope">
            <div>{{ scope.row.groupId ? "是" : "否" }}</div>
          </template>
        </el-table-column>
        <el-table-column
          label="开票方"
          prop="name"
          algin="left"
        />
        <el-table-column
          label="发票金额"
          prop="amount"
          algin="left"
        />
        <el-table-column
          label="开票日期"
          prop="date"
          algin="left"
        >
          <template
            slot-scope="scope"
          >
            <div>{{ formatDate(scope.row.date) }}</div>
          </template>
        </el-table-column>
      </JNPF-table>
      <div class="result-title">解析失败</div>
      <div class="result-error" v-for="item in fileList.filter(v=>v.status === 'error')" :key="item.uid">
        <i class="el-icon-document"></i><span style="margin-left: 5px">{{ item.name }}</span>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button v-if="step === 0" @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="confirmLoading" @click="onConfirm">{{ step === 0 ? '解析发票' : '关闭' }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getInvoiceDetail } from "@/api/business/pasteTicket";
import dayjs from "dayjs";
import { INVOICE_TYPE } from "@/views/pasteTicketCenter/component/invoiceData";

export default {
  name: "BatchUploadInvoice",
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    isAirTicket: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      step: 0,
      actionUrl: process.env.VUE_APP_BASE_API + "/api/cicada/CcdEntBill/upload",
      uploadHeaders: { Authorization: this.$store.getters.token },
      fileList: [],
      invoiceList: [],
      confirmLoading: false, // 列表loading
      uploading: false,
      uploadParams: { type: 'air_ticket' }
    }
  },
  computed: {
    INVOICE_TYPE() {
      return INVOICE_TYPE
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.step = 0;
        this.fileList = [];
        this.invoiceList = [];
        this.confirmLoading = false;
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.step === 0) {
        if (this.uploading) {
          return this.$message.error("正在上传中，请稍等...");
        }
        this.loadInvoiceResult();
      } else {
        this.updateVisible(false);
      }
    },
    updateVisible(val) {
      this.$emit('confirm')
      this.$emit('update:visible', val)
    },
    async loadInvoiceResult() {
      this.confirmLoading = true;
      this.invoiceList = [];
      for (let i = 0; i < this.fileList.length; i++) {
        let file = this.fileList[i];
        if (file.status === 'success' && file.code) {
          const res = await getInvoiceDetail(file.code);
          let entity = { ...res.data.object, ...res.data.entity, type: res.data.type };
          if (entity.groupId) {
            let list = res.data.inners;
            for (let j = 0; j < list.length; j++) {
              let item = list[j];
              this.invoiceList.push({ ...item.value, ...item.key, type: res.data.type })
            }
          } else {
            this.invoiceList.push(entity);
          }
        }
      }
      this.confirmLoading = false;
      this.step = 1;
      console.log("loadInvoiceResult", this.invoiceList);
    },
    handleSuccess(response, file) {
      console.log("handleSuccess", file);
      this.uploading = false;
      if (response.code == 200) {
        if (response.data) {
          this.$message.success("上传成功");
          file['code'] = response.data;
        } else {
          file.status = 'error'
          this.$message.error('上传失败');
        }
        console.log("handleSuccess", response);
      } else {
        file.status = 'error'
        this.$message.error(response.msg);
      }
      this.fileList.push(file);
      console.log("handleSuccess===fileList", this.fileList);
    },
    onBeforeRemove() {
      return false;
    },
    handleProgress(file) {
      console.log("handleProgress", file);
      this.uploading = true;
    },
    handleError(err) {
      this.uploading = false;
      console.log("handleError", err);
      this.$message.error(err);
    },
    // 把同一发票组的操作栏合并单元格
    // 这样做比直接筛选返回数据好点，因为总条数可以对的上；但如果同一发票组在两个页码都有，则会重复出现
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 3) {
        if (row.groupId && this.invoiceList.findIndex(v => v.groupId === row.groupId) === rowIndex) {
          return [this.invoiceList.filter(v => v.groupId === row.groupId).length, 1];
        } else if (row.groupId && this.invoiceList.findIndex(v => v.groupId === row.groupId) !== rowIndex) {
          return [0, 0];
        }
      }
    },
    formatDate(date) {
      return dayjs(date).format("YYYY-MM-DD");
    },
  }
}
</script>
<style scoped lang="scss">
.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.result-sum {
  font-size: 18px;
  font-weight: 500;
  color: #292C33;
}
.result-title {
  padding: 16px 0;
}
.result-error {
  padding-bottom: 10px;
}
.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
::v-deep .upload-container .el-upload .el-upload-dragger {
  width: 400px;
}
::v-deep .el-upload-list__item:hover .el-icon-close {
  display: none;
}
</style>
