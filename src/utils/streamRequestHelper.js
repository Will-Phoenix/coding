export default class SSEClient {
  constructor(url, options = {}) {
    this.url = url;
    this.headers = options.headers || {};
    this.retryInterval = options.retryInterval || 3; // 重连间隔（秒）
    this.controller = null;
  }

  async sendMessage(body, { onSuccess, onUpdate, onError }) {
    this.controller = new AbortController();
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: JSON.stringify(body),
        signal: this.controller.signal,
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let shouldContinue = true;
      // eslint-disable-next-line no-constant-condition
      while (shouldContinue) {
        try {
          const { value, done } = await reader.read();
          if (done) {
            onSuccess && onSuccess();
            shouldContinue = false;
            break;
          }
          const chunk = decoder.decode(value, { stream: true });
          const messages = chunk.split("\n\n");
          for (const message of messages) {
            if (message) {
              const data = message.replace(/^data:\s*/, "").trim();
              onUpdate && onUpdate(data);
              if (data === "[DONE]") {
                onSuccess && onSuccess();
                shouldContinue = false;
                break;
              }
            }
          }
        } catch (e) {
          // console.log("数据流读取出错", e)
          shouldContinue = false;
          break;
        }
      }
      // console.log("响应结束")
    } catch (error) {
      console.log("sendMessage Error", error)
      onError && onError(error);
      this._retry(body, { onSuccess, onUpdate, onError });
    }
  }

  _retry(body, callbacks) {
    if (this.retryInterval > 0) {
      console.warn(`SSE disconnected, retrying in ${this.retryInterval}s...`);
      setTimeout(() => this.sendMessage(body, callbacks), this.retryInterval * 1000);
    }
  }

  close() {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }
}

// // **使用示例**
// const sseClient = new SSEClient("/api/alamo-ai/chat/simple", {
//   headers: { Authorization: "Bearer your_token" },
//   retryInterval: 3, // 3秒重试
// });

// sseClient.sendMessage(
//   {
//     messages: [{ role: "user", content: "你是什么模型" }],
//     stream: true,
//   },
//   {
//     onSuccess: () => console.log("SSE 结束"),
//     onUpdate: (data) => console.log("接收数据:", data),
//     onError: (error) => console.error("SSE 错误:", error),
//   }
// );
