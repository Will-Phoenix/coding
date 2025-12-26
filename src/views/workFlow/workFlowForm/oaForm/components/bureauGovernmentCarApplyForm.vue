<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="600px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="135px">
      <el-form-item label="申请人" prop="applyUserId">
        <userSelect
          v-model="formData.applyUserId"
          placeholder="请选择"
          :parent-id="userInfo.companyId"
          @change="applyUserIdChange"
          clearable
        />
      </el-form-item>
      <el-form-item label="手机" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入" maxlength="11" />
      </el-form-item>
      <el-form-item label="座机" prop="landline">
        <el-input v-model="formData.landline" placeholder="请输入" maxlength="20" />
      </el-form-item>
      <el-form-item label="申请科室" prop="applyDeptId">
        <DepSelect
          v-model="formData.applyDeptId"
          placeholder="请选择"
          select-type="org"
          clearable
          @change="applyDeptIdChange"
        />
      </el-form-item>
      <el-divider />
      <el-form-item label="用车地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入" maxlength="50" />
      </el-form-item>
      <el-form-item label="用车事由" prop="useCarCause">
        <el-input v-model="formData.useCarCause" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-divider />
      <el-form-item label="用车开始时间" prop="beginTime">
        <el-date-picker
          v-model="formData.beginTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="用车结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <div v-for="(item, index) in formData.carList" :key="index">
        <el-divider />
        <div style="display: flex; justify-content: space-between;margin-bottom: 10px">
          <h6>申请车辆{{ index + 1 }}</h6>
          <el-button type="text" v-if="index > 0" @click="deleteApply(index)">删除申请</el-button>
        </div>
        <el-form-item label="车辆类型" :prop="'carList.' + index + '.type'" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
          <el-select
            ref="typeRef"
            v-model="item.type"
            @change="carTypeChange(index)"
            placeholder="请选择"
          >
            <el-option v-for="item in carTypeOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="车辆数量" :prop="'carList.' + index + '.num'" :rules="[{ required: true, message: '请输入', trigger: 'blur' }]">
          <el-input-number :min="0" :max="1000" v-model="item.num" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
      </div>
      <el-divider />
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入" maxlength="250" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="addApply()">新增申请</el-button>
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { editApplyOrder } from "@/api/business/expenseAccount";
import { getDicts } from "@/api/common";
import { mapGetters } from "vuex";

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
    return {
      loading: false,
      formData: {
        carList: [{}],
      },
      carTypeOption: [],
      rules: {
        applyUserId: [{ required: true, message: '请选择' }],
        phone: [{ required: true, message: '请输入' }],
        applyDeptId: [{ required: true, message: '请选择' }],
        location: [{ required: true, message: '请输入' }],
        useCarCause: [{ required: true, message: '请输入' }],
        beginTime: [{ required: true, message: '请选择' }],
        endTime: [{ required: true, message: '请选择' }],
      },
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
    title() {
      return '修改表单';
    },
  },
  watch: {
    visible(n) {
      if (n) {
        const formData = JSON.parse(this.data.formData.detailJson);
        console.log("formData", formData);
        this.formData = formData;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.$refs.form.resetFields();
      }
    }
  },
  created() {
    getDicts("carType").then(res => {
      this.carTypeOption = res.data.list.map(v => ({ label: v.fullName, value: v.enCode }));
    });
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          // 把车辆类型和车辆数量拼接起来
          this.formData.carList.forEach(v => {
            v.name = `${v.carName}${v.num}辆`;
          });
          editApplyOrder({ id: this.data.id, detailJson: JSON.stringify({ ...this.formData }) }).then(() => {
            this.$message.success("操作成功");
            this.$emit('confirm');
            this.updateVisible(false);
          });
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
    },
    addApply() {
      this.formData.carList.push({});
    },
    deleteApply(index) {
      this.formData.carList.splice(index, 1);
    },
    applyUserIdChange(value, selected) {
      this.$nextTick(() => {
        this.formData.applyUserName = selected.fullName.split("/")[1];
      });
    },
    applyDeptIdChange(value, selected) {
      this.$nextTick(() => {
        this.formData.applyDept = selected.fullName;
      });
    },
    carTypeChange(index) {
      this.$nextTick(() => {
        this.formData.carList[index].carName = this.$refs.typeRef[index].selected.label;
      });
    },
  }
}
</script>
<style lang="scss" scoped></style>
