// 除非显式指定标志位为false,否则皆视为true支持====>>>> supportLimit: 是否支持长度限制; supportRequired:是否支持必填校验; supportPlaceholder:是否支持提示词; supportExport:是否支持对外映射; supportEmphasize:是否支持被报销单关联时展示
export const getComList = () => [
  {
    "label": "分组容器",
    "value": "group",
    "defaultProps": {
      "label": "",
      "defaultLabel": "",
      "fieldName": "",
      "limit": 1,
      "fields": [],
      "iterable": false,
      // 分组是否可折叠, 当 iterable==false 时有效;
      "foldable": false,
      // 表单中是否默认折叠, 当 collapsible==true 时有效;
      "foldInForm": false,
      // 详情中是否默认折叠, 当 collapsible==true 时有效;
      "foldInDetail": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    },
    "supportLimit": true,
    "supportRequired": false,
    "supportPlaceholder": false,
    "supportExport": false,
    "supportReadonly": false,
    "supportEmphasize": false,
  },
  {
    "label": "普通输入框",
    "value": "input",
    "defaultProps": {
      "label": "普通输入框",
      "defaultLabel": "普通输入框",
      "fieldName": "",
      "limit": 30,
      "required": false,
      "requiredMessage": "请输入",
      "placeholder": "请输入",
      "defaultValue": '',
      "defaultInsertPhone": '',
      "export": false,
      "emphasize": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    }
  },
  {
    "label": "多行文本",
    "value": "multiInput",
    "defaultProps": {
      "label": "多行文本",
      "defaultLabel": "多行文本",
      "fieldName": "",
      "limit": 100,
      "required": false,
      "requiredMessage": "请输入",
      "placeholder": "请输入",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    }
  },
  {
    "label": "金额输入",
    "value": "amountInput",
    "defaultProps": {
      "label": "金额输入",
      "defaultLabel": "金额输入",
      "fieldName": "",
      "limit": 10,
      "required": false,
      "requiredMessage": "请输入",
      "placeholder": "请输入",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "金额大写",
          "name": "exsCostCn",
          "rename": "exsCostCn"
        }
      ]
    }
  },
  {
    "label": "金额累加",
    "value": "amountSum",
    "defaultProps": {
      "label": "金额累加",
      "defaultLabel": "金额累加",
      "fieldName": "",
      "limit": 10,
      "placeholder": "自动计算",
      "export": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "calc": "",
      "manuallyTrigger": false,
      "hiddenFieldsMapping": [
        {
          "label": "金额大写",
          "name": "sumCostCn",
          "rename": "sumCostCn"
        }
      ]
    },
    "supportLimit": true,
    "supportRequired": false,
    "supportReadonly": false
  },
  {
    "label": "数值输入",
    "value": "numberInput",
    "defaultProps": {
      "label": "数值输入",
      "defaultLabel": "数值输入",
      "fieldName": "",
      "limit": 10,
      "required": false,
      "requiredMessage": "请输入",
      "placeholder": "请输入",
      "defaultValue": '',
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    }
  },
  {
    "label": "数值累加",
    "value": "numberSum",
    "defaultProps": {
      "label": "数值累加",
      "defaultLabel": "数值累加",
      "fieldName": "",
      "limit": 10,
      "placeholder": "自动计算",
      "export": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "calc": "",
      "manuallyTrigger": false,
    },
    "supportLimit": true,
    "supportRequired": false,
    "supportReadonly": false
  },
  {
    "label": "数值相乘",
    "value": "numberMultiply",
    "defaultProps": {
      "label": "数值相乘",
      "defaultLabel": "数值相乘",
      "fieldName": "",
      "limit": 10,
      "placeholder": "自动计算",
      "export": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "calc": "a*b",
      "manuallyTrigger": false,
    },
    "supportLimit": true,
    "supportRequired": false,
    "supportReadonly": false
  },
  {
    "label": "日期选择器",
    "value": "dateTimePicker",
    "defaultProps": {
      "label": "日期选择器",
      "defaultLabel": "日期选择器",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "valueFormat": "YYYY-MM-DD HH:mm:ss",
      "displayFormat": "YYYY-MM-DD HH:mm:ss",
      "datetimePickerType": "date"
    },
    "supportLimit": false
  },
  {
    "label": "半天选择器",
    "value": "halfDayPicker",
    "defaultProps": {
      "label": "半天选择器",
      "defaultLabel": "半天选择器",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      // "valueFormat": "YYYY-MM-DD",
      // "displayFormat": "YYYY-MM-DD"
    },
    "supportLimit": false
  },
  {
    "label": "天数计算",
    "value": "daysDiff",
    "defaultProps": {
      "label": "天数计算",
      "defaultLabel": "天数计算",
      "fieldName": "",
      "placeholder": "自动计算",
      "export": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "calc": "endTime-beginTime",
      "limit": 10,
      "manuallyTrigger": false,
    },
    "supportLimit": true,
    "supportRequired": true,
    "supportReadonly": true
  },
  {
    "label": "是否选择器",
    "value": "yesOrNoPicker",
    "defaultProps": {
      "label": "是否选择器",
      "defaultLabel": "是否选择器",
      "fieldName": "",
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    },
    "supportLimit": false,
    "supportPlaceholder": false
  },
  {
    "label": "radio选择器",
    "value": "radioPicker",
    "defaultProps": {
      "label": "radio选择器",
      "defaultLabel": "radio选择器",
      "fieldName": "",
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "数据字典value值",
          "name": "label",
          "rename": "label"
        }
      ]
    },
    "supportLimit": false,
    "supportPlaceholder": false
  },
  {
    "label": "checkbox选择器",
    "value": "checkboxPicker",
    "defaultProps": {
      "label": "checkbox选择器",
      "defaultLabel": "checkbox选择器",
      "fieldName": "",
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "dataDictionary": "选项1,选项2,选项3",
      "optionDirection": "horizontal",
      "optionSeparator": ";",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    },
    "supportLimit": false,
    "supportPlaceholder": false
  },
  {
    "label": "普通选择器",
    "value": "simplePicker",
    "defaultProps": {
      "label": "普通选择器",
      "defaultLabel": "普通选择器",
      "dataDictionary": "",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "数据字典label值",
          "name": "label",
          "rename": "label"
        }
      ]
    },
    "supportLimit": false
  },
  {
    "label": "简易选择器",
    "value": "customPicker",
    "defaultProps": {
      "label": "简易选择器",
      "defaultLabel": "简易选择器",
      "dataDictionary": "选项1,选项2,选项3",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    },
    "supportLimit": false
  },
  {
    "label": "两级联动选择器",
    "value": "commonCascader",
    "defaultProps": {
      "label": "两级联动选择器",
      "defaultLabel": "两级联动选择器",
      "dataDictionary": "",
      "fieldName": "selectedIds",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": false,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "一级id",
          "name": "id1",
          "rename": "id1"
        },
        {
          "label": "一级名称",
          "name": "name1",
          "rename": "name1"
        },
        {
          "label": "二级id",
          "name": "id2",
          "rename": "id2"
        },
        {
          "label": "二级名称",
          "name": "name2",
          "rename": "name2"
        },
        {
          "label": "一二级名称",
          "name": "names",
          "rename": "names"
        },
      ]
    },
    "supportLimit": false
  },
  {
    "label": "省市区三级联动选择器",
    "value": "areaCascader",
    "defaultProps": {
      "label": "省市区三级联动选择器",
      "defaultLabel": "省市区三级联动选择器",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": false,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "省编码",
          "name": "provCode",
          "rename": "ProvCode"
        },
        {
          "label": "市编码",
          "name": "cityCode",
          "rename": "CityCode"
        },
        {
          "label": "区县编码",
          "name": "distCode",
          "rename": "DistCode"
        },
        {
          "label": "省名称",
          "name": "provName",
          "rename": "ProvName"
        },
        {
          "label": "市名称",
          "name": "cityName",
          "rename": "CityName"
        },
        {
          "label": "区县名称",
          "name": "distName",
          "rename": "DistName"
        },
        {
          "label": "省市区名称",
          "name": "fullName",
          "rename": "FullName"
        }
      ]
    },
    "supportLimit": false
  },
  {
    "label": "人员选择器",
    "value": "userSelect",
    "defaultProps": {
      "label": "人员选择器",
      "defaultLabel": "人员选择器",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择人员",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": false,
      "showInFormPro": [],
      "showInDetailPro": [],
      'deptFilter': '',
      'defaultInsert': true,
      "hiddenFieldsMapping": [
        {
          "label": "人员姓名",
          "name": "userName",
          "rename": "userName"
        }
      ]
    }
  },
  {
    "label": "部门选择器",
    "value": "deptSelect",
    "defaultProps": {
      "label": "部门选择器",
      "defaultLabel": "部门选择器",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择部门",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": false,
      "showInFormPro": [],
      "showInDetailPro": [],
      'defaultInsert': true,
      "hiddenFieldsMapping": [
        {
          "label": "部门名称",
          "name": "deptName",
          "rename": "deptName"
        }
      ]
    }
  },
  {
    "label": "预算项目",
    "value": "budgetSelect",
    "defaultProps": {
      "label": "预算项目",
      "defaultLabel": "预算项目",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": false,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "预算项目名称",
          "name": "budgetName",
          "rename": "budgetName"
        },
        {
          "label": "资金来源名称",
          "name": "sourceName",
          "rename": "sourceName"
        },
        {
          "label": "资金来源ID",
          "name": "sourceId",
          "rename": "sourceId"
        }
      ]
    }
  },
  {
    "label": "附件",
    "value": "attachment",
    "defaultProps": {
      "label": "附件",
      "defaultLabel": "附件",
      "fieldName": "",
      "limit": 1,
      "required": false,
      "requiredMessage": "请上传",
      "placeholder": "请上传",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "附件名称",
          "name": "attachmentName",
          "rename": "attachmentName"
        }
      ]
    },
    "supportEmphasize": false
  },
  {
    "label": "展示字段",
    "value": "showValue",
    "defaultProps": {
      "label": "展示字段",
      "defaultLabel": "展示字段",
      "fieldName": "",
      "placeholder": "",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": false,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "emptyHideInForm": false,
    },
    "supportLimit": false,
    "supportRequired": false,
    "supportPlaceholder": true,
    "supportReadonly": false
  },
  // {
  //   "label": "智能差旅助手",
  //   "value": "smartTravelAssistant",
  //   "defaultProps": {
  //     "label": "智能差旅助手",
  //     "defaultLabel": "智能差旅助手",
  //     "fieldName": "",
  //     "showInApprovalCenter": false,
  //     "showInForm": true,
  //     "showInDetail": true
  //   },
  //   "supportLimit": false,
  //   "supportRequired": false,
  //   "supportPlaceholder": false,
  //   "supportExport": false,
  //   "supportReadonly": false,
  //   "supportEmphasize": false
  // },
  {
    "label": "出差补助金额",
    "value": "travelAllowance",
    "defaultProps": {
      "label": "出差补助金额",
      "defaultLabel": "出差补助金额",
      "fieldName": "",
      "limit": 10,
      "required": true,
      "placeholder": "自动结算",
      "emphasize": false,
      "showInApprovalCenter": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "manuallyTrigger": false,
      // "hiddenFieldsMapping": [
      //   {
      //     "label": "金额大写",
      //     "name": "sumCostCn",
      //     "rename": "sumCostCn"
      //   }
      // ]
    },
    "supportReadonly": false
  },
  {
    "label": "关联审批单",
    "value": "relatedApproval",
    "defaultProps": {
      "label": "关联审批单",
      "defaultLabel": "关联审批单",
      "fieldName": "applyOrderIds",
      "limit": 1,
      "required": false,
      "requiredMessage": "请选择关联审批单",
      "placeholder": "请选择",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
      "hiddenFieldsMapping": [
        {
          "label": "关联审批单标题",
          "name": "relatedApprovalTitle",
          "rename": "relatedApprovalTitle"
        }
      ]
    },
    "supportEmphasize": false,
    "showInApprovalCenter": false,
  },
  {
    "label": "收款金额",
    "value": "amountInputCalc",
    "defaultProps": {
      "label": "收款金额",
      "defaultLabel": "金额输入",
      "fieldName": "",
      "limit": 10,
      "required": false,
      "requiredMessage": "请输入",
      "placeholder": "请输入",
      "export": false,
      "emphasize": false,
      "showInApprovalCenter": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "hiddenFieldsMapping": [
        {
          "label": "金额大写",
          "name": "exsCostCn",
          "rename": "exsCostCn"
        }
      ]
    }
  },
  {
    "label": "收款账户",
    "value": "accountInput",
    "defaultProps": {
      "label": "收款账户",
      "defaultLabel": "收款账户",
      "fieldName": "",
      "limit": 30,
      "required": false,
      "requiredMessage": "请输入",
      "placeholder": "请输入",
      "defaultValue": '',
      "export": false,
      "emphasize": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    }
  },
  {
    "label": "银行卡号加密输入框",
    "value": "passInput",
    "defaultProps": {
      "label": "银行卡号加密输入框",
      "defaultLabel": "银行卡号加密输入框",
      "fieldName": "",
      "limit": 30,
      "required": false,
      "requiredMessage": "请输入",
      "placeholder": "请输入",
      "defaultValue": '',
      "export": false,
      "emphasize": false,
      "readonly": false,
      "showInForm": true,
      "showInDetail": true,
      "showInFormPro": [],
      "showInDetailPro": [],
    }
  },
]

