<template>
  <div class="ii">
    <el-dialog
      :title="title"
      :close-on-click-modal="false"
      class="JNPF-dialog JNPF-dialog_center"
      lock-scroll
      :modal-append-to-body="false"
      destroy-on-close
      :visible="visible"
      @update:visible="updateVisible"
    >
      <vxe-table
        border
        resizable
        show-overflow
        ref="table"
        size="small"
        :edit-rules="validRules"
        :data="tableData"
        :edit-config="{trigger: 'click', mode: 'cell', beforeEditMethod: activeCellMethod}"
      >
        <vxe-column field="m_checktypecode" title="核算类型编码" width="120">
          <template #default="{ row }">
            <span>{{ row.m_checktypecode }}</span>
          </template>
        </vxe-column>
        <vxe-column field="m_checktypename" title="核算类型名称" width="200">
          <template #default="{ row }">
            <span>{{ row.isMustFillIn === 1 ? "*": "" }}{{ row.m_checktypename }}</span>
          </template>
        </vxe-column>
        <vxe-column field="m_checkvaluename" title="核算内容" :edit-render="{placeholder: '请选择'}">
          <template #default="{ row }">
            <span>{{ row.m_checkvaluename }}</span>
          </template>
          <template #edit="{ row, rowIndex }">
            <vxe-pulldown ref="pulldownRef" popup-class-name="my-dropdown4" transfer style="width: 100%">
              <template #default>
                <vxe-input
                  v-model="row.m_checkvaluename"
                  readonly
                  suffix-icon="vxe-icon-table"
                  placeholder="请选择"
                  style="width: 100%"
                  @click="focusEvent(row, rowIndex)"
                  @suffix-click="focusEvent(row, rowIndex)"
                />
              </template>
              <template #dropdown>
                <div class="my-bodydown4">
                  <vxe-input v-model="filterName" style="width: 100%; margin-bottom: 5px" type="search" placeholder="输入搜索内容" @search-click="searchEvent(row, rowIndex)" @keydown.enter.native="searchEvent(row, rowIndex)" />
                  <vxe-grid
                    ref="table2"
                    class="mytable-scrollbar"
                    border
                    auto-resize
                    height="350"
                    size="small"
                    :row-config="{isHover: true, keyField: 'id', useKey: true}"
                    :column-config="{useKey: true}"
                    :tree-config="treeConfig"
                    :loading="loading"
                    :data="list2"
                    :columns="tableColumn"
                    @cell-click="cellClickEvent"
                  />
                </div>
              </template>
            </vxe-pulldown>
          </template>
        </vxe-column>
      </vxe-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
        <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
      </span>
    </el-dialog>
  </div>

</template>
<script>
import { getModelList, getConfigData } from "@/api/onlineDev/visualDev";
import { getAssistAccountingBySubject } from "@/api/business/youBIP";
import XEUtils from 'xe-utils'

