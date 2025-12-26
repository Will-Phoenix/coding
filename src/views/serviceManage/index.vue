<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="top-container">
          <div class="top-item">
            <div class="key">总企业/单位数：</div>
            <div class="value">{{ statisticsData.total }}</div>
          </div>
          <div class="top-item">
            <div class="key">存储预警企业/单位数：</div>
            <div class="value-red">{{ statisticsData.spaceAlarmNun }}</div>
          </div>
          <div class="top-item">
            <div class="key">使用期限剩余不足半年企业/单位数：</div>
            <div class="value-red">{{ statisticsData.durationAlarmNun }}</div>
          </div>
        </div>
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="企业名称" prop="entName">
                  <el-input v-model="query.entName" placeholder="请输入企业名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="存储预警状态" label-width="120px" prop="spaceStatus">
                  <el-select v-model="query.spaceStatus" placeholder="请选择..." style="width: 100%">
                    <el-option :key="1" label="正常" :value="1"></el-option>
                    <el-option :key="2" label="预警中" :value="2"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="使用期限预警状态" label-width="140px" prop="durationStatus">
                  <el-select v-model="query.durationStatus" placeholder="请选择..." style="width: 100%">
                    <el-option :key="1" label="正常" :value="1"></el-option>
                    <el-option :key="2" label="预警中" :value="2"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24" style="text-align: center">
                <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>
        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
          style="margin: 0 20px"
        >
          <el-table-column
            prop="entName"
            label="企业名称"
            align="left"
          />
          <el-table-column
            prop="totalAccount"
            label="账号数"
            align="left"
            width="120"
          />
          <el-table-column
            prop="expireTime"
            label="服务到期日期"
            align="left"
            width="140"
          />
          <el-table-column
            prop="totalSpace"
            label="存储空间"
            align="left"
            width="120"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.totalSpace }}G</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="spaceScale"
            label="占用量"
            align="left"
            width="120"
          >
            <template slot-scope="scope">
              <span v-if="parseFloat(scope.row.spaceScale.replace('%', ''))<70" class="text-green">{{ scope.row.spaceScale }}</span>
              <span v-else class="text-red">{{ scope.row.spaceScale }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="spaceStatus"
            label="存储预警"
            align="left"
            width="120"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.spaceStatus === 1" class="text-green">正常</span>
              <span v-else class="text-red">预警中</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="durationStatus"
            label="使用期限预警"
            align="left"
            width="120"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.durationStatus === 1" class="text-green">正常</span>
              <span v-else class="text-red">预警中</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="260"
          >
            <template slot-scope="scope">
              <div class="btn-container">
                <el-button
                  class="btn"
                  type="text"
                  @click="onAdd(scope.row, 2)"
                >增加存储空间
                </el-button>
                <el-button
                  class="btn"
                  type="text"
                  @click="onAdd(scope.row, 1)"
                >增加企业使用期限
                </el-button>
              </div>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <add-service :visible.sync="dialog.visible" :type="dialog.type" :ent-id="dialog.entId" @confirm="initData" />
  </div>
</template>

<script>
import AddService from "@/views/serviceManage/components/addService.vue";
import { getEntServicePage, getEntServiceStatistic } from "@/api/business/serviceManagement";

export default {
  name: "ServiceManageIndex",
  components: { AddService },
  data() {
    return {
      statusOptions: [],
      list: [],
      listLoading: false, // 列表loading
      buttonLoading: false, // 上传列表loading
      total: 0,
      query: {
        entName: undefined,
        spaceStatus: undefined,
        durationStatus: undefined,
      },
      listQuery: {
        current: 1,
        size: 20,
      },
      dialog: {
        visible: false,
        loading: false,
        type: 1,
        entId: '',
      },
      statisticsData: {
        total: 0,
        spaceAlarmNun: 0,
        durationAlarmNun: 0
      },
    }
  },
  created() {
    this.initData();
    this.loadStatistics();
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
      this.loadStatistics();
    }
  },
  methods: {
    onChangeTab() {
      this.onSearch();
    },
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      this.listQuery.current = 1;
      // 加载数据
      this.initData();
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.query.applyTime = undefined;
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
        ...this.query,
      };
      getEntServicePage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    loadStatistics() {
      getEntServiceStatistic().then(res => {
        this.statisticsData.total = res.data.total;
        this.statisticsData.spaceAlarmNun = res.data.spaceAlarmNun;
        this.statisticsData.durationAlarmNun = res.data.durationAlarmNun;
      })
    },
    onAdd(row, type) {
      this.dialog.type = type;
      this.dialog.entId = row.entId;
      this.dialog.visible = true;
    },
  }
}
</script>
<style lang="scss" scoped>
.top-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 40px 40px;
  .top-item {
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    align-items: center;
    .key {
      font-weight: 500;
      word-break: keep-all;
    }
    .value {
      word-break: keep-all;
      margin-left: 4px;
    }
    .value-red {
      word-break: keep-all;
      margin-left: 4px;
      color: red;
    }
  }
}
.query-flex {
  display: flex;
  flex-wrap: wrap;
}
.align {
  text-align: center;
}
.btn-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .btn + .btn {
    margin-left: 10px;
  }
}
.text-red {
  color: red;
}
.text-green {
  color: #00B4C4;
}
</style>
