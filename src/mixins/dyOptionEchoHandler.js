const loopFindPaths = (options, labelKey, valueKey, childKey, value, parents = []) => {
  let ret = []
  if (options instanceof Array && options.length > 0) {
    for (let i = 0; i < options.length; i++) {
      const obj = options[i]
      const v = obj[valueKey]
      const l = obj[labelKey]
      if (v === value) {
        ret = [...parents, { label: l, value: v }]
        break
      }
      const children = obj[childKey]
      if (children && children.length > 0) {
        const arr = loopFindPaths(children, labelKey, valueKey, childKey, value, [...parents, {
          label: l,
          value: v
        }])
        if (arr && arr.length > 0) {
          ret = [...arr]
          break
        }
      }
    }
  }
  return ret
}

const isSameArray = (a, b) => {
  if (a instanceof Array && b instanceof Array && a.length === b.length) {
    let hasDifferentValue = false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        hasDifferentValue = true
        break
      }
    }
    if (!hasDifferentValue) {
      return true
    }
  }
  return false
}

// 动态options类型(dyOptionsList) 的字段的回显处理,
export default {
  methods: {
    /**
     * 根据真实值返回显示值
     * @param item 动态表单配置项
     * @param value 真实值
     * @param options 可选, 如果有则用之, 如果没有则从item内取
     */
    __dyGetLabelByValue(item, value, options) {
      if (!value || (value instanceof Array && value.length === 0)) return ''
      let ret = value
      try {
        if (typeof value === 'string' && /^\[.*\]$/.test(value)) {
          value = JSON.parse(value)
        }
        if (value instanceof Array && value.length === 0) {
          return ''
        }
        const jnpfKey = item.jnpfKey || item.__config__.jnpfKey
        // ['radio', 'checkbox', 'select', 'cascader', 'treeSelect']
        if (['radio', 'checkbox', 'select'].includes(jnpfKey)) {
          const options = options || item.__slot__.options || []
          const labelKey = item.__config__.props.label
          const valueKey = item.__config__.props.value
          ret = (value instanceof Array ? value : [value]).map(v => {
            const i = options.findIndex(vv => vv[valueKey] === v)
            return i >= 0 ? options[i][labelKey] : v
          }).join(',')
        } else if (['cascader', 'treeSelect'].includes(jnpfKey)) {
          // 级联选择, 有选项分隔符
          const separator = item.separator || '/'
          const options = options || item.options
          const props = item.props.props
          const labelKey = props.label
          const valueKey = props.value
          const childKey = props.children
          const multiple = item.multiple === true || props.multiple === true
          // 是否显示全路径
          const showAllLevels = props['show-all-levels']
          ret = (multiple ? value : [value]).map(v => {
            // 根据叶子节点查找, 可以清洗掉错误的上级数据
            const _v = v instanceof Array && v.length > 0 ? v[v.length - 1] : v
            const arr = loopFindPaths(options, labelKey, valueKey, childKey, _v)
            if (arr && arr.length > 0) {
              return showAllLevels ? arr.map(v => v.label).join(separator) : arr[arr.length - 1].label
            }
            // 最糟糕情况, 遍历未找到
            return v instanceof Array ? JSON.stringify(v) : v
          }).join(',')
        }
      } catch (e) {
        console.error('处理回显(__dyGetLabelByValue)时发生异常错误', e)
      }
      return ret
    },
    /**
     * 矫正链路, 无返回值
     * @param item (必传)配置项
     * @param value (必传)值(数组), 不能是非引用类型
     * @param option (必传)下拉项
     * @param props (可选)指定下拉的 label , value , children 对应的键, 如果没传就从item拿,如果传了则以传参为准
     */
    __dyFixFullPaths(item, value, option, props) {
      try {
        // TEST ==> 弄个错误的数据试试
        // value.splice(0, value.length, ...['457175579557366085'])
        const jnpfKey = item.jnpfKey || item.__config__.jnpfKey
        console.log('进入__dyFixFullPaths', { jnpfKey })
        if (['cascader', 'treeSelect'].includes(jnpfKey) && value instanceof Array && value.length > 0 && option && option.length > 0) {
          console.log('满足执行__dyFixFullPaths', { item, value, option, props })
          const _props = props || item.props.props
          const labelKey = _props.label
          const valueKey = _props.value
          const childKey = _props.children
          const multiple = item.multiple === true || _props.multiple === true;
          (multiple === true ? value : [value]).forEach(vv => {
            // 根据叶子节点查找, 可以清洗掉错误的上级数据
            const _v = vv[vv.length - 1]
            const paths = loopFindPaths(option, labelKey, valueKey, childKey, _v)
            const arr = paths.map(v => v.value)
            if (arr.length > 0 && !isSameArray(vv, arr)) {
              console.log(`执行__dyFixFullPaths::发现链路脏数据 ${JSON.stringify(vv)} ,并将之校正为 ${JSON.stringify(arr)}`)
              vv.splice(0, vv.length, ...arr)
            }
          })
        }
      } catch (e) {
        console.warn('执行__dyFixFullPaths时发生异常错误', e)
      }
    },
    /**
     * 根据 value(叶子节点值) 获取完整链路
     * @param value 值(非数组)
     * @param option 下拉
     * @param props 指定下拉的 label , value , children 对应的键
     */
    __dyGetFullPathByValue(value, option, props) {
      let ret = []
      try {
        console.log('进入__dyGetFullPathByValue', { value, option, props })
        if (value && option && option instanceof Array && option.length > 0 && props) {
          const labelKey = props.label || 'label'
          const valueKey = props.value || 'value'
          const childKey = props.children || 'children'
          const paths = loopFindPaths(option, labelKey, valueKey, childKey, value)
          ret = paths.map(v => v.value)
        }
      } catch (e) {
        console.warn('执行__dyGetFullPathByValue时发生异常错误', e)
      }
      return ret
    }
  }
}
