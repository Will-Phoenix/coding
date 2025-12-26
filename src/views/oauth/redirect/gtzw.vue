<template>
  <div v-if="isSuccess" class="info">{{ msg }}</div>
  <showInfos v-else></showInfos>
</template>

<script>
import { loginByCode } from '@/api/permission/authorize';
import showInfos from './components/showInfos.vue';
export default {
  components: {
    showInfos,
  },
  data() {
    return {
      msg: "正在授权登录...",
      code: "",
      state: 1,
      redirect: "",
      otherQuery: "",
      isSuccess: true
    }
  },
  mounted() {
    const {
      code,
      state,
      url
    } = this.$route.query;
    this.otherQuery = this.getOtherQuery(this.$route.query);
    this.code = code;
    this.state = state || 1;
    this.redirect = url ? decodeURIComponent(url) : '';
    if (this.checkParam()) {
      this.doLogin();
    }
    console.log(this.redirect)
  },
  methods: {
    checkParam() {
      if (!this.code) {
        this.msg = "参数【code】缺失!";
        this.isSuccess = false;
        return false;
      }
      if (!this.state) {
        this.msg = "参数【state】缺失!";
        this.isSuccess = false;
        return false;
      }
      return true;
    },
    doLogin() {
      loginByCode({ code: this.code, state: this.state })
        .then((response) => {
          if (response.code == 200) {
            this.isSuccess = true;
            this.$store.dispatch('user/setToken', response.data).then(res => {
              this.$router.push({
                path: this.redirect || '/home',
                query: this.otherQuery
              })
            })
          } else {
            this.isSuccess = false;
          }
        })
        .catch(async(e) => {
          this.isSuccess = false;
          console.error(e);
          this.msg = e ? (typeof e === "string" ? e : e.msg || e.message || "登录失败") : "登录失败!";
          // if (e.code === 400) {
          //   await this.$store.dispatch('user/logout');
          // }
          // this.$router.push({
          //   path: '/login',
          // })
        });
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    },
  },
}
</script>

<style lang="scss" scoped>
.info {
  width: 100%;
  height: 100vh;
  background: white;
  padding: 20px;
  font-size: 16px;
  font-weight: 500;
  color: black;
}
</style>
