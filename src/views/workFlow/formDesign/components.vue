<template>
  <div class="item" v-if="item.showInForm === true">
    <div :class="{ label: true, required: item.required}">
      {{ item.label ? item.label : "默认名" }}
    </div>
    <div class="value">
      <el-input v-if="item.component === 'input'" :placeholder="item.placeholder" :disabled="item.readonly" />
      <el-input-number v-else-if="item.component === 'amountInput' || item.component === 'amountSum'" controls-position="right" :min="1" :max="10" style="width: 100%" :placeholder="item.placeholder" :disabled="item.readonly"></el-input-number>
      <el-input v-else-if="item.component === 'multiInput'" type="textarea" :rows="3" :placeholder="item.placeholder" :disabled="item.readonly" />
      <el-radio-group v-else-if="item.component === 'yesOrNoPicker'" :disabled="item.readonly" style="width: 100%">
        <el-radio label="是">是</el-radio>
        <el-radio label="否">否</el-radio>
      </el-radio-group>
      <el-select v-else-if="selectComponentList.includes(item.component)" v-model="value" :placeholder="item.placeholder" :disabled="item.readonly" style="width: 100%"></el-select>
      <el-date-picker v-else-if="item.component === 'dateTimePicker'" v-model="value" type="date" :placeholder="item.placeholder" :disabled="item.readonly" style="width: 100%" />
      <el-upload
        v-else-if="item.component === 'attachment'"
        list-type="picture-card"
        :show-file-list="false"
        action="/abcdefg"
      >
        <i class="el-icon-plus" style="font-size: 14px;color: #00B4C4;">{{ item.placeholder }}</i>
      </el-upload>
      <el-input v-else :placeholder="item.placeholder" :disabled="item.readonly" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    componentType: {
      type: String,
      default: ""
    },
    item: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      value: "",
      selectComponentList: ["userSelect", "deptSelect", "simplePicker", "areaCascader", "budgetSelect"]
    }
  }
}
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  align-items: center;
  .label {
    margin-right: 20px;
    width: 30%;
    text-align: right;
  }
  .required::before {
    content: "*";
    color: #f56c6c;
  }
  .value {
    flex: 1;
  }
}
</style>
