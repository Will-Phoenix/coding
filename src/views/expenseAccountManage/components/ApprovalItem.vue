<template>
  <!--  <el-card>-->
  <!--    <div slot="header">-->
  <!--      <h4 class="title">{{ data.title }}</h4>-->
  <!--    </div>-->
  <!--    <print-template-detail-->
  <!--      t="print-template-detail"-->
  <!--      v-if="templateDetail.printTemplate"-->
  <!--      ref="printTemplateDetail"-->
  <!--      :page-param="templateDetail.pageParam"-->
  <!--      :print-template="templateDetail.printTemplate"-->
  <!--      :data="printData"-->
  <!--      :stamp-list="stampTableData"-->
  <!--      :sign-list="signTableData"-->
  <!--      :draggable="false"-->
  <!--      :background="background"-->
  <!--    />-->
  <!--  </el-card>-->
  <div style="margin-bottom: 20px">
    <h4 style="margin-bottom: 10px">{{ data.title }}</h4>
    <print-template-detail
      t="print-template-detail"
      v-if="templateDetail.printTemplate"
      ref="printTemplateDetail"
      :page-param="templateDetail.pageParam"
      :print-template="templateDetail.printTemplate"
      :data="printData"
      :stamp-list="stampTableData"
      :sign-list="signTableData"
      :draggable="false"
      :background="background"
    />
  </div>

</template>
<script>
import PrintTemplateDetail from '@/components/Cicada/PrintTemplateDetail.vue'
import singlePrintMixin from '@/mixins/print/singlePrintMixin'

export default {
  name: "ApprovalItem",
  components: { PrintTemplateDetail },
  mixins: [singlePrintMixin],
  props: {
    data: {
      type: Object,
      default: () => ({
        // basePrintdevId: "",
        // orderId: "",
        // title: "报销单页",
        // orderType: "",
      })
    },
    background: {
      type: String,
    },
  },
  data() {
    return {};
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.init();
      }
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      if (this.data.basePrintdevId) {
        this.templateId = this.data.basePrintdevId;
        this.formId = this.data.orderId;
        this.orderType = this.data.orderType;
        this.additionPrintId = this.data.additionPrintId || null;
        this.includeTaskInfo = true;
        this.loadData()
      }
    },
    toBlob() {
      return this.$refs.printTemplateDetail.toBlob()
    }
  }
};
</script>
