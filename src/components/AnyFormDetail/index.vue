<template>
  <div class="preview-content" v-if="groups.length > 0">
    <div class="group-item" v-for="(item, index) in groups" :key="index">
      <div v-if="item.iterable && item.fieldName">
        <div v-for="(item2, index2) in allData[item.fieldName]" :key="index2">
          <div v-if="groupShowInDetail(item)" class="group-label">{{ item.label }}{{ index2 + 1 }}
          </div>
          <div class="group-item-content" v-if="groupShowInDetail(item)">
            <div v-for="(item3, index3) in item.fields" :key="index3">
              <div style="margin-top: 12px" v-if="iterableFieldShowInDetail(item3, item2)">
                <RenderItem :item="item3" :data="item2[item3.fieldName]" :info="info" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <el-collapse
          v-if="foldable(item) && groupShowInDetail(item)"
          class="my-custom-collapse"
          v-model="collapseArr[index].collapse"
        >
          <el-collapse-item name="i">
            <template slot="title">
              <div class="my-custom-collapse-title">
                <span class="l">{{ item.label }}</span>
                <span class="r">{{ collapseArr[index].collapse.length > 0 ? '折叠' : '展开' }}</span>
              </div>
            </template>
            <!-- <div v-if="item.label" class="label">{{ item.label }}</div> -->
            <div class="group-item-content">
              <div v-for="(item2, index2) in item.fields" :key="index2">
                <div style="margin-top: 10px" v-if="fieldShowInDetail(item2)">
                  <RenderItem :item="item2" :data="allData[item2.fieldName]" :info="info" />
                </div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
        <div v-else>
          <div v-if="item.label && groupShowInDetail(item)" class="group-label">{{ item.label }}
          </div>
          <div class="group-item-content" v-if="groupShowInDetail(item)">
            <div v-for="(item2, index2) in item.fields" :key="index2">
              <div style="margin-top: 12px" v-if="fieldShowInDetail(item2)">
                <RenderItem :item="item2" :data="allData[item2.fieldName]" :info="info" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, watch, defineComponent } from '@vue/composition-api'
import { parseJsonObj } from '@/components/Cicada/printHelper'
import store from '@/store'
import { autoAddCashPrefix } from '@/utils/format'
import InvoiceFile from '@/views/approvalCenter/components/InvoiceFile'
import { saveAs } from 'file-saver'
import { APIGetOrdersByIds } from "@/api/cicada/oa"
import { getPositionFormulaResult } from "@/utils/cicada";

const ApprovalOrderDetail = () => import('@/views/approvalCenter/components/approvalOrderDetail.vue');

const RenderItem = defineComponent({
  components: {
    InvoiceFile,
    ApprovalOrderDetail
  },
  props: {
    item: Object,
    info: Object,
    data: [Number, String, Array],
  },
  setup(props) {
    const orderDetail = ref({
      visible: false,
      data: null
    });
    const relatedApprovals = ref([]);

    const loadRelatedApprovals = async(ids) => {
      try {
        const { data } = await APIGetOrdersByIds(ids);
        if (data && data.length > 0) {
          relatedApprovals.value = data;
        }
      } catch (error) {
        console.error('获取关联审批单详情失败:', error);
      }
    };

    watch(() => props.data, (newVal) => {
      if (props.item.component === 'relatedApproval' && newVal) {
        const ids = newVal.split(',').filter(Boolean);
        if (ids.length > 0) {
          loadRelatedApprovals(ids);
        }
      }
    }, { immediate: true });

    const viewDetail = (approval) => {
      orderDetail.value = {
        visible: true,
        data: approval
      };
    };

    return {
      orderDetail,
      relatedApprovals,
      viewDetail
    };
  },
  render() {
    const { item, data } = this;

    const formatVal = (val, field) => {
      let ret = val
      if (field) {
        if (field.component === 'amountInput' || field.component === 'amountSum') {
          ret = autoAddCashPrefix(val)
        } else if (field.component === 'attachment') {
          // ret = ""
        } else if (field.component === 'showValue') {
          if (val == null) {
            ret = this.info.formData[field.fieldName]
          }
        }
      }
      return ret
    };

    const downLoad = (fileInfo) => {
      console.log('[Debug] 下载参数:', fileInfo);
      if (fileInfo?.url) {
        saveAs(fileInfo?.url, fileInfo?.name);
        this.$message.success("已下载，请在浏览器下载列表中查看");
      }
    };

    if (item.component === 'relatedApproval') {
      return (
        <div>
          <div class="content-item">
            <div class="title">{item.label}</div>
          </div>
          <div class="related-approvals">
            {this.relatedApprovals.map(approval => (
              <div class="approval-item" key={approval.id}>
                <div class="approval-info">
                  <div class="approval-name">{approval.name}</div>
                  <div class="approval-meta">
                    <span>申请人: {approval.applyUserName}</span>
                    <span style="margin-left: 15px">申请时间: {approval.applyDate}</span>
                  </div>
                </div>
                <div class="approval-action">
                  <span class="btn-view" onClick={() => this.viewDetail(approval)}>查看</span>
                </div>
              </div>
            ))}
          </div>
          <ApprovalOrderDetail
            visible={this.orderDetail.visible}
            data={this.orderDetail.data}
            on={{
              'update:visible': val => this.orderDetail.visible = val
            }}
          />
        </div>
      )
    }

    return (
      item.component === 'attachment' ? (
        <div>
          <div class="content-item">
            <div class="title">{item.label}</div>
          </div>
          {data && (
            <div>
              {data.split(',').map(fileId => (
                <InvoiceFile
                  key={fileId}
                  fid={fileId}
                  scopedSlots={{
                    default: ({ fileInfo }) => (
                      <span class="btn-view" onClick={() => downLoad(fileInfo)}>下载</span>)
                  }}
                />
              ))}
            </div>
          )}</div>
      ) : item.component === 'multiInput' ? (
        <div>
          <div class="content-item">
            <div class="title">{item.label}</div>
          </div>
          <div class="content-item">
            <div class="desc">{formatVal(data, item)}</div>
          </div>
        </div>
      ) : (
        <div class="content-item">
          <div class="title">{item.label}</div>
          <div class="desc">{formatVal(data, item)}</div>
        </div>
      )
    )
  }
})

