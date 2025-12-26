<template>
  <div>
    <van-collapse v-model="activeMessages" :border="false">
      <div v-for="(item, index) in messageList" :key="item.messageId" class="bubble-list-container">
        <div v-if="item.role === 'ai'" class="ai-message markdown-body" @click="onClick">
          <van-collapse-item v-if="item.thinking" :name="item.messageId" :border="false">
            <template #title>
              <div class="thinking-top">已深度思考</div>
            </template>
            <div class="thinking">{{ item.thinking }}</div>
          </van-collapse-item>
          <div v-html="item.content" />
        </div>
        <div v-else class="user">
          <div class="user-message">{{ item.content }}</div>
          <svg v-if="loading && index === messageList.length - 1"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" style="display: block;" class="loading">
            <!-- 优化点：用 <circle> 替代复杂路径，简化代码 -->
            <g fill="#666">
              <!-- 左侧圆点 -->
              <circle cx="11" cy="40" r="9" opacity="0.86"/>
              <!-- 中间圆点 -->
              <circle cx="40" cy="40" r="9" opacity="0.99"/>
              <!-- 右侧圆点 -->
              <circle cx="69" cy="40" r="9"/>
            </g>
          </svg>
        </div>
      </div>
      <div v-if="currUpdateMessage && (currUpdateMessage.thinking || currUpdateMessage.content)" class="ai-message markdown-body" @click="onClick">
        <van-collapse-item v-if="currUpdateMessage.thinking" ref="currCollapseItemRef" :name="currUpdateMessage.messageId" :border="false">
          <template #title>
            <div class="thinking-top">已深度思考</div>
          </template>
          <div class="thinking">{{ currUpdateMessage.thinking }}</div>
        </van-collapse-item>
        <div v-html="currUpdateMessage.content" />
      </div>
    </van-collapse>
  </div>
</template>

<script>
export default {
  name: 'BubbleList',
  data() {
    return {
      messageList: [],
      currUpdateMessage: {
        content: "",
        thinking: ""
      },
      activeMessages: [],
      loading: false
    };
  },
  methods: {
    addMessage(val) {
      this.loading = true;
      this.messageList.push(val)
    },
    getResponse() {
      this.loading = false;
    },
    updateAIMessage(val, finished = false) {
      if (finished) {
        /* console.log("aiMessage", this.currUpdateMessage.content)*/
        this.loading = false;
        this.messageList.push(this.currUpdateMessage);
        this.currUpdateMessage = {
          content: "",
          thinking: ""
        };
      } else {
        if (val && (val.thinking || val.content)) {
          this.loading = false;
        }
        this.currUpdateMessage = val;
        if (this.currUpdateMessage.thinking && this.activeMessages.indexOf(val.messageId) < 0) {
          // console.log("是否展开",this.activeMessages.indexOf(val.messageId))
          this.activeMessages.push(val.messageId);
          this.$nextTick(() => {
            this.$refs.currCollapseItemRef && this.$refs.currCollapseItemRef.toggle(true);
          });
        }
      }
    },
    onClick(e) {
      console.log("点击位置：", e.target);
      // 只特殊处理a标签的点击事件
      if (e.target.tagName === 'A') {
        e.stopPropagation();
        // 需要点击后发送消息的
        if (e.target.dataset.type && e.target.dataset.type === 'QA') {
          const message = e.target.dataset.msg;
          console.log("点击a标签后，要发送的消息：", message);
          this.$emit("send", message);
        }
        // 需要点击后跳转小程序页面的
        if (e.target.dataset.type && e.target.dataset.type === 'URL') {
          const wxPage = e.target.dataset.msg;
          console.log("点击a标签后，要跳转的小程序页面：", wxPage);
          if (window.wx && window.wx.miniProgram && window.wx.miniProgram.navigateTo) {
            window.wx.miniProgram.navigateTo({
              url: decodeURIComponent(wxPage),
              success: () => console.log('跳转小程序成功'),
              fail: (err) => console.error('跳转失败:', err)
            });
          } else {
            console.error('当前环境不支持小程序跳转');
          }
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.bubble-list-container {
    display: flex;
}
.ai-message {
    display: inline-block;
    width: auto;
    margin-left: 32px;
    max-width: calc(100vw - 132px);
    background: linear-gradient( 180deg, #FFF5F5 0%, #FFFFFF 100%);
    border-radius: 0 16px 16px 16px;
    border: 6px solid #FFFFFF;
    padding: 24px 24px;
    margin-top: 40px;
    font-weight: 400;
    font-size: 28px;
    color: #383D48;
    line-height: 40px;
    .thinking-top {
        font-weight: 600;
        font-size: 24px;
        color: #D32525;
        line-height: 32px;
        position: relative;
        margin-left: 36px;
        &::before {
            position: absolute;
            width: 24px;
            height: 24px;
            left: -36px;
            top: 50%;
            content: '';
            background-image: url("https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/8a452d8f-334b-445e-b0c2-fb01787324f5.png");
            background-size: 100% 100%;
            transform: translate(0, -50%);
        }
    }
    .thinking {
        font-weight: 400;
        font-size: 24px;
        color: #5C5F66;
        line-height: 40px;
        border-left: solid 2px #CDD0D8;
        padding-left: 16px;
    }
    ::v-deep .van-cell {
        padding: 0 0;
        background-color: unset;
    }
    ::v-deep .van-collapse-item__content {
        background-color: unset;
        padding-left: 0;
        padding-right: 0;
    }
}

.user {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;

  .user-message {
    /*display: inline-block;*/
    width: auto;
    max-width: calc(100vw - 132px);
    background: #E4544B;
    border-radius: 16px 0 16px 16px;
    padding: 24px 24px;
    margin: 40px 32px 10px auto;
    font-weight: 400;
    font-size: 28px;
    color: #FFFFFF;
    line-height: 40px;
    text-align: left;
    font-style: normal;
  }
  .loading {
    width: 60px;
    height: 60px;
    margin-left: 32px;
  }
}

/* 圆点呼吸动画 */
@keyframes dot-pulse {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

circle {
  animation: dot-pulse 1.5s infinite ease-in-out;
}

/* 给不同圆点添加延迟 */
circle:nth-child(1) {
  animation-delay: -0.3s;
}

circle:nth-child(2) {
  animation-delay: -0.15s;
}
</style>
