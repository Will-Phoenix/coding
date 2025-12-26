<template>
  <div class="print-template-detail">
    <div class="print-template-detail__body">
      <div class="system-view-nav">
        <el-scrollbar class="left-scrollbar">
          <div class="JNPF-common-title">
            <h2>表单字段</h2>
          </div>
          <el-tree
            :data="newData"
            default-expand-all
            :props="defaultProps"
            @node-click="handleNodeClick"
          ></el-tree>
          <div class="JNPF-common-title sys-title">
            <h2>系统字段</h2>
          </div>
          <el-tree
            :data="newSysData"
            default-expand-all
            :props="defaultProps"
            @node-click="handleNodeClick"
          ></el-tree>
        </el-scrollbar>
      </div>
      <div class="system-view-content">
        <ts-designer-tinymce
          v-model="content"
          ref="createTinymce"
          :height="richHeight"
          :init="initConfig"
          class="rich-txt"
        />
      </div>
      <pageSize ref="pageSize" v-model="pageParam" @change="getEditConfig"></pageSize>
    </div>
  </div>
</template>

<script>
import TsDesignerTinymce from "./ts-designer-tinymce";
import pageSize from "./pageSize";
export default {
  name: "tsPrintTemplater",
  components: { TsDesignerTinymce, pageSize },
  props: {
    value: String,
    type: Number,
    treeData: {
      type: Array,
      default: () => []
    },
    pageParam: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      showEdit: false,
      tabs: [],
      initConfig: {},
      menuList: [],
      init: {},
      menuIndex: "",
      content: "",
      activeTab: "",
      richHeight: document.documentElement.clientHeight - 42,
      systemData: [
        {
          fullName: "打印人员",
          id: "systemPrinter"
        },
        {
          fullName: "打印时间",
          id: "systemPrintTime"
        },
        {
          fullName: "审批内容",
          id: "systemApprovalContent"
        },
        {
          fullName: "图片",
          id: "img"
        },
        {
          fullName: "二维码",
          id: "qrCode"
        },
        {
          fullName: "条形码",
          id: "barCode"
        }
      ],
      defaultProps: {
        children: "children",
        label: "fullName"
      }
    };
  },
  computed: {
    editor() {
      return this.$refs.createTinymce.editor;
    },
    newData() {
      return this.treeData;
    },
    newSysData() {
      let data = this.systemData;
      if (this.type == 2) {
        data = this.systemData.filter(o => o.id !== "systemApprovalContent");
      }
      return data;
    }
  },
  watch: {
    pageParam: {
      handler(val) {
        this.getEditConfig(val)
      },
      immediate: true,
      deep: true
    },
    value: {
      handler(val) {
        if (val != this.content) {
          this.content = val;
        }
      },
      immediate: true,
      deep: true
    },
    content() {
      this.$emit("input", this.content);
    }
  },
  mounted() {
    // this.getEditConfig()
  },
  methods: {
    handleNodeClick(item, node) {
      if (item.children != null && item.children.length > 0) return;
      const tableParent = this.getCurrentParentByTag(
        'table[data-wk-table-tag="table"]'
      );
      if (!tableParent) {
        this.editor.insertContent(this.getSpanNode(item, node));
        this.content = this.editor.getContent({ format: "html" });
      }
    },
    getEditConfig(e) {
      if (!e) {
        e = {}
        e.mt = 0
        e.mb = 0
        e.ml = 0
        e.mr = 0
        e.width = 776
        e.height = 'calc(100% - 10px)'
      }
      this.$emit("pageParamChange", e)
      let mt = e.mt
      let mb = e.mb
      let ml = e.ml
      let mr = e.mr
      let width = e.width ? e.width : 776
      let height = e.height ? e.height : 'calc(100% - 10px)'
      this.initConfig = {
        menubar: false,
        toolbar_sticky: true,
        statusbar: false,
        // extended_valid_elements: 'span[class|title|wktag|style|contenteditable]',
        content_style: `html {
          height: 100%; background: #fff;padding: 20px 0;box-sizing: border-box;

          margin: ${mt}mm!important ${mr}mm ${mb}mm ${ml}mm;
          margin-top:${mt}mm!important;
        }
        body {
          font-family: simsun, serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          padding: 40px 30px;
          width: ${width}mm;
          height: ${height}mm;
          margin: 0 auto !important;
          // border: 1px solid rgb(210, 213, 216);
          background: white;
          min-height: 100%;
          box-sizing: border-box;
          box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
          word-break:break-all;
        }
        .wk-tiny-color--customer {
          color: #005AF3;
        }
        .wk-tiny-color--contacts {
          color: #1CB24C;
        }
        .wk-tiny-color--business {
          color: #FF852F;
        }
        .wk-tiny-color--contract {
          color: #FF4A43;
        }
        .wk-tiny-color--receivables {
          color: #FFAE46;
        }
        .wk-tiny-color--product {
          color: #00D0D4;
        }
        .wk-tiny-color--common {
          color: #2362FB;
        }
        p { margin: 5px 0; line-height: 1.5;}`,
        // content_css: ['/static/tinymce/css/tiny-wk-colors.css', '/static/tinymce/css/tiny-wk-word.css'],
        table_advtab: false,
        table_cell_advtab: false,
        table_row_advtab: false,
        toolbar: {
          type: [String, Array],
          default: "code | lineheight | undo redo "
        },
        setup: editor => {
          let _this = this;
          editor.ui.registry.addButton("page", {
            text: `<i class="el-icon-s-order" style="font-size:18px"></i>`,
            tooltip: "纸张大小",
            onAction: function() {
              _this.$refs.pageSize.dialogFormVisible = true;
            }
          });
          editor.on("init", function() {
            editor.execCommand("mceFocus");
          });
          editor.on("keydown", e => {
            this.selectNodes = null;
            if (
              e.keyCode === 8 /* Backspace key */ ||
              /* del key */ e.keyCode == 46
            ) {
              const currentNode = editor.selection.getNode();
              if (
                currentNode.getAttribute("data-wk-table-td-tag") === "value"
              ) {
                e.preventDefault();
                return false;
              } else if (currentNode.nodeName == "SPAN") {
                if (currentNode.hasAttribute("contenteditable")) {
                  e.preventDefault();
                  editor.dom.remove(currentNode);
                  return false;
                } else {
                  const farterSpan = this.getCurrentParentByTag(
                    "span[contenteditable]"
                  );
                  if (farterSpan) {
                    e.preventDefault();
                    editor.dom.remove(farterSpan);
                    return false;
                  }
                }
              }
            } else if (e.keyCode == "65" && (e.metaKey || e.ctrlKey)) {
              // 全选
              this.selectNodes = editor.selection.getNode();
              this.setSpanEditAttr(this.selectNodes, true);
            } else {
              // table 里面不允许写内容
              const currentNode = editor.selection.getNode();
              if (
                currentNode.getAttribute("data-wk-table-td-tag") === "value"
              ) {
                // 只允许输入上下左右
                if (
                  e.keyCode !== 37 &&
                  e.keyCode !== 38 &&
                  e.keyCode !== 39 &&
                  e.keyCode !== 40
                ) {
                  e.preventDefault();
                  return false;
                }
              } else if (currentNode.nodeName == "SPAN") {
                if (currentNode.hasAttribute("contenteditable")) {
                  if (currentNode.getAttribute("contenteditable")) {
                    e.preventDefault();
                    currentNode.setAttribute("contenteditable", false);
                    return false;
                  }
                  return false;
                } else {
                  const farterSpan = this.getCurrentParentByTag(
                    "span[contenteditable]"
                  );
                  if (farterSpan) {
                    if (farterSpan.getAttribute("contenteditable")) {
                      e.preventDefault();
                      farterSpan.setAttribute("contenteditable", false);
                      return false;
                    }
                    return false;
                  }
                }
              }

              if (
                e.keyCode == 37 &&
                e.keyCode == 38 &&
                e.keyCode == 39 &&
                e.keyCode == 40
              ) {
                this.cancelSpanEdit();
              }
            }
          });

          editor.on("mousedown", () => {
            this.cancelSpanEdit();
          });

          editor.on("mouseup", e => {
            const selection = editor.selection.getSel();
            if (
              e.target.hasAttribute("contenteditable") &&
              selection.anchorOffset == 1 &&
              selection.anchorOffset == 1
            ) {
              // 忽略
            } else if (
              e.target.hasAttribute("contenteditable") &&
              selection.isCollapsed
            ) {
              this.cancelSpanEdit();
            } else {
              if (!selection.isCollapsed) {
                this.selectNodes = editor.selection.getNode();
                this.setSpanEditAttr(this.selectNodes, true);
              } else {
                this.cancelSpanEdit();
              }
            }
          });
        }
      };
    },
    cancelSpanEdit() {
      if (this.selectNodes) {
        setTimeout(() => {
          const selection = this.editor.selection.getSel();
          if (!selection.isCollapsed) {
            this.setSpanEditAttr(this.selectNodes, false);
            this.selectNodes = null;
          }
        }, 300);
      }
    },
    setSpanEditAttr(node, canEdit) {
      if (node && node.hasAttribute("contenteditable")) {
        if (node.getAttribute("contenteditable") != canEdit) {
          node.setAttribute("contenteditable", canEdit);
        }
      }

      if (node && node.children) {
        for (let index = 0; index < node.children.length; index++) {
          const element = node.children[index];
          if (element.children) {
            this.setSpanEditAttr(element, canEdit);
          } else if (element.hasAttribute("contenteditable")) {
            if (node.getAttribute("contenteditable") != canEdit) {
              element.setAttribute("contenteditable", canEdit);
            }
          }
        }
      }
    },
    getCurrentParentByTag(tag) {
      return this.editor.dom.getParent(this.editor.selection.getNode(), tag);
    },
    getSpanNode(item, node) {
      const parent =
        node.parent.data != null && node.parent.data.id != null
          ? node.parent.data.id
          : "null";
      if (item.id == "img" || item.id == "barCode" || item.id == "qrCode") {
        return `&lt;${item.id} width='100' height='100'&gt;&lt;/${item.id}&gt;`;
      }
      return `<span data-tag="${parent}.${item.id
      }" class="wk-print-tag-wukong ${this.getSpanColorClass()}" contenteditable="false">{${item.id
      }}</span>`;
    },
    getSpanColorClass() {
      const color = [
        "customer",
        "contacts",
        "business",
        "contract",
        "receivables",
        "product"
      ].includes(this.activeTab)
        ? this.activeTab
        : "common";
      return `wk-tiny-color--${color}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.print-template-detail {
  height: 100%;
  display: flex;

  &__body {
    flex: 1;
    position: relative;
    display: flex;
    overflow: hidden;
  }
}
.system-view-nav {
  width: 300px;
  position: relative;
  background: #fff;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
  .left-scrollbar {
    height: 100%;

  }
  .JNPF-common-title {
    padding: 0 10px;
    margin-bottom: 10px;
    height: 39px;
    &.sys-title {
      margin-top: 30px;
    }
    h2 {
      font-size: 14px;
      line-height: 39px;
      color: #043254;
      font-weight: bold;
    }
  }
}
.system-view-content {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  border-radius: 4px;
  ::v-deep .tox-tinymce {
    border: none;
  }
}
.xr-reminder {
  ::v-deep .reminder-body {
    align-items: stretch;
    width: 100%;
    height: 35px;
    line-height: 35px;
    border-radius: 0;
  }
}
</style>
