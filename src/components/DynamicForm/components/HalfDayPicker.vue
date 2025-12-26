<template>
  <el-form-item
    :prop="fieldName"
    :label="label"
    :rules="rules"
  >
    <div class="half-day">
      <el-date-picker
        v-model="dateValue"
        class="date"
        type="date"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        :placeholder="placeholder"
        @change="dateChange"
      />
      <el-select v-model="halfValue" class="half" placeholder="请选择" @change="halfChange">
        <el-option
          v-for="item in selectOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </div>

  </el-form-item>
</template>
<script>
import ComMixin from './comMixin'

export default {
  name: 'HalfDayPicker',
  mixins: [ComMixin],
  data() {
    return {
      dateValue: undefined, // 日期
      halfValue: "上午", // 上午下午
      selectOptions: [
        { label: "上午", value: "上午" },
        { label: "下午", value: "下午" }
      ]
    }
  },
  computed: {

  },
  watch: {

  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.moduleValue) {
        const v = this.moduleValue.split(" ");
        this.dateValue = v[0];
        this.halfValue = v[1];
      }
    },
    updateData() {
      if (this.dateValue) {
        this.moduleValue = `${this.dateValue} ${this.halfValue}`;
        console.log("更新成功：", this.moduleValue);
      }
    },
    dateChange() {
      this.updateData();
    },
    halfChange() {
      this.updateData();
    }
  }
}
</script>

<style scoped>
.half-day {
  display: flex;
  justify-content: space-between;
}
.date {
  width: 70%;
}
.half {
  flex: 1;
  margin-left: 10px;
}
</style>