export default {
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: Object,
      default: () => ({})
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
  },
  data() {
    const checkValueNameValid = ({ row }) => {
      if (row.isMustFillIn === 1 && !row.m_checkvaluecode) {
        return new Error('该项核算内容必须填写');
      }
    };
    return {
      loading: false,
      tableData: [],
      sexList: [
        { label: '', value: '' },
        { label: '男', value: '1' },
        { label: '女', value: '0' }
      ],
      treeConfig: undefined,
      tableColumn: [
        // { type: 'checkbox', width: 80 },
        // { field: 'name', title: 'Name' },
        // { field: 'role', title: 'Role' },
        // { field: 'sex', title: 'Sex' }
      ],
      tableData2: [],
      list2: [], // tableData2筛选后的list
      filterName: "", // 搜索值绑定
      tableList: [],
      currentIndex: 0,
      currentSelectLastFlag: 0,
      validRules: {
        m_checkvaluename: [
          // { required: true, trigger: "manual", message: "该项核算内容必须填写" }
          { validator: checkValueNameValid, trigger: "blur" }
        ],
      }
    }
  },
  computed: {
    title() {
      return '辅助核算';
    },
  },
  watch: {
    visible(n) {
      if (n) {
        if (this.data.assvos) {
          this.tableData = [...this.data.assvos];
        } else {
          getAssistAccountingBySubject(this.data.accountCode).then(res => {
            console.log("查到的辅助核算", res.data);
            this.tableData = res.data.map(v => ({ m_checktypecode: v.code, m_checktypename: v.name, m_checkvaluecode: "", m_checkvaluename: "", isMustFillIn: v.isMustFillIn, isMustSelectLast: v.isMustSelectLast, dynamicFormId: v.dynamicFormId }));
          });
        }
      } else {
        this.tableData = [];
      }
    }
  },
  created() {},
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.table.validate(this.tableData.filter(v => v.isMustFillIn === 1)).then(ErrMap => {
        if (ErrMap) {
          this.$message.warning("有必填的辅助核算项未填写");
        } else {
          this.$message.success("操作成功");
          this.$emit("confirm", this.tableData);
          this.updateVisible(false);
        }
      });
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    activeCellMethod({ columnIndex }) {
      return columnIndex === 2;
    },
    async getColumnById(id) {
      const res = await getConfigData(id);
      // console.log("column结果", JSON.parse(res.data.formData));
      const columnData = JSON.parse(res.data.columnData);
      let columnList = columnData.columnList.map(v => ({ field: v.prop, title: v.label, minWidth: 100, type: "html" }))
      // 当前不先支持多选
      // columnList.unshift({ type: 'checkbox', width: 80 });
      if (`${columnData.type}` === `5`) {
        columnList[0].treeNode = true;
        this.treeConfig = {
          expandAll: false,
          rowField: columnData.treePropsValue,
          parentField: columnData.parentField,
          childrenField: columnData.treePropsChildren,
          showLine: true,
        }
      }
      console.log("列表字段", columnList);
      this.tableColumn = columnList;
    },
    async getTableList(id, menuId, filterName = "") {
      await getModelList(id, { currentPage: 1, pageSize: 100, menuId, queryJson: JSON.stringify({ push_title: filterName }) }).then(res => {
        this.tableList = res.data.list;
      });
    },
    async focusEvent(row, index) {
      this.filterName = "";
      this.loading = true;
      await this.getColumnById(row.dynamicFormId);
      await this.getTableList(row.dynamicFormId, row.menuId, this.filterName);
      this.tableData2 = this.tableList.slice(0);
      this.currentIndex = index;
      this.currentSelectLastFlag = row.isMustSelectLast;
      this.loading = false;
      // setTimeout(() => {
      //   this.loading = false;
      //   if (this.searchName) {
      //     this.tableData2 = this.tableList.filter((row) => row[this.tableColumn[0].field].indexOf(this.searchName) > -1)
      //   } else {
      //     this.tableData2 = this.tableList.slice(0)
      //   }
      // }, 100);
      const $pulldown = this.$refs.pulldownRef;
      if ($pulldown) {
        $pulldown.showPanel();
      }
      this.searchEvent();
    },
    suffixClick() {
      const $pulldown = this.$refs.pulldownRef;
      if ($pulldown) {
        $pulldown.togglePanel();
      }
    },
    cellClickEvent({ row }) {
      const $pulldown = this.$refs.pulldownRef;
      if ($pulldown) {
        if (row.children && this.currentSelectLastFlag === 1 && row.children.length > 0) {
          this.$refs.table2.toggleTreeExpand(row);
        } else {
          this.tableData[this.currentIndex].m_checkvaluecode = row["push_code"].replace("<span class=\"keyword-lighten\">", "").replace("</span>", "");
          this.tableData[this.currentIndex].m_checkvaluename = row["push_title"].replace("<span class=\"keyword-lighten\">", "").replace("</span>", "");
          $pulldown.hidePanel();
        }
      }
    },
    async searchEvent(row) {
      const filterName = XEUtils.toValueString(this.filterName).trim().toLowerCase()
      if (filterName) {
        // const filterRE = new RegExp(filterName, 'gi')
        // const options = { children: 'children' }
        // const searchProps = this.tableColumn.map(v => v.field)
        // const rest = XEUtils.searchTree(this.tableData2, item => searchProps.some(key => XEUtils.toValueString(item[key]).toLowerCase().indexOf(filterName) > -1), options)
        // XEUtils.eachTree(rest, item => {
        //   searchProps.forEach(key => {
        //     item[key] = XEUtils.toValueString(item[key]).replace(filterRE, match => `<span class="keyword-lighten">${match}</span>`)
        //   })
        // }, options)
        await this.getTableList(row.dynamicFormId, row.menuId, this.filterName);
        this.list2 = this.tableList.slice(0);
        // 搜索之后默认展开所有子节点
        this.$nextTick(() => {
          this.$refs.table2.setAllTreeExpand(true)
        })
      } else {
        this.list2 = this.tableData2
      }
    }
    // 当前先不支持多选
    // selectChangeEvent(row) {
    //   console.log("选择", row);
    //   this.searchName = row.records.map(v => v.name).join(",");
    // },
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__wrapper {
  z-index: 1001 !important;
}
::v-deep .v-modal {
  z-index: 1000 !important;
}
.my-dropdown4 {
  background-color: #fff;
  box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.1);

  .my-bodydown4 {
    background-color: #fff;
    width: 500px;
    padding: 5px;
    /*height: 350px;*/
  }

  .my-footdown4 {
    border-top: 1px solid #e8eaec;
  }
}

::v-deep .keyword-lighten {
  color: #000;
  background-color: #FFFF00;
}
.mytable-scrollbar ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
/*滚动条的轨道*/
.mytable-scrollbar ::-webkit-scrollbar-track {
  background-color: #FFFFFF;
}
/*滚动条里面的小方块，能向上向下移动*/
.mytable-scrollbar ::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
  border: 1px solid #F1F1F1;
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:hover {
  background-color: #A8A8A8;
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:active {
  background-color: #787878;
}
/*边角，即两个滚动条的交汇处*/
.mytable-scrollbar ::-webkit-scrollbar-corner {
  background-color: #FFFFFF;
}
</style>
