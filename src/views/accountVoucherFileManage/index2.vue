<template>
  <table-list :from="2" ref="table" />
</template>

<script>
import tableList from "./components/table";
export default {
  name: "AccountVoucherFileManage2",
  components: { tableList },
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
