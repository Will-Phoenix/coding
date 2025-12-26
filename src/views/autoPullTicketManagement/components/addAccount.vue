<template>
  <el-dialog
    :title="(data && data.id? '编辑':'新增')+'自动拉取票据账套'"
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
      <el-form-item label="所属单位" prop="entId">
        <el-cascader
          v-model="formData.entId"
          placeholder="请选择单位/企业"
          filterable
          :props="{multiple: false,emitPath: false,value: 'id',label: 'fullName'}"
          :options="orgOption"
          :show-all-levels="false"
          @change="orgCascaderChange"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="所属账套" prop="id">
        <el-select
          v-model="formData.id"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option v-for="(item, index) in sobOption" :key="index" :label="item.name" :value="item.id" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号" prop="nuoqiContactPhone">
        <el-input v-model="formData.nuoqiContactPhone" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="虚拟号" prop="nuoqiVirtualPhone">
        <el-select
          v-model="formData.nuoqiVirtualPhone"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option v-for="(item, index) in virtualPhoneOption" :key="index" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属区域" prop="nuoqiAreaCode">
        <el-cascader
          v-model="areaCode"
          :options="areaOption"
          :props="{multiple: false,emitPath: true,value: 'enCode',label: 'fullName'}"
          placeholder="请选择"
          filterable
          @change="areaCascaderChange"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="是否启用" prop="nuoqiStatus">
        <el-radio-group v-model="formData.nuoqiStatus">
          <el-radio :label="0">停用</el-radio>
          <el-radio :label="1">启用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getOrganizeTree } from "@/api/permission/organize";
import { getSobListByEntId, getVirtualPhoneList, postRegisterNuoqi } from "@/api/business/autoPullTicketManagement";
import { getDicts } from "@/api/common";

export default {
  name: 'addAccount',
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
  },
  data() {
    return {
      formData: {
        id: '',
        entId: '',
        nuoqiContactPhone: '',
        nuoqiVirtualPhone: '',
        nuoqiAreaCode: '',
        nuoqiTaxAreaCode: '',
        nuoqiStatus: 1,
      },
      rules: {
        id: [{ required: true, message: '请选择' }],
        entId: [{ required: true, message: '请选择' }],
        nuoqiContactPhone: [{ required: true, message: '请输入' }],
        nuoqiVirtualPhone: [{ required: true, message: '请输入' }],
        nuoqiAreaCode: [{ required: true, message: '请选择' }],
        nuoqiStatus: [{ required: true, message: '请选择' }],
      },
      orgOption: [], // 企业选项
      sobOption: [], // 账套列表
      areaOption: [], // 区域列表
      virtualPhoneOption: [], // 虚拟号列表
      areaCode: []
    }
  },
  watch: {
    visible(n) {
      if (n) {
        this.areaCode = [];
        // 编辑
        if (this.data.id) {
          for (const key in this.formData) {
            this.formData[key] = this.data[key];
          }
          if (this.formData.nuoqiTaxAreaCode) {
            this.areaCode.push(this.formData.nuoqiTaxAreaCode);
          }
          if (this.formData.nuoqiAreaCode) {
            this.areaCode.push(this.formData.nuoqiAreaCode);
          }
          this.loadSobList();
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.formData = {
          id: '',
          entId: '',
          nuoqiContactPhone: '',
          nuoqiVirtualPhone: '',
          nuoqiAreaCode: '',
          nuoqiTaxAreaCode: '',
          nuoqiStatus: 1,
        }
      }
    }
  },
  mounted() {
    this.loadOrgList();
    this.loadAreaDict();
    this.loadVirtualPhoneDict();
  },
  methods: {
    loadOrgList() {
      getOrganizeTree().then(res => {
        this.orgOption = res.data.list;
      })
    },
    loadSobList() {
      if (this.formData.entId) {
        getSobListByEntId({ entId: this.formData.entId }).then(res => {
          this.sobOption = res.data;
        });
      }
    },
    loadVirtualPhoneDict() {
      getVirtualPhoneList().then(res => {
        this.virtualPhoneOption = res.data;
      });
    },
    loadAreaDict() {
      getDicts('nuoqiArea').then(res => {
        this.areaOption = res.data.list;
      });
    },
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          postRegisterNuoqi({ ...this.formData }).then(() => {
            this.$message.success("操作成功");
            this.$emit('confirm');
            this.updateVisible(false);
          });
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
    areaCascaderChange(v) {
      console.log(v);
      if (v && v.length > 1) {
        this.formData.nuoqiTaxAreaCode = v[0];
        this.formData.nuoqiAreaCode = v[1];
      }
    },
    orgCascaderChange() {
      this.loadSobList();
    }
  }
}
</script>
<style lang="scss" scoped>
.option-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .option-img {
    width: 32px;
    height: 32px;
  }
}
::v-deep .el-select-dropdown__item{
  height: 40px;
}
.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .row-img {
    width: 32px;
    height: 32px;
  }
}
</style>
