// 审批中心状态
export const getFlowStatusList = () => [
  {
    value: 0,
    label: '等待提交',
    color: 'gray',
  },
  {
    value: 1,
    label: '等待审核',
    color: 'orange',
  },
  {
    value: 2,
    label: '审核通过',
    color: 'success',
  },
  {
    value: 3,
    label: '审核退回',
    color: 'fail',
  },
  {
    value: 4,
    label: '已撤回',
    color: 'gray',
  },
  {
    value: 5,
    label: '审核终止',
    color: 'fail',
  },
  {
    value: 6,
    label: '已被挂起',
    color: 'fail',
  },
];

export const getFlowStatusMap = () => {
  const ret = {};
  const list = getFlowStatusList();
  list.forEach(v => {
    ret[v.value] = v;
  });
  return ret;
};

// 关联审批单状态
export const getSpdStatus = () => [
  { value: '', label: '全部', color: 'gray' },
  { value: '0', label: '草稿', color: 'gray' },
  { value: '4', label: '被驳回', color: 'red' },
  { value: '1', label: '审批中', color: 'orange' },
  { value: '2', label: '已撤回', color: 'gray' },
  { value: '3', label: '审批完成', color: 'success' },
];

export const getSpdStatusMap = () => {
  const ret = {};
  const list = getSpdStatus();
  list.forEach(v => {
    ret[v.value] = v;
  });
  return ret;
};

// 省内省外
export const getCrossProvOptions = () => [
  {
    label: '省内',
    value: 0,
  },
  {
    label: '省外',
    value: 1,
  },
];

export const getCrossProvMap = () => {
  const ret = {};
  const list = getCrossProvOptions();
  list.forEach(v => {
    ret[v.value] = v;
  });
  return ret;
};

// 单程往返
export const getSingleReturnOptions = () => [
  {
    label: '单程',
    value: 0,
  },
  {
    label: '往返',
    value: 1,
  },
];

export const getSingleReturnMap = () => {
  const ret = {};
  const list = getSingleReturnOptions();
  list.forEach(v => {
    ret[v.value] = v;
  });
  return ret;
};

/**
 * 获取审批戳图片URL ,---(只有当操作类型是: 我发起的 或 流程监控 时, 才会显示戳)
 * @param {number} status status : 0等待提交, 1等待审核, 2审核通过, 3审核退回, 4流程撤回, 5审核终止, 6已被挂起
 * @param {string} opType opType 取值： -1 - 我发起的新建/编辑; 0 - 我发起的详情; 1 - 待办事宜; 2 - 已办事宜; 3 - 抄送事宜; 4 - 流程监控
 * @returns {string|undefined}
 */
export const getApproveResultImg = (status, opType) => {
  console.log('getApproveResultImg', { status, opType });
  // 只有当操作类型是: 我发起的 或 流程监控 时, 才会显示戳
  if (status == null || opType == null || !['0', '4'].includes(opType)) return undefined;
  // console.log('getApproveResultImg 222', { status, opType });
  // 审批中
  const IMG_SPZ = 'https://image.smxzhcs.cn/smxsc/M00/2C/61/CqDIlGUAHueAfXbCAAAfrNp6jME563.png';
  // 审批完成
  const IMG_SPWC = 'https://image.smxzhcs.cn/smxsc/M00/2C/63/CqDIk2UAHueAAP6fAAAgwjLe3AY860.png';
  // 审批未通过
  const IMG_SPWTG = 'https://image.smxzhcs.cn/smxsc/M00/2C/63/CqDIk2UAHueAZSkiAAAlJUHDXJs722.png';
  // 已撤回
  const IMG_REVOKE = 'https://image.smxzhcs.cn/smxsc/M00/2C/78/CqDIlGUM8_qAf1oUAAAzJJV60yY945.png';
  switch (status) {
    case 0:
      return undefined;
    case 1:
      return IMG_SPZ;
    case 2:
      return IMG_SPWC;
    case 4:
      return IMG_REVOKE;
    case 3:
    case 5:
    case 6:
      return IMG_SPWTG;
  }
  return undefined;
};

export const getHandleStatusMap = () => ({
  0: '退回',
  1: '通过',
  2: '发起',
  3: '撤回',
  4: '终止',
  5: '指派',
  6: '加签',
  7: '转审',
  8: '变更',
  9: '复活',
});

// 首页地址
export const getFirstPagePath = () => '/pages/index/index';

