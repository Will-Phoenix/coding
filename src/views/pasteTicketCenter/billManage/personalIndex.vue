<template>
  <div class="page-bill-manage-personal-index">
    <el-form :model="query" ref="formRef" label-width="70px" style="width: 100%">
      <div class="query-flex">
        <el-col style="width: 270px">
          <el-col :span="14">
            <el-form-item label="报销金额" prop="amountMin">
              <el-input-number v-model="query.amountMin" :min="1" :max="999999999" placeholder="最低金额" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <div style="text-align: center; padding-top: 6px">-</div>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="amountMax" label-width="auto">
              <el-input-number v-model="query.amountMax" :min="1" :max="999999999" placeholder="最高金额" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-col>
        <el-col style="width: 320px">
          <el-form-item label="开票日期" label-width="90px" prop="applyTime">
            <el-date-picker
              v-model="query.applyTime"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col style="width: 290px">
          <el-form-item label="开票方" label-width="80px" prop="name">
            <el-input v-model="query.name" placeholder="请输入名称/发票号码" />
          </el-form-item>
        </el-col>
        <el-col style="width: 150px">
          <el-form-item label-width="20px">
            <el-button type="primary" class="btn-search" @click="onSearch">查询</el-button>
            <el-button class="btn-reset" @click="onReset">重置</el-button>
          </el-form-item>
        </el-col>
      </div>
    </el-form>
    <div class="operate-container mg-b12">
      <el-radio-group v-model="status2" @input="onChangeTab2" text-color="#00B4C4" fill="#e5f7f9">
        <el-radio-button label="1">我的发票</el-radio-button>
        <el-radio-button label="2">共享给我的发票</el-radio-button>
      </el-radio-group>
    </div>
    <div class="operate-container">
      <el-radio-group v-model="status" @input="onChangeTab" text-color="#00B4C4" fill="#e5f7f9">
        <el-radio-button label="0">全部</el-radio-button>
        <el-radio-button label="1">未报销</el-radio-button>
        <el-radio-button label="2">已报销</el-radio-button>
      </el-radio-group>
      <el-button class="custom-btn-search" :loading="buttonLoading" @click="onUpload(false)">上传电子发票</el-button>
    </div>
    <div class="custom-vxe-table-container custom-vxe-table-container-1">
      <vxe-table
        resizable
        stripe
        border
        size="small"
        ref="xTable"
        :data="list"
        :loading="listLoading"
        :merge-cells="mergeCells"
        class="custom-vxe-table"
        max-height="100%"
      >
        <vxe-column type="seq" title="序号" width="68" />
        <vxe-column field="typeLable" title="发票类型" min-width="80" />
        <vxe-column field="code" title="发票号码" min-width="160" />
        <vxe-column field="holderName" title="持有人" min-width="200">
          <template #default="{row}">
            <el-tooltip v-if="row.holderName && row.holderName.split(',').length > 4" effect="dark" :content="row.holderName" placement="top">
              <span> {{ getHolderNameStr(row.holderName) }} </span>
            </el-tooltip>
            <span v-else>{{ row.holderName }}</span>
          </template>
        </vxe-column>
        <vxe-column field="groupId" title="是否为发票组" min-width="100">
          <template #default="{row}">
            <span>{{ row.groupId ? "是" : "否" }}</span>
          </template>
        </vxe-column>
        <vxe-column field="name" title="开票方" min-width="220" />
        <vxe-column field="amount" title="发票金额" min-width="100" />
        <vxe-column field="checkStatus" title="查验状态" min-width="100">
          <template #default="{row}">
            <span v-if="row.checkStatus == '1' || row.checkStatus == '2'" class="center-custom-status center-custom-status-success">{{ checkStatusMap(row) }}</span>
            <span v-else-if="row.checkStatus == '-1'" class="center-custom-status center-custom-status-red">{{ checkStatusMap(row) }}</span>
            <span v-else class="center-custom-status center-custom-status-orange">{{ checkStatusMap(row) }}</span>
          </template>
        </vxe-column>
        <vxe-column field="date" title="开票日期" min-width="100">
          <template #default="{row}">
            <span>{{ formatDate(row.date) }}</span>
          </template>
        </vxe-column>
        <vxe-column field="aiOrderName" title="推荐发票类型" min-width="120">
          <template #default="{row}">
            <span>{{ row.aiOrderName || '-' }}</span>
          </template>
        </vxe-column>
        <vxe-column field="action" title="操作" width="180" fixed="right">
          <template #default="{row}">
            <div class="custom-operate-btn-container">
              <div
                class="btn-link"
                @click="goToDetail(row)"
              >详情
              </div>
              <div class="btn-divider" />
              <div
                v-if="checkAIInvoice(row)"
                class="btn-link"
                @click="goAIInvoice(row)"
              >便捷报销
              </div>
              <div v-if="checkAIInvoice(row)" class="btn-divider" />
              <div
                v-if="checkAIInvoice(row)"
                class="btn-link"
                @click="goIgnore(row)"
              >忽略
              </div>
              <div v-if="checkAIInvoice(row)" class="btn-divider" />
              <div
                v-if="buttonShow(row) === 1"
                class="btn-link"
                @click="checkVerify(row)"
              >查验
              </div>
              <div
                v-if="buttonShow(row) === 2"
                class="btn-link"
                @click="checkVerify(row)"
              >再次查验
              </div>
              <div v-if="buttonShow(row) === 1 || buttonShow(row) === 2" class="btn-divider" />
              <el-dropdown>
                <i class="el-icon-more" style="color: #00B4C4;cursor: pointer"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <el-upload
                      v-if="buttonShow(row) === 1"
                      :action="checkFidActionUrl"
                      :show-file-list="false"
                      :on-success="onCheckFidUploadSuccess"
                      :on-error="onCheckFidUploadError"
                      :on-progress="onCheckFidUploadProgress"
                      :disabled="checkFidLoading"
                      :headers="uploadHeaders"
                      accept=".pdf,.jpg,.jpeg,.png"
                    >
                      <div v-if="buttonShow(row) === 1" class="btn-link" @click="onCheckFidUpload(row)">人工上传查验凭证</div>
                    </el-upload>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <div
                      class="btn-link"
                      @click="associatedHolder(row)"
                    >共享发票
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <div
                      class="btn-link"
                      @click="onDelete(row)"
                    >删除
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </template>
        </vxe-column>
      </vxe-table>
    </div>
    <pagination class="custom-jnpf-pagination" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" layout="prev, pager, next" background @pagination="initData" />
    <holderRefDialog :visible.sync="dialog.visible" :loading="dialog.loading" :data="dialog.data" @confirm="initData" :from="3" />
    <gpy-dialog :visible.sync="gpy.visible" :loading="gpy.loading" :device-type="gpy.deviceType" @confirm="onConfirm" />
    <personal-invoice-detail-dialog :visible.sync="detail.visible" :editable="false" :data="detail.data" />
    <invoiceCheckDialog :visible.sync="invoiceCheck.visible" :loading="invoiceCheck.loading" :data="invoiceCheck.data" :show-manual="false" @confirm="initData" />
    <batchInvoice :visible.sync="batchInvoceModel.visible" :data="batchInvoceModel.data" @confirm="initData" />
    <batch-upload-invoice :visible.sync="uploadInvoice.visible" :loading="uploadInvoice.loading" :is-air-ticket="uploadInvoice.isAirTicket" @confirm="initData" />
  </div>
