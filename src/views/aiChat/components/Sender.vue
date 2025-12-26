<template>
  <div class="sender-container">
    <van-field v-model="message" :border="false" class="input" type="textarea" rows="3" placeholder="有问题尽管问我，让我为您答疑解惑" @focus="onFocus" @blur="onBlur" />
    <div v-if="isRecording" class="tool-tip">松手发送 上滑取消</div>
    <div class="operate">
      <div
        class="mic-wrapper"
        :class="{'is-recording': isRecording}"
        @touchstart.prevent="startVoiceInput"
        @pointerup="endVoiceInput"
      >
        <!-- 语音波浪图标（录音时显示） -->
        <div v-if="isRecording" class="voice-wave">
          <span
            v-for="(bar, index) in voiceBars"
            :key="index"
            :class="['wave-bar', `bar-${index}`]"
            :style="{ height: barHeight(index) }"
          ></span>
        </div>

        <!-- 普通麦克风图标（非录音状态显示） -->
        <i v-else class="el-icon-mic"></i>
        <!--        <span v-if="isRecording" class="recording-text">录音中...</span>-->
        <span v-if="!isRecording" class="recording-text">按住 说话</span>
      </div>
      <img v-if="status === 0" :class="{'disabled': !message}" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/dccf0237-e8bb-47dc-8a85-bdc63c50992f.png" alt="" @click="send()" />
      <img v-else src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/fb25f22b-ae8c-488d-b08c-e85a56742170.png" alt="" @click="stopSend" />
    </div>
    <!-- 语音识别中toast -->
    <div v-if="speechLoading" class="speech-toast">
      <i class="el-icon-loading"></i>
      <span>语音识别中…</span>
    </div>
  </div>
</template>

<script>
import { uploadBlobData } from "@/utils/fileUtils";
import Recorder from 'recorder-core';
import 'recorder-core/src/engine/mp3-engine';
import 'recorder-core/src/engine/mp3';
import { getAudioToTextUrl } from "@/api/cicada/aiChat";
import xunfei from "./xunfei.js";
import { blobToDataURL } from "@/utils/fileUtils.js";

