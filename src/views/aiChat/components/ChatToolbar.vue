<template>
  <div>
    <div class="chart-toolbar-container">
      <van-button :type="isNetSearch === 1 ? 'danger' : 'default'" :icon="isNetSearch === 1 ? 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/08ee8f38-8869-4456-8344-882d5db05149.png' : 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/c728a9fa-15ad-4549-93d0-74c8f50f8137.png'" :class="{'text-selected' : isNetSearch === 1}" @click="handleNetSearch">联网搜索</van-button>
      <van-button :type="currentKnowledgeIds.length > 0 ? 'danger' : 'default'" :icon="currentKnowledgeIds.length > 0 ? 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/f9e550f6-b0d4-4a8f-816f-cad727d3d6b9.png' : 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/0a044890-25f7-4516-afa7-390dc24c6cb1.png'" :class="{'text-selected' : currentKnowledgeIds.length > 0, 'disabled': knowledgeList.length === 0 }" @click="onSelectKnowledge">选择知识库</van-button>
    </div>
    <van-action-sheet v-model="visible" title="请选择知识库" cancel-text="确定" @cancel="onConfirm">
      <div class="knowledge-list-container">
        <van-checkbox-group v-model="knowledgeIds" checked-color="#F05248" icon-size="20px">
          <van-checkbox v-for="item in knowledgeList" :key="item.id" class="knowledge-list-item" :name="item.id">
            <template #default>
              <span class="text">{{ item.name }}</span>
            </template>
          </van-checkbox>
        </van-checkbox-group>
      </div>
    </van-action-sheet>
  </div>
</template>

<script>
export default {
  name: 'ChatToolbar',
  data() {
    return {
      isNetSearch: 0,
      currentKnowledgeIds: [],
      knowledgeIds: [],
      knowledgeList: [],
      visible: false
    };
  },
  computed: {

  },
  mounted() {
  },
  methods: {
    handleNetSearch() {
      this.isNetSearch = this.isNetSearch === 0 ? 1 : 0;
      this.$emit('change', {
        isNetSearch: this.isNetSearch,
        knowledgeBaseIds: this.currentKnowledgeIds
      });
    },
    initKnowledgeList(val) {
      this.knowledgeList = val || [];
    },
    onSelectKnowledge() {
      if (this.knowledgeList.length === 0) {
        quick.ui.toast("您的专属知识库尚未创建，请登录电脑端完成创建。")
        return;
      }
      this.knowledgeIds = [];
      this.knowledgeIds.push(...this.currentKnowledgeIds);
      this.visible = true;
    },
    onConfirm() {
      this.currentKnowledgeIds = [];
      this.currentKnowledgeIds.push(...this.knowledgeIds);
      this.visible = false;
      this.$emit('change', {
        isNetSearch: this.isNetSearch,
        knowledgeBaseIds: this.currentKnowledgeIds
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.chart-toolbar-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 20px 32px 0 32px;
    button {
        height: 48px;
        font-weight: 400;
        font-size: 24px;
        color: #5C5F66;
        line-height: 32px;
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
    }
    button + button {
        margin-left: 16px;
    }
    .text-selected {
        color: #F9F9F9;
    }
    .disabled {
        opacity: 0.5;
    }
}
.knowledge-list-container {
    overflow-y: auto;
    max-height: 600px;
    .knowledge-list-item {
        margin: 20px 16px;
        display: flex;
        flex-direction: row;
        align-items: center;
        .text {
            font-weight: 400;
            font-size: 32px;
            color: #333333;
            line-height: 60px;
            text-align: left;
        }
    }
}
</style>
