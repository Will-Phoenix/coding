<template>
  <div class="app-container JNPF-flex-main padbox">
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" size="small" label-width="200px" label-position="right">
        <template>
          <el-col :span="24">
            <div class="group">
              <span class="group-title">高铁规则</span>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item label="允许乘坐一等座" prop="trainFirstClass">
              <el-select v-model="dataForm.trainFirstClass" placeholder="请选择岗位类型" @change="changeTrainFirstClass" style="width: 40%">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.enCode"
                  :label="item.fullName"
                  :value="item.enCode"
                />
                <el-option
                  label="均不允许"
                  value="-1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="允许乘坐商务座"
              prop="trainBusinessClass"
            >
              <el-select v-model="dataForm.trainBusinessClass" placeholder="请选择岗位类型" @change="changeTrainBusinessClass" style="width: 40%">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.enCode"
                  :label="item.fullName"
                  :value="item.enCode"
                />
                <el-option
                  label="均不允许"
                  value="-1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="group">
              <span class="group-title">飞机规则</span>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="允许乘坐商务舱"
              prop="airFirstClass"
            >
              <el-select v-model="dataForm.airFirstClass" placeholder="请选择岗位类型" @change="changeAirFirstClass" style="width: 40%">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.enCode"
                  :label="item.fullName"
                  :value="item.enCode"
                />
                <el-option
                  label="均不允许"
                  value="-1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="允许乘坐头等舱"
              prop="airBusinessClass"
            >
              <el-select v-model="dataForm.airBusinessClass" placeholder="请选择岗位类型" @change="changeAirBusinessClass" style="width: 40%">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.enCode"
                  :label="item.fullName"
                  :value="item.enCode"
                />
                <el-option
                  label="均不允许"
                  value="-1"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="group">
              <span class="group-title">差旅跨部门报销</span>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="是否允许差旅跨部门报销"
              prop="crossDept"
            >
              <el-switch
                v-model="dataForm.crossDept"
                :active-value="1"
                :inactive-value="0"
                @change="changeCrossDept"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="group">
              <span class="group-title">出差申请单</span>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="出差时无需出差申请单角色"
              prop="crossTravel"
            >
              <el-select v-model="dataForm.crossTravel" placeholder="请选择岗位类型" @change="changeCrossTravel" style="width: 40%">
                <el-option
                  v-for="item in typeOptions"
                  :key="item.enCode"
                  :label="item.fullName"
                  :value="item.enCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="group">
              <span class="group-title">报销标准</span>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="是否允许有同行领导时按照领导标准报销"
              prop="leaderStandard"
              label-width="300px"
            >
              <el-switch
                v-model="dataForm.leaderStandard"
                :active-value="1"
                :inactive-value="0"
                @change="changeLeaderStandard"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="是否允许交通工具为公车时报销交通补助"
              prop="officialVehicle"
              label-width="300px"
            >
              <el-switch
                v-model="dataForm.officialVehicle"
                :active-value="1"
                :inactive-value="0"
                @change="changeOfficialVehicle"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="是否允许交通工具为自驾时报销交通补助"
              prop="selfDriving"
              label-width="300px"
            >
              <el-switch
                v-model="dataForm.selfDriving"
                :active-value="1"
                :inactive-value="0"
                @change="changeSelfDriving"
              />
            </el-form-item>
          </el-col>
          <!--          <el-col :span="24">-->
          <!--            <el-form-item label-width="0" style="text-align: center;">-->
          <!--              <el-button style="margin-top: 50px;" type="primary" @click="dataFormSubmit()" :loading="btnLoading">保存</el-button>-->
          <!--            </el-form-item>-->
          <!--          </el-col>-->
        </template>
      </el-form>
    </el-row>
  </div>
</template>
<script>
import { createCcdBizRules, getCcdBizRulesDetail } from "@/api/business/traffic";
import { getDicts } from "@/api/common"