export default defineComponent({
  name: 'AnyFormDetail',
  emits: ['load'],
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  components: {
    InvoiceFile,
    RenderItem
  },
  setup(props, { emit }) {
    const info = computed(() => store.state.form.module[props.id])
    const appFormConf = ref({})
    const allData = ref({})
    const groups = ref([])
    const collapseArr = ref([])

    watch(info, (v) => {
      if (v) {
        appFormConf.value = parseJsonObj(v.moduleJson)
        allData.value = parseJsonObj(v.formData.detailJson)
        groups.value = appFormConf.value.groups || []
        collapseArr.value = groups.value.map(v => ({ collapse: v.foldInDetail ? [] : ['i'] }))
        emit('load', { [props.id]: v })
      }
    }, { immediate: true })

    const groupShowInDetail = (groupItem) => {
      // console.log('groupShowInDetail' + groupItem.label, groupItem.showInDetailPro);
      let showInDetailGroup = false;
      if (groupItem.showInDetailPro && groupItem.showInDetailPro.length > 0) {
        showInDetailGroup = getPositionFormulaResult(groupItem.showInDetailPro, allData.value);
        // console.log('AnyFormDetail---getPositionFormulaResult' + groupItem.label, showInDetailGroup);
      } else {
        showInDetailGroup = groupItem.showInDetail === undefined ? true : groupItem.showInDetail;
      }
      return showInDetailGroup && groupItem.fields && groupItem.fields.filter(v => v.showInDetail).length > 0
    }

    const foldable = (groupItem) => {
      return !!groupItem.foldable
    }

    const fieldShowInDetail = (groupItem) => {
      // console.log('fieldShowInDetail' + groupItem.label, groupItem.showInDetailPro);
      let showInDetail;
      if (groupItem.showInDetailPro && groupItem.showInDetailPro.length > 0) {
        showInDetail = getPositionFormulaResult(groupItem.showInDetailPro, allData.value);
        // console.log('AnyFormDetail===fieldShowInDetail' + groupItem.label, showInDetail);
      } else {
        showInDetail = groupItem.showInDetail;
      }
      return showInDetail;
    }

    const iterableFieldShowInDetail = (groupItem, v) => {
      // console.log('fieldShowInDetail' + groupItem.label, groupItem.showInDetailPro);
      let showInDetail;
      if (groupItem.showInDetailPro && groupItem.showInDetailPro.length > 0) {
        showInDetail = getPositionFormulaResult(groupItem.showInDetailPro, v);
        // console.log('AnyFormDetail===fieldShowInDetail' + groupItem.label, showInDetail);
      } else {
        showInDetail = groupItem.showInDetail;
      }
      return showInDetail;
    }

    if (!info.value) {
      store.dispatch('form/getModule', props.id)
    }

    return {
      info,
      appFormConf,
      allData,
      groups,
      collapseArr,
      groupShowInDetail,
      foldable,
      fieldShowInDetail,
      iterableFieldShowInDetail
    }
  }
})
</script>
<style lang="scss">
.my-custom-collapse {
  border-width: 0;
  .el-collapse-item__header {
    border-width: 0;
    height: 30px;
    line-height: 30px;
  }
  .el-collapse-item__content {
    padding-bottom: 0;
    border-width: 0;
  }
  .el-collapse-item__wrap {
    padding-bottom: 0;
    border-width: 0;
  }
}
</style>
<style lang="scss" scoped>
.preview-content {
  background-color: #fff;
  font-size: 14px;
  line-height: 20px;

  .group-item {
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
    .group-label {
      padding: 0 6px;
      margin-bottom: 8px;
      color: #919499;
    }
    .group-item-content {
      border-radius: 12px;
      border: 1px solid #edf1f2;
      padding: 4px 12px 16px 12px;
    }
  }
  .content-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    &:last-child {
      margin-bottom: 0;
    }
    .title {
      color: #5c5f66;
    }
    .desc {
      color: #292c33;
    }
  }
  .my-custom-collapse-title {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .r {
      color: #5c5f66;
      font-size: 12px;
    }
  }
}

.btn-view {
  padding: 4px 12px;
  color: #00b4c4;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

::v-deep .related-approvals {
  .approval-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .approval-info {
      flex: 1;
      .approval-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 6px;
      }
      .approval-meta {
        font-size: 12px;
        color: #909399;
        span {
          & + span {
            margin-left: 15px;
          }
        }
      }
    }

    .approval-action {
      flex-shrink: 0;
      .btn-view {
        padding: 6px 16px;
        background: #f0faff;
        border-radius: 4px;
        color: #00b4c4;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>
