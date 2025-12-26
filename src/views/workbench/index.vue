<template>
  <div class="content">
    <div class="block">
      <h3>电子凭证财会服务管理平台</h3>
      <div class="layout">
        <el-col :span="8" class="border-line">
          <span>累计归集票据总数</span>
          <div class="value">123213</div>
        </el-col>
        <el-col :span="8" class="border-line">
          <span>累计归集票据总数</span>
          <div class="value">123213</div>
        </el-col>
        <el-col :span="8">
          <span>累计归集票据总数</span>
          <div class="value">123213</div>
        </el-col>
      </div>
    </div>
    <div class="block">
      <h3>近一个月发票归集数量</h3>
      <div id="main" style="width: 100%;height: 500px" />
    </div>
    <div>
      <h3>应用中心</h3>
      <div class="flex-row">
        <div style="margin-left: 40px" @click="goToPage">
          <img src="" class="img" style="width: 100px;height: 100px">
          <div style="margin-top: 20px">电子凭证管理</div>
        </div>
        <div style="margin-left: 40px">
          <img src="" class="img" style="width: 100px;height: 100px">
          <div style="margin-top: 20px">报销单管理</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  data() {
    return {

    }
  },
  computed: {
    option() {
      return {
        tooltip: {
          trigger: 'axis',
          // axisPointer: { type: 'cross' }
        },
        dataset: {
          source: [
            ["AA", 120],
            ["BB", 200],
            ["CC", 150]
          ],
        },
        xAxis: {
          type: 'category',
          // data: ['A', 'B', 'C']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            // data: [120, 200, 150],
            type: 'line',
          }
        ]
      };
    },
  },
  created() {
  },
  mounted() {
    const myChart = echarts.init(document.getElementById('main'));
    myChart.setOption(this.option);
  },
  methods: {
    goToPage() {

    },
  }
}
</script>
<style lang="scss" scoped>
.content {
  height: 100%;
  width: 100%;
  padding: 10px;
  background-color: #fff;
  overflow: auto;
  .layout {
    display: flex;
    text-align: center;

    .value {
      margin-top: 20px;
      font-size: x-large;
      font-weight: bold;
  }

    .border-line {
      border-right: solid 2px #e8e8e8;
  }
  }

  h3 {
    margin-bottom: 40px;
  }

  .block {
    padding-bottom: 40px;
    margin-bottom: 40px;
    border-bottom: solid 2px #e8e8e8;

  }

  .img {
    width: 100px;
    height: 100px;
    border-radius: 10px;
    border: solid 2px #e8e8e8;
  }

  .flex-row {
    display: flex;
    flex-wrap: wrap;
  }

}
</style>
