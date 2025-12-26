<template>
  <el-card class="user-notice-detail">
    <div v-if="detail" class="top-container">
      <div class="row-name">
        <div v-if="detail.type === 1" class="type">平台</div>
        <div v-else class="type-org">企业</div>
        <div class="name">{{ detail.name }}</div>
      </div>
      <div class="row-time">
        <img class="avatar" :src="avatar" alt="" />
        <div class="create-user-name">{{ detail.createUserName }}</div>
        <div class="time">{{ detail.createTime + ' 发布' }}</div>
        <div v-if="detail.isRead" class="status">已读</div>
        <div v-else class="status-blue">未读</div>
      </div>
    </div>
    <div v-if="detail && detail.content" class="editor-rich-text-container" v-html="detail.content"></div>
  </el-card>
</template>
<script>
import { getCcdNoticeDetail, postCcdNoticeUpdateStatus } from "@/api/business/notice";

const HEAD_DEFAULT = 'https://image.smxzhcs.cn/smxsc/M00/2C/6C/CqDIk2UEMraATOt4AAASGyOdUM8477.png';
const HEAD_BOY = 'https://image.smxzhcs.cn/smxsc/M00/2C/6B/CqDIlGUEMraAbY0YAAAV5cHpXIQ216.png';
const HEAD_GIRL = 'https://image.smxzhcs.cn/smxsc/M00/2C/6C/CqDIk2UEMraAVrEyAAAb-r6FVsk592.png';

const HEAD_IMG_MAP = {
  '1': HEAD_BOY,
  '2': HEAD_GIRL,
  '3': HEAD_DEFAULT,
};
export default {
  name: "userNoticeDetail",
  data() {
    return {
      detail: undefined,
    }
  },
  computed: {
    avatar() {
      if (!this.detail) {
        return ""
      }
      if (this.detail.type === 1) {
        return "https://image.smxzhcs.cn/media/M00/00/8C/CqDIlGcoeKSAdPExAAAIowO_qh0555.png"
      }
      const headIcon = this.detail.createUserIcon;
      const gender = `${this.detail.createUserGender || 3}`;
      if (headIcon === '/api/file/Image/userAvatar/001.png') {
        return HEAD_IMG_MAP[gender];
      }
      if (headIcon && typeof headIcon === 'string') {
        if (/http[s]?:\/\/.+/.test(headIcon)) {
          return headIcon;
        } else {
          console.log('avatar', `${location.origin}${process.env.VUE_APP_BASE_API}${headIcon}`);
          return `${location.origin}${process.env.VUE_APP_BASE_API}${headIcon}`;
        }
      }
      return HEAD_IMG_MAP[gender];
    }
  },
  activated() {
    console.log('activated');
    if (this.$deactivedLast) {
      this.loadDetail()
    }
  },
  deactivated() {
    console.log('deactivated');
    this.$deactivedLast = true;
  },
  mounted() {
    console.log('mounted');
    this.loadDetail();
  },
  methods: {
    loadDetail() {
      getCcdNoticeDetail({ id: this.$route.query.id }).then(res => {
        this.detail = res.data;
        if (!this.detail.isRead) {
          postCcdNoticeUpdateStatus({ id: this.$route.query.id })
        }
      })
    },
  }
}
</script>
<style scoped lang="scss">
.user-notice-detail {
  min-height: 100%;
  .top-container {
    border-bottom: solid 1px #E6E6E6;
    padding-bottom: 16px;
    margin-bottom: 16px;
    .row-name {
      display: flex;
      flex-direction: row;
      align-items: center;
      .type {
        font-weight: 400;
        font-size: 11px;
        color: #FFFFFF;
        line-height: 16px;
        background: #00B4C4;
        border-radius: 4px;
        padding: 0 4px;
      }
      .type-org {
        font-weight: 400;
        font-size: 11px;
        color: #FFFFFF;
        line-height: 16px;
        background: #FA914B;;
        border-radius: 4px;
        padding: 0 4px;
      }
      .name {
        font-weight: 500;
        font-size: 16px;
        color: #292C33;
        line-height: 16px;
        margin-left: 8px;
      }
    }
    .row-time {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-top: 14px;
      .avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: solid 1px #F5F7FA;
      }
      .create-user-name {
        font-weight: 500;
        font-size: 12px;
        color: #292C33;
        line-height: 17px;
        margin-left: 4px;
      }
      .time {
        flex: 1 ;
        font-weight: 400;
        font-size: 12px;
        color: #919499;
        line-height: 17px;
        margin-left: 4px;
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
  // 富文本样式
  .editor-rich-text-container {
    h1,
    h2,
    h3,
    h4,
    h5 {
      font-weight: 500;
      color: #292c33;
    }

    h1 {
      font-size: 24px;
      line-height: 33px;
    }

    h2 {
      font-size: 20px;
      line-height: 28px;
    }

    h3 {
      font-size: 17px;
      line-height: 24px;
    }

    h4 {
      font-size: 16px;
      line-height: 22px;
    }

    h5 {
      font-size: 15px;
      line-height: 21px;
    }

    p {
      font-size: 15px;
      font-weight: 400;
      color: #5c5f66;
      line-height: 26px;
    }

    strong {
    }

    code {
    }

    ul {
      list-style: disc;
      padding-left: 18px;
    }

    ol {
      list-style: auto;
      padding-left: 18px;
    }

    li {
      list-style: unset;
      font-size: 13px;
      font-weight: 400;
      color: #919499;
      line-height: 22px;
    }

    img,
    video {
      max-width: 100% !important;
    }
    table {
      border: 1px solid #ccc; /* 添加黑色边框 */
      border-collapse: collapse; /* 边框合并 */
    }

    /* 为表格单元格添加边框样式 */
    td, th {
      border: 1px solid #ccc; /* 添加黑色边框 */
      padding: 8px; /* 添加内边距 */
    }
  }
}
</style>