export default {
  components: {},
  props: [],
  data() {
    return {
      typeOptions: [], // 岗位类型选项
      dataForm: {
        trainFirstClass: "",
        trainFirstClassId: "",
        trainBusinessClass: "",
        trainBusinessClassId: "",
        airFirstClass: "",
        airFirstClassId: "",
        airBusinessClass: "",
        airBusinessClassId: "",
        crossDept: "",
        crossDeptId: "",
        crossTravel: "",
        crossTravelId: "",
        leaderStandard: "",
        leaderStandardId: "",
        officialVehicle: "",
        officialVehicleId: "",
        selfDriving: "",
        selfDrivingId: "",
      },
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$nextTick(() => {
        // 获取岗位类型
        this.$store.dispatch('base/getDictionaryData', { sort: 'PositionType' }).then(res => {
          this.typeOptions = res;
        });
        // getDicts('PositionType').then(res => {
        //   this.typeOptions = res.data.list;
        // });
        // 请求列表接口，获取数据用来回显
        getCcdBizRulesDetail().then(res => {
          res.data.forEach(v => {
            if (v.ruleKey === "firstClass" && v.groupCode === "train") {
              this.dataForm.trainFirstClass = v.ruleValue;
              this.dataForm.trainFirstClassId = v.id;
            } else if (v.ruleKey === "businessClass" && v.groupCode === "train") {
              this.dataForm.trainBusinessClass = v.ruleValue;
              this.dataForm.trainBusinessClassId = v.id;
            } else if (v.ruleKey === "businessClass" && v.groupCode === "air") {
              this.dataForm.airFirstClass = v.ruleValue;
              this.dataForm.airFirstClassId = v.id;
            } else if (v.ruleKey === "secondClass" && v.groupCode === "air") {
              this.dataForm.airBusinessClass = v.ruleValue;
              this.dataForm.airBusinessClassId = v.id;
            } else if (v.ruleKey === "is" && v.groupCode === "cross") {
              this.dataForm.crossDept = Number(v.ruleValue);
              this.dataForm.crossDeptId = v.id;
            } else if (v.ruleKey === "is" && v.groupCode === "travel_cross") {
              this.dataForm.crossTravel = v.ruleValue;
              this.dataForm.crossTravelId = v.id;
            } else if (v.ruleKey === "is" && v.groupCode === "leaderStandard") {
              this.dataForm.leaderStandard = Number(v.ruleValue);
              this.dataForm.leaderStandardId = v.id;
            } else if (v.ruleKey === "is" && v.groupCode === "officialVehicle") {
              this.dataForm.officialVehicle = Number(v.ruleValue);
              this.dataForm.officialVehicleId = v.id;
            } else if (v.ruleKey === "is" && v.groupCode === "selfDriving") {
              this.dataForm.selfDriving = Number(v.ruleValue);
              this.dataForm.selfDrivingId = v.id;
            }
            // switch (v.ruleKey) {
            //   case "TRAIN_FIRSTCLASS":
            //     this.dataForm.trainFirstClass = v.ruleValue;
            //     this.dataForm.trainFirstClassId = v.id;
            //     break;
            //   case "TRAIN_BUSINESSCLASS":
            //     this.dataForm.trainBusinessClass = v.ruleValue;
            //     this.dataForm.trainBusinessClassId = v.id;
            //     break;
            //   case "AIR_BUSINESSCLASS":
            //     this.dataForm.airFirstClass = v.ruleValue;
            //     this.dataForm.airFirstClassId = v.id;
            //     break;
            //   case "AIR_SECONDCLASS":
            //     this.dataForm.airBusinessClass = v.ruleValue;
            //     this.dataForm.airBusinessClassId = v.id;
            //     break;
            //   case "CROSS_DEPT":
            //     this.dataForm.crossDept = Number(v.ruleValue);
            //     this.dataForm.crossDeptId = v.id;
            //     break;
            //   case "TRAVEL_ROLE":
            //     this.dataForm.crossTravel = v.ruleValue;
            //     this.dataForm.crossTravelId = v.id;
            //     break;
            // }
          });
        }
        );
        console.log("dataForm回显", this.dataForm);
      }
      );
    },
    // 提交修改
    // groupCode分类   ruleKey是key  ruleValue是value  id在编辑的时候带上id
    createOrUpdate(groupCode, ruleKey, ruleValue, id) {
      createCcdBizRules({ ruleKey, groupCode, ruleValue, id }).then(() => {
        this.init();
        this.$message.success("保存成功");
      });
    },
    // 高铁一等提交
    changeTrainFirstClass(value) {
      this.createOrUpdate("train", "firstClass", value, this.dataForm.trainFirstClassId);
    },
    // 高铁-商务座提交
    changeTrainBusinessClass(value) {
      this.createOrUpdate("train", "businessClass", value, this.dataForm.trainBusinessClassId);
    },
    // 飞机-一等座提交
    changeAirFirstClass(value) {
      this.createOrUpdate("air", "businessClass", value, this.dataForm.airFirstClassId);
    },
    // 飞机-商务座提交
    changeAirBusinessClass(value) {
      this.createOrUpdate("air", "secondClass", value, this.dataForm.airBusinessClassId);
    },
    // 跨部门报销
    changeCrossDept(value) {
      this.createOrUpdate("cross", "is", value, this.dataForm.crossDeptId);
    },
    // 出差时无需出差申请单角色-提交
    changeCrossTravel(value) {
      this.createOrUpdate("travel_cross", "is", value, this.dataForm.crossTravelId);
    },
    // 有同行领导时按照领导标准报销
    changeLeaderStandard(value) {
      this.createOrUpdate("leaderStandard", "is", value, this.dataForm.leaderStandardId);
    },
    // 交通工具为公车时报销交通补助
    changeOfficialVehicle(value) {
      this.createOrUpdate("officialVehicle", "is", value, this.dataForm.officialVehicleId);
    },
    // 交通工具为自驾时报销交通补助
    changeSelfDriving(value) {
      this.createOrUpdate("selfDriving", "is", value, this.dataForm.selfDrivingId);
    },
  },
}

</script>
<style lang="scss" scoped>
.padbox {
  padding: 24px 48px;
  overflow: auto;
}
::v-deep .popupSelect-container>.el-select {
    width: 400px;
}
.group {
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}
.group-title {
  position: relative;
  font-size: 15px;
  font-weight: 600;
  &::before {
    content: "";
    top: 0;
    width: 22px;
    height: 22px;
    background: linear-gradient(180deg, #2B58D8 0%, rgba(86, 144, 238, 0.4) 100%);
    border-radius: 4px;
    opacity: .2;
    position: absolute;
    transform: rotate(45deg);
  }
}
</style>
