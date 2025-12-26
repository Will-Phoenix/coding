<template>
  <tableList :status="0" ref="table" />
</template>

<script>
import tableList from "@/views/pasteTicketCenter/component/table";
export default {
  name: 'UnpasteTicketManage',
  components: { tableList },
  data() {
    return {}
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.$refs.table && this.$refs.table.refreshOnActive && this.$refs.table.refreshOnActive()
    }
  },
}
</script>
<style lang="scss" scoped/>
