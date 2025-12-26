<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <el-card header="模板详情" shadow="hover">
        <div slot="header" style="display: flex">
          <span>模板详情</span>
          <el-button type="primary" style="margin-left: auto" :disabled="!(initCommonSubmitData && initCommonSubmitData !== JSON.stringify(commonSubmitData))" @click="submitCommonData">提交</el-button>
        </div>
        <div class="detail-line">
          <div class="kv">
            <span class="k">名称：</span>
            <span class="v">{{ commonSubmitData.name }}</span>
            <el-button type="text" size="small" class="opt" @click="onEditBaseInfo">编辑</el-button>
          </div>
          <div class="kv">
            <span class="k">已关联打印模板：</span>
            <span class="v">{{ commonSubmitData.basePrintDevName }}</span>
          </div>
          <div class="kv">
            <span class="k">已关联流程：</span>
            <span class="v">{{ commonSubmitData.flowTemplateName }}</span>
          </div>
          <el-button type="primary" size="mini" @click="openTemplateDialog({})">添加附件打印模版</el-button>
        </div>
      </el-card>
      <div class="JNPF-common-layout-main">
        <el-tabs v-model="editableTabsValue" class="tab-fix" type="card">
          <el-tab-pane
            :key="item.name"
            v-for="(item, index) in editableTabs"
            :label="item.title"
            :name="item.name"
          >
            {{ item.content }}
          </el-tab-pane>
        </el-tabs>
        <div class="JNPF-flex-main flex-row" v-if="editableTabs.length > 0">
          <div class="left-area">
            <el-card shadow="hover" style="height: 100%;">
              <div slot="header" class="head-bar">
                <span>用印位置管理</span>
                <span>
                  <el-button type="primary" size="mini" @click="removeTab(addtionPointId)" v-if="addtionPointId">删除模版</el-button>
                  <el-button type="text" size="mini" @click="toImg" v-if="!draggable">生成图片</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="$refs.printTemplateDetail.print()"
                    v-if="!draggable"
                  >打印</el-button>
                  <el-button type="text" size="mini" @click="draggable=false" v-if="draggable">取消</el-button>
                  <el-button
                    type="primary"
                    size="mini"
                    :loading="isLoadingSavePosition"
                    @click="savePosition"
                    v-if="draggable"
                  >保存位置</el-button>
                  <el-button type="primary" size="mini" @click="draggable=true" v-if="!draggable">编辑位置</el-button>
                </span>
              </div>
              <div v-loading="templateLoading">
                <print-template-detail
                  v-if="!templateLoading"
                  ref="printTemplateDetail"
                  :page-param="templateDetail.pageParam"
                  :print-template="templateDetail.printTemplate"
                  :stamp-list="stampTableData"
                  :sign-list="signTableData"
                  :draggable="draggable"
                />
              </div>
            </el-card>
          </div>
          <div class="right-area">
            <el-card shadow="hover">
              <div slot="header" class="head-bar">
                <span>用印管理</span>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="onEditStamp({})">添加用印</el-button>
              </div>
              <el-table :data="stampTableData" border size="mini" style="width: 100%" v-loading="StampLoading">
                <el-table-column type="index" width="35" />
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="nodeTitle" label="关联流程节点">
                  <!--                <template slot-scope="{row}">{{ flowMap[row.flow] }}</template>-->
                </el-table-column>
                <el-table-column prop="signSealName" label="关联印章">
                  <!--                <template slot-scope="{row}">{{ stampMap[row.stamp] }}</template>-->
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="85">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="onEditStamp(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="onDelStampOrSign(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
            <el-card shadow="hover" style="margin-top: 15px;">
              <div slot="header" class="head-bar">
                <span>个人签名管理</span>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="onEditSign({})">添加签名</el-button>
              </div>
              <el-table :data="signTableData" border size="mini" style="width: 100%" v-loading="signLoading">
                <el-table-column type="index" width="35" />
                <el-table-column prop="name" label="名称" />
                <el-table-column label="签名类型">
                  <template slot-scope="{row}">{{ row.signType === 1? "手写签名": row.signType === 2? "系统签名" : "手写签名组" }}</template>
                </el-table-column>
                <el-table-column label="是否展示签名意见">
                  <template slot-scope="{row}">{{ row.showOpinion === '1'? "是": "否" }}</template>
                </el-table-column>
                <el-table-column prop="nodeTitle" label="关联流程节点">
                  <!--                <template slot-scope="{row}">{{ flowMap[row.flow] }}</template>-->
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="85">
                  <template slot-scope="scope">
                    <el-button type="text" size="small" @click="onEditSign(scope.row)">编辑</el-button>
                    <el-button type="text" size="small" @click="onDelStampOrSign(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </div>
        <div class="JNPF-flex-main flex-row" v-if="data.type == 2">
          <div style="flex: 1">
            <el-card header="智能初审规则管理" shadow="hover">
              <div style="text-align: right">
                <el-button type="primary" style="margin: 10px;" @click="openRuleTableDialog()">关联规则</el-button>
              </div>
              <rulesTable v-if="showFlag" :rule-ids="rule.ruleIds" :rule-ids-list="rule.ruleIdsList" style="margin-top: -30px" />
            </el-card>
          </div>
        </div>
      </div>
    </div>
    <stamp-ref-dialog :visible.sync="stamp.visible" :data="stamp.data" :loading="stamp.loading" :flow-list="nodeList" :stamp-list="stampList" @confirm="onConfirmEditStamp" />
    <sign-ref-dialog :visible.sync="sign.visible" :data="sign.data" :loading="sign.loading" :flow-list="nodeList" @confirm="onConfirmEditSign" />
    <templateRefDialog :visible.sync="template.visible" :data="template.data" :loading="template.loading" :template-list="templateList" @confirm="onConfirmEditTemplate" />
    <business-Form ref="businessForm" @confirm="onConfirmBaseInfo" />
    <expense-Form ref="expenseForm" @confirm="onConfirmBaseInfo" />
    <associateRuleDialog :visible.sync="rule.visible" :rule-ids="rule.ruleIds" :rule-ids-list="rule.ruleIdsList" :biz-flow-module-id="data.id" @confirm="reloadTable" />
  </div>
</template>
<script>
import { saveAs } from "file-saver"
import StampRefDialog from '@/components/Cicada/StampRefDialog.vue'
import SignRefDialog from '@/components/Cicada/SignRefDialog.vue'
import templateRefDialog from "./templateRefDialog";
import PrintTemplateDetail from '@/components/Cicada/PrintTemplateDetail.vue'
import { getPrintDevInfo, getPrintDevList } from '@/api/system/printDev'
import businessForm from "@/views/businessApproval/form";
import expenseForm from "@/views/expenseTemplateManage/form";
import associateRuleDialog from "./associateRuleDialog";
import rulesTable from "./rulesTable";
import { getCcdBizFlowModuleDetail, getFlowModuleSignSealList, getNodeList, createFlowModuleSignSeal, updateFlowModuleSignSeal, deleteFlowModuleSignSeal, saveLocation, createAdditionPrint, updateAdditionPrint, deleteAdditionPrint, additionPrintList } from "@/api/business/businessApproval";
import { getCcdSignSealList, downloadFile } from "@/api/business/signature";
import { updateVersion } from "@/api/business/businessApproval";
import dayjs from 'dayjs'

export default {
  components: { PrintTemplateDetail, SignRefDialog, StampRefDialog, businessForm, expenseForm, templateRefDialog, associateRuleDialog, rulesTable },
  data() {
    return {
      stampTableData: [
        // { id: 1, name: "印章A", flow: "A", stamp: "1", image: 'https://image.smxzhcs.cn/smxsc/M00/2B/CC/CqDIlGSMMzSAF6B-AAG16Q47dYk892.png', styleJson: '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"60.28215767634855mm","left":"61.60995850622407mm","width":"7.966804979253112mm","height":"7.966804979253112mm"}' },
        // { id: 2, name: "印章B", flow: "B", stamp: "2", image: 'https://image.smxzhcs.cn/smxsc/M00/2C/4A/CqDIk2T1tIyAVvDlAAAp4R6YpdU186.png', styleJson: '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"48.33195020746888mm","left":"30.804979253112034mm","width":"11.153526970954356mm","height":"11.153526970954356mm"}' },
      ],
      signTableData: [
        // { id: 1, name: "签名C", flow: "B", style: '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"112.06639004149378mm","left":"164.38174273858922mm","width":"17.79253112033195mm","height":"7.625370480142282mm"}' }
      ],
      nodeList: [], // 该流程模型对应的各个节点
      stampList: [],
      templateList: [], // 所有可选模块
      stamp: {
        visible: false,
        loading: false,
        data: {},
      },
      sign: {
        visible: false,
        loading: false,
        data: {},
      },
      template: {
        visible: false,
        loading: false,
        data: {},
      },
      rule: {
        visible: false,
        ruleIds: "",
        ruleIdsList: []
      },
      showFlag: true, // 规则表单展示与否
      templateDetail: {},
      draggable: false,
      isLoadingSavePosition: false,
      data: {}, // 从列表带过来的数据
      templateLoading: false,
      StampLoading: false,
      signLoading: false,
      editableTabs: [],
      editableTabsValue: "",
      currentBasePrintdevId: "", // 当前模版id
      additionPrintOption: [], // tab,
      commonSubmitData: {
        name: "",
        basePrintDevName: "",
        flowTemplateName: "",
        basePrintdevId: "", // 基础打印模版id
        flowTemplateId: "", // 关联流程id
        sobId: "", // 账套id
        reqList: [], // 基础打印模版的签章信息
        additionPrintReqList: [], // 所有附加打印模版的信息
        version: 0 // 是否生成新版本
      }, // 配置页面改造（新增版本概念），所有模版、签章、位置数据不再单独调用接口，统一维护，统一提交
      initCommonSubmitData: "" // 刚进入页面把后端返回的数据组装后，转为字符串保留，用于在离开页面是，对比是否有更改
    };
  },
  computed: {
    flowMap() {
      const map = {};
      this.flowList.forEach(v => {
        map[v.value] = v.label
      })
      return map;
    },
    stampMap() {
      const map = {};
      this.stampList.forEach(v => {
        map[v.value] = v.label
      })
      return map;
    },
    pageParam() {
      let ret = {};
      if (this.templateDetail.pageParam) {
        try {
          ret = JSON.parse(this.templateDetail.pageParam)
        } catch (e) {
          console.warn('解析templateDetail.pageParam时发生异常', e)
        }
      }
      return ret;
    },
    addtionPointId() {
      return this.editableTabsValue == this.commonSubmitData.basePrintdevId ? null : this.editableTabsValue;
    }
  },
  watch: {
    editableTabsValue(value) {
      // console.log("当前切换的tab的值", value);
      // console.log("初始化tab值", this.data.basePrintdevId);
      if (value != 0) {
        this.refreshTab(value);
      }
    },
  },
  created() {
    // 拉取打印模板
    getPrintDevList({ currentPage: 1, pageSize: -1 }).then(res => {
      this.templateList = res.data.list;
    });
    this.loadPageData();
  },
  beforeRouteLeave(to, from, next) {
    // 离开页面前，查看页面是否有修改
    if (this.initCommonSubmitData && this.initCommonSubmitData !== JSON.stringify(this.commonSubmitData)) {
      this.$confirm('检测到有修改未提交，离开页面将丢失，确认是否离开?', "提示").then(() => {
        next();
      })
        .catch(() => {
          next(false);
        });
    } else {
      next();
    }
  },
  methods: {
    // 重新加载整个页面的数据, 包括: 下拉源,用印表格,签名表格,模板,基本信息等
    async loadPageData() {
      // 获取列表传的数据(包括基础信息回显和关键id)
      this.data = JSON.parse(this.$route.query.data) || {};
      // 加载印章选项, 等待完成下载获取url
      await this.loadStampList();
      // // 加载模版数据
      // this.loadTemplateDetail(this.data.basePrintdevId);
      // 等待加载-流程节点完成
      await this.loadNodeList();
      // 加载tab页签，除了基础模版外，可能还有其他模版
      this.refreshBaseInfo();
      // this.loadTab();
      // // 加载印章列表
      // this.loadSignSealList(2);
      // // 加载签名列表
      // this.loadSignSealList(1);
    },
    loadTab() {
      this.editableTabsValue = "";
      this.commonSubmitData = {
        name: "",
        basePrintDevName: "",
        flowTemplateName: "",
        basePrintdevId: "", // 基础打印模版id
        flowTemplateId: "", // 关联流程id
        sobId: "", // 账套id
        reqList: [], // 基础打印模版的签章信息
        additionPrintReqList: [], // 所有附加打印模版的信息
        version: 0 // 是否生成新版本
      };
      // 初始化tab页，只有当有基础模版时，才展示基础模版tab
      if (this.data.basePrintdevId !== "" && this.data.basePrintdevId !== null) {
        this.editableTabs = [{ title: this.data.name + "（基础）", name: this.data.basePrintdevId }];
        // 基础打印模版，塞入统一对象
        Object.assign(this.commonSubmitData, { ...this.data })
      } else {
        this.editableTabs = [];
      }
      additionPrintList({ bizFlowModuleId: this.data.id }).then(async res => {
        res.data.forEach(v => {
          // 获取到其他模版列表后，name赋值title，id赋值name
          this.editableTabs.push({ title: v.name + `（${this.tabType(v)}）`, name: v.id.toString() });
          // 每一个附加打印模版塞入统一提交数据对象中
          this.commonSubmitData.additionPrintReqList.push({ ...v, reqList: [] });
        });
        // 通过editableTabs中的name，遍历请求所有印章和签字列表，塞入统一数据对象中管理（改之前是实时查询，只有切换到对应tab，才加载）
        this.signLoading = true;
        this.StampLoading = true;
        for (const v of this.editableTabs) {
          // 如果是基础模版，塞入统一对象外层
          if (v.name == this.data.basePrintdevId) {
            await this.loadSignSealList(2).then(r => {
              this.commonSubmitData.reqList.push(...r);
            });
            await this.loadSignSealList(1).then(r => {
              this.commonSubmitData.reqList.push(...r);
            });
          } else {
            // 附加模版，塞入统一对象的各自附加模版对象结构中
            const index = this.commonSubmitData.additionPrintReqList.findIndex(v2 => v2.id == v.name);
            await this.loadSignSealList(2, v.name).then(r => {
              this.commonSubmitData.additionPrintReqList[index].reqList.push(...r);
            });
            await this.loadSignSealList(1, v.name).then(r => {
              this.commonSubmitData.additionPrintReqList[index].reqList.push(...r);
            });
          }
        }
        // 完成初始化数据，保留一份统一对象数据的字符串
        this.initCommonSubmitData = JSON.stringify(this.commonSubmitData);
        this.signLoading = false;
        this.StampLoading = false;
        this.editableTabsValue = this.editableTabs.length > 0 ? this.editableTabs[0].name : ""; // 默认选中第一个tab
        this.additionPrintOption = res.data;
      });
    },
    changeTab(type = 1, id) {
      additionPrintList({ bizFlowModuleId: this.data.id }).then(res => {
        const newValue = res.data.length > 0 ? res.data[res.data.length - 1] : null;
        if (type === 1) {
          // 新增
          this.editableTabs.push({ title: newValue.name + `（${this.tabType(newValue)}）`, name: newValue.id.toString() });
        } else if (type === 2) {
          // 删除
          this.editableTabs = this.editableTabs.filter(tab => tab.name !== id);
        }
        this.additionPrintOption = res.data;
        this.editableTabsValue = newValue ? newValue.id.toString() : this.data.basePrintdevId;
        this.currentBasePrintdevId = newValue ? newValue.basePrintdevId : this.data.basePrintdevId;
      });
    },
    // 以统一数据对象为准，重新加载tab列表------firstPosition为true时，tab强制切换到第一个tab上，否则切换到最后一个tab上
    refreshTabList(firstPosition = false) {
      // 先把editableTabs置空
      this.editableTabs = [];
      // 根据统一对象，插入基础模版tab
      this.editableTabs.push({ title: this.commonSubmitData.name + "（基础）", name: this.commonSubmitData.basePrintdevId });
      // 依次插入附加打印模版
      this.commonSubmitData.additionPrintReqList.forEach(v => {
        this.editableTabs.push({ title: v.name + `（${this.tabType(v)}）`, name: v.id.toString() })
      });
      console.log("刷新后的tabList：", JSON.stringify(this.editableTabs));
      this.additionPrintOption = [...this.commonSubmitData.additionPrintReqList];
      const newValue = this.additionPrintOption.length > 0 && !firstPosition ? this.additionPrintOption[this.additionPrintOption.length - 1] : null;
      this.editableTabsValue = newValue ? newValue.id.toString() : this.commonSubmitData.basePrintdevId;
      this.currentBasePrintdevId = newValue ? newValue.basePrintdevId : this.commonSubmitData.basePrintdevId;
    },
    removeTab(id) {
      // deleteAdditionPrint(id).then(() => {
      //   this.$message.success("删除成功");
      //   this.changeTab(2, id);
      // });
      const index = this.commonSubmitData.additionPrintReqList.findIndex(v => v.id == id);
      this.commonSubmitData.additionPrintReqList.splice(index, 1);
      this.$message({
        type: "success",
        message: "操作成功，待提交后生效",
      });
      this.refreshTabList();
    },
    switchTab(name) {
      const index = this.additionPrintOption.findIndex(v => v.id == name);
      if (index > -1) {
        this.currentBasePrintdevId = this.additionPrintOption[index].basePrintdevId;
      } else {
        this.currentBasePrintdevId = this.commonSubmitData.basePrintdevId;
      }
    },
    // value传值则加载切换的tab下的数据，若没有传值，则刷新当前tab下的数据
    refreshTab(value = null) {
      const tabName = value || this.editableTabsValue;
      this.switchTab(tabName);
      // 请求当前tab的模版
      this.loadTemplateDetail(this.currentBasePrintdevId);
      // // 请求获取当前tab的印章列表和签名列表
      // this.loadSignSealList(2, value == this.data.basePrintdevId ? null : value);
      // this.loadSignSealList(1, value == this.data.basePrintdevId ? null : value);
      // 根据目前所选中的tab，来筛选出签名和印章列表
      this.refreshStampAndSignList(tabName);
    },
    // 根据传入的tab名，加载和刷新其下的签章和签名列表
    refreshStampAndSignList(tabName) {
      const flag = tabName === this.commonSubmitData.basePrintdevId;
      if (flag) {
        this.stampTableData = this.commonSubmitData.reqList.filter(v => v.type === 2);
        this.signTableData = this.commonSubmitData.reqList.filter(v => v.type === 1);
      } else {
        const index = this.commonSubmitData.additionPrintReqList.findIndex(v => v.id == tabName);
        this.stampTableData = this.commonSubmitData.additionPrintReqList[index].reqList.filter(v => v.type === 2);
        this.signTableData = this.commonSubmitData.additionPrintReqList[index].reqList.filter(v => v.type === 1);
      }
    },
    loadTemplateDetail(id) {
      this.templateLoading = true;
      getPrintDevInfo(id).then(res => {
        this.templateDetail = res.data || {};
        this.templateLoading = false;
      })
    },
    async loadSignSealList(type, id = null) {
      // if (type === 2) {
      //   this.StampLoading = true;
      // } else if (type === 1) {
      //   this.signLoading = true;
      // }
      return getFlowModuleSignSealList({ bizFlowModuleId: this.data.id, type, additionPrintId: id }).then(async res => {
        for (const v of res.data) {
          // 匹配节点code，为了回显名字，且code为逗号分隔的字符串
          v.nodeTitle = [];
          v.nodeCode.split(",").forEach(value => {
            let index = this.nodeList.findIndex(v2 => v2.nodeCode === value);
            if (index > -1) {
              v.nodeTitle.push(this.nodeList[index].nodeTitle);
            }
          });
          v.nodeTitle = v.nodeTitle.join("，");
          // 把signSealId变成string，进行统一，否则表单无法回显
          if (v.signSealId) {
            v.signSealId = v.signSealId.toString();
            // 对于印章来说，需要把印章的图片带上，直接从印章选项列表中拿
            v.image = this.stampList[this.stampList.findIndex(v3 => v3.value == v.signSealId)].image;
          }
          // 如果是扩展单据，则每个元素添加additionPrintId字段
          if (id) {
            v.additionPrintId = id;
          }
        }
        if (type === 2) {
          // this.stampTableData = res.data;
          // this.StampLoading = false;
          return res.data;
        } else if (type === 1) {
          // this.signTableData = res.data;
          // this.signLoading = false;
          return res.data;
        }
      });
    },
    async loadNodeList() {
      await getNodeList({ flowTemplateId: this.data.flowTemplateId }).then(res => {
        this.nodeList = res.data;
      });
    },
    async loadStampList() {
      await getCcdSignSealList({ currentPage: 1, pageSize: -1, type: 2 }).then(async res => {
        // 下载对应的印章url, 塞入印章选项列表中，其他需要用到url的从这里拿
        for (const v of res.data.records) {
          await downloadFile(v.signSealImgFid).then(res => {
            v.image = res.data.url;
          });
        }
        this.stampList = res.data.records.map(v => ({ label: v.name, value: v.id, image: v.image }));
      });
    },
    onDelStampOrSign(obj) {
      this.$confirm('确认删除?', "提示").then(() => {
        // deleteFlowModuleSignSeal(row.id).then(() => {
        //   this.$message({
        //     type: "success",
        //     message: "删除成功",
        //   });
        //   this.loadSignSealList(row.type, this.addtionPointId);
        // });
        if (this.addtionPointId) {
          const index = this.commonSubmitData.additionPrintReqList.findIndex(v => v.id == this.addtionPointId);
          const index2 = this.commonSubmitData.additionPrintReqList[index].reqList.findIndex(v => v.id == obj.id);
          this.commonSubmitData.additionPrintReqList[index].reqList.splice(index2, 1);
        } else {
          const index = this.commonSubmitData.reqList.findIndex(v => v.id == obj.id);
          this.commonSubmitData.reqList.splice(index, 1);
        }
        this.$message({
          type: "success",
          message: "操作成功，待提交后生效",
        });
        this.refreshStampAndSignList(this.editableTabsValue); // 刷新当前tab的签名和签章列表
      });
    },
    onEditStamp(row = {}) {
      Object.assign(this.stamp, { visible: true, loading: false, data: { ...row, additionPrintId: this.addtionPointId }})
    },
    onEditSign(row = {}) {
      Object.assign(this.sign, { visible: true, loading: false, data: { ...row, additionPrintId: this.addtionPointId }})
    },
    openTemplateDialog(row = {}) {
      Object.assign(this.template, { visible: true, loading: false, data: row })
    },
    openRuleTableDialog() {
      this.rule.visible = true;
    },
    // 签章完成新增或编辑后，重新覆盖入统一对象结构中
    updateCSDReqlist(obj) {
      if (obj.id) {
        if (obj.additionPrintId) {
          const index = this.commonSubmitData.additionPrintReqList.findIndex(v => v.id == obj.additionPrintId);
          const index2 = this.commonSubmitData.additionPrintReqList[index].reqList.findIndex(v => v.id == obj.id);
          this.commonSubmitData.additionPrintReqList[index].reqList[index2] = obj;
        } else {
          const index = this.commonSubmitData.reqList.findIndex(v => v.id == obj.id);
          this.commonSubmitData.reqList[index] = obj;
        }
      } else {
        if (obj.additionPrintId) {
          const index = this.commonSubmitData.additionPrintReqList.findIndex(v => v.id == obj.additionPrintId);
          this.commonSubmitData.additionPrintReqList[index].reqList.push({ ...obj, id: dayjs().format("YYYYMMDDHHmmssSSS") });
        } else {
          this.commonSubmitData.reqList.push({ ...obj, id: dayjs().format("YYYYMMDDHHmmssSSS") });
        }
      }
    },
    // 编辑签章和签字位置后，完全覆盖对应打印模版的reqList
    saveReqList(list = []) {
      // ----list是修改过位置后，返回的签名和签章
      if (this.addtionPointId) {
        // 附加打印模版
        const index = this.commonSubmitData.additionPrintReqList.findIndex(v => v.id == this.addtionPointId);
        this.commonSubmitData.additionPrintReqList[index].reqList = list;
      } else {
        // 基础打印模版
        this.commonSubmitData.reqList = list;
      }
    },
    onConfirmEditStamp(data) {
      this.stamp.loading = true;
      // const method = data.id ? updateFlowModuleSignSeal : createFlowModuleSignSeal;
      // 新增印章时，要通过印章url获取印章大小，再设置样式
      let url = this.stampList[this.stampList.findIndex(v3 => v3.value == data.signSealId)].image;
      this.jnpf.getImgSize(url).then(r => {
        console.log('图片尺寸', r);
        let styleJson = JSON.stringify({
          "box-sizing": "border-box",
          "object-fit": "cover",
          "position": "absolute",
          "top": 0,
          "left": 0,
          width: `${r.width}px`,
          height: `${r.height}px`
        });
        // 处理一下流程节点列表为逗号分隔的字符串
        let nodeCode = "";
        if (data.nodeCode instanceof Array) {
          nodeCode = data.nodeCode.join(",");
        } else {
          nodeCode = data.nodeCode;
        }
        const form = {
          ...data,
          nodeCode,
          type: 2,
          bizFlowModuleId: this.data.id,
          image: url
        };
        if (!data.id) {
          form.styleJson = styleJson;
        }
        // method(form).then(() => {
        //   this.$message({
        //     type: "success",
        //     message: "操作成功",
        //   });
        //   // 加载印章列表
        //   this.loadSignSealList(2, this.addtionPointId);
        // });
        this.updateCSDReqlist(form); // 塞入统一数据对象中
        this.$message({
          type: "success",
          message: "暂存成功，待提交后生效",
        });
        this.refreshStampAndSignList(this.editableTabsValue); // 刷新当前tab的签名和签章列表
        setTimeout(() => {
          Object.assign(this.stamp, { visible: false, loading: false, data: {}})
        }, 1000)
      });
    },
    onConfirmEditSign(data) {
      console.log("签名确认数据：", data);
      this.sign.loading = true;
      // const method = data.id ? updateFlowModuleSignSeal : createFlowModuleSignSeal
      // 处理一下流程节点列表为逗号分隔的字符串
      let nodeCode = "";
      if (data.nodeCode instanceof Array) {
        nodeCode = data.nodeCode.join(",");
      } else {
        nodeCode = data.nodeCode;
      }
      const form = {
        ...data,
        nodeCode,
        type: 1,
        bizFlowModuleId: this.data.id,
      };
      if (!data.id) {
        // 新增时：signType为1和2一种样式，3为另一种样式，但其初始化后肯定会拖动重新定位，因此在这块就不适配了
        form.styleJson = '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"0","left":"0"}';
      } else {
        // 编辑时，已经有了样式
        const styleObj = JSON.parse(form.styleJson);
        // 由于从手写签名和系统签名，切换到签名组，或反过来，需要改动的样式太多，因此暂时关闭此类切换
        // 暂时不允许3切换到2和1，或2和1切换到3
        if (([1, 2].includes(this.sign.data.signType) && data.signType === 3) || (this.sign.data.signType === 3 && [1, 2].includes(data.signType))) {
          this.$message.warning("签名组与其他类型签名之间无法切换，请删除重建");
          return;
        }
        if (data.signType === 1) {
          // 手写签名，如果有font-size\justify-content\justify-content样式去掉
          if (styleObj['font-size']) {
            delete styleObj['font-size'];
            delete styleObj['justify-content'];
            delete styleObj['align-items'];
            delete styleObj['display'];
          }
        } else if (data.signType === 2) {
          // 系统签名，把width转成font-size，再添加居中样式
          if (styleObj.width) {
            styleObj['font-size'] = (styleObj.width.slice(0, -2) / 4) + 'mm';
            styleObj['display'] = 'flex';
            styleObj['justify-content'] = 'center';
            styleObj['align-items'] = 'center';
          }
        } else if (data.signType === 3) {
          // 由于上面已经禁止其他类型转为3，说明类型一直就是3，若是用户编辑了signGroupRow字段，需要在这把其塞入样式中，否则必须移动位置后才能生效
          if (this.sign.data.signGroupRow !== data.signGroupRow) {
            // 说明signGroupRow改动了
            styleObj['childContainer'] = JSON.stringify({
              flex: `0 0 calc(100% / ${data.signGroupRow})`,
              'margin-bottom': '5mm'
            });
          }
        }
        form.styleJson = JSON.stringify(styleObj);
      }
      if (!form.opinionStyleJson) {
        form.opinionStyleJson = '{"box-sizing":"border-box","object-fit":"cover","position":"absolute","top":"0","left":"0"}';
      }
      // 新增签名时，要塞一个固定样式
      // method(form).then(() => {
      //   this.$message({
      //     type: "success",
      //     message: "操作成功",
      //   });
      //   // 加载签名列表
      //   this.loadSignSealList(1, this.addtionPointId);
      // });
      this.updateCSDReqlist(form); // 塞入统一数据对象中
      this.$message({
        type: "success",
        message: "暂存成功，待提交后生效",
      });
      this.refreshStampAndSignList(this.editableTabsValue); // 刷新当前tab的签名和签章列表
      setTimeout(() => {
        Object.assign(this.sign, { visible: false, loading: false, data: {}})
      }, 1000)
    },
    onConfirmEditTemplate(data) {
      this.template.loading = true;
      // const method = data.id ? updateAdditionPrint : createAdditionPrint;
      // method({ ...data, bizFlowModuleId: this.data.id }).then(() => {
      //   this.$message.success("操作成功");
      //   this.changeTab();
      //   this.template.loading = false;
      // });
      // 新增的附加模版，塞入统一对象结构中
      this.commonSubmitData.additionPrintReqList.push({ ...data, bizFlowModuleId: this.data.id, id: dayjs().format("YYYYMMDDHHmmssSSS"), reqList: [] });
      this.$message({
        type: "success",
        message: "暂存成功，待提交后生效",
      });
      this.refreshTabList(); // 刷新tab列表
      setTimeout(() => {
        Object.assign(this.template, { visible: false, loading: false, data: {}})
      }, 1000);
    },
    onEditBaseInfo() {
      if (this.commonSubmitData.type === 1) {
        this.$refs.businessForm.init(this.commonSubmitData.id, this.commonSubmitData);
      } else if (this.commonSubmitData.type === 2) {
        this.$refs.expenseForm.init(this.commonSubmitData.id, this.commonSubmitData);
      }
    },
    onConfirmBaseInfo(data) {
      // 修改了审批配置主信息，塞入统一对象结构中，等待一起提交
      console.log("基础打印模版数据：", data);
      Object.assign(this.commonSubmitData, { ...data });
      this.$message({
        type: "success",
        message: "暂存成功，待提交后生效",
      });
      this.refreshTabList(true); // 刷新tab列表
    },
    refreshBaseInfo() {
      getCcdBizFlowModuleDetail(this.data.id).then(res => {
        // 重新请求详情接口，是因为之前可以修改关联流程和模版，现在给禁了，不过依然兼容防止又改回来
        this.data = Object.assign(res.data, { flowTemplateName: this.data.flowTemplateName });
        // 从详情接口信息，初始化规则id和failType
        this.rule.ruleIdsList = this.data.auditRuleIdList;
        this.rule.ruleIds = this.data.auditRuleIds;
        // 由于基础模版现在可编辑，因此修改后要重新初始化tab
        this.loadTab();
      });
    },
    tabType(obj) {
      // obj是附属模板详情
      return obj.additionType === 0 ? "自定义" : obj.additionType === 1 ? "发票打印" : "";
    },
    async savePosition() {
      if (this.isLoadingSavePosition) return;
      this.isLoadingSavePosition = true;
      try {
        const { stampList, signList } = this.$refs.printTemplateDetail.getCalcPosition();
        this.saveReqList([...stampList, ...signList]); // 找到对应修改的打印模版，并把签名和签章数据覆盖到统一对象中
        this.$message({
          type: "success",
          message: "暂存成功，待提交后生效",
        });
        this.refreshStampAndSignList(this.editableTabsValue); // 刷新当前tab的签名和签章列表
        this.$nextTick(() => {
          this.draggable = false
        });
        // saveLocation([...stampList, ...signList]).then(() => {
        //   this.stampTableData = stampList;
        //   this.signTableData = signList;
        //   this.$nextTick(() => {
        //     this.draggable = false
        //   });
        //   this.$message.success('保存成功');
        // });
      } catch (e) {
        console.log('保存位置信息时发生异常错误', e)
        this.$message.error('保存失败')
      } finally {
        this.isLoadingSavePosition = false;
      }
    },
    // 统一对象提交后端
    async submitCommonData() {
      console.log("统一提交对象：", this.commonSubmitData);
      let flag = 0;
      await this.$confirm('仅修改签名位置及打印模版请选     <b>否</b>（会同步到进行中的单据）<br/>' +
        '如果流程的节点出现增删变化请选     <b>是</b>（不影响进行中的单据）', "确认信息", {
        distinguishCancelAndClose: true,
        confirmButtonText: '是',
        cancelButtonText: '否',
        dangerouslyUseHTMLString: true
      }).then(() => {
        this.commonSubmitData.version = 1;
        flag = 1;
      })
        .catch(action => {
          if (action === 'cancel') {
            this.commonSubmitData.version = 0;
            flag = 1;
          }
        });
      if (flag) {
        updateVersion(this.commonSubmitData).then(res => {
          this.$message.success("操作成功");
          // 提交后可能会产生新版本，把commonSubmitData的id也重置成最新的
          this.commonSubmitData.id = res.data;
          // 保存成功后，更新初始统一对象字符串，否则退出时还会提示未保存
          this.initCommonSubmitData = JSON.stringify(this.commonSubmitData);
          // 把url后的参数修改，防止刷新后版本还是老版本
          const data = JSON.parse(this.$route.query.data);
          data.id = res.data;
          this.$router.replace({
            query: {
              data: JSON.stringify(data)
            }
          });
        });
      }
    },
    async toImg() {
      const dataURL = await this.$refs.printTemplateDetail.toImage();
      saveAs(dataURL, `导出-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.png`)
    },
    reloadTable() {
      this.showFlag = false;
      this.showFlag = true;
      this.refreshBaseInfo();
    },
  }
};
</script>
<style lang="scss" scoped>
.left-area {
  flex: 1;
  box-sizing: border-box;
  padding: 15px 5px;
  ::v-deep .el-card__body {
    height: calc(100% - 65px);
    overflow: auto;
  }
}
.right-area {
  box-sizing: border-box;
  overflow-y: auto;
  padding: 15px 5px;
  width: 500px;
  min-width: 500px;
}
.flex-row {
  flex-flow: row;
  height: calc(100% - 58px);
}
.detail-line {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .kv {
    .k {
      font-weight: bold;
    }
    .v {
      margin-right: 20px;
    }
  }
}
.head-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.tab-fix {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
}
</style>
