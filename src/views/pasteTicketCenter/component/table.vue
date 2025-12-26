<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main" v-loading="printLoading" element-loading-text="打印加载中，请稍后">
        <div class="content">
          <div>{{ status === 0 ? "待贴票报销单总数：" : "已贴票报销单总数：" }}</div>
          <h3>{{ total }}</h3>
        </div>
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8" v-if="userInfo.organizeIdList && userInfo.organizeIdList.length === 1">
                <el-form-item label="企业名称" prop="entId">
                  <!--                  <el-input v-model="query.entId" placeholder="请输入企业名称"/>-->
                  <el-cascader
                    v-model="query.entId"
                    placeholder="请选择企业"
                    :options="entOption"
                    :props="defaultProps"
                    :show-all-levels="false"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="申请月份" prop="applyMonth">
                  <el-date-picker
                    v-model="query.applyMonth"
                    type="month"
                    placeholder="选择月"
                    value-format="yyyy-MM"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报销人" prop="exsPeople">
                  <el-input v-model="query.exsPeople" placeholder="请输入姓名、电话号码" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报销单类型" prop="type">
                  <el-select v-model="query.type" placeholder="请选择..." style="width: 100%">
                    <el-option
                      v-for="item in typeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-col :span="12">
                  <el-form-item label="报销金额" prop="minAmount">
                    <!--                    <el-input v-model="query.minAmount" placeholder="请输入最低金额" />-->
                    <el-input-number v-model="query.minAmount" :min="1" :max="999999999" placeholder="请输入最低金额" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <div style="text-align: center; padding-top: 6px">至</div>
                </el-col>
                <el-col :span="8">
                  <el-form-item prop="maxAmount" label-width="auto">
                    <!--                    <el-input v-model="query.maxAmount" placeholder="请输入最高金额" />-->
                    <el-input-number v-model="query.maxAmount" :min="1" :max="999999999" placeholder="请输入最高金额" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-col>
              <el-col :span="10">
                <el-col :span="9">
                  <el-form-item label="记账凭证" prop="voucherYear">
                    <el-input-number v-model="query.voucherYear" placeholder="年份" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <div style="text-align: center; padding-top: 6px">年</div>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="voucherMonth" label-width="auto">
                    <el-input-number v-model="query.voucherMonth" placeholder="月份" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <div style="text-align: center; padding-top: 6px">月</div>
                </el-col>
                <el-col :span="6">
                  <el-form-item prop="voucherNo" label-width="auto">
                    <el-input-number v-model="query.voucherNo" placeholder="号" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <div style="text-align: center; padding-top: 6px">号</div>
                </el-col>
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

        <div class="btn">
          <el-button type="primary" @click="showBatchPrintDate = true">批量打印</el-button>
        </div>

        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            prop="name"
            label="报销单名称"
            align="left"
          />
          <el-table-column
            label="报销单类型"
            prop="bizFlowModuleName"
            algin="left"
          />
          <el-table-column
            label="记账凭证"
            algin="center"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.voucherYear">{{ scope.row.voucherYear }}年{{ scope.row.voucherMonth }}月记{{ scope.row.voucherNo }}号</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="userInfo.organizeIdList && userInfo.organizeIdList.length === 1"
            label="所属企业"
            prop="entName"
            algin="left"
          />
          <el-table-column
            label="报销人"
            prop="exsUserName"
            algin="left"
          />
          <el-table-column
            label="报销金额"
            prop="exsCost"
            algin="left"
          />
          <el-table-column
            label="报销人电话"
            prop="exsUserPhone"
            algin="left"
          />
          <el-table-column
            label="申请时间"
            prop="applyTime"
            algin="left"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="100"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="goToDetail(scope.row, scope.$index)"
              >票据详情
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
      <batchPrintDate :visible.sync="showBatchPrintDate" @confirm="batchPrint" />
    </div>
  </div>
</template>

<script>
import { getExsOrderCenterList, stickerTicketStatus } from "@/api/business/pasteTicket";
import { getOrganizeTree } from "@/api/permission/organize"
import { orderTypeSelect } from "@/api/business/expenseAccount";
import { mapGetters } from "vuex";
import baseMixin from '@/mixins/print/baseMixin';
import batchPrintDate from "./batchPrintDate";
import { printPdf } from '@/utils/pdf';
import { APIPostCreateBatchOrderPrintRecord } from "@/api/workFlow/FlowBefore";

