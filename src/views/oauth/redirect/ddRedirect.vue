<template>
</template>

<script>
import { login } from '@/api/user';
import * as dd from 'dingtalk-jsapi'; // 此方式为整体加载，也可按需进行加载
import qs from 'qs'
import { autoInjectConsole } from '@/utils'

export default {
  data() {
    return {}
  },
  async created() {
    if (this.$route.query.hasConsole === 'true') {
      await autoInjectConsole();
    }
    this.doLogin();
  },
  methods: {
    doLogin() {
      const { orgEncode, corpId } = this.$route.query;
      const that = this;
      // 获取免登code
      dd.ready(function() {
        console.log("钉钉SDK", dd);
        dd.runtime.permission.requestAuthCode({
          corpId: corpId, // 企业id
          onSuccess: function(info) {
            const code = info.code; // 通过该免登授权码可以获取用户身份
            // 在此调登录接口
            const time = Date.now();
            const random = Math.floor(Math.random() * 1000000000);
            const uuid = 'dd_' + random + String(time);
            const params = {
              grant_type: 'dingTalk',
              source: 'dd',
              uuid: uuid,
              code: code,
              orgEncode: orgEncode
            };
            login(qs.stringify(params))
              .then((response) => {
                console.log("response", response);
                if (response.code == 200) {
                  that.$store.dispatch('user/setToken', response.data).then(res => {
                    that.$router.push({
                      path: '/home',
                      query: that.$route.query
                    })
                  })
                }
              })
              .catch(async(e) => {
                console.error(e);
              });
          }
        });
      });
    }
  },
}
</script>

<style lang="scss" scoped>
</style>
