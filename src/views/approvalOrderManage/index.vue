<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div
        class="JNPF-common-layout-main JNPF-flex-main tabs-with-extra"
        element-loading-text="处理中，请稍等"
      >
        <div class="JNPF-common-head">
          <el-form
            :model="query"
            ref="formRef"
            label-width="100px"
            style="width: 100%"
          >
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="申请日期" prop="applyMonth">
                  <el-date-picker
                    v-model="query.applyMonth"
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item
                  :label="type === '1' ? '发起人' : '报销人'"
                  prop="userName"
                >
                  <el-input v-model="query.userName" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="审批单类型" prop="categoryId">
                  <el-select
                    v-if="type === '1'"
                    v-model="query.categoryId"
                    placeholder="请选择..."
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in typeOptions1"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select
                    v-else
                    v-model="query.categoryId"
                    placeholder="请选择..."
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in typeOptions2"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </div>
            <el-col :span="24" class="align">
              <el-form-item>
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button type="primary" @click="onReset">重置</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </div>
        <el-tabs
          v-model="type"
          style="margin: 0 0 20px 20px"
          @tab-click="onChangeTab"
        >
          <el-tab-pane label="审批类单据" name="1">
            <approval-order-list
              ref="ref1"
              :query="query"
              type="1"
              @selection-change="onSelectionChange"
            />
          </el-tab-pane>
          <el-tab-pane label="报销类单据" name="2">
            <approval-order-list
              ref="ref2"
              :query="query"
              type="2"
              @selection-change="onSelectionChange"
            />
          </el-tab-pane>
        </el-tabs>
        <el-button
          class="tabs-extra-btn"
          type="info"
          size="mini"
          :loading="btnLoading"
          @click="openOptionalDialog()"
        >
          批量打印
        </el-button>
        <optionalBatchPrint
          :visible.sync="optionalBatchPrint.visible"
          :data="optionalBatchPrint.data"
          :func="loadPreviewUrl"
          @confirm="confirmPrint"
        />
      </div>
    </div>
  </div>
</template>

<script>
import baseMixin from "@/mixins/print/baseMixin";
import { getCcdOrderCategoryDropdown } from "@/api/business/approvalTypeManage";
import ApprovalOrderList from "@/views/approvalOrderManage/components/List.vue";
// import { batchPrint } from "@/views/expenseAccountManage/index.vue";
import optionalBatchPrint from "@/views/expenseAccountManage/components/optionalBatchPrint.vue";
import { printPdf } from "@/utils/pdf";

export default {
  name: "ApprovalOrderManageIndex",
  components: { ApprovalOrderList, optionalBatchPrint },
  mixins: [baseMixin],
  props: {
    propOrderId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      query: {
        applyMonth: undefined,
        categoryId: undefined,
        userName: undefined
      },
      type: "1",
      typeOptions1: [], // 审批类单据类型选项
      typeOptions2: [], // 报销类单据类型选项
      // showBatchPrintPriview: false,
      sortedIdList: [],
      optionalBatchPrint: {
        visible: false,
        data: []
      },
      btnLoading: false,
      orderId: []
    };
  },
  created() {
    getCcdOrderCategoryDropdown({ orderBizType: 1 }).then(res => {
      this.typeOptions1 = res.data.map(v => ({
        label: v.categoryName,
        value: v.id
      }));
    });
    getCcdOrderCategoryDropdown({ orderBizType: 2 }).then(res => {
      this.typeOptions2 = res.data.map(v => ({
        label: v.categoryName,
        value: v.id
      }));
    });
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.refreshList(false);
    }
  },
  methods: {
    onSelectionChange(val) {
      console.log("A 接收到 rows：", val);
      this.orderId = val.map(v => v.id);
      console.log("A 接收到 orderId：", this.orderId);
    },
    onChangeTab() {
      this.query.categoryId = undefined;
      this.refreshList(false);
    },
    refreshList(resetPageNum) {
      if (this.type === "1") {
        this.$refs.ref1.refresh(resetPageNum);
      } else {
        this.$refs.ref2.refresh(resetPageNum);
      }
    },
    // 搜索
    onSearch() {
      this.refreshList(true);
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.query.applyMonth = undefined;
      this.onSearch();
    },
    async openOptionalDialog() {
      this.btnLoading = true;
      const pdfList = await this.downloadAllByOrders(
        [...this.orderId],
        false
      );
      this.btnLoading = false;
      console.log("批量打印pdfList：index.vue", pdfList);
      Object.assign(this.optionalBatchPrint, { visible: true, data: pdfList });
    },
    async confirmPrint(pdfList) {
      this.intervalCancel = await printPdf(
        pdfList.map(v => v.pdfDocumentObj),
        this.finishPrint
      );
    },
    finishPrint(error) {
      if (error) {
        console.log(error);
        return;
      }
    }
  }
};
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

.sync-btn {
  text-align: right;
  padding-right: 10px;
}

::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}

.tabs-with-extra {
  position: relative;
}

/* 利用 header 的自身高度 */
.tabs-with-extra .tabs-extra-btn {
  position: absolute;
  right: 20px;
  top: calc(129.2px + 6px);
}
</style>
