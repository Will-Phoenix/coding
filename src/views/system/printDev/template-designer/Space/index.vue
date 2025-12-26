<template>
  <div class="space" :style="containerStyle">
    <slot></slot>
  </div>
</template>

<script>
const sizePreset = {
  small: 8,
  middle: 16,
  large: 24
};

export default {
  name: 'Space',
  props: {
    direction: {
      type: String,
      default: 'horizontal',
      validator: (v) => ['horizontal', 'vertical'].includes(v)
    },
    align: {
      type: String,
      default: 'center',
      validator: (v) => ['start', 'end', 'center', 'baseline'].includes(v)
    },
    size: {
      type: [Number, String, Array],
      default: 'small'
    },
    wrap: Boolean
  },
  computed: {
    containerStyle() {
      return {
        display: 'flex',
        flexDirection: this.direction === 'horizontal' ? 'row' : 'column',
        alignItems: this.align,
        flexWrap: this.wrap ? 'wrap' : 'nowrap',
        columnGap: this.processedSize.columnGap,
        rowGap: this.processedSize.rowGap
      };
    },
    processedSize() {
      const processValue = (value) => {
        if (typeof value === 'string') {
          if (sizePreset[value]) return `${sizePreset[value]}px`;
          if (/^\d+$/.test(value)) return `${value}px`;
          return value;
        }
        return `${value}px`;
      };

      if (Array.isArray(this.size)) {
        return {
          columnGap: processValue(this.size[0] || 0),
          rowGap: processValue(this.size[1] || 0)
        };
      }

      const gap = processValue(this.size);
      return { columnGap: gap, rowGap: gap };
    }
  }
};
</script>

<style scoped>
.space {
  line-height: normal;
}
</style>