export const getNotAllowedVarNames = () => [
  '@flowFullCode',
  '@flowFullName',
  '@launchDateTime',
  '@launchTime',
  '@launchUserName',
  'accountingStatus',
  'basePrintdevId',
  'bizFlowModuleId',
  'createTime',
  'detailJson',
  'entId',
  'flowId',
  'flowStatus',
  'formCode',
  'id',
  'layoutFileUpload',
  'name',
  'orderNo',
  'orderType',
  'organizeId',
  'paymentOrderUpload',
  'positionId',
  'positionTypeId',
  'pushStatus',
  'roleId',
  'staging',
  'status',
  'stickerTicketStatus',
  'type'
]

export const defaultTemplate = () => {
  return {
    "2": '{"formType":2,"orderType":2,"smartApprovalOrderType":1,"supportStash":true,"relInvoice":true,"relApply":true,"relAnnex":true,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"单位名称","defaultLabel":"普通输入框","fieldName":"applyDept","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input","defaultValue":"三门峡市教育局"},{"label":"业务科室","defaultLabel":"部门选择器","fieldName":"businessDepartmentId","limit":1,"required":true,"requiredMessage":"请选择部门","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"deptSelect","showInApprovalCenter":false,"hiddenFieldsMapping":[{"label":"部门名称","name":"deptName","rename":"businessDepartment"}]},{"label":"业务科室","defaultLabel":"展示字段","fieldName":"businessDepartment","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","showInApprovalCenter":false,"emptyHideInForm":false},{"label":"出差事由","defaultLabel":"普通输入框","fieldName":"travelCause","limit":"50","required":true,"requiredMessage":"请输入","placeholder":"请输入出差事由","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"填表日期","defaultLabel":"日期选择器","fieldName":"writeTime1","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"附件张数","defaultLabel":"数值输入","fieldName":"attachmentNum","limit":"2","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"出差人","defaultLabel":"人员选择器","fieldName":"travelUserIds","limit":"10","required":true,"requiredMessage":"请选择出差人员","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"travelUserNames"}]},{"label":"出差人","defaultLabel":"展示字段","fieldName":"travelUserNames","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"职别","defaultLabel":"普通输入框","fieldName":"userLevel","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"出差开始时间","defaultLabel":"日期选择器","fieldName":"beginTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"出差结束时间","defaultLabel":"日期选择器","fieldName":"endTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"天数","defaultLabel":"天数计算","fieldName":"days","placeholder":"请输入或智能计算","export":true,"showInForm":true,"showInDetail":true,"component":"daysDiff","calc":"endTime-beginTime","manuallyTrigger":true,"required":true,"requiredMessage":"请输入天数","limit":"10"}],"iterable":false,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"已完成的公务支出请上传支付凭证/POS单","defaultLabel":"简易选择器","fieldName":"paymentVoucher","limit":1,"required":true,"requiredMessage":"请选择知晓上传支付凭证","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"customPicker","dataDictionary":"我已知晓","showInApprovalCenter":false}],"iterable":false,"foldable":false,"foldInForm":false,"foldInDetail":false,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"特殊情况说明","defaultLabel":"多行文本","fieldName":"specialSituationInfo","limit":"200","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"multiInput"}],"iterable":false,"component":"group"},{"label":"行程及费用","defaultLabel":"","fieldName":"travelList","limit":"8","fields":[{"label":"日期","defaultLabel":"日期选择器","fieldName":"beginTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"出发地","defaultLabel":"省市区三级联动选择器","fieldName":"depart","limit":1,"required":true,"requiredMessage":"请选择出发地点","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"areaCascader","hiddenFieldsMapping":[{"label":"省编码","name":"provCode","rename":"departProvCode"},{"label":"市编码","name":"cityCode","rename":"departCityCode"},{"label":"区县编码","name":"distCode","rename":"departDistCode"},{"label":"省名称","name":"provName","rename":"departProvName"},{"label":"市名称","name":"cityName","rename":"departCityName"},{"label":"区县名称","name":"distName","rename":"departDistName"},{"label":"省市区名称","name":"fullName","rename":"departFullName"}]},{"label":"出发地","defaultLabel":"展示字段","fieldName":"departFullName","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"到达地","defaultLabel":"省市区三级联动选择器","fieldName":"dest","limit":1,"required":true,"requiredMessage":"请选择到达地点","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"areaCascader","hiddenFieldsMapping":[{"label":"省编码","name":"provCode","rename":"destProvCode"},{"label":"市编码","name":"cityCode","rename":"destCityCode"},{"label":"区县编码","name":"distCode","rename":"destDistCode"},{"label":"省名称","name":"provName","rename":"destProvName"},{"label":"市名称","name":"cityName","rename":"destCityName"},{"label":"区县名称","name":"distName","rename":"destDistName"},{"label":"省市区名称","name":"fullName","rename":"destFullName"}]},{"label":"到达地","defaultLabel":"展示字段","fieldName":"destFullName","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":false,"component":"showValue","emptyHideInForm":false},{"label":"火车费","defaultLabel":"金额输入","fieldName":"trainCost","limit":"10","required":false,"requiredMessage":"请输入火车费","placeholder":"请输入火车费","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"夜间乘车费","defaultLabel":"金额输入","fieldName":"nightVehicleCost","limit":"10","required":false,"requiredMessage":"请输入夜间乘车费","placeholder":"请输入夜间乘车费","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"机船费","defaultLabel":"金额输入","fieldName":"airAndShipCost","placeholder":"请输入机船费","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"10","required":false,"requiredMessage":"请输入机船费","emphasize":false,"readonly":false},{"label":"汽车费","defaultLabel":"金额输入","fieldName":"carCost","limit":"10","required":false,"requiredMessage":"请输入汽车费","placeholder":"请输入汽车费","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"住宿费","defaultLabel":"金额输入","fieldName":"roomCost","limit":"10","required":false,"requiredMessage":"请输入住宿费","placeholder":"请输入住宿费","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"其他","defaultLabel":"金额输入","fieldName":"otherCost","limit":"10","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"行程天数","defaultLabel":"数值输入","fieldName":"days","limit":"2","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"出差人数","defaultLabel":"数值输入","fieldName":"number","limit":10,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput","showInApprovalCenter":false,"defaultValue":"1"},{"label":"补助标准","defaultLabel":"金额输入","fieldName":"standardCost","limit":"10","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"补助金额","defaultLabel":"数值相乘","fieldName":"subsidyCost","placeholder":"自动计算","export":false,"showInForm":true,"showInDetail":false,"component":"numberMultiply","calc":"standardCost*days*number"},{"label":"补助金额","defaultLabel":"金额累加","fieldName":"subsidyCost1","placeholder":"自动计算","export":false,"showInForm":false,"showInDetail":true,"component":"amountSum","calc":"subsidyCost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"sumCostCn"}]},{"label":"金额小计","defaultLabel":"金额累加","fieldName":"totalCost","placeholder":"自动计算","export":false,"showInForm":true,"showInDetail":true,"component":"amountSum","calc":"trainCost+airAndShipCost+nightVehicleCost+carCost+roomCost+otherCost+subsidyCost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":""}]}],"iterable":true,"component":"group","showInForm":true,"showInDetail":true},{"label":"总计","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"金额合计1","defaultLabel":"金额累加","fieldName":"exsCost1","placeholder":"自动计算","export":true,"showInForm":false,"showInDetail":false,"component":"amountSum","calc":"travelList[0].totalCost+travelList[1].totalCost+travelList[2].totalCost+travelList[3].totalCost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"exsCostCn1"}]},{"label":"金额合计大写1","defaultLabel":"展示字段","fieldName":"exsCostCn1","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":false,"component":"showValue","emptyHideInForm":false},{"label":"金额合计","defaultLabel":"金额累加","fieldName":"exsCost","placeholder":"自动计算","export":true,"showInForm":true,"showInDetail":true,"component":"amountSum","calc":"travelList.totalCost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"exsCostCn"}]},{"label":"金额合计大写","defaultLabel":"展示字段","fieldName":"exsCostCn","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"showValue","emptyHideInForm":false}],"iterable":false,"component":"group"}]}',
    "1": '{"formType":1,"orderType":1,"supportStash":true,"relTravelAssist":false,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"出差人","defaultLabel":"人员选择器","fieldName":"travelUserIds","limit":"10","required":true,"requiredMessage":"请选择出差人","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"travelUserNames"}]},{"label":"出差人","defaultLabel":"展示字段","fieldName":"travelUserNames","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"业务科室","defaultLabel":"部门选择器","fieldName":"businessDepartmentId","limit":1,"required":true,"requiredMessage":"请选择部门","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"deptSelect","showInApprovalCenter":false,"hiddenFieldsMapping":[{"label":"部门名称","name":"deptName","rename":"businessDepartment"}]},{"label":"业务科室","defaultLabel":"展示字段","fieldName":"businessDepartment","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","showInApprovalCenter":false,"emptyHideInForm":false},{"label":"填表日期","defaultLabel":"日期选择器","fieldName":"writeTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"出差事由","defaultLabel":"普通输入框","fieldName":"travelCause","limit":"50","required":true,"requiredMessage":"请输入出差事由","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"出差地点（含中途中转停留）","defaultLabel":"普通输入框","fieldName":"address","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"会议、培训期间费用支付单位","defaultLabel":"普通输入框","fieldName":"payOrg","limit":"30","required":true,"requiredMessage":"请输入费用支付单位","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"拟乘坐交通工具","defaultLabel":"普通选择器","fieldName":"vehicleType","limit":1,"required":true,"requiredMessage":"请选择拟乘坐交通工具","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"simplePicker","dataDictionary":"vehicle","hiddenFieldsMapping":[{"label":"数据字典value值","name":"label","rename":"vehicleTypeName"}]},{"label":"拟乘坐交通工具","defaultLabel":"展示字段","fieldName":"vehicleTypeName","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"是否带车","defaultLabel":"是否选择器","fieldName":"takeCar","required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"yesOrNoPicker"},{"label":"拟出差开始日期","defaultLabel":"日期选择器","fieldName":"beginTime","limit":1,"required":true,"requiredMessage":"请选择拟出差开始日期","placeholder":"请选择","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"拟出差结束日期","defaultLabel":"日期选择器","fieldName":"endTime","limit":1,"required":true,"requiredMessage":"请选择拟出差结束日期","placeholder":"请选择","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"}],"iterable":false,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"附件","defaultLabel":"附件","fieldName":"exsFids","limit":"10","required":false,"requiredMessage":"请上传","placeholder":"添加相关资料","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"attachment"}],"iterable":false,"component":"group"}]}',
    "21": '{"formType":2,"orderType":21,"supportStash":true,"relInvoice":true,"relApply":true,"relContract":false,"relAnnex":true,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"经办人","defaultLabel":"人员选择器","fieldName":"billerId","limit":1,"required":true,"requiredMessage":"请选择人员","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"biller"}]},{"label":"经办人","defaultLabel":"展示字段","fieldName":"biller","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"申请日期","defaultLabel":"日期选择器","fieldName":"fillDate","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","showInApprovalCenter":false,"valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"收款单位全称","defaultLabel":"普通输入框","fieldName":"receivingUnit","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"金额","defaultLabel":"金额输入","fieldName":"amount","limit":10,"required":true,"requiredMessage":"请输入金额","placeholder":"请输入金额","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"开户银行","defaultLabel":"普通输入框","fieldName":"bankName","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"银行账号","defaultLabel":"普通输入框","fieldName":"bankAccount","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"用途","defaultLabel":"普通输入框","fieldName":"purposes","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"合计金额","defaultLabel":"金额累加","fieldName":"exsCost","placeholder":"自动计算","export":true,"showInForm":true,"showInDetail":true,"component":"amountSum","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"exsCostCn"}],"calc":"amount"},{"label":"合计金额大写","defaultLabel":"展示字段","fieldName":"exsCostCn","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"备注","defaultLabel":"多行文本","fieldName":"remark","limit":100,"required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"multiInput"}],"iterable":false,"component":"group"},{"label":"事项","defaultLabel":"","fieldName":"item","limit":"6","fields":[{"label":"事项名称","defaultLabel":"普通输入框","fieldName":"itemName","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"金额","defaultLabel":"金额输入","fieldName":"cost","limit":10,"required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","showInApprovalCenter":false,"hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":"exsCostCn"}]}],"iterable":true,"foldable":false,"foldInForm":false,"foldInDetail":false,"component":"group"}]}',
    "25": '{"formType":2,"orderType":25,"smartApprovalOrderType":24,"relInvoice":true,"relApply":true,"relAnnex":true,"supportStash":true,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"申请科室","defaultLabel":"部门选择器","fieldName":"applyDeptId","limit":"1","required":true,"requiredMessage":"请选择申请科室","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"deptSelect","hiddenFieldsMapping":[{"label":"部门名称","name":"deptName","rename":"applyDept"}]},{"label":"申请科室","defaultLabel":"展示字段","fieldName":"applyDept","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue"},{"label":"申请日期","defaultLabel":"日期选择器","fieldName":"writeTime","limit":1,"required":true,"requiredMessage":"请选择申请日期","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"申请事项(事由)","defaultLabel":"普通输入框","fieldName":"applyItem","limit":"75","required":true,"requiredMessage":"请填写申请事项（事由）","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"经办人","defaultLabel":"人员选择器","fieldName":"agentId","limit":"1","required":true,"requiredMessage":"请选择经办人","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"agent"}]},{"label":"经办人","defaultLabel":"展示字段","fieldName":"agent","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue"}],"iterable":false,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"已完成的公务支出请上传支付凭证/POS单","defaultLabel":"简易选择器","fieldName":"paymentVoucher","limit":1,"required":true,"requiredMessage":"请选择知晓上传支付凭证","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"customPicker","dataDictionary":"我已知晓","showInApprovalCenter":false}],"iterable":false,"foldable":false,"foldInForm":false,"foldInDetail":false,"component":"group"},{"label":"事项","defaultLabel":"","fieldName":"item","limit":"4","fields":[{"label":"名称","defaultLabel":"普通输入框","fieldName":"name","limit":30,"required":true,"requiredMessage":"请填写名称","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"金额","defaultLabel":"金额输入","fieldName":"cost","limit":10,"required":true,"requiredMessage":"请填写金额","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]}],"iterable":true,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"总金额","defaultLabel":"金额累加","fieldName":"exsCost","placeholder":"自动计算","export":true,"showInForm":true,"showInDetail":true,"component":"amountSum","calc":"item.cost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"exsCostCn"}]},{"label":"总金额(大写)","defaultLabel":"展示字段","fieldName":"exsCostCn","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"showValue"}],"iterable":false,"component":"group"}]}',
    "24": '{"formType":1,"orderType":24,"supportStash":true,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"申请科室","defaultLabel":"部门选择器","fieldName":"applyDeptId","limit":1,"required":true,"requiredMessage":"请选择部门","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"deptSelect","hiddenFieldsMapping":[{"label":"部门名称","name":"deptName","rename":"applyDept"}]},{"label":"申请科室","defaultLabel":"展示字段","fieldName":"applyDept","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"申请日期","defaultLabel":"日期选择器","fieldName":"writeTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"申请事项(事由)","defaultLabel":"普通输入框","fieldName":"applyItem","limit":"75","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"经办人","defaultLabel":"人员选择器","fieldName":"agentId","limit":1,"required":true,"requiredMessage":"请选择人员","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","deptFilter":"","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"agent"}]},{"label":"经办人","defaultLabel":"展示字段","fieldName":"agent","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false}],"iterable":false,"component":"group"},{"label":"事项","defaultLabel":"","fieldName":"item","limit":"4","fields":[{"label":"名称","defaultLabel":"普通输入框","fieldName":"name","limit":"30","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"申请预算金额","defaultLabel":"金额输入","fieldName":"cost","limit":10,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]}],"iterable":true,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"总金额","defaultLabel":"金额累加","fieldName":"totalAmount","placeholder":"自动计算","export":true,"showInForm":true,"showInDetail":true,"component":"amountSum","calc":"item.cost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"totalAmountCn"}]},{"label":"合计金额大写","defaultLabel":"展示字段","fieldName":"totalAmountCn","placeholder":"","export":false,"showInForm":true,"showInDetail":true,"component":"showValue","emphasize":false,"readonly":false,"emptyHideInForm":false}],"iterable":false,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"附件","defaultLabel":"附件","fieldName":"exsFids","limit":"10","required":false,"requiredMessage":"添加相关资料","placeholder":"添加相关资料","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"attachment"}],"iterable":false,"component":"group"}]}',
    "12": '{"formType":1,"orderType":12,"supportStash":true,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"填表日期","defaultLabel":"日期选择器","fieldName":"writeTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"}],"iterable":false,"foldable":false,"foldInForm":false,"foldInDetail":false,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"编报单位","defaultLabel":"普通输入框","fieldName":"applyDept","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input","showInApprovalCenter":false},{"label":"会议名称","defaultLabel":"普通输入框","fieldName":"meetingName","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input","showInApprovalCenter":true},{"label":"会议定点单位","defaultLabel":"普通输入框","fieldName":"meetingOrg","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input","showInApprovalCenter":true},{"label":"参加会议人数","defaultLabel":"数值输入","fieldName":"meetingPersonNum","limit":"3","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"}],"iterable":false,"foldable":false,"foldInForm":false,"foldInDetail":false,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"会议召开日期","defaultLabel":"日期选择器","fieldName":"beginTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date"},{"label":"召开天数","defaultLabel":"数值输入","fieldName":"days","limit":"2","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"性质与类别","defaultLabel":"普通输入框","fieldName":"type","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"经费来源","defaultLabel":"普通输入框","fieldName":"fundsFrom","limit":"50","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"}],"iterable":false,"foldable":false,"foldInForm":false,"foldInDetail":false,"component":"group"},{"label":"01会议伙食费","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"人数","defaultLabel":"数值输入","fieldName":"mealpersonNum","limit":"3","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"天数","defaultLabel":"数值输入","fieldName":"mealdays","limit":"2","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"标准","defaultLabel":"金额输入","fieldName":"mealstandard","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"3","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"预算数","defaultLabel":"金额输入","fieldName":"mealbugdet","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"核准数","defaultLabel":"金额输入","fieldName":"mealverifyexpenses","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"实际费用","defaultLabel":"金额输入","fieldName":"mealCost","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"5","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"备注","defaultLabel":"普通输入框","fieldName":"mealremark","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"input","limit":30,"required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false,"defaultValue":""}],"iterable":false,"foldable":true,"foldInForm":true,"foldInDetail":false,"component":"group"},{"label":"02会议住宿费","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"人数","defaultLabel":"数值输入","fieldName":"hotelpersonNum","limit":"3","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"天数","defaultLabel":"数值输入","fieldName":"hoteldays","limit":"2","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"标准","defaultLabel":"金额输入","fieldName":"hotelstandard","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"3","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"预算数","defaultLabel":"金额输入","fieldName":"hotelbugdet","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"核准数","defaultLabel":"金额输入","fieldName":"hotelverifyexpenses","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"实际费用","defaultLabel":"金额输入","fieldName":"hotelCost","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"5","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"备注","defaultLabel":"普通输入框","fieldName":"hotelremark","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"}],"iterable":false,"foldable":true,"foldInForm":true,"foldInDetail":false,"component":"group"},{"label":"03会议室租用费","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"人数","defaultLabel":"数值输入","fieldName":"meetingroompersonNum","limit":"3","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"天数","defaultLabel":"数值输入","fieldName":"meetingroomdays","limit":"2","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"标准","defaultLabel":"金额输入","fieldName":"meetingroomStandard","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"3","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"预算数","defaultLabel":"金额输入","fieldName":"meetingroomBugdet","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"核准数","defaultLabel":"金额输入","fieldName":"meetingroomVerifyexpenses","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"实际费用","defaultLabel":"金额输入","fieldName":"meetingroomCost","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"5","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"备注","defaultLabel":"普通输入框","fieldName":"meetingroomremark","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"}],"iterable":false,"foldable":true,"foldInForm":true,"foldInDetail":false,"component":"group"},{"label":"04会议交通费","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"人数","defaultLabel":"数值输入","fieldName":"transpersonNum","limit":"3","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"天数","defaultLabel":"数值输入","fieldName":"transdays","limit":"2","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"标准","defaultLabel":"金额输入","fieldName":"transStandard","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"3","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"预算数","defaultLabel":"金额输入","fieldName":"transBugdet","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"核准数","defaultLabel":"金额输入","fieldName":"transVerifyexpenses","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"实际费用","defaultLabel":"金额输入","fieldName":"transCost","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"5","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"备注","defaultLabel":"普通输入框","fieldName":"transremark","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"}],"iterable":false,"foldable":true,"foldInForm":true,"foldInDetail":false,"component":"group"},{"label":"05会议公杂费","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"人数","defaultLabel":"数值输入","fieldName":"officialpersonNum","limit":"3","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"天数","defaultLabel":"数值输入","fieldName":"officialdays","limit":"2","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"标准","defaultLabel":"金额输入","fieldName":"officialStandard","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"3","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"预算数","defaultLabel":"金额输入","fieldName":"officialBugdet","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"核准数","defaultLabel":"金额输入","fieldName":"officialVerifyexpenses","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"实际费用","defaultLabel":"金额输入","fieldName":"officialCost","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"5","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"备注","defaultLabel":"普通输入框","fieldName":"officalremark","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"}],"iterable":false,"foldable":true,"foldInForm":true,"foldInDetail":false,"component":"group"},{"label":"06会议其他支出","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"人数","defaultLabel":"数值输入","fieldName":"otherpersonNum","limit":"3","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"天数","defaultLabel":"数值输入","fieldName":"otherdays","limit":"2","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"标准","defaultLabel":"金额输入","fieldName":"otherStandard","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"3","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"预算数","defaultLabel":"金额输入","fieldName":"otherBugdet","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"核准数","defaultLabel":"金额输入","fieldName":"otherVerifyexpenses","limit":"5","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"实际费用","defaultLabel":"金额输入","fieldName":"otherCost","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"5","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"备注","defaultLabel":"普通输入框","fieldName":"otherremark","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"}],"iterable":false,"foldable":true,"foldInForm":true,"foldInDetail":false,"component":"group"},{"label":"合计","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"人数","defaultLabel":"数值输入","fieldName":"totalpersonNum","limit":"3","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"天数","defaultLabel":"数值输入","fieldName":"totaldays","limit":"2","required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"标准","defaultLabel":"金额输入","fieldName":"totalStandard","placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}],"limit":"3","required":false,"requiredMessage":"请输入","emphasize":false,"readonly":false},{"label":"预算数","defaultLabel":"金额累加","fieldName":"totalBugdet","placeholder":"自动计算","export":false,"showInForm":true,"showInDetail":true,"component":"amountSum","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":""}],"calc":"mealbugdet+hotelbugdet+meetingroomBugdet+transBugdet+officialBugdet+otherBugdet"},{"label":"核准数","defaultLabel":"金额累加","fieldName":"totalVerifyexpenses","placeholder":"自动计算","export":false,"showInForm":true,"showInDetail":true,"component":"amountSum","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":""}],"calc":"mealverifyexpenses+hotelverifyexpenses+meetingroomVerifyexpenses+transVerifyexpenses+officialVerifyexpenses+otherVerifyexpenses"},{"label":"实际费用","defaultLabel":"金额累加","fieldName":"totalCost","placeholder":"自动计算","export":false,"showInForm":true,"showInDetail":true,"component":"amountSum","calc":"mealCost+hotelCost+meetingroomCost+transCost+officialCost+otherCost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"sumCostCn"}]}],"iterable":false,"foldable":true,"foldInForm":false,"foldInDetail":false,"component":"group"}]}',
    "10": '{"formType":1,"orderType":10,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"申请单位","defaultLabel":"普通输入框","fieldName":"applyDept","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"主管领导","defaultLabel":"人员选择器","fieldName":"leaderId","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"leaderName"}]},{"label":"主管领导","defaultLabel":"展示字段","fieldName":"leaderName","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"联络人","defaultLabel":"人员选择器","fieldName":"contactUserId","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"contactUserName"}]},{"label":"联络人","defaultLabel":"展示字段","fieldName":"contactUserName","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"联系电话","defaultLabel":"数值输入","fieldName":"phone","limit":"11","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"来客单位","defaultLabel":"普通输入框","fieldName":"guestDept","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input","showInApprovalCenter":true},{"label":"来客人员","defaultLabel":"普通输入框","fieldName":"guestUser","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"input"},{"label":"来客人数","defaultLabel":"数值输入","fieldName":"guestNum","limit":"3","required":true,"requiredMessage":"请输入","placeholder":"请输入","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"用餐日期","defaultLabel":"日期选择器","fieldName":"mealsTime","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"dateTimePicker","valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD","datetimePickerType":"date","showInApprovalCenter":true},{"label":"陪餐人员","defaultLabel":"人员选择器","fieldName":"mealsUserIds","limit":"6","required":true,"requiredMessage":"请选择","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"userSelect","hiddenFieldsMapping":[{"label":"人员姓名","name":"userName","rename":"mealsUserNames"}]},{"label":"陪餐人员","defaultLabel":"展示字段","fieldName":"mealsUserNames","placeholder":"","export":true,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"用餐大桌数","defaultLabel":"数值输入","fieldName":"deskBigNum","limit":"2","required":true,"requiredMessage":"请输入，没有填0","placeholder":"请输入，没有填0","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"用餐小桌数","defaultLabel":"数值输入","fieldName":"deskLittleNum","limit":"2","required":true,"requiredMessage":"请输入，没有填0","placeholder":"请输入，没有填0","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"},{"label":"预算金额","defaultLabel":"金额输入","fieldName":"amount","limit":"5","required":true,"requiredMessage":"请输入预算金额","placeholder":"请输入预算金额","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":"amountCn"}],"showInApprovalCenter":true},{"label":"预算金额大写","defaultLabel":"展示字段","fieldName":"amountCn","placeholder":"","export":false,"emphasize":false,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false}],"iterable":false,"component":"group"}]}',
    "6": '{"formType":2,"orderType":6,"relInvoice":true,"supportStash":true,"relApply":true,"relAnnex":true,"groups":[{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"部门","defaultLabel":"部门选择器","fieldName":"deptId","limit":1,"required":true,"requiredMessage":"请选择部门","placeholder":"请选择","export":true,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":false,"component":"deptSelect","hiddenFieldsMapping":[{"label":"部门名称","name":"deptName","rename":"deptName"}]},{"label":"部门","defaultLabel":"展示字段","fieldName":"deptName","placeholder":"","export":true,"emphasize":true,"readonly":false,"showInForm":false,"showInDetail":true,"component":"showValue","emptyHideInForm":false},{"label":"项目名称","defaultLabel":"普通输入框","fieldName":"projectName","limit":30,"required":false,"requiredMessage":"","placeholder":"请输入项目名称","export":true,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":false,"component":"input","showInApprovalCenter":true},{"label":"转账类型","defaultLabel":"普通选择器","fieldName":"transferType","limit":1,"required":false,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":true,"component":"simplePicker","dataDictionary":"transferType","hiddenFieldsMapping":[{"label":"数据字典value值","name":"label","rename":""}]}],"iterable":false,"component":"group"},{"label":"摘要明细","defaultLabel":"","fieldName":"unifiedDetails","limit":"4","fields":[{"label":"摘要名称","defaultLabel":"普通输入框","fieldName":"abstractName","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":false,"component":"input"},{"label":"金额","defaultLabel":"金额输入","fieldName":"cost","limit":10,"required":true,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":true,"component":"amountInput","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":""}]},{"label":"科目","defaultLabel":"普通输入框","fieldName":"subjectName","limit":30,"required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":false,"component":"input"},{"label":"附单据数","defaultLabel":"数值输入","fieldName":"billNumber","limit":10,"required":false,"requiredMessage":"请输入","placeholder":"请输入","export":false,"emphasize":true,"readonly":false,"showInForm":true,"showInDetail":true,"component":"numberInput"}],"iterable":true,"component":"group"},{"label":"","defaultLabel":"","fieldName":"","limit":1,"fields":[{"label":"总金额（元）","defaultLabel":"金额累加","fieldName":"exsCost","placeholder":"自动计算","export":true,"showInForm":true,"showInDetail":true,"component":"amountSum","calc":"unifiedDetails.cost","hiddenFieldsMapping":[{"label":"金额大写","name":"sumCostCn","rename":"exsCostCn"}],"emphasize":true,"showInApprovalCenter":true},{"label":"总金额大写","defaultLabel":"展示字段","fieldName":"exsCostCn","placeholder":"","export":true,"showInForm":true,"showInDetail":true,"component":"showValue","emphasize":true,"readonly":false,"emptyHideInForm":false}],"iterable":false,"component":"group"}]}'
  }
};

