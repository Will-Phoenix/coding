<template>
  <div class="flow-form" v-loading="loading" source="src/views/workFlow/workFlowForm/oaForm/ccdTravelApply">
    <div class="com-title">
      <h1>出差申请</h1>
    </div>
    <el-form
      ref="dataForm"
      :model="dataForm"
      :rules="dataRule"
      label-width="100px"
      :disabled="setting.readonly"
    >
      <el-row>
        <el-col :span="12" v-if="judgeShow('name')">
          <el-form-item label="流程标题" prop="name">
            <el-input
              v-model="dataForm.name"
              placeholder="流程标题"
              :disabled="judgeWrite('name')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('applyUserName')">
          <el-form-item label="申请人员" prop="applyUserName">
            <el-input
              v-model="dataForm.applyUserName"
              placeholder="申请人员"
              readonly
              :disabled="judgeWrite('applyUserName')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('createTime')">
          <el-form-item label="申请日期" prop="createTime">
            <el-date-picker
              v-model="dataForm.createTime"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              :editable="false"
              readonly
              :disabled="judgeWrite('createTime')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('applyUserDept')">
          <el-form-item label="申请部门" prop="applyUserDept">
            <el-input
              v-model="dataForm.applyUserDept"
              placeholder="申请部门"
              readonly
              :disabled="judgeWrite('applyUserDept')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="judgeShow('crossProv')">
          <el-form-item label="外出地" prop="crossProv">
            <el-radio-group v-model="dataForm.crossProv" :disabled="judgeWrite('crossProv')">
              <el-radio :label="item.value + ''" v-for="item in crossProvOptions" :key="item.value">{{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="judgeShow('userIds')">
          <el-form-item label="出差人员" prop="userIds">
            <el-input
              v-model="dataForm.userIdNames"
              placeholder="出差人员"
              readonly
              type="textarea"
              :rows="3"
              :disabled="judgeWrite('userIds')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="judgeShow('vehicleType')">
          <el-form-item label="出行方式" prop="vehicleType">
            <el-radio-group v-model="dataForm.vehicleType" :disabled="judgeWrite('vehicleType')">
              <el-radio :label="item.enCode" v-for="item in vehicleOptions" :key="item.enCode">{{ item.fullName }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="judgeShow('singleReturn')">
          <el-form-item label="单程往返" prop="singleReturn">
            <el-radio-group v-model="dataForm.singleReturn" :disabled="judgeWrite('singleReturn')">
              <el-radio :label="item.value + ''" v-for="item in singleReturnOptions" :key="item.value">{{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="judgeShow('departProvCode')">
          <el-form-item label="出发地">
            <span style="color: #606266;">{{ dataForm.departProvCodeStr }}-{{ dataForm.departCityCodeStr }}-{{ dataForm.departDistCodeStr }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="judgeShow('destProvCode')">
          <el-form-item label="目的地">
            <span style="color: #606266;">{{ dataForm.destProvCodeStr }}-{{ dataForm.destCityCodeStr }}-{{ dataForm.destDistCodeStr }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="24" v-if="judgeShow('travelCause')">
          <el-form-item label="出差事由" prop="travelCause">
            <el-input
              v-model="dataForm.travelCause"
              placeholder="出差事由"
              type="textarea"
              :rows="3"
              :disabled="judgeWrite('travelCause')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('beginTime')">
          <el-form-item label="开始时间" prop="beginTime">
            <el-date-picker
              v-model="dataForm.beginTime"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              :editable="false"
              readonly
              :disabled="judgeWrite('beginTime')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('endTime')">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="dataForm.endTime"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              format="yyyy-MM-dd"
              :editable="false"
              :disabled="judgeWrite('endTime')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('days')">
          <el-form-item label="出差天数" prop="days">
            <el-input
              v-model="dataForm.days"
              placeholder="出差天数"
              :disabled="judgeWrite('days')"
            >
              <template slot="append">天</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('ramark')">
          <el-form-item label="备注" prop="ramark">
            <el-input
              type="textarea"
              :rows="3"
              v-model="dataForm.ramark"
              placeholder="备注"
              :disabled="judgeWrite('ramark')"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import comMixin from '../mixin';
import { getDictionaryDataSelector } from '@/api/systemData/dictionary';

export default {
  name: 'ccdTravelApply',
  mixins: [comMixin],
  data() {
    var checkStartTime = (rule, value, callback) => {
      if (!this.dataForm.leaveEndTime) {
        callback()
      } else {
        if (this.dataForm.leaveEndTime < value) {
          callback(new Error('起始日期应该小于结束日期'));
        } else {
          this.$refs.dataForm.validateField('endTime');
          callback()
        }
      }
    }
    var checkEndTime = (rule, value, callback) => {
      if (!this.dataForm.leaveStartTime) {
        callback()
      } else {
        if (this.dataForm.leaveStartTime > value) {
          callback(new Error('结束日期应该大于起始日期'));
        } else {
          callback()
        }
      }
    }
    return {
      billEnCode: 'WF_LeaveApplyNo',
      dataForm: {
        flowId: '',
        id: '',
        billNo: '',
        flowTitle: '',
        flowUrgent: 1,
        applyUser: '',
        applyDate: '',
        applyDept: '',
        applyPost: '',
        leaveType: '事假',
        leaveReason: '',
        leaveStartTime: '',
        leaveEndTime: '',
        leaveDayCount: '',
        leaveHour: '',
        fileJson: ''
      },
      dataRule: {
      },
      vehicleOptions: [],
      crossProvOptions: [
        {
          label: '省内',
          value: 0,
        },
        {
          label: '省外',
          value: 1,
        },
      ],
      singleReturnOptions: [
        {
          label: '单程',
          value: 0,
        },
        {
          label: '往返',
          value: 1,
        },
      ]
    }
  },
  mounted() {
    getDictionaryDataSelector('vehicle').then(res => {
      if (res.data) {
        this.vehicleOptions = res.data.list;
      }
    })
  },
  methods: {
    selfInit(data) {
      this.dataForm.applyDate = new Date().getTime()
      this.dataForm.flowTitle = this.userInfo.userName + "出差申请"
      // this.dataForm.applyUser = this.userInfo.userName + '/' + this.userInfo.userAccount
      // this.dataForm.applyDept = this.userInfo.organizeName
      // if (this.userInfo.positionIds && this.userInfo.positionIds.length) {
      //   let list = this.userInfo.positionIds.map(o => o.name)
      //   this.dataForm.applyPost = list.join(',')
      // }
    }
  },
}
</script>
