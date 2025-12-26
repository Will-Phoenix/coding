<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="statistic">
        <div class="bar blue mg-r15">
          <div>
            <div class="desc">总企业数</div>
            <div class="number first-color">5</div>
          </div>
          <img src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/40d0e459-795c-469d-8e1b-765cea7855dc.png" class="icon" />
        </div>
        <div class="bar green mg-r15">
          <div>
            <div class="desc">一般纳税人企业</div>
            <div class="number second-color">0</div>
          </div>
          <img src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/dd59bcd5-52e5-4ffe-b26c-ca6dc26023aa.png" class="icon" />
        </div>
        <div class="bar orange">
          <div>
            <div class="desc">小规模纳税人企业</div>
            <div class="number third-color">5</div>
          </div>
          <img src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/4396bc2b-fba3-489f-9014-dd6a098ece5d.png" class="icon" />
        </div>
      </div>
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="6" v-if="userInfo.organizeIdList && userInfo.organizeIdList.length === 1">
                <el-form-item label="企业名称" prop="entId">
                  <el-input v-model="query.entId" placeholder="请输入企业名称" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="企业税号" prop="tax">
                  <el-input v-model="query.tax" placeholder="请输入企业税号" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="所属地区" prop="area">
                  <el-cascader
                    style="width: 100%"
                    v-model="query.area"
                    :options="areaTree"
                    placeholder="请选择所属地区"
                    clearable
                    filterable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="3" class="align">
                <el-button type="primary" @click="onSearch">查询</el-button>
                <el-button type="primary" @click="onReset">重置</el-button>
              </el-col>
            </div>
          </el-form>
        </div>

        <div class="btn">
          <el-button class="plain">未生产报告的企业批量生成</el-button>
          <el-button type="primary" @click="addEnt">新增企业</el-button>
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
          >
            <vxe-column type="seq" title="序号" width="68" />
            <vxe-column field="entName" title="企业名称" min-width="200" />
            <vxe-column field="tax" title="企业税号" min-width="100">
              <!--            <template #default="{row}">-->
              <!--              <span class="type-container">{{ row.flowName }}</span>-->
              <!--            </template>-->
            </vxe-column>
            <vxe-column field="name" title="法定代表人" min-width="100" />
            <vxe-column field="type" title="企业对接类型" min-width="100" />
            <vxe-column field="interfaceStatus" title="接口状态" min-width="50" />
            <vxe-column field="taxType" title="纳税性质" min-width="100" />
            <vxe-column field="entReport" title="企业报告" min-width="100" />
            <vxe-column field="reportTime" title="报告生成时间" min-width="100" />
            <vxe-column field="industry" title="所属行业" min-width="100" />
            <vxe-column field="action" title="操作" width="280" fixed="right">
              <template #default="{row}">
                <div class="custom-operate-btn-container">
                  <div
                    class="btn-link"
                    @click="updateReport(row)"
                  >更新企业报告
                  </div>
                  <div class="btn-divider"></div>
                  <div
                    class="btn-link"
                    @click="goToDetail(row)"
                  >查看企业报告
                  </div>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
        <pagination class="custom-jnpf-pagination" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" layout="prev, pager, next" background @pagination="initData" />
      </div>
      <ent-form ref="entForm" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import entForm from "./form";
import { entData } from "./entData";

export default {
  components: { entForm },
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      query: {
        entId: "",
        tax: "",
        area: ""
      },
      listQuery: {
        current: 1,
        size: 20,
      }
    }
  },
  computed: {
    ...mapGetters(["userInfo", "areaTree"]),
  },
  created() {
    this.initData();
    if (this.areaTree.length === 0) {
      this.$store.dispatch('generator/getAreaTree');
    }
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
      this.onSearch();
    },
    initData() {
      this.list = entData().filter(v => (!this.query.entId || v.entName.includes(this.query.entId)) && (!this.query.tax || v.tax.includes(this.query.tax)));
    },
    addEnt() {
      this.$nextTick(() => {
        this.$refs.entForm.init();
      });
    },
    updateReport(row) {
      this.$message.success("更新成功");
    },
    goToDetail(row) {
      this.$router.push({
        path: "/enterpriseManageDetail",
        query: {
          detailData: JSON.stringify(row)
        }
      });
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
.btn {
  margin: 0 20px;
  display: flex;
  align-items: center;
}
.plain {
  font-weight: bold;
  font-size: 12px;
  color: #00B4C4;
  background: #EBFDFF;
  margin-right: auto;
}
.statistic {
  /*height: 86px;*/
  background: #FFFFFF;
  margin-bottom: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  .blue {
    background: #F6F9FF;
  }
  .green {
    background: #ECF9FA;
  }
  .orange {
    background: #FEF9F5;
  }
  .bar {
    flex: 1;
    height: 72px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .icon {
      width: 48px;
      height: 48px;
      margin-right: 12px;
    }
    .desc {
      font-size: 12px;
      color: #5C5F66;
      line-height: 14px;
      margin-left: 21px;
    }
    .number {
      font-weight: bold;
      font-size: 24px;
      line-height: 33px;
      margin-top: 3px;
      margin-left: 20px;
    }
    .first-color {
      color: #3272F1;
    }
    .second-color {
      color: #00B4C4;
    }
    .third-color {
      color: #FA9754;
    }
  }
  .mg-r15 {
    margin-right: 15px;
  }
}
</style>