export default {
  components: { batchPrintDate },
  mixins: [baseMixin],
  props: {
    // 贴票状态
    status: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      list: [],
      listLoading: true,
      total: 0,
      query: {
        entId: "",
        exsPeople: "",
        applyMonth: "",
        type: "",
        minAmount: undefined,
        maxAmount: undefined,
        voucherYear: undefined,
        voucherMonth: undefined,
        voucherNo: undefined
      },
      realQuery: {},
      typeOptions: [], // 报销单类型选项
      listQuery: {
        current: 1,
        size: 20,
      },
      formVisible: false,
      defaultProps: {
        label: "fullName",
        value: "id",
        children: "children",
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      entOption: [], // 企业选项
      showBatchPrintDate: false,
      printLoading: false, // 批量打印loading
      sortedIdList: [], // 存放需要批量打印的报销单id
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
  },
  created() {
    // 加载企业树
    getOrganizeTree().then(res => {
      this.entOption = res.data.list;
    });
    // 加载报销单类型
    orderTypeSelect({ type: 2, status: 1 }).then(res => {
      this.typeOptions = res.data.map(v => ({ label: v.name, value: v.id }))
    });
    this.initData();
  },
  methods: {
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
      this.query.entId = "";
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let query = {
        ...this.listQuery,
        ...this.query,
        stickerTicketStatus: this.status,
      };
      this.realQuery = query;
      // 处理一下企业数据格式，这个是当为票据中心时，企业的搜索
      if (query.entId) {
        query.entId = query.entId[query.entId.length - 1];
      }
      // 需要判断是票据中心，还是企业端
      // 票据中心可以不传企业id，但企业端必须传该用户所在企业的id；通过用户登录的userInfo中，组织list的元素个数，因为如果是企业元素个数一定大于1
      if (this.userInfo.organizeIdList && this.userInfo.organizeIdList.length > 1) {
        query.entId = this.userInfo.companyId;
      }
      getExsOrderCenterList(query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    goToDetail(row, index) {
      this.$router.push({
        path: "/expenseAccountDetail",
        query: {
          id: row.id,
          from: 2, // 1是报销单管理 2是票据中心 3预算管理 4归档管理
          queryData: JSON.stringify(this.realQuery), // 当前列表的查询条件
          listQuery: JSON.stringify(this.listQuery), // 当前数据在第几页，一页几个数据
          index: index, // 当前数据所在列的第几个，从0开始(下标)
        }
      });
    },
    batchPrint(val) {
      this.printLoading = true;
      console.log("选择的年月：", val.voucherYearMonth);
      // 获取要打印年月的报销单
      let query = { current: 1, size: -1, applyMonth: val.voucherYearMonth, stickerTicketStatus: this.status };
      // 票据中心可以不传企业id，但企业端必须传该用户所在企业的id；通过用户登录的userInfo中，组织list的元素个数，因为如果是企业元素个数一定大于1
      if (this.userInfo.organizeIdList && this.userInfo.organizeIdList.length > 1) {
        query.entId = this.userInfo.companyId;
      }
      getExsOrderCenterList(query).then(async res => {
        // 排顺序：有凭证号的报销单，按照凭证号从小到大排序；没有凭证号的，按照申请时间从小到大排序
        const list = [...res.data.records];
        const voucherList = list.filter(v => !!v.voucherNo);
        const noVoucherList = list.filter(v => !v.voucherNo);
        voucherList.sort((a, b) => {
          return new Date(`${a.voucherYear}-${a.voucherMonth}-${a.voucherNo}`) - new Date(`${b.voucherYear}-${b.voucherMonth}-${b.voucherNo}`);
        });
        noVoucherList.sort((a, b) => {
          return new Date(a.applyTime) - new Date(b.applyTime);
        });
        // 合并排序好的两个数组，只保留id
        console.log("排序后的数据：", [...voucherList, ...noVoucherList]);
        this.sortedIdList = [...voucherList, ...noVoucherList].map(v => v.id);
        // 批量打印
        const pdfList = await this.downloadAllByOrders(this.sortedIdList, false);
        this.intervalCancel = await printPdf(pdfList.map(v => v.pdfDocumentObj), this.finishPrint)
      })
        .finally(() => {
          this.printLoading = false;
        });
    },
    refreshOnActive() {
      this.initData();
    },
    finishPrint(error) {
      if (error) {
        console.log(error);
        return;
      }
      if (this.sortedIdList.length > 0) {
        const orderIds = [];
        for (let i = 0; i < this.sortedIdList.length; i++) {
          orderIds.push({ orderId: this.sortedIdList[i] });
        }
        APIPostCreateBatchOrderPrintRecord(orderIds);
        this.$confirm('是否将本次打印预览的报销单，标记为已贴票?', '提示', {
          type: 'warning'
        }).then(() => {
          stickerTicketStatus({ ids: this.sortedIdList, status: 1 }).then(() => {
            this.$message.success("操作成功");
            this.onSearch();
          });
        });
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
.btn {
  text-align: right;
  padding-right: 10px;
  margin-bottom: 20px;
}
</style>
