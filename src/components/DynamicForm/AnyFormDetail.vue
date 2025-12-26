<template>
  <div :_source="aSourcePath">
    <div class="preview-content">
      <div v-for="(item, index) in groups" :key="index">
        <div v-if="item.iterable && item.fieldName">
          <div v-for="(item2, index2) in allData[item.fieldName]" :key="index2">
            <div v-if="groupShowInDetail(item)" class="label">{{ item.label }}{{ index2 + 1 }}</div>
            <el-card v-if="groupShowInDetail(item)">
              <div v-for="(item3, index3) in item.fields" :key="index3">
                <div style="margin-top: 10px" v-if="iterableFieldShowInDetail(item3, item2)">
                  <div class="content-item">
                    <div class="title">{{ item3.label }}</div>
                    <div class="desc">{{ formatVal(item2[item3.fieldName], item3) }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
        <div v-else>
          <el-collapse v-if="foldable(item) && groupShowInDetail(item)" class="my-collapse" v-model="collapseArr[index].collapse" :accordion="true">
            <el-collapse-item name="i">
              <template slot="title">
                <div class="my-collapse-title">
                  <span class="l">{{ item.label }}</span>
                  <span class="r">{{ collapseArr[index].collapse === 'i' ? '折叠' : '展开' }}</span>
                </div>
              </template>
              <div v-if="item.label" class="label">{{ item.label }}</div>
              <el-card>
                <div v-for="(item2, index2) in item.fields" :key="index2">
                  <div style="margin-top: 10px" v-if="fieldShowInDetail(item2)">
                    <div class="content-item">
                      <div class="title">{{ item2.label }}</div>
                      <div class="desc">{{ formatVal(allData[item2.fieldName], item2) }}</div>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-collapse-item>
          </el-collapse>
          <div v-else>
            <div v-if="item.label && groupShowInDetail(item)" class="label">{{ item.label }}</div>
            <el-card v-if="groupShowInDetail(item)">
              <div v-for="(item2, index2) in item.fields" :key="index2">
                <div style="margin-top: 10px" v-if="fieldShowInDetail(item2)">
                  <div class="content-item">
                    <div class="title">{{ item2.label }}</div>
                    <div class="desc">{{ formatVal(allData[item2.fieldName], item2) }}</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJsonObj } from '@/components/Cicada/printHelper'
import { autoAddCashPrefix } from '@/utils/format'
import { getPositionFormulaResult } from "@/utils/cicada";

export default {
  name: 'AnyFormDetail',
  props: {
    // info即为报销单或审批单详情，包含：formData、moduleJson等
    info: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      aSourcePath: "src/components/DynamicForm/AnyFormDetail.vue",
      collapseArr: []
    }
  },
  computed: {
    appFormConf() {
      return parseJsonObj(this.info.moduleJson);
    },
    allData() {
      return parseJsonObj(this.info.formData.detailJson);
    },
    groups() {
      return this.appFormConf.groups || [];
    },
    groupShowInDetail() {
      return (g) => {
        let showInDetailGroup = false;
        if (g.showInDetailPro && g.showInDetailPro.length > 0) {
          showInDetailGroup = getPositionFormulaResult(g.showInDetailPro, this.allData);
          // console.log('AnyFormDetail---getPositionFormulaResult' + g.label, showInDetailGroup);
        } else {
          showInDetailGroup = g.showInDetail === undefined ? true : g.showInDetail;
        }
        return showInDetailGroup && g.fields && g.fields.filter(v => v.showInDetail).length > 0;
      }
    },
    foldable() {
      return (groupItem) => {
        return !!groupItem.foldable;
      }
    },
    fieldShowInDetail() {
      return (f) => {
        let showInDetail;
        if (f.showInDetailPro && f.showInDetailPro.length > 0) {
          showInDetail = getPositionFormulaResult(f.showInDetailPro, this.allData);
          // console.log('AnyFormDetail===GroupField---getPositionFormulaResult' + f.label, showInDetail);
        } else {
          showInDetail = f.showInDetail;
        }
        return showInDetail;
      }
    },
    iterableFieldShowInDetail() {
      return (f, v) => {
        let showInDetail;
        if (f.showInDetailPro && f.showInDetailPro.length > 0) {
          console.log('AnyFormDetail===GroupField---getPositionFormulaResult' + f.label, { f, v });
          showInDetail = getPositionFormulaResult(f.showInDetailPro, v);
          console.log('AnyFormDetail===GroupField---getPositionFormulaResult' + f.label, showInDetail);
        } else {
          showInDetail = f.showInDetail;
        }
        return showInDetail;
      }
    },
  },
  watch: {
    info(n) {
      console.log("数据传过来了：", n)
    }
  },
  created() {
    this.collapseArr = this.groups.map(v => ({ collapse: v.foldInDetail ? undefined : 'i' }));
    console.log("collapseArr:", this.collapseArr);
  },
  mounted() {

  },
  methods: {
    formatVal(val, field) {
      let ret = val;
      if (field) {
        if (field.component === 'amountInput' || field.component === 'amountSum') {
          ret = autoAddCashPrefix(val);
        } else if (field.component === 'attachment') {
          // ret = ""
        } else if (field.component === 'showValue') {
          if (val == null) {
            ret = this.info.formData[field.fieldName];
          }
        }
      }
      return ret;
    }
  }
}
</script>
<style scoped>
  .label {
    font-weight: bold;
    margin: 20px 0 10px 10px;
  }

  .preview-content {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 0 10px 10px 10px;
  }

  .content-item {
    display: flex;
    margin-bottom: 20px;
  }
  .title {
    font-size: 14px;
    color: #5C5F66;
  }

  .desc {
    font-size: 14px;
    color: #292C33;
    margin-left: auto;
  }
  .my-collapse {
  ::v-deep .el-collapse-item__header {
    font-size: 15px;
  }
}
.my-collapse-title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .l {

  }
  .r {
    color: #1890ff;
    font-size: 14px;
    padding-right: 5px;
  }
}
</style>
