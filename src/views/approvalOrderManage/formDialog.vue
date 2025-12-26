<template>
  <el-dialog
    title="表单详情"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <AnyFormDetail v-if="show" :info="info" />
    <div v-else>加载中</div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import AnyFormDetail from "@/components/DynamicForm/AnyFormDetail.vue"
import { FlowBeforeInfo } from "@/api/workFlow/FlowBefore";

export default {
  name: 'formDialog',
  components: { AnyFormDetail },
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
    id: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      info: undefined,
      show: false
    }
  },
  computed: {

  },
  watch: {
    visible(n) {
      if (n) {
        this.initData();
      } else {
        this.info = undefined;
        this.show = false;
      }
    }
  },
  methods: {
    initData() {
      FlowBeforeInfo(this.id).then(res => {
        this.info = res.data;
        this.show = true;
      });
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
  }
}
</script>
