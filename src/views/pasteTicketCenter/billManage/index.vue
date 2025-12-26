<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="搜索" prop="searchKey">
                  <el-input v-model="query.searchKey" placeholder="请输入" />
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
        <div style="display: flex;flex-direction: row;justify-content: space-between;">
          <div class="buttonHead">
            <el-button size="small" type="primary" @click="batchAssociatedHolder" style="margin-right: 10px" :disabled="multipleSelection.length === 0">批量关联持有人</el-button>
            <el-button size="small" type="primary" @click="batchCheck" style="margin-right: 10px" :disabled="multipleSelection.length === 0">批量查询河南省手撕票</el-button>
          </div>
          <div class="buttonHead">
            <gpy-selector style="margin-right: 10px" @select="openGPY">高拍仪上传发票</gpy-selector>
            <el-upload
              :action="actionUrl"
              :file-list="fileList"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleSuccess"
              :on-error="handleError"
              :on-progress="handleProgress"
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <el-button size="small" type="primary" :loading="buttonLoading">上传发票</el-button>
            </el-upload>
          </div>
        </div>

        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
          :has-c="true"
          border
          :span-method="arraySpanMethod"
          @selection-change="selectionChange"
        >
          <el-table-column
            prop="typeLable"
            label="发票类型"
            align="left"
          />
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
            label="持有人姓名"
            prop="holderName"
            algin="left"
          />
          <el-table-column
            label="持有人手机号"
            prop="holderPhone"
            algin="left"
          />
          <el-table-column
            label="发票金额"
            prop="amount"
            algin="left"
          />
          <el-table-column
            label="查验状态"
            algin="left"
            :formatter="checkStatusMap"
          />
          <el-table-column
            label="开票日期"
            prop="date"
            algin="left"
          >
            <template slot-scope="scope">
              <div>{{ formatDate(scope.row.date) }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="300"
          >
            <template slot-scope="scope">
              <el-button
                v-if="buttonShow(scope.row) === 1"
                type="text"
                :loading="scope.row.loading"
                @click="checkVerify(scope.row)"
              >{{ scope.row.type === "vat_invoice" || scope.row.type === "quota_invoice"|| scope.row.type === 'train_ticket' ||
                scope.row.type === 'air_ticket' ? "发票查验" : "人工查验通过" }}
              </el-button>
              <el-button
                v-if="buttonShow(scope.row) === 2"
                type="text"
                :loading="scope.row.loading"
                @click="checkVerify(scope.row)"
              >重新查验
              </el-button>
              <el-button
                v-if="buttonShow(scope.row) === 3"
                type="text"
                @click="associatedHolder(scope.row)"
              >{{ !scope.row.holderName ? "关联发票持有人" : "变更发票持有人" }}
              </el-button>
              <el-button
                type="text"
                @click="goToDetail(scope.row)"
              >发票详情
              </el-button>
              <el-button
                type="text"
                @click="onDelete(scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
      <holderRefDialog :visible.sync="dialog.visible" :loading="dialog.loading" :data="dialog.data" @confirm="initData" />
      <gpy-dialog :visible.sync="gpy.visible" :loading="gpy.loading" :device-type="gpy.deviceType" @confirm="onConfirm" />
      <invoiceDetailDialog :visible.sync="detail.visible" :data="detail.data" />
      <invoiceCheckDialog :visible.sync="invoiceCheck.visible" :loading="invoiceCheck.loading" :data="invoiceCheck.data" @confirm="initData" />
      <batchInvoice :visible.sync="batchInvoceModel.visible" :data="batchInvoceModel.data" @confirm="initData" />
    </div>
  </div>
</template>

<script>
import { getBillCenterList, verification, checkToSuccess, deleteBill } from "@/api/business/pasteTicket";
import dayjs from "dayjs";
import holderRefDialog from "@/views/pasteTicketCenter/component/associatedHolderDialog";
import GpySelector from '@/views/pasteTicketCenter/component/GpySelector';
import GpyDialog from "@/views/pasteTicketCenter/component/GpyDialog";
import invoiceDetailDialog from "@/views/pasteTicketCenter/component/invoiceDetail";
import invoiceCheckDialog from "@/views/pasteTicketCenter/component/invoiceCheck";
import batchInvoice from "../component/batchInvoice.vue";
import { uploadBase64Data } from "@/utils/fileUtils";
import { mapGetters } from "vuex";

export default {
  name: "BillManage",
  components: { GpySelector, holderRefDialog, GpyDialog, invoiceDetailDialog, invoiceCheckDialog, batchInvoice },
  data() {
    return {
      list: [],
      listLoading: false, // 列表loading
      buttonLoading: false, // 上传列表loading
      total: 0,
      query: {
        searchKey: "",
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
      actionUrl: process.env.VUE_APP_BASE_API + "/api/cicada/CcdEntBillCenter/upload",
      uploadHeaders: { Authorization: this.$store.getters.token },
      fileList: [],
      multipleSelection: [],
      batchInvoceModel: {
        visible: false,
        data: []
      }
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
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

    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
        ...this.query,
      };
      // 发票中心不需要传企业id，直接查全部；财务人员需要传企业id，查所在企业的所有发票
      if (this.userInfo.organizeIdList && this.userInfo.organizeIdList.length > 1) {
        _query.entId = this.userInfo.companyId;
      }
      getBillCenterList(_query).then(res => {
        const records = res.data.ccdEntBillCenterPageChildPage.records;
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
          Object.assign(this.batchInvoceModel, {
            visible: true,
            data: this.list.filter(v => v.groupId === row.groupId && v.checkStatus !== 1)
          });
        } else {
          // 单张
          Object.assign(this.invoiceCheck, { visible: true, loading: false, data: row });
        }
        return;
      }
      row.loading = true;
      const method = row.type === "vat_invoice" ? verification : checkToSuccess;
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
      if (columnIndex === 10 || columnIndex === 4 || columnIndex === 0) {
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
      if (row.groupId) {
        // 发票组
        const uncheckCount = this.findSameGroupId(row.groupId).filter(v => !v.checkStatus).length;
        if (uncheckCount === 0) {
          return 3;
        } else if (uncheckCount === this.findSameGroupId(row.groupId).length) {
          return 1;
        } else {
          return 2;
        }
      } else {
        // 普通发票
        if (row.checkStatus === 0) {
          return 1;
        } else if (row.checkStatus === -1) {
          return 2;
        } else if (row.checkStatus === 1) {
          return 3;
        }
      }
    }
  }
}
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

.buttonHead {
  display: flex;
  align-items: center;
  padding: 14px 10px;
  flex-shrink: 0;
}
</style>
