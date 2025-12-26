<template>
  <el-dialog
  class="JNPF-dialog JNPF-dialog_center"
    title="过滤规则配置"
    :visible.sync="dialogVisible"
    width="800px"
    append-to-body
    :before-close="handleClose"
  >
    <Condition
      :value="pconditions"
      ref="base"
      :modelType="modelType"
      :columnDataMap="columnDataMap"
      :dataOptionMap="dataOptionMap"
      :columnOptions="columnOptions"
    ></Condition>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script setup></script>

<script>
import { getDrawingList } from "@/components/Generator/utils/db";
import Condition from "./condition";
export default {
  props: {
    modelType: {
      type: [String, Number],
      default: ''
    },
    value: {
      type: Array,
      default: () => []
    },
    columnData: {
      type: Object,
      default: {}
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tempCondition: [],
      columnDataMap: {},
      dataOptionMap: {},
      dialogVisible: false,
      pconditions: [],
      columnOptions: []
    };
  },
  computed: {
    // 未使用的条件个数
    notUseConNum() {
      // 发起人是默认就有得  所以需要加 1
      return this.pconditions.length - this.showingPCons.length + 1;
    },
    usedFormItems() {
      let list = [];
      const loop = (data, parent) => {
        if (!data) return;
        if (
          data.__config__ &&
          data.__config__.jnpfKey !== "table" &&
          data.__config__.children &&
          Array.isArray(data.__config__.children)
        ) {
          loop(data.__config__.children, data);
        }
        if (Array.isArray(data)) data.forEach(d => loop(d, parent));
        if (data.__vModel__ && data.__config__.jnpfKey !== "table")
          list.push(data);
      };
      loop(getDrawingList());
      const formItems = list;
      return formItems;
    }
  },
  created() {},
  mounted() {},
  watch: {
    columnData: {
      handler(val) {
        this.columnOptions = val.columnOptions;
        val.columnOptions.map(item => {
          this.columnDataMap[item.__vModel__] = item;
        });
        // 基本下拉数据
        let arr = val.columnOptions.filter(item =>
          ["radio", "checkbox", "select"].includes(item.__config__.jnpfKey)
        );
        arr.forEach(item => {
          let dataLabel = item.__config__.props.label;
          let dataValue = item.__config__.props.value;
          let options = item.__slot__.options.map(i => {
            return {
              ...i,
              dataLabel: dataLabel,
              dataValue: dataValue
            };
          });
          this.dataOptionMap[item.__vModel__] = { options };
        });
        // 树型数据
        let arrTree = val.columnOptions.filter(item =>
          ["cascader", "treeSelect"].includes(item.__config__.jnpfKey)
        );
        arrTree.forEach(item => {
          this.dataOptionMap[item.__vModel__] = {
            options: item.options,
            props: item.props.props
          };
        });
      },
      deep: true
    }
  },
  methods: {
    init(data) {
      this.pconditions = data[0].pconditions;
      this.tempCondition = JSON.parse(JSON.stringify(this.pconditions));
    },
    validData(flag) {
      let valid = true;
      this.pconditions.forEach(k => {
        if (!["null", "notNull"].includes(k.symbol)) {
          if (!k.field) {
            if (flag != 1) this.$message.warning("条件字段不能为空");
            valid = false;
            return;
          }
          if (!k.symbol) {
            if (flag != 1) this.$message.warning("条件符号不能为空");
            valid = false;
            return;
          }
          if (!k.fieldValue) {
            if (flag != 1) this.$message.warning("数据值不能为空");
            valid = false;
            return;
          }
          if (Array.isArray(k.fieldValue) && k.fieldValue.length == 0) {
            if (flag != 1) this.$message.warning("数据值不能为空");
            valid = false;
            return;
          }
        }
      });
      return valid;
    },
    confirm() {
      // 获取属性配置
      this.$nextTick(() => {
        this.pconditions = this.$refs.base.getData();

        if (!this.validData()) {
          return;
        }
        // 处理精度
        this.pconditions = this.pconditions.map(item => {
          if (item.jnpfKey === "calculate") {
            item.fieldValue = Number(item.fieldValue).toFixed(2);
          }
          return item;
        });
        let cloneConditions = JSON.parse(JSON.stringify(this.pconditions));
        this.$emit("ruleConfig", {
          pconditions: cloneConditions
        });
        this.tempCondition = cloneConditions;

        this.dialogVisible = false;
      });
    },
    handleClose() {
      this.$emit("ruleConfig", {
        pconditions: this.tempCondition
      });
      this.dialogVisible = false;
    },
    show(data) {
      this.dialogVisible = true;
      if (data.length == 0) {
        this.pconditions = [];
        this.addCondition();
      } else {
        this.init(data);
      }
    },
    addCondition() {
      let item = {
        fieldName: "",
        symbolName: "",
        fieldValue: "",
        fieldType: 1,
        fieldValueType: 2,
        fieldLabel: "",
        logicName: "并且",
        field: "",
        symbol: "",
        logic: "&&",
        jnpfKey: ""
      };
      this.pconditions.push(item);
    }
  },
  components: {
    Condition
  }
};
</script>

<style lang="scss" scoped>
.title {
  font-size: 15px;
  color: black;
  font-weight: 400;
}
</style>
