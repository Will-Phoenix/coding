<template>
  <div>
    <template v-if="fields.length > 0">
      <el-collapse v-if="foldable && showTitle" class="my-collapse" v-model="collapse" :accordion="true">
        <el-collapse-item name="i">
          <template slot="title">
            <div v-if="showTitle" class="my-collapse-title">
              <span class="l">{{ group.label }}</span>
              <span class="r">{{ collapse === 'i' ? '折叠' : '展开' }}</span>
            </div>
          </template>
          <MyCom
            v-for="(item,index) in fields"
            :key="index"
            :index="index"
            :app-form-conf="appFormConf"
            :detail-json="detailJson"
            :group-iterate-index="groupIterateIndex"
            :group="group"
            :field="item"
            :enter-from="enterFrom"
            :field-visible-map="fieldVisibleMap"
          />
        </el-collapse-item>
      </el-collapse>
      <template v-else>
        <div class="group-tit" v-if="(group.label || group.iterable) && showTitle">
          <span class="t-title">{{ group.label }}{{ group.iterable && group.limit > 1 ? `${groupIterateIndex + 1}` : '' }}</span>
          <el-button type="text" v-if="group.iterable && groupIterateIndex > 0" class="t-del" @click="onDel">删除</el-button>
        </div>
        <div class="group-space" v-else />
        <MyCom
          v-for="(item,index) in fields"
          :key="index"
          :index="index"
          :app-form-conf="appFormConf"
          :detail-json="detailJson"
          :group-iterate-index="groupIterateIndex"
          :group="group"
          :field="item"
          :enter-from="enterFrom"
          :field-visible-map="fieldVisibleMap"
        />
      </template>
    </template>
  </div>
</template>

<script>
import MyCom from './MyCom.vue'
import { alwaysRenderComponents } from "@/components/DynamicForm/b";

export default {
  name: 'MyGroup',
  components: { MyCom },
  props: {
    appFormConf: {
      type: Object,
      required: true
    },
    group: {
      type: Object,
      required: true
    },
    groupIterateIndex: {
      type: Number,
      required: true
    },
    detailJson: {
      type: Object,
      required: true
    },
    enterFrom: {
      type: String,
      default: ""
    },
    fieldVisibleMap: {
      type: Map,
      default: {},
    }
  },
  data() {
    return {
      collapse: undefined,
    }
  },
  computed: {
    foldable() {
      return !!this.group.foldable
    },
    foldInForm() {
      return !!this.group.foldInForm
    },
    fields() {
      if (!(this.group.fieldName && !this.fieldVisibleMap.get(this.group.fieldName)) && this.group.fields) {
        const arr = this.group.fields.filter(f => {
          let keyName = (this.group.fieldName ? this.group.fieldName + '.' : '') + f.fieldName;
          if (this.group.iterable) {
            keyName += '.' + this.groupIterateIndex;
          }
          return !(keyName && !this.fieldVisibleMap.get(keyName)) || alwaysRenderComponents.includes(f.component) || this.enterFrom === 'approve';
        });
        return arr.length > 0 ? this.group.fields : [];
      } else {
        return [];
      }
    },
    // 计算完组件全部隐藏后隐藏标题
    showTitle() {
      if (!(this.group.fieldName && !this.fieldVisibleMap.get(this.group.fieldName)) && this.group.fields) {
        const arr = this.group.fields.filter(f => {
          let keyName = (this.group.fieldName ? this.group.fieldName + '.' : '') + f.fieldName;
          if (this.group.iterable) {
            keyName += '.' + this.groupIterateIndex;
          }
          return !(keyName && !this.fieldVisibleMap.get(keyName));
        });
        return arr.length > 0;
      } else {
        return false;
      }
    }
  },
  watch: {
  },
  mounted() {
    this.collapse = this.foldInForm ? undefined : 'i'
  },
  methods: {
    onDel() {
      this.$emit("del", this.groupIterateIndex);
    }
  }
}
</script>
<style lang="scss" scoped>
.group-tit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 10px 0;
  font-size: 15px;
  .t-title {
    color: #303133;
    font-weight: bold;
  }
  .t-del {
    color: red;
  }
}
.group-space {
  height: 10px;
}
.my-collapse {
  ::v-deep .el-collapse-item__header {
    font-size: 15px;
  }
  ::v-deep .el-collapse-item__content {
    padding-bottom: 0;
  }
}
::v-deep .el-collapse {
  border-top: 1px solid #eef1f6;
  border-bottom: none;
}
.my-collapse-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .l {

  }
  .r {
    color: #00B4C4;
    font-size: 14px;
    padding-right: 5px;
  }
}
</style>
