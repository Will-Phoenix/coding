<template>
  <div class="page-ai-chat-index">
    <div class="message-container">
      <MessageHeader @send="onHeaderSend" @openUseBook="onOpenUseBook" />
      <BubbleList ref="bubbleListRef" @send="onHeaderSend" />
    </div>
    <!--    <ChatToolbar ref="chatToolbar" @change="onToolbarChange"/>-->
    <Sender ref="senderRef" @send="onSend" @stopSend="onStopSend" />
  </div>
</template>
<script>
import Sender from "@/views/aiChat/components/Sender.vue";
import BubbleList from "@/views/aiChat/components/BubbleList.vue";
import ChatToolbar from "@/views/aiChat/components/ChatToolbar.vue";
import SSEClient from "@/utils/streamRequestHelper.js";
import { throttle } from "@/utils/encrypt-decrypt.js";
import { marked } from 'marked';
import MessageHeader from "@/views/aiChat/components/Header.vue";
import { autoInjectConsole } from '@/utils';
import { generateSignature } from "@/api/cicada/aiChat";

const render = new marked.Renderer();
render.hr = function() {
  return '\n';
};
render.link = function(href, title, text) {
  const link = marked.Renderer.prototype.link.call(this, href, title, text);
  return link.replace('<a', '<a target="_blank" rel="noopener noreferrer"');
};
marked.use({ renderer: render });
export default {
  name: "AIChatIndex",
  components: { MessageHeader, ChatToolbar, BubbleList, Sender },
  data() {
    return {
      // chat: {
      //   memoryId: '',
      //   chatId: '',
      // },
      sseClient: null,
      // requestData: {
      //   isNetSearch: 0,
      //   knowledgeBaseIds: [],
      //   role: "user"
      // },
      currentMessageId: '',
      // auth: "",
      conversationId: null, // 第一次对话后返回id，后续带着id对话
    };
  },
  async mounted() {
    // 从url获取token，塞入store
    if (this.$route.query.cicadaUserToken) {
      await this.$store.dispatch("user/setToken", { token: this.$route.query.cicadaUserToken })
    }
    this.initRem();
    this.initData();
    // this.initWxSdk();
  },
  created() {
    if (this.$route.query.hasConsole === 'true') {
      autoInjectConsole();
    }
  },
  methods: {
    initRem() {
      const setRem = () => {
        const htmlWidth = document.documentElement.clientWidth;
        // 页面最大font-size设定为64px
        let fontSize = Math.min(htmlWidth / 10, 64);
        document.querySelector('html').style.fontSize = fontSize + 'px';
      };
      window.addEventListener('resize', setRem);
      setRem();
      // 离开页面时销毁监听
      this.$once('hook:beforeDestroy', () => {
        window.removeEventListener('resize', setRem);
      });
    },
    initData() {
      this.initSSEClient();
      // this.startChat();
      // this.loadKnowledgeList();
    },
    // async loadKnowledgeList() {
    //   if (!this.auth) {
    //     this.auth = getStore({ name: "auth" });
    //   }
    //   const headers = {
    //     "Blade-Auth": this.auth.blade_auth,
    //     "device-id": this.auth.device_id,
    //     "device-type": this.auth.device_type
    //   };
    //   APIGetKnowledgeList(headers).then(res => {
    //     // console.log("loadKnowledgeList===success", res);
    //     this.$refs.chatToolbar.initKnowledgeList(res.data);
    //   })
    // },
    initSSEClient() {
      // if (!this.auth) {
      //   this.auth = getStore({ name: "auth" });
      // }
      // const headers = {
      //   "Blade-Auth": this.auth.blade_auth,
      //   "device-id": this.auth.device_id,
      //   "device-type": this.auth.device_type
      // };
      const headers = { Authorization: this.$store.getters.token };
      this.sseClient = new SSEClient(process.env.VUE_APP_BASE_API + "/assistant-dify/comStreamChat", {
        headers: headers,
        retryInterval: -1, // 3秒重试
      });
    },
    // startChat() {
    //   if (!this.auth) {
    //     this.auth = getStore({ name: "auth" });
    //   }
    //   const headers = {
    //     "Blade-Auth": this.auth.blade_auth,
    //     "device-id": this.auth.device_id,
    //     "device-type": this.auth.device_type
    //   };
    //   APIGetStartChat(headers).then(res => {
    //     // console.log("startChat", res);
    //     Object.assign(this.chat, { memoryId: res.data.memoryId, chatId: res.data.id });
    //   })
    // },
    onHeaderSend(message) {
      this.$refs.senderRef.updateSendStatus(1);
      this.onSend(message)
    },
    onSend(message) {
      const newMessage = {
        conversationId: this.conversationId, content: message, messageId: Date.now().toString()
      }
      this.$refs.bubbleListRef.addMessage(newMessage);
      this.$nextTick(() => {
        const contentContainer = document.querySelector('.message-container');
        if (contentContainer) {
          contentContainer.scrollTop = contentContainer.scrollHeight;
        }
      })
      let accumulatedContent = "";
      if (!this.sseClient) {
        this.initSSEClient()
      }
      this.sseClient.sendMessage(
        // { stream: true, memoryId: this.chat.memoryId, chatId: this.chat.chatId, messages: [newMessage] },
        { conversationId: newMessage.conversationId, message: newMessage.content },
        {
          onSuccess: () => {
            console.log("流式请求完成", accumulatedContent);
            this.currentMessageId = null;
            this.$refs.senderRef.updateSendStatus(0);
            this.$refs.bubbleListRef.updateAIMessage(null, true);
          },
          onUpdate: (data) => {
            // console.log("onUpdate===data", data);
            if (data === "[DONE]" || !data) return;
            let str = "";
            try {
              const r = JSON.parse(data);
              if (r.event === "message") {
                str = r.answer;
                if (!this.conversationId) {
                  this.conversationId = r.conversation_id;
                }
              }
            } catch (e) {
              // console.log(e);
            }
            // console.log("onSend",data);
            accumulatedContent += str;
            const thinking = this.extractThinkContent(accumulatedContent);
            let str1 = "";
            if (thinking) {
              str1 = accumulatedContent.split('</think>')[1] || '';
            } else {
              str1 = accumulatedContent;
            }
            // console.log("onUpdate===str1", str1);
            throttle(this.handleMdParseHtml(str1, thinking), 1000, 2)
          },
          onError: (error) => {
            console.log("onSend onError", error)
          },
        });
    },
    handleMdParseHtml(str, thinking) {
      let content = str;
      try {
        // 对markdown转换成的html进行改造，以满足特殊需求，如：点击a标签跳转小程序页面；点击a标签把元素内容发送
        content = this.modifyHtml(marked(str));
      } catch (e) {
        console.log("marked", e);
      }
      if (!this.currentMessageId) {
        this.currentMessageId = Date.now().toString();
      }
      this.onUpdateMessage({ role: "ai", content: content, thinking: thinking, messageId: this.currentMessageId })
      this.$nextTick(() => {
        const contentContainer = document.querySelector('.message-container');
        if (contentContainer) {
          contentContainer.scrollTop = contentContainer.scrollHeight;
        }
      })
    },
    modifyHtml(html) {
      if (html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // 跳转微信小程序，修改dom
        const targetLinks = doc.body.querySelectorAll('a[href*="URL:"]');
        if (targetLinks) {
          targetLinks.forEach(link => {
            link.removeAttribute("target");
            link.setAttribute('data-type', 'URL');
            link.setAttribute('data-msg', `${link.href.split("url:")[1]}`);
            link.href = 'javascript:void(0)';
          });
        }
        // 火车票查询的a标签，要点击后发送消息，修改dom
        const links = doc.body.querySelectorAll('a[href*="QA:"]');
        if (links) {
          links.forEach(link => {
            console.log("link:", link);
            link.removeAttribute("target");
            link.setAttribute('data-type', 'QA');
            link.setAttribute('data-msg', `${decodeURIComponent(link.href.split("qa:")[1])}`);
            link.href = 'javascript:void(0)';
          });
        }
        return doc.body.innerHTML;
      } else {
        return html;
      }
    },
    onUpdateMessage(val) {
      this.$refs.bubbleListRef.updateAIMessage(val);
    },
    extractThinkContent(str) {
      // 匹配 <think> 和 </think> 之间的内容（忽略换行符）
      const regex = /<think>([\s\S]*?)(?:<\/think>|$)/;
      const match = str.match(regex);
      if (match && match[1]) {
        // 去除换行符和多余空白，返回纯内容
        return match[1].replace(/\n/g, "").trim();
      }
      return ""; // 如果没有匹配到，返回空字符串
    },
    onStopSend() {
      this.sseClient.close();
      this.currentMessageId = null;
      this.$refs.senderRef.updateSendStatus(0);
      // this.$refs.bubbleListRef.updateAIMessage(null);
      this.$refs.bubbleListRef.getResponse();
    },
    onToolbarChange(val) {
      this.requestData.isNetSearch = val.isNetSearch;
      this.requestData.knowledgeBaseIds = val.knowledgeBaseIds || [];
    },
    onOpenUseBook(val) {
      const newMessage = {
        ...this.requestData, ...this.chat, content: val.key, messageId: Date.now().toString()
      }
      this.$refs.bubbleListRef.addMessage(newMessage);
      this.$nextTick(() => {
        const contentContainer = document.querySelector('.message-container');
        if (contentContainer) {
          contentContainer.scrollTop = contentContainer.scrollHeight;
        }
      })
      setTimeout(() => {
        this.$refs.bubbleListRef.updateAIMessage({ role: "ai", content: val.value, messageId: Date.now().toString() })
        this.$refs.bubbleListRef.updateAIMessage(null, true);
      }, 1000)
    },
    async initWxSdk() {
      const currentUrl = window.location.href.split('#')[0];
      const { appId, noncestr, signature, timestamp } = (await generateSignature(currentUrl)).data;
    }
  }
}
</script>
<style src="@/views/aiChat/components/markdown.css"></style>
<style scoped lang="scss">
.page-ai-chat-index {
    display: flex;
    flex-direction: column;
    background-color: #F8F8F8;
    height: 100vh;
    .message-container {
        flex: 1;
        overflow-y: auto;
    }
}
</style>
