// useApproval.js
import { computed, ref } from '@vue/composition-api';
import {
  APIGetShareOrderDetail,
  APIGetSignByUserId,
  APIPostFastAudit,
  APIPostFastReject,
  APIPostShareOrder,
  Audit,
  Candidates,
  FlowBeforeInfo,
  Reject,
  RejectList,
  Revoke,
} from '@/api/cicada/approval';
import { APIcreateFlowTask, APISmartAudit } from "@/api/cicada/oa";
import { checkSelectCandidate, getApproveResultImg } from '@/utils/cicada';
import { Press } from "@/api/workFlow/FlowLaunch";
import _ from 'lodash';
import store from '@/store'
import router from "@/router";

export function useApproval(root, { id, flowId, opType, taskNodeId, taskId }) {
  const shareUsersSelect = ref(null);
  const loading = ref(false);
  const info = ref(null);
  const rejectPopupOpen = ref(false);
  const approvalPopupOpen = ref(false);
  const opinion = ref('');
  const rejectReason = ref('');
  const rejectInfo = ref(null);
  const shareIds = ref([]);
  const applyOrderInfo = ref({});
  const errsList = ref([]);
  const warningsList = ref([]);
  const disabled = ref(false);
  const selectOrderVisible = ref(false);
  const selectExsOrderVisible = ref(false);
  const candidateList = ref({});
  const isComplete = ref(false);

  const noSubmit = computed(() => info.value?.formData?.status === 0 && info.value?.formData?.staging !== 1);
  const applyOrderIds = computed(() => info.value?.formData?.applyOrderIds ? info.value?.formData?.applyOrderIds.split(',') : []);
  const exsOrderIds = computed(() => info.value?.formData?.exsOrderIds ? info.value?.formData?.exsOrderIds.split(',') : []);
  const flowTaskFullName = computed(() => _.get(info.value, 'flowTaskInfo.fullName'));
  const applyUserName = computed(() => _.get(info.value, 'formData.exsUserName') || _.get(info.value, 'formData.applyUserName'));
  const flowName = computed(() => _.get(info.value, 'flowTaskInfo.flowName'));
  const relTravelAssist = computed(() => {
    const moduleJson = _.get(info.value, 'moduleJson') || _.get(info.value, 'flowFormInfo.moduleJson');
    return JSON.parse(moduleJson)?.relTravelAssist;
  });
  const relPaymentOrder = computed(() => {
    const moduleJson = _.get(info.value, 'moduleJson') || _.get(info.value, 'flowFormInfo.moduleJson');
    return JSON.parse(moduleJson)?.relPaymentOrder;
  });
  const formType = computed(() => {
    const moduleJson = _.get(info.value, 'flowFormInfo.moduleJson') || _.get(info.value, 'moduleJson');

    return moduleJson ? JSON.parse(moduleJson)?.formType : _.get(info.value, 'flowFormInfo.interfaceUrl') === '/api/cicada/ccdUnifiedApply' ? 1 : 2;
  });
  const status = computed(() => _.get(info.value, 'flowTaskInfo.status'));
  const flowTypeName = computed(() => formType.value === 1 ? '审批' : '报销');
  const showAuditBtn = computed(() => opType == '1' && info.value && info.value?.approversProperties?.hasAuditBtn);
  const showRevokeBtn = computed(() => opType == '0' && status.value == '1' && info.value && (info.value?.approversProperties?.hasRevokeBtn || info.value?.approversProperties?.hasRevokeBtn === undefined));
  const showPressBtn = computed(() => opType == '0' && status.value == '1' && info.value && info.value?.approversProperties?.hasPressBtn);
  const showEditBtn = computed(() => opType == '0' && (status.value == '3' || status.value == '4'));
  const showShareBtn = computed(() => opType == '0' && formType.value === 1 && status.value == '2');
  const showPrintBtn = computed(() => info.value?.flowTaskInfo?.status === 2 && ['0', '4'].includes(opType));
  const showAssistantCard = computed(() => !noSubmit.value && formType.value === 1 && relTravelAssist.value);
  const approveResultImg = computed(() => getApproveResultImg(info.value?.flowTaskInfo?.status, opType));
  const processId = computed(() => _.get(info.value, 'flowTaskInfo.processId'));
  const propertyJson = computed(() => store.state.orgInfo.propertyJson);
  const showPaymentOrder = computed(() => noSubmit.value && relPaymentOrder.value);
  const showCandidate = computed(() => checkSelectCandidate(info.value?.flowTaskNodeList, info.value?.flowTaskOperatorRecordList));
  const onLoadApplyOrderInfo = (data) => {
    applyOrderInfo.value = { ...applyOrderInfo.value, ...data };
  };

  const onSelectOrderResult = async(data) => {
    const ids = data instanceof Array ? data.map(item => item.id).join(',') : data.id;
    const exsFids = data instanceof Array ? data.map(item => item.exsFids).join(',') : data.exsFids;
    const newExsFids = info.value?.formData?.exsFids ? info.value?.formData?.exsFids.trim() && `${info.value?.formData?.exsFids},${exsFids}` : exsFids;
    await onChangeApplyOrderIds(ids, newExsFids);
  };

  const onSelectExsOrderResult = async(data) => {
    const ids = data instanceof Array ? data.map(item => item.id).join(',') : data.id;
    const paymentOrderFid = data instanceof Array ? data.map(item => item.paymentOrderFid).join(',') : data.paymentOrderFid;
    const newPaymentOrderFid = info.value?.formData?.paymentOrderFid ? info.value?.formData?.paymentOrderFid.trim() && `${info.value?.formData?.paymentOrderFid},${paymentOrderFid}` : paymentOrderFid;
    await onChangeExsOrderIds(ids, newPaymentOrderFid);
  };

  const onDeleteApplyOrder = async(id) => {
    const originExsFidsArr = info.value.formData.exsFids ? info.value.formData.exsFids.split(',') : [];
    const deleteExsFidsArr = applyOrderInfo.value[id].formData?.exsFids ? applyOrderInfo.value[id].formData.exsFids.split(',') : [];
    const newExsFidsArr = deleteExsFidsArr.length > 0 ? originExsFidsArr.filter(item => !deleteExsFidsArr.includes(item)) : originExsFidsArr;
    await onChangeApplyOrderIds(applyOrderIds.value.filter(item => item !== id).join(','), newExsFidsArr.join(','));
  };

  const onDeleteExsOrder = async(id) => {
    const originPaymentOrderFidArr = info.value.formData.paymentOrderFid ? info.value.formData.paymentOrderFid.split(',') : [];
    const deletePaymentOrderFidArr = applyOrderInfo.value[id].formData?.paymentOrderFid ? applyOrderInfo.value[id].formData.paymentOrderFid.split(',') : [];
    const newPaymentOrderFidArr = deletePaymentOrderFidArr.length > 0 ? originPaymentOrderFidArr.filter(item => !deletePaymentOrderFidArr.includes(item)) : originPaymentOrderFidArr;
    await onChangeExsOrderIds(exsOrderIds.value.filter(item => item !== id).join(','), newPaymentOrderFidArr.join(','));
  };

  const onChangeApplyOrderIds = async(ids, exsFids = '') => {
    const res = await APIcreateFlowTask({
      id,
      formData: { ...info.value?.formData, applyOrderIds: ids, exsFids },
      flowId: info.value?.flowTemplateInfo.id,
      candidateType: 1,
      flowUrgent: 1,
      status: 1,
    });
    if (res.code === 200) {
      root.$message.success('保存成功');
      info.value.formData = { ...info.value?.formData, applyOrderIds: ids, exsFids };
      await onJuniorSubmit(false);
    }
  };

  const onChangeExsOrderIds = async(ids, paymentOrderFid = '') => {
    const res = await APIcreateFlowTask({
      id,
      formData: { ...info.value?.formData, exsOrderIds: ids, paymentOrderFid },
      flowId: info.value?.flowTemplateInfo.id,
      candidateType: 1,
      flowUrgent: 1,
      status: 1,
    });
    if (res.code === 200) {
      root.$message.success('保存成功');
      info.value.formData = { ...info.value?.formData, exsOrderIds: ids, paymentOrderFid };
      await onJuniorSubmit(false);
    }
  };

  const onJuniorSubmit = async(submit = true) => {
    if (!noSubmit.value) {
      return
    }
    try {
      const { data: res } = await FlowBeforeInfo(id);
      const { data: sRes } = await APISmartAudit({ ...res.formData });
      const smartAuditResultDTOS = sRes.smartAuditResultDTOS;
      const errs = [];
      const warnings = [];

      if (sRes.passFlag) {
        if (smartAuditResultDTOS.length) {
          warningsList.value = [...smartAuditResultDTOS];
        } else {
          info.value.formData = res.formData;
          warningsList.value = [];
          errsList.value = [];
        }
        if (submit) await onRealConfirm();
      } else {
        smartAuditResultDTOS.forEach(element => {
          element.failType ? warnings.push(element) : errs.push(element);
        });
        warningsList.value = [...warnings];
        errsList.value = [...errs];
        if (submit) root.$message.error('智能初审验证失败');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const onRealConfirm = async() => {
    disabled.value = true;
    try {
      await APIcreateFlowTask({
        id: info.value.formData.id,
        candidateList: info.value.formData?._candidateList?.length > 0 ? JSON.parse(info.value?.formData?._candidateList) : null,
        candidateType: info.value.formData?._candidateList?.length > 0 ? 2 : 1,
        flowId: info.value.formData.flowId,
        flowUrgent: 1,
        status: 0,
        formData: { ...info.value.formData, status: 1 },
      });
      root.$message.success('提交成功');
      setTimeout(() => root.$router.back(), 1000);
    } catch (error) {
      console.warn(error);
    } finally {
      disabled.value = false;
    }
  };

  const onClickReject = async() => {
    if (loading.value) return;
    loading.value = true;
    try {
      const { data } = await RejectList(taskId);
      rejectInfo.value = data;
      rejectPopupOpen.value = true;
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
    }
  };

  const onConfirmReject = async(val = "") => {
    // if (loading.value) return;
    loading.value = true;
    try {
      // 未填写驳回原因的提示其必填
      if (!val) {
        root.$message.error('请输入驳回原因');
        return;
      }
      await Reject(taskId, {
        handleOpinion: rejectReason.value,
        fileList: [],
        flowId: flowId,
        id: id,
        signImg: '',
        copyIds: '',
        branchList: [],
        formData: info.value?.formData,
        candidateType: 1,
        rejectType: info.value?.approversProperties?.rejectType,
        rejectStep: rejectInfo.value?.list[0]?.nodeCode,
      });
      showSuccessAndBack();
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
      rejectPopupOpen.value = false;
    }
  };

  const loadPropertyJson = () => {
    if (!propertyJson.value) {
      store.dispatch('orgInfo/getOrgAllInfo').then(r => {});
    }
  };

  const onClickApproval = async() => {
    // && info.value?.formOperates?.filter(item => item.write).length === 0 PC端暂不支持修改表单
    if (!info.value?.approversProperties?.hasOpinion && !showCandidate.value) {
      await onApproval();
      return;
    }
    approvalPopupOpen.value = true;
  };

  const onConfirmApproval = async(val = "") => {
    // if (loading.value) return;
    loading.value = true;
    try {
      const { data: result } = await APIGetSignByUserId({
        taskId: id,
        flowTaskNodeList: info.value?.flowTaskNodeList
      });

      if (!result) {
        root.$confirm(
          '您还没有手写签名签约授权，请到小程序端补充完成后进行审批',
          '手写签名签约授权',
          {
            confirmButtonText: '知道了',
            type: 'warning'
          }
        ).then(() => {
          // root.$router.push('/pages/cicada/signature/index');
        });
        return;
      }

      const { data } = await Candidates(taskId, {
        id,
        flowId,
        formData: info.value?.formData
      });

      if (info.value?.formData?.status) {
        delete info.value.formData.status;
      }

      // 判断意见是否为必填项
      if (info.value?.approversProperties?.hasOpinion && info.value?.approversProperties?.isOpinionRequire && !val) {
        root.$message.error('请输入审批意见');
        return;
      }

      if (showCandidate.value && !(isComplete.value)) {
        root.$message.error('请选择审批人');
        return;
      }
      approvalPopupOpen.value = false;
      root.$confirm('确认审批通过?', '提示').then(async() => {
        const params = {
          handleOpinion: opinion.value || '',
          fileList: [],
          formData: info.value?.formData,
          flowId,
          id,
          signImg: '',
          copyIds: '',
          branchList: [],
          candidateType: data?.type,
          candidateList: candidateList.value,
          rejectType: info.value?.approversProperties?.rejectType,
        };
        if (Object.keys(candidateList.value).length === 0) {
          delete params.candidateList;
        }
        await Audit(taskId, params);
        showSuccessAndBack();
      });
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
    }
  };

  const onApproval = async() => {
    if (loading.value) return;
    loading.value = true;
    try {
      await onConfirmApproval();
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
    }
  };

  const onClickPress = async() => {
    if (loading.value) return;
    loading.value = true;
    try {
      root.$confirm('此操作将提示该节点尽快处理，是否继续?', '提示', {
        type: 'warning'
      }).then(async() => {
        await Press(processId.value).then(res => {
          root.$message({
            type: 'success',
            message: res.msg,
            duration: 1000
          })
        })
      });
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
    }
  };

  const onClickPreview = () => {
    if (loading.value) return;
    loading.value = true;
    try {
      router.push({
        path: "/preview/h5print",
        query: {
          templateId: info.value?.formData?.basePrintdevId,
          formId: info.value?.formData?.id,
          orderType: info.value?.formData?.orderType,
          title: '预览报销单',
        }
      });
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
    }
  };

  const onFastApproval = async(account) => {
    if (loading.value) return;
    loading.value = true;
    try {
      const { data: d } = await Candidates(taskId, {
        id: id,
        flowId: flowId,
        formData: info.value?.formData
      });
      if (info.value?.formData?.status) {
        delete info.value.formData.status;
      }
      await APIPostFastAudit(taskId, account, {
        handleOpinion: '',
        fileList: [],
        formData: info.value?.formData,
        flowId: flowId,
        id: taskId,
        signImg: '',
        copyIds: '',
        branchList: [],
        candidateType: d.type,
        rejectType: info.value?.approversProperties.rejectType
      });
      showSuccess();
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
    }
  };

  const onFastDeny = async(account, nodeCode) => {
    if (loading.value) return;
    loading.value = true;
    try {
      await APIPostFastReject(taskId, account, {
        handleOpinion: '不同意',
        fileList: [],
        flowId: flowId,
        id: taskId,
        signImg: '',
        copyIds: '',
        branchList: [],
        formData: info.value?.formData,
        candidateType: 1,
        rejectType: info.value?.approversProperties.rejectType,
        rejectStep: nodeCode
      });
      showSuccess();
    } catch (e) {
      console.warn(e);
    } finally {
      loading.value = false;
    }
  };

  const onClickShare = () => {
    shareUsersSelect.value.openDialog();
  }
  const onChangeShare = (ids, data) => {
    console.log('ids', ids);
    shareSpd(ids);
  }

  const shareSpd = async(ids) => {
    const { data: res } = await APIPostShareOrder({
      id: taskId,
      userIdList: ids || [],
    });
    if (res) {
      shareIds.value = ids;
      root.$message.success('操作成功');
    } else {
      root.$message.error('共享审批单失败');
    }
  };

  const onClickRevoke = () => {
    root.$confirm('确认撤销吗?', '提示').then(() => {
      Revoke(taskId, {
        fileList: [],
        flowId: flowId,
        id: id,
        signImg: '',
        copyIds: '',
        branchList: [],
        formData: {
          status: 2,
        },
        candidateType: 1,
        rejectType: info.value?.approversProperties?.rejectType,
        rejectStep: rejectInfo.value?.list[0]?.nodeCode,
      }).then(() => {
        showSuccessAndBack();
      });
    });
  };

  const onEdit = () => {
    const query = showEditBtn.value ? { orderId: id, isRevoked: 'true' } : { orderId: id, isFromDetail: 'true' };
    root.$router.push({ path: '/approval', query });
  };

  const preview = () => {
    root.$router.push(`/reimburseDetail?id=${id}`);
  };

  const goPrint = () => {
    // 对于已付款的，且组织中“已付款单据不允许打印”设置的是，则点击打印吐司提示
    console.log("propertyJson==================>", propertyJson.value);
    if (info.value?.formData?.isPay && propertyJson.value?.printFlag) {
      root.$message.warning("已付款单据不允许打印");
      return;
    }
    if (formType.value === 1) {
      root.$router.push(`/approvalDetail?id=${id}`);
    } else {
      root.$router.push(`/expenseAccountPrintDetail?id=${id}`);
    }
  };

  const again = () => {
    root.$router.push({ path: '/approval', query: { orderId: id, isAgain: 'true' }});
  };

  const showSuccess = async() => {
    root.$message.success('操作成功');
    const params = opType == '0' ? { flowId: flowId } : { taskNodeId: taskNodeId, taskOperatorId: taskId, flowId: flowId };
    try {
      const { data } = await FlowBeforeInfo(id || 0, params);
      info.value = data;
    } catch (e) {
      console.warn(e);
    }
  };

  const onCandidateListChange = (isDo, v) => {
    console.log('onCandidateListChange', { isDo, v });
    isComplete.value = isDo;
    candidateList.value = v;
  };

  const showSuccessAndBack = () => {
    root.$message.success('操作成功');
    setTimeout(() => root.$router.back(), 1000);
  };

  const loadData = async() => {
    const params = opType == '0' ? { flowId } : { taskNodeId, taskOperatorId: taskId, flowId };
    try {
      loadPropertyJson();
      const [{ data: detailData }, { data: shareData }] = await Promise.all([
        FlowBeforeInfo(id || 0, params),
        APIGetShareOrderDetail({ id })
      ]);
      info.value = detailData;
      await onJuniorSubmit(false);
      if (shareData && Array.isArray(shareData) && shareData.length > 0) {
        shareIds.value = shareData;
      }
    } catch (e) {
      console.error(e);
    } finally {
      root.$loading().close();
    }
  };

  return {
    loading,
    info,
    rejectPopupOpen,
    approvalPopupOpen,
    opinion,
    rejectReason,
    rejectInfo,
    shareIds,
    applyOrderInfo,
    errsList,
    warningsList,
    disabled,
    selectOrderVisible,
    selectExsOrderVisible,
    noSubmit,
    applyOrderIds,
    exsOrderIds,
    flowTaskFullName,
    applyUserName,
    flowName,
    formType,
    status,
    flowTypeName,
    showAuditBtn,
    showRevokeBtn,
    showPressBtn,
    showEditBtn,
    showPrintBtn,
    showShareBtn,
    approveResultImg,
    propertyJson,
    onLoadApplyOrderInfo,
    onSelectOrderResult,
    onSelectExsOrderResult,
    onDeleteApplyOrder,
    onDeleteExsOrder,
    onChangeApplyOrderIds,
    onJuniorSubmit,
    onRealConfirm,
    onClickReject,
    onConfirmReject,
    onClickApproval,
    onConfirmApproval,
    onApproval,
    onFastApproval,
    onFastDeny,
    shareSpd,
    onClickRevoke,
    onEdit,
    preview,
    goPrint,
    again,
    showSuccess,
    showSuccessAndBack,
    loadData,
    shareUsersSelect,
    onClickShare,
    onChangeShare,
    onClickPress,
    showAssistantCard,
    showPaymentOrder,
    onClickPreview,
    showCandidate,
    onCandidateListChange
  };
}
