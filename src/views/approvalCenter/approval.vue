<template>
  <div class="approval-page">
    <el-card class="card">
      <div slot="header" class="clearfix">
        <span class="spec">{{ title }}</span>
      </div>
      <el-steps :active="step" class="step" :space="240" align-center finish-status="success">
        <el-step v-for="item in steps" :title="item.title" :key="item.key"></el-step>
      </el-steps>
      <relate-order-and-invoice v-show="steps.length > 0 && steps[step].key === 1" :data-from-invoice="dataFromInvoice" :relate-invoice="relateInvoice" :smart-approval-order-type="smartApprovalOrderType" @change="onRelateChange" @showDataFromInvoiceDetail="onDataFromInvoiceDetail" />
      <data-from-invoice class="data-from-invoice-1" v-if="steps.length > 0 && steps[step].key === 2 && Object.keys(dataFromInvoice).length > 0" :show-switch="true" :data="dataFromInvoice" :invoice-num="relationInfo.relateInvoiceList.length" @onDetail="onDataFromInvoiceDetail" @onSwitch="onBack" />
      <any-form class="form-container" v-if="steps.length > 0 && steps[step].key > 1" :class="{'hide': steps.length > 0 && steps[step].key === 3 }" ref="anyform" :module-json="anyForm.moduleJson" :form-data="anyForm.formData" label-width="140px" />
      <confirm-order v-if="steps.length > 0 && steps[step].key === 3" :order-info="info" @change="onCandidateListChange" />
    </el-card>
    <div class="approval-page-bottom">
      <el-button v-if="steps.length > 0 && steps[step].key === 1" class="btn-skip" @click="onSkip">跳过</el-button>
      <el-button v-if="steps.length > 0 && steps[step].key === 2" class="btn-skip" :loading="buttonLoading" @click="onSave">暂存</el-button>
      <el-button v-if="steps.length > 0 && steps[step].key === 3" class="btn-skip" @click="onBack">返回</el-button>
      <el-button type="primary" class="btn-next" :loading="buttonLoading" @click="onNext">下一步</el-button>
    </div>
    <data-from-invoice-detail :visible.sync="dataFromInvoiceDetailVisible" :data="dataFromInvoice" :invoice-num="relationInfo.relateInvoiceList.length" />
  </div>
