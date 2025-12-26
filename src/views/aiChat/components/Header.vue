<template>
  <div class="message-header-container">
    <div class="top-container">
      <img class="icon" src="https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/91026257-8458-4d2f-9d94-1788421ff97e.png" alt="" />
      <div class="text-container">
        <div class="text-top">Hi～我是AI财秘！</div>
        <div class="text-bottom">基于三门峡政务网国产化DeepSeek，私有化部署的大模型</div>
      </div>
    </div>
    <div v-if="list.length > 0" class="example-list-container">
      <div class="info">有什么我可以帮助您的?您可以</div>
      <div v-for="(item,index) in list" :key="index" class="list-item" @click="onSend(item)">
        {{ item }}
      </div>
      <!--          <div class="list-item" @click="onOpenUseBook">{{ usebook.key }}</div>-->
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageHeader',
  data() {
    return {
      list: [
        "发起差旅申请",
        "北京差旅标准是什么?",
        "业务招待的标准是什么?",
        // "项目保证金的标准是什么?",
        // "电子政务外网项目激励",
        // "合同管理办法",
        // "采购管理办法"
      ], // ["三门峡市人民政府公文形式与格式细则","党政机关公文格式","合同管理办法","甘棠智文使用方法"]
      usebook: {
        key: "甘棠AI使用指南",
        value: "<h1>甘棠AI使用指南</h1>\n" +
                "<h2>一、进入方式</h2>\n" +
                "<p>电脑端登录甘棠政务后点击左下角“甘小棠”或我的应用中“甘棠智文”进入甘棠AI模块。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/649b70a0-d593-41b5-a83f-5c5362be11d4.png\" alt=\"\"/>\n" +
                "<h2>二、甘棠智文</h2>\n" +
                "<h3>1、公文写作</h3>\n" +
                "<p>点击“甘棠智文”-“公文写作”进入页面，点击“开始写作”进入“文章写作”页面。</p>\n" +
                "<p>“近期稿件”展示距离当前时间最新的5条历史记录；点击“更多”跳转到“历史记录”页面；点击“查看”可查看文章详情，对文章进行编辑、再次生成和导出；点击“删除”即删除本条记录。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/0f416f70-9f1b-4162-9c54-61c47d9e0ec6.png\" alt=\"\"/>\n" +
                "<p>进入“文章写作”页面后，在左侧填写相关信息后点击下方“生成文章”，右侧即可生成全文。</p>\n" +
                "<p>文章内容：描述需要生成的内容；参考素材：可上传相关附件，提高文章的精确度；参考知识库：选择已有知识库文档进行辅助；语言风格：选择本篇文章生成的风格；文章篇幅：输入所需文章字数；联网搜索：勾选“是”可结合最新信息进行生成。\n" +
                "</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/98eeb2f1-31a9-4068-910f-fbc30fdcdb14.png\" alt=\"\"/>\n" +
                "<p>文章生成后可调整格式、修改文本等，调整后点击右上角“保存”即可。如对文章不满意可点击下方“重新生成”再次生成一篇文章。点击“复制”可复制文本内容进行粘贴。点击“下载”可导出word文档。</p>\n" +
                "<h3>2、历史记录</h3>\n" +
                "<p>点击“甘棠智文”-“历史记录”进入页面，展示之前生成过的所有历史，可通过标题进行模糊搜索，点击“查看”可查看文章详情，页面同“文章写作”可对文章进行编辑、再次生成和导出；点击“删除”即删除本条记录。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/bd449de7-638f-439e-b941-15c346572ba8.png\" alt=\"\"/>\n" +
                "<h2>三、甘小棠AI</h2>\n" +
                "<p>点击“甘小棠AI”进入页面，在下方输入您的问题或者指令，点击红色箭头或enter键即可获得回答。点击联网搜索可结合最新信息回答问题，“选择知识库”可结合上传知识库的内容回答问题。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/a4d376bd-92c4-4b85-9ee6-b6666171edf4.png\" alt=\"\"/>\n" +
                "<h2>四、知识库</h2>\n" +
                "<p>点击“知识库”进入页面。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/1f3cca18-d145-4e51-a5df-9e96ef75633f.png\" alt=\"\"/>\n" +
                "<p>点击“新增知识库”，出现弹窗，输入知识库名称后点击“确定”即可新增知识库。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/d032d4d6-4fdc-4b34-94bc-6cfeffffd33e.png\" alt=\"\"/>\n" +
                "<p>新建知识库后，可通过点击或拖动上传文件（注：每次只可上传单个文件），上传完成后可下载或删除文件。点击“编辑”可修改知识库名称。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/937a4600-f521-46c5-a8f5-d0e4cc545345.png\" alt=\"\"/>\n" +
                "<p>点击“语义检索”输入内容后点击搜索，通过语义解析对该知识库的文档进行检索匹配。右上角展示相似分，结果按照相似分由高到低进行排序，点击来源可下载该文件。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/339fb772-1bc4-406c-8f09-87072b239363.png\" alt=\"\"/>\n" +
                "<p>删除知识库需点击知识库右侧的“垃圾桶”图标，点击“确定”后该知识库删除。</p>\n" +
                "<img style=\"width: 100%\" src=\"https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/733efc00-a955-42a0-842e-c08cccd10046.png\" alt=\"\"/>"
      }
    };
  },
  computed: {
  },
  mounted() {

  },
  methods: {
    onSend(message) {
      this.$emit('send', message)
    },
    onOpenUseBook() {
      this.$emit('openUseBook', this.usebook)
    }
  }
};
</script>

<style lang="scss" scoped>
.message-header-container {
    display: flex;
    flex-direction: column;
    margin: 32px 32px 0 32px;
    .top-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        .icon {
            width: 100px;
            height: 100px;
        }
        .text-container {
            display: flex;
            flex-direction: column;
            margin-left: 16px;
            .text-top {
                font-weight: 600;
                font-size: 28px;
                color: #333333;
                line-height: 40px;
                text-align: left;
                font-style: normal;
            }
            .text-bottom {
                font-weight: 400;
                font-size: 24px;
                color: #888A8F;
                line-height: 34px;
                text-align: left;
                font-style: normal;
                margin-top: 8px;
            }
        }
    }
    .example-list-container {
        margin-top: 44px;
        display: flex;
        flex-direction: column;
        width: 556px;
        background: linear-gradient( 180deg, #FFF5F5 0%, #FFFFFF 100%);
        border-radius: 0 16px 16px 16px;
        border: 6px solid #FFFFFF;
        padding: 24px 24px;
        .info {
            font-weight: 400;
            font-size: 24px;
            color: #383D48;
            line-height: 40px;
            text-align: left;
            font-style: normal;
        }
        .list-item {
            font-weight: 400;
            font-size: 28px;
            color: #D32525;
            line-height: 40px;
            text-align: left;
            font-style: normal;
            position: relative;
            padding-left: 32px;
            margin-top: 16px;
            &::before {
                position: absolute;
                top: 12px;
                left: 0;
                content: '';
                width: 16px;
                height: 16px;
                background: #D32525;
                border-radius: 50%;
            }
        }
    }
}
</style>
