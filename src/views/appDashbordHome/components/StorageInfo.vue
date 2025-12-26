<template>
  <div class="storage-info" v-if="detail">
    <div class="storage-info__icon">
      <img
        src="https://image.smxzhcs.cn/media/M00/00/8E/CqDIlGdY4xyAf1iaAABGamQ7G1M299.png"
        alt="Storage Icon"
      >
    </div>
    <div class="storage-info__wrap">
      <div class="storage-info__content">
        <div class="storage-info__title">存储空间</div>
        <div class="storage-info__usage" :style="`color: ${getColor(detail.spaceStatus)}`">
          <span class="storage-info__usage-value">{{ detail.usedSpaceDisplay }}</span>
          <span class="storage-info__usage-unit">/ {{ detail.totalSpace }}</span>
        </div>
      </div>
      <div class="storage-info__progress">
        <div class="storage-info__progress-bar" :style="`background-color: ${getColor(detail.spaceStatus)};width: ${detail.spaceScale || 0}`"></div>
      </div>
      <div class="storage-info__bottom">
        <div class="storage-info__time" :style="`color: ${getColor(detail.durationStatus)}`">{{ detail.durationStatus === 3 ? '已过期' : `服务${ formatTime(detail.expireTime) }到期` }}</div>
        <div class="storage-info__actions">
          <button class="storage-info__btn storage-info__btn__emp" @click="$emit('showOrderList')">订单中心</button>
          <button class="storage-info__btn" @click="$emit('showBuy')">购买更多</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getEntServiceDetail } from "@/api/business/service"
import dayjs from "dayjs";

export default {
  name: 'StorageInfo',
  data() {
    return {
      detail: null
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    getColor(val) {
      console.log(val, '*****')
      return ['', '#007580', '#FA914B', '#F05248'][val]
    },
    formatTime(time) {
      if (!time) {
        return ''
      }
      // 年 月 日
      return dayjs(time).format('YYYY年MM月DD日')
    },
    loadData() {
      getEntServiceDetail().then(res => {
        this.detail = res.data;
      })
    }
  }
}
</script>

<style lang="scss">
.storage-info {
  display: flex;
  align-items: center;
  background: linear-gradient( 270deg, #E8FFFF 0%, #F3FFFF 100%);
  border-radius: 8px;
  padding: 16px;
  width: 402px;
  box-sizing: border-box;

  &__icon {
    margin-right: 16px;

    img {
      width: 64px;
      height: 51px;
    }
  }
  &__wrap {
    flex: 1;
  }
  &__content,
  &__bottom {
    display: flex;
    justify-content: space-between;
  }
  &__time {
    font-size: 12px;
    color: #00b4c4;
    line-height: 22px;
  }
  &__title {
    font-weight: 500;
    font-size: 12px;
    color: #292c33;
    line-height: 22px;
  }

  &__usage {
    font-size: 12px;
    color: #007580;
    line-height: 22px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__progress {
    margin-top: 5px;
    margin-bottom: 8px;
    height: 5px;
    background: #c9fbff;
    border-radius: 1px;
    &-bar {
      height: 100%;
      background: #00b4c4;
    }
  }
  &__btn {
    color: #fff;
    border: none;
    width: 66px;
    height: 22px;
    background: #00b4c4;
    border: 1px solid #00b4c4;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    text-align: center;
    &__emp {
      background: #fff;
      color: #00b4c4;
    }
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
