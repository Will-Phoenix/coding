<template>
  <el-dialog
    title="发票详情"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="50%"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div v-loading="listLoading">
      <h2 class="mg-b20">{{ title }}</h2>
      <el-descriptions v-for="(value, index) in detailDataList" :key="value.value.id" :title="detailDataList.length === 1 ? '' : `发票${index + 1}`" class="mg-b20" border>
        <template slot="extra">
          <el-button v-if="editable" type="primary" @click="openEidtDialog(value)">修改发票信息</el-button>
        </template>
        <el-descriptions-item v-for="item in dataStructure" :key="item.code" :label="item.label">{{ value.value[item.code] }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px">
        <h3 class="mg-b20">发票文件</h3>
        <div v-for="item in invoiceFile" :key="item.id">
          <el-image v-if="item.isImg" :src="item.url" class="img" :preview-src-list="[item.url]" />
          <div v-else class="file-item" @click="previewOther(item)">
            <img class="icon" src="https://image.smxzhcs.cn/smxsc/M00/2C/E1/CqDIk2VMpqWAUX0gAAADkvrIDd0808.png" alt="">
            <div class="item-title">{{ item.name }}</div>
            <div class="item-button" style="margin-left: auto">查看</div>
          </div>
        </div>
      </div>
      <div style="margin-top: 20px" v-if="invoiceCheckImgList.length > 0">
        <h3 class="mg-b20">查验凭证</h3>
        <el-image v-for="(item, index) in invoiceCheckImgList" :key="index" :src="item.url" class="img" :preview-src-list="[item.url]" />
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">关 闭</el-button>
    </span>
    <editInvoice :visible.sync="edit.visible" :data-structure="edit.dataStructure" :data="edit.data" :all-data="edit.allData" @confirm="initData" />
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </el-dialog>
</template>
<script>
import { getInvoiceDetail } from "@/api/business/pasteTicket";
import { INVOICE_DATA, INVOICE_TYPE } from "./invoiceData";
import { downloadFile, downloadFileBatch } from "@/api/business/signature";
import editInvoice from "./editInvoiceInfo";
import previewOnline from "@/components/preview-online/index.vue";

export default {
  name: 'invoiceDetailDialog',
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
          // 发票查验凭证最多只有一张
          if (res.data.entity.chectFid) {
            await downloadFile(res.data.entity.chectFid).then(res3 => {
              this.invoiceCheckImgList.push(res3.data);
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
      if (item.key.checkStatus !== 1) {
        Object.assign(this.edit, { visible: true, dataStructure: this.dataStructure, data: item.value, allData: this.allData });
      } else {
        this.$message.warning("仅支持未查验成功的发票进行修改");
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
.topRightButton {
  position: absolute;
  top: 0;
  right: 0;
}
.mg-b20 {
  margin-bottom: 20px;
}
.file-item {
  width: max(calc(70% - 5px), 180px);
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
</style>
