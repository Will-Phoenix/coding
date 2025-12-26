<template>
  <div class="content-container" source="src/views/certificatesDetail/dialog.vue">
    <div class="JNPF-common-page-header head">
      <el-page-header @back="goBack()" content="凭证制单" />
      <div class="options">
        <el-button v-if="!readonly" type="default" @click="historyQuickSign">历史凭证快速记账</el-button>
        <el-button v-if="!readonly" type="primary" @click="onSaveAndPush">保存并推送凭证</el-button>
        <el-button v-if="!readonly && !isEdit" type="primary" @click="onSave">保存</el-button>
        <el-button v-if="readonly" type="primary" @click="toEdit">开启编辑</el-button>
        <el-button type="default" @click="goBack()">{{
          readonly ? "关闭" : "取消"
          }}</el-button>
      </div>
    </div>
    <div class="con-wrapper" :style="{ height: topHeight + '%' }">
      <CertificatesDetailIndex ref="cert" :data="data" :readonly="readonly" />
    </div>
    <div class="resize-handle" @mousedown.prevent="startDrag"></div>
    <div class="flex">
      <!--      <print-template-detail-->
      <!--        v-if="templateDetail && !loading"-->
      <!--        ref="printTemplateDetail"-->
      <!--        :page-param="templateDetail.pageParam"-->
      <!--        :print-template="templateDetail.printTemplate"-->
      <!--        :data="templateDetail.printData"-->
      <!--        :stamp-list="stampTableData"-->
      <!--        :sign-list="signTableData"-->
      <!--      />-->
      <detail :prop-order-id="data.id" />
    </div>
    <HistoryQuickSignDialog ref="historyQuickSignRef" v-if="showHistoryQuickSign"
      @historyQuickSign="historyQuickHandle" />
  </div>
</template>

<script>
import { saveOrUpdateCcdFinEntVoucher } from "@/api/business/youBIP";
import { finEntVoucherPush } from "@/api/business/expenseAccount";
import CertificatesDetailIndex from "./index.vue";
// import baseMixin from '@/mixins/print/baseMixin';
// import PrintTemplateDetail from '@/components/Cicada/PrintTemplateDetail.vue';
import detail from "@/views/expenseAccountManage/detail.vue";
import HistoryQuickSignDialog from "./components/HistoryQuickSignDialog.vue";

export default {
  name: "CertificatesDetailDialog",
  components: { CertificatesDetailIndex, detail, HistoryQuickSignDialog },
  // mixins: [baseMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // templateDetail: "", // 报销单模版
      // signTableData: "", // 签名
      // stampTableData: "", // 签章
      // loading: false // 报销单主页加载loading
      topHeight: 40, // 上分屏高度百分比
      isDragging: false,
      isEdit: false,
      showHistoryQuickSign: false,
      startY: 0,
      startHeight: 0,
    };
  },
  created() {
    // this.getExpenseData();
  },
  methods: {
    toEdit() {
      this.isEdit = true;
      this.$eventBus.$emit('changeReadonlyEventBus', false)
    },
    historyQuickHandle(row) {
      console.log(row);
      this.showHistoryQuickSign = false;
      this.$nextTick(() => {
        this.$refs.cert.useThisOrder(row);
      });
    },
    historyQuickSign() {
      this.showHistoryQuickSign = true;
      this.$nextTick(() => {
        this.$refs.historyQuickSignRef.init();
      });
    },
    // 仅保存
    async onSave() {
      try {
        const formData = await this.$refs.cert.collectData();
        console.log("收集到表单数据", formData);
        if (!formData) {
          return;
        }
        await saveOrUpdateCcdFinEntVoucher(
          this.data.id,
          this.data.voucherId,
          JSON.stringify(formData)
        );
        this.$message.success("保存成功");
        this.goBack(true);
      } catch (e) {
        console.warn(e);
      }
    },
    // 保存并推送
    async onSaveAndPush() {
      try {
        const formData = await this.$refs.cert.collectData();
        console.log("收集到表单数据", formData);
        if (!formData) {
          return;
        }
        const res = await saveOrUpdateCcdFinEntVoucher(
          this.data.id,
          this.data.voucherId,
          JSON.stringify(formData)
        );
        const voucherId = this.data.voucherId || (res.data || {}).voucherId;
        if (voucherId) {
          // 此处更新 voucherId 是为了保证在不关闭弹窗的情况下,继续编辑,然后再次点击保存或推送按钮时,调用的是编辑接口而不是新增.
          this.$set(this.data, "voucherId", voucherId);
          await finEntVoucherPush(voucherId);
          this.$message.success("推送成功");
        } else {
          this.$message.success("保存成功");
        }
        this.isEdit = false;
        this.goBack(true);
      } catch (e) {
        console.warn(e);
      }
    },
    // 关闭弹窗, flag:是否需要刷新页面数据
    goBack(flag = false) {
      this.$emit("close", flag);
    },
    startDrag(e) {
      this.isDragging = true;
      this.startY = e.clientY;
      this.startHeight = this.topHeight;

      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
      document.body.style.userSelect = "none"; // 防止拖动时选中文本
    },
    onDrag(e) {
      if (!this.isDragging) return;

      const container = this.$el.getBoundingClientRect();
      const deltaY = e.clientY - this.startY;
      const deltaPercent = (deltaY / container.height) * 100;

      let newHeight = this.startHeight + deltaPercent;
      // 计算新高度（限制在10%-80%之间）
      // newHeight = Math.max(10, Math.min(80, newHeight));

      this.topHeight = newHeight;
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
      document.body.style.userSelect = "";
    }
    // 实时渲染报销单主页----由于需求要求可以复制报销单上的内容，因此无法用图片
    // async getExpenseData() {
    //   this.loading = true;
    //   try {
    //     const { formData } = await this.loadFormDetail({ token: this.$store.getters.token, formId: this.data.id });
    //     // const result = await this.templateToImageDirectly(formData.basePrintdevId, this.data.id, formData.orderType);
    //     this.loadDataDetail({ token: this.$store.getters.token, templateId: formData.basePrintdevId, formId: this.data.id, orderType: formData.orderType, additionPrintId: "" }).then(res => {
    //       this.templateDetail = res.templateDetail;
    //       this.signTableData = res.signTableData;
    //       this.stampTableData = res.stampTableData;
    //     });
    //   } finally {
    //     this.loading = false;
    //   }
    // }
  }
};
</script>
<style lang="scss" scoped>
.content-container {
  /*display: flex;*/
  /*flex-direction: column;*/
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  z-index: 100;
  background: #eceef6;
  overflow-y: auto;
}

.head {
  background: #fff;
  width: 100%;
}

.con-wrapper {
  /*height: calc(100% - 65px);*/
  /*height: 40%;*/
  overflow: auto;
  transition: background 0.2s;
}

.flex {
  margin-top: 5px;
  /*flex: 1;*/
  height: 100vh;
  background: #fff;
  width: 100%;
  overflow: auto;
  transition: background 0.2s;
}

.resize-handle {
  margin-top: 5px;
  width: 100%;
  height: 5px;
  background: #dcdfe6;
  cursor: row-resize;
  transition: background 0.2s;

  &:hover {
    background: #409eff;
  }
}
</style>
