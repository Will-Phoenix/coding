<template>
  <el-row>
    <el-form-item label="控件标题">
      <el-input v-model="activeData.__config__.label" placeholder="请输入控件标题" />
    </el-form-item>
    <el-form-item label="默认值">
      <el-checkbox-group v-model="activeData.__config__.defaultValue" :min="activeData.min"
        :max="activeData.max">
        <el-checkbox :label="item[activeData.__config__.props.value]"
          v-for="(item,i) in activeData.__slot__.options" :key="i">
          {{item[activeData.__config__.props.label]}}</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-divider>数据选项</el-divider>
    <el-form-item label="" label-width="40px">
      <el-radio-group v-model="activeData.__config__.dataType" size="small"
        style="text-align:center" @change="dataTypeChange">
        <el-radio-button label="static">静态数据</el-radio-button>
        <el-radio-button label="dictionary">数据字典</el-radio-button>
        <el-radio-button label="dynamic">远端数据</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <template v-if="activeData.__config__.dataType==='static'">
      <draggable :list="activeData.__slot__.options" :animation="340" group="selectItem"
        handle=".option-drag">
        <div v-for="(item, index) in activeData.__slot__.options" :key="index" class="select-item">
          <div class="select-line-icon option-drag">
            <i class="icon-ym icon-ym-darg" />
          </div>
          <el-input v-model="item.fullName" placeholder="选项名" size="small" />
          <el-input v-model="item.id" placeholder="选项值" size="small" />
          <div class="close-btn select-line-icon"
            @click="activeData.__slot__.options.splice(index, 1)">
            <i class="el-icon-remove-outline" />
          </div>
        </div>
      </draggable>
      <div style="margin-left: 29px;">
        <el-button style="padding-bottom: 0" icon="el-icon-circle-plus-outline" type="text"
          @click="addSelectItem">
          添加选项
        </el-button>
      </div>
    </template>
    <template v-if="activeData.__config__.dataType === 'dictionary'">
      <el-form-item label="数据字典">
        <el-row class="jnpf-el-row">
          <el-col :span="18">
            <JNPF-TreeSelect :options="dicOptions" v-model="activeData.__config__.dictionaryType"
              placeholder="请选择数据字典" lastLevel clearable @change="dictionaryTypeChange"
              @selectChange="selectChange">
            </JNPF-TreeSelect>
          </el-col>
          <el-col :span="6">
            <el-button @click="goDictionary()" style="float: right;">
              添加</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item label="存储字段">
        <el-select v-model="activeData.__config__.props.value" placeholder="请选择存储字段">
          <el-option label="id" value="id"></el-option>
          <el-option label="enCode" value="enCode"></el-option>
        </el-select>
      </el-form-item>
    </template>
    <template v-if="activeData.__config__.dataType === 'dynamic'">
      <el-form-item label="远端数据">
        <interface-dialog :value="activeData.__config__.propsUrl"
          :title="activeData.__config__.propsName" popupTitle="远端数据" @change="propsUrlChange" />
      </el-form-item>
      <el-form-item label="存储字段">
        <el-input v-model="activeData.__config__.props.value" placeholder="请输入存储字段" />
      </el-form-item>
      <el-form-item label="显示字段">
        <el-input v-model="activeData.__config__.props.label" placeholder="请输入显示字段" />
      </el-form-item>
      <el-table :data="activeData.__config__.templateJson"
        v-if="activeData.__config__.templateJson && activeData.__config__.templateJson.length">
        <el-table-column type="index" width="50" label="序号" align="center" />
        <el-table-column prop="field" label="参数名称">
          <template slot-scope="scope">
            <span class="required-sign">{{scope.row.required?'*':''}}</span>
            {{scope.row.fieldName?scope.row.field+'('+scope.row.fieldName+')':scope.row.field}}
          </template>
        </el-table-column>
        <el-table-column prop="value" label="表单字段">
          <template slot-scope="scope">
            <el-select v-model="scope.row.relationField" placeholder="请选择表单字段" clearable filterable
              @change="onRelationFieldChange($event,scope.row)">
              <el-option v-for="item in formFieldsOptions" :key="item.realVModel"
                :label="item.realLabel" :value="item.realVModel">
              </el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </template>
    <el-divider />
    <!-- <el-form-item label="显示标签">
      <el-switch v-model="activeData.__config__.showLabel" />
    </el-form-item> -->
    <template v-if="showType==='pc'">
      <el-form-item label="选项样式">
        <el-radio-group v-model="activeData.__config__.optionType">
          <el-radio-button label="default">默认</el-radio-button>
          <el-radio-button label="button">按钮</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if=" activeData.__config__.optionType === 'default'" label="是否边框">
        <el-switch v-model="activeData.__config__.border" />
      </el-form-item>
      <el-form-item v-if="activeData.__config__.optionType === 'button' ||
                activeData.__config__.border" label="组件尺寸">
        <el-radio-group v-model="activeData.size">
          <el-radio-button label="medium">中等</el-radio-button>
          <el-radio-button label="small">较小</el-radio-button>
          <el-radio-button label="mini">迷你</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </template>
    <el-form-item label="是否禁用">
      <el-switch v-model="activeData.disabled" />
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="activeData.__config__.required" />
    </el-form-item>
    <el-form-item label="是否隐藏">
      <el-switch v-model="activeData.__config__.noShow" />
    </el-form-item>
    <div>
      <el-dialog :visible.sync="dicVisible" append-to-body
        class="JNPF-dialog JNPF-dialog_center JNPF-dialog-tree-select" lock-scroll width="80%"
        @close="defaultValueChange">
        <dicIndex ref="dicIndex"></dicIndex>
      </el-dialog>
    </div>
  </el-row>
</template>
<script>
import comMixin from './mixin';
import dynamicMixin from './dynamicMixin';
import dicIndex from '@/views/systemData/dictionary/index.vue';
export default {
  components: {
    dicIndex
  },
  mixins: [comMixin, dynamicMixin],
  data() {
    return {
      dicVisible: false,
    }
  },
  methods: {
    selectChange() {
      this.$emit('changeSelect')
      this.dictionaryTypeChange(this.dictionaryId)
    },
    defaultValueChange() {
      this.selectChange()
    },
    goDictionary() {
      this.dicVisible = true
      this.$nextTick(() => {
        this.$refs.dicIndex.initData()
      })
    }
  }

}
</script>
<style lang="scss" scoped>
.jnpf-el-row {
  >>> .el-input__inner {
    border-radius: 4px 0 0 4px !important;
  }

  >>> .el-button {
    border-left: 0;
    background-color: #f5f7fa;
    font-size: 13px;
    color: #909399;
    border-radius: 0 4px 4px 0;
    line-height: 12px;
  }
  >>> .el-button:hover {
    border-color: #dcdfe6;
  }
}
</style>
