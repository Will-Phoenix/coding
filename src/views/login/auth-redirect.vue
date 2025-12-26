<script>
import ls from "@/utils/localStorageUtil"
export default {
  name: "AuthRedirect",
  created() {
    const hash = window.location.search.slice(1);
    if (window.localStorage) {
      ls.setItem("x-admin-oauth-code", hash);
      window.close();
    }
  },
  render: function(h) {
    return h(); // avoid warning message
  }
};
</script>
