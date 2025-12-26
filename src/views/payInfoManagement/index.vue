<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="120px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="20">
                <el-form-item label="当前账套" class="sobInfo">
                  <el-select v-model="query.sobId" placeholder="请选择...">
                    <el-option
                      v-for="item in sobOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      style="width: 400px"
                    />
                  </el-select>
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
              <!--              <el-col :span="8">
                <el-form-item label="推送金额百分比" prop="percent">
                  <el-input v-model="query.percent" placeholder="请输入" />
                </el-form-item>
              </el-col>-->
              <el-col :span="8">
                <el-form-item label="报销单名称" prop="name">
                  <el-input v-model="query.name" placeholder="请输入" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="报销人" prop="exsPeople">
                  <el-input v-model="query.exsPeople" placeholder="请输入姓名、电话号码" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-col :span="14">
                  <el-form-item label="报销金额" prop="minAmount">
                    <el-input-number v-model="query.minAmount" :min="1" :max="999999999" placeholder="请输入最低金额" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="2">
                  <div style="text-align: center; padding-top: 6px">至</div>
                </el-col>
                <el-col :span="8">
                  <el-form-item prop="maxAmount" label-width="auto">
                    <el-input-number v-model="query.maxAmount" :min="1" :max="999999999" placeholder="请输入最高金额" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-col>
              <el-col :span="8">
                <el-form-item label="审批完成时间" prop="finishTime">
                  <el-date-picker
                    v-model="query.finishTime"
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 100%"
                  />
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
        <el-tabs v-model="status" style="margin: 0 0 20px 20px" @tab-click="onChangeTab">
          <el-tab-pane label="未推送付款" name="noPush">
            <pay-info-list ref="noPushRef" :query="query" :status="0" />
          </el-tab-pane>
          <el-tab-pane label="已推送付款" name="push">
            <pay-info-list ref="pushRef" :query="query" :status="1" />
          </el-tab-pane>
          <el-tab-pane label="标记为处理完成" name="done">
            <pay-info-list ref="doneRef" :query="query" :status="2" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { orderTypeSelect } from "@/api/business/expenseAccount";
import { getCcdEntSobList } from "@/api/business/enterpriseAccountSetManagement";
import PayInfoList from "@/views/payInfoManagement/components/List.vue";

export default {
  name: 'payInfoManagement',
  components: { PayInfoList },
  data() {
    return {
      query: {
        sobId: "",
        type: "",
        name: "",
        exsPeople: "",
        minAmount: undefined,
        maxAmount: undefined,
        finishTime: undefined
      },
      status: "noPush",
      typeOptions: [], // 报销单类型选项
      sobOptions: [], // 账套选项
    }
  },
  created() {
    // 加载报销单类型
    orderTypeSelect({ type: 2 }).then(res => {
      this.typeOptions = res.data.map(v => ({ label: v.name, value: v.id }))
    });
    // 加载账套列表
    getCcdEntSobList().then(res => {
      this.sobOptions = res.data.map(v => ({ label: v.name, value: v.id }))
      if (this.sobOptions && this.sobOptions.length > 0) {
        this.query.sobId = this.sobOptions[0].value;
        this.onSearch();
      }
    });
  },
  methods: {
    // 搜索
    onSearch() {
      // 加载数据
      this.refreshList(true);
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.query.applyTime = undefined;
      this.query.finishTime = undefined;
      this.onSearch();
    },
    onChangeTab() {
      this.refreshList(false);
    },
    refreshList(resetPageNum) {
      if (this.status === "noPush") {
        this.$refs.noPushRef.refresh(resetPageNum);
      } else if (this.status === "push") {
        this.$refs.pushRef.refresh(resetPageNum);
      } else {
        this.$refs.doneRef.refresh(resetPageNum);
      }
    }
  },
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
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-right: 10px;
  padding-left: 20px;

  .sync-btn {
    margin-left: auto;
  }
}
.sobInfo {
  font-size: 16px;
  line-height: 22px;
  font-weight: bold;
  margin-right: 15px;
  margin-bottom: 20px;
  width: 100%;
  .el-select {
    width: 400px;
  }
}
::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
</style>
