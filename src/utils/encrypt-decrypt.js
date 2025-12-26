const keyName = process.env.VUE_APP_STORAGE_KEY_PREFIX;
export const getStore = (params = {}) => {
  let { name, debug } = params;
  name = keyName + name;
  let obj = {};
  let content = '';
  obj = window.sessionStorage.getItem(name);
  if (validatenull(obj)) {
    obj = window.localStorage.getItem(name);
  }
  if (validatenull(obj)) {
    return;
  }
  try {
    obj = JSON.parse(obj);
  } catch {
    return obj;
  }
  if (debug) {
    return obj;
  }
  if (obj.dataType === 'string') {
    content = obj.content;
  } else if (obj.dataType === 'number') {
    content = Number(obj.content);
  } else if (obj.dataType === 'boolean') {
    content = obj.content;
  } else if (obj.dataType === 'object') {
    content = obj.content;
  }
  return content;
};
/**
 * 存储localStorage
 */
export const setStore = (params = {}) => {
  let { name, content, type } = params;
  name = keyName + name;
  const obj = {
    dataType: typeof content,
    content,
    type,
    datetime: new Date().getTime()
  };
  const final = JSON.stringify(obj);
  if (type) {
    window.sessionStorage.setItem(name, final);
  } else {
    window.localStorage.setItem(name, final);
  }
};
/**
 * 判断是否为空
 */
export function validatenull(val) {
  if (typeof val === 'boolean') {
    return false;
  }
  if (typeof val === 'number') {
    return false;
  }
  if (val instanceof Array) {
    if (val.length === 0) {
      return true;
    }
  } else if (val instanceof Object) {
    if (JSON.stringify(val) === '{}') {
      return true;
    }
  } else {
    if (val === 'null' || val === null || val === 'undefined' || val === undefined || val === '') {
      return true;
    }
    return false;
  }
  return false;
}
/**
 * 清空全部localStorage
 */
export const clearStore = () => {
  window.localStorage.clear();
};
/**
 * @desc 函数节流
 * @param func 函数
 * @param wait 延迟执行毫秒数
 * @param type 1 表时间戳版，2 表定时器版
 */
export function throttle(func, wait, type) {
  let previous;
  let timeout;
  if (type === 1) {
    previous = 0;
  }
  return function() {
    const context = this;
    const args = arguments;
    if (type === 1) {
      const now = Date.now();

      if (now - previous > wait) {
        func.apply(context, args);
        previous = now;
      }
    } else if (type === 2) {
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          func.apply(context, args);
        }, wait);
      }
    }
  };
}
