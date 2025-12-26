<template>
  <div>
    <el-dialog
      title="现金流量"
      :visible="visible"
      :close-on-click-modal="false"
      class="JNPF-dialog  "
      lock-scroll
      append-to-body
      width="1100px"
      :modal-append-to-body="false"
      @close="$emit('update:visible', false)"
      destroy-on-close
    >
      <div class="page-table">
        <div class="btn-tool" v-if="!readonly">
          <el-button size="mini" @click="addRow">增行</el-button>
        </div>
        <vxe-table
          ref="table"
          border="full"
          size="small"
          resizable
          show-overflow
          height="560px"
          :data="tableData"
          show-header
          :row-config="{ isCurrent: true, isHover: true }"
          :edit-config="editConfig"
          header-row-class-name="table-header"
          :checkbox-config="{ range: true, highlight: true }"
        >
          <vxe-column width="2" />
          <vxe-column
            field="detailIndex"
            title=""
            width="80"
            :edit-render="{ autofocus: '.vxe-input--inner' }"
          >
            <template #header>
              <span class="red">*</span>分录号
            </template>
            <template #edit="{ row }">
              <vxe-input
                v-model="row.detailIndex"
                type="integer"
                min="1"
                @blur="setIndex($event, row)"
              />
            </template>
          </vxe-column>
          <vxe-column field="accountName" title="会计科目" width="150" />
          <vxe-column field="fzhs" title="辅助核算" width="150" />
          <vxe-column
            field="innercorpCodeText"
            title="内部单位"
            :edit-render="{ autofocus: '.vxe-input--inner' }"
            width="150"
          >
            <template #edit="{ row }">
              <vxe-pulldown :ref="'unitPulldownRef' + row.detailIndex">
                <template #default>
                  <vxe-input
                    type="text"
                    v-model="row.innercorpCode"
                    placeholder="内部单位"
                    suffix-icon="vxe-icon-menu"
                    @focus="
                      focusEvent($refs['unitPulldownRef' + row.detailIndex])
                    "
                    @change="
                      $refs['unitTree' + row.detailIndex].filter($event.value)
                    "
                  />
                </template>
                <template #dropdown>
                  <div class="dropdown-box">
                    <el-tree
                      :ref="'unitTree' + row.detailIndex"
                      class="tree-line"
                      :indent="0"
                      :data="workUnit"
                      :props="{ label: 'push_title' }"
                      :filter-node-method="filterNode"
                      default-expand-all
                      @node-click="
                        (data, node, ref) =>
                          handleNodeClick(
                            data,
                            node,
                            ref,
                            row,
                            'innercorpCode',
                            'innercorpCodeText',
                            $refs['unitPulldownRef' + row.detailIndex]
                          )
                      "
                    />
                  </div>
                </template>
              </vxe-pulldown>
            </template>
          </vxe-column>
          <vxe-column title="" width="100">
            <template #header>
              <span class="red">*</span>币种
            </template>
            人民币
          </vxe-column>
          <vxe-column title="" width="80">
            <template #header>
              <span class="red">*</span>方向
            </template>
            <template #default="{ row }">
              {{ row.creditAmount ? "贷" : "借" }}
            </template>
          </vxe-column>
          <vxe-column
            field="mainCodeText"
            title="主表项"
            :edit-render="{ autofocus: '.vxe-input--inner' }"
            width="150"
          >
            <template #edit="{ row }">
              <vxe-pulldown :ref="'mainPulldownRef' + row.detailIndex">
                <template #default>
                  <vxe-input
                    type="text"
                    v-model="row.mainCode"
                    placeholder="现金流量项目"
                    suffix-icon="vxe-icon-menu"
                    @focus="
                      focusEvent($refs['mainPulldownRef' + row.detailIndex])
                    "
                    @change="
                      $refs['mainTree' + row.detailIndex].filter($event.value)
                    "
                  />
                </template>
                <template #dropdown>
                  <div class="dropdown-box">
                    <el-tree
                      :ref="'mainTree' + row.detailIndex"
                      class="tree-line"
                      :indent="0"
                      :data="mainTable"
                      :props="{ label: 'push_title' }"
                      :filter-node-method="filterNode"
                      default-expand-all
                      @node-click="
                        (data, node, ref) =>
                          handleNodeClick(
                            data,
                            node,
                            ref,
                            row,
                            'mainCode',
                            'mainCodeText',
                            $refs['mainPulldownRef' + row.detailIndex]
                          )
                      "
                    />
                  </div>
                </template>
              </vxe-pulldown>
            </template>
          </vxe-column>
          <vxe-column
            field="subCodeText"
            title="副表项"
            :edit-render="{ autofocus: '.vxe-input--inner' }"
            width="150"
          >
            <template #edit="{ row }">
              <vxe-pulldown :ref="'subPulldownRef' + row.detailIndex">
                <template #default>
                  <vxe-input
                    type="text"
                    v-model="row.subCode"
                    placeholder="现金流量项目"
                    suffix-icon="vxe-icon-menu"
                    @focus="
                      focusEvent($refs['subPulldownRef' + row.detailIndex])
                    "
                    @change="
                      $refs['subTree' + row.detailIndex].filter($event.value)
                    "
                  />
                </template>
                <template #dropdown>
                  <div class="dropdown-box">
                    <el-tree
                      :ref="'subTree' + row.detailIndex"
                      class="tree-line"
                      :indent="0"
                      :data="subTable"
                      :props="{ label: 'push_title' }"
                      :filter-node-method="filterNode"
                      default-expand-all
                      @node-click="
                        (data, node, ref) =>
                          handleNodeClick(
                            data,
                            node,
                            ref,
                            row,
                            'subCode',
                            'subCodeText',
                            $refs['subPulldownRef' + row.detailIndex]
                          )
                      "
                    />
                  </div>
                </template>
              </vxe-pulldown>
            </template>
          </vxe-column>
          <vxe-column
            field="amount"
            title="原币"
            :edit-render="{ autofocus: '.vxe-input--inner' }"
            width="150"
          >
            <template #edit="{ row }">
              <vxe-input
                v-model="row.amount"
                @blur="onBlurAmount($event, row)"
                type="float"
              />
            </template>
          </vxe-column>
          <vxe-column
            field="localamount"
            title="本币"
            :edit-render="{ autofocus: '.vxe-input--inner' }"
            width="150"
          >
            <template #edit="{ row }">
              <vxe-input
                v-model="row.localamount"
                @blur="onBlurLocal($event, row)"
                type="float"
              />
            </template>
          </vxe-column>
          <vxe-column title="操作" fixed="right" width="80" v-if="!readonly">
            <template #default="{row}">
              <span class="text-btn" @click="removeRow(row)">删行</span>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
      <span slot="footer" class="dialog-footer" v-if="!readonly">
        <el-button @click="$emit('update:visible', false)">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getModelList } from "@/api/onlineDev/visualDev";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    tbData: {
      type: Array,
      default: []
    }
  },
  computed: {
    editConfig() {
      if (this.readonly) {
        return {};
      }
      return { trigger: "click", mode: "row", showIcon: false };
    }
  },
  data() {
    return {
      tableData: [],
      workUnit: [],
      mainTable: [],
      subTable: []
    };
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        let arr = [];
        this.tbData.forEach(item => {
          if (item.cashflow) {
            item.cashflow.forEach(e => {
              e.accountName = item.accountName;
              e.fzhs = item.fzhs;
              e.detailIndex = item.detailIndex;
            });
            arr.push(...item.cashflow);
          }
        });
        this.tableData = arr;
      }
    }
  },
  mounted() {
    // 内部单位
    this.$store
      .dispatch("cache/getFormInfoByCode", "nbdw")
      .then(({ id, menuId }) => {
        getModelList(id, {
          pageSize: -1,
          menuId
        }).then(res => {
          this.workUnit = res.data.list;
        });
      });
    // 主表项
    this.$store
      .dispatch("cache/getFormInfoByCode", "xjllxma6517")
      .then(({ id, menuId }) => {
        getModelList(id, {
          pageSize: -1,
          menuId,
          queryJson: JSON.stringify({ ismain: [1] })
        }).then(res => {
          this.mainTable = res.data.list;
        });
      });
    // 副表项
    this.$store
      .dispatch("cache/getFormInfoByCode", "xjllxma6517")
      .then(({ id, menuId }) => {
        getModelList(id, {
          pageSize: -1,
          menuId,
          queryJson: JSON.stringify({ ismain: [0] })
        }).then(res => {
          this.subTable = res.data.list;
        });
      });
  },

  methods: {
    addRow() {
      // 获取当前时间戳
      const t = new Date().getTime();
      this.$refs.table.insertAt([{ rowId: t }], -1);
    },
    removeRow(row) {
      this.$refs.table.remove(row);
    },
    // 输入分录号
    setIndex(event, row) {
      if (row.oldIndex == event.value) {
        // 修改同一行数据
        return;
      }
      if (!event.value) {
        return;
      }
      row.oldIndex = event.value;
      // 根据分录号从制单表格中把该号码的数据取出来，回显
      const i = this.tbData.findIndex(item => item.detailIndex == event.value);
      if (i > -1) {
        let data = this.tbData[i];
        row.accountName = data.accountName;
        row.fzhs = data.fzhs;
        // 相同分录号下的各自原币和各自本币金额默认相加总和分别等于制单中的原币和本币
        let yb = 0,
          bb = 0;
        const { tableData } = this.$refs.table.getTableData();
        tableData.forEach(item => {
          if (item.detailIndex == event.value) {
            yb += +item.amount; // 原币
            bb += +item.localamount; // 本币
          }
        });
        if (+data.amount > 0) {
          row.amount = (data.amount - yb).toFixed(2);
        } else {
          row.amount = "0.00";
        }

        row.localamount = (data.amount - bb).toFixed(2);
        row.creditAmount = data.creditAmount;
        row.groupamount = row.localamount;
        row.globalamount = row.localamount;
      } else {
        this.$message.warning("分录号过大");
      }
    },
    focusEvent($pulldown) {
      if ($pulldown) {
        $pulldown.showPanel();
      }
    },
    handleNodeClick(data, node, ref, row, code, text, $pulldown) {
      if (node.isLeaf) {
        row[code] = data.push_code;
        row[text] = data.push_title;
        $pulldown.hidePanel();
      }
    },
    onBlurAmount(e, row) {
      row.localamount = e.value;
    },
    onBlurLocal(e, row) {
      if (!+row.amount) {
        row.amount = e.value;
      }
    },
    filterNode(value, data) {
      console.log(value, data);
      if (!value) return true;
      console.log(data.push_title.indexOf(value) !== -1);
      return data.push_title.indexOf(value) !== -1;
    },
    // 提交
    submit() {
      let map = {};
      // 只提交有主表项或者副表项的数据
      const { tableData } = this.$refs.table.getTableData();
      tableData.forEach(item => {
        if (item.mainCode || item.subCode) {
          if (!map[item.detailIndex]) {
            map[item.detailIndex] = {
              list: [],
              str: ""
            };
          }
          map[item.detailIndex].str = `${map[item.detailIndex].str}${
            item.mainCodeText
              ? `【${item.mainCodeText}： ${item.localamount}】`
              : ""
          } ${
            item.subCodeText
              ? `【${item.subCodeText}： ${item.localamount}】`
              : ""
          }`;
          map[item.detailIndex].list.push({ ...item });
        }
      });
      this.tbData.forEach(item => {
        if (map[item.detailIndex]) {
          item.cashflow = map[item.detailIndex].list;
          item.xjll = map[item.detailIndex].str;
        } else {
          item.cashflow = [];
          item.xjll = "";
        }
      });
      this.$emit("update:visible", false);
    }
  }
};
</script>
<style lang="scss" scoped>
.btn-tool {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 12px;
}
.text-btn {
  color: #0245c4;
  font-size: 12px;
  cursor: pointer;
}
.suffix-clickable {
  cursor: pointer;
}
::v-deep .red {
  color: #de3434;
}
// ::v-deep .table-header {
//   height: 27px;
//   box-sizing: border-box;
//   font-size: 12px;
//   font-weight: 600;
//   color: #4b4b4b;
//   background-color: #f7f9fd;
// }
::v-deep .vxe-table--render-default .vxe-table--border-line {
  border-color: #c6ccd7;
  border-radius: 3px;
}
// ::v-deep .vxe-header--column {
//   line-height: 12px;
// }
::v-deep .vxe-input.size--small {
  height: 38px;
  line-height: 38px;
  box-sizing: border-box;
}
::v-deep .vxe-input--inner {
  border: 0;
  border-radius: 0;
  outline: none;
}
::v-deep
  .vxe-table--render-default.vxe-editable:hover
  .vxe-body--column.col--active:hover,