export default {
  name: 'Sender',
  mixins: [xunfei],
  data() {
    return {
      message: "",
      status: 0, // 0 未发送  1 发送中
      isRecording: false,
      // 语音相关
      voiceLevel: 0, // 语音音量（0-100）
      voiceAnimationId: null, // 动画帧ID
      startY: 0, // 触摸开始位置（用于上滑检测）
      isCanceling: false, // 是否正在取消
      audioContext: null,
      analyser: null,
      microphone: null,
      volumeHistory: [],
      // 通用
      recordMode: 'mp3', // 'native' | 'mp3'，录音工具：native用的浏览器原生，mp3用的recorder-core
      serviceMode: 'xf', // 'xf' | 'df', 语音转文字服务器：df为dify服务，我们后端包了一层，xf为讯飞服务，websocket接口，前端直接调用
      // native
      mediaRecorder: null,
      audioChunks: [],
      recordingTimeout: null,
      mimeType: '',
      // mp3
      recorderJsInstance: null,
      // 语音识别loading toast
      speechLoading: false,
      // 用于防止重复触发
      touchStartTime: 0,
      recordTimer: null,
      userEnableRecording: false
    };
  },
  computed: {
    // 生成语音波动条（用于动画）
    voiceBars() {
      return new Array(40).fill(null)
    }
  },
  beforeDestroy() {
    if (this.isRecording) {
      this.stopRecording();
    }
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
    }
    this.clearRecordTimer();
  },
  methods: {
    send(msg = '') {
      const message = msg || this.message;
      if (!message) return;
      this.updateSendStatus(1);
      this.$emit('send', message)
      if (this.message) {
        this.message = '';
      }
    },
    stopSend() {
      this.updateSendStatus(0);
      this.$emit('stopSend')
    },
    updateSendStatus(status) {
      this.status = status;
    },
    onFocus(e) {
      console.log("输入框获取焦点")
      setTimeout(() => {
        e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100)
    },
    onBlur() {
      // console.log("输入框失去焦点")
    },

    // 统一入口
    async startRecording() {
      // 启动语音波动动画
      this.startVoiceAnimation();
      if (this.recordMode === 'native') {
        await this.startNativeRecording();
      } else if (this.recordMode === 'mp3') {
        await this.startMp3Recording();
      }
    },
    stopRecording(send = true) {
      // 停止语音波动动画
      this.stopVoiceAnimation();
      if (this.recordMode === 'native') {
        this.stopNativeRecording(send);
      } else if (this.recordMode === 'mp3') {
        this.stopMp3Recording(send);
      }
    },

    async xfWebSocketSend(blob) {
      this.speechLoading = true;
      // 获取讯飞webSocket的url
      // const webSocketUrl = this.getWebSocketUrl();
      const webSocketUrl = (await getAudioToTextUrl()).data;
      console.log("websocket-url：", webSocketUrl.toString());
      const base64 = (await blobToDataURL(blob)).split(',')[1];
      this.connectWebSocket(webSocketUrl,
        () => {
          this.iatWS.send(
            JSON.stringify({
              data: {
                status: 2,
                format: "audio/L16;rate=16000",
                encoding: "lame",
                audio: base64,
              },
            }))
        },
        (data) => {
          this.speechLoading = false;
          console.log("语音识别后的数据：", data);
          // this.message = data.final;
          this.send(data.final);
          this.$message.success('语音识别成功');
        });
    },

    // 1. 浏览器原生录音
    async startNativeRecording() {
      try {
        // 录音权限查看、开启
        if (!this.userEnableRecording) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          this.userEnableRecording = true;
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.detectMimeType(stream);
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: this.mimeType || undefined
        });
        this.audioChunks = [];
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        this.mediaRecorder.onstop = async(send = true) => {
          if (send) {
            const type = this.mimeType || this.mediaRecorder.mimeType;
            const audioBlob = new Blob(this.audioChunks, { type });
            if (this.serviceMode === "xf") {
              await this.xfWebSocketSend(audioBlob);
            } else if (this.serviceMode === "df") {
              await this.sendAudioToServer(audioBlob, type);
            }
          }
          this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };
        this.mediaRecorder.start();
        this.isRecording = true;
        this.recordingTimeout = setTimeout(() => {
          if (this.isRecording) {
            this.stopNativeRecording();
          }
        }, 60000);
        console.log('开始原生录音');
      } catch (error) {
        console.error('录音失败:', error);
        this.$message.error(error.name === 'NotAllowedError' ? '请允许使用麦克风权限' : '录音失败，请重试');
      }
    },
    stopNativeRecording(send = true) {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop(send);
        this.isRecording = false;
        if (this.recordingTimeout) {
          clearTimeout(this.recordingTimeout);
          this.recordingTimeout = null;
        }
        console.log('停止原生录音');
      }
    },

    // 2. mp3录音（Recorder.js）
    async startMp3Recording() {
      try {
        // 录音权限查看、开启
        if (!this.userEnableRecording) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          this.userEnableRecording = true;
          return;
        }
        if (!Recorder) {
          this.$message.error('未加载Recorder.js，无法录制mp3');
          return;
        }
        this.recorderJsInstance = new Recorder({
          type: 'mp3',
          sampleRate: 16000,
          bitRate: 16
        });
        this.recorderJsInstance.open(() => {
          this.recorderJsInstance.start();
          this.isRecording = true;
          this.recordingTimeout = setTimeout(() => {
            if (this.isRecording) {
              this.stopMp3Recording();
            }
          }, 60000);
          console.log('开始mp3录音');
        }, (msg, isUserNotAllow) => {
          this.$message.error('无法录音：' + msg);
        });
      } catch (error) {
        console.error('录音失败:', error);
        this.$message.error(error.name === 'NotAllowedError' ? '请允许使用麦克风权限' : '录音失败，请重试');
      }
    },
    stopMp3Recording(send = true) {
      if (this.recorderJsInstance && this.isRecording) {
        this.recorderJsInstance.stop(async(blob, duration) => {
          this.isRecording = false;
          if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
            this.recordingTimeout = null;
          }
          if (send) {
            if (this.serviceMode === "xf") {
              await this.xfWebSocketSend(blob);
            } else if (this.serviceMode === "df") {
              await this.sendAudioToServer(blob, 'audio/mp3');
            }
          }
          this.recorderJsInstance.close();
          this.recorderJsInstance = null;
          console.log('停止mp3录音');
        }, (msg) => {
          this.isRecording = false;
          this.$message.error('录音失败：' + msg);
        });
      }
    },

    // 通用上传
    async sendAudioToServer(audioBlob, mimeType) {
      this.speechLoading = true;
      console.log("上传音频类型:", mimeType, "大小:", audioBlob.size + " bytes");
      try {
        const url = process.env.VUE_APP_BASE_API + '/assistant-dify/audioToText';
        const response = await uploadBlobData(url, audioBlob, 'recording' + this.getFileExtension(mimeType), this.$store.getters.token);
        if (response.data) {
          this.message = response.data.data;
          this.$message.success('语音识别成功');
        }
      } catch (error) {
        console.error('发送音频文件失败:', error);
        this.$message.error('语音识别失败，请重试');
      } finally {
        this.speechLoading = false;
      }
    },

    // 检测浏览器支持的MIME类型
    detectMimeType(stream) {
      const preferredTypes = [
        'audio/wav',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4'
      ];
      this.mimeType = preferredTypes.find(type =>
        MediaRecorder.isTypeSupported(type)
      ) || '';
      console.log('检测到支持的音频格式:', this.mimeType);
    },
    getFileExtension(mimeType) {
      const map = {
        'audio/wav': '.wav',
        'audio/webm': '.webm',
        'audio/webm;codecs=opus': '.webm',
        'audio/mp4': '.mp4',
        'audio/mpeg': '.mp3',
        'audio/mp3': '.mp3'
      };
      return map[mimeType] || '';
    },

    toggleVoiceInput() {
      console.log('点击语音按钮, 当前录音状态:', this.isRecording, '当前模式:', this.recordMode);
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    },
    startVoiceInput(e) {
      // document.addEventListener('touchend', this.endVoiceInput, {once: true, capture: true});
      this.startY = e.touches[0].clientY;
      this.clearRecordTimer();
      // 记录开始时间，防止短按触发
      this.touchStartTime = Date.now();

      // 已经处于录音状态则直接返回
      if (this.isRecording) return;

      // 设置延时定时器（200ms后开始录音）
      this.recordTimer = setTimeout(() => {
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.startRecording();
      }, 200);
    },
    // 触摸移动事件（检测上滑）
    handleTouchMove(e) {
      if (!this.isRecording) return;

      const currentY = e.touches[0].clientY;
      const deltaY = this.startY - currentY; // 上滑距离

      // 上滑超过30px视为取消操作
      if (deltaY > 30 && !this.isCanceling) {
        console.log("取消发送");
        this.isCanceling = true;
      }
      // 下滑回原位
      else if (deltaY <= 30 && this.isCanceling) {
        this.isCanceling = false;
      }
    },
    endVoiceInput() {
      document.removeEventListener('touchmove', this.handleTouchMove);
      if (this.isRecording) {
        // 如果处于取消状态
        if (this.isCanceling) {
          this.cancelVoiceInput();
          return;
        }
        this.stopRecording();
      } else {
        // 清除延时定时器（如果是短按，这能防止录音开始）
        this.clearRecordTimer();
        // 短按才给提示语
        if (Date.now() - this.touchStartTime < 200) {
          this.$message.warning("请按住说话");
        }
      }
    },
    // 取消语音输入
    cancelVoiceInput() {
      this.stopRecording(false); // 停止录音
      this.isRecording = false;
      this.isCanceling = false;
      this.$message.warning("已取消发送");
    },
    // 启动语音波动动画（使用真实麦克风音量）
    async startVoiceAnimation() {
      try {
        // 创建音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;

        // 获取麦克风输入
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.microphone = this.audioContext.createMediaStreamSource(stream);

        // 连接分析器
        this.microphone.connect(this.analyser);

        // 初始化音量历史
        this.volumeHistory = new Array(this.voiceBars.length).fill(0);

        // 开始动画循环
        this.animateVoiceWave();
      } catch (error) {
        console.error('无法启动音频分析:', error);
        // 回退到随机动画
        this.startFallbackAnimation();
      }
    },
    // 停止语音波动动画
    stopVoiceAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }

      if (this.microphone) {
        this.microphone.disconnect();
        this.microphone = null;
      }

      this.analyser = null;
    },
    // 动画循环
    animateVoiceWave() {
      if (!this.analyser) return;

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);

      // 计算平均音量 (0-100)
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      this.voiceLevel = Math.min(100, Math.max(0, average * 100 / 128)); // 转换为0-100范围

      // 更新音量历史
      this.volumeHistory.push(this.voiceLevel);
      if (this.volumeHistory.length > this.voiceBars.length) {
        this.volumeHistory.shift();
      }

      // 继续动画循环
      this.animationFrameId = requestAnimationFrame(() => this.animateVoiceWave());
    },
    // 回退动画（当无法获取真实麦克风时）
    startFallbackAnimation() {
      let targetLevel = 20;

      const animate = () => {
        // 平滑过渡到目标值
        this.voiceLevel += (targetLevel - this.voiceLevel) * 0.2;

        // 每隔一段时间随机改变目标值
        if (Math.random() < 0.05) {
          targetLevel = 20 + Math.random() * 60;
        }

        this.animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    },

    // 获取语音条高度（用于波动动画）
    barHeight(index) {
      // 使用历史数据创建波浪效果
      const historyIndex = Math.floor(
        (index / this.voiceBars.length) * this.volumeHistory.length
      );

      // 基础高度 + 音量影响 + 波浪效果
      const baseHeight = 10;
      const volumeFactor = this.volumeHistory[historyIndex] || this.voiceLevel;
      const waveEffect = Math.sin(Date.now() / 300 + index * 0.3) * 5;

      const height = baseHeight + (volumeFactor / 100) * 30 + waveEffect;
      return `${height}px`;
    },
    // 新增：清理延时定时器的方法
    clearRecordTimer() {
      if (this.recordTimer) {
        clearTimeout(this.recordTimer);
        this.recordTimer = null;
      }
    },
  }
};
</script>

