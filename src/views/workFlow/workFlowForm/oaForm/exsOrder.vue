<template>
  <div class="flow-form" v-loading="loading" source="src/views/workFlow/workFlowForm/oaForm/exsOrder">
    <div class="com-title">
      <h1>报销申请</h1>
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
        <el-col :span="12" v-if="judgeShow('exsUserName')">
          <el-form-item label="申请人员" prop="exsUserName">
            <el-input
              v-model="dataForm.exsUserName"
              placeholder="申请人员"
              readonly
              :disabled="judgeWrite('exsUserName')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('projectName')">
          <el-form-item label="项目名称" prop="projectName">
            <el-input
              v-model="dataForm.projectName"
              placeholder="项目名称"
              readonly
              :disabled="judgeWrite('projectName')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="judgeShow('createTime')">
          <el-form-item label="申请日期" prop="createTime">
            <el-date-picker
              v-model="dataForm.createTime"
              type="date"
              placeholder="选择日期"
              value-format="timestamp"
              format="yyyy-MM-dd"
              :editable="false"
              readonly
              :disabled="judgeWrite('createTime')"
            />
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
        <div v-for="(item, index) in dataForm.travelDetailList" :key="index">
          <el-col :span="24">
            <el-form-item label-width="30">
              <groupTitle
                content-position="left"
                :closable="false"
                :content="'行程' + (index +1)"
                style="margin-left: 24px;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="judgeShow('travelDetailList.vehicleType')">
            <el-form-item label="出行方式" prop="travelDetailList.vehicleType">
              <el-radio-group v-model="item.vehicleType" :disabled="judgeWrite('travelDetailList.vehicleType')">
                <el-radio :label="opt.enCode" v-for="opt in vehicleOptions" :key="opt.enCode">{{ opt.fullName }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="judgeShow('travelDetailList.departProvCode')">
            <el-form-item label="出发地">
              <span style="color: #606266;">{{ item.departProvCodeStr }}-{{ item.departCityCodeStr }}-{{ item.departDistCodeStr }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="judgeShow('travelDetailList.destProvCode')">
            <el-form-item label="目的地">
              <span style="color: #606266;">{{ item.destProvCodeStr }}-{{ item.destCityCodeStr }}-{{ item.destDistCodeStr }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="judgeShow('travelDetailList.beginDate')">
            <el-form-item label="开始日期" prop="travelDetailList.beginDate">
              <el-date-picker
                v-model="item.beginDate"
                type="date"
                placeholder="选择日期"
                value-format="timestamp"
                format="yyyy-MM-dd"
                :editable="false"
                readonly
                :disabled="judgeWrite('travelDetailList.beginDate')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="judgeShow('travelDetailList.endDate')">
            <el-form-item label="结束日期" prop="travelDetailList.endDate">
              <el-date-picker
                v-model="item.endDate"
                type="date"
                placeholder="选择日期"
                value-format="timestamp"
                format="yyyy-MM-dd"
                :editable="false"
                :disabled="judgeWrite('travelDetailList.endDate')"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" v-if="judgeShow('travelDetailList.days')">
            <el-form-item label="天数" prop="travelDetailList.days">
              <el-input
                v-model="item.days"
                placeholder="天数"
                :disabled="judgeWrite('travelDetailList.days')"
              >
                <template slot="append">天</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="judgeShow('travelDetailList.travelCost')">
            <el-form-item label="出行费用" prop="travelDetailList.travelCost">
              <el-input
                v-model="item.travelCost"
                placeholder="出行费用"
                :disabled="judgeWrite('travelDetailList.travelCost')"
              >
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="judgeShow('travelDetailList.roomCost')">
            <el-form-item label="住宿费用" prop="travelDetailList.roomCost">
              <el-input
                v-model="item.roomCost"
                placeholder="住宿费用"
                :disabled="judgeWrite('travelDetailList.roomCost')"
              >
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="judgeShow('travelDetailList.userIds')">
            <el-form-item label="出差人员" prop="travelDetailList.userIds">
              <el-input
                v-model="item.userIdNames"
                placeholder="出差人员"
                readonly
                type="textarea"
                :rows="3"
                :disabled="judgeWrite('travelDetailList.userIds')"
              />
            </el-form-item>
          </el-col>
        </div>

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
      this.dataForm.flowTitle = this.userInfo.userName + "报销申请"
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
