<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main" v-loading="loading">
      <div class="header-wrap">
        <el-page-header @back="goBack" :content="title+'的打印日志'"> </el-page-header>
      </div>
      <el-divider style="margin: 0px;"></el-divider>
      <div class="main-panel">
        <div class="JNPF-common-layout-center">
          <el-row class="JNPF-common-search-box" :gutter="16">
            <el-form :model="query">
              <el-col :span="6">
                <el-form-item label="关键词">
                  <el-input v-model="query.printTitle" placeholder="请输入关键词" clearable>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="打印时间">
                  <el-date-picker v-model="query.printTimeRange" type="daterange" align="right"
                    unlink-panels range-separator="至" start-placeholder="开始日期"
                    end-placeholder="结束日期">
                  </el-date-picker>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" @click="initData">查询</el-button>
                  <el-button icon="el-icon-refresh-right" @click="reset()">重置</el-button>
                </el-form-item>
              </el-col>
            </el-form>
          </el-row>
          <div class="JNPF-common-layout-main JNPF-flex-main">
            <JNPF-table v-loading="listLoading" :data="list">
              <el-table-column prop="printTitle" label="名称" align="left" />
              <el-table-column prop="printMan" label="打印人" align="left" />
              <el-table-column prop="printTime" label="打印时间" align="left" />
              <el-table-column prop="printNum" label="打印条数" align="left" />
            </JNPF-table>
            <pagination :total="total" :page.sync="query.current" :limit.sync="query.size"
              @pagination="initData" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import request from "@/utils/request";
export default {
  components: {},
  props: {},
  data() {
    return {
      list: [],
      total: 0,
      loading: false,
      listLoading: true,
      title: "",
      query: {
        printTitle: "",
        printId: "",
        printTimeRange: [],

        current: 0,
        size: 20,
      },
    };
  },
  methods: {
    show(row) {
      this.query.printId = row.id;
      this.title = row.fullName
      this.initData();
      this.loading = false;
    },
    initData() {
      this.listLoading = true;
      request({
        url: `/api/system/printLog/list`,
        method: "post",
        data: this.query,
      }).then((res) => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    reset() {
      this.query.printTitle = "";
      this.query.printTimeRange = [];
      this.initData()
    },
    goBack() {
      this.$emit("goBack");
    },
  },
  computed: {},
  created() { },
  mounted() { },
};
</script>

<style lang="scss" scoped>
.JNPF-preview-main {
  background-color: transparent;
  overflow: hidden;
}

.JNPF-preview-main::-webkit-scrollbar {
  display: none;
}

.main-panel {
  min-height: 570px;
  height: calc(100% - 10px);
  background-color: #fff;
  overflow: scroll;
}

.main-panel::-webkit-scrollbar {
  display: none;
}

.header-wrap {
  width: 100%;
  padding: 20px 20px;
  font-size: 20px;
  background-color: #fff;
}
>>>.el-divider--horizontal{
 margin: 0px;
}
</style>