</template>
<script>
import {
  APIGetBizFlowModuleDetail,
  APIGetInfoByBillId,
  APISmartTravelFrom,
  FlowBeforeInfo
} from "@/api/cicada/approval";
import { getFlowList } from "@/api/workFlow/FlowEngine";
import { getFormInfo } from "@/api/workFlow/FormDesign";
import RelateOrderAndInvoice from "@/views/approvalCenter/components/relateOrderAndInvoice.vue";
import AnyForm from "@/components/DynamicForm/AnyForm.vue";
import { Create } from "@/api/workFlow/workFlowForm";
import ConfirmOrder from "@/views/approvalCenter/components/confirmOrder.vue";
import { parseJsonObj } from "@/components/Cicada/printHelper";
import DataFromInvoiceDetail from "@/views/approvalCenter/components/dataFromInvoiceDetail.vue";
import DataFromInvoice from "@/views/approvalCenter/components/DataFromInvoice.vue";
const getStepList = [
  { title: '关联票据', key: 1 },
  { title: '完善信息', key: 2 },
  { title: '确认审批单', key: 3 },
]
export default {
  name: "approvalCenterApproval",
  components: { DataFromInvoice, DataFromInvoiceDetail, ConfirmOrder, AnyForm, RelateOrderAndInvoice },
  data() {
    return {
      orderId: this.$route.query.orderId,
      billId: this.$route.query.billId,
      flowTemplateId: this.$route.query.flowTemplateId,
      bizFlowModuleId: this.$route.query.bizFlowModuleId,
      name: this.$route.query.name,
      isAgain: this.$route.query.isAgain, // 是否是再来一单
      isRevoked: this.$route.query.isRevoked, // 是否已撤回单子
      info: {},
      anyForm: {
        moduleJson: undefined,
        formData: undefined
      },
      moduleJsonBean: {},
      enCode: '',
      step: 0,
      steps: [],
      buttonLoading: false,
      relationInfo: {
        relateInvoiceList: [],
        relateOrderList: [],
        isInvoiceChange: false,
      },
      relateInvoice: false,
      smartApprovalOrderType: undefined,
      __key: 100000,
      candidateListRes: undefined,
      dataFromInvoice: {},
      dataFromInvoiceDetailVisible: false
    }
  },
  computed: {
    title() {
      if (this.name) {
        if (this.anyForm.formData) {
          return (this.anyForm.formData.id ? '编辑' : '新增') + this.name;
        } else {
          return this.name;
        }
      } else {
        return '信息修订';
      }
    },
    getKey() {
      return this.__key++;
    }
  },
  created() {
    this.$store.dispatch('generator/getAreaTree')
  },
  mounted() {
    // 编辑，取表单的详细信息回填
    if (this.orderId) {
      this.loadDetail(this.orderId);
      this.steps = getStepList.filter(v => v.key !== 1);
    } else {
      // 如果是新增 根据表单模板ID取出flowId和表单编码
      this.loadFormInfo();
    }
  },
  methods: {
    async loadDetail(orderId) {
      await FlowBeforeInfo(orderId).then(async res1 => {
        this.orderId = orderId;
        let res = res1.data;
        res.flowTaskNodeList = res.flowTaskNodeList.map(item => ({
          ...item,
          type: '-1',
          nodePropertyJson: JSON.parse(item.nodePropertyJson),
        }));
        this.info = res;
        // 不在表单展示，但在审批时被编辑的字段，要在这清除（目前只考虑非迭代的组）
        let data = res.formData
        if (this.billId) {
          const params = this.billId ? { billId: this.billId } : {};
          const res = await APIGetInfoByBillId(this.orderId, params);
          data = res.data;
        }
        if (this.orderId === this.$route.query.orderId && res.moduleJson != null && data.detailJson) {
          const groups = JSON.parse(res.moduleJson).groups.filter(v => !v.iterable);
          let fields = [];
          groups.forEach(v => {
            return fields.push(...v.fields);
          });
          fields = fields.filter(vv => vv.component !== "showValue")
          const detailJson = JSON.parse(data.detailJson);
          fields.forEach(vv => {
            if (!vv.showInForm && detailJson[vv.fieldName]) {
              delete detailJson[vv.fieldName];
              if (vv.export && data[vv.fieldName]) {
                delete data[vv.fieldName];
              }
              if (vv.hiddenFieldsMapping) {
                vv.hiddenFieldsMapping.forEach(vv => {
                  if (detailJson[vv.rename]) {
                    delete detailJson[vv.rename];
                  }
                });
              }
            }
          });
          data.detailJson = JSON.stringify(detailJson);
        }
        if (this.orderId === this.$route.query.orderId && this.isAgain) {
          if (!this.billId) {
            delete data.invoiceIds;
            delete data.applyOrderIds;
          }
          delete data.applyOrderFids;
          delete data.contractFids;
          delete data.submitSignFids;
          delete data.exsFids;

          delete data.stickerTicketStatus;
          delete data.exsOrderIds;
          delete data.paymentOrderFid;
          delete data.paymentOrderUpload;
          delete data.layoutFileUpload;
          delete data.flowStatus;
          delete data.pushStatus;
          delete data.status;
          delete data.staging;
          delete data._candidateList;
          delete data.accountingStatus;

          delete data.exsOrderPdfFid;
          delete data.applyPdfFids;
          delete data.voucherYear;
          delete data.voucherMonth;
          delete data.voucherNo;
          delete data.voucherPushStatus;
          delete data.isPay;
        }
        // 再来一单和已撤回单子需要获取最新的审批流ID
        let flowId = res.flowTemplateInfo.id;
        let newBizFlowModuleId = data.bizFlowModuleId;
        if ((this.orderId === this.$route.query.orderId) && (this.isRevoked || this.isAgain)) {
          if (data.bizFlowModuleId) {
            const res2 = await APIGetBizFlowModuleDetail(data.bizFlowModuleId);
            const flowDetail = res2.data;
            console.log('OAForm::newFlowId==>', flowDetail.flowId);
            console.log('OAForm', flowDetail.flowId === flowId ? '不是新审批流' : '是新审批流');
            if (!flowDetail.newId) {
              this.$message({ message: '当前流程已禁用', type: 'warning' });
              // 关闭当前页面
              await this.$store.dispatch('tagsView/delView', this.$route)
              this.$router.go(-1);
              return;
            }
            flowId = flowDetail.flowId;
            newBizFlowModuleId = flowDetail.newId;
          }
        }
        this.anyForm.formData = { ...data, flowId: flowId, bizFlowModuleId: newBizFlowModuleId };
        // 取表单编码
        const enCode = res.flowFormInfo.appUrlAddress;
        if (enCode) {
          console.log('OAForm::formCode==>', enCode);
          this.enCode = enCode;
        }
        // 动态表单再来一单时,不能从旧表单实例上拉取 moduleJson
        if ((this.orderId === this.$route.query.orderId) && (this.isRevoked || this.isAgain)) {
          const res2 = await getFlowList(res.flowTemplateInfo.templateId, '1');
          let _data = res2.data;
          const json = JSON.parse(_data[0].flowTemplateJson);
          this.anyForm.moduleJson = json.properties.moduleJson;
        } else {
          this.anyForm.moduleJson = res.moduleJson || res.flowFormInfo?.moduleJson;
        }
        console.log('OAForm::anyForm.moduleJson==>', this.anyForm.moduleJson);
        this.moduleJsonBean = JSON.parse(this.anyForm.moduleJson);
      })
    },
    loadFormInfo() {
      getFlowList(this.flowTemplateId, '1').then(res => {
        this.anyForm.formData = { flowId: res.data[0].id, bizFlowModuleId: this.bizFlowModuleId || '' };
        const json = JSON.parse(res.data[0].flowTemplateJson);
        getFormInfo(json.properties.formId).then(res1 => {
          let fd = res1.data;
          const enCode = fd.appUrlAddress;
          if (enCode) {
            console.log('OAForm::formCode==>', enCode);
            this.enCode = enCode;
          }
          this.anyForm.moduleJson = json.properties.moduleJson;
          this.moduleJsonBean = JSON.parse(json.properties.moduleJson);
          // 报销单-则加载审批单信息
          console.log("moduleJson", this.moduleJsonBean);
          // 报销单并且可以关联审批单
          if (this.moduleJsonBean.formType === 2 && this.moduleJsonBean.smartApprovalOrderType) {
            this.steps = getStepList;
            // 差旅报销单可以关联发票
            this.relateInvoice = this.moduleJsonBean.orderType === 2;
            this.smartApprovalOrderType = this.moduleJsonBean.smartApprovalOrderType;
          } else {
            this.steps = getStepList.filter(v => v.key !== 1);
          }
        });
      });
    },
    onSkip() {
      this.step++;
    },
    onBack() {
      this.step--;
    },
    onNext() {
      if (this.steps[this.step].key === 1) {
        // 智能填写计算
        this.smartCalculate();
      } else if (this.steps[this.step].key === 2) {
        if (this.buttonLoading) return;
        // 提交
        // 进入下一步
        this.onConfirm(false, true);
      } else if (this.steps[this.step].key === 3) {
        // 提交审批人信息
        if (this.candidateListRes && this.candidateListRes.finished) {
          this.onConfirm(true, true, this.candidateListRes.list);
        } else {
          this.$message.warning("请选择审批人");
        }
      }
    },
    onSave() {
      if (this.buttonLoading) return;
      this.onConfirm(false, false)
    },
    onRelateChange(val) {
      this.relationInfo = val;
      if (this.relationInfo.isInvoiceChange) {
        this.refreshDataFromInvoice()
      }
    },
    onDataFromInvoiceDetail() {
      this.dataFromInvoiceDetailVisible = true;
    },
    refreshDataFromInvoice() {
      if (this.relationInfo.relateInvoiceList.length > 0) {
        APISmartTravelFrom({ invoiceIds: this.relationInfo.relateInvoiceList.map(v => v.id), applyOrderIds: [] }).then(res => {
          this.dataFromInvoice = res.data;
        });
      } else {
        this.dataFromInvoice = {};
      }
    },
    onCandidateListChange(val) {
      this.candidateListRes = val;
    },
    smartCalculate() {
      // 未关联发票和未关联审批单,直接下一步
      if (this.relationInfo.relateOrderList.length === 0 && this.relationInfo.relateInvoiceList.length === 0) {
        this.step++;
      } else {
        // 判断是差旅报销单，通过发票和审批单智能计算
        if (this.relateInvoice) {
          this.buttonLoading = true;
          const invoiceIds = this.relationInfo.relateInvoiceList.map(v => v.id);
          const applyOrderIds = this.relationInfo.relateOrderList.map(v => v.id);
          APISmartTravelFrom({ invoiceIds: invoiceIds, applyOrderIds: applyOrderIds, bizFlowModuleId: this.bizFlowModuleId }).then(res => {
            let detailJson = res.data;
            const extData = {};
            // 需要将审批单copy到报销单的额外字段, 后续在此添加, 支持改名映射
            [
              { source: 'exsFids', target: 'exsFids' },
            ].forEach(o => {
              extData[o.target] = detailJson[o.source];
            });
            const _detailJson = this.generateJson(detailJson)
            this.anyForm.formData = {
              ...this.anyForm.formData,
              applyOrderIds: applyOrderIds.join(','),
              invoiceIds: invoiceIds.join(','),
              detailJson: JSON.stringify(_detailJson),
              ...extData,
            }
            this.buttonLoading = false;
            this.step++;
          })
        } else {
          // 判断是其它报销单，审批单自动填写
          // formData内且不属于detailJson的额外附加字段集
          const extData = {};
          const applyOrder = this.relationInfo.relateOrderList[0];
          // 需要将审批单copy到报销单的额外字段, 后续在此添加, 支持改名映射
          [
            { source: 'id', target: 'applyOrderIds' },
            { source: 'exsFids', target: 'exsFids' },
          ].forEach(o => {
            extData[o.target] = applyOrder[o.source];
          });
          // 审批单detailJson
          const dj = parseJsonObj(applyOrder.detailJson);
          const groups = this.moduleJsonBean.groups;
          const _detailJson = this.generateJson(dj)
          console.log('AI智能填写', {
            _detailJson: JSON.parse(JSON.stringify(_detailJson)),
            // _otherData: JSON.parse(JSON.stringify(_otherData)),
            原始formData: applyOrder,
            '原始formData.detailJson': dj,
            groups,
            extData: extData
          })
          this.anyForm.formData = {
            ...this.anyForm.formData,
            ...extData,
            detailJson: JSON.stringify(_detailJson)
          }
          this.step++;
        }
      }
    },
    generateJson(dj) {
      const groups = this.moduleJsonBean.groups;
      const _detailJson = {};
      groups.forEach(g => {
        if (!g.iterable) {
          (g.fields || []).forEach(f => {
            if (dj[f.fieldName] != null) {
              _detailJson[f.fieldName] = dj[f.fieldName];
            }
            (f.hiddenFieldsMapping || []).forEach(m => {
              if (m.rename) {
                _detailJson[m.rename] = dj[m.rename];
              }
            });
          });
        } else if (g.iterable && g.fieldName) {
          const dataArr = [];
          const oArr = dj[g.fieldName] || [];
          if (oArr instanceof Array && oArr.length > 0) {
            oArr.forEach((o, oi) => {
              const dataObj = {};
              (g.fields || []).forEach(f => {
                if (o[f.fieldName] != null) {
                  dataObj[f.fieldName] = o[f.fieldName];
                }
                (f.hiddenFieldsMapping || []).forEach(m => {
                  if (m.rename) {
                    dataObj[m.rename] = o[m.rename];
                  }
                });
              });
              dataArr[oi] = dataObj;
            });
          } else {
            dataArr.push({ __key: this.getKey });
          }
          _detailJson[g.fieldName] = dataArr;
        }
      });
      console.log('AI智能填写', {
        _detailJson: JSON.parse(JSON.stringify(_detailJson)),
        '原始formData.detailJson': dj,
        groups,
      })
      return _detailJson;
    },
    async onConfirm(submit = true, validate = true, candidateList = null) {
      const r = await this.$refs.anyform.collectData(validate);
      this.buttonLoading = true;
      console.log('暂存===收集到表单数据', r);
      if (this.moduleJsonBean.formType === 2) {
        // 报销单
        const params = {
          candidateType: candidateList ? 2 : 1,
          flowUrgent: 1,
          status: 1,
          flowId: this.anyForm.formData.flowId,
          id: this.anyForm.formData.id,
          formData: {
            ...this.anyForm.formData,
            ...r,
            staging: submit ? 0 : 1, // 这是工作流的状态 1 是暂存，0是提交
            status: 0,
            orderType: this.moduleJsonBean.orderType,
            formCode: this.enCode,
            _candidateList: candidateList ? JSON.stringify(candidateList) : '',
          }, // 表单的状态status:0草稿,1提交
        };
        // 已撤回单子删掉id参数，新增工作流
        if ((this.orderId === this.$route.query.orderId) && (this.isRevoked || this.isAgain)) {
          delete params.id;
          delete params.formData.id;
          delete params.formData.orderNo;
        }
        const res = await Create(params);
        this.buttonLoading = false;
        // 下一步，确认审批单
        if (!submit && validate) {
          await this.loadDetail(res.data.processId)
          this.step++;
        } else {
          this.orderId = res.data.processId;
          this.$message({ message: submit ? '提交成功' : '暂存成功', type: 'success' });
          if (submit) {
            // 跳转到报销单详情页
            await this.$store.dispatch('tagsView/delView', this.$route)
            this.$router.replace({ path: '/approvalCenter/detail', query: { id: this.orderId, isSubmit: 'true' }})
          } else {
            // 返回列表页
            await this.$store.dispatch('tagsView/delView', this.$route)
            this.$router.go(-1);
          }
        }
      } else {
        // 审批单
        const params = {
          id: this.anyForm.formData.id,
          candidateType: candidateList ? 2 : 1,
          candidateList: candidateList,
          flowId: this.anyForm.formData.flowId,
          flowUrgent: 1,
          status: submit ? 0 : 1, // 这是工作流的状态 1 是暂存，0是提交
          formData: {
            ...this.anyForm.formData,
            ...r,
            status: 1,
            staging: submit ? 0 : 1,
            orderType: this.moduleJsonBean.orderType,
            formCode: this.enCode,
          }, //  表单的状态status:0草稿,1提交
        };
        // 已撤回单子删掉id参数，新增工作流
        if ((this.orderId === this.$route.query.orderId) && (this.isRevoked || this.isAgain)) {
          delete params.id;
          delete params.formData.id;
          delete params.formData.orderNo;
        }
        const res = await Create(params);
        this.buttonLoading = false;
        // 下一步，确认审批单
        if (!submit && validate) {
          await this.loadDetail(res.data.processId)
          this.step++;
        } else {
          this.orderId = res.data.processId;
          this.$message({ message: submit ? '提交成功' : '暂存成功', type: 'success' });
          // 返回列表页
          await this.$store.dispatch('tagsView/delView', this.$route)
          this.$router.go(-1);
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-step__title {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  margin-top: 8px;
}
::v-deep .el-step__head.is-success {
  color: #00B4C4;
  border-color: #00B4C4;
}
::v-deep .el-step__title.is-success {
  color: #00B4C4;
}
::v-deep .el-step__head.is-process {
  color: #00B4C4;
  border-color: #00B4C4;
}
.approval-page {
  width: 100%;
  height: 100%;
  .card {
    height: calc(100% - 80px);
    overflow: auto;
  }
  .step {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
}
.hide {
  display: none;
}
.approval-page-bottom{
  width: calc(100% - 210px);
  padding: 20px 60px 20px 26px;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 210px;
  z-index: 1000;
  /*text-align: right;*/
  border-top: 1px solid #dddddd;;
  display: flex;
  .btn-next {
    width: 120px;
    height: 42px;
    background: #00B4C4;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 20px;
    margin-left: 20px;
  }
  .btn-skip {
    width: 120px;
    height: 42px;
    border-radius: 8px;
    border: 1px solid #00B4C4;
    font-weight: 500;
    font-size: 14px;
    color: #00B4C4;
    line-height: 20px;
    background: #ECFDFF;
  }
}
.form-container {
  margin: 20px 120px 20px 120px;
}
.data-from-invoice-1 {
  margin: 20px 120px 0 120px;
}
</style>
