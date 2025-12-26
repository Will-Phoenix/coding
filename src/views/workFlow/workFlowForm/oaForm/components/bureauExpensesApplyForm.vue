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
      <el-form-item label="填表日期" prop="writeTime">
        <el-date-picker
          v-model="formData.writeTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-divider />
      <el-form-item label="会议名称" prop="meetingName">
        <el-input v-model="formData.meetingName" placeholder="请输入" maxlength="30" />
      </el-form-item>
      <el-form-item label="会议定点单位" prop="meetingOrg">
        <el-input v-model="formData.meetingOrg" placeholder="请输入" maxlength="30" />
      </el-form-item>
      <el-form-item label="参加会议人数" prop="meetingPersonNum">
        <el-input-number :min="0" :max="1000" v-model="formData.meetingPersonNum" controls-position="right" placeholder="请输入" style="width: 100%" />
      </el-form-item>
      <el-form-item label="会议性质或类别" prop="type">
        <el-select v-model="formData.type" placeholder="请选择">
          <el-option v-for="item in typeOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-divider />
      <el-form-item label="会议开始时间" prop="beginTime">
        <el-date-picker
          v-model="formData.beginTime"
          type="datetime"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="召开天数" prop="days">
        <el-input-number :min="0" :max="1000" v-model="formData.days" controls-position="right" placeholder="请输入" style="width: 100%" />
      </el-form-item>
      <el-form-item label="经费来源" prop="fundsFrom">
        <el-input v-model="formData.fundsFrom" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-divider />
      <h4 style="margin-bottom: 10px">会议费用</h4>
      <div v-for="(item, index) in formData.meetingCost" :key="index">
        <h6 style="margin-bottom: 10px">{{ index + 1 }} {{ item.name }}</h6>
        <el-form-item label="人数" :prop="'meetingCost.' + index + '.personNum'">
          <el-input-number :min="0" :max="1000" v-model="item.personNum" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
        <el-form-item label="天数" :prop="'meetingCost.' + index + '.days'">
          <el-input-number :min="0" :max="1000" v-model="item.days" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
        <el-form-item label="标准" :prop="'meetingCost.' + index + '.standard'">
          <el-input-number :min="0" :max="1000000000" v-model="item.standard" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
        <el-form-item label="核准预算数" :prop="'meetingCost.' + index + '.baselineBugdet'">
          <el-input-number :min="0" :max="1000000000" v-model="item.baselineBugdet" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
        <el-form-item label="实际开支数" :prop="'meetingCost.' + index + '.actualCost'">
          <el-input-number :min="0" :max="1000000000" v-model="item.actualCost" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
        <el-divider />
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { editApplyOrder } from "@/api/business/expenseAccount";

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
        meetingCost: [{}],
      },
      typeOption: [
        { label: "一类", value: "一类"},
        { label: "二类", value: "二类"},
        { label: "三类", value: "三类"},
        { label: "四类", value: "四类"},
      ],
      rules: {
        writeTime: [{ required: true, message: '请选择' }],
        meetingName: [{ required: true, message: '请输入' }],
        meetingOrg: [{ required: true, message: '请输入' }],
        meetingPersonNum: [{ required: true, message: '请输入' }],
        type: [{ required: true, message: '请选择' }],
        beginTime: [{ required: true, message: '请选择' }],
        days: [{ required: true, message: '请输入' }],
        fundsFrom: [{ required: true, message: '请输入' }],
      },
    }
  },
  computed: {
    title() {
      return '修改表单';
    },
  },
  watch: {
    visible(n) {
      if (n) {
        const formData = JSON.parse(this.data.formData.detailJson);
        formData.meetingCost.forEach(v => {
          Object.keys(v).forEach(key => {
            if (v[key] === "") {
              v[key] = undefined;
            }
          });
        });
        console.log("formData", formData);
        this.formData = formData;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.$refs.form.resetFields();
      }
    }
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
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
  }
}
</script>
<style lang="scss" scoped></style>
