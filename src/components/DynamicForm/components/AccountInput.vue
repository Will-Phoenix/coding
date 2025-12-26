<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-autocomplete
      v-model="value"
      :fetch-suggestions="querySearchAsync"
      :placeholder="placeholder"
      @select="handleSelect"
      @input="onInput"
      style="width: 100%;"
    />
  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'
import { getCcdUserBankPage } from "@/api/business/bankCardInfoManagement";

export default {
  name: 'AccountInput',
  components: { },
  mixins: [ComMixin],
  data() {
    return {
      links: [],
      value: "",
      bankNumber: "",
      payeeOpenedBank: "",
    }
  },
  computed: {
    rules() {
      return [
        {
          validator: this.validateAmount,
          trigger: 'change',
          required: !!this.required
        }
      ]
    },
  },
  watch: {
    bankNumber(n) {
      // this.$set(this.detailJson["exsPayList"][this.groupIterateIndex], "payeeBankNumber1", this.encryptBankCard(n) || "")
      this.$set(this.detailJson["exsPayList"][this.groupIterateIndex], "payeeBankNumber", n || "")
    },
    payeeOpenedBank(n) {
      this.$set(this.detailJson["exsPayList"][this.groupIterateIndex], "payeeOpenedBank", n || "")
    },
    moduleValue(n) {
      console.log('account input change', n)
      // this.updateHiddenFields({
      //   payeeBankNumber: n,
      //   payeeOpenedBank: this.payeeOpenedBank
      // });
    }
  },
  mounted() {
    this.getBankInfo();
    const monuteValue = this.detailJson["exsPayList"][this.groupIterateIndex]["payeeName"];
    console.log('payee name monuteValue====', monuteValue)

    if (monuteValue) {
      this.moduleValue = monuteValue;
      this.value = monuteValue;
    }
  },
  methods: {
    encryptBankCard(cardNumber) {
      if (!cardNumber || cardNumber.length < 8) {
        return cardNumber;
      }
      return cardNumber.replace(/(\d{4})\d+(\d{4})/, (match, firstFour, lastFour) => {
        const stars = '*'.repeat(match.length - 8);
        return firstFour + stars + lastFour;
      });
    },
    getBankInfo() {
      getCcdUserBankPage({ name: "", current: 1, size: 9999 }).then(res => {
        this.links = res.data.records.map(item => {
          return {
            value: item.name + " " + this.encryptBankCard(item.bankNumber) + " " + item.baseOpened,
            name: item.name,
            bankNumber: item.bankNumber,
            baseOpened: item.baseOpened
          }
        });
      }).finally(() => {

      });
    },
    querySearchAsync(queryString, cb) {
      var links = this.links;
      var results = queryString ? links.filter(this.createFilter(queryString)) : links;
      cb(results);
    },
    createFilter(queryString) {
      return (link) => {
        return link.value.toLowerCase().includes(queryString);
      };
    },

    handleSelect(item) {
      this.value = item.name;
      this.bankNumber = item.bankNumber;
      this.moduleValue = item.name;
      this.payeeOpenedBank = item.baseOpened;
    },
    onInput(n) {
      if (n) {
        this.moduleValue = n.trim();
      } else {
        this.moduleValue = "";
        this.bankNumber = "";
      }
    },
    validateAmount(rule, value, callback) {
      if (value === '' || value == null) {
        if (this.required) {
          callback(new Error(this.requiredMessage));
        } else {
          callback();
        }
      } else {
        callback();
      }
    }
  }
}
</script>
