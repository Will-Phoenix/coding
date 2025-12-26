<template>
  <div>
    <el-image class="small" v-if="applyTemplateInfo.url" :src="applyTemplateInfo.url" :preview-src-list="[applyTemplateInfo.url]" />
    <i v-else class="el-icon-loading"></i>
  </div>
</template>
<script>
import baseMixin from '@/mixins/print/baseMixin'
import {
  getApplyOrder
} from "@/api/business/expenseAccount";

export default {
  name: 'ApprovalPrint',
  mixins: [baseMixin],
  props: {
    orderId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      applyTemplateInfo: {},
    }
  },
  created() {
    this.loadPageData();
  },
  methods: {
    async loadPageData() {
      this.loading = true;
      try {
        await this.getApplyOrderDetail();
      } finally {
        this.loading = false;
      }
    },
    getApplyOrderDetail() {
      this.applyFidsList = [];
      this.loading = true;
      getApplyOrder(this.orderId).then(async res => {
        let data = res.data;
        this.applyInfo = data;
        const result = await this.templateToImageDirectly(data.basePrintdevId, data.id, data.orderType);
        this.loading = false;
        this.applyTemplateInfo = {
          url: result.url,
          src: result.src,
          title: data.name,
        }
      }).catch(() => {
        this.loading = false;
      });
    },
  }
}
</script>