::v-deep .vxe-table--render-default.vxe-editable .vxe-body--column.col--active {
  border: 1px solid #4b8cff;
}
::v-deep .col--edit .vxe-cell {
  padding: 0;
}
::v-deep .vxe-input:not(.is--disabled).is--active .vxe-input--inner {
  border: 0;
}
::v-deep .vxe-table--render-default .vxe-body--row.row--current {
  background-color: #e9f0fa;
}
::v-deep .el-dialog__header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 16px 20px;
}
::v-deep .el-dialog__title {
  font-size: 15px;
  padding-left: 12px;
  &::before {
    left: 0;
  }
}
::v-deep .el-dialog__body {
  padding: 15px 20px;
}
::v-deep .vxe-cell {
  font-size: 12px;
}
::v-deep .vxe-cell--label {
  margin: 0 10px;
}
.dropdown-box {
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.16);
  padding: 12px 18px 12px 0;
  max-height: 400px;
  overflow: auto;
  background-color: #fff;
}
::v-deep .el-tree-node__label {
  font-size: 12px;
}
// ::v-deep .vxe-cell:before {
//   content: '';
//   position: absolute;
//   top: -1px;
//   right: -1px;
//   bottom: -1px;
//   left: -1px;
//   pointer-events: none;
//   border-width: 1px;
//   border-style: solid;
//   border-color: red;
//   border-image: initial;
//   background-color: #f9eeee;
// }
// ::v-deep .el-tree-node__content {
//   padding-right: 18px;
// }
::v-deep .tree-line {
  .el-tree-node {
    position: relative;
    padding-left: 16px; // 缩进量
  }
  .el-tree-node__children {
    padding-left: 16px; // 缩进量
  }

  // 竖线
  .el-tree-node::before {
    content: "";
    height: 100%;
    width: 1px;
    position: absolute;
    left: -3px;
    top: -26px;
    border-width: 1px;
    border-left: 1px dashed #c2ccdb;
  }
  // 当前层最后一个节点的竖线高度固定
  .el-tree-node:last-child::before {
    height: 38px; // 可以自己调节到合适数值
  }

  // 横线
  .el-tree-node::after {
    content: "";
    width: 24px;
    height: 20px;
    position: absolute;
    left: -3px;
    top: 12px;
    border-width: 1px;
    border-top: 1px dashed #c2ccdb;
  }

  // 去掉最顶层的虚线，放最下面样式才不会被上面的覆盖了
  & > .el-tree-node::after {
    border-top: none;
  }
  & > .el-tree-node::before {
    border-left: none;
  }
  .is-leaf {
    margin: 0 8px;
  }
  .is-leaf:before {
    content: "";
    position: absolute;
    width: 5px;
    height: 5px;
    background-color: #555;
    border-radius: 50%;
    top: 50%;
    margin-top: -2px;
  }
  // 展开关闭的icon
  .expanded.el-tree-node__expand-icon {
    font-size: 16px;
    transform: rotate(0);
    &:before {
      content: "\e781";
    }
    // // 叶子节点（无子节点）
    // &.is-leaf{
    //   color: transparent;
    //   // display: none; // 也可以去掉
    // }
  }
  .el-tree-node__expand-icon {
    font-size: 16px;
    color: #d2bb1e;
    &:before {
      content: "\e783";
    }
    // 叶子节点（无子节点）
    &.is-leaf {
      &:before {
        content: "";
      }
    }
  }
}
</style>
