<template>
  <el-dialog v-bind="$attrs" :close-on-click-modal="false" :modal-append-to-body="false"
    v-on="$listeners" @open="onOpen" fullscreen lock-scroll class="JNPF-full-dialog"
    :show-close="false" :modal="false" append-to-body>
    <div class="JNPF-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/jnpf.png" class="header-logo" />
        <p class="header-txt">· 打印预览</p>
      </div>
      <div class="header-page">
        <el-button @click="pageIndex = pageIndex - 1">上一页</el-button>
        <el-input-number style="width:60px;" v-model="pageIndex" @change="scrollpage"
          @blur="scrollpage" :controls="false" controls-position="right" :min="1"
          :max="batchData.length"></el-input-number>
        <span class="page-size">/{{ batchData.length }}</span>
        <el-button @click="pageIndex = pageIndex + 1">下一页</el-button>
      </div>
      <div class="options">
        <el-button type="primary" size="small" @click="word">下 载</el-button>
        <el-button type="primary" size="small" @click="print">打 印</el-button>
        <el-button @click="closeDialog()">{{
          $t("common.cancelButton")
        }}</el-button>
      </div>
    </div>
    <div class="main" v-loading="loading" ref="tsPrint">
      <div class="print-content" v-html="item.printTemplate" v-for="(item, index) in batchData"
        :key="index" />
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import { getBatchData } from "@/api/system/printDev";
import QRCode from "qrcodejs2";
import JsBarcode from "jsbarcode";
import request from "@/utils/request"
export default {
  props: ["id", "formId", "fullName", "batchIds", "printTitle"],
  computed: {
    ...mapGetters(["userInfo"])
  },
  data() {
    return {
      pageIndex: 1,
      data: {},
      batchData: [],
      printTemplate: "",
      recordList: [],
      loading: false
    };
  },
  watch: {
    pageIndex: {
      handler(val) {
        this.scrollpage(val);
      }
    }
  },
  methods: {
    scrollpage() {
      let index = this.pageIndex - 1 < 0 ? 0 : this.pageIndex - 1
      this.$nextTick(() => {
        let dom = document.querySelector('.main')
        dom.scrollTo({
          top: (window.document.body.clientHeight - 10) * index,
          behavior: "smooth"
        });
      });
    },
    resolveOne(data) {
      this.printTemplate = data.printTemplate;
      this.data = data.printData;
      this.recordList = data.operatorRecordList || [];
      this.replaceValue(this.data);
      this.replaceSysValue();
      this.replaceImg();
      this.replaceBarCode();
      this.replaceQrCode();
      this.batchData.push({ printTemplate: this.printTemplate });
    },
    onOpen() {
      // 打开时候初始化位置为第一页
      this.pageIndex = 0
      this.batchData = [];
      if (!this.id) return;
      this.printTemplate = "";
      this.data = {};
      this.loading = true;
      let query = {
        // 模板的id
        id: this.id,
        // 记录的id
        formId: this.batchIds
      };
      getBatchData(query).then(res => {
        if (!res.data) return;
        let array = res.data;
        for (let index = 0; index < array.length; index++) {
          const element = array[index];
          this.resolveOne(element);
        }
        this.loading = false;
      });
    },
    isChildTable(cells) {
      let tableName = "";
      outer: for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        let spanList = cells[j].getElementsByTagName("span");
        if (!spanList.length) break outer;
        let hasChildTable = false;
        inner: for (let j = 0; j < spanList.length; j++) {
          const spanEle = spanList[j];
          const dataTag = spanEle.getAttribute("data-tag")
            ? spanEle.getAttribute("data-tag").split(".")[0]
            : "null";
          if (dataTag && dataTag !== "headTable" && dataTag !== "null") {
            hasChildTable = true;
            tableName = dataTag;
            break inner;
          }
        }
        if (hasChildTable) break outer;
      }
      return tableName;
    },
    closeDialog() {
      this.$emit("update:visible", false);
    },
    generateTable(data, tds) {
      for (let key in data) {
        for (let j = 0; j < tds.cells.length; j++) {
          let spanList = tds.cells[j].getElementsByTagName("span");
          for (let i = 0; i < spanList.length; i++) {
            const dataTag = spanList[i].getAttribute("data-tag")
              ? spanList[i].getAttribute("data-tag").split(".")[1]
              : "null";
            if (key == dataTag) {
              spanList[i].innerHTML = data[key];
            }
          }
        }
      }
      return tds;
    },
    retrieveData(dataTag, tableObj, tds, newTable) {
      for (let key in this.data) {
        if (key == dataTag) {
          for (let j = 0; j < this.data[key].length; j++) {
            let tr = this.generateTable(this.data[key][j], tds.cloneNode(true));
            let tds1 = tr.children;
            for (let i = 0; i < tds1.length; i++) {
              const element = tds1[i];
              this.replaceImg(element);
              this.replaceBarCode(element);
              this.replaceQrCode(element);
            }
            newTable.push(tr);
          }
        }
      }
    },
    getHandleName(handleStatus) {
      if (handleStatus == 0) return "退回";
      if (handleStatus == 1) return "通过";
      if (handleStatus == 2) return "发起";
      if (handleStatus == 3) return "撤回";
      if (handleStatus == 4) return "终止";
      if (handleStatus == 5) return "指派";
      if (handleStatus == 6) return "加签";
      if (handleStatus == 7) return "转审";
      if (handleStatus == 8) return "变更";
      if (handleStatus == 9) return "复活";
      return "";
    },
    replaceSysValue() {
      const recordList = this.recordList;
      const systemPrinter =
        this.userInfo.userName + "/" + this.userInfo.userAccount;
      const systemPrintTime = this.jnpf.toDate(new Date());
      let systemApprovalContent = "";
      if (recordList.length) {
        systemApprovalContent +=
          '<table style="border-collapse: collapse; width: 100%;" border="1" data-mce-style="border-collapse: collapse; width: 100%;"><tbody><tr><td style="width:20%;" data-mce-style="width: 20%;">节点名称</td><td style="width:20%;" data-mce-style="width: 20%;">操作人员</td><td style="width:20%;" data-mce-style="width: 20%;">操作时间</td><td style="width:20%;" data-mce-style="width: 20%;">执行动作</td><td style="width: 20%;" data-mce-style="width: 20%;">备注</td></tr>';
        let content = "";
        for (let i = 0; i < recordList.length; i++) {
          const record = recordList[i];
          content += `<tr><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${record.nodeName
            }</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${record.userName
            }</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${this.jnpf.toDate(
              record.handleTime
            )}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${this.getHandleName(
              record.handleStatus
            )}</span></td><td style="width: 20%;" data-mce-style="width: 20%;"><span class="wk-print-tag-wukong wk-tiny-color--common" contenteditable="false">${record.handleOpinion ||
            ""}</span></td></tr>`;
        }
        systemApprovalContent += content;
        systemApprovalContent += "</tbody></table>";
      }
      this.printTemplate = this.replaceAll(
        this.printTemplate,
        "{systemPrinter}",
        systemPrinter
      );
      this.printTemplate = this.replaceAll(
        this.printTemplate,
        "{systemPrintTime}",
        systemPrintTime
      );
      this.printTemplate = this.replaceAll(
        this.printTemplate,
        "{systemApprovalContent}",
        systemApprovalContent
      );
    },
    replaceValue(data) {
      for (let key in data) {
        this.printTemplate = this.replaceAll(
          this.printTemplate,
          `{${key}}`,
          data[key] || ""
        );
        if (Array.isArray(data[key]) && data[key] && data[key].length) {
          this.replaceValue(data[key]);
        }
      }
    },
    replaceImg(childItem) {
      let imgRegular = /&lt;img(\S|\s)*?&lt;\/img&gt;/g;
      let imgList = [];
      if (childItem) {
        const element = childItem.innerHTML;
        imgList = element.match(imgRegular);
      } else {
        imgList = this.printTemplate.match(imgRegular);
      }
      if (imgList && imgList.length) {
        for (var i = 0; i < imgList.length; i++) {
          const item = imgList[i];
          if (this.getIsChildren(item) && !childItem) continue;
          const width = this.getWidthHeight(item);
          const height = this.getWidthHeight(item, "height");
          let value = this.getValue(item);
          const replaceImg = template => {
            if (childItem) {
              childItem.innerHTML = template;
            } else {
              this.printTemplate = this.replaceAll(
                this.printTemplate,
                item,
                template
              );
            }
          };
          let isArray = false;
          try {
            isArray = Array.isArray(JSON.parse(value));
          } catch (error) {
            isArray = false;
          }
          if (isArray) {
            const list = JSON.parse(value);
            let template = "";
            for (let index = 0; index < list.length; index++) {
              const element = list[index];
              if (element.url) {
                value = new RegExp("http").test(element.url)
                  ? value
                  : this.define.comUrl + element.url;
                template += `<img width='${width}' height='${height}' src='${value}'/>`;
              }
            }
            replaceImg(template);
          } else {
            value = new RegExp("http").test(value)
              ? value
              : this.define.comUrl + value;
            let template = `<img width='${width}' height='${height}' src='${value}'/>`;
            replaceImg(template);
          }
        }
      }
    },
    replaceBarCode(childItem) {
      let imgRegular = /&lt;barCode(\S|\s)*?&lt;\/barCode&gt;/g;
      let imgList = [];
      if (childItem) {
        const element = childItem.innerHTML;
        imgList = element.match(imgRegular);
      } else {
        imgList = this.printTemplate.match(imgRegular);
      }
      if (imgList && imgList.length) {
        for (var i = 0; i < imgList.length; i++) {
          const item = imgList[i];
          if (this.getIsChildren(item) && !childItem) continue;
          const width = this.getWidthHeight(item);
          const height = this.getWidthHeight(item, "height");
          const value = this.getValue(item);
          const id = this.jnpf.idGenerator();
          const template = `<img width='${width}' height='${height}'  id='barcode${id}'/>`;
          if (childItem) {
            childItem.innerHTML = template;
          } else {
            this.printTemplate = this.replaceAll(
              this.printTemplate,
              item,
              template
            );
          }
          this.$nextTick(() => {
            this.getJsBarcode(value, "#barcode" + id, width, height);
          });
        }
      }
    },
    replaceQrCode(childItem) {
      let imgRegular = /&lt;qrCode(\S|\s)*?&lt;\/qrCode&gt;/g;
      let imgList = [];
      if (childItem) {
        const element = childItem.innerHTML;
        imgList = element.match(imgRegular);
      } else {
        imgList = this.printTemplate.match(imgRegular);
      }
      if (imgList && imgList.length) {
        for (var i = 0; i < imgList.length; i++) {
          const item = imgList[i];
          if (this.getIsChildren(item) && !childItem) continue;
          const width = this.getWidthHeight(item);
          const height = this.getWidthHeight(item, "height");
          const value = this.getValue(item);
          const id = this.jnpf.idGenerator();
          const template = `<span id='qrCode${id}'/>`;
          if (childItem) {
            childItem.innerHTML = template;
          } else {
            this.printTemplate = this.replaceAll(
              this.printTemplate,
              item,
              template
            );
          }
          this.$nextTick(() => {
            this.getJsQrcode(value, "qrCode" + id, width, height);
          });
        }
      }
    },
    getWidthHeight(item, type = "width") {
      let regular = "";
      if (type == "width") regular = /width=[\"|'](.*?)[\"|']/gi;
      if (type == "height") regular = /height=[\"|'](.*?)[\"|']/gi;
      let quotes = /["|'](.*)["|']/;
      let data = item.match(regular);
      let value = "";
      if (data && data.length) {
        let res = data[0].match(quotes);
        value = res && res.length ? res[1] : 100;
      }
      return value;
    },
    getValue(item) {
      let regexp = /(((^|&)(<|&lt;)[a-zA-Z-]+?){0,1}(>|&gt;))([\s\S]+)((<|&lt;)\/[a-zA-Z-]+((>|&gt;){0,1}))/g;
      let data = item.match(regexp);
      let value = data && data.length ? data[0] : "";
      value = value.replace(/(((^|&)(<|&lt;)[a-zA-Z-]+?){0,1}(>|&gt;))/g, "");
      value = value.replace(/((<|&lt;)\/[a-zA-Z-]+((>|&gt;){0,1}))/g, "");
      let regexp_ = /<span(\S|\s)*?<\/span>/g;
      let data_ = value.match(regexp_);
      if (data_ && data_.length) {
        let res = data_[0].match(regexp);
        value = res && res.length ? res[0] : "";
        return this.data[value] ? this.data[value] : value;
      } else {
        return this.data[value] ? this.data[value] : value;
      }
    },
    getIsChildren(item) {
      let regular = /data-tag=[\"|'](.*?)[\"|']/gi;
      let quotes = /["|'](.*)["|']/;
      let data = item.match(regular);
      if (data && data.length) {
        let res = data[0].match(quotes);
        data = res && res.length ? res[1] : "";
        if (data) {
          const dataTag = data.split(".")[0];
          if (dataTag && dataTag !== "headTable" && dataTag !== "null")
            return true;
        }
      }
    },
    getJsBarcode(value, id, width, height) {
      if (!value) return;
      JsBarcode(id, value, {
        width: width ? width : 4,
        height: height ? height : 80,
        displayValue: false
      });
    },
    getJsQrcode(value, id, width, height) {
      if (!value) return;
      let qrcode = new QRCode(document.getElementById(id), {
        width: width ? width : 265,
        height: height ? height : 265, // 高度
        text: value, // 二维码内容
        correctLevel: QRCode.CorrectLevel.H //容错级别 容错级别有：（1）QRCode.CorrectLevel.L （2）QRCode.CorrectLevel.M （3）QRCode.CorrectLevel.Q （4）QRCode.CorrectLevel.H
      });
    },
    replaceAll(data, replace, value) {
      const lenr = replace.length;
      const len = data.length;
      let newData = "";
      let i = 0;
      for (i; i < len; i++) {
        let k = 0;
        let string = "";
        for (k; k < lenr; k++) {
          var n = i + k;
          string += data[n];
        }
        if (string === replace) {
          newData += value;
          i = i + lenr;
        }
        newData += data[i];
      }
      return newData;
    },
    word() {
      let print = this.$refs.tsPrint.innerHTML;
      const blob = new Blob([print], {
        type: ""
      });
      const name = this.fullName ? `${this.fullName}.doc` : "下载文档.doc";
      this.downloadFile(blob, name);
    },
    downloadFile(data, name, type) {
      let blob = new Blob([data], {
        type: type || ""
      });
      let downloadElement = document.createElement("a");
      let href = window.URL.createObjectURL(blob);
      downloadElement.href = href;
      downloadElement.download = name;
      document.body.appendChild(downloadElement);
      downloadElement.click();
      document.body.removeChild(downloadElement);
      window.URL.revokeObjectURL(href);
    },
    print() {
      let print = this.$refs.tsPrint.innerHTML;
      print = print + `<style>html * {word-break:break-all}</style>`;
      let iframe = document.createElement("IFRAME");
      document.body.appendChild(iframe);
      iframe.setAttribute(
        "style",
        "position:absolute;width:0px;height:0px;left:-500px;top:-500px;"
      );
      iframe.contentWindow.focus();
      let doc = iframe.contentWindow.document;
      let _this = this
      iframe.onload = function () {
        let oldTitle = document.title;
        iframe.contentWindow.onafterprint = function (e) {
          // 插入日志
          let title = oldTitle.split('-')[0]
          let data = {
            printTitle: _this.fullName ? _this.fullName : title,
            printNum: _this.batchIds.split(",").length,
            printId: _this.id
          }
          request({
            url: `/api/system/printLog/save`,
            method: "post",
            data
          }).then((res) => {
          });

        };
        document.title = "JNPF快速开发平台";
        iframe.contentWindow.print();
        document.title = oldTitle;
        document.body.removeChild(iframe);
      };
      doc.write(print);
      doc.close();
    }
  }
};
</script>
<style lang="scss" scoped>
.main {
  overflow: scroll;
}
.print-content {
  background: white;
  padding: 40px 30px;
  margin: 20px auto 0;
  border: 1px solid #ccc;
  height: calc(100% - 10px);
  border-radius: 4px;
  width: 776px;
  height: 100%;
  overflow: auto;
}
.header-page {
  vertical-align: middle;
  .el-button {
    margin: 0 10px;
  }
  .page-size {
    margin-left: 10px;
    font-size: 18px;
    font-weight: 400;
    color: #333;
  }
}
</style>
