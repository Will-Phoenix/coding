<template>
  <el-dialog
    title="关联规则"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <rulesTable :show-select="true" :rule-ids="ruleIds" :rule-ids-list="ruleIdsList" @getSelect="handleSelect" />
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="buttonLoading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import rulesTable from "./rulesTable";
import { relationSmartAuditRules } from "@/api/business/businessApproval";

export default {
  components: { rulesTable },
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
    ruleIds: {
      type: String,
      default: ""
    },
    ruleIdsList: {
      type: Array,
      default: []
    },
    bizFlowModuleId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      multipleSelection: [],
      buttonLoading: false,
    }
  },
  watch: {
    visible(n) {
      if (n) {
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.buttonLoading) return;
      relationSmartAuditRules({
        bizFlowModuleId: this.bizFlowModuleId,
        auditRuleIdList: this.multipleSelection.map(v => ({ ruleId: v.id, failType: v.failType }))
      }).then(() => {
        this.$message.success("操作成功");
        this.updateVisible(false);
        this.$emit("confirm", this.multipleSelection);
      });
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    handleSelect(selection) {
      this.multipleSelection = selection;
    },
  }
}
</script>
<style lang="scss" scoped></style>
