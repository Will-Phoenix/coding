<template>
  <el-card>
    <div class="notice-list">
      <div class="notice-item" v-for="item in list" :key="item.id" @click="goDetail(item)">
        <div v-if="item.type === 1" class="type">平台</div>
        <div v-else class="type-org">企业</div>
        <div class="name">{{ item.name }}</div>
        <div class="status" :class="{'status-blue' : !item.isRead}">{{ item.isRead ?'已读' : '未读' }}</div>
      </div>
    </div>
    <pagination :total="total" layout="prev, pager, next" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="loadList" />
  </el-card>
</template>
<script>
import { getUserCcdNoticePage } from "@/api/business/notice";

export default {
  name: "userNoticeIndex",
  data() {
    return {
      list: [],
      listQuery: {
        current: 1,
        size: 20,
      },
      total: 0,
    }
  },
  activated() {
    console.log('activated');
    if (this.$deactivedLast) {
      this.loadList()
    }
  },
  deactivated() {
    console.log('deactivated');
    this.$deactivedLast = true;
  },
  mounted() {
    this.loadList();
  },
  methods: {
    loadList() {
      getUserCcdNoticePage({ ...this.listQuery }).then(res => {
        this.list = res.data.records || [];
        this.total = res.data.total;
      })
    },
    goDetail(item) {
      this.$router.push({
        path: "/userNoticeDetail",
        query: {
          id: item.id,
        }
      });
    }
  }
}
</script>
<style scoped lang="scss">
.notice-list {
  border-top: solid 1px #F2F2F2;
  border-left: solid 1px #F2F2F2;
  border-right: solid 1px #F2F2F2;
  .notice-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16px 20px;
    border-bottom: solid 1px #F2F2F2;
    cursor: pointer;
    .type {
      font-weight: 400;
      font-size: 11px;
      color: #FFFFFF;
      line-height: 13px;
      background: #00B4C4;
      border-radius: 4px;
      padding: 1px 4px;
    }
    .type-org {
      font-weight: 400;
      font-size: 11px;
      color: #FFFFFF;
      line-height: 13px;
      background: #FA914B;;
      border-radius: 4px;
      padding: 1px 4px;
    }
    .name {
      flex: 1;
      font-weight: 400;
      font-size: 12px;
      color: #5C5F66;
      line-height: 16px;
      margin-left: 8px;
    }
    .status {
      font-weight: 400;
      font-size: 12px;
      color: #919499;
      line-height: 17px;
    }
    .status-blue {
      font-weight: 400;
      font-size: 12px;
      color: #00B4C4;
      line-height: 17px;
    }
  }
}
</style>
