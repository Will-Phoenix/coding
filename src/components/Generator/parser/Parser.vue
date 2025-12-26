<script>
import { deepClone } from '@/utils'
import render from '@/components/Generator/render/render.js'
import { dyOptionsList } from '@/components/Generator/generator/comConfig'
import { getDictionaryDataSelector } from '@/api/systemData/dictionary'
import { getDataInterfaceRes } from '@/api/systemData/dataInterface'
import request from '@/utils/request'
import { mapGetters } from "vuex"
import dyOptionEchoHandler from '@/mixins/dyOptionEchoHandler'

const layouts = {
  colFormItem(h, scheme) {
    const config = scheme.__config__
    const listeners = buildListeners.call(this, scheme)

    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    const Item = config.jnpfKey === 'cascader'
      ? <el-cascader v-model={this[this.formConf.formModel][scheme.__vModel__]} placeholder={scheme.placeholder} options={scheme.options}
        props={scheme.props} disabled={scheme.disabled} show-all-levels={scheme['show-all-levels']} separator={scheme.separator}
        style={scheme.style} clearable={scheme.clearable} filterable={scheme.filterable}
        onChange={val => this.onCascaderChange(val, scheme.on)} onBlur={val => this.onCascaderBlur(val, scheme.on)}
        key={scheme.__config__.renderKey}></el-cascader>
      : <render formData={this[this.formConf.formModel]} conf={scheme} {...{ on: listeners }} ref={config.jnpfKey === 'table' ? scheme.__vModel__ : undefined}
        key={scheme.__config__.renderKey} relations={config.jnpfKey === 'table' ? this.relations : undefined} />
    const visibility = !config.visibility || (Array.isArray(config.visibility) && config.visibility.includes('pc'))
    if (visibility && !config.noShow) {
      return (
        <el-col span={config.span} class={config.className}>
          <el-form-item label-width={labelWidth} prop={scheme.__vModel__} key={config.renderKey}
            label={config.showLabel ? config.label : ''}>
            {Item}
          </el-form-item>
        </el-col>
      )
    }
  },
  rowFormItem(h, scheme) {
    const listeners = buildListeners.call(this, scheme)
    const config = scheme.__config__
    const visibility = !config.visibility || (Array.isArray(config.visibility) && config.visibility.includes('pc'))
    if (!visibility || config.noShow) return
    if (scheme.__config__.jnpfKey === 'tab') {
      return (
        <el-col span={scheme.__config__.span} class="mb-10">
          <el-tabs type={scheme.type} tab-position={scheme['tab-position']} vModel={scheme.__config__.active} {...{ on: listeners }}>
            {
              scheme.__config__.children.map((item, i) => {
                let child = renderChildren.call(this, h, item)
                return (
                  <el-tab-pane key={item.name} label={item.title} >
                    <el-row>
                      {child}
                    </el-row>
                  </el-tab-pane>
                )
              })
            }
          </el-tabs>
        </el-col>
      )
    }
    if (scheme.__config__.jnpfKey === 'collapse') {
      return (
        <el-col span={scheme.__config__.span} class="mb-20">
          <el-collapse vModel={scheme.__config__.active} accordion={scheme.accordion} {...{ on: listeners }}>
            {
              scheme.__config__.children.map((item, i) => {
                let child = renderChildren.call(this, h, item)
                return (
                  <el-collapse-item key={item.name} title={item.title} name={item.name} >
                    <el-row>
                      {child}
                    </el-row>
                  </el-collapse-item>
                )
              })
            }
          </el-collapse>
        </el-col>
      )
    }
    let child = renderChildren.apply(this, arguments)
    if (scheme.__config__.jnpfKey === 'table') {
      if (!scheme.__config__.noShow) this.tableRefs[scheme.__vModel__] = scheme
      const param = { ...scheme, config: scheme }
      return layouts.colFormItem.call(this, h, param)
    }
    if (scheme.__config__.jnpfKey === 'card') {
      let showCard = true
      if (Array.isArray(scheme.__config__.children) && scheme.__config__.autoShow === true) {
        let noShowItems = scheme.__config__.children.filter( c => {
          if (c.__config__.hasOwnProperty('noShow') && c.__config__.noShow === true) {
            return true
          }
          if (c.__config__.jnpfKey === 'JNPFText' || c.__config__.jnpfKey === 'groupTitle') {
            return true
          }
          return false
        })
        if (noShowItems.length === child.length) {
          showCard = false
        }
      }

      if (showCard) {
        return (
          <el-col span={scheme.__config__.span} class="item-card">
            <el-card shadow={scheme.shadow} header={scheme.header} class="mb-20">
              {child}
            </el-card>
          </el-col>
        )
      }
    }
    if (scheme.__config__.jnpfKey === 'row') {
      if (scheme.type === 'flex') {
        child = <el-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
          {child}
        </el-row>
      }
      return (
        <el-col span={scheme.__config__.span}>
          <el-row gutter={scheme.gutter}>
            {child}
          </el-row>
        </el-col>
      )
    }
  }
}

