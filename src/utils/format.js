/**
 * 将数字金额转为大写, (来自 https://blog.csdn.net/qq_45609680/article/details/129296641 )
 * @param money 金额(数字), 字符串或数字
 */
export const cashToChinese = (money) => {
  if (money == '' || money == null) {
    return '';
  }
  let cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']; // 汉字的数字
  let cnIntRadice = ['', '拾', '佰', '仟']; // 基本单位
  let cnIntUnits = ['', '万', '亿', '兆']; // 对应整数部分扩展单位
  let cnDecUnits = ['角', '分', '毫', '厘']; // 对应小数部分单位
  let cnInteger = '整'; // 整数金额时后面跟的字符
  let cnIntLast = '元'; // 整数完以后的单位
  // 最大处理的数字
  let maxNum = 99999999999.9999;
  let integerNum; // 金额整数部分
  let decimalNum; // 金额小数部分
  // 输出的中文金额字符串
  let chineseStr = '';
  money = parseFloat(money);
  if (money >= maxNum) {
    // 超出最大处理数字
    return '';
  }
  if (money == 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger;
    return chineseStr;
  }
  // 四舍五入保留两位小数,转换为字符串
  money = Math.round(money * 100).toString();
  integerNum = money.substr(0, money.length - 2);
  decimalNum = money.substr(money.length - 2);
  // 获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0;
    let IntLen = integerNum.length;
    for (let i = 0; i < IntLen; i++) {
      let n = integerNum.substr(i, 1);
      let p = IntLen - i - 1;
      let q = p / 4;
      let m = p % 4;
      if (n == '0') {
        zeroCount++;
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0];
        }
        // 归零
        zeroCount = 0;
        chineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
      }
      if (m == 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q];
      }
    }
    chineseStr += cnIntLast;
  }
  // 小数部分
  if (decimalNum != '') {
    let decLen = decimalNum.length;
    for (let i = 0; i < decLen; i++) {
      let n = decimalNum.substr(i, 1);
      if (n != '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i];
      }
    }
  }
  if (chineseStr == '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger;
  } else if (decimalNum == '' || /^0*$/.test(decimalNum)) {
    chineseStr += cnInteger;
  }
  return chineseStr;
};

// 格式化钱
export const formatCash = (input) => {
  let ret = typeof input === 'string' ? parseFloat(input) : input;
  if (!isNaN(ret)) {
    ret = ret.toFixed(2);
  }
  return `${ret}`;
};

// 累加计算总金额, 不特定数量参数, 如果某个参数为空值则忽略; 返回值已被格式化,不需要再调用formatCash方法
export const sumCash = (...inputs) => {
  let sum = 0;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    let temp = typeof input === 'string' ? parseFloat(input) : input;
    // eslint-disable-next-line no-restricted-globals
    if (temp != null && !isNaN(temp)) {
      sum = sum + temp;
    }
  }
  return sum.toFixed(2);
};

// 参考 https://www.jb51.net/javascript/313244mzj.htm
// 加法运算 (已解决精度问题)
export const add = (a, b) => {
  const precision = Math.max(getPrecision(a), getPrecision(b));
  const multiplier = Math.pow(10, precision);
  return (Math.round(a * multiplier) + Math.round(b * multiplier)) / multiplier;
};

// 减法运算 (已解决精度问题)
export const subtract = (a, b) => {
  return add(a, -b);
};

// 乘法运算 (已解决精度问题)
export const multiply = (a, b) => {
  const precision = getPrecision(a) + getPrecision(b);
  const multiplier = Math.pow(10, precision);
  return (Math.round(a * multiplier) * Math.round(b * multiplier)) / (multiplier * multiplier);
};

// 除法运算 (已解决精度问题)
export const divide = (a, b) => {
  const precision = getPrecision(a) - getPrecision(b);
  const divisor = Math.pow(10, precision);
  return Math.round((a / b) * divisor) / divisor;
};

// 获取浮点数的小数位数 (已解决精度问题)
const getPrecision = (num) => {
  const str = String(num);
  const decimalIndex = str.indexOf('.');
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
};

