<template>
  <div>
    <component
      v-if="showInFormCalc && myComMap[field.component]"
      :is="myComMap[field.component]"
      :limit="limit"
      :app-form-conf="appFormConf"
      :group="group"
      :field="field"
      :index="index"
      :group-iterate-index="groupIterateIndex"
      :detail-json="detailJson"
      :field-name="fieldName"
      :field-prefix="fieldPrefix"
      :field-visible-map="fieldVisibleMap"
    ></component>
    <div v-else-if="!myComMap[field.component]" style="color:red;height: 33px;margin-bottom: 18px;">{{ `表单控件 ${field.component} 暂不支持, 正在开发, 敬请期待` }}</div>
  </div>
</template>
<script>
import { toInt } from '@/utils/format'
import MyInput from './MyInput.vue'
import AmountInput from './AmountInput.vue'
import AmountSum from './AmountSum.vue'
import MultiInput from './MultiInput.vue'
import NumberInput from './NumberInput.vue'
import NumberSum from './NumberSum.vue'
import NumberMultiply from './NumberMultiply.vue'
import DateTimePicker from './DateTimePicker.vue'
import HalfDayPicker from './HalfDayPicker.vue'
import DaysDiff from './DaysDiff.vue'
import YesOrNoPicker from './YesOrNoPicker.vue'
import RadioPicker from './RadioPicker.vue'
import SimplePicker from './SimplePicker.vue'
import CustomPicker from './CustomPicker.vue'
import CommonCascader from './CommonCascader.vue'
import AreaCascader from './AreaCascader.vue'
import UserSelect from './UserSelects.vue'
import DeptSelects from './DeptSelects.vue'
import BudgetSelects from './BudgetSelects.vue'
import Attachment from './Attachment.vue'
import ShowValue from './ShowValue.vue'
import CheckboxPicker from "./CheckboxPicker";
import TravelAllowance from "./TravelAllowance";
import RelatedApproval from './RelatedApproval.vue'
import AmountInputCalc from './AmountInputCalc.vue'
import { alwaysRenderComponents } from "@/components/DynamicForm/b";
import AccountInput from './AccountInput.vue'
import PassInput from './PassInput.vue'

export default {
  name: 'MyCom',
  props: {
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
    enterFrom: {
      type: String,
      default: ""
    },
    fieldVisibleMap: {
      type: Map,
      default: {}
    }
  },
  data() {
    return {
      myComMap: {
        input: MyInput,
        amountInput: AmountInput,
        amountSum: AmountSum,
        multiInput: MultiInput,
        numberInput: NumberInput,
        numberSum: NumberSum,
        numberMultiply: NumberMultiply,
        dateTimePicker: DateTimePicker,
        halfDayPicker: HalfDayPicker,
        daysDiff: DaysDiff,
        yesOrNoPicker: YesOrNoPicker,
        radioPicker: RadioPicker,
        simplePicker: SimplePicker,
        customPicker: CustomPicker,
        commonCascader: CommonCascader,
        areaCascader: AreaCascader,
        userSelect: UserSelect,
        deptSelect: DeptSelects,
        budgetSelect: BudgetSelects,
        attachment: Attachment,
        showValue: ShowValue,
        checkboxPicker: CheckboxPicker,
        travelAllowance: TravelAllowance,
        relatedApproval: RelatedApproval,
        amountInputCalc: AmountInputCalc,
        accountInput: AccountInput,
        passInput: PassInput,
      }
    }
  },
  computed: {
    limit() {
      return Math.max(toInt(this.field.limit, 1), 1)
    },
    fieldPrefix() {
      return this.group.iterable ? `${this.group.fieldName}[${this.groupIterateIndex}].` : ''
    },
    fieldName() {
      return this.fieldPrefix + this.field.fieldName
    },
    showInFormCalc() {
      let keyName = (this.group.fieldName ? this.group.fieldName + '.' : '') + this.field.fieldName;
      if (this.group.iterable) {
        keyName += '.' + this.groupIterateIndex;
      }
      return !(keyName && !this.fieldVisibleMap.get(keyName)) || alwaysRenderComponents.includes(this.field.component) || this.enterFrom === 'approve';
    }
  },
  watch: {
  },
  mounted() {

  },
  methods: {

  }
}
</script>
