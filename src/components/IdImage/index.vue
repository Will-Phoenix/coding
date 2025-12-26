<template>
  <el-image fit="contain" :src="imageUrl" :preview-src-list="[imageUrl]" class="id-image" alt="" />
</template>
<script setup>
import { defineProps, toRefs, ref } from '@vue/composition-api'
import store from '@/store'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
const { id } = toRefs(props)
const imageUrl = ref('')

const getImage = async() => {
  const res = await store.dispatch('cache/getImageUrl', id.value)
  imageUrl.value = res
}
getImage()

</script>
<style lang="scss" scoped>
.id-image {
  width: 100%;
  height: 100%;
}
</style>
