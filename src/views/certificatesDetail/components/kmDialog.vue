<template>
  <el-dialog
    title="会计科目"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center nopd"
    lock-scroll
    append-to-body
    width="1000px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <div class="con-center">
      <div class="left">
        <div class="search-wrapper">
          <el-input placeholder="输入关键字进行过滤" v-model="filterText" />
        </div>
        <div class="tree-wrapper">
          <el-tree
            ref="tree"
            class="tree"
            :data="treeData"
            show-checkbox
            highlight-current
            node-key="id"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @check-change="onCheckChange"
            @current-change="onCurrentChange"
          />
        </div>
      </div>
      <div class="split" />
      <div class="right">
        <div class="detail-info">
          <div class="kv">
            <span class="k">科目编码：</span><span class="v">{{ current.code }}</span>
          </div>
          <div class="kv">
            <span class="k">科目名称：</span><span class="v">{{ current.name }}</span>
          </div>
          <div class="kv">
            <span class="k">科目类型：</span><span class="v">{{ kMap[current.subAttr] }}</span>
          </div>
          <div class="kv">
            <span class="k">科目方向：</span><span class="v">{{ dMap[current.balDir] }}</span>
          </div>
        </div>
        <div class="table-wrapper">
          <vxe-table
            ref="table"
            border
            size="small"
            resizable
            show-overflow
            height="auto"
            :data="tableData"
            :row-config="{isCurrent: false, isHover: true}"
          >
            <vxe-column type="seq" width="60" title="序号" />
            <vxe-column field="code" title="辅助核算项编码" />
            <vxe-column field="name" title="辅助核算项名称" />
            <!-- <vxe-column field="fx" title="余额方向控制" /> -->
          </vxe-table>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <div>
        <el-button type="text">已选：{{ checked.length }}</el-button>
      </div>
      <div>
        <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
        <el-button type="primary" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import debounce from 'lodash.debounce'
import { list2tree } from '@/utils/ext'
import { getBalanceDirectionEnum, getFinAssistAccountingList, getFinUnitSubjectEntityList, getSubjectAttributeEnum } from '@/api/business/youBIP'

const addExtraProps = (ele, parentCodes = [], parentNames = []) => {
  ele.codes = [...parentCodes, ele.code];
  ele.names = [...parentNames, ele.name];
  ele.label = `${ele.code} ${ele.name}`
  if (ele.children) {
    for (let i = 0; i < ele.children.length; i++) {
      addExtraProps(ele.children[i], ele.codes, ele.names);
    }
  }
}
export default {
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      tableData: [],
      treeData: [],
      filterText: "",
      checked: [],
      current: {},
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 科目map, key是科目id
      kmAllMap: {},
      // 辅助核算map , key是辅助核算项id
      assMap: {},
      // 科目类型map
      kMap: {},
      // 科目方向map
      dMap: {}
    }
  },
  watch: {
    visible(n) {
      if (n) {
        if (this.treeData.length === 0) {
          this.loadTreeData();
        }
      } else {
        this.filterText = '';
        this.checked = [];
      }
    },
    filterText(val) {
      this.$refs.tree && this.$refs.tree.filter(val);
    }
  },
  mounted() {
    this.loadBalanceDirection();
    this.loadFinAssistAccountingList();
  },
  methods: {
    onCheckChange: debounce(function() {
      this.checked = this.$refs.tree.getCheckedKeys(true)
    }),
    onCurrentChange(node) {
      const temp = node || {};
      this.current = temp.type === 'attr' ? {} : temp;
      this.tableData = (this.current.relations || []); // .map(v => this.assMap[v.assistAccountingId]).filter(v => !!v);
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1 || `${data.memCode}`.indexOf(value) !== -1;
    },
    async loadTreeData() {
      // 先拉去分类枚举; attr ===> [ {code,name} ,...]
      const attr = (await getSubjectAttributeEnum()).data || [];
      const tempMap = {};
      attr.forEach(v => {
        tempMap[v.code] = v.name
      })
      this.kMap = tempMap;
      // 生成顶层节点(科目分类)
      const topTree = attr.map(v => ({ id: `attr__${v.code}`, type: 'attr', code: v.code, name: v.name, label: `${v.name}`, children: [] }));
      // 拉取科目列表(全量)
      const list = (await getFinUnitSubjectEntityList()).data || [];
      const kmAllMap = {};
      list.forEach(v => {
        kmAllMap[v.id] = v;
        if (v.relations && v.relations.length > 0) {
          v.relations.forEach(d => {
            const detail = this.assMap[d.assistAccountingId];
            if (detail) {
              Object.assign(d, { ...detail, ...d })
            }
          })
        }
      })
      this.kmAllMap = kmAllMap;
      // 将科目list转为tree
      const tree = list2tree(list, null, { rowField: 'code', parentField: 'parentCode', childField: 'children' })
      // 将科目树的每个根节点塞到对应的顶级分类内
      tree.forEach(v => {
        addExtraProps(v);
        const i = attr.findIndex(vv => vv.code === v.subAttr);
        if (i >= 0) {
          topTree[i].children.push(v)
        }
      })
      this.treeData = topTree.filter(v => v.children && v.children.length > 0);
    },
    // 加载 科目方向枚举
    async loadBalanceDirection() {
      const arr = (await getBalanceDirectionEnum()).data || [];
      const ret = {};
      arr.forEach(v => {
        ret[v.code] = v.name
      })
      this.dMap = ret;
      return ret;
    },
    // 加载 辅助核算(全量)
    async loadFinAssistAccountingList() {
      const arr = (await getFinAssistAccountingList()).data || [];
      const ret = {};
      arr.forEach(v => {
        ret[v.id] = v
      })
      this.assMap = ret;
      return ret;
    },
    onConfirm() {
      if (this.checked.length === 0) return this.$message.warning("请选择科目")
      const ret = this.checked.map(id => this.kmAllMap[id])
      this.$emit("confirm", ret)
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    }
  },
}
</script>
<style lang="scss" scoped>
.con-center {
  width: 100%;
  height: 61.8vh;
  display: flex;
  padding: 20px;
  box-sizing: border-box;
  .left, .right {
    position: relative;
    height: 100%;
    overflow: auto;
  }
  .left {
    min-width: 30%;
    box-sizing: border-box;
    padding-top: 40px;
    .search-wrapper {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 40px;
    }
    .tree-wrapper {
      width: 100%;
      height: 100%;
      overflow: auto;
      .tree {
      }
    }
  }
  .split {
    margin: 0 5px;
    width: 1px;
    height: 100%;
    background-color: #dcdfe6;
  }
  .right {
    flex: 1;
    min-width: 400px;
    display: flex;
    flex-flow: column;
    .detail-info {
      color: #000000;
      display: flex;
      flex-wrap: wrap;
      .kv {
        width: 50%;
        padding: 5px;
        display: flex;
        box-sizing: border-box;
        font-size: 12px;
        font-weight: 400;
        .k {
          white-space: nowrap;
        }
        .v {

        }
      }
    }
    .table-wrapper {
      flex: 1;
    }
  }
}
.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
::v-deep .el-tree-node {
  .el-checkbox {
    display: none;
  }
  .is-leaf + .el-checkbox {
    display: inline-block;
  }
}
</style>
