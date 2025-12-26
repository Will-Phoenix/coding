<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="spec">特殊日期规则</span>
      </div>
      <div class="notice">若特殊日期为6月1日至7月5日，则出差日期的开始日期和结束日期都必须在6月1日至7月5日时才能享受特殊日期标准，请开启该规则，若按天计算标准则关闭该规则</div>
      <div class="box-switch">
        <div class="tip-txt">出差日期的起始日期区间是否需要严格匹配特殊日期：</div>
        <el-switch
          active-text="启用"
          inactive-text="关闭"
          :active-value="1"
          :inactive-value="0"
          v-model="switchValue"
          @change="submitStrictMatch"
        />
      </div>
    </el-card>
    <el-tabs v-model="activeTabName" type="border-card" class="JNPF-el_tabs" @tab-click="handleClick">
      <el-tab-pane label="全局默认差旅规则" name="first">
        <div class="notice g-notice">未设置单独区域规则的地区，统一使用该规则进行差旅标准的计算</div>
        <div class="JNPF-common-layout-main JNPF-flex-main">
          <div class="JNPF-common-head">
            <div>
              <el-button type="primary" icon="el-icon-plus" @click="addOrUpdateBaseHandle()">新增全局默认规则
              </el-button>
            </div>
          </div>
          <div>
            <JNPF-table
              v-loading="listLoading"
              :data="list"
            >
              <el-table-column
                prop="positionName"
                label="岗位类型"
                align="left"
              />
              <el-table-column
                prop="accommodationFee"
                label="住宿标准费用（元）"
                align="left"
              />
              <el-table-column
                prop="foodAllowance"
                label="伙食补助费（元）"
                align="left"
              />
              <el-table-column
                prop="publicMiscellaneousFees"
                label="公杂费（元）"
                align="left"
              />
              <el-table-column
                label="操作"
                fixed="right"
                width="100"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    @click="addOrUpdateBaseHandle(scope.row.id, scope.row)"
                  >编辑
                  </el-button>
                  <el-button type="text" class="JNPF-table-delBtn" @click="handleDel(scope.row.id)">删除
                  </el-button>
                </template>
              </el-table-column>
            </JNPF-table>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="区域规则设置" name="second">
        <el-row class="JNPF-common-search-box" :gutter="16">
          <el-form :model="query">
            <el-col :span="6">
              <el-form-item label="所属地区" prop="areaName">
                <el-input placeholder="请输入省、市、县名称" v-model="query.areaName" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="search()">查询</el-button>
                <el-button icon="el-icon-refresh-right" @click="reset()">重置</el-button>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
        <div class="JNPF-common-layout-main JNPF-flex-main">
          <div class="JNPF-common-head">
            <div class="btn-container">
              <el-button type="primary" icon="el-icon-plus" @click="addOrUpdateHandle()">新增区域规则
              </el-button>
              <el-button type="primary" @click="dowloadTemplate()">下载导入模版</el-button>
              <div class="btn">
                <el-upload
                  class="mg-r"
                  :action="actionUrl"
                  :headers="uploadHeaders"
                  :on-success="uploadSuccess"
                  :on-error="uploadError"
                  :show-file-list="false"
                >
                  <el-button type="primary" icon="el-icon-plus">导入标准
                  </el-button>
                </el-upload>
              </div>
              <div class="btn-init" v-if="showInit">
                <el-button type="primary" @click="onInitTemplate">初始化差旅标准</el-button>
              </div>
            </div>
          </div>
          <div>
            <JNPF-table
              v-loading="listLoading"
              :data="list"
            >
              <el-table-column
                prop="areaChainName"
                label="所属地区"
                align="left"
              />
              <el-table-column
                prop="positionName"
                label="岗位类型"
                align="left"
              />
              <el-table-column
                prop="peekAllowance"
                label="住宿标准费用（元）"
                align="left"
              />
              <el-table-column
                prop="foodAllowance"
                label="伙食补助费（元）"
                align="left"
              />
              <el-table-column
                prop="publicMiscellaneousFees"
                label="公杂费（元）"
                align="left"
              />
              <el-table-column
                prop="peakSeasonfloatingDate1"
                label="旺季浮动区间1"
                align="left"
              />
              <el-table-column
                prop="peakSeasonFloatingRange1"
                label="旺季浮动区间1标准（元）"
                align="left"
              />
              <el-table-column
                prop="peakSeasonfloatingDate2"
                label="旺季浮动区间2"
                align="left"
              />
              <el-table-column
                prop="peakSeasonFloatingRange2"
                label="旺季浮动区间2标准（元）"
                align="left"
              />
              <el-table-column
                prop="peakSeasonfloatingDate3"
                label="旺季浮动区间3"
                align="left"
              />
              <el-table-column
                prop="peak_season_floating_range3"
                label="旺季浮动区间3标准（元）"
                align="left"
              />
              <el-table-column
                label="操作"
                fixed="right"
                width="100"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    @click="addOrUpdateHandle(scope.row.id, scope.row)"
                  >编辑
                  </el-button>
                  <el-button type="text" class="JNPF-table-delBtn" @click="handleRegionDel(scope.row.id)">删除
                  </el-button>
                </template>
              </el-table-column>
            </JNPF-table>
          </div>
          <!--          <pagination :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="initSecondTabData" />-->
        </div>
      </el-tab-pane>
    </el-tabs>
    <Base-Form v-if="baseFormVisible" ref="baseForm" @refresh="initData" />
    <JNPF-Form v-if="formVisible" ref="JNPFForm" @refresh="initSecondTabData" />
  </div>
