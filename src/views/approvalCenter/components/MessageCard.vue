<template>
  <div :class="['custom-message-card', type]" v-if="data && data.length > 0">
    <div class="custom-message-card-title">
      <span class="num">{{ data.length }}项</span> <span>{{ title }}</span>
    </div>
    <div class="custom-message-card-content">
      <div class="custom-message-card-list">
        <div class="custom-message-card-item ellipsis" v-for="(item, index) in data" :key="index">
          {{ item.failCause }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from '@vue/composition-api'
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  type: {
    type: String,
    default: 'warning'
  },
  title: {
    type: String,
    default: '异常提醒'
  }
})
</script>

<style lang="scss" scoped>
.custom-message-card {
  margin-bottom: 12px;
  padding: 16px 20px;
  background-color: #fff;
  &.warning{
    .num{
      color: rgba(250, 145, 75, 1);
    }
    .custom-message-card-item{
      color:rgba(250, 145, 75, 1);
      background-color: rgba(250, 145, 75, 0.05);
    }
  }
  &.error{
    .num{
      color: rgba(240, 82, 72, 1);
    }
    .custom-message-card-item{
      color:rgba(240, 82, 72, 1);
      background-color: rgba(240, 82, 72, 0.05);
    }
  }
  .custom-message-card-title {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
  }
  .custom-message-card-content{
    padding-top: 16px;
    .custom-message-card-list{
      display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
      .custom-message-card-item{
        width: 49.2%;
        height: 36px;
        line-height: 36px;
        padding: 0 8px;
        border-radius: 4px;
        margin-bottom: 8px;
        font-size: 14px;
      }
    }
  }
}
</style>