export const exsPayListGroupTemplate = () => {
  return '{"label":"报销支付明细","defaultLabel":"","fieldName":"exsPayList","limit":"10","fields":[{"label":"收款账户","defaultLabel":"收款账户","fieldName":"payeeName","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"accountInput"},{"label":"收款方式","defaultLabel":"简易选择器","fieldName":"payeeWay","required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"component":"customPicker","showInApprovalCenter":false,"dataDictionary":"公务卡,银行卡","limit":1}, {"label":"开户行","defaultLabel":"普通输入框","fieldName":"payeeOpenedBank","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"showInFormPro":[],"showInDetailPro":[],"component":"input"}, {"label":"银行卡号","defaultLabel":"银行卡号加密输入框","fieldName":"payeeBankNumber","limit":30,"required":true,"requiredMessage":"请输入","placeholder":"请输入","defaultValue":"","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"showInFormPro":[],"showInDetailPro":[],"component":"passInput"},{"label":"收款金额","defaultLabel":"金额输入","fieldName":"payeeCost","limit":10,"placeholder":"请输入","export":false,"showInForm":true,"showInDetail":true,"component":"amountInputCalc","hiddenFieldsMapping":[{"label":"金额大写","name":"exsCostCn","rename":"payeeCostCn"}],"required":true,"requiredMessage":"请输入","emphasize":false,"showInApprovalCenter":false,"readonly":false},{"label":"刷卡日期","defaultLabel":"日期选择器","fieldName":"bizCardDate","limit":1,"required":true,"requiredMessage":"请选择","placeholder":"请选择","export":false,"emphasize":false,"readonly":false,"showInForm":true,"showInDetail":true,"showInFormPro":[{"type":"字段","fieldName":"payeeWay","compare":"等于","value":"公务卡","logic":"并且"}], "showInDetailPro":[ {"type":"字段","fieldName":"payeeWay","compare":"等于","value":"公务卡","logic":"并且"}],"component":"dateTimePicker","showInApprovalCenter":false,"valueFormat":"YYYY-MM-DD","displayFormat":"YYYY-MM-DD", "datetimePickerType":"date"}],"iterable":true,"foldable":false,"foldInForm":false,"foldInDetail":false,"component":"group","showInForm":true,"showInDetail":true}';
};
