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
      <el-form-item label="出差人" prop="applyUserId">
        <userSelect
          v-model="formData.applyUserId"
          placeholder="请选择"
          :parent-id="userInfo.companyId"
          :multiple="true"
          @change="applyUserIdChange"
          clearable
        />
      </el-form-item>
      <el-form-item label="职务" prop="applyUserPosition">
        <el-input v-model="formData.applyUserPosition" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-divider />
      <el-form-item label="填表日期" prop="writeTime">
        <el-date-picker
          v-model="formData.writeTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="出差事由" prop="travelCause">
        <el-input v-model="formData.travelCause" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-divider />
      <el-form-item label="会议培训期间费用单位支付" prop="payOrg">
        <el-input v-model="formData.payOrg" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-form-item label="拟出差开始日期" prop="beginTime">
        <el-date-picker
          v-model="formData.beginTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="拟出差结束日期" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="拟乘坐交通工具" prop="vehicleType">
        <el-select v-model="formData.vehicleType" placeholder="请选择">
          <el-option v-for="item in vehicleTypeOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否带车" prop="takeCar">
        <el-select v-model="formData.takeCar" placeholder="请选择">
          <el-option v-for="item in takeCarOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <div v-for="(item, index) in formData.travelList" :key="index">
        <el-divider />
        <div style="display: flex; justify-content: space-between;margin-bottom: 10px">
          <h6>行程{{ index + 1 }}</h6>
          <el-button type="text" v-if="index > 0" @click="deleteJourney(index)">删除行程</el-button>
        </div>
        <el-form-item label="出发地" :prop="'travelList.' + index + '.depart'" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
          <regionCascader v-model="item.depart" @allPathLabel="getDepartLabel($event, index)" />
        </el-form-item>
        <el-form-item label="目的地" :prop="'travelList.' + index + '.dest'" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
          <regionCascader v-model="item.dest" @allPathLabel="getDestLabel($event, index)" />
        </el-form-item>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="addJourney()">新增行程</el-button>
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { editApplyOrder } from "@/api/business/expenseAccount";
import regionCascader from "@/components/regionCascader/index";
import { mapGetters } from "vuex";
import { getDicts } from "@/api/common";

export default {
  name: 'accountVoucher',
  components: { regionCascader },
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
        travelList: [{}],
      },
      takeCarOption: [
        { label: '是', value: '是' },
        { label: '否', value: '否' },
      ],
      vehicleTypeOption: [],
      rules: {
        applyUserId: [{ required: true, message: '请选择' }],
        applyUserPosition: [{ required: true, message: '请选择' }],
        writeTime: [{ required: true, message: '请选择' }],
        travelCause: [{ required: true, message: '请输入' }],
        payOrg: [{ required: true, message: '请输入' }],
        beginTime: [{ required: true, message: '请选择' }],
        endTime: [{ required: true, message: '请选择' }],
        vehicleType: [{ required: true, message: '请输入' }],
        takeCar: [{ required: true, message: '请选择' }],
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
        // 处理数据格式：出发地和目的地，为了回显
        formData.travelList.forEach(v => {
          if (v.departProvCode) {
            v.depart = [v.departProvCode, v.departCityCode, v.departDistCode];
          }
          if (v.destProvCode) {
            v.dest = [v.destProvCode, v.destCityCode, v.destDistCode];
          }
        });
        // 由于出差人多选，处理出差人的数据格式，为了回显
        if (!Array.isArray(formData.applyUserId)) {
          formData.applyUserId = formData.applyUserId.split(",");
        }
        this.formData = formData;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.$refs.form.resetFields();
        this.formData.travelList = this.formData.travelList.slice(0, 1); // 关掉的时候只保留一个行程
      }
    }
  },
  created() {
    getDicts("vehicle").then(res => {
      this.vehicleTypeOption = res.data.list.map(v => ({ label: v.fullName, value: v.fullName }));
    });
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          // 处理一下出发地和目的地的数据，拆出来给对应字段
          this.formData.travelList.forEach((v) => {
            if (v.depart && v.depart.length > 0) {
              v.departProvCode = v.depart[0];
              v.departCityCode = v.depart[1];
              v.departDistCode = v.depart[2];
            }
            if (v.dest && v.dest.length > 0) {
              v.destProvCode = v.dest[0];
              v.destCityCode = v.dest[1];
              v.destDistCode = v.dest[2];
            }
          });
          // 提交的时候，再把出差人拆成，号分隔的
          const applyUserId = this.formData.applyUserId.join(",");
          editApplyOrder({ id: this.data.id, detailJson: JSON.stringify({ ...this.formData, applyUserId }) }).then(() => {
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
    addJourney() {
      this.formData.travelList.push({});
    },
    deleteJourney(index) {
      this.formData.travelList.splice(index, 1);
    },
    getDepartLabel(val, index) {
      this.formData.travelList[index].departProvCodeStr = val[0];
      this.formData.travelList[index].departCityCodeStr = val[1];
      this.formData.travelList[index].departDistCodeStr = val[2];
    },
    getDestLabel(val, index) {
      this.formData.travelList[index].destProvCodeStr = val[0];
      this.formData.travelList[index].destCityCodeStr = val[1];
      this.formData.travelList[index].destDistCodeStr = val[2];
    },
    applyUserIdChange(value, selected) {
      this.$nextTick(() => {
        this.formData.applyUserName = selected.map(v => v.fullName.split("/")[1]).join(",");
      });
    },
  }
}
</script>
<style lang="scss" scoped></style>
