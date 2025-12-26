<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="科目编号" prop="code">
        <el-input v-model="formData.code" placeholder="请输入科目编号" />
      </el-form-item>
      <el-form-item label="科目名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入科目名称" />
      </el-form-item>
      <el-form-item label="助记码" prop="memCode">
        <el-input v-model="formData.memCode" placeholder="请输入助记码" />
      </el-form-item>
      <el-form-item label="科目类型" prop="subAttr">
        <el-select v-model="formData.subAttr" placeholder="请选择科目类型" style="width: 100%">
          <el-option
            v-for="item in subjectAttributeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="余额方向" prop="balDir">
        <el-select v-model="formData.balDir" placeholder="请选择余额方向" style="width: 100%">
          <el-option
            v-for="item in balanceDirectionOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <div style="font-weight: bold">辅助核算关联</div>
      <el-divider />
      <div style="margin: 0 0 10px 0">已选择{{ getSelectedNum() }}项</div>
      <vxe-table
        border
        resizable
        show-overflow
        row-id="id"
        ref="xTable"
        max-height="200"
        :data="tableData"
        :edit-config="{trigger: 'click', mode: 'cell'}"
      >
        <vxe-column type="checkbox" width="60" />
        <vxe-column field="code" title="辅助核算编码" min-width="80" />
        <vxe-column field="name" title="辅助核算名称" min-width="80" />
        <vxe-column field="isMustFillIn" title="必填" :edit-render="{}" min-width="60">
          <template #default="{ row }">
            <vxe-checkbox v-model="row.isMustFillIn" />
          </template>
          <template #edit="{ row }">
            <vxe-checkbox v-model="row.isMustFillIn" />
          </template>
        </vxe-column>
        <vxe-column field="isMustSelectLast" title="只能选择末级" :edit-render="{}" min-width="90">
          <template #default="{ row }">
            <vxe-checkbox v-model="row.isMustSelectLast" />
          </template>
          <template #edit="{ row }">
            <vxe-checkbox v-model="row.isMustSelectLast" />
          </template>
        </vxe-column>
      </vxe-table>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  getFinAssistAccountingEntityList,
  postFinUnitSubjectEntitySave,
  postFinUnitSubjectEntityUpdate
} from "@/api/business/unitSubjectDefinition";

export default {
  name: 'addSubject',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: Object,
      default: () => ({})
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
    subjectAttributeOptions: {
      type: Array,
      default: () => []
    },
    balanceDirectionOptions: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      formData: {
        code: '',
        parentCode: '',
        name: '',
        memCode: '',
        subAttr: '',
        balDir: '',
      },
      rules: {
        code: [{ required: true, message: '请输入' }],
        name: [{ required: true, message: '请输入' }],
        subAttr: [{ required: true, message: '请选择' }],
        balDir: [{ required: true, message: '请选择' }],
      },
      tableData: [],
    }
  },
  computed: {
    title() {
      return this.data.id ? '编辑' : '新增'
    },
  },
  watch: {
    visible(n) {
      if (n) {
        for (const key in this.formData) {
          this.formData[key] = this.data[key]
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
        this.tableData = []
        this.loadAssistAccountingEntityList();
      }
    }
  },
  methods: {
    loadAssistAccountingEntityList() {
      getFinAssistAccountingEntityList().then(res => {
        const list = res.data
        // 编辑
        const relations = this.data.relations;
        let selectedKeys = []
        if (relations && relations.length > 0) {
          selectedKeys = relations.map(v => v.assistAccountingId)
        }
        let selectedRows = []
        let tableList = []
        for (let i = 0; i < list.length; i++) {
          let index = -1
          if (selectedKeys && selectedKeys.length > 0) {
            index = selectedKeys.indexOf(list[i].id)
          }
          if (index > -1) {
            let item = {
              id: list[i].id,
              name: list[i].name,
              code: list[i].code,
              isMustFillIn: relations[index].isMustFillIn === 1,
              isMustSelectLast: relations[index].isMustSelectLast === 1,
            }
            tableList.push(item)
            selectedRows.push(item)
          } else {
            tableList.push({
              id: list[i].id,
              name: list[i].name,
              code: list[i].code,
              isMustFillIn: false,
              isMustSelectLast: false,
            })
          }
        }
        this.tableData = tableList
        this.$refs.xTable.setCheckboxRow(selectedRows, true)
      })
    },
    onConfirm() {
      if (this.loading) return;
      let selectRecords = this.$refs.xTable.getCheckboxRecords()
      this.$refs.form.validate(valid => {
        if (valid) {
          let relations = selectRecords.map(v => {
            return {
              assistAccountingId: v.id,
              isMustFillIn: v.isMustFillIn ? 1 : 0,
              isMustSelectLast: v.isMustSelectLast ? 1 : 0
            }
          })
          if (this.data.id) {
            postFinUnitSubjectEntityUpdate({ id: this.data.id, ...this.formData, relations: relations }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } else {
            postFinUnitSubjectEntitySave({ ...this.formData, relations: relations }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          }
        }
      })
    },
    getSelectedNum() {
      if (this.$refs.xTable) {
        return this.$refs.xTable.getCheckboxRecords().length
      }
      return 0
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-divider--horizontal {
  margin: 12px 0;
}
</style>
