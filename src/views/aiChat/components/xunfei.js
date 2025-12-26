import * as CryptoJS from "@/views/aiChat/xunFei/crypto-js.js";

const APPID = "063b8cdc";
const API_KEY = "25932d4e2e70a579a813c5c1b3d76fed";
const API_SECRET = "YTU4MmEzZDFhOTAzN2Q0MjQ3MWM3YmY4";

export default {
  data() {
    return {
      iatWS: null,
      resultText: "", // 最终识别结果
      resultTextTemp: "" // 临时存储部分结果
    };
  },
  methods: {
    /* 不知道为啥本地可以获取url，但是发到预生产报错，暂时不管，使用后端接口返回到URL */
    getWebSocketUrl() {
      // 请求地址根据语种不同变化
      let url = "wss://iat-api.xfyun.cn/v2/iat";
      let host = "iat-api.xfyun.cn";
      let apiKey = API_KEY;
      const apiSecret = API_SECRET;
      const date = new Date().toGMTString();
      const algorithm = "hmac-sha256";
      let headers = "host date request-line";
      const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
      const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
      const signature = CryptoJS.enc.Base64.stringify(signatureSha);
      const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
      const authorization = btoa(authorizationOrigin);
      url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
      return url;
    },

    // 连接WebSocket
    connectWebSocket(webSocketUrl, callback1 = () => {}, callback2 = () => {},) {
      // 确保只创建一个WebSocket连接
      if (this.iatWS && this.iatWS.readyState === WebSocket.OPEN) {
        this.iatWS.close();
      }
      this.iatWS = new WebSocket(webSocketUrl);
      console.log("ws==============>", this.iatWS)

      this.iatWS.onopen = (e) => {
        // this.recorder.start({
        //   sampleRate: 16000,
        //   frameSize: 1280,
        // });

        const params = {
          common: { app_id: APPID },
          business: {
            language: "zh_cn",
            domain: "iat",
            accent: "mandarin",
            vad_eos: 5000,
            dwa: "wpgs",
          },
          data: {
            status: 0,
            format: "audio/L16;rate=16000",
            encoding: "lame",
          },
        };
        this.iatWS.send(JSON.stringify(params));
        callback1();
      };

      this.iatWS.onmessage = (e) => {
        this.renderResult(e.data, callback2);
      };

      this.iatWS.onerror = (e) => {
        console.error("WebSocket Error:", e);
        this.cleanup();
      };

      this.iatWS.onclose = (e) => {
        this.cleanup();
      };
    },

    // 处理识别结果
    renderResult(resultData, callback = () => {}) {
      try {
        const jsonData = JSON.parse(resultData);
        // 处理结束状态
        if (jsonData.code === 0 && jsonData.data?.status === 2) {
          this.iatWS.close();
        } else if (jsonData.code !== 0) {
          console.error("Recognition Error:", jsonData);
          this.iatWS.close();
        }

        // 处理识别文本
        if (jsonData.data?.result) {
          const data = jsonData.data.result;
          let str = data.ws?.map(ws => ws.cw[0].w).join("") || "";

          if (data.pgs === "apd") {
            this.resultText = this.resultTextTemp;
          }

          if (data.pgs) {
            this.resultTextTemp = this.resultText + str;
          } else {
            this.resultText += str;
          }
          // 说明返回数据已结束，可以把组装的msg返回
          if (jsonData.data?.status === 2) {
            // 实时返回当前结果
            callback({
              final: data.pgs ? this.resultTextTemp : this.resultText,
              partial: str
            });
          }
        }
      } catch (error) {
        console.error("Result Parsing Error:", error);
      }
    },

    // 清理资源
    cleanup() {
      if (this.iatWS) {
        this.iatWS = null;
      }
      this.resultText = "";
      this.resultTextTemp = "";
    }
  },
  beforeUnmount() {
    this.cleanup();
  }
};
