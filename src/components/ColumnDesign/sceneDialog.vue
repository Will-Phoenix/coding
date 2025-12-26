<template>
  <div class="sceneDialog-container">
    <el-dialog title="请选择场景" :close-on-click-modal="false" :visible.sync="visible"
               class="JNPF-dialog JNPF-dialog_center JNPF-dialog-tree-select" lock-scroll append-to-body
               width='800px'>
      <div class="JNPF-common-layout">
        <div class="JNPF-common-layout-center">
          <div class="JNPF-common-layout-main JNPF-flex-main">
            <JNPF-table :data="list" :border="false" highlight-current-row
                        @row-click="rowClick" :hasNO="false">
              <el-table-column width="35">
                <template slot-scope="scope">
                  <el-radio :label="scope.row.id" v-model="checked">&nbsp;</el-radio>
                </template>
              </el-table-column>
              <el-table-column type="index" width="50" label="序号" align="center" />
              <el-table-column prop="name" label="场景名称" />
              <el-table-column prop="readable" label="可查看" />
              <el-table-column prop="unreadable" label="不可查看" />
              <el-table-column prop="editable" label="可编辑" />
              <el-table-column prop="notEditable" label="不可编辑" />
            </JNPF-table>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false" size="small">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="select()" size="small">{{$t('common.confirmButton')}}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'sceneDialog',
  props: {
    value: {
      default: ''
    },
    formSceneData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [],
      checked: '',
      checkedRow: {},
      visible: false
    }
  },
  mounted() {
    let datas = []
    this.formSceneData.forEach(obj => {
      let readable = []
      let unreadable = []
      let editable = []
      let notEditable = []
      obj.field.forEach(f => {
        if (f.read === true) {
          readable.push(f.label)
        } else {
          unreadable.push(f.label)
        }
        if (f.write === true) {
          editable.push(f.label)
        } else {
          notEditable.push(f.label)
        }
      })
      datas.push({
        name: obj.name,
        id: obj.id,
        readable: readable.toString(),
        unreadable: unreadable.toString(),
        editable: editable.toString(),
        notEditable: notEditable.toString()
      })
    })
    this.list = datas
  },
  methods: {
    openDialog() {
      if (this.disabled) return
      this.checked = this.value
      this.visible = true
    },
    select() {
      if (!this.checked) return
      this.$emit('change', this.checked)
      this.visible = false
    },
    rowClick(row) {
      this.checked = row.id
      this.checkedRow = row
    },
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  max-height: 70vh;
  padding: 0 0 10px !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