</template>

<script>
import {
  verification,
  checkToSuccess,
  deleteBill,
  getCcdBillPage, reCheckIdentity, getMapFastApply, postCountByFastApply
} from "@/api/business/pasteTicket";
import dayjs from "dayjs";
import holderRefDialog from "@/views/pasteTicketCenter/component/associatedHolderDialog";
import GpyDialog from "@/views/pasteTicketCenter/component/GpyDialog";
import invoiceCheckDialog from "@/views/pasteTicketCenter/component/invoiceCheck";
import batchInvoice from "../component/batchInvoice.vue";
import { uploadBase64Data } from "@/utils/fileUtils";
import { mapGetters } from "vuex";
import BatchUploadInvoice from "@/views/pasteTicketCenter/billManage/components/BatchUploadInvoice.vue";
import PersonalInvoiceDetailDialog from "@/views/pasteTicketCenter/component/personalInvoiceDetail.vue";
import { getOrgInfo } from "@/api/workFlow/FlowBefore";

export default {
  name: "PersonalBillManage",
  components: { PersonalInvoiceDetailDialog, BatchUploadInvoice, holderRefDialog, GpyDialog, invoiceCheckDialog, batchInvoice },
  data() {
    return {
      status: "1",
      status2: "1",
      list: [],
      listLoading: false, // 列表loading
      buttonLoading: false, // 上传列表loading
      total: 0,
      query: {
        name: "",
        applyTime: undefined,
        amountMin: undefined,
        amountMax: undefined,
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      dialog: {
        visible: false,
        loading: false,
        data: {},
      },
      gpy: {
        visible: false,
        loading: false,
        deviceType: '1',
      },
      detail: {
        visible: false,
        data: {},
      },
      invoiceCheck: {
        visible: false,
        loading: false,
        data: {},
      },
      uploadInvoice: {
        visible: false,
        loading: false,
        isAirTicket: false,
      },
      actionUrl: process.env.VUE_APP_BASE_API + "/api/cicada/CcdEntBill/upload",
      uploadHeaders: { Authorization: this.$store.getters.token },
      checkFidActionUrl: process.env.VUE_APP_BASE_API + "/api/biz/ccdFile/uploader",
      checkFidLoading: false,
      reCheckInvoiceId: '',
      fileList: [],
      multipleSelection: [],
      batchInvoceModel: {
        visible: false,
        data: []
      },
      aiMap: {},
      isBillCheck: 0, // 企业是否开启发票查验功能：1开启 0关闭
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    mergeCells() {
      if (!this.list || this.list.length === 0) return []
      let rules = [];
      for (let i = 0; i < this.list.length; i++) {
        let cell = this.list[i];
        if (cell.groupId && this.list.findIndex(v => v.groupId === cell.groupId) === i) {
          rules.push({ row: i, col: 3, rowspan: this.list.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
          rules.push({ row: i, col: 8, rowspan: this.list.filter(v => v.groupId === cell.groupId).length, colspan: 1 })
        }
      }
      return rules;
    }
  },
  created() {
    this.initData();
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
    }
  },
  methods: {
    checkCompanyBillCheck() {
      getOrgInfo().then(res => {
        const isBillCheck = JSON.parse(res.data.propertyJson).billCheck;
        if (isBillCheck) {
          this.isBillCheck = isBillCheck;
        }
      });
    },
    onChangeTab() {
      this.onSearch();
    },
    onChangeTab2() {
      this.status = "1";
      this.onSearch();
    },
    checkStatusMap(row) {
      const statusMap = {
        '-1': '核验不通过',
        '0': '未核验',
        '1': '核验通过',
        '2': '个人核验通过',
      };
      if (row.checkType == "0" && row.checkStatus == "1") {
        return "人工核验通过"
      }
      return statusMap[row.checkStatus] || row.checkStatus;
    },
    formatDate(date) {
      return dayjs(date).format("YYYY-MM-DD");
    },
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      this.listQuery.current = 1;
      // 加载数据
      this.initData();
    },
    onUpload(isAirTicket) {
      this.uploadInvoice.visible = true;
      this.uploadInvoice.isAirTicket = isAirTicket;
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.query.applyTime = undefined;
      this.onSearch();
    },
    async initData() {
      this.checkCompanyBillCheck();
      this.aiMap = (await getMapFastApply()).data;
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
        billAndOrderIds: this.aiMap,
      };
      /* // 发票中心不需要传企业id，直接查全部；财务人员需要传企业id，查所在企业的所有发票
      if (this.userInfo.organizeIdList && this.userInfo.organizeIdList.length > 1) {
        _query.entId = this.userInfo.companyId;
      } */
      if (this.status === '1' || this.status === '2') {
        _query['reimbursementStatus'] = this.status * 1;
      }
      if (this.status2 === '2') {
        _query['shareFlag'] = 1;
      }
      if (startTime && endTime) {
        _query['startDate'] = startTime;
        _query['endDate'] = endTime;
      }
      delete _query.applyTime;
      getCcdBillPage(_query).then(res => {
        const records = res.data.ccdEntBillPageChildPage.records;
        // 添加按钮loading给每行数据
        records.forEach((v, index) => {
          v.loading = false
          // v.top = !!(v.holder)
          // 对于发票组的，非第一个的，禁用checkbox
          if (v.groupId && records.findIndex(item => item.groupId === v.groupId) !== index) {
            v.top = true;
          }
        });
        // // 查看数据中是否有同一组的发票，同一组的只显示第一个，这会导致请求数据条数对不上，但暂时无法解决
        // const newRecords = records.filter((item, index, self) => !item.groupId || self.findIndex(v => v.groupId === item.groupId) === index);
        this.list = records;
        this.total = res.data.totalSize;
        this.listLoading = false;
      });
    },
    goToDetail(row) {
      Object.assign(this.detail, { visible: true, data: row });
    },
    refreshLoading(v) {
      this.invoiceCheck.loading = v;
    },
    handleSuccess(response) {
      this.buttonLoading = false;
      if (response.code == 200) {
        this.$message.success("上传成功");
        this.initData();
      } else {
        this.$message.error(response.msg);
      }
    },
    handleProgress() {
      this.buttonLoading = true;
    },
    handleError(err) {
      this.buttonLoading = false;
      this.$message.success(err);
    },
    onCheckFidUpload(row) {
      this.reCheckInvoiceId = row.id
    },
    async onCheckFidUploadSuccess(response) {
      this.checkFidLoading = false;
      if (response.code == 200) {
        await reCheckIdentity({ id: this.reCheckInvoiceId, chectFid: response.data.id });
        this.$message.success("上传成功");
        this.initData();
      } else {
        this.$message.error(response.msg);
      }
    },
    onCheckFidUploadError(err) {
      this.checkFidLoading = false;
      this.$message.success(err);
    },
    onCheckFidUploadProgress() {
      this.checkFidLoading = true;
    },
    associatedHolder(row = {}) {
      Object.assign(this.dialog, { visible: true, loading: false, data: row });
    },
    // 批量关联发票持有人
    batchAssociatedHolder() {
      const filters = this.multipleSelection.filter(item => item.holder);
      if (filters && filters.length) {
        this.$message.error("所选数据中包含了已经关联过发票持有人的发票")
        return;
      }
      Object.assign(this.dialog, { visible: true, loading: false, data: this.multipleSelection });
    },
    // 批量查验
    batchCheck() {
      const filters = this.multipleSelection.filter(item => {
        if (item.name.indexOf('河南') != -1 && item.typeLable.indexOf('定额') != -1 && !item.checkStatus) {
          if (item.type == 'quota_invoice') {
            // 河南定额发票
            return false;
          }
        }
        return true;
      });
      if (filters && filters.length) {
        this.$message.error("请选择未查验过的河南省手撕票")
        return;
      }
      if (this.multipleSelection.length > 20) {
        this.$message.error("查验数量不能超过20")
      }
      Object.assign(this.batchInvoceModel, { visible: true, data: this.multipleSelection });
    },
    openGPY(deviceType) {
      Object.assign(this.gpy, { visible: true, loading: false, deviceType });
    },
    onDelete(row) {
      this.$confirm('确定要删除该发票?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteBill(row.id).then(() => {
          this.$message.success("删除成功");
          this.initData();
        });
      });
    },
    checkVerify(row) {
      if (row.type === "quota_invoice") {
        // 定额发票，要分情况：1. 普通一张发票的  2. 发票组的定额发票（类似批量河南定额发票）
        if (row.groupId) {
          // 发票组
          // 通过一张找到一组发票，且没有查验通过的
          Object.assign(this.batchInvoceModel, { visible: true, data: this.list.filter(v => v.groupId === row.groupId && v.checkStatus !== 1) });
        } else {
          // 单张
          Object.assign(this.invoiceCheck, { visible: true, loading: false, data: row });
        }
        return;
      }
      row.loading = true;
      const method = (row.type === "vat_invoice" || row.type === 'train_ticket' ||
        row.type === 'air_ticket' || row.type === 'social_group_dues' || row.type === 'non_tax_income') ? verification : checkToSuccess;
      method(row.id).then(() => {
        this.$message.success("操作成功");
      })
        .finally(() => {
          row.loading = false;
          this.initData();
        });
    },
    async onConfirm(picList) {
      this.gpy.loading = true;
      try {
        console.log('准备上传', picList);
        const errIndex = []; // 从1开始计数
        const successIndex = []; // 从1开始计数
        for (let i = 0; i < picList.length; i++) {
          const v = picList[i];
          const r = await uploadBase64Data(this.actionUrl, v, "文件.jpg", this.$store.getters.token);
          console.log('上传结果', r)
          if (r.data.code == 200) {
            successIndex.push(i + 1)
          } else {
            errIndex.push(i + 1)
          }
        }
        if (errIndex.length == 0) {
          this.$message.success("上传成功");
        } else if (successIndex.length == 0) {
          this.$message.error('上传失败')
        } else {
          this.$message.info(`第 ${successIndex.join('，')} 张图片上传成功，第 ${errIndex.join('，')} 张图片上传失败。`)
        }
        this.initData();
      } finally {
        Object.assign(this.gpy, { visible: false, loading: false });
      }
    },
    selectionChange(selection) {
      console.log("处理前已勾选：", selection);
      const newSelection = [];
      // 遍历selection，处理发票组：勾选其一组
      selection.forEach(v => {
        if (v.groupId) {
          // 发票组
          newSelection.push(...(this.findSameGroupId(v.groupId)));
        } else {
          // 普通发票
          newSelection.push(v);
        }
      });
      this.multipleSelection = newSelection;
      console.log("处理后已勾选：", this.multipleSelection);
    },
    // 把同一发票组的操作栏合并单元格
    // 这样做比直接筛选返回数据好点，因为总条数可以对的上；但如果同一发票组在两个页码都有，则会重复出现
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 8 || columnIndex === 3) {
        if (row.groupId && this.list.findIndex(v => v.groupId === row.groupId) === rowIndex) {
          return [this.list.filter(v => v.groupId === row.groupId).length, 1];
        } else if (row.groupId && this.list.findIndex(v => v.groupId === row.groupId) !== rowIndex) {
          return [0, 0];
        }
      }
    },
    // 找到一组发票
    findSameGroupId(groupId) {
      return this.list.filter(item => item.groupId === groupId);
    },
    // 是否显示发票查验按钮
    buttonShow(row) {
      // 1 查验按钮 2 重新查验按钮 3 关联发票持有人按钮
      if (row.checkStatus === 0 && this.isBillCheck === 1 && (row.type === "vat_invoice" || row.type === "quota_invoice" || row.type === 'train_ticket' ||
          row.type === 'air_ticket' || row.type === "social_group_dues" || row.type === "non_tax_income")) {
        return 1;
      } else if (row.checkStatus === -1 && this.isBillCheck === 1) {
        return 2;
      }
    },
    checkAIInvoice(row) {
      return this.aiMap && Object.keys(this.aiMap).length > 0 && Object.keys(this.aiMap).includes(row.id + '')
    },
    getHolderNameStr(holderName) {
      const arr = holderName.split(',')
      let str = ''
      for (let i = 0; i < 4; i++) {
        str += arr[i] + (i === 3 ? '' : ',');
      }
      str += '等' + arr.length + '人';
      return str;
    },
    goAIInvoice(row) {
      this.$router.push({ path: '/approval', query: { orderId: this.aiMap[row.id], billId: row.id }});
    },
    goIgnore(row) {
      this.$confirm('确定要忽略该发票?', '提示', {
        type: 'warning'
      }).then(() => {
        postCountByFastApply({ code: row.code }).then(() => {
          this.$message.success("忽略成功");
          this.initData();
        });
      });
    },
  }
}
</script>
<style lang="scss" scoped>
.page-bill-manage-personal-index {
  background-color: #ffffff;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  ::v-deep .el-form-item__label {
    font-weight: 400;
    font-size: 14px;
    color: #292C33;
  }
  ::v-deep .el-radio-button__inner {
    height: 35px;
    background: #F4F8F9;
    border-radius: 4px;
    border: none;
    font-weight: 400;
    font-size: 14px;
    color: #919499;
    line-height: 35px;
    padding: 0 12px;
    text-align: center;
    margin-right: 8px;
  }
  .operate-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .query-flex {
    display: flex;
    flex-wrap: wrap;
  }
}
.mg-b12 {
  margin-bottom: 12px;
}
</style>
