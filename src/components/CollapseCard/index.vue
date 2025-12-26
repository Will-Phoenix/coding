<template>
  <el-card class="collapse-card" :class="{ 'is-collapsed': isCollapsed }">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <slot name="title">
            <span class="title"><img v-if="icon" class="title-icon" :src="icon" alt=""> {{ title }}</span>
          </slot>
        </div>
        <div class="header-right">
          <slot name="extra"></slot>
          <el-button
            v-if="collapsible"
            type="text"
            class="collapse-btn"
            @click="toggleCollapse"
          >
            {{ isCollapsed ? '展开' : '收起' }}
            <i class="collapse-icon" :class="isCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-down'"></i>
          </el-button>
        </div>
      </div>
    </template>

    <div class="card-content" v-show="!isCollapsed">
      <slot></slot>
    </div>
  </el-card>
</template>

<script>
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
  name: 'CollapseCard',
  components: {

  },
  props: {
    title: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    collapsible: {
      type: Boolean,
      default: true
    },
    defaultCollapsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['collapse-change'],
  setup(props, { emit }) {
    const isCollapsed = ref(props.defaultCollapsed)

    const toggleCollapse = () => {
      isCollapsed.value = !isCollapsed.value
      emit('collapse-change', isCollapsed.value)
    }

    return {
      isCollapsed,
      toggleCollapse
    }
  }
})
</script>
<style>
.collapse-card .el-card__header {
  padding: 12px 16px;
  border-bottom: 0px;
}

.collapse-card .el-card__body {
  padding: 0px;
}

</style>
<style lang="scss" scoped>
.collapse-card {
  margin-bottom: 13px;
  border-radius: 8px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      flex: 1;

      .title {
        display: flex;
        align-items: center;
        font-size: 15px;
        font-weight: 500;

        .title-icon {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
    }
    .collapse-btn{
      color: #00B4C4;
      font-size: 14px;
      margin-left: 8px;
    }
    .collapse-icon{
      color: #919499;
    }
  }

  .card-content {
    padding: 0 16px 16px 16px;
  }

  :deep(.el-icon) {
    transition: transform 0.3s;
    margin-left: 4px;

    &.is-collapsed {
      transform: rotate(180deg);
    }
  }
}
</style>