function renderFrom(h) {
  const { formConfCopy } = this
  let classStyle = []
  if (formConfCopy.formStyle) classStyle.push(formConfCopy.formStyle)
  if (formConfCopy.className) classStyle = [...classStyle, ...formConfCopy.className]
  return (
    <el-row gutter={formConfCopy.gutter} class={classStyle}>
      <el-form
        size={formConfCopy.size}
        label-position={formConfCopy.labelPosition}
        disabled={formConfCopy.disabled}
        label-width={`${formConfCopy.labelWidth}px`}
        ref={formConfCopy.formRef}
        // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
        props={{ model: this[formConfCopy.formModel] }}
        rules={this[formConfCopy.formRules]}
        nativeOnSubmit={event => { event.preventDefault() }}
      >
        {renderFormItem.call(this, h, formConfCopy.fields)}
        {
          // {formConfCopy.formBtns && formBtns.call(this, h)}
        }
      </el-form>
    </el-row>
  )
}

function formBtns(h) {
  return <el-col>
    <el-form-item size="large">
      <el-button type="primary" onClick={this.submitForm}>提交</el-button>
      <el-button onClick={this.resetForm}>重置</el-button>
    </el-form-item>
  </el-col>
}

function renderFormItem(h, elementList) {
  return elementList.map(scheme => {
    const config = scheme.__config__
    const layout = layouts[config.layout]

    if (layout) {
      return layout.call(this, h, scheme)
    }
    throw new Error(`没有与${config.layout}匹配的layout`)
  })
}

function renderChildren(h, scheme) {
  const config = scheme.__config__
  if (!Array.isArray(config.children)) return null
  return renderFormItem.call(this, h, config.children)
}

function setValue(event, config, scheme) {
  this.$set(config, 'defaultValue', event)
  this.$set(this[this.formConf.formModel], scheme.__vModel__, event)
}

function buildListeners(scheme) {
  const config = scheme.__config__
  const listeners = {}
  if (scheme.on) {
    // 响应 组件事件
    Object.keys(scheme.on).forEach(key => {
      const str = scheme.on[key];
      const func = this.jnpf.getScriptFunc.call(this, str);
      if (!func) return
      listeners[key] = params => {
        if (key === 'change') {
          let data = ''
          if (['select', 'radio', 'checkbox'].includes(config.jnpfKey)) {
            const options = scheme.__slot__.options
            if (scheme.multiple || config.jnpfKey === 'checkbox') {
              let _data = []
              outer: for (let i = 0; i < params[0].length; i++) {
                inner: for (let j = 0; j < options.length; j++) {
                  if (params[0][i] === options[j][config.props.value]) {
                    _data.push(options[j])
                    break inner
                  }
                }
              }
              data = _data
            } else {
              let _data = {}
              for (let i = 0; i < options.length; i++) {
                if (params[0] === options[i][config.props.value]) {
                  _data = options[i]
                  break
                }
              }
              data = _data
            }
          } else if (config.jnpfKey === 'numInput') {
            data = params[0]
          } else {
            data = params.length > 1 ? params[1] : params[0]
          }
          func.call(this, { data, ...this.parameter })
          this.handleRelation(scheme.__vModel__)
        } else {
          func.call(this, { data: params[0], ...this.parameter })
        }
      }
    })
  }
  // 响应 render.js 中的 vModel $emit('input', val)
  listeners.input = event => setValue.call(this, event, config, scheme)

  return listeners
}

