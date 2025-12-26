<template>
  <div>
    <el-button class="btn" type="primary" @click="addCondition">添加条件</el-button>
    <vxe-table
      ref="table"
      :border="true"
      size="mini"
      :auto-resize="true"
      :show-overflow="false"
      :tree-config="treeConfig"
      :row-config="rowConfig"
      :column-config="columnConfig"
      :edit-config="editConfig"
      :data="conditionList"
    >
      <vxe-column type="seq" width="40" />
      <vxe-column
        field="type"
        title="类型"
        :edit-render="{}"
        :title-prefix="{content: '条件字段从何处取值，当前只有两种：字段（动态表单中非迭代组字段fieldName或者迭代组字段fieldName）和数组（所有迭代组group的fieldName）'}"
        min-width="60"
      >
        <template #default="{ row }">{{ row.type }}</template>
        <template #edit="{ row }">
          <vxe-select v-model="row.type" placeholder="请选择" transfer @change="typeChange(row, $event)">
            <vxe-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column
        field="fieldName"
        title="条件字段"
        :edit-render="{}"
        :title-prefix="{content: '动态表单中配置的fieldName）'}"
        min-width="150"
      >
        <template #default="{ row }">{{ checkLabel(row) }}</template>
        <template #edit="{ row }">
          <vxe-select v-model="row.fieldName" placeholder="请选择" filterable transfer>
            <vxe-option v-for="item in fieldNameList(row.type)" :key="item.value" :value="item.value" :label="item.label" />
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column
        field="compare"
        title="比较"
        :edit-render="{}"
        min-width="60"
      >
        <template #default="{ row }">{{ row.compare }}</template>
        <template #edit="{ row }">
          <vxe-select v-model="row.compare" placeholder="请选择" transfer>
            <vxe-option v-for="item in compareList" :key="item.value" :value="item.value" :label="item.label" />
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column
        field="value"
        title="数据值"
        :edit-render="{}"
        min-width="60"
      >
        <template #default="{ row }">{{ row.value }}</template>
        <template #edit="{ row }">
          <vxe-input v-model.trim="row.value" type="text" placeholder="请输入" />
        </template>
      </vxe-column>
      <vxe-column
        field="logic"
        title="逻辑"
        :edit-render="{}"
        :title-prefix="{content: '默认的逻辑优先级'}"
        min-width="60"
      >
        <template #default="{ row }">{{ row.logic }}</template>
        <template #edit="{ row }">
          <vxe-select v-model="row.logic" placeholder="请选择" transfer>
            <vxe-option v-for="item in logicList" :key="item.value" :value="item.value" :label="item.label" />
          </vxe-select>
        </template>
      </vxe-column>
      <vxe-column
        title="操作"
        width="60"
        fixed="right"
      >
        <template #default="{ row, rowIndex }">
          <el-button type="text" @click="deleteCondition(rowIndex)">删除</el-button>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script>
export default {
  props: {
    showInPro: {
      type: Array,
      default: () => ([])
    },
    // 动态表单配置group
    groups: {
      type: Array,
      default: () => ([])
    },
    rowIndex: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      conditionList: this.showInPro || [],
      treeConfig: { childrenField: 'fields', expandAll: true },
      rowConfig: { isHover: true, isCurrent: true },
      columnConfig: { resizable: true },
      editConfig: { trigger: 'click', mode: 'row', showIcon: false },
      typeList: [
        { label: "字段", value: "字段" },
        { label: "数组", value: "数组" },
      ],
      compareList: [
        { label: "大于等于", value: "大于等于" },
        { label: "大于", value: "大于" },
        { label: "等于", value: "等于" },
        { label: "小于等于", value: "小于等于" },
        { label: "小于", value: "小于" },
        { label: "不等于", value: "不等于" },
        { label: "包含", value: "包含" },
        { label: "不包含", value: "不包含" },
      ],
      logicList: [
        { label: "并且", value: "并且" },
        { label: "或者", value: "或者" },
      ],
    }
  },
  computed: {
    fieldNameList() {
      return (type) => {
        if (type === "字段") {
          const fieldNameList = [];
          // 先判断当前行是不是迭代数组下，是的话只能取本迭代数组内的字段，不是的话可以选非迭代数组字段
          const currGroup = this.groups[this.rowIndex[0]];
          // console.log('currGroup', currGroup);
          const iterableChildField = this.rowIndex.length > 1 && currGroup.iterable;
          if (iterableChildField) {
            fieldNameList.push(...currGroup.fields.map(vv => ({ label: `${vv.label}(${vv.fieldName})`, value: vv.fieldName })));
          } else {
            this.groups.filter(v => !v.iterable).forEach(v => {
              fieldNameList.push(...v.fields.map(vv => ({ label: `${vv.label}(${vv.fieldName})`, value: vv.fieldName })));
            });
          }
          return fieldNameList;
        } else if (type === "数组") {
          return this.groups.filter(v => v.iterable).map(vv => ({ label: `${vv.label}(${vv.fieldName})`, value: vv.fieldName }));
        } else {
          return [];
        }
      };
    }
  },
  methods: {
    addCondition() {
      this.conditionList.push(
        { type: "字段", fieldName: "", compare: "等于", value: "", logic: "并且" }
      );
    },
    deleteCondition(rowIndex) {
      this.conditionList.splice(rowIndex, 1);
    },
    typeChange(row, val) {
      console.log("字段类型：", val);
      row.fieldName = '';
    },
    checkLabel(row) {
      if (row.fieldName) {
        return this.fieldNameList(row.type).filter(v => v.value === row.fieldName)[0].label;
      }
      return row.fieldName;
    },
    getShowInPro() {
      // 校验
      if (this.conditionList.length === 0) {
        throw new Error("选择自定义后，条件不能为空！");
      }
      this.conditionList.forEach((v, i) => {
        if (!v.fieldName) {
          throw new Error(`【条件${i + 1}】条件字段不能为空`);
        }
        if (!v.value) {
          throw new Error(`【条件${i + 1}】数据值不能为空`);
        }
      });
      return this.conditionList;
    }
  }
}
</script>
<style scoped>
.btn {
  margin: 0 0 10px 5px;
}
</style>
