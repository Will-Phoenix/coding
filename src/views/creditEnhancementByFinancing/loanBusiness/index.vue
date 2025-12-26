<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="top">
          <div class="title">常规贷款业务</div>
          <div class="tabList">
            <div class="flex">
              <div>
                <div class="desc1">总贷款数</div>
                <div class="desc3">4,770,000元</div>
              </div>
            </div>
            <div class="tabCard">
              <div>
                <div class="desc1">已达成</div>
                <div class="desc2">1笔</div>
              </div>
              <img class="icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/3561e419-a1c4-496e-b33d-a2341bacac00.png" />
            </div>
            <div class="tabCard">
              <div>
                <div class="desc1">待对接</div>
                <div class="desc2">0笔</div>
              </div>
              <img class="icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/e82d257b-533d-4b5e-a82f-cbc84348e0cd.png" />
            </div>
            <div class="tabCard">
              <div>
                <div class="desc1">对接中</div>
                <div class="desc2">1笔</div>
              </div>
              <img class="icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/a8016027-fa1e-4f46-966e-2f42bcba0c94.png" />
            </div>
            <div class="tabCard">
              <div>
                <div class="desc1">已驳回</div>
                <div class="desc2">0笔</div>
              </div>
              <img class="icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/865668ff-a55f-400f-9deb-63451f43ad24.png" />
            </div>
          </div>
        </div>
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8" v-if="userInfo.organizeIdList && userInfo.organizeIdList.length === 1">
                <el-form-item label="企业名称" prop="entId">
                  <el-input v-model="query.entId" placeholder="请输入企业名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="担保类型" prop="type">
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
              <el-col :span="3" class="align">
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button type="primary" @click="onReset">重置</el-button>
              </el-col>
            </div>
          </el-form>
        </div>
        <div class="custom-vxe-table-container custom-vxe-table-container-1">
          <vxe-table
            resizable
            stripe
            size="small"
            ref="xTable"
            :data="list"
            :loading="listLoading"
            class="custom-vxe-table"
            style="margin: 0 20px"
            max-height="100%"
            min-height="10px"
          >
            <vxe-column type="seq" title="序号" width="68" />
            <vxe-column field="deptNo" title="放贷编号" min-width="200" />
            <vxe-column field="entName" title="企业名称" min-width="200">
              <!--            <template #default="{row}">-->
              <!--              <span class="type-container">{{ row.flowName }}</span>-->
              <!--            </template>-->
            </vxe-column>
            <vxe-column field="area" title="企业所属区域" min-width="150" />
            <vxe-column field="ways" title="贷款产品" min-width="100" />
            <vxe-column field="money" title="贷款金额" min-width="50" />
            <vxe-column field="progress" title="贷款进度" min-width="100" />
            <vxe-column field="organization" title="对接机构" min-width="100" />
            <vxe-column field="status" title="需求状态" min-width="100" />
            <vxe-column field="applyTime" title="申请时间" min-width="100" />
          </vxe-table>
        </div>
        <pagination class="custom-jnpf-pagination" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" layout="prev, pager, next" background @pagination="initData" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      query: {
        entId: "",
        type: ""
      },
      typeOptions: [], // 报销单类型选项
      listQuery: {
        current: 1,
        size: 20,
      },
      entOption: [], // 企业选项
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
  },
  created() {
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
      this.list = [
        {
          deptNo: "ELO1733819434672990",
          entName: "河南丰锂新能源科技股份有限公司",
          area: "河南省-三门峡市-义马市",
          ways: "一般流动资金贷款",
          money: "1,950,000元",
          progress: "65%",
          organization: "河南义马农村商业银行股份有限公司",
          status: "对接中",
          applyTime: "2025-03-27"
        },
        {
          deptNo: "ELO1741685006295813",
          entName: "河南昌盛铜业有限公司",
          area: "河南省-三门峡市-湖滨区",
          ways: "小微易贷",
          money: "2,820,000元",
          progress: "100%",
          organization: "邮储银行三门峡分行",
          status: "已完成",
          applyTime: "2025-03-11"
        }
      ].filter(v => (!this.query.entId || v.entName.includes(this.query.entId)) && (!this.query.type || v.ways.includes(this.query.type)));
    },
    goToDetail(row, index) {
    },
    refreshOnActive() {
      this.initData();
    },
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
.top {
  margin: 20px;
}
.title {
  margin-bottom: 20px;
}
.tabList {
  display: flex;
  align-items: center;
  margin-left: 10px;
  .flex {
    width: 202px;
    height: 72px;
    margin-right: 20px;
    padding: 12px 16px 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
  }
  .tabCard {
    background-image: url("https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/082511d4-59d8-40a4-b22b-4418e15a14b8.png");
    background-size: 100%;
    width: 202px;
    height: 72px;
    margin-right: 20px;
    padding: 12px 16px 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
  }

  .desc1 {
    font-size: 12px;
    color: #5C5F66;
    line-height: 14px;
    margin-bottom: 3px;
  }

  .desc2 {
    font-weight: bold;
    font-size: 20px;
    color: #00B4C4;
    line-height: 28px;
  }

  .desc3 {
    font-weight: bold;
    font-size: 24px;
    color: #292C33;
    line-height: 33px;
  }

  .icon {
    width: 38px;
    height: 38px;
  }
}
</style>