export default {
  components: {
    render
  },
  mixins: [dyOptionEchoHandler],
  props: {
    formConf: {
      type: Object,
      required: true
    },
    formOperates: {
      type: Array,
    }
  },
  data() {
    const data = {
      __source_path: 'src/components/Generator/parser/Parser.vue',
      formConfCopy: deepClone(this.formConf),
      [this.formConf.formModel]: {},
      [this.formConf.formRules]: {},
      options: {},
      tableRefs: {},
      relations: {},
      isTableValid: false
    }
    this.initCss(data.formConfCopy)
    this.initFormData(data.formConfCopy.fields, data[this.formConf.formModel])
    this.initRelationForm(data.formConfCopy.fields)
    this.buildRules(data.formConfCopy.fields, data[this.formConf.formRules])
    this.buildOptions(data.formConfCopy.fields, data.options, data[this.formConf.formModel])
    this.buildRelations(data.formConfCopy.fields, data.relations)
    this.$nextTick(() => {
      this.onLoad(data.formConfCopy)
    })
    return data
  },
  provide() {
    return {
      parameter: this.parameter
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    formDataConf() {
      const name = this.formConf.formModel
      return this[name]
    },
    parameter() {
      const oldFormData = this.formConfCopy.formData ? this.formConfCopy.formData : {}
      this[this.formConf.formModel].id = oldFormData.id || ''
      this[this.formConf.formModel].flowId = oldFormData.flowId || ''
      return {
        formData: this[this.formConf.formModel],
        setFormData: this.setFormData,
        setShowOrHide: this.setShowOrHide,
        setRequired: this.setRequired,
        setDisabled: this.setDisabled,
        request: this.request,
        formOperates: this.formOperates,
        getFieldOptions: this.getFieldOptions,
        setFieldOptions: this.setFieldOptions,
        loginUser: this.userInfo
      }
    }
  },
  mounted() {
    this.initRelationData()
  },
  methods: {
    initRelationData() {
      const handleRelationFun = (list) => {
        list.forEach(cur => {
          this.handleDefaultRelation(cur.__vModel__)
          if (cur.__config__.children) handleRelationFun(cur.__config__.children)
        })
      }
      handleRelationFun(this.formConfCopy.fields)
    },
    initCss(formCopy) {
      if (document.getElementById('styleId')) {
        document.getElementById('styleId').remove()
      }
      let classJson = formCopy.classJson
      let head = document.getElementsByTagName('head')[0]
      let style = document.createElement('style')
      style.type = 'text/css'
      style.id = 'styleId'
      let html = classJson
      style.innerText = html
      head.appendChild(style)
    },
    initFormData(componentList, formData) {
      this.$store.commit('generator/UPDATE_RELATION_DATA', {})
      componentList.forEach(cur => {
        const config = cur.__config__
        if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue
        if (cur.__config__.jnpfKey == 'table') return
        if (config.children) this.initFormData(config.children, formData)
      })
    },
    buildRelations(componentList, relations) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          if (config.dataType === 'dynamic') {
            if (config.templateJson && config.templateJson.length) {
              for (let i = 0; i < config.templateJson.length; i++) {
                const e = config.templateJson[i];
                if (e.relationField) {
                  let item = {
                    ...cur,
                    realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
                    opType: 'setOptions'
                  }
                  if (relations.hasOwnProperty(e.relationField)) {
                    let boo = relations[e.relationField].some(o => o.realVModel === cur.realVModel)
                    if (!boo) {
                      relations[e.relationField].push(item)
                    }
                  } else {
                    relations[e.relationField] = [item]
                  }
                }
              }
            }
          }
        }
        if (config.jnpfKey === 'userSelect' && ['dep', 'pos', 'role', 'group'].includes(cur.selectType)) {
          if (cur.relationField) {
            let item = {
              ...cur,
              realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
              opType: 'setUserOptions'
            }
            if (relations.hasOwnProperty(cur.relationField)) {
              let boo = relations[cur.relationField].some(o => o.realVModel === cur.realVModel)
              if (!boo) {
                relations[cur.relationField].push(item)
              }
            } else {
              relations[cur.relationField] = [item]
            }
          }
        }
        if (config.jnpfKey === 'popupSelect') {
          if (cur.templateJson && cur.templateJson.length) {
            for (let i = 0; i < cur.templateJson.length; i++) {
              const e = cur.templateJson[i];
              if (e.relationField) {
                let item = {
                  ...cur,
                  realVModel: cur.__config__.isSubTable ? cur.__config__.parentVModel + '-' + cur.__vModel__ : cur.__vModel__,
                  opType: 'setPopupOptions'
                }
                if (relations.hasOwnProperty(e.relationField)) {
                  let boo = relations[e.relationField].some(o => o.realVModel === cur.realVModel)
                  if (!boo) {
                    relations[e.relationField].push(item)
                  }
                } else {
                  relations[e.relationField] = [item]
                }
              }
            }
          }
        }
        if (config.children) this.buildRelations(config.children, relations)
      })
    },
    handleRelation(field) {
      if (!field) return
      const currRelations = this.relations
      for (let key in currRelations) {
        if (key === field) {
          for (let i = 0; i < currRelations[key].length; i++) {
            const e = currRelations[key][i];
            let vModel = e.realVModel || e.__vModel__
            const config = e.__config__
            const jnpfKey = config.jnpfKey
            let defaultValue = ''
            if (['checkbox', 'cascader'].includes(jnpfKey) || (['select', 'treeSelect', 'popupSelect', 'popupTableSelect', 'userSelect'].includes(jnpfKey) && e.multiple)) {
              defaultValue = []
            }
            if (vModel.includes('-')) {
              // 子表字段
              const tableVModel = vModel.split('-')[0]
              this.$refs[tableVModel] && this.$refs[tableVModel].$children[0] && this.$refs[tableVModel].$children[0].handleRelationForParent(e, defaultValue)
            } else {
              this.setFormData(e.__vModel__, defaultValue)
              if (e.opType === 'setOptions') {
                let query = {
                  paramList: this.getParamList(config.templateJson, this[this.formConf.formModel])
                }
                getDataInterfaceRes(config.propsUrl, query).then(res => {
                  let realData = res.data
                  this.setFieldOptions(e.__vModel__, realData)
                })
              }
              if (e.opType === 'setUserOptions') {
                let value = this[this.formConf.formModel][e.relationField] || []
                this.comSet('ableRelationIds', e.__vModel__, Array.isArray(value) ? value : [value])
              }
              if (e.opType === 'setPopupOptions') { }
            }
          }
        }
      }
    },
    handleDefaultRelation(field) {
      if (!field) return
      const currRelations = this.relations
      for (let key in currRelations) {
        if (key === field) {
          for (let i = 0; i < currRelations[key].length; i++) {
            const e = currRelations[key][i];
            let vModel = e.realVModel || e.__vModel__
            const config = e.__config__
            if (vModel.includes('-')) {
              const tableVModel = vModel.split('-')[0]
              this.$refs[tableVModel] && this.$refs[tableVModel].$children[0] && this.$refs[tableVModel].$children[0].handleRelationForParent(e, '', true)
            } else {
              if (e.opType === 'setUserOptions') {
                let value = this[this.formConf.formModel][e.relationField] || []
                this.comSet('ableRelationIds', e.__vModel__, Array.isArray(value) ? value : [value])
              }
            }
          }
        }
      }
    },
    getParamList(templateJson, formData) {
      for (let i = 0; i < templateJson.length; i++) {
        if (templateJson[i].relationField) {
          templateJson[i].defaultValue = formData[templateJson[i].relationField] || ''
        }
      }
      return templateJson
    },
    initRelationForm(componentList) {
      componentList.forEach(cur => {
        const config = cur.__config__
        if (config.jnpfKey == 'relationFormAttr' || config.jnpfKey == 'popupAttr') {
          const relationKey = cur.relationField.split("_jnpfTable_")[0]
          componentList.forEach(item => {
            const noVisibility = Array.isArray(item.__config__.visibility) && !item.__config__.visibility.includes('pc')
            if ((relationKey == item.__vModel__) && (noVisibility || !!item.__config__.noShow) && !cur.__vModel__) {
              cur.__config__.noShow = true
            }
          })
        }
        if (cur.__config__.children && cur.__config__.children.length) this.initRelationForm(cur.__config__.children)
      })
    },
    buildOptions(componentList, data, formData) {
      console.log('src/components/Generator/parser/Parser.vue::buildOptions',{componentList, data, formData})
      componentList.forEach(cur => {
        const config = cur.__config__
        if (dyOptionsList.indexOf(config.jnpfKey) > -1) {
          let isTreeSelect = config.jnpfKey === 'treeSelect' || config.jnpfKey === 'cascader'
          if (config.dataType === 'dictionary') {
            if (!config.dictionaryType) return
            getDictionaryDataSelector(config.dictionaryType).then(res => {
              isTreeSelect ? cur.options = res.data.list : cur.__slot__.options = res.data.list
              isTreeSelect ? data[cur.__vModel__ + 'Options'] = cur.options : data[cur.__vModel__ + 'Options'] = cur.__slot__.options
              isTreeSelect && cur.__vModel__ && this.__dyFixFullPaths(cur, formData[cur.__vModel__], data[cur.__vModel__ + 'Options'])
            })
          } else if (config.dataType === 'dynamic') {
            if (!config.propsUrl) return
            let query = {
              paramList: config.templateJson ? this.getParamList(config.templateJson, formData) : [],
            }
            getDataInterfaceRes(config.propsUrl, query).then(res => {
              let realData = res.data
              if (Array.isArray(realData)) {
                isTreeSelect ? cur.options = realData : cur.__slot__.options = realData
              } else {
                isTreeSelect ? cur.options = [] : cur.__slot__.options = []
              }
              isTreeSelect ? data[cur.__vModel__ + 'Options'] = cur.options : data[cur.__vModel__ + 'Options'] = cur.__slot__.options
              isTreeSelect && cur.__vModel__ && this.__dyFixFullPaths(cur, formData[cur.__vModel__], data[cur.__vModel__ + 'Options'])
            })
          } else {
            isTreeSelect ? data[cur.__vModel__ + 'Options'] = cur.options : data[cur.__vModel__ + 'Options'] = cur.__slot__.options
            isTreeSelect && cur.__vModel__ && this.__dyFixFullPaths(cur, formData[cur.__vModel__], data[cur.__vModel__ + 'Options'])
          }
        }
        if (config.children && config.jnpfKey !== 'table') this.buildOptions(config.children, data, formData)
      })
    },
    buildRules(componentList, rules) {
      componentList.forEach(cur => {
        const config = JSON.parse(JSON.stringify(cur.__config__))
        if (!Array.isArray(config.regList)) config.regList = []
        if (config.required) {
          const required = { required: config.required, message: cur.placeholder }
          if (Array.isArray(config.defaultValue)) {
            required.type = 'array'
            required.message = `请至少选择一个${config.label}`
          }
          required.message === undefined && (required.message = `${config.label}不能为空`)
          config.regList.push(required)
        }
        rules[cur.__vModel__] = config.regList.map(item => {
          item.pattern && (item.pattern = eval(item.pattern))
          item.trigger = config.trigger || 'blur'
          return item
        })
        if (config.children && config.jnpfKey !== 'table') this.buildRules(config.children, rules)
      })
    },
    onLoad(formConfCopy) {
      if (!formConfCopy || !formConfCopy.funcs || !formConfCopy.funcs.onLoad) return
      const onLoadFunc = this.jnpf.getScriptFunc.call(this, formConfCopy.funcs.onLoad)
      if (!onLoadFunc) return
      onLoadFunc(this.parameter)
    },
    resetForm() {
      this.$store.commit('generator/UPDATE_RELATION_DATA', {})
      this.formConfCopy = deepClone(this.formConf)
      this.$refs[this.formConf.formRef].resetFields()
      Object.keys(this.tableRefs).forEach(vModel => {
        this.$refs[vModel] && this.$refs[vModel].$children && this.$refs[vModel].$children[0].resetTable()
      })
    },
    checkTableData() {
      let valid = true
      Object.keys(this.tableRefs).forEach(vModel => {
        if (this.$refs[vModel] && this.$refs[vModel].$children) {
          const res = this.$refs[vModel].$children[0].submit()  // 返回false或表单数据
          res ? (this[this.formConf.formModel][vModel] = res) : (valid = false)
        }
      })
      return valid
    },
    request(url, method, data) {
      if (!url) return
      return request({
        url: url,
        method: method || 'GET',
        data: data || {}
      })
    },
    getFieldOptions(prop) {
      if (!prop) return []
      const isChildTable = prop.indexOf('.') > -1
      if (isChildTable) {
        const list = prop.split('.')
        if (this.$refs[list[0]] && this.$refs[list[0]].$children[0]) {
          let res = this.$refs[list[0]].$children[0].getTableFieldOptions(list[1])
          return res
        } else {
          return []
        }
      } else {
        return this.options[prop + 'Options'] || []
      }
    },
    setFormData(prop, value) {
      if (!prop) return
      const isChildTable = prop.indexOf('.') > -1
      if (isChildTable) {
        const list = prop.split('.')
        if (this.$refs[list[0]] && this.$refs[list[0]].$children[0]) {
          this.$refs[list[0]].$children[0].setTableFormData(list[1], value)
        }
      } else {
        this.comSet('defaultValue', prop, value)
        this[this.formConf.formModel][prop] = value
      }
      this.handleRelation(prop)
    },
    setShowOrHide(prop, value) {
      const newVal = !!value
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('noShow', prop, !newVal)
      }
    },
    setRequired(prop, value) {
      const newVal = !!value
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('required', prop, newVal)
        this.buildRules(this.formConfCopy.fields, this[this.formConf.formRules])
      }
    },
    setDisabled(prop, value) {
      const newVal = !!value
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('disabled', prop, newVal)
      }
    },
    setFieldOptions(prop, value) {
      const newVal = Array.isArray(value) ? value : []
      const isChildTable = prop.indexOf('.') > -1
      if (!isChildTable) {
        this.comSet('options', prop, newVal)
      }
    },
    comSet(field, prop, value) {
      if (!prop) return
      const loop = list => {
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.__vModel__ && item.__vModel__ === prop) {
            switch (field) {
              case 'disabled':
                this.$set(item, field, value)
                break;
              case 'ableRelationIds':
                this.$set(item, field, value)
                break;
              case 'options':
                if (dyOptionsList.indexOf(item.__config__.jnpfKey) > -1) {
                  let isTreeSelect = item.__config__.jnpfKey === 'treeSelect' || item.__config__.jnpfKey === 'cascader'
                  isTreeSelect ? item.options = value : item.__slot__.options = value
                }
                break;
              default:
                this.$set(item.__config__, field, value)
                break;
            }
            item.__config__.renderKey = +new Date() + item.__vModel__
            break;
          }
          if (item.__config__ && item.__config__.jnpfKey !== 'table' && item.__config__.children && Array.isArray(item.__config__.children)) {
            loop(item.__config__.children)
          }
        }
      }
      loop(this.formConfCopy.fields)
    },
    beforeSubmit() {
      if (!this.formConfCopy || !this.formConfCopy.funcs || !this.formConfCopy.funcs.beforeSubmit) return Promise.resolve()
      const func = this.jnpf.getScriptFunc.call(this, this.formConfCopy.funcs.beforeSubmit)
      if (!func) return Promise.resolve()
      return func(this.parameter)
    },
    afterSubmit() {
      if (!this.formConfCopy || !this.formConfCopy.funcs || !this.formConfCopy.funcs.afterSubmit) return
      const func = this.jnpf.getScriptFunc.call(this, this.formConfCopy.funcs.afterSubmit)
      if (!func) return
      func(this.parameter)
    },
    submitForm(type) {
      this.isTableValid = this.checkTableData()
      try {
        this.beforeSubmit().then(() => {
          this.submit(type)
        })
      } catch (e) {
        this.submit(type)
      }
    },
    submit(type) {
      this.$refs[this.formConf.formRef].validate((valid, obj) => {
        if (!valid) {
          try {
            console.log('校验不通过', obj)
            const fields = this.$refs[this.formConf.formRef].fields
            for (let i = 0; i < fields.length; i++) {
              const field = fields[i]
              if (obj[field.prop]) {
                console.log('查到了未校验通过的对象', field)
                field.$el && field.$el.scrollIntoView(true)
                break
              }
            }
          } catch (e) {
            console.warn(e)
          }
          return false
        }
        if (!this.isTableValid) return false
        // 触发submit事件
        this.$emit('submit', this[this.formConf.formModel], this.afterSubmit, type)
        return true
      })
    },
    onCascaderChange(data, on) {
      if (!on || !on.change) return
      const func = this.jnpf.getScriptFunc.call(this, on.change)
      if (!func) return
      func.call(this, { data, ...this.parameter })
    },
    onCascaderBlur(data, on) {
      if (!on || !on.blur) return
      const func = this.jnpf.getScriptFunc.call(this, on.blur)
      if (!func) return
      func.call(this, { data, ...this.parameter })
    }
  },
  render(h) {
    return renderFrom.call(this, h)
  }
}
</script>
