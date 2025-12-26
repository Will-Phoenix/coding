<template>
  <el-dialog
    title="银行回执单自动匹配结果"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="50%"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <JNPF-table
      ref="tableRef"
      :data="list"
      :has-c="false"
      style="width: 100%;height: 450px"
    >
      <el-table-column
        prop="title"
        label="回执单附件名称"
        align="left"
      />
      <el-table-column
        label="收款人姓名"
        prop="receiverName"
        algin="left"
      />
      <el-table-column
        label="付款金额"
        prop="amout"
        algin="left"
      />
      <el-table-column
        label="付款日期"
        prop="tranDate"
        algin="left"
      />
      <el-table-column
        label="报销单名称"
        prop="name"
        algin="left"
      />
      <el-table-column
        label="报销人"
        prop="exsUserName"
        algin="left"
      />
      <el-table-column
        label="报销金额"
        prop="exsCost"
        algin="left"
      />
      <el-table-column
        label="收款人"
        algin="left"
      >
        <template slot-scope="{ row }">
          <span>{{ getReceiver(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="报销日期"
        prop="applyTime"
        algin="left"
      />
      <el-table-column
        label="匹配原因"
        prop="matchReason"
        algin="left"
      />
      <el-table-column
        label="操作"
        fixed="right"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="manualSetting(scope.row)"
          >手动调整匹配关系
          </el-button>
        </template>
      </el-table-column>
    </JNPF-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
    <expenseAccountPicker :visible.sync="showExpensePicker" :data="expenseList" :func="getReceiver" @confirm="changeRelation" />
  </el-dialog>
</template>
<script>
import expenseAccountPicker from "@/views/expenseAccountManage/components/expenseAccountPicker";

export default {
  components: { expenseAccountPicker },
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
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: [Object, Array],
      default: () => ({})
    }
  },
  data() {
    return {
      showExpensePicker: false,
      expenseList: [],
      list: [],
      newData: [], // 存放要提交的数据格式
      currentRow: {},
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.expenseList = this.data.exsOrderEntities;
        this.newData = this.data.bankFlexDTOS;
        this.reloadData();
      } else {
        this.list = [];
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$emit("btnLoading");
      this.$emit("confirm", this.newData.filter(v => v.ccdExsOrderEntity));
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    getReceiver(row) {
      const type = row.type;
      // 这几种报销单，收款人就是报销人
      if (['2', '6', '13', '15'].includes(type)) {
        return row.exsUserName;
      } else if (type === "8") {
        // 项目付款单
        return JSON.parse(row.detailJson).payeeName;
      } else if (type === "7") {
        // 请款单
        return JSON.parse(row.detailJson).payee;
      } else if (type === "16") {
        // 银行划款单
        return JSON.parse(row.detailJson).inEntBankAccount;
      } else {
        return row.exsUserName;
      }
    },
    // this.data数据改变后，重新加载list
    reloadData() {
      this.list = this.newData.map(v => ({ ...v.bankSlipResDTO, ...v.ccdExsOrderEntity, matchReason: v.matchReason }));
    },
    manualSetting(row) {
      this.showExpensePicker = true;
      this.currentRow = row;
    },
    changeRelation(val) {
      console.log("手动选择的报销单：", val);
      // 重新绑定了报销单要处理：1. 新报销单isMatch改为是，旧的改为否  2. 当前回执单绑定新报销单，报销单原先所在回执单清除该报销单
      const index = this.newData.findIndex(v => v.bankSlipResDTO.bankFid === this.currentRow.bankFid);
      if (this.newData[index].ccdExsOrderEntity) {
        // 说明原本已关联了报销单，现在属于更改报销单
        // 先把原先报销单的isMatch字段改为“否”
        this.expenseList[this.expenseList.findIndex(v => v.id === this.newData[index].ccdExsOrderEntity.id)].isMatch = "否";
      }
      // 把新的报销单isMatch字段改为“是”
      this.expenseList[this.expenseList.findIndex(v => v.id === val.id)].isMatch = "是";
      // 在替换报销单之前，看一下该报销单之前绑定了回执单没，如果绑定了，要清除
      const index2 = this.newData.findIndex(v => v.ccdExsOrderEntity && v.ccdExsOrderEntity.id === val.id);
      if (index2 !== -1) {
        this.newData[index2].ccdExsOrderEntity = null;
        this.newData[index2].matchReason = null;
      }
      // 替换newData中当前银行回执单对应的报销单
      this.newData[index].ccdExsOrderEntity = val;
      this.newData[index].matchReason = "手动匹配";
      // 重新加载list
      this.reloadData();
    }
  }
}
</script>
<style lang="scss" scoped></style>
