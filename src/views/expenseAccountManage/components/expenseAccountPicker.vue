<template>
  <el-dialog
    title="报销单选择列表"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="50%"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <JNPF-table
      ref="tableRef"
      :data="data"
      :has-c="false"
      highlight-current-row
      @row-click="singleSelect"
      style="width: 100%;height: 450px"
    >
      <el-table-column
        label="选择"
        align="left"
        width="60"
      >
        <template slot-scope="scope">
          <el-radio v-model="radioSelect" :label="scope.row.id">&nbsp</el-radio>
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="报销单名称"
        align="left"
      />
      <el-table-column
        label="报销人"
        prop="exsUserName"
        algin="left"
      />
      <el-table-column
        label="报销金额"
        prop="exsCost"
        algin="left"
      />
      <el-table-column
        label="收款人"
        algin="left"
      >
        <template slot-scope="scope">
          <span>{{ func(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="报销日期"
        prop="applyTime"
        algin="left"
      />
      <el-table-column
        label="是否已匹配银行回执单"
        prop="isMatch"
        algin="left"
      />
    </JNPF-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: [Object, Array],
      default: () => ({})
    },
    func: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      radioSelect: ""
    }
  },
  watch: {
    visible(n) {
      if (!n) {
        this.radioSelect = "";
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.radioSelect === "") {
        this.$message.warning("请点击选择一个");
        return;
      }
      this.$emit("confirm", this.data.filter(v => v.id === this.radioSelect)[0]);
      this.updateVisible(false);
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    singleSelect(row) {
      this.radioSelect = row.id;
    },
  }
}
</script>
<style lang="scss" scoped></style>
