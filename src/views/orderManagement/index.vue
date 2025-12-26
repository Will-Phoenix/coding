<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="top-container">
          <div class="top-item">
            <div class="key">申请发票企业数：</div>
            <div class="value">{{ statisticsData.openInvoiceEntNum }}</div>
          </div>
          <div class="top-item ml-80">
            <div class="key">已上传付款证明：</div>
            <div class="value">{{ statisticsData.uploadedPayProofNum }}</div>
          </div>
        </div>
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="订单号" prop="orderNo">
                  <el-input v-model="query.orderNo" placeholder="请输入订单号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="企业名称" prop="entName">
                  <el-input v-model="query.entName" placeholder="请输入企业名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="服务类型" prop="type">
                  <el-select v-model="query.type" placeholder="请选择..." style="width: 100%">
                    <el-option :key="1" label="企业使用期限" :value="1"></el-option>
                    <el-option :key="2" label="企业存储空间" :value="2"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="服务名称" prop="productId">
                  <el-select v-model="query.productId" placeholder="请选择..." style="width: 100%">
                    <el-option
                      v-for="item in serviceNameOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="发票申请" prop="invoiceStatus">
                  <el-select v-model="query.invoiceStatus" placeholder="请选择..." style="width: 100%">
                    <el-option :key="1" label="已申请" :value="1"></el-option>
                    <el-option :key="2" label="未申请" :value="0"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="合同是否上传" prop="contractStatus">
                  <el-select v-model="query.contractStatus" placeholder="请选择..." style="width: 100%">
                    <el-option :key="1" label="已上传" :value="1"></el-option>
                    <el-option :key="2" label="未上传" :value="0"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="客户付款证明" prop="payProveStatus">
                  <el-select v-model="query.payProveStatus" placeholder="请选择..." style="width: 100%">
                    <el-option :key="1" label="已上传" :value="1"></el-option>
                    <el-option :key="2" label="未上传" :value="0"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="订单状态" prop="status">
                  <el-select v-model="query.status" placeholder="请选择..." style="width: 100%">
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>
        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
          style="margin: 0 20px"
        >
          <el-table-column
            prop="entName"
            label="企业名称"
            min-width="120"
            align="left"
          />
          <el-table-column
            prop="orderNo"
            label="订单号"
            min-width="110"
            align="left"
          />
          <el-table-column
            prop="purchasePhone"
            label="购买方电话"
            min-width="100"
            align="left"
          />
          <el-table-column
            prop="openInvoiceStatus"
            label="是否申请开票"
            min-width="120"
            align="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.openInvoiceStatus === 1" class="text-red">是</span>
              <span v-else class="text-blue">否</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="payProveFid"
            label="客户付款证明"
            min-width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.payProveFid"
                type="text"
                @click="onPreview(scope.row.payProveFid)"
              >查看
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="bankReceiptFid"
            label="支付确认文件"
            min-width="120"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.bankReceiptFid"
                type="text"
                @click="onPreview(scope.row.bankReceiptFid)"
              >查看
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="invoiceFid"
            label="订单发票"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.invoiceFid"
                type="text"
                @click="onPreview(scope.row.invoiceFid)"
              >查看
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="price"
            label="订单金额"
            align="left"
          />
          <el-table-column
            prop="contractFid"
            label="订单合同"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.contractFid"
                type="text"
                @click="onPreview(scope.row.contractFid)"
              >查看
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="payStatus"
            label="支付状态"
            align="left"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.payStatus === 1">已付款</span>
              <span v-else>未付款</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="订单状态"
            align="left"
          >
            <template slot-scope="scope">
              <span>{{ getOrderStatusStr(scope.row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="serviceType"
            label="购买服务类型"
            min-width="120"
            align="left"
          />
          <el-table-column
            prop="serviceName"
            label="购买服务名称"
            min-width="120"
            align="left"
          />
          <el-table-column
            prop="createTime"
            label="创建订单时间"
            min-width="160"
            align="left"
          />
          <el-table-column
            label="操作"
            width="200"
            fixed="right"
          >
            <template slot-scope="scope">
              <div class="btn-container" v-if="scope.row.status !== 5">
                <el-button
                  class="btn"
                  type="text"
                  @click="onAdd(scope.row, 0)"
                >合同上传
                </el-button>
                <el-button
                  class="btn"
                  type="text"
                  v-if="!scope.row.bankReceiptFid"
                  @click="onAdd(scope.row, 1)"
                >支付确认
                </el-button>
                <el-button
                  class="btn"
                  type="text"
                  v-if="!scope.row.invoiceFid"
                  @click="onAdd(scope.row, 2)"
                >发票上传
                </el-button>
              </div>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <upload-order-file :visible.sync="dialog.visible" :data="dialog.data" :type="dialog.type" @confirm="initData" />
    <previewOnline :visible.sync="preview.visible" :file-url="preview.fileUrl" :file-title="preview.fileTitle" />
  </div>
</template>

<script>
import dayjs from "dayjs";
import UploadOrderFile from "@/views/orderManagement/components/uploadOrderFile.vue";
import { getOrderStatistic, getPageAllOrder, getProductInfoDropDown } from "@/api/business/orderManagement";
import previewOnline from "@/components/preview-online/index.vue";
import { downloadFile } from "@/api/business/signature";

export default {
  name: "OrderManagementIndex",
  components: { previewOnline, UploadOrderFile },
  data() {
    return {
      list: [],
      listLoading: false, // 列表loading
      buttonLoading: false, // 上传列表loading
      total: 0,
      query: {
        orderNo: undefined,
        entName: undefined,
        type: undefined,
        productId: undefined,
        invoiceStatus: undefined,
        contractStatus: undefined,
        payProveStatus: undefined,
        status: undefined,
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      dialog: {
        visible: false,
        data: {},
        type: 1,
      },
      statisticsData: {
        openInvoiceEntNum: 0,
        uploadedPayProofNum: 0
      },
      serviceNameOptions: [],
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
      statusOptions: [
        { label: '待签订合同', value: 1 },
        { label: '公对公转账', value: 2 },
        { label: '待开票', value: 3 },
        { label: '订单完成', value: 4 },
        { label: '订单取消', value: 5 },
      ]
    }
  },
  created() {
    this.initData();
    this.loadStatistics();
    this.loadDropDown();
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
      this.loadStatistics();
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
        _query['startDate'] = startTime;
        _query['endDate'] = endTime;
      }
      delete _query.applyTime;
      getPageAllOrder(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    loadStatistics() {
      getOrderStatistic().then(res => {
        this.statisticsData.openInvoiceEntNum = res.data.openInvoiceEntNum;
        this.statisticsData.uploadedPayProofNum = res.data.uploadedPayProofNum;
      })
    },
    loadDropDown() {
      getProductInfoDropDown().then(res => {
        this.serviceNameOptions = res.data.map(item => ({
          label: item.name,
          value: item.productId,
        }));
      })
    },
    onAdd(row, type) {
      this.dialog.type = type;
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
    getOrderStatusStr(status) {
      const statusItem = this.statusOptions.find(v => v.value === status)
      return (statusItem && statusItem.label) || ''
    }
  }
}
</script>
<style lang="scss" scoped>
.top-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20px 40px;
  .top-item {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: center;
    .key {
      font-weight: 500;
      word-break: keep-all;
    }
    .value {
      word-break: keep-all;
      margin-left: 4px;
    }
  }
  .ml-80 {
    margin-left: 80px;
  }
}
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
.text-red {
  color: red;
}
.text-blue {
  color: #1890ff;
}
</style>