export const INVOICE_TYPE = {
  vat_invoice: '增值税发票',
  quota_invoice: '定额发票',
  taxi_receipt: '出租车发票',
  train_ticket: '火车票',
  air_ticket: '飞机行程单',
  bus_ticket: '汽车票',
  printed_invoice: '机打发票',
  toll_invoice: '过路过桥费发票',
  ferry_ticket: '船票',
  taxi_online_ticket: '网约车行程单',
  limit_invoice: '限额发票',
  shopping_receipt: '购物小票',
  pos_invoice: 'pos小票',
  motor_vehicle_invoice: '机动车销售发票',
  roll_normal_invoice: '卷票',
  used_vehicle_invoice: '二手车发票',
  others: '其他',
  social_group_dues: '社会团体会费财政票据',
  non_tax_income: '非税收入一般缴款书',
};

// 发票查验状态
export const checkInvoiceStatus = (checkType, checkStatus) => {
  let statusTxt = '',
    color = '';
  if (checkType == 0) {
    // checkType = 0 人工手动查验
    if (checkStatus == 1) {
      statusTxt = '人工查验成功';
      color = 'success';
    } else if (checkStatus == -1) {
      statusTxt = '查验失败';
      color = 'orange';
    }
  } else {
    // 机器查验
    if (checkStatus == 1) {
      statusTxt = '查验成功';
      color = 'success';
    } else if (checkStatus == 2) {
      statusTxt = '个人上传查验凭证';
      color = 'success';
    } else if (checkStatus == -1) {
      statusTxt = '查验失败';
      color = 'orange';
    }
  }
  return {
    statusTxt,
    color,
  };
};

// 发票号码字段，不通的发票类型有不同的号码字段
export const InvoiceNumberField = {
  airTicket: 'ticketNumber',
  quotaInvoice: 'number',
  taxiReceipt: 'invoiceNum',
  trainTicket: 'ticketNum',
  vatInvoice: 'number',
};

// 未知的文件类型图片
export const FILE_TYPE_ICON_UNKNOWN = 'https://image.smxzhcs.cn/smxsc/M00/2D/07/CqDIk2VgUx2AVZjiAAABFC3JONE886.png';

// 不同类型的文件的icon;  注意: key小写
export const getFileTypeIconMap = () => {
  const ret = {
    pdf: 'https://image.smxzhcs.cn/smxsc/M00/2D/07/CqDIk2VgUx6AACMdAAAEGsRy7iA333.png',
  };
  ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'ico', 'bmp'].forEach(
    k => (ret[k] = 'https://image.smxzhcs.cn/smxsc/M00/2D/07/CqDIk2VgUx6AeBjoAAACzBvvXDA626.png'),
  );
  ['xls', 'xlsx'].forEach(k => (ret[k] = 'https://image.smxzhcs.cn/smxsc/M00/2D/05/CqDIlGVgUx2Aem7iAAADAdM6ymU877.png'));
  ['doc', 'docx'].forEach(k => (ret[k] = 'https://image.smxzhcs.cn/smxsc/M00/2D/05/CqDIlGVgUx2AYe4XAAADmZaj_4E052.png'));
  ['xml'].forEach(k => (ret[k] = 'https://image.smxzhcs.cn/smxsc/M00/2D/4E/CqDIk2WM0fOAf1ocAAAC3nGb0u0514.png'));
  ['ofd'].forEach(k => (ret[k] = 'http://minio.smxzhcs.cn/smxol-pre/TuChuang/public/a8fdeddc-a021-42e0-a2fc-0e2f5bb44fd5.png'));
  return ret;
};

export const goPreviewPrint = () => {

}

