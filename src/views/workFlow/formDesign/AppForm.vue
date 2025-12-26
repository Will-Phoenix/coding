<template>
  <div class="app-form" source="src/views/workFlow/formDesign/AppForm.vue">
    <div class="conf-table">
      <div class="conf-table-content">
        <div class="base-c">
          <el-form :inline="true" :model="formConf" size="small" label-suffix="：" label-position="right" label-width="120px" class="form-inline">
            <el-form-item label="表单类型" prop="formType" t="1:申请单, 2:报销单, (与后端无关)">
              <el-radio-group v-model="formConf.formType" @change="onChangeFormType">
                <el-radio :label="1">审批单</el-radio>
                <el-radio :label="2">报销单</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="单据类型" prop="orderType" :title="`当前选择orderType=${formConf.orderType}`">
              <el-select ref="orderType" v-model="formConf.orderType" placeholder="orderType" filterable @change="orderTypeChange">
                <el-option v-for="item in autoOrderTypeList" :key="item.code" :label="item.desc" :value="item.code" />
              </el-select>
            </el-form-item>
            <el-form-item label="AI智能填写关联审批单" prop="smartApprovalOrderType" v-show="formConf.formType==2" label-width="180px" :title="`当前选择orderType=${formConf.smartApprovalOrderType}`">
              <el-select v-model="formConf.smartApprovalOrderType" clearable filterable>
                <el-option v-for="item in applyOrderTypeList" :key="item.code" :label="item.desc" :value="item.code" />
              </el-select>
            </el-form-item>
            <el-row>
              <el-col>
                <el-form-item label="其它配置项">
                  <el-checkbox v-model="formConf.supportStash">支持暂存</el-checkbox>
                  <el-checkbox v-model="formConf.relTravelAssist" title="表单和详情页都展示" v-if="formConf.orderType === 1 || formConf.orderType === 2">显示智能差旅助手(表单和详情)</el-checkbox>
                  <el-checkbox v-model="formConf.relInvoice" title="仅限报销单支持" v-if="formConf.formType==2">关联发票</el-checkbox>
                  <el-checkbox v-model="formConf.relApply" title="仅限报销单支持" v-if="formConf.formType==2">关联审批单</el-checkbox>
                  <el-checkbox v-model="formConf.relPaymentOrder" title="仅限报销单支持" v-if="formConf.formType==2">关联请款单</el-checkbox>
                  <el-checkbox v-model="formConf.relAnnex" title="仅限报销单支持" v-if="formConf.formType==2">关联报销单附件</el-checkbox>
                  <el-checkbox v-model="formConf.relContract" title="仅限报销单支持" v-if="formConf.formType==2">关联合同</el-checkbox>
                  <el-checkbox v-model="formConf.relCpq" title="仅限报销单支持" v-if="formConf.formType==2">关联呈批签</el-checkbox>
                  <el-checkbox v-model="formConf.relAutoFillForm">开启智能填单</el-checkbox>
                </el-form-item>
              </el-col>
              <el-col>
                <el-form-item v-if="formConf.relAutoFillForm" label-width="160" label="智能填单提醒文本">
                  <el-input :autosize="{ minRows: 2, maxRows: 4}" style="width: 400px;" type="textarea" v-model="formConf.autoFillFormHint" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="table-c">
          <div>
            <vxe-toolbar>
              <template #buttons>
                <vxe-button @click="onAdd()">添加分组</vxe-button>
                <vxe-button @click="onAddExsPayListGroup()">添加报销支付明细分组</vxe-button>
                <vxe-button @click="onSyncField()" title="将当前表格中已勾选[字段同步]的字段同步添加至【字段设置】tab页内的表格中, 有去重逻辑, 字段只增不删">同步【字段设置】</vxe-button>
                <el-button type="text" icon="el-icon-download" style="margin-left: 20px;" @click="exportData">导出</el-button>
                <el-button type="text" icon="el-icon-upload2" @click="importData">导入</el-button>
                <el-button type="text" @click="onViewModuleJson">查看页面数据</el-button>
                <el-button type="text" @click="onViewTemplateSQL">查看打印模版SQL</el-button>
                <input ref="inputRef" type="file" accept="application/json" style="display: none" @change="onChangeFile">
                <span style="color: #909399;margin-left: 20px;"><i class="el-icon-info" />当表格数据为空时, 将不保存当前页面内的配置信息.</span>
              </template>
              <!--              <template #tools>-->
              <!--                <vxe-button @click="onPreviewForm()">表单渲染预览</vxe-button>-->
              <!--              </template>-->
            </vxe-toolbar>
          </div>
          <div class="table-h">
            <vxe-table
              ref="table"
              :border="true"
              size="mini"
              height="100%"
              :auto-resize="true"
              :show-overflow="false"
              :tree-config="treeConfig"
              :row-config="rowConfig"
              :column-config="columnConfig"
              :edit-config="editConfig"
              :data="groups"
            >
              <vxe-column type="seq" tree-node width="100" />
              <vxe-column field="label" title="名称" :edit-render="{}" :title-prefix="{content: '分组容器的名称不是必须的, 其它渲染控件必填, 当分组容器的limit>1时, 本字段最好填上'}" min-width="100">
                <template #default="{ row }">{{ row.label }}</template>
                <template #edit="{ row }">
                  <vxe-input v-model.trim="row.label" type="text" placeholder="请输入" />
                </template>
              </vxe-column>
              <vxe-column field="fieldName" title="字段" :edit-render="{}" :title-prefix="{content: '分组容器的字段不是必须的,当分组容器的limit>1或者分组容器设置表单展示和详情展示为否和自定义时, 本字段必填,需要指定用于承载数组字段值,其它渲染控件必填'}" min-width="100">
                <template #default="{ row }">{{ row.fieldName }}</template>
                <template #edit="{ row }">
                  <span v-if="row.component ==='relatedApproval'">{{ row.fieldName }}</span>
                  <vxe-input v-else v-model.trim="row.fieldName" type="text" placeholder="请输入" />
                </template>
              </vxe-column>
              <vxe-column field="component" title="渲染控件" :title-prefix="{content: '表格树第一层是group控件,第二层是表单渲染控件,当表单渲染控件下拉发生变化时,配置项可能会被清空'}" :edit-render="{}" width="120">
                <template #default="{ row }">{{ comLabelMap[row.component] || row.component }}</template>
                <template #edit="{ row }">
                  <span v-if="row.component ==='group'">{{ comLabelMap[row.component] || row.component }}</span>
                  <vxe-select v-else v-model="row.component" placeholder="请选择" transfer filterable class="aaaaaaa" @change="({value})=>onChangeCom(value,row)">
                    <vxe-option v-for="item in selComList" :key="item.value" :value="item.value" :label="item.label" />
                  </vxe-select>
                </template>
              </vxe-column>
              <vxe-column field="limit" title="限制" :title-prefix="{content: '即 limit , 所有组件均必填, 针对选人选部门组件指的是数量限制, 针对分组容器指的是允许迭代的最大次数, 针对文本输入指的是字符长度限制；注：非迭代类的分组容器，limit为1不可修改'}" :edit-render="{}" width="60">
                <template #default="{ row }">{{ row.limit }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].supportLimit===false" class="not-support" />
                  <vxe-input v-else v-model="row.limit" :disabled="!row.iterable && row.component === 'group'" placeholder="请输入" type="integer" min="1" max="99999" />
                </template>
              </vxe-column>
              <vxe-column field="required" title="是否必填" :edit-render="{}" width="30" align="center">
                <template #default="{ row }">{{ row.required | boolFilter }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].supportRequired===false" class="not-support" />
                  <el-checkbox v-else v-model="row.required" />
                </template>
              </vxe-column>
              <vxe-column field="requiredMessage" title="必填校验提示" :edit-render="{}" min-width="60">
                <template #default="{ row }">{{ row.requiredMessage }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].supportRequired===false" class="not-support" />
                  <vxe-input v-else v-model.trim="row.requiredMessage" type="text" placeholder="请输入" />
                </template>
              </vxe-column>
              <vxe-column field="placeholder" title="输入提示" :title-prefix="{content: '即 placeholder'}" :edit-render="{}" min-width="60">
                <template #default="{ row }">{{ row.placeholder }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].supportPlaceholder===false" class="not-support" />
                  <vxe-input v-else v-model.trim="row.placeholder" type="text" placeholder="请输入" />
                </template>
              </vxe-column>
              <vxe-column field="export" title="字段同步" :title-prefix="{content: '是否将detailJson内的本字段同步写入到上层formData内进行结构化存储；注：分组迭代下的字段无法同步出去'}" :edit-render="{}" width="30" align="center">
                <template #default="{ row }">{{ row.export | boolFilter }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].supportExport===false || groups[findRowIndex(groups, row)[0]].iterable" class="not-support" />
                  <el-checkbox v-else v-model="row.export" />
                </template>
              </vxe-column>
              <vxe-column field="emphasize" title="关联字段" :title-prefix="{content: '勾选之后本审批单被报销单关联的时候着重要显示的字段'}" :edit-render="{}" width="30" align="center">
                <template #default="{ row }">{{ row.emphasize | boolFilter }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].supportEmphasize===false" class="not-support" />
                  <el-checkbox v-else v-model="row.emphasize" />
                </template>
              </vxe-column>
              <vxe-column field="showInApprovalCenter" title="审批中心列表展示" :title-prefix="{content: '勾选之后在审批中心列表页着重要显示的字段'}" :edit-render="{}" width="50" align="center">
                <template #default="{ row }">{{ row.showInApprovalCenter | boolFilter }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].showInApprovalCenter===false" class="not-support" />
                  <el-checkbox v-else v-model="row.showInApprovalCenter" />
                </template>
              </vxe-column>
              <vxe-column field="readonly" title="只读" :edit-render="{}" width="30" align="center">
                <template #default="{ row }">{{ row.readonly | boolFilter }}</template>
                <template #edit="{ row }">
                  <span v-if="!comObjMap[row.component] || comObjMap[row.component].supportReadonly===false" class="not-support" />
                  <el-checkbox v-else v-model="row.readonly" />
                </template>
              </vxe-column>
              <vxe-column field="showInForm" title="表单展示" :edit-render="{}" min-width="100" align="center">
                <template #default="{ row }">{{ getShowInFlag(row, 1) | boolFilter }}</template>
                <template #edit="{ row }">
                  <el-button type="primary" size="mini" round @click="configShow(row, 1)">进行配置</el-button>
                </template>
              </vxe-column>
              <vxe-column field="showInDetail" title="详情展示" :edit-render="{}" min-width="100" align="center">
                <template #default="{ row }">{{ getShowInFlag(row, 2) | boolFilter }}</template>
                <template #edit="{ row }">
                  <el-button type="primary" size="mini" round @click="configShow(row, 2)">进行配置</el-button>
                </template>
              </vxe-column>
              <vxe-column title="特殊属性" :title-prefix="{content: '不同组件自身特有的配置项'}" :edit-render="{}" min-width="160">
                <template #default="{ row }">
                  <el-row class="rrr">
                    <el-col v-if="row.component==='group'" class="spans">
                      <span>迭代分组:{{ row.iterable | boolFilter }}</span>
                      <span v-if="!row.iterable">可折叠:{{ (row.foldable == null ? false : row.foldable) | boolFilter }}</span>
                      <span v-if="!row.iterable && row.foldable">表单默认折叠:{{ (row.foldInForm == null ? false : row.foldInForm) | boolFilter }}</span>
                      <span v-if="!row.iterable && row.foldable">详情默认折叠:{{ (row.foldInDetail == null ? false : row.foldInDetail) | boolFilter }}</span>
                    </el-col>
                    <el-col v-if="['input', 'numberInput'].includes(row.component)">
                      <span>默认值:{{ row.defaultValue }}</span>
                    </el-col>
                    <el-col v-if="row.component === 'input'">
                      <span>默认带入手机号:{{ row.defaultInsertPhone | boolFilter }}</span>
                    </el-col>
                    <el-col v-if="['simplePicker','commonCascader','radioPicker'].includes(row.component)">
                      <span>数据字典:{{ row.dataDictionary }}</span>
                    </el-col>
                    <el-col v-if="['checkboxPicker'].includes(row.component)" style="display: flex;flex-flow: column;">
                      <span>布局:{{ row.optionDirection }}</span>
                      <span>选项分隔符:{{ row.optionSeparator }}</span>
                    </el-col>
                    <el-col v-if="['customPicker', 'checkboxPicker'].includes(row.component)">
                      <span>选项:{{ row.dataDictionary }}</span>
                    </el-col>
                    <el-col v-if="row.component==='dateTimePicker'">
                      <span>保存值的格式化:{{ row.valueFormat }}</span>
                    </el-col>
                    <el-col v-if="row.component==='dateTimePicker'">
                      <span>显示的格式化:{{ row.displayFormat }}</span>
                    </el-col>
                    <el-col v-if="row.component==='dateTimePicker'">
                      <span>日期选择类型:{{ row.datetimePickerType }}</span>
                    </el-col>
                    <el-col v-if="row.component==='userSelect'">
                      <span>限定部门:{{ row.deptFilter }}</span>
                    </el-col>
                    <el-col v-if="row.component==='userSelect'">
                      <span>默认带入姓名:{{ row.defaultInsert | boolFilter }}</span>
                    </el-col>
                    <el-col v-if="row.component==='deptSelect'">
                      <span>默认带入部门:{{ row.defaultInsert | boolFilter }}</span>
                    </el-col>
                    <el-col v-if="['amountSum','numberSum','numberMultiply','daysDiff'].includes(row.component)" style="display: flex;flex-flow: column;">
                      <span>计算规则:{{ row.calc }}</span>
                      <span>计算方式:{{ row.manuallyTrigger ? '手动' : '自动' }}</span>
                    </el-col>
                    <el-col v-if="['travelAllowance'].includes(row.component)" style="display: flex;flex-flow: column;">
                      <span>计算方式:{{ row.manuallyTrigger ? '手动' : '自动' }}</span>
                    </el-col>
                    <el-col v-if="row.component==='showValue'">
                      <span>表单无值隐藏:{{ row.emptyHideInForm | boolFilter }}</span>
                    </el-col>
                  </el-row>
                </template>
                <template #edit="{ row, rowIndex }">
                  <template v-if="row.component==='group'">
                    <el-checkbox v-model="row.iterable" @change="iterableChange($event, rowIndex)">迭代分组</el-checkbox>
                    <el-checkbox v-model="row.foldable" v-if="!row.iterable">可折叠</el-checkbox>
                    <el-checkbox v-model="row.foldInForm" v-if="!row.iterable && row.foldable">表单默认折叠</el-checkbox>
                    <el-checkbox v-model="row.foldInDetail" v-if="!row.iterable && row.foldable">详情默认折叠</el-checkbox>
                  </template>
                  <el-col v-if="['input', 'numberInput'].includes(row.component)">
                    <vxe-input style="flex: 1" v-model="row.defaultValue" type="text" placeholder="可输入默认值(可选)" />
                  </el-col>
                  <el-col v-if="row.component === 'input'">
                    <el-checkbox v-model="row.defaultInsertPhone">默认带入手机号</el-checkbox>
                  </el-col>
                  <div v-if="['simplePicker','commonCascader','radioPicker'].includes(row.component)" style="display: flex;align-items: center;margin-bottom: 5px;">
                    <div style="width: 60px">数据字典:</div>
                    <vxe-select style="flex: 1;width: 100%" v-model="row.dataDictionary" placeholder="请选择" transfer filterable>
                      <vxe-option v-for="item in dictionaryOptions" :key="item.id" :value="item.enCode" :label="item.fullName" />
                    </vxe-select>
                  </div>
                  <div v-if="['checkboxPicker'].includes(row.component)">
                    <div style="display: flex;align-items: center;">
                      <div style="width: 60px">选项布局:</div>
                      <el-radio-group v-model="row.optionDirection">
                        <el-radio label="horizontal" style="margin-right: 10px;">水平</el-radio>
                        <el-radio label="vertical">垂直</el-radio>
                      </el-radio-group>
                    </div>
                    <div style="display: flex;align-items: center;">
                      <div style="width: 65px">选项分隔符:</div>
                      <vxe-input style="flex: 1" v-model="row.optionSeparator" type="text" placeholder="请输入选项之间的分隔符" />
                    </div>
                  </div>
                  <div v-if="['customPicker', 'checkboxPicker'].includes(row.component)" style="display: flex;align-items: center;">
                    <div style="width: 32px">选项:</div>
                    <vxe-input style="flex: 1" v-model="row.dataDictionary" type="text" placeholder="多个选项用逗号分割" />
                  </div>
                  <div v-if="row.component==='dateTimePicker'" style="display: flex;align-items: center;margin-bottom: 5px;">
                    <div style="width: 100px">保存值的格式化:</div>
                    <vxe-input style="flex: 1" v-model.trim="row.valueFormat" type="text" placeholder="请输入" />
                  </div>
                  <div v-if="row.component==='dateTimePicker'" style="display: flex;align-items: center;margin-bottom: 5px;">
                    <div style="width: 100px">显示的格式化:</div>
                    <vxe-input style="flex: 1" v-model.trim="row.displayFormat" type="text" placeholder="请输入" />
                  </div>
                  <div v-if="row.component==='dateTimePicker'" style="display: flex;align-items: center;margin-bottom: 5px;">
                    <div style="width: 100px">日期选择类型:</div>
                    <vxe-select style="flex: 1;width: 100%" v-model="row.datetimePickerType" placeholder="请选择" transfer>
                      <vxe-option v-for="item in datetimePickerTypeOptions" :key="item.value" :value="item.value" :label="item.label" />
                    </vxe-select>
                  </div>
                  <div v-if="row.component==='userSelect'" style="display: flex;align-items: center;margin-bottom: 5px;">
                    <div style="width: 60px">限定部门:</div>
                    <vxe-input style="flex: 1" v-model.trim="row.deptFilter" type="text" title="请输入部门ID或部门名称,多个用逗号分割" placeholder="请输入部门ID或部门名称,多个用逗号分割" />
                  </div>
                  <el-col v-if="row.component === 'userSelect'">
                    <el-checkbox v-model="row.defaultInsert">默认带入姓名</el-checkbox>
                  </el-col>
                  <el-col v-if="row.component === 'deptSelect'">
                    <el-checkbox v-model="row.defaultInsert">默认带入部门</el-checkbox>
                  </el-col>
                  <div v-if="['amountSum','numberSum','numberMultiply','daysDiff'].includes(row.component)" style="">
                    <div style="width: 100%;display: flex;align-items: center;">
                      <div style="">计算规则:</div>
                      <vxe-input style="flex: 1" v-model.trim="row.calc" type="text" placeholder="请输入表达式" />
                    </div>
                    <div style="width: 100%;display: flex;align-items: center;margin-top: 5px;">
                      <div style="white-space: nowrap;word-break: keep-all;">计算方式:</div>
                      <el-radio-group v-model="row.manuallyTrigger">
                        <el-radio :label="false" style="margin-right: 10px;">自动</el-radio>
                        <el-radio :label="true">手动</el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                  <div v-if="['travelAllowance'].includes(row.component)" style="">
                    <div style="width: 100%;display: flex;align-items: center;margin-top: 5px;">
                      <div style="white-space: nowrap;word-break: keep-all;">计算方式:</div>
                      <el-radio-group v-model="row.manuallyTrigger">
                        <el-radio :label="false" style="margin-right: 10px;">自动</el-radio>
                        <el-radio :label="true">手动</el-radio>
                      </el-radio-group>
                    </div>
                  </div>
                  <div v-if="row.component==='showValue'" style="display: flex;align-items: center;margin-bottom: 5px;">
                    <div style="" title="当字段值在表单上为空时, 是否在表单中隐藏">表单无值隐藏:</div>
                    <el-checkbox v-model="row.emptyHideInForm" />
                  </div>
                </template>
              </vxe-column>
              <vxe-column field="hiddenFieldsMapping" title="隐藏字段映射" :edit-render="{}" :title-prefix="{content: '可以对选择器选择之后拿到的隐藏字段进行重命名, 如果不需要该字段则输入框置空'}" min-width="200">
                <template #default="{ row }">
                  <el-row class="rrr">
                    <el-col v-for="(item,index) in row.hiddenFieldsMapping" :key="index">
                      <span>{{ item.label }} --> {{ item.rename }}</span>
                    </el-col>
                  </el-row>
                </template>
                <template #edit="{ row }">
                  <el-row v-if="row.hiddenFieldsMapping">
                    <el-form :inline="true" size="mini" label-position="right" class="in-col-form">
                      <el-col v-for="(item,index) in row.hiddenFieldsMapping" :key="index">
                        <el-form-item :label="item.label">
                          <el-input v-model.trim="item.rename" placeholder="请输入" style="width: 100px;margin-right: 5px;" :title="`默认字段名${item.name}`" />
                        </el-form-item>
                      </el-col>
                    </el-form>
                  </el-row>
                </template>
              </vxe-column>
              <vxe-column title="操作" width="160" fixed="right">
                <template #default="{ row }">
                  <el-button type="text" icon="el-icon-top" @click="moveCurrentRow('up', row)" title="上移当前行" />
                  <el-button type="text" icon="el-icon-bottom" @click="moveCurrentRow('down', row)" title="下移当前行" />
                  <el-popover
                    :ref="findRowIndex(groups, row).join(',')"
                    placement="top"
                    width="300"
                    trigger="click"
                    style="margin: 0 10px"
                    v-if="findRowIndex(groups, row).length === 2"
                  >
                    <el-input-number style="width: 100%" v-model.trim="movePosition" :precision="1" :step="0.1" controls-position="right" placeholder="请输入要移动到的行号，例如1.3" />
                    <div style="text-align: right; margin-top: 10px">
                      <el-button size="mini" type="text" @click="cancelPopover(row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="move(row)">确定</el-button>
                    </div>
                    <el-button slot="reference" type="text" icon="el-icon-rank" title="移动到指定行" />
                  </el-popover>
                  <el-button type="text" icon="el-icon-delete" color="red" @click="onDel(row)" title="删除当前节点" />
                  <el-button type="text" icon="el-icon-plus" @click="onAdd(row)" title="添加兄弟节点" />
                  <el-button type="text" icon="el-icon-copy-document" @click="onAdd(row,true)" title="复制当前节点" />
                </template>
              </vxe-column>
            </vxe-table>
          </div>
          <!--          <div style="height: 300px;" t="为了防止表格数据超出屏幕后,编辑时行高动态变化导致表格来回滚动.">&nbsp;</div>-->
        </div>
      </div>
    </div>
    <div class="preview">
      <el-tabs v-model="activeName" style="height: 100%">
        <el-tab-pane label="表单预览" name="1">
          <div class="preview-content">
            <!--            <div v-for="(item, index) in groups" :key="index">-->
            <!--              <div class="label" v-if="item.label && item.fields.filter(v => v.showInForm).length > 0">{{ item.label }}</div>-->
            <!--              <div class="group" v-if="item.fields.filter(v => v.showInForm).length > 0">-->
            <!--                <componentItem class="item" v-for="(value, index2) in item.fields" :key="index2" :component-type="value.component" :item="value" />-->
            <!--              </div>-->
            <!--            </div>-->
            <AnyForm :module-json="currentMouduleJson"></AnyForm>
            <div class="bottom-bar">
              <el-button class="btn1" v-if="formConf.supportStash">暂存</el-button>
              <el-button class="btn2">提交</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="详情预览" name="2">
          <div class="preview-content2">
            <div v-for="(item, index) in groups" :key="index">
              <div class="label2" v-if="item.label && item.fields.filter(v => v.showInDetail).length > 0">{{ item.label }}</div>
              <div style="margin-top: 10px" v-if="item.fields.filter(v => v.showInDetail).length > 0">
                <el-card>
                  <div class="content2-item" v-for="(value, index2) in item.fields.filter(v => v.showInDetail)" :key="index2">
                    <div class="title">{{ value.label }}</div>
                    <div class="desc">XXX</div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="JSON预览" name="3" style="background: #ffffff;">
          <textarea style="width:100%;height: calc( 100% - 70px );margin-top: 5px;line-height: 1.5em;" readonly :value="demoJson" />
          <p>上面展示的是表单formData数据示例, 为了方便阅读, detailJson并未转换成单个字符串. 实际以小程序端收集到的数据为准, 如果两边字段不一致,就提bug.</p>
        </el-tab-pane>
        <el-tab-pane label="真机预览" name="4" style="background: #ffffff;">
          <div style="text-align: center;padding: 20px;">
            <template v-if="id">
              <QrcodeImage :value="id" style="width: 150px;height: 150px;" :alt="id" />
              <div>{{ id }}</div>
            </template>
            <div v-else>表单ID尚未生成，无法预览调试，请先保存。</div>
          </div>
          <div>QA:</div>
          <ol style="padding: 0 20px 20px 25px;">
            <li style="padding: 5px 0;">在微信小程序【首页-应用中心】点击【表单预览】功能图标, 打开动态表单预览页。</li>
            <li style="padding: 5px 0;">【动态表单预览】功能仅限体验版小程序或小程序开启【debugMode】之后可用。</li>
            <li style="padding: 5px 0;">生产环境【debugMode】开启方式：快速多次点击【我的】->【设置】->【关于我们】当前小程序版本号。</li>
            <li style="padding: 5px 0;">在【动态表单预览】功能页有4个按钮: 暂存、校验、刷新、扫码。</li>
            <li style="padding: 5px 0;">【暂存】不校验并收集表单数据，弹窗展示表单内容，实际不请求后端接口，可随意点击。</li>
            <li style="padding: 5px 0;">【校验】校验并收集表单数据，弹窗展示表单内容，实际不请求后端接口，可随意点击。</li>
            <li style="padding: 5px 0;">【刷新】重新请求接口拉取当前表单最新数据，请在当前页面点击保存后再在小程序上点击刷新。</li>
            <li style="padding: 5px 0;">【扫码】用来扫上面这个二维码,然后实时预览本表单。</li>
          </ol>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      title="moduleJson"
      :close-on-click-modal="false"
      :visible.sync="previewModuleJsonVisible"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-notice"
      lock-scroll
      width="800px"
      append-to-body
    >
      <div style="padding: 20px 0;">
        <textarea style="width:100%;height: 60vh;line-height: 1.5em;" readonly :value="previewModuleJsonStr" />
      </div>
    </el-dialog>
    <el-dialog
      title="打印模版SQL"
      :close-on-click-modal="false"
      :visible.sync="previewTemplateSQLVisible"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-notice"
      lock-scroll
      width="800px"
      append-to-body
    >
      <div style="padding: 20px 0;">
        <textarea style="width:100%;height: 60vh;line-height: 1.5em;" readonly :value="previewTemplateSQLStr" />
      </div>
      <div style="margin-bottom: 10px;text-align: right">
        <el-button type="primary" @click="copyText(previewTemplateSQLStr)">一键复制</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="表单预览"
      :close-on-click-modal="false"
      :visible.sync="showPreviewForm"
      class="JNPF-dialog JNPF-dialog_center JNPF-dialog-notice"
      lock-scroll
      width="800px"
      append-to-body
    >
      <div style="padding: 20px 0;">
        <AnyForm v-if="showPreviewForm && previewFormModuleJson" :module-json="previewFormModuleJson"></AnyForm>
      </div>
    </el-dialog>
    <showConfigDialog :visible.sync="showConfig.visible" :data="showConfig.data" :groups="groups" :from="showConfig.from" @confirm="finishShowConfig" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { saveAs } from 'file-saver'
