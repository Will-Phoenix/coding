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
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="出差人" prop="travelUserIds">
        <userSelect
          v-model="formData.travelUserIds"
          placeholder="请选择"
          :parent-id="userInfo.companyId"
          :multiple="true"
          @change="travelUserIdsChange"
          clearable
        />
      </el-form-item>
      <el-form-item label="职别" prop="userLevel">
        <el-select ref="userLevelRef" v-model="formData.userLevel" :multiple="true" @change="userLevelChange" placeholder="请选择">
          <el-option v-for="item in userLevelOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-divider />
      <h6 style="margin-bottom: 10px">出差信息</h6>
      <el-form-item label="出差事由" prop="travelCause">
        <el-input v-model="formData.travelCause" placeholder="请输入" maxlength="150" />
      </el-form-item>
      <el-form-item label="出差开始日期" prop="beginTime">
        <el-date-picker
          v-model="formData.beginTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="出差结束日期" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择"
          style="width: 100%"
        />
      </el-form-item>
      <div v-for="(item, index) in formData.travelInfoDetails" :key="index">
        <el-divider />
        <div style="display: flex; justify-content: space-between;margin-bottom: 10px">
          <h6>行程{{ index + 1 }}</h6>
          <el-button type="text" v-if="index > 0" @click="deleteJourney(index)">删除行程</el-button>
        </div>
        <el-form-item label="日期" :prop="'travelInfoDetails.' + index + '.beginDate'" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
          <el-date-picker
            v-model="item.beginDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="出发地" :prop="'travelInfoDetails.' + index + '.depart'" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
          <regionCascader v-model="item.depart" @allPathLabel="getDepartLabel($event, index)" />
        </el-form-item>
        <el-form-item label="目的地" :prop="'travelInfoDetails.' + index + '.dest'">
          <regionCascader v-model="item.dest" @allPathLabel="getDestLabel($event, index)" />
        </el-form-item>
        <el-form-item label="车船费" :prop="'travelInfoDetails.' + index + '.vehicleCost'">
          <!--          <el-input-number :min="0" :max="10000000000" v-model="item.vehicleCost" controls-position="right" placeholder="请输入" style="width: 100%" />-->
          <el-input v-model="item.vehicleCost" type="number" placeholder="请输入" maxlength="10" min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="夜间乘车费" :prop="'travelInfoDetails.' + index + '.nightVehicleCost'">
          <!--          <el-input-number :min="0" :max="10000000000" v-model="item.nightVehicleCost" controls-position="right" placeholder="请输入" style="width: 100%" />-->
          <el-input v-model="item.nightVehicleCost" type="number" placeholder="请输入" maxlength="10" min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="住宿费" :prop="'travelInfoDetails.' + index + '.roomCost'">
          <!--          <el-input-number :min="0" :max="10000000000" v-model="item.roomCost" controls-position="right" placeholder="请输入" style="width: 100%" />-->
          <el-input v-model="item.roomCost" type="number" placeholder="请输入" maxlength="10" min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="其他" :prop="'travelInfoDetails.' + index + '.otherCost'">
          <!--          <el-input-number :min="0" :max="10000000000" v-model="item.otherCost" controls-position="right" placeholder="请输入" style="width: 100%" />-->
          <el-input v-model="item.otherCost" type="number" placeholder="请输入" maxlength="10" min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="天数" :prop="'travelInfoDetails.' + index + '.days'">
          <el-input-number :min="0" :max="10000000000" v-model="item.days" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
        <el-form-item label="标准" :prop="'travelInfoDetails.' + index + '.standardCost'">
          <el-input-number :min="0" :max="10000000000" v-model="item.standardCost" controls-position="right" placeholder="请输入" style="width: 100%" />
        </el-form-item>
        <el-form-item label="乘坐交通工具" :prop="'travelInfoDetails.' + index + '.vehicleType'" :rules="[{ required: true, message: '请选择', trigger: 'change' }]">
          <el-select v-model="item.vehicleType" clearable placeholder="请选择">
            <el-option v-for="item2 in vehicleTypeOption" :key="item2.value" :label="item2.label" :value="item2.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额" :prop="'travelInfoDetails.' + index + '.subsidyCost'">
          <el-input v-model="item.subsidyCost" type="number" placeholder="请输入" maxlength="10" min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="总金额（元）">
          {{ totalCost(index) }}
        </el-form-item>
        <el-form-item label="总金额大写">
          {{ totalCostCn(index) }}
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
import { editExsOrder } from "@/api/business/expenseAccount";
import regionCascader from "@/components/regionCascader/index";
import { cashToChinese, formatCash } from "@/utils/format";
import { getDicts } from "@/api/common"
import { mapGetters } from "vuex";

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
      detailJson: {}, // 这个是整个detailJson，要接收到，我们只改其中travelInfo部分
      formData: {
        travelUserIds: "",
        userLevel: "",
        travelCause: "",
        beginTime: "",
        endTime: "",
        travelInfoDetails: [
          {
            beginDate: "",
            depart: undefined,
            dest: "",
            vehicleCost: undefined,
            nightVehicleCost: undefined,
            roomCost: undefined,
            otherCost: undefined,
            days: undefined,
            standardCost: undefined,
            subsidyCost: "",
          }
        ],
      },
      userLevelOption: [{ label: "选项一", value: "1" }], // 职别选项
      vehicleTypeOption: [], // 交通工具选项
      rules: {
        travelUserIds: [{ required: true, message: '请选择' }],
        userLevel: [{ required: true, message: '请选择' }],
        travelCause: [{ required: true, message: '请输入' }],
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
    totalCost() {
      return (index) => {
        const obj = this.formData.travelInfoDetails[index];
        return formatCash(this.formatValue(obj.vehicleCost) + this.formatValue(obj.nightVehicleCost) + this.formatValue(obj.roomCost) + this.formatValue(obj.otherCost) + this.formatValue(obj.subsidyCost));
      };
    },
    totalCostCn() {
      return (index) => {
        return cashToChinese(this.totalCost(index)) || "零整元";
      };
    },
  },
  watch: {
    visible(n) {
      if (n) {
        const formData = JSON.parse(this.data.formData.detailJson).travelInfo;
        this.detailJson = JSON.parse(this.data.formData.detailJson);
        console.log("formData", formData);
        // 处理数据格式：出发地和目的地，为了回显
        formData.travelInfoDetails.forEach(v => {
          if (v.departProvCode) {
            v.depart = [v.departProvCode, v.departCityCode, v.departDistCode];
          }
          if (v.destProvCode) {
            v.dest = [v.destProvCode, v.destCityCode, v.destDistCode];
          }
        });
        // 由于出差人多选，处理出差人的数据格式，为了回显
        if (!Array.isArray(formData.travelUserIds)) {
          formData.travelUserIds = formData.travelUserIds.split(",");
        }
        // 由于职别多选，处理职别的数据格式，为了回显
        if (!Array.isArray(formData.userLevel)) {
          formData.userLevel = formData.userLevel.split(",");
        }
        this.formData = formData;
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.$refs.form.resetFields();
        this.formData.travelInfoDetails = this.formData.travelInfoDetails.slice(0, 1); // 关掉的时候只保留一个行程
      }
    }
  },
  created() {
    getDicts("BureauClassOfPos").then(res => {
      this.userLevelOption = res.data.list.map(v => ({ label: v.fullName, value: v.enCode }));
    });
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
          // 把通过总金额计算出的金额数和大写金额字段，传进去
          this.formData.travelInfoDetails.forEach((v, index) => {
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
            v.totalCost = this.totalCost(index);
            v.totalCostCn = this.totalCostCn(index);
          });
          // 提交的时候，再把出差人拆成，号分隔的
          const travelUserIds = this.formData.travelUserIds.join(",");
          // 提交的时候，把职别拆成，号分隔的
          const userLevel = this.formData.userLevel.join(",");
          const detailJson = Object.assign(this.detailJson, { travelInfo: { ...this.formData, travelUserIds, userLevel }});
          editExsOrder({ id: this.data.id, detailJson: JSON.stringify(detailJson) }).then(() => {
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
      this.formData.travelInfoDetails.push({});
    },
    deleteJourney(index) {
      this.formData.travelInfoDetails.splice(index, 1);
    },
    getDepartLabel(val, index) {
      this.formData.travelInfoDetails[index].departProvName = val[0];
      this.formData.travelInfoDetails[index].departCityName = val[1];
      this.formData.travelInfoDetails[index].departDistName = val[2];
    },
    getDestLabel(val, index) {
      this.formData.travelInfoDetails[index].destProvName = val[0];
      this.formData.travelInfoDetails[index].destCityName = val[1];
      this.formData.travelInfoDetails[index].destDistName = val[2];
    },
    formatValue(value) {
      return Number(value) || 0;
    },
    userLevelChange() {
      this.$nextTick(() => {
        // 当userLevel选择值改变时，同步改变其对应label
        this.formData.userLevelName = this.$refs.userLevelRef.selected.map(v => v.label).join(",");
      });
    },
    travelUserIdsChange(value, selected) {
      this.$nextTick(() => {
        this.formData.travelUserName = selected.map(v => v.fullName.split("/")[1]).join(",");
      });
    },
  }
}
</script>
<style lang="scss" scoped></style>