export const autoAddCashPrefix = val => {
  if (val == '0') return val;
  return !val || val == '' ? '-' : `¥${val}`;
};

/**
 * 将数字转中文
 * @param num 数字
 */
export const numToChinese = (num) => {
  if (num == null) {
    return '';
  }
  const chineseNumArr = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const chineseUnitArr = ['', '十', '百', '千', '万', '亿'];

  let result = '';
  let unitIndex = 0;

  if (num === 0) {
    result = chineseNumArr[0];
  }

  while (num > 0) {
    let temp = num % 10;
    if (temp === 0) {
      if (result[0] !== chineseNumArr[0]) {
        result = chineseNumArr[0] + result;
      }
    } else {
      result = chineseNumArr[temp] + chineseUnitArr[unitIndex] + result;
    }

    unitIndex++;
    num = Math.floor(num / 10);
  }

  return result;
};

const transitionJsonToString = (jsonObj, callback) => {
  // 转换后的jsonObj受体对象
  let _jsonObj = null;
  // 判断传入的jsonObj对象是不是字符串，如果是字符串需要先转换为对象，再转换为字符串，这样做是为了保证转换后的字符串为双引号
  if (Object.prototype.toString.call(jsonObj) !== '[object String]') {
    try {
      _jsonObj = JSON.stringify(jsonObj);
    } catch (error) {
      // 转换失败错误信息
      console.error('您传递的json数据格式有误，请核对...');
      console.error(error);
      callback && callback(error);
    }
  } else {
    try {
      // eslint-disable-next-line no-useless-escape
      jsonObj = jsonObj.replace(/(\')/g, '"');
      _jsonObj = JSON.stringify(JSON.parse(jsonObj));
    } catch (error) {
      // 转换失败错误信息
      console.error('您传递的json数据格式有误，请核对...');
      console.error(error);
      callback && callback(error);
    }
  }
  return _jsonObj;
};
// 将json对象转换为可友好阅读带空格缩进的字符串
export const formatJson = (jsonObj, callback) => {
  // 正则表达式匹配规则变量
  let reg = null;
  // 转换后的字符串变量
  let formatted = '';
  // 换行缩进位数
  let pad = 0;
  // 一个tab对应空格位数
  let PADDING = '    ';
  // json对象转换为字符串变量
  let jsonString = transitionJsonToString(jsonObj, callback);
  if (!jsonString) {
    return jsonString;
  }
  // 存储需要特殊处理的字符串段
  let _index = [];
  // 存储需要特殊处理的“再数组中的开始位置变量索引
  let _indexStart = null;
  // 存储需要特殊处理的“再数组中的结束位置变量索引
  let _indexEnd = null;
  // 将jsonString字符串内容通过\r\n符分割成数组
  let jsonArray = [];
  // 正则匹配到{,}符号则在两边添加回车换行
  // eslint-disable-next-line no-useless-escape
  jsonString = jsonString.replace(/([\{\}])/g, '\r\n$1\r\n');
  // 正则匹配到[,]符号则在两边添加回车换行
  // eslint-disable-next-line no-useless-escape
  jsonString = jsonString.replace(/([\[\]])/g, '\r\n$1\r\n');
  // 正则匹配到,符号则在两边添加回车换行
  // eslint-disable-next-line no-useless-escape
  jsonString = jsonString.replace(/(\,)/g, '$1\r\n');
  // 正则匹配到要超过一行的换行需要改为一行
  jsonString = jsonString.replace(/(\r\n\r\n)/g, '\r\n');
  // 正则匹配到单独处于一行的,符号时需要去掉换行，将,置于同行
  // eslint-disable-next-line no-useless-escape
  jsonString = jsonString.replace(/\r\n\,/g, ',');
  // 特殊处理双引号中的内容
  jsonArray = jsonString.split('\r\n');
  jsonArray.forEach(function(node, index) {
    // 获取当前字符串段中"的数量
    // eslint-disable-next-line no-useless-escape
    let num = node.match(/\"/g) ? node.match(/\"/g).length : 0;
    // 判断num是否为奇数来确定是否需要特殊处理
    if (num % 2 && !_indexStart) {
      _indexStart = index;
    }
    if (num % 2 && _indexStart && _indexStart != index) {
      _indexEnd = index;
    }
    // 将需要特殊处理的字符串段的其实位置和结束位置信息存入，并对应重置开始时和结束变量
    if (_indexStart && _indexEnd) {
      _index.push({
        start: _indexStart,
        end: _indexEnd
      });
      _indexStart = null;
      _indexEnd = null;
    }
  });
  // 开始处理双引号中的内容，将多余的"去除
  _index.reverse().forEach(function(item, index) {
    let newArray = jsonArray.slice(item.start, item.end + 1);
    jsonArray.splice(item.start, item.end + 1 - item.start, newArray.join(''));
  });
  // 奖处理后的数组通过\r\n连接符重组为字符串
  jsonString = jsonArray.join('\r\n');
  // 将匹配到:后为回车换行加大括号替换为冒号加大括号
  // eslint-disable-next-line no-useless-escape
  jsonString = jsonString.replace(/\:\r\n\{/g, ':{');
  // 将匹配到:后为回车换行加中括号替换为冒号加中括号
  // eslint-disable-next-line no-useless-escape
  jsonString = jsonString.replace(/\:\r\n\[/g, ':[');
  // 将上述转换后的字符串再次以\r\n分割成数组
  jsonArray = jsonString.split('\r\n');
  // 将转换完成的字符串根据PADDING值来组合成最终的形态
  jsonArray.forEach(function(item, index) {
    let i = 0;
    // 表示缩进的位数，以tab作为计数单位
    let indent = 0;
    // 表示缩进的位数，以空格作为计数单位
    let padding = '';
    if (item.match(/\{$/) || item.match(/\[$/)) {
      // 匹配到以{和[结尾的时候indent加1
      indent += 1;
    } else if (item.match(/\}$/) || item.match(/\]$/) || item.match(/\},$/) || item.match(/\],$/)) {
      // 匹配到以}和]结尾的时候indent减1
      if (pad !== 0) {
        pad -= 1;
      }
    } else {
      indent = 0;
    }
    for (i = 0; i < pad; i++) {
      padding += PADDING;
    }
    formatted += padding + item + '\r\n';
    pad += indent;
  });
  // 返回的数据需要去除两边的空格
  return formatted.trim();
};

export const toInt = (val, defaultVal) => {
  let ret = defaultVal;
  if (val != null) {
    if (typeof val === 'string' && val.length > 0) {
      const v = parseInt(val);
      if (!isNaN(v)) {
        ret = v;
      }
    } else if (typeof val === 'number') {
      ret = val;
    }
  }
  return ret;
};

/**
 * 将深层次对象转为单层对象(要求原正经对象的key不能有字符:点);; 例如:  { mx: [{ name: "x" , desc:"d" }, { name: "xxx" }], info: { detail: "zz" }}   ==转换结果==>  { "mx.0.name": "x", "mx.0.desc":"d", "mx.1.name": "xxx", "info.detail": "zz" }
 * <br>测试代码: toSingleLevelObj({ mx: [{ name: "x", desc: "d" }, { name: "xxx" }, "bbb"], info: { detail: "zz" }, t: [4, 5, 6], e: null, f: undefined }); 输出结果 {"mx.0.name":"x","mx.0.desc":"d","mx.1.name":"xxx","mx.2":"bbb","info.detail":"zz","t.0":4,"t.1":5,"t.2":6,"e":null}
 * @param obj 正经对象
 * @param parentPrefix 外部调用本方法时, 请勿传本字段
 */
const toSingleLevelObj = (obj, parentPrefix) => {
  let ret = {};
  if (obj) {
    if (obj instanceof Array) {
      obj.forEach((v, i) => {
        // 处理数组和对象
        if (v && (v instanceof Array || typeof v === 'object')) { // 数组 或 对象
          const temp = toSingleLevelObj(v, parentPrefix ? `${parentPrefix}.${i}` : `${i}`);
          ret = { ...ret, ...temp }
        } else {
          ret[parentPrefix ? `${parentPrefix}.${i}` : `${i}`] = v;
        }
      })
    } else if (typeof obj === 'object') {
      Object.keys(obj).forEach(k => {
        const v = obj[k];
        // 处理数组和对象
        if (v && (v instanceof Array || typeof v === 'object')) { // 数组 或 对象
          const temp = toSingleLevelObj(v, parentPrefix ? `${parentPrefix}.${k}` : `${k}`);
          ret = { ...ret, ...temp }
        } else {
          ret[parentPrefix ? `${parentPrefix}.${k}` : `${k}`] = v;
        }
      })
    }
  }
  return ret;
}

/**
 * 将 由toSingleLevelObj()方法 转换的结果, 再恢复回原本的样子
 * @param obj 不正经对象
 */
const recoverObj = (obj) => {
  let ret = {};
  const handle = (key, parentValue, curValue) => {
    if (key) {
      const kArr = key.split(".");
      const k0isNum = /^\d+$/.test(kArr[0])
      const k0 = k0isNum ? Number(kArr[0]) : kArr[0];
      const r = !parentValue ? (k0isNum ? [] : {}) : parentValue
      const hasKey1 = key.indexOf(".") > 0
      const subKey = hasKey1 ? key.substring(key.indexOf(".") + 1) : undefined
      const k1isNum = /^\d+$/.test(kArr[1])
      r[k0] = !r[k0] ? (k1isNum ? [] : {}) : r[k0]
      if (!hasKey1) {
        r[k0] = curValue;
      } else {
        r[k0] = handle(subKey, r[k0], curValue);
      }
      return r;
    } else {
      return curValue
    }
  }
  if (obj) {
    if (!(obj instanceof Array) && typeof obj === 'object') {
      const objKeys = Object.keys(obj);
      objKeys.forEach(k => {
        const v = obj[k];
        if (k.indexOf(".") > 0) {
          let subKey = k.substring(k.indexOf(".") + 1)
          const kArr = k.split(".");
          const k0 = kArr[0];
          const k1 = kArr[1];
          const k1isNum = /^\d+$/.test(k1)
          let parentValue;
          if (k1isNum) { // 子项需转为数组
            if (!ret[k0]) {
              ret[k0] = [];
            }
            subKey = subKey.indexOf('.') > 0 ? subKey.substring(subKey.indexOf('.') + 1) : undefined;
            parentValue = ret[k0][k1]
            ret[k0][k1] = handle(subKey, parentValue, v);
          } else { // 子项需转为对象
            if (!ret[k0]) {
              ret[k0] = {};
            }
            parentValue = ret[k0]
            ret[k0] = handle(subKey, parentValue, v);
          }
        } else {
          ret[k] = v;
        }
      })
    }
  }
  return ret;
}

export { toSingleLevelObj, recoverObj }

const flattenObjectWithArrays = (obj, parentKey = '', separator = '.') => {
  let flattened = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = parentKey ? `${parentKey}${separator}${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item, index) => {
            Object.assign(flattened, flattenObjectWithArrays(item, `${newKey}[${index}]`, separator));
          });
        } else {
          Object.assign(flattened, flattenObjectWithArrays(obj[key], newKey, separator));
        }
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  return flattened;
}

const unflattenObjectWithArrays = (flattened, separator = '.') => {
  let unflattened = {};
  for (let key in flattened) {
    if (flattened.hasOwnProperty(key)) {
      const keys = key.split(separator).reduce((acc, part) => {
        const arrayMatch = part.match(/(.*)\[(\d+)\]$/);
        if (arrayMatch) {
          acc.push(arrayMatch[1], parseInt(arrayMatch[2], 10));
        } else {
          acc.push(part);
        }
        return acc;
      }, []);
      keys.reduce((acc, part, index) => {
        if (index === keys.length - 1) {
          acc[part] = flattened[key];
        } else {
          if (typeof keys[index + 1] === 'number') {
            acc[part] = acc[part] || [];
          } else {
            acc[part] = acc[part] || {};
          }
        }
        return acc[part];
      }, unflattened);
    }
  }
  return unflattened;
}

export { flattenObjectWithArrays, unflattenObjectWithArrays }
