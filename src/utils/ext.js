/**
 * 每间隔 interval 毫秒, 检查一次 func() 结果如果为 Truthy 值, 则停止检查, 并将返回的Promise实例置为resolved状态. 如果超过 timeout 毫秒后,仍未通过检查, 则将返回的Promise实例置为rejected状态
 * @param func 回调方法
 * @param interval 间隔, 单位:毫秒
 * @param timeout 超时时间, 单位:毫秒
 * @param immediately 是否立即检查
 * @return {Promise<void>}
 */
export const waitCondition = (func, interval = 50, timeout = 10000, immediately = true) => {
  if (!func || typeof func != 'function') return Promise.reject(new Error('参数错误'))
  let execFailed = false
  const exec = () => {
    let ret
    try {
      ret = func()
    } catch (e) {
      execFailed = true
    }
    return ret
  }
  if (immediately) {
    if (exec()) {
      return Promise.resolve()
    }
    if (execFailed) {
      return Promise.reject(new Error('invoke error'))
    }
  }
  return new Promise((resolve, reject) => {
    const start = new Date().getTime()
    const i = setInterval(() => {
      if (exec()) {
        clearInterval(i)
        return resolve()
      }
      if (execFailed) {
        clearInterval(i)
        return reject(new Error('invoke error'))
      }
      if (new Date().getTime() - start > timeout) {
        clearInterval(i)
        reject(new Error('timeout'))
      }
    }, interval)
  })
}

/**
 * 将数组清洗为树型数据, 返回属性结构; 参考 https://www.jianshu.com/p/32359c0268cc
 * @param list 源数组 rowField: 'id', parentField: 'parentId'
 * @param parentId 外部调用时, 请传顶级节点的父节点属性值(注意: undefined和null不一样), 默认: null
 * @param props 默认值 { rowField: "id", parentField: "parentId", childField: "children"}
 */
export const list2tree = (list = [], parentId = null, props = { rowField: "id", parentField: "parentId", childField: "children" }) => {
  const { rowField = "id", parentField = 'parentId', childField = 'children' } = props
  const obj = {}
  list.forEach(item => {
    item[childField] = []
    obj[item[rowField]] = item
  })
  return list.filter(item => {
    if (item[parentField] !== parentId) {
      const temp = obj[item[parentField]];
      if (temp) {
        temp[childField].push(item)
        return false
      }
    }
    return true
  })
}