import { getOrderTypeListV2 } from '@/api/business/pasteTicket'
import { getDictionaryType } from "@/api/systemData/dictionary";
import QrcodeImage from '@/components/Cicada/components/QrcodeImage.vue'
import AnyForm from '@/components/DynamicForm/AnyForm.vue'
import componentItem from "./components";
import { getComList, getNotAllowedVarNames, defaultTemplate, exsPayListGroupTemplate } from './appFormHelper'
import { formatJson } from '@/utils/format';
import showConfigDialog from "@/views/workFlow/formDesign/components/showConfigDialog.vue";

export default {
  filters: {
    boolFilter(v) {
      if (v === true) {
        return '✅'
      } else if (v === false) {
        return '×'
      }
      return v;
    }
  },
  components: { AnyForm, QrcodeImage, componentItem, showConfigDialog },
  props: {
    conf: {
      type: String,
    },
    dataForm: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      orderTypeList: [
        // 数据结构: { "code": number; "desc": string ; "bizTypeEnum": "APPLY_ORDER" | "EXS_ORDER" }
      ],
      formConf: {},
      groups: [],
      treeConfig: { childrenField: 'fields', expandAll: true },
      rowConfig: { isHover: true, isCurrent: true },
      columnConfig: { resizable: true },
      editConfig: { trigger: 'click', mode: 'row', showIcon: false },
      // 除非显式指定标志位为false,否则皆视为true支持====>>>> supportLimit: 是否支持长度限制; supportRequired:是否支持必填校验; supportPlaceholder:是否支持提示词; supportExport:是否支持对外映射; supportEmphasize:是否支持被报销单关联时展示
      comList: getComList(),
      activeName: "1",
      datetimePickerTypeOptions: [
        { label: "date", value: "date" },
        { label: "time", value: "time" },
        { label: "datetime", value: "datetime" },
        { label: "date-hour", value: "date-hour" },
        { label: "date-minute", value: "date-minute" },
        { label: "year-month", value: "year-month" },
        { label: "month-day", value: "month-day" },
        { label: "hour-minute", value: "hour-minute" }
      ],
      notAllowedVarNames: getNotAllowedVarNames(),
      dictionaryOptions: [],
      movePosition: undefined,
      previewModuleJsonVisible: false,
      previewModuleJsonStr: '',
      previewTemplateSQLVisible: false,
      previewTemplateSQLStr: '',
      previewFormModuleJson: '',
      showPreviewForm: false,
      showConfig: {
        visible: false,
        data: {},
        groups: []
      }
    }
  },
  computed: {
    id() {
      return this.dataForm.id;
    },
    fullName() {
      return this.dataForm.fullName || '';
    },
    selComList() {
      return this.comList.slice(1)
    },
    comLabelMap() {
      const ret = { group: '分组容器' };
      this.comList.forEach(v => {
        ret[v.value] = v.label
      })
      return ret;
    },
    comObjMap() {
      const ret = {};
      this.comList.forEach(v => {
        ret[v.value] = v
      })
      return ret;
    },
    applyOrderTypeList() {
      return this.orderTypeList.filter(v => v.bizTypeEnum === 'APPLY_ORDER')
    },
    autoOrderTypeList() {
      if (this.formConf.formType == 1) {
        return this.orderTypeList.filter(v => v.bizTypeEnum === 'APPLY_ORDER')
      } else if (this.formConf.formType == 2) {
        return this.orderTypeList.filter(v => v.bizTypeEnum === 'EXS_ORDER')
      }
      return [];
    },
    demoJson() {
      let ret = {};
      let detailJson = {};
      this.groups.forEach(g => {
        if (g.iterable && g.fieldName) {
          const obj = {};
          (g.fields || []).forEach(f => {
            if (f.fieldName) {
              obj[f.fieldName] = f.label || ''
            }
            (f.hiddenFieldsMapping || []).forEach(h => {
              if (h.rename) {
                obj[h.rename] = h.label || ''
              }
            })
          })
          detailJson[g.fieldName] = [obj]
        }
        if (!g.iterable) {
          (g.fields || []).forEach(f => {
            if (f.fieldName) {
              detailJson[f.fieldName] = f.label || ''
            }
            (f.hiddenFieldsMapping || []).forEach(h => {
              if (h.rename) {
                detailJson[h.rename] = h.label || ''
              }
            })
            if (f.export) {
              ret[f.fieldName] = f.label || ''
            }
          })
        }
      })
      return formatJson({ ...ret, detailJson });
    },
    currentMouduleJson() {
      return JSON.stringify({ ...this.formConf, groups: this.groups });
    }
  },
  watch: {
    conf(n) {
      this.parseConf(n)
    }
  },
  async created() {
    this.getDictionaryList();
    try {
      this.loadOrderTypeList();
    } catch (e) {
      console.error(e)
    }
    this.parseConf(this.conf);
  },
  mounted() {
    this.onPreviewForm();
  },
  methods: {
    getDictionaryList() {
      getDictionaryType().then(res => {
        this.dictionaryOptions = res.data.list.filter(v => v.enCode === "system")[0].children;
      })
    },
    onChangeCom(value, row) {
      const p = this.comObjMap[value].defaultProps;
      console.log('onChangeCom', { value, row, p })
      // 处理前对比当前row的，label和defaultLebel是否一样，一样则用p的label覆盖row的
      if (row.label === row.defaultLabel && p.label) {
        row.label = p.label;
      }
      // relatedApproval组件fieldName需要写死，后端才能取到
      if (value === "relatedApproval") {
        row.fieldName = p.fieldName;
      }
      // 针对 p 和 row 做差量, row有p没有的要删掉, p有row没有的要增加, p和row都有的要覆盖row
      for (const k in { ...row, ...p }) {
        const v = p[k];
        // 保留字段不做处理
        if (!['_X_ROW_KEY', 'component', 'fieldName', 'label'].includes(k)) {
          if (v == null) {
            delete row[k]
          } else {
            this.$set(row, k, this.clone(v))
          }
        }
      }
    },
    parseConf(conf) {
      if (conf) {
        const obj = JSON.parse(conf)
        this.formConf = obj;
        this.groups = obj.groups;
        delete this.formConf.groups;
      } else {
        this.formConf = {};
        this.groups = [];
      }
      this.$nextTick(() => {
        this.$refs.table.setAllTreeExpand(true);
      })
    },
    onAdd(currentRow, copy = false) {
      console.log('onAdd', currentRow);
      const { fullData } = this.getTableData();
      let i, j;
      if (!currentRow) {
        i = fullData.length;
        j = null;
      } else {
        const arr = this.findRowIndex(fullData, currentRow)
        i = arr[0];
        j = arr[1];
      }
      let _row;
      if (copy) {
        _row = this.clone(currentRow)
        if (_row.fields instanceof Array && _row.fields.length > 0) {
          _row.fields.forEach(r => {
            delete r._X_ROW_KEY;
          })
        }
        delete _row._X_ROW_KEY;
      }
      if (j != null) {
        fullData[i].fields.splice(j + 1, 0, copy ? _row : this.clone({ ...this.comObjMap['input'].defaultProps, component: 'input' }))
      } else {
        fullData.splice(i + 1, 0, copy ? _row : this.clone({
          ...this.comObjMap['group'].defaultProps,
          component: 'group',
          fields: [{ ...this.comObjMap['input'].defaultProps, component: 'input' }]
        }))
      }
      this.groups = [...fullData]
      this.$nextTick(() => {
        this.$refs.table.setAllTreeExpand(true);
      })
    },
    onAddExsPayListGroup() {
      const { fullData } = this.getTableData();
      let i = fullData.length;
      const group = JSON.parse(exsPayListGroupTemplate());
      fullData.splice(i + 1, 0, group);
      this.groups = [...fullData];
      this.$nextTick(() => {
        this.$refs.table.setAllTreeExpand(true);
      })
    },
    onDel(currentRow) {
      const { fullData } = this.getTableData();
      const [i, j] = this.findRowIndex(fullData, currentRow);
      if (j != null && fullData[i].fields.length < 2) {
        return this.$message.warning('分组容器内需要至少包含一个渲染控件')
      }
      if (i != null || j != null) {
        const seq = this.$refs.table.getRowSeq(currentRow);
        this.$confirm(`确定要移除行 ${seq} ？`, '提示', { type: 'warning' }).then(() => {
          if (j != null) {
            fullData[i].fields.splice(j, 1);
          } else if (i != null) {
            fullData.splice(i, 1)
          }
          this.groups = [...fullData]
        }).catch(() => {
        });
      }
    },
    // direction：up 或者 down
    moveCurrentRow(direction = "up", currentRow) {
      const { fullData } = this.getTableData();
      const [i, j] = this.findRowIndex(fullData, currentRow);
      let swaped = false;
      let upOrDown = direction === "up" ? 1 : -1;
      if (j != null) {
        // 移动分组容器内的组件
        if (j === 0 && direction === "up") {
          // 如果在容器内已经是第一个，且选择up，则跨容器，进入到上个容器的最后一个
          if (i > 0 && fullData[i].fields.length > 1) {
            this.transferCrossArray(fullData[i].fields, fullData[i - 1].fields, j, fullData[i - 1].fields.length);
          } else {
            return this.$message.warning('分组容器内需要至少包含一个渲染控件');
          }
        } else if (j === fullData[i].fields.length - 1 && direction === "down") {
          // 容器内最后一个，且选择down，则跨容器，进入下一个容器的第一个
          if (i < fullData.length - 1 && fullData[i].fields.length > 1) {
            this.transferCrossArray(fullData[i].fields, fullData[i + 1].fields, j, 0);
          } else {
            return this.$message.warning('分组容器内需要至少包含一个渲染控件');
          }
        } else {
          // 本容器内移动
          this.swapArray(fullData[i].fields, j, j - upOrDown);
        }
        swaped = true;
      } else if (i != null) {
        if (i > 0 && direction === "up") {
          this.swapArray(fullData, i, i - upOrDown);
          swaped = true;
        } else if (i < fullData.length - 1 && direction === "down") {
          this.swapArray(fullData, i, i - upOrDown);
          swaped = true;
        }
      }
      if (swaped) {
        this.groups = [...fullData]
      }
    },
    cancelPopover(currentRow) {
      const { fullData } = this.getTableData();
      const [i, j] = this.findRowIndex(fullData, currentRow);
      this.$refs[[i, j].join(",")].showPopper = false;
      this.movePosition = undefined;
    },
    move(currentRow) {
      const { fullData } = this.getTableData();
      const [i, j] = this.findRowIndex(fullData, currentRow);
      let indexList = [];
      if (this.movePosition) {
        // 例如movePosition为2.5, indexList为[2, 5]
        indexList = this.movePosition.toString().split(".");
        // 判断一下要移动的位置是否存在
        if (indexList[0] <= fullData.length && indexList[0] >= 1 && indexList[1] <= fullData[indexList[0] - 1].fields.length && indexList[1] >= 1) {
          this.transferCrossArray(fullData[i].fields, fullData[indexList[0] - 1].fields, j, indexList[1] - 1);
          this.$refs[[i, j].join(",")].showPopper = false;
          this.movePosition = undefined;
          this.groups = [...fullData];
        } else {
          this.$message.warning("请输入正确位置的行号");
        }
      } else {
        this.$message.warning("请输入要移动到的行号");
      }
    },
    findRowIndex(fullData, row) {
      for (let i = 0; i < fullData.length; i++) {
        const d = fullData[i];
        if (d._X_ROW_KEY === row._X_ROW_KEY) {
          return [i];
        }
        for (let j = 0; d.fields && j < d.fields.length; j++) {
          const f = d.fields[j];
          if (f._X_ROW_KEY === row._X_ROW_KEY) {
            return [i, j];
          }
        }
      }
    },
    getTableData() {
      const { fullData, visibleData, tableData, footerData } = this.$refs.table.getTableData();
      console.log('getTableData==>', { fullData, visibleData, tableData, footerData })
      return { fullData, visibleData, tableData, footerData }
    },
    collectData() {
      const { fullData } = this.getTableData();
      const d = JSON.parse(JSON.stringify(fullData));
      for (let i = 0; i < d.length; i++) {
        const v1 = d[i];
        delete v1._X_ROW_KEY;
        if (v1.fields) {
          for (let j = 0; j < v1.fields.length; j++) {
            const v2 = v1.fields[j];
            delete v2._X_ROW_KEY;
          }
        }
      }
      return { ...this.formConf, groups: d };
    },
    getData() {
      const d = this.collectData();
      if (d.groups.length > 0) {
        this.dataValidate(d);
      }
      return d;
    },
    dataValidate(obj) {
      /* ---AppFormConf，即表单公共设置校验--- */
      if (!obj.formType) {
        throw new Error("【表单设计器】表单类型不能为空");
      }
      if (!obj.orderType) {
        throw new Error("【表单设计器】单据类型不能为空");
      }
      /* ---全局特殊规则校验--- */
      // 报销单必须存在字段 exsCost 且必须对外暴露
      if (obj.formType === 2) {
        let flag = false;
        !obj.iterable && obj.groups.forEach(v1 => {
          v1.fields.forEach(v2 => {
            if (v2.fieldName === "exsCost" && v2.export === true) {
              flag = true;
            }
          });
        });
        if (!flag) {
          throw new Error("【表单设计器】报销单的非迭代容器组必须存在字段exsCost，且必须对外暴露，即字段同步");
        }
      }

      /* ---group，即组件和容器内部字段校验--- */
      const fieldList = []; // 收集所有字段名，用于查重
      obj.groups.forEach((v1, index1) => {
        if (v1.iterable && !v1.fieldName) {
          throw new Error(`【表单设计器】#${index1 + 1} 分组容器迭代分组时, 需要填写字段名`);
        }
        if (!v1.iterable && !v1.fieldName && (v1.showInForm === false || (v1.showInFormPro && v1.showInFormPro.length > 0))) {
          throw new Error(`【表单设计器】#${index1 + 1} 分组容器设置表单展示为否或者自定义时, 需要填写字段名`);
        }
        if (!v1.iterable && !v1.fieldName && (v1.showInDetail === false || (v1.showInDetailPro && v1.showInDetailPro.length > 0))) {
          throw new Error(`【表单设计器】#${index1 + 1} 分组容器设置详情展示为否或者自定义时, 需要填写字段名`);
        }
        if (v1.fieldName != null && v1.fieldName !== '' && !/^[a-zA-Z0-9_]+$/gim.test(v1.fieldName)) {
          throw new Error(`【表单设计器】#${index1 + 1} 字段名非法, 只允许字母数字下划`);
        }
        if (v1.fieldName) {
          fieldList.push(v1.fieldName);
        }
        const hiddenFieldList = [];
        v1.fields.forEach((v2, index2) => {
          const prefix = `【表单设计器】#${index1 + 1}.${index2 + 1} `;
          if (!v2.label || !v2.fieldName) {
            throw new Error(`${prefix}组件的名称和字段不能为空`);
          }
          if (!/^[a-zA-Z0-9_]+$/gim.test(v2.fieldName)) {
            throw new Error(`${prefix}字段名非法, 只允许字母数字下划`);
          }
          /* ---字段冲突校验：保留字段key--- */
          if (v1.iterable && v2.fieldName === "__key") {
            throw new Error(`${prefix}迭代分组容器内组件的字段名不能为 ${v2.fieldName}`);
          }
          if (v1.iterable && v2.export) {
            throw new Error(`${prefix}迭代分组容器内的组件字段不可以【字段同步】，字段名：${v2.fieldName}`);
          }
          /* ---保留字段校验：如果勾选了字段同步，则保留一组字段，防止冲突--- */
          if (v2.export && this.notAllowedVarNames.includes(v2.fieldName)) {
            throw new Error(`${prefix}勾选了字段同步选项的组件，字段名不能为${v2.fieldName}`);
          }
          if (!v1.iterable) {
            // 组件为：展示字段，不用参与去重校验
            if (v2.component !== "showValue") {
              fieldList.push(v2.fieldName);
            }
            if (v2.hiddenFieldsMapping) {
              fieldList.push(...v2.hiddenFieldsMapping.map(val => val.rename).filter(v => !!v));
            }
          } else {
            if (v2.hiddenFieldsMapping) {
              hiddenFieldList.push(...v2.hiddenFieldsMapping.map(val => val.rename).filter(v => !!v));
            }
          }
        });
        // 迭代组内的字段只需要在迭代组内部不重复即可
        if (v1.iterable) {
          const temp = [...v1.fields.filter(v => v.component !== "showValue").map(v => v.fieldName), ...hiddenFieldList];
          const isRepeat = temp.filter((x, index, arr) => arr.findIndex(y => y === x) !== index);
          if (isRepeat.length > 0) {
            throw new Error(`【表单设计器】迭代分组容器内的字段以及隐藏映射字段不能重复！重复字段为：${isRepeat.join("，")}`);
          }
        }
      });
      /* ---使用fieldList，检查所有字段是否重复--- */
      const isRepeat = fieldList.filter((x, index, arr) => arr.findIndex(y => y === x) !== index);
      if (isRepeat.length > 0) {
        throw new Error(`【表单设计器】所有组件字段和隐藏映射字段不能重复！重复字段为：${isRepeat.join("，")}`);
      }
    },
    clone(v) {
      return v != null && (typeof v == 'object' || v instanceof Array) ? JSON.parse(JSON.stringify(v)) : v;
    },
    swapArray(arr, index1, index2) {
      arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    },
    // 把arr1中index1位置的元素，移动到targetArr2中targetIndex2位置上
    transferCrossArray(arr1, targetArr2, index1, targetIndex2) {
      targetArr2.splice(targetIndex2, 0, arr1.splice(index1, 1)[0]);
    },
    iterableChange(val, rowIndex) {
      const { fullData } = this.getTableData();
      if (!val) {
        // 去掉勾选，groups对应的limit重置为1
        fullData[rowIndex].limit = 1;
      }
      if (val) {
        // 勾选后，该group下的所有field组件的同步字段，重置为false
        fullData[rowIndex].fields.forEach(v => {
          v.export = false;
        });
      }
    },
    loadOrderTypeList() {
      getOrderTypeListV2().then(res => {
        this.orderTypeList = res.data || [];
      })
    },
    onChangeFormType() {
      this.$set(this.formConf, 'orderType', undefined);
      this.$set(this.formConf, 'smartApprovalOrderType', undefined);
    },
    exportData() {
      const str = JSON.stringify(this.collectData());
      const blob = new Blob([str], { type: "application/json;charset=utf-8" });
      saveAs(blob, `导出-${this.fullName}-moduleJson-${dayjs().format('YYYYMMDDHHmmssSSS')}.json`);
    },
    importData() {
      this.$refs.inputRef.click();
    },
    onChangeFile(e) {
      const files = e.target.files || [];
      if (files.length !== 1) {
        return this.$message.warning("请选择1个json文件");
      }
      const file = files[0];
      if (file.type.toLowerCase().indexOf('application/json') < 0) {
        return this.$message.warning(file.name + ' 不是json文件');
      }
      const reader = new FileReader();
      reader.onload = (ee) => {
        const content = ee.target.result;
        // console.log('读取到文件内容', content);
        const { groups, ...formConf } = JSON.parse(content)
        console.log('groups,formConf', { groups, formConf })
        if (groups && formConf) {
          this.groups = groups;
          this.formConf = formConf;
          this.$message.success("导入成功")
        }
      };
      reader.readAsText(file);
      this.$refs.inputRef.value = null;
    },
    onSyncField() {
      this.$confirm(`是否将当前表格中已勾选[字段同步]的字段同步添加至【字段设置】tab页内的表格中? (注意: 有去重逻辑,防止重复添加. 字段只增不删)`, '提示', { type: 'warning' }).then(() => {
        const { fullData } = this.getTableData();
        const unExportFields = [];
        const exportFields = [];
        fullData.forEach(g => {
          if (!g.iterable) {
            if (g.fieldName) {
              unExportFields.push({ fieldName: g.fieldName })
            }
            g.fields.forEach(f => {
              if (f.export && f.fieldName && f.label) {
                exportFields.push({ fieldName: f.fieldName, label: f.label })
              } else if (f.fieldName) {
                unExportFields.push({ fieldName: f.fieldName })
              }
            })
          }
        });
        this.$emit("updateDraftJson", exportFields, unExportFields);
      });
    },
    onViewModuleJson() {
      this.previewModuleJsonStr = formatJson(this.collectData());
      this.previewModuleJsonVisible = true;
    },
    collectTemplateSQL() {
      let sqlList = [];
      if (this.formConf.formType === 1) {
        // 申请单的默认sql
        sqlList = [
          "select\n" + "id as \"编号\"",
          "apply_user_name as \"申请发起人\"",
          "DATE_FORMAT(apply_date ,'%Y年%m月%d日') as \"申请提交时间\"",
          "base_organize.F_FullName as \"所属单位名称\""
        ];
      } else if (this.formConf.formType === 2) {
        // 报销单的默认sql
        sqlList = [
          "select\n" + "id as \"编号\"",
          "exs_user_name as \"报销人\"",
          "convert(exs_cost, CHAR) as \"报销总金额\"",
          "exs_cost_cn as \"报销总金额大写\"",
          "DATE_FORMAT(apply_time ,'%Y年%m月%d日') as \"提交时间\"",
          "base_organize.F_FullName as \"所属单位名称\""
        ];
      }
      const labelMap = {}; // 把所有不重复的label塞入，用来判断是否重复，重复的sql别名上带上fieldName
      this.groups.forEach(v1 => {
        if (!v1.iterable) {
          v1.fields.forEach(v2 => {
            let str = "";
            if (labelMap[v2.label]) {
              str = `json_unquote(json_extract(detail_json, "$.${v2.fieldName}")) as "${v2.label}${v2.fieldName}"`;
            } else {
              str = `json_unquote(json_extract(detail_json, "$.${v2.fieldName}")) as "${v2.label}"`;
              labelMap[v2.label] = 1;
            }
            sqlList.push(str);
          });
        } else {
          // 可迭代分组，要通过设置的limit来循环
          for (let i = 0; i < v1.limit; i++) {
            const labelMap2 = {};
            v1.fields.forEach(v2 => {
              let str = "";
              if (labelMap2[v2.label]) {
                str = `json_unquote(json_extract(detail_json, "$.${v1.fieldName}[${i}].${v2.fieldName}")) as "${v2.label}${i + 1}${v2.fieldName}"`;
              } else {
                str = `json_unquote(json_extract(detail_json, "$.${v1.fieldName}[${i}].${v2.fieldName}")) as "${v2.label}${i + 1}"`;
                labelMap2[v2.label] = 1;
              }
              sqlList.push(str);
            });
          }
        }
      });
      let sqlStr = sqlList.join(",\n");
      if (this.formConf.formType === 1) {
        sqlStr += "\nfrom ccd_unified_apply_order\nleft join base_organize on ccd_unified_apply_order. ent_id = base_organize.F_id\nwhere id = @formId";
      } else if (this.formConf.formType === 2) {
        sqlStr += "\nfrom ccd_exs_order\nleft join base_organize on ccd_exs_order.ent_id = base_organize.F_id\nwhere id = @formId";
      }
      return sqlStr;
    },
    onViewTemplateSQL() {
      this.previewTemplateSQLStr = this.collectTemplateSQL();
      this.previewTemplateSQLVisible = true;
    },
    async copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.$message.success("复制成功");
      } catch (err) {
        this.$message.error("复制失败，请重试");
      }
    },
    onPreviewForm() {
      try {
        const moduleJson = this.getData();
        if (moduleJson && moduleJson.groups && moduleJson.groups.length > 0) {
          this.previewFormModuleJson = JSON.stringify(moduleJson);
        } else {
          this.previewFormModuleJson = '';
        }
        // this.showPreviewForm = true;
      } catch (e) {
        const msg = e.msg || e.message;
        msg && this.$message.warning(msg)
      }
    },
    orderTypeChange(val) {
      // 当单据类型为差旅报销单时，弹窗提示，是否使用内置模版
      if (Object.keys(defaultTemplate()).includes(val.toString())) {
        this.$confirm('检测到该单据类型有内置模版，是否应用？注意应用后下方配置将重置，请谨慎操作！', '提示', {
          type: 'warning'
        }).then(() => {
          // 塞入内置模版moduleJson
          const { groups, ...formConf } = JSON.parse(defaultTemplate()[val]);
          console.log('groups,formConf', { groups, formConf })
          if (groups && formConf) {
            this.groups = groups;
            this.formConf = formConf;
            this.$message.success("应用模版成功")
          }
        }).catch(() => {})
          .finally(() => {
          // 确认框选择完后，会再次聚焦在该选择组件上，导致打开了下拉框，因此手动隐藏下拉框
            this.$refs.orderType.blur();
          })
      }
    },
    configShow(row, from) {
      Object.assign(this.showConfig, { visible: true, data: { ...row }, groups: this.groups, from })
    },
    finishShowConfig(data) {
      console.log("表单或详情展示配置数据:", data);
      const { fullData } = this.getTableData();
      const arr = this.findRowIndex(this.groups, data);
      if (arr.length > 1) {
        fullData[arr[0]].fields[arr[1]] = { ...data };
      } else {
        fullData[arr[0]] = { ...data };
      }
      this.groups = [...fullData]
      console.log("finishShowConfig", this.groups);
    },
    getShowInFlag(row, from) {
      if (from === 1) {
        if (row.showInFormPro && row.showInFormPro.length > 0) {
          // console.log("getShowInFlag", row.showInFormPro);
          return '自定义';
        } else {
          // 默认展示在表单
          return row.showInForm == null ? true : row.showInForm;
        }
      } else {
        if (row.showInDetailPro && row.showInDetailPro.length > 0) {
          return '自定义';
        } else {
          // 默认展示在表单
          return row.showInDetail == null ? true : row.showInDetail;
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.app-form {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: #ffffff;
  display: flex;
  .conf-table {
    width: 0;
    height: 100%;
    flex: 1;
    .conf-table-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      .base-c {
        padding: 10px;
      }
      .table-c {
        padding: 0 5px;
        height: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        .table-h {
          height: 0;
          flex: 1;
        }
      }
    }
  }
  .preview {
    width: 450px;
    height: 100%;
    box-sizing: border-box;
    background-color: #F9F9F9;
    position: relative;
    .preview-content {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding-bottom: 85px;
    }

    .label {
      font-weight: bold;
      margin: 20px 0 10px 10px;
    }
    .label2 {
      margin: 20px 0 10px 10px;
      color: #919499;
    }

    .group {
      background-color: #FFFFFF;
      padding: 10px 10px 10px 0;
      margin-top: 10px;

      .item {
        margin-bottom: 20px;
      }

      .item:last-child {
        margin-bottom: 0;
      }
    }
    .preview-content2 {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 0 10px 10px 10px;
    }
    .content2-item {
      display: flex;
      margin-bottom: 20px;
      .title {
        font-size: 14px;
        color: #5C5F66;
      }
      .desc {
        font-size: 14px;
        color: #292C33;
        margin-left: auto;
      }
    }
    .content2-item:last-child {
      margin-bottom: 0;
    }
    .bottom-bar {
      background-color: #FFFFFF;
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 75px;
      padding: 12px 16px 12px 12px;
      display: flex;
      .btn1 {
        width: 109px;
        height: 51px;
        font-size: 16px;
        font-weight: 500;
        background: #EBFDFF;
        color: #00B4C4;
        border-radius: 8px;
        border: 1px solid #00B4C4;
      }
      .btn2 {
        flex: 1;
        height: 51px;
        background: linear-gradient(180deg, #00B4C4 0%, rgba(0, 180, 196, 0.6) 100%);
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        color: #FFFFFF;
      }
    }
  }
}
.not-support {
  cursor: not-allowed;
}
.in-col-form {
  ::v-deep .el-form-item--mini.el-form-item {
    margin-bottom: 5px;
  }
  ::v-deep .el-form-item__label {
    margin-right: 0;
    padding-right: 5px;
  }
  ::v-deep .el-checkbox {
    margin-right: 10px;
  }
}
::v-deep .el-checkbox__label {
  padding-left: 3px;
}
.spans {
  span+span {
    margin-left: 1em;
  }
}
::v-deep .el-radio__label {
  padding-left: 2px;
}
</style>
