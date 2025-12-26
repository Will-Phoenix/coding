// 不要滥用localStorage;
// 不要滥用localStorage;
// 不要滥用localStorage;

// 当前项目的localStorage 命名空间前缀;
const namespace = process.env.VUE_APP_STORAGE_KEY_PREFIX

// 入参key不需要写当前命名空间前缀
const setItem = (key, val) => {
  return localStorage.setItem(namespace + key, val)
}

const setItemObj = (key, val) => {
  return localStorage.setItem(namespace + key, JSON.stringify(val))
}

// 入参key不需要写当前命名空间前缀
const getItem = (key) => {
  return localStorage.getItem(namespace + key)
}

/**
 * 从 localStorage 读取并进行 JSON.parse , 返回值可能为null
 * @param key 键
 * @param defaultVal 默认值,可选
 */
const getItemObj = (key, defaultVal) => {
  const str = getItem(key)
  let ret = defaultVal
  if (str) {
    try {
      ret = JSON.parse(str)
    } catch (e) {
      console.error(e)
    }
  }
  return ret
}

// 入参key不需要写当前命名空间前缀
const removeItem = (key) => {
  return localStorage.removeItem(namespace + key)
}

/**
 * 仅清理当前项目命名空间下的localStorage
 * @param prefix 可传参进行进一步限定要清理的数据, 即清除 namespace + prefix 开头的key
 */
export const clearProjectLocalStorage = (prefix = '') => {
  const keys = []
  const pre = namespace + prefix
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.indexOf(pre) === 0) {
      keys.push(key)
    }
  }
  keys.forEach(k => localStorage.removeItem(k))
}

const ls = {
  setItem,
  setItemObj,
  getItem,
  getItemObj,
  removeItem,
  clearProjectLocalStorage
}

export default ls