</template>

<script>
import JNPFForm from './form'
import BaseForm from './baseForm'
import {
  getBaseRulesList,
  deleteBaseRules,
  getRegionRulesList,
  deleteRegionRules,
  syncJyjData
} from "@/api/business/travelRules";
import { createCcdBizRules, getCcdBizRulesDetail } from "@/api/business/traffic";
import { saveAs } from "file-saver";

export default {
  components: { JNPFForm, BaseForm },
  data() {
    return {
      activeTabName: 'first',
      query: {
        areaName: "",
      },
      switchValue: "", // 开关
      switchValueId: "",
      actionUrl: process.env.VUE_APP_BASE_API + "/api/cicada/ccdTravelFeesRules/imports",
      uploadHeaders: { Authorization: this.$store.getters.token },
      list: [],
      listLoading: true,
      total: 10,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
      },
      formVisible: false,
      baseFormVisible: false,
      showInit: false
    }
  },
  created() {
    this.initData();
    this.initSwicthData();
  },
  methods: {
    handleClick(tab) {
      if (tab.name === "first") {
        this.initData();
      } else if (tab.name === "second") {
        this.initSecondTabData();
      }
    },
    initData() {
      this.list = [];
      this.listLoading = true;
      getBaseRulesList().then(res => {
        this.list = res.data;
        this.listLoading = false;
      }
      );
    },
    initSecondTabData() {
      this.list = [];
      this.listLoading = true;
      getRegionRulesList(this.query).then(res => {
        this.list = res.data;
        this.showInit = this.list.length === 0;
        this.listLoading = false;
      }
      );
    },
    // 初始化严格校验
    initSwicthData() {
      getCcdBizRulesDetail().then(res => {
        res.data.forEach(v => {
          if (v.ruleKey === "is" && v.groupCode === "strictMatch") {
            this.switchValue = Number(v.ruleValue);
            this.switchValueId = v.id;
          }
        });
      });
    },
    // 删除全局规则
    handleDel(id) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteBaseRules({ id }).then(res => {
          this.$message({
            type: 'success',
            message: "操作成功",
            onClose: () => {
              this.initData();
            }
          });
        })
      }).catch(() => {
      });
    },
    // 删除区域规则
    handleRegionDel(id) {
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteRegionRules({ id }).then(res => {
          this.$message({
            type: 'success',
            message: "操作成功",
            onClose: () => {
              this.initSecondTabData();
            }
          });
        })
      }).catch(() => {
      });
    },
    // 导入文件成功后回调
    uploadSuccess(response, file, fileList) {
      if (response.code === 400) {
        this.$message({
          type: "error",
          message: response.msg,
          duration: 5000,
          showClose: true,
        });
      } else {
        this.$message({
          type: "success",
          message: "导入成功",
          duration: 1500,
          onClose: () => {
            this.initSecondTabData();
          }
        });
      }
    },

    // 导入文件失败后回调
    uploadError(err) {
      this.$message({
        type: "error",
        message: err,
      });
    },

    dowloadTemplate() {
      saveAs("https://image.smxzhcs.cn/smxsc/M00/2C/78/CqDIlGUM5c-AFDdaAAAhpGL5i_g11.xlsx", "区域规则导入模版.xlsx");
      this.$message.success("下载成功，请在浏览器下载列表查看");
    },
    onInitTemplate() {
      syncJyjData().then(() => {
        this.$message.success("初始化成功");
        this.initSecondTabData();
      })
    },
    // 严格规则校验开关-提交
    submitStrictMatch(value) {
      createCcdBizRules({ ruleKey: "is", groupCode: "strictMatch", ruleValue: value, id: this.switchValueId }).then(() => {
        this.$message.success("保存成功");
      });
    },
    addOrUpdateHandle(id, isDetail) {
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.JNPFForm.init(id, isDetail);
      })
    },
    addOrUpdateBaseHandle(id, isDetail) {
      this.baseFormVisible = true;
      this.$nextTick(() => {
        this.$refs.baseForm.init(id, isDetail)
      });
    },
    search() {
      this.listQuery.currentPage = 1
      this.listQuery.pageSize = 20
      this.initSecondTabData()
    },
    refresh(isrRefresh) {
      this.formVisible = false
      if (isrRefresh) this.reset()
    },
    reset() {
      for (let key in this.query) {
        this.query[key] = undefined
      }
      this.search()
    }
  }
}
</script>
<style lang="scss" scoped>
.app-container {
  padding: 0;
  background-color: transparent;
  overflow: auto;
}
::v-deep .el-card__header {
  padding: 12px 14px;
  border-bottom: 1px solid #e6ebf5;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: 15px;
  font-weight: 600;
}
.JNPF-common-search-box {
  background: alicgba(0,132,255,.04);
}
.JNPF-el_tabs {
  margin-top: 20px;
  height: auto;
}
.box-switch {
  display: flex;
  align-items: center;
  margin: 20px 0 10px 0;
}
.tip-txt {
  font-size: 14px;
  margin: 0 20px;
  font-weight: 600;
}
.notice {
  position: relative;
  line-height: 22px;
  background: rgba(#0084FF, 0.04);
  border-radius: 0px 2px 2px 0px;
  font-size: 14px;
  padding: 6px 14px;
  border-left: 3px solid #0084FF;
  color: #252F44;
}
.spec {
  position: relative;
  &::before {
    content: "";
    width: 22px;
    height: 22px;
    // background: -webkit-gradient(linear, left top, left bottom, from(#2B58D8), to(rgba(86, 144, 238, 0.4)));
    background: linear-gradient(180deg, #2B58D8 0%, rgba(86, 144, 238, 0.4) 100%);
    border-radius: 4px;
    opacity: .2;
    position: absolute;
    transform: rotate(45deg);
  }
}
.white-box {
  background: #fff;
  padding: 24px 10px;
  color: #555f73;
  font-size: 14px;
}
::v-deep .el-switch__label {
  color: #555f73;
}
.g-notice {
  background: rgba(#FC9A0F, 0.04);
  border-left: 3px solid #FC9A0F;
  margin: 5px 0 15px 0;
}
.btn {
  display: inline-block;
  margin-left: 10px;
}
.btn-container {
  display: flex;
  flex-direction: row;
  width: 100%;
}
.btn-init {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: right;
}
::v-deep .el-table--scrollable-y .el-table__body-wrapper {
  height: auto !important;
}
</style>
