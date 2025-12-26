<template>
  <table-list :from="1" ref="table" />
</template>

<script>
import tableList from "./components/table";
export default {
  name: "AccountVoucherFileManage",
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
