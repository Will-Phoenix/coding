<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <el-input v-model="value" :placeholder="placeholder" style="width: 100%;" @input="onInput"></el-input>

  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'PassInput',
  components: { },
  mixins: [ComMixin],
  data() {
    return {
      links: [],
      value: "",
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
    moduleValue(val) {
      console.log('moduleValue====', this.encryptBankCard(val))
      this.value = this.encryptBankCard(val);
      if (this.value.includes("*")) {
        this.readonly = true;
      }
    }
  },

  mounted() {
    const monuteValue = this.detailJson["exsPayList"][this.groupIterateIndex]["payeeBankNumber"];
    console.log('bank number monuteValue====', monuteValue)
    if (monuteValue) {
      this.moduleValue = monuteValue;
      this.value = this.encryptBankCard(monuteValue);
    }
  },
  methods: {
    onInput(n) {
      if (this.value.includes("*")) {
        this.value = "";
        this.moduleValue = "";
      } else {
        this.moduleValue = n;
      }
    },
    encryptBankCard(cardNumber) {
      if (!cardNumber || cardNumber.length < 8) {
        return cardNumber;
      }
      return cardNumber.replace(/(\d{4})\d+(\d{4})/, (match, firstFour, lastFour) => {
        const stars = '*'.repeat(match.length - 8);
        return firstFour + stars + lastFour;
      });
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
