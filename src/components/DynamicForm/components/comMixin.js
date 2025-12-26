import _get from "lodash.get";
import { notSupportRequiredComponents } from '../b'
export default {
  props: {
    fieldPrefix: {
      type: String,
      required: true
    },
    fieldName: {
      type: String,
      required: true
    },
    limit: {
      type: Number,
      required: true
    },
    appFormConf: {
      type: Object,
      required: true
    },
    group: {
      type: Object,
      required: true
    },
    field: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    groupIterateIndex: {
      type: Number,
      required: true
    },
    detailJson: {
      type: Object,
      required: true
    },
    fieldVisibleMap: {
      type: Map,
      default: {}
    }
  },
  computed: {
    moduleValue: {
      set(value) {
        console.log('moduleValue::set', { value, detailJson: this.detailJson, group: this.group, fieldName: this.field.fieldName })
        this.setValueToDetailJson(this.field.fieldName, value)
      },
      get() {
        return _get(this.detailJson, this.fieldName);
      }
    },
    rules() {
      return this.required && !notSupportRequiredComponents.includes(this.field.component) ? [{ required: true, message: this.requiredMessage, trigger: 'blur' }] : []
    },
    // 关联隐含字段, 例如: deptId, deptName, 一般选择器组件有该属性; 数据结构: Array<{ name: string; label: string; rename: string; }
    hiddenFieldsMapping() {
      return this.field.hiddenFieldsMapping || []
    },
    label() {
      return this.field.label;
    },
    required() {
      return this.field.required;
    },
    requiredMessage() {
      return this.field.requiredMessage;
    },
    placeholder() {
      return this.field.placeholder;
    },
    // 是否向上层吐字段
    export() {
      return this.field.export;
    },
    // 是否只读, 当只读时不校验
    readonly() {
      return this.field.readonly;
    },
    // 组件MyInput 特有 默认值
    defaultValue() {
      return this.field.defaultValue;
    },
    // 表单-是否显示该字段
    showInForm() {
      return this.field.showInForm;
    },
    // 表单-显示条件
    showInFormPro() {
      return this.field.showInFormPro;
    },
    // 详情-是否显示该字段
    showInDetail() {
      return this.field.showInDetail;
    },
    // 详情-展示条件
    showInDetailPro() {
      return this.field.showInDetailPro;
    },
    // 勾选之后本审批单被关联的时候着重要显示的字段
    emphasize() {
      return this.field.emphasize;
    },
    // 计算类组件的计算规则
    calc() {
      return this.field.calc;
    },
    // 选择器类组件的数据字典编码
    dataDictionary() {
      return this.field.dataDictionary;
    },
    // dateTimePicker 组件的 type 属性
    datetimePickerType() {
      return this.field.datetimePickerType;
    },
    // dateTimePicker 组件特有
    valueFormat() {
      return this.field.valueFormat;
    },
    // dateTimePicker 组件特有
    displayFormat() {
      return this.field.displayFormat;
    },
    // 当字段值为空时, 是否在表单中隐藏本控件, 默认:false
    emptyHideInForm() {
      return this.field.emptyHideInForm;
    },
    // 限定部门  仅限选人选择器
    deptFilter() {
      return this.field.deptFilter;
    },
    // 自动或手动 自动计算组件 特有
    manuallyTrigger() {
      return this.field.manuallyTrigger;
    },
    // 自动带入  仅限人员选择器和部门选择器
    defaultInsert() {
      return this.field.defaultInsert;
    },
    // 自动带入手机号  仅限普通输入框
    defaultInsertPhone() {
      return this.field.defaultInsertPhone;
    },
  },
  methods: {
    // 更新隐藏字段值, 入参是键值对
    updateHiddenFields(kv = {}) {
      const keys = Object.keys(kv);
      const mapping = this.hiddenFieldsMapping;
      if (keys.length > 0 && mapping.length > 0) {
        mapping.forEach(item => {
          keys.forEach(k => {
            if (item.name === k && item.rename) {
              this.setValueToDetailJson(item.rename, kv[k]);
            }
          });
        });
      }
    },
    // 传入的k不需要带层级
    setValueToDetailJson(k, v) {
      this.checkDetailJson();
      if (this.group.iterable) {
        this.$set(this.detailJson[this.group.fieldName][this.groupIterateIndex], k, v)
      } else {
        this.$set(this.detailJson, k, v)
      }
    },
    // 获取k对应的值,优先当前group
    getValueFromCurrentGroup(k) {
      if (this.group.iterable) {
        return this.detailJson[this.group.fieldName][this.groupIterateIndex][k] || this.detailJson[k];
      } else {
        return this.detailJson[k];
      }
    },
    // 检查 detailJson 并填充链路上可能存在的空值, 以防链式调用深层属性时报空指针异常
    checkDetailJson() {
      if (this.group.iterable) {
        if (!this.detailJson[this.group.fieldName]) {
          this.$set(this.detailJson, this.group.fieldName, [])
        }
        if (!this.detailJson[this.group.fieldName][this.groupIterateIndex]) {
          this.$set(this.detailJson[this.group.fieldName], this.groupIterateIndex, {})
        }
      }
    }
  }
}

/* group:AppFormGroup 和 field:AppFormField 的关系, 以及其数据结构定义如下

export interface AppFormField {
  component: string;
  fieldName: string;
  // 关联隐含字段, 例如: deptId, deptName, 一般选择器组件有该属性
  hiddenFieldsMapping?: Array<{
    name: string;
    label: string;
    rename: string;
  }>;
  label: string;
  // 是否必填校验
  required: boolean;
  // 必填校验信息提示
  requiredMessage?: string;
  placeholder?: string;
  // 字段长度限制
  limit: number | string;
  // 是否向上层吐字段, 默认
  export: boolean;
  // 是否只读, 当只读时不校验
  readonly: boolean;
  // 表单-是否显示该字段
  showInForm: boolean;
  // 详情-是否显示该字段
  showInDetail: boolean;
  // 勾选之后本审批单被关联的时候着重要显示的字段
  emphasize: boolean;
  // amountSum 组件的计算规则
  calc?: string;
  // simplePicker 组件的数据字典编码
  dataDictionary?: string;
  // dateTimePicker 组件的 type 属性
  datetimePickerType?: DatetimePickerType;
  // dateTimePicker 组件特有
  valueFormat?: string;
  // dateTimePicker 组件特有
  displayFormat?: string;
  // 当字段值为空时, 是否在表单中隐藏本控件, 默认:false
  emptyHideInForm?: boolean;
  // 限定部门
  deptFilter?: string;
}

export interface AppFormGroup {
  label?: string;
  fieldName?: string;
  iterable?: boolean;
  limit?: number | string;
  foldable?: boolean;
  foldInForm?: boolean;
  foldInDetail?: boolean;
  fields?: Array<AppFormField>;
}

*/
