<template>
  <el-dialog
    :title="'发起' + categoryName"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="622px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="dialog-content" v-loading="listLoading">
      <div class="item-oa-list" v-for="(item, index) in list" :class="['bg-' + (index % 5), selectedData.id === item.id ? 'item-selected' : ''].join(' ')" :key="item.id" @click="onSelect(item)">
        <div class="name" :class="{'name-selected' : selectedData.id === item.id}">{{ item.name }}</div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button class="btn-cancel" @click="updateVisible(false)">取消</el-button>
      <el-button class="btn-confirm" @click="onConfirm">新建{{ orderTypeName }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { APIGetOrderCategoryModuleList } from "@/api/workFlow/FlowBefore";

export default {
  name: 'addOAType',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    categoryId: {
      type: String,
      default: ''
    },
    categoryName: {
      type: String,
      default: ''
    },
    orderTypeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      listLoading: false,
      list: [],
      selectedData: {}
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.selectedData = this.list.length > 0 ? this.list[0] : {}
      }
    }
  },
  mounted() {
    if (this.categoryId) {
      this.initData();
    }
  },
  methods: {
    initData() {
      this.listLoading = true;
      APIGetOrderCategoryModuleList({ categoryId: this.categoryId }).then(res => {
        this.list = res.data || []
      }).finally(() => {
        this.listLoading = false;
      });
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    onConfirm() {
      this.updateVisible(false);
      this.$emit('confirm', this.selectedData);
    },
    onSelect(item) {
      this.selectedData = item;
    }
  }
}
</script>
<style lang="scss" scoped>
>>> .el-dialog__body {
  padding: 20px 20px 0 20px !important;
}
>>> .el-dialog__footer {
  padding: 24px 0 !important;
}
.dialog-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}
.item-oa-list {
  width: 283px;
  min-height: 77px;
  border-radius: 8px;
  border: 1px solid #EDEFF2;
  margin-bottom: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-image: url("https://image.smxzhcs.cn/smxsc/M00/2F/3F/CqDIk2bNg02AWJbvAABuE8ekbqI442.png");
  background-repeat: no-repeat no-repeat;
  background-size: contain;
  background-position: 100% 0;
  cursor: pointer;
  .name {
    font-weight: 500;
    font-size: 16px;
    color: #292C33;
    line-height: 22px;
    max-width: 160px;
    margin-left: 12px;
  }
  .name-selected {
    color: #00B4C4
  }
}
.item-selected {
  border: 2px solid #00B4C4;
}
.bg-1 {
  background-image: url("https://image.smxzhcs.cn/smxsc/M00/2F/3D/CqDIlGbNg1OAJme7AABWjuOWeG4746.png");
}
.bg-2 {
  background-image: url("https://image.smxzhcs.cn/smxsc/M00/2F/3D/CqDIlGbNg1eAXriHAABhUS69P1Q012.png");
}
.bg-3 {
  background-image: url("https://image.smxzhcs.cn/smxsc/M00/2F/3F/CqDIk2bNg1uASY2pAABaHbesWag119.png");
}
.bg-4 {
  background-image: url("https://image.smxzhcs.cn/smxsc/M00/2F/3F/CqDIk2bNg1-AQMf-AABkVW4eOK8407.png");
}
.dialog-footer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  .btn-confirm {
    width: 120px;
    height: 42px;
    background: #00B4C4;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    color: #FFFFFF;
    line-height: 20px;
    margin-left: 20px;
  }
  .btn-cancel {
    width: 120px;
    height: 42px;
    border-radius: 8px;
    border: 1px solid #00B4C4;
    font-weight: 500;
    font-size: 14px;
    color: #00B4C4;
    line-height: 20px;
  }
}
</style>