<style lang="scss" scoped>
  .sender-container {
    background: #FFFFFF;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    border: 2px solid #CDD0D8;
    display: flex;
    flex-direction: column;
    padding: 24px 24px;
    margin: 16px 32px 24px 32px;

    ::v-deep .van-cell {
      padding: 0 0;
    }

    .tool-tip {
      font-size: 24px;
      text-align: center;
      margin-right: 40px;
      margin-bottom: 5px;
      opacity: 0.4;
    }

    .operate {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 75px;

      .voice-wave {
        display: flex;
        align-items: center;
        height: 36px;
        margin-right: 12px;

        .wave-bar {
          display: inline-block;
          width: 4px;
          background-color: #f56c6c;
          border-radius: 2px;
          margin: 0 2px;
          transition: height 0.2s ease-out;
        }
      }

      .mic-wrapper {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 20px;
        margin-right: 16px;
        transition: all 0.3s ease;
        background-color: #f5f7fa;
        flex: 1;
        justify-content: center;
        height: 100%;

        /* 添加触觉反馈 */
        &:active:not(.is-recording) {
          transform: scale(0.95);
        }

        &:hover {
          background-color: #e4e7ed;
        }

        &.is-recording {
          background-color: #fef0f0;
          border: 1px solid #fbc4c4;

          .el-icon-mic {
            color: #f56c6c;
            animation: pulse 1.5s infinite;
          }

          .recording-text {
            color: #f56c6c;
            animation: blink 1.5s infinite;
          }
        }

        .el-icon-mic {
          font-size: 36px;
          color: #666;
        }

        .recording-text {
          margin-left: 8px;
          font-size: 24px;
        }
      }

      img {
        width: 56px;
        height: 56px;
      }

      img + img {
        margin-left: 40px;
      }

      .disabled {
        opacity: 0.6;
      }
    }
  }

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* 动画定义 */
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.speech-toast {
  position: fixed;
  bottom: 30%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  background: #fff;
  color: #333;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: 18px 32px 18px 28px;
  display: flex;
  align-items: center;
  font-size: 24px;
  .el-icon-loading {
    color: #f56c6c;
    font-size: 24px;
    margin-right: 12px;
  }
}
</style>
