<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="预算名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入预算名称" />
      </el-form-item>
      <el-form-item v-if="!data.id" label="所属上级" prop="parentId">
        <JNPF-TreeSelect v-model="formData.parentId" :options="treeData" :props="{value:'id',label:'name',children:'children'}" clearable placeholder="请选择所属上级" />
      </el-form-item>
      <el-form-item label="总计金额" prop="budgetAmount">
        <el-input-number v-model="formData.budgetAmount" :min="0" placeholder="请输入" :controls="false" style="width: 100%" />
      </el-form-item>
      <el-form-item label="关联部门" prop="organizationId">
        <DepSelect
          v-model="formData.organizationId"
          placeholder="请选择部门"
          select-type="org"
          multiple
          clearable
        />
      </el-form-item>
      <el-form-item label="查阅预算用户" prop="viewUsers">
        <userSelect
          v-model="formData.viewUsers"
          placeholder="请选择"
          :parent-id="userInfo.companyId"
          multiple
          clearable
        />
      </el-form-item>
      <el-form-item label="预警阈值" prop="alertThreshold">
        <el-slider v-model="formData.alertThreshold" />
      </el-form-item>
      <el-form-item label="预选标签" prop="labelId">
        <el-select multiple v-model="formData.labelId" placeholder="请选择" style="width: 100%">
          <el-option
            v-for="item in labelList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from "vuex";
import { getBudgetDetailTree, saveBudgetDetail, updateBudgetDetail, getBudgetLabelList } from "@/api/business/budgetManagement";

export default {
  name: 'addBudgetItem',
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
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
    budgetId: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      formData: {
        parentId: '',
        budgetId: '',
        name: '',
        budgetAmount: '',
        organizationId: [],
        alertThreshold: 0,
        viewUsers: '',
        labelId: []
      },
      rules: {
        name: [{ required: true, message: '请输入' }],
        budgetAmount: [{ required: true, message: '请输入' }],
      },
      treeData: [],
      labelList: []
    };
  },
  computed: {
    ...mapGetters(['userInfo']),
    title() {
      return this.data.id ? '编辑' : '新增'
    },
  },
  watch: {
    visible(n) {
      if (n) {
        this.loadTreeData()
        this.loadLabelList()
        for (const key in this.formData) {
          if (['viewUsers', 'organizationId', 'labelId'].includes(key)) {
            this.formData[key] = this.data[key] ? this.data[key].split(",") : []
            continue
          }

          if (key === 'alertThreshold') {
            this.formData[key] = this.data[key] ? this.data[key] * 100 : 0
            continue
          }
          this.formData[key] = this.data[key]
        }
        console.log('data', this.data)
        console.log('formData', this.formData)
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          const viewUsers = this.formData.viewUsers ? this.formData.viewUsers.join(',') : ''
          const parentId = this.formData.parentId || 0
          const alertThreshold = this.formData.alertThreshold ? this.formData.alertThreshold / 100 : ''
          if (this.data.id) {
            updateBudgetDetail({ id: this.data.id, budgetId: this.budgetId, ...this.formData, parentId: parentId, viewUsers: viewUsers, alertThreshold: alertThreshold, organizationId: this.formData.organizationId.join(','), labelId: this.formData.labelId.join(',') }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } else {
            saveBudgetDetail({ ...this.formData, budgetId: this.budgetId, parentId: parentId, viewUsers: viewUsers, alertThreshold: alertThreshold, organizationId: this.formData.organizationId.join(','), labelId: this.formData.labelId.join(',') }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          }
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    loadTreeData() {
      getBudgetDetailTree({ budgetId: this.budgetId }).then(res => {
        this.treeData = res.data
      })
    },
    loadLabelList() {
      getBudgetLabelList().then(res => {
        this.labelList = res.data.map(item => ({ ...item, id: item.id + '' }))
      })
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-divider--horizontal {
  margin: 12px 0;
}
::v-deep .el-input__inner {
  text-align: left;
}
</style>