export const openFileOrFiles = async(multiple = false, contentType = '') => {
  const supportsFileSystemAccess =
    "showOpenFilePicker" in window &&
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })();

  // 修改默认类型的定义方式
  const defaultTypes = [{
    description: '支持的文件类型',
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/ofd': ['.ofd']
    }
  }];

  // 修改单个类型的配置生成函数
  const getSingleTypeConfig = (type) => {
    // 特殊处理图片类型
    if (type === 'image/png') {
      return [{
        description: '图片文件',
        accept: {
          'image/png': ['.png']
        }
      }];
    }
    if (type === 'image/jpeg') {
      return [{
        description: '图片文件',
        accept: {
          'image/jpeg': ['.jpg', '.jpeg']
        }
      }];
    }
    // 其他类型的处理
    const extension = type.split('/')[1];
    return [{
      description: '指定的文件类型',
      accept: {
        [type]: [`.${extension}`]
      }
    }];
  };

  if (supportsFileSystemAccess) {
    let fileOrFiles;
    try {
      const pickerOpts = {
        multiple,
        types: contentType ? getSingleTypeConfig(contentType) : defaultTypes
      };

      const handles = await window.showOpenFilePicker(pickerOpts);

      if (!multiple) {
        fileOrFiles = await handles[0].getFile();
        fileOrFiles.handle = handles[0];
      } else {
        fileOrFiles = await Promise.all(
          handles.map(async(handle) => {
            const file = await handle.getFile();
            file.handle = handle;
            return file;
          })
        );
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error(err.name, err.message);
      }
    }
    return fileOrFiles;
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.style.display = 'none';
    input.type = 'file';
    input.accept = contentType || '.pdf,.xls,.xlsx,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.ofd';
    document.body.append(input);
    if (multiple) {
      input.multiple = true;
    }

    input.addEventListener('change', () => {
      input.remove();
      if (!input.files) {
        return;
      }
      resolve(multiple ? Array.from(input.files) : input.files[0]);
    });

    if ('showPicker' in HTMLInputElement.prototype) {
      input.showPicker();
    } else {
      input.click();
    }
  });
};

// 运算符对应值
export const OperatorField = new Map([
  ['大于等于', '>='],
  ['大于', '>'],
  ['等于', '=='],
  ['小于等于', '<='],
  ['小于', '<'],
  ['不等于', '!='],
  ['包含', 'include'],
  ['不包含', 'exclude'],
  ['并且', '&&'],
  ['或者', '||'],
]);
// 获取运算公式结果
export const getPositionFormulaResult = (arr, val) => {
  let result = false;
  for (let i = 0; i < arr.length; i++) {
    const pro = arr[i];
    let key;
    if (pro.type === '字段') {
      key = val[pro.fieldName];
    } else {
      key = val[pro.fieldName] ? val[pro.fieldName].length : undefined;
    }
    let result1 = false;
    if (key !== undefined) {
      if (OperatorField.get(pro.compare) === '>=') {
        result1 = key >= pro.value;
      } else if (OperatorField.get(pro.compare) === '>') {
        result1 = key > pro.value;
      } else if (OperatorField.get(pro.compare) === '==') {
        result1 = key == pro.value;
      } else if (OperatorField.get(pro.compare) === '<=') {
        result1 = key <= pro.value;
      } else if (OperatorField.get(pro.compare) === '<') {
        result1 = key < pro.value;
      } else if (OperatorField.get(pro.compare) === '!=') {
        result1 = key != pro.value;
      } else if (OperatorField.get(pro.compare) === 'include') {
        if (typeof key === 'number') {
          result1 = key.toString().indexOf(pro.value) > -1;
        } else if (typeof key === 'string') {
          result1 = key.indexOf(pro.value) > -1;
        } else {
          result1 = key.includes(pro.value);
        }
      } else if (OperatorField.get(pro.compare) === 'exclude') {
        if (typeof key === 'number') {
          result1 = key.toString().indexOf(pro.value) === -1;
        } else if (typeof key === 'string') {
          result1 = key.indexOf(pro.value) === -1;
        } else {
          result1 = !key.includes(pro.value);
        }
      }
    }
    if (OperatorField.get(pro.logic) === '&&') {
      if (i === 0) {
        result = result1;
      } else {
        result = result && result1;
      }
    } else {
      result = result || result1;
    }
  }
  return result;
};

// 判断后续审批节点是否需要指定审批人
export const checkSelectCandidate = (flowTaskNodeList) => {
  let result = false;
  if (!flowTaskNodeList) {
    return result;
  }
  const index = flowTaskNodeList.findIndex(v => v.type === "1");
  const nextIndex = index + 1;

  for (let i = nextIndex; i < flowTaskNodeList.length; i++) {
    const tNode = flowTaskNodeList[i];
    const nodePropertyJson = typeof tNode.nodePropertyJson === 'string' ? JSON.parse(tNode.nodePropertyJson) : tNode.nodePropertyJson;
    if (nodePropertyJson?.properties?.assigneeType === '7') {
      let role = 0;
      if (nodePropertyJson?.properties?.candidateConfig) {
        role = nodePropertyJson.properties.candidateConfig.role;
      }
      if (role) {
        result = true;
        break;
      }
    }
  }
  return result;
}
