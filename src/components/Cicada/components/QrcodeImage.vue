<template>
  <img :src="src">
</template>
<script>
import QRCode from 'qrcode'
export default {
  name: 'QrcodeImage',
  props: {
    value: {
      type: [String, Number, Boolean],
    }
  },
  data() {
    return {
      src: undefined
    }
  },
  watch: {
    value(n) {
      this.gen(n)
    }
  },
  mounted() {
    this.gen(this.value);
  },
  methods: {
    gen(val) {
      if (val) {
        QRCode.toDataURL(val, {
          // option 详见 https://github.com/soldair/node-qrcode#options-9
          margin: 0,
          width: 400,
          // 容错级别 , 详见 https://www.npmjs.com/package/qrcode#error-correction-level
          errorCorrectionLevel: 'H',
          type: 'image/png'
        }).then(r => {
          this.src = r;
        }).catch(e => {
          console.warn(e)
          this.src = undefined
        })
      } else {
        this.src = undefined;
      }
    }
  }
}
</script>
