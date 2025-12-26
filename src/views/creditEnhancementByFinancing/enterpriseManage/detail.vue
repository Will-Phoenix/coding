<template>
  <div>
    <div class="content">
      <el-card class="card">
        <div class="flex1">
          <div class="flex-column">
            <div class="title">{{ entDetail.entName }}</div>
            <div class="tag">{{ entDetail.industry }}</div>
          </div>
          <div class="flex-column mg-l mg-r">
            <div class="desc">企业评级</div>
            <div class="value">{{ entDetail.entRating }}</div>
          </div>
          <div class="flex-column">
            <div class="desc">企业得分</div>
            <div class="value">{{ entDetail.entScore }}分</div>
          </div>
        </div>
        <div class="flex2">
          <el-col :span="12" class="col-flex">
            <div class="flex2-title">企业规模</div>
            <div class="flex2-desc">{{ entDetail.entScale }}</div>
          </el-col>
          <el-col :span="12" class="col-flex">
            <div class="flex2-title">稳定性描述</div>
            <div class="flex2-desc">{{ entDetail.stabilityDesc }}</div>
          </el-col>
          <el-col :span="12" class="col-flex">
            <div class="flex2-title">企业主特质描述</div>
            <div class="flex2-desc">{{ entDetail.entTraitDesc }}</div>
          </el-col>
          <el-col :span="12" class="col-flex">
            <div class="flex2-title">盈利能力描述</div>
            <div class="flex2-desc">{{ entDetail.profitabilityDesc }}</div>
          </el-col>
          <el-col :span="12" class="col-flex">
            <div class="flex2-title">偿还能力描述</div>
            <div class="flex2-desc">{{ entDetail.solvencyDesc }}</div>
          </el-col>
          <el-col :span="12" class="col-flex">
            <div class="flex2-title">经营能力描述</div>
            <div class="flex2-desc">{{ entDetail.capabilityDesc }}</div>
          </el-col>
          <el-col :span="12" class="col-flex">
            <div class="flex2-title">评分描述</div>
            <div class="flex2-desc">{{ entDetail.scoreDesc }}</div>
          </el-col>
        </div>
      </el-card>
      <el-card class="card">
        <div slot="header">
          <div class="title2">企业综合判定</div>
        </div>
        <div class="flex2">
          <JNPF-table
            :data="entDetail.scoreList"
            border
          >
            <el-table-column
              label="维度"
              prop="dimension"
              algin="left"
              min-width="150px"
            />
            <el-table-column
              label="分数"
              prop="score"
              algin="left"
              width="100px"
            />
            <el-table-column
              label="说明"
              prop="explain"
              algin="center"
              min-width="200px"
            >
              <template slot-scope="scope">
                <div v-for="(item, index) in scope.row.explain" :key="index">{{ item }}</div>
              </template>
            </el-table-column>
          </jnpf-table>
          <div id="main" style="width: 50%;height: 500px"></div>
        </div>
      </el-card>
      <el-card class="card">
        <div slot="header">
          <div class="title2">企业报告</div>
        </div>
        <embed class="online" :src="previewOnlineUrl">
      </el-card>
    </div>
  </div>
</template>

<script>
import { previewFileOnline } from "../../../api/business/signature";
import * as echarts from 'echarts';

export default {
  data() {
    return {
      previewOnlineUrl: "",
      entDetail: ""
    }
  },
  computed: {
    option() {
      return {
        color: ["#5B8FF9", "#5AD8A6"],
        legend: {
          data: ['本企业', '企业平均分']
        },
        radar: {
          // shape: 'circle',
          indicator: [
            { name: '企业主特质', max: 10 },
            { name: '企业规模', max: 10 },
            { name: '盈利能力', max: 10 },
            { name: '偿贷能力', max: 10 },
            { name: '经营能力', max: 10 },
            { name: '稳定性', max: 10 }
          ]
        },
        series: [
          {
            name: '本企业 vs 企业平均分',
            type: 'radar',
            data: [
              {
                value: [this.entDetail.scoreList[0].score, this.entDetail.scoreList[1].score, this.entDetail.scoreList[2].score, this.entDetail.scoreList[3].score, this.entDetail.scoreList[4].score, this.entDetail.scoreList[5].score],
                name: '本企业'
              },
              {
                value: [7.7, 7.4, 6.8, 7.0, 7.7, 7.5],
                name: '企业平均分'
              }
            ]
          }
        ]
      }
    }
  },
  async created() {
    this.entDetail = JSON.parse(this.$route.query.detailData);
    this.previewOnlineUrl = (await previewFileOnline(this.entDetail.pdfUrl)).data;
  },
  mounted() {
    const myChart = echarts.init(document.getElementById('main'));
    myChart.setOption(this.option);
  },
  methods: {

  }
}
</script>
<style lang="scss" scoped>
.content {
  flex: 1;
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  .card {
    /*padding: 20px 35px 16px 24px;*/
    margin-bottom: 11px;
    .online {
      width: 60%;
      height: calc(100vh - 200px);
    }
    .mg-l {
      margin-left: auto;
    }
    .mg-r {
      margin-right: 80px;
    }
    .title2 {
      font-weight: bold;
      font-size: 16px;
      color: #292C33;
      line-height: 22px;
    }
    .flex1 {
      display: flex;
      align-items: center;
      padding-bottom: 23px;
      border-bottom: 1px #ebeef5 solid;
    }
    .flex2 {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .col-flex {
        margin-top: 16px;
        display: flex;
      }
      .flex2-title {
        width: 15%;
        font-size: 14px;
        color: #919499;
        line-height: 20px;
      }
      .flex2-desc {
        width: 85%;
        font-size: 14px;
        color: #5C5F66;
        line-height: 20px;
      }
    }
    .flex-column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      .desc {
        color: #919499;
        line-height: 17px;
      }
      .value {
        font-weight: bond;
        font-size: 24px;
        color: #00B4C4;
        line-height: 33px;
      }
    }
    .title {
      font-weight: 500;
      font-size: 20px;
      color: #292C33;
      line-height: 28px;
    }
    .tag {
      background: #E5F7F9;
      border-radius: 4px;
      font-size: 12px;
      color: #00B4C4;
      line-height: 17px;
      padding: 1px 4px;
      margin-top: 5px;
    }
  }
}
::v-deep .el-card__body {
  height: 100%;
}
::v-deep .el-table--border th.el-table__cell {
  background: #F4F8F9;
}
</style>
