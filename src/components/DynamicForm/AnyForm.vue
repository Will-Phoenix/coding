<template>
  <div :_source="aSourcePath" v-if="ready && fieldCalcReady">
    <el-form ref="form" :model="detailJson" :label-width="labelWidth">
      <template v-for="(group,index) in groups">
        <IterateGroup
          v-if="group.iterable && group.fieldName"
          :key="index"
          :group="group"
          :app-form-conf="appFormConf"
          :detail-json="detailJson"
          :enter-from="enterFrom"
          :field-visible-map="fieldVisibleMap"
          @del="onDel"
          @add="onAdd"
        />
        <MyGroup
          v-else
          :key="index"
          :group-iterate-index="0"
          :group="group"
          :app-form-conf="appFormConf"
          :detail-json="detailJson"
          :enter-from="enterFrom"
          :field-visible-map="fieldVisibleMap"
        />
      </template>
    </el-form>
  </div>
</template>

<script>

import { parseJsonObj } from '@/components/Cicada/printHelper'
import IterateGroup from './components/IterateGroup.vue'
import MyGroup from './components/MyGroup.vue'
import { getPositionFormulaResult } from "@/utils/cicada";

export default {
  name: 'AnyForm',
  components: { MyGroup, IterateGroup },
  props: {
    moduleJson: {
      type: String,
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    enterFrom: {
      type: String,
      default: ""
    },
    labelWidth: {
      type: String,
      default: "130px"
    }
  },
  data() {
    return {
      aSourcePath: "src/components/DynamicForm/AnyForm.vue",
      selectedApplyOrderIds: '',
      // approvalList: [],
      detailJson: {},
      key: 100000,
      ready: false,
      fieldVisibleList: [],
      fieldVisibleMap: new Map(),
      fieldCalcReady: false,
      isFieldCalculating: false
    }
  },
  computed: {
    appFormConf() {
      let ret = {};
      if (this.moduleJson) {
        try {
          ret = JSON.parse(this.moduleJson);
        } catch (e) {
          console.warn('解析moduleJson时发生异常错误', e)
        }
      }
      return ret;
    },
    groups() {
      return this.appFormConf.groups || [];
    },
    iterableGroupFieldNames() {
      return this.groups.filter(v => v.iterable && v.fieldName).map(vv => vv.fieldName);
    },
    exportFieldNames() {
      const arr = [];
      this.groups.forEach(g => {
        (g.fields || []).forEach(f => {
          f.export && arr.push(f.fieldName);
        });
      });
      return arr;
    }
  },
  watch: {
    detailJson: {
      deep: true,
      handler() {
        this.doCalcFieldVisibleMap();
      }
    },
    groups: {
      deep: true,
      handler() {
        this.doCalcFieldVisibleMap();
      }
    }
  },
  mounted() {
    this.init();
    this.$watch('formData', (n, o) => {
      this.init();
    }, { deep: false })
  },
  methods: {
    // 表单回填, 外部可以通过ref多次调用; 页面渲染时序建议: 当moduleJson和formData准备好之后, 再实例化本组件, 不建议在同一个组件实例上动态更新props(避免产生莫名其妙的问题);
    init() {
      this.selectedApplyOrderIds = '';
      // this.approvalList = [];
      let detailJson = {};
      const jsonStr = (this.formData || {}).detailJson;
      if (jsonStr) {
        detailJson = parseJsonObj(jsonStr);
        this.iterableGroupFieldNames.forEach(k => {
          const arr = detailJson[k] || [];
          if (!(arr instanceof Array) || arr.length === 0) {
            // 新增时, 迭代性质的 数组至少得有一项
            detailJson[k] = [{ __key: this.getKey() }];
          } else {
            arr.forEach(element => {
              // 数据回填时, 需要重置 key , 以避免迭代更新出问题;
              element.__key = this.getKey();
            });
          }
        });
        console.log('AnyForm::表单回填结果:;', { detailJson: JSON.parse(JSON.stringify(detailJson)) });
      } else {
        this.iterableGroupFieldNames.forEach(k => {
          // 新增时, 迭代性质的 数组至少得有一项
          detailJson[k] = [{ __key: this.getKey() }];
        });
        // 当前是报销单 && 启用了AI智能填写
        // if (this.appFormConf.formType == 2 && this.appFormConf.smartApprovalOrderType) {
        //   APIGetListCompleteOrdersByType(this.appFormConf.smartApprovalOrderType).then(res => {
        //     this.approvalList = res.data || [];
        //   });
        // }
      }
      this.detailJson = detailJson
      this.ready = true;
    },
    // 外部请使用 ref 调用本方法收集数据, 当 submit=false时, 不校验表单
    collectData(submit = false) {
      return new Promise((resolve, reject) => {
        const detailJson = this.detailJson;
        const ex = {};
        this.exportFieldNames.forEach(k => {
          ex[k] = detailJson[k];
        });
        const ret = {
          ...this.formData,
          ...ex,
          ...(this.selectedApplyOrderIds ? { applyOrderIds: this.selectedApplyOrderIds } : {}),
          detailJson: JSON.stringify(detailJson),
        };
        console.log('AnyForm::collectData==>', { ret, detailJson });
        if (submit) {
          this.$refs.form.validate(valid => {
            if (valid) {
              resolve(ret);
            } else {
              this.$message.warning('表单校验不通过！')
              reject()
            }
          })
        } else {
          resolve(ret);
        }
      })
    },
    onDel(group, index) {
      this.detailJson[group.fieldName].splice(index, 1)
      this.detailJson = { ...this.detailJson }
    },
    onAdd(group) {
      if (!this.detailJson[group.fieldName]) {
        this.$set(this.detailJson, group.fieldName, [])
      }
      this.detailJson[group.fieldName].push({ __key: this.getKey() });
    },
    getKey() {
      return this.key++;
    },
    doCalcFieldVisibleMap() {
      if (!this.ready || this.groups.length === 0) {
        return;
      }
      const list = [];
      console.log('AnyForm计算fieldVisibleMap', { groups: this.groups, detailJson: this.detailJson });
      this.groups.forEach(g => {
        let groupShowInForm;
        if (g.showInFormPro && g.showInFormPro.length > 0) {
          groupShowInForm = getPositionFormulaResult(g.showInFormPro, this.detailJson);
          // console.log('AnyFormGroup===doCalFields---getPositionFormulaResult' + g.label, groupShowInForm);
        } else {
          groupShowInForm = g.showInForm === undefined ? true : g.showInForm;
        }
        if (g.fieldName) {
          list.push({ fieldName: g.fieldName, visible: groupShowInForm });
        }
        if (g.fields) {
          if (g.iterable) {
            // 迭代数组需要按数组长度计算
            const vArr = this.detailJson[g.fieldName];
            if (vArr && vArr.length > 0) {
              for (let i = 0; i < vArr.length; i++) {
                const v = vArr[i];
                g.fields.forEach(f => {
                  let fieldShowInForm;
                  if (f.showInFormPro && f.showInFormPro.length > 0) {
                    fieldShowInForm = getPositionFormulaResult(f.showInFormPro, v);
                    // console.log('AnyFormField===doCalFields---getPositionFormulaResult' + f.fieldName, fieldShowInForm);
                  } else {
                    fieldShowInForm = f.showInForm;
                  }
                  if (f.fieldName) {
                    list.push({ fieldName: (g.fieldName ? g.fieldName + '.' : '') + f.fieldName + '.' + i, visible: fieldShowInForm });
                  }
                });
              }
            }
          } else {
            g.fields.forEach(f => {
              let fieldShowInForm;
              if (f.showInFormPro && f.showInFormPro.length > 0) {
                fieldShowInForm = getPositionFormulaResult(f.showInFormPro, this.detailJson);
                // console.log('AnyFormField===doCalFields---getPositionFormulaResult' + f.fieldName, fieldShowInForm);
              } else {
                fieldShowInForm = f.showInForm;
              }
              if (f.fieldName) {
                list.push({ fieldName: (g.fieldName ? g.fieldName + '.' : '') + f.fieldName, visible: fieldShowInForm });
              }
            });
          }
        }
      })
      // 比较新数组和原数组是否一致
      let equal = true;
      if (list.length !== this.fieldVisibleList.length) {
        equal = false;
      } else {
        for (let i = 0; i < list.length; i++) {
          if (
            list[i].fieldName !== this.fieldVisibleList[i].fieldName ||
              list[i].visible !== this.fieldVisibleList[i].visible
          ) {
            console.log('doCalcFieldVisibleMap变更后' + i, list[i]);
            console.log('doCalcFieldVisibleMap变更前' + i, this.fieldVisibleList[i]);
            equal = false;
            break;
          }
        }
      }
      // 判断有更新后刷新map
      if (!equal) {
        this.fieldVisibleList = list;
        const map = new Map();
        list.forEach(v => {
          map.set(v.fieldName, v.visible);
        });
        this.fieldVisibleMap = map;
        console.log('fieldVisibleMap更新', this.fieldVisibleMap);
        this.fieldCalcReady = true;
      }
    },
  }
}
</script>
