<template>
  <el-dialog
    title="发票详情"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="622px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="dialog-content" v-loading="listLoading">
      <div class="item-invoice" v-for="(value, index) in detailDataList" :class="{'mt-12': index > 0}" :key="value.value.id">
        <div class="item-invoice-title">{{ title }}</div>
        <div class="item-invoice-map" v-for="item in dataStructure" :key="item.code">
          <div class="key">{{ item.label }}</div>
          <div class="value">{{ value.value[item.code] }}</div>
        </div>
      </div>
      <div class="invoice-file" v-for="(item, index) in invoiceFile" :key="item.id">
        <el-image v-if="item.isImg" :src="item.url" class="img" :preview-src-list="[item.url]" />
        <div v-else class="file-item" :class="{'mb-12': index < invoiceFile.length -1}" @click="previewOther(item)">
          <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/E1/CqDIk2VMpqWAUX0gAAADkvrIDd0808.png" alt="">
          <div class="item-title">{{ item.name }}</div>
          <div class="item-button" style="margin-left: auto">查看</div>
        </div>
      </div>
      <div class="invoice-file" v-if="invoiceCheckImgList.length > 0">
        <el-image v-for="(item, index) in invoiceCheckImgList" :key="index" :src="item.url" class="img" :preview-src-list="[item.url]" />
      </div>
    </div>
    <editInvoice :visible.sync="edit.visible" :data-structure="edit.dataStructure" :data="edit.data" :all-data="edit.allData" @confirm="initData" />
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </el-dialog>
</template>
<script>
import { getInvoiceDetail, CheckVoiceIdentity } from "@/api/business/pasteTicket";
import { INVOICE_DATA, INVOICE_TYPE } from "./invoiceData";
import { downloadFile, downloadFileBatch } from "@/api/business/signature";
import editInvoice from "./editInvoiceInfo";
import previewOnline from "@/components/preview-online/index.vue";

export default {
  name: 'personalInvoiceDetailDialog',
  components: { previewOnline, editInvoice },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // detailData: {},
      detailDataList: [],
      allData: {}, // 直接获取所有接口返回数据，为了编辑回传时用
      invoiceImg: "",
      invoiceFile: [],
      // invoiceCheckImg: "",
      invoiceCheckImgList: [],
      listLoading: false,
      edit: {
        visible: false,
        dataStructure: [],
        data: {},
        allData: {}
      },
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
    }
  },
  computed: {
    title() {
      return INVOICE_TYPE[this.allData.type];
    },
    // 因为发票组里只能有一种发票，因此直接取第一个就行
    dataStructure() {
      return INVOICE_DATA[this.allData.type];
    },
  },
  watch: {
    visible(n) {
      if (n) {
        this.initData();
      }
    }
  },
  methods: {
    initData() {
      this.listLoading = true;
      getInvoiceDetail(this.data.id).then(async res => {
        // this.detailData = { ...res.data.object, type: res.data.type };
        // this.allData = res.data;
        // console.log("数据", this.detailData);
        // // 加载发票、和查验凭证图片
        // await downloadFile(res.data.entity.imgFid).then(res2 => {
        //   this.invoiceImg = res2.data.url;
        // });
        // if (res.data.entity.chectFid) {
        //   await downloadFile(res.data.entity.chectFid).then(res3 => {
        //     this.invoiceCheckImg = res3.data.url;
        //   });
        // }
        // 加载发票,发票的图片每张都一样
        let fileIds = res.data.entity.fid ? res.data.entity.fid.split(',') : [];
        this.invoiceFile = []
        for (let i = 0; i < fileIds.length; i++) {
          await downloadFile(fileIds[i]).then(res2 => {
            this.invoiceFile.push(
              { id: fileIds[i], name: res2.data.name, url: res2.data.url, isImg: ["jpg", "png", "jpeg"].includes(res2.data.fileExtension) }
            )
          });
        }
        this.allData = res.data;
        this.detailDataList = [];
        // 判断一下是否是发票组，发票组中有多个发票
        if (!this.data.groupId) {
          // 不是发票组
          this.detailDataList.push({ key: { ...res.data.entity }, value: { ...res.data.object, type: res.data.type }});
          // 发票查验凭证最多只有一张CheckVoiceIdentity
          // if (res.data.entity.chectFid) {
          //   await downloadFile(res.data.entity.chectFid).then(res3 => {
          //     this.invoiceCheckImgList.push(res3.data);
          //   });
          // }
          if (this.data.checkStatus == "1") {
            await CheckVoiceIdentity(this.data.id).then(async r => {
              if (r.data) {
                await downloadFile(r.data).then(res3 => {
                  this.invoiceCheckImgList.push(res3.data);
                });
              }
            });
          }
        } else {
          // 是发票组
          this.detailDataList = res.data.inners.map(v => ({ key: { ...v.key }, value: { ...v.value, type: res.data.type }}));
          // 发票查验凭证有多张
          const numList = res.data.inners.filter(v => !!v.key.chectFid).map(v => v.key.chectFid);
          if (numList.length > 0) {
            const arr = (await downloadFileBatch(numList.join(","))).data || [];
            this.invoiceCheckImgList = [...arr];
          }
        }
      }).finally(() => {
        this.listLoading = false;
      });
    },
    resetData() {
      this.invoiceCheckImgList = [];
      this.invoiceFile = [];
      this.detailDataList = [];
    },
    updateVisible(val) {
      this.resetData();
      this.$emit('update:visible', val);
    },
    async openEidtDialog(item) {
      // item为this.detailDataList中要修改的元素，其中key的值为发票entity，value的值为发票object
      if (item.key.checkStatus !== 1 && !item.key.holderName) {
        Object.assign(this.edit, { visible: true, dataStructure: this.dataStructure, data: item.value, allData: this.allData });
      } else {
        this.$message.warning("仅支持未查验成功且未关联持有人的发票进行修改");
      }
    },
    // 预览其他在线文件
    previewOther(item) {
      Object.assign(this.preview, { visible: true, fileUrl: item.src || item.url, fileTitle: item.title || item.name });
    },
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 20px 20px !important;
}
.topRightButton {
  position: absolute;
  top: 0;
  right: 0;
}
.mt-12 {
  margin-top: 12px;
}
.mb-12 {
  margin-bottom: 12px;
}
.file-item {
  height: 56px;
  background: #F4F6FA;
  padding: 10px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 8px;
  .icon {
    width: 20px;
    height: 20px;
    margin-right: 3px;
    margin-bottom: 3px;
  }
  .item-title {
    line-height: 20px;
    font-weight: bold;
    color: #292C33;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-button {
    word-break: keep-all;
    line-height: 20px;
    color: #00B4C4;
  }
}
.item-invoice {
  border-radius: 12px;
  border: 1px solid #EDEFF2;
  padding: 0 20px 16px 12px;
  .item-invoice-title {
    font-weight: 500;
    font-size: 16px;
    color: #292C33;
    line-height: 22px;
    padding: 16px 0;
    border-bottom: 1px dashed #E8ECF2;
  }
  .item-invoice-map {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    .key {
      font-weight: 400;
      font-size: 14px;
      color: #919499;
      line-height: 20px;
    }
    .value {
      font-weight: 400;
      font-size: 14px;
      color: #292C33;
      line-height: 20px;
    }
  }
}
.invoice-file {
  border-radius: 12px;
  border: 1px solid #EDEFF2;
  padding: 20px 16px;
  margin-top: 12px;
}
</style>
