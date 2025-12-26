<template>
  <el-dialog
    :title="!dataForm.id ? '新建' :'编辑'"
    :close-on-click-modal="false"
    append-to-body
    :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" :rules="rules" size="small" label-width="180px" label-position="left">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="省市区"
              prop="areaId"
            >
              <el-cascader ref="areaId" v-model="dataForm.areaId" :props="props"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="岗位类型"
              prop="positionType"
            >
              <el-select
                v-model="dataForm.positionType"
                placeholder="请选择..."
              >
                <el-option
                  v-for="item in positionTypeOption"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.enCode"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="住宿标准费（元）"
              prop="peekAllowance"
            >
              <el-input-number
                v-model="dataForm.peekAllowance"
                placeholder="请输入"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="伙食补助费（元）"
              prop="foodAllowance"
            >
              <el-input-number
                v-model="dataForm.foodAllowance"
                placeholder="请输入"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="公杂费（元）"
              prop="publicMiscellaneousFees"
            >
              <el-input-number
                v-model="dataForm.publicMiscellaneousFees"
                placeholder="请输入"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间1"
              prop="peakSeasonfloatingDate1List"
            >
              <el-date-picker
                v-model="dataForm.peakSeasonfloatingDate1List"
                clearable
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="MM-dd"
                :picker-options="pickerOptions1"
                :append-to-body="false"
                popper-class="date_popper1"
                @change="changedate1"
                @focus="setPickerHeader('.date_popper1')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间1标准（元）"
              prop="peakSeasonFloatingRange1"
            >
              <el-input-number
                v-model="dataForm.peakSeasonFloatingRange1"
                placeholder="请输入"
                :disabled="!dataForm.peakSeasonfloatingDate1List"
                :min="0"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间2"
              prop="peakSeasonfloatingDate2List"
            >
              <el-date-picker
                v-model="dataForm.peakSeasonfloatingDate2List"
                clearable
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="MM-dd"
                :picker-options="pickerOptions2"
                :append-to-body="false"
                popper-class="date_popper2"
                @change="changedate2"
                @focus="setPickerHeader('.date_popper2')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间2标准（元）"
              prop="peakSeasonFloatingRange2"
            >
              <el-input-number
                v-model="dataForm.peakSeasonFloatingRange2"
                placeholder="请输入"
                :disabled="!dataForm.peakSeasonfloatingDate2List"
                :min="0"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间3"
              prop="peakSeasonfloatingDate3List"
            >
              <el-date-picker
                v-model="dataForm.peakSeasonfloatingDate3List"
                clearable
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="MM-dd"
                :picker-options="pickerOptions3"
                :append-to-body="false"
                popper-class="date_popper3"
                @change="changedate3"
                @focus="setPickerHeader('.date_popper3')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间3标准（元）"
              prop="peak_season_floating_range3"
            >
              <el-input-number
                v-model="dataForm.peak_season_floating_range3"
                placeholder="请输入"
                :disabled="!dataForm.peakSeasonfloatingDate3List"
                :min="0"
                :max="999999999"
                :step="1"
              />
            </el-form-item>
          </el-col>
        </template>
      </el-form>
      <SelectDialog
        v-if="selectDialogVisible"
        :config="currTableConf"
        :form-data="dataForm"
        ref="selectDialog"
        @select="addForSelect"
        @close="selectDialogVisible=false"
      />
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false"> 取 消</el-button>
      <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading"> 确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {
  getProvinceList
} from '@/api/system/province'
import { saveRegionRules, updateRegionRules } from "@/api/business/travelRules";
import dayjs from 'dayjs';

export default {
  components: {},
  props: [],
  data() {
    const validateHot1 = (rule, value, callback) => {
        if (this.dataForm.peakSeasonfloatingDate1List && this.dataForm.peakSeasonfloatingDate1List.length) {
          if (!value) {
            callback(new Error('请输入旺季浮动区间1标准费用'))
          }
        }
        callback()
      },
      validateHot2 = (rule, value, callback) => {
        if (this.dataForm.peakSeasonfloatingDate2List && this.dataForm.peakSeasonfloatingDate2List.length) {
          if (!value) {
            callback(new Error('请输入旺季浮动区间2标准费用'))
          }
        }
        callback()
      },
      validateHot3 = (rule, value, callback) => {
        if (this.dataForm.peakSeasonfloatingDate3List && this.dataForm.peakSeasonfloatingDate3List.length) {
          if (!value) {
            callback(new Error('请输入旺季浮动区间3标准费用'))
          }
        }
        callback()
      }
    return {
      props: {
        lazy: true,
        expandTrigger: 'hover',
        checkStrictly: true,
        lazyLoad(node, resolve) {
          // 调用接口取数据
          getProvinceList(node.value || -1).then(res => {
            const nodes = res.data.list.map(item => ({
              label: item.fullName,
              value: item.id,
              leaf: node.level >= 2
            }));
            resolve(nodes)
          })
        }
      },
      visible: false,
      loading: false,
      btnLoading: false,
      selectDialogVisible: false,
      positionTypeOption: [], // 岗位类型选项
      currTableConf: {},
      addTableConf: {
      },
      tableRows: {
      },
      currVmodel: "",
      dataForm: {
        areaId: [],
        areaName: "",
        positionType: '', // 岗位
        peekAllowance: undefined,
        foodAllowance: undefined,
        publicMiscellaneousFees: undefined,
        peakSeasonfloatingDate1List: null, // 旺季区间1
        peakSeasonFloatingRange1: undefined, // 旺季区间标准1
        peakSeasonfloatingDate2List: null, // 旺季区间2
        peakSeasonFloatingRange2: undefined, // 旺季区间标准2
        peakSeasonfloatingDate3List: null, // 旺季区间3
        peak_season_floating_range3: undefined, // 旺季区间标准3
      },
      rules:
      {
        areaId: [
          {
            required: true,
            message: '清选择',
            trigger: 'change'
          },
        ],
        positionType: [
          {
            required: true,
            message: '请选择',
            trigger: 'click'
          },
        ],
        peekAllowance: [
          {
            required: true,
            message: '请输入',
            trigger: ["blur"]
          },
        ],
        foodAllowance: [
          {
            required: true,
            message: '请输入',
            trigger: ["blur"]
          },
        ],
        publicMiscellaneousFees: [
          {
            required: true,
            message: '请输入',
            trigger: ["blur"]
          },
        ],
        peakSeasonFloatingRange1: [
          { validator: validateHot1, trigger: 'blur' }
        ],
        peakSeasonFloatingRange2: [
          { validator: validateHot2, trigger: 'blur' }
        ],
        peak_season_floating_range3: [
          { validator: validateHot3, trigger: 'blur' }
        ],
      },
      pickerOptions1: {
        disabledDate: (time) => {
          // 如果其余两个时间区间已经选择，区间1选择范围不能与其它两个有交集
          const peakSeasonfloatingDate2List = this.dataForm.peakSeasonfloatingDate2List,
            peakSeasonfloatingDate3List = this.dataForm.peakSeasonfloatingDate3List
          let disabled = false
          if (peakSeasonfloatingDate2List && peakSeasonfloatingDate2List.length) {
            if (time >= peakSeasonfloatingDate2List[0] && time <= peakSeasonfloatingDate2List[1]) {
              disabled = true
            }
          }
          if (peakSeasonfloatingDate3List && peakSeasonfloatingDate3List.length) {
            if (time >= peakSeasonfloatingDate3List[0] && time <= peakSeasonfloatingDate3List[1]) {
              disabled = true
            }
          }
          return disabled
        },
      },
      pickerOptions2: {
        disabledDate: (time) => {
          // 如果其余两个时间区间已经选择，区间2选择范围不能与其它两个有交集
          const peakSeasonfloatingDate1List = this.dataForm.peakSeasonfloatingDate1List,
            peakSeasonfloatingDate3List = this.dataForm.peakSeasonfloatingDate3List
          let disabled = false
          if (peakSeasonfloatingDate1List && peakSeasonfloatingDate1List.length) {
            if (time >= peakSeasonfloatingDate1List[0] && time <= peakSeasonfloatingDate1List[1]) {
              disabled = true
            }
          }
          if (peakSeasonfloatingDate3List && peakSeasonfloatingDate3List.length) {
            if (time >= peakSeasonfloatingDate3List[0] && time <= peakSeasonfloatingDate3List[1]) {
              disabled = true
            }
          }
          return disabled
        },
      },
      pickerOptions3: {
        disabledDate: (time) => {
          // 如果其余两个时间区间已经选择，区间2选择范围不能与其它两个有交集
          const peakSeasonfloatingDate1List = this.dataForm.peakSeasonfloatingDate1List,
            peakSeasonfloatingDate2List = this.dataForm.peakSeasonfloatingDate2List
          let disabled = false
          if (peakSeasonfloatingDate1List && peakSeasonfloatingDate1List.length) {
            if (time >= peakSeasonfloatingDate1List[0] && time <= peakSeasonfloatingDate1List[1]) {
              disabled = true
            }
          }
          if (peakSeasonfloatingDate2List && peakSeasonfloatingDate2List.length) {
            if (time >= peakSeasonfloatingDate2List[0] && time <= peakSeasonfloatingDate2List[1]) {
              disabled = true
            }
          }
          return disabled
        },
      },
      political: []
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {},
  methods: {
    clearData() {
      this.dataForm.peakSeasonfloatingDate1List = null;
      this.dataForm.peakSeasonfloatingDate2List = null;
      this.dataForm.peakSeasonfloatingDate3List = null;
    },
    init(id, row) {
      this.dataForm.id = id || "";
      this.visible = true;
      this.$nextTick(() => {
        this.$refs['elForm'].resetFields();
        this.clearData();
        // 获取岗位类型
        this.$store.dispatch('base/getDictionaryData', { sort: 'PositionType' }).then(res => {
          this.positionTypeOption = res;
        });
        if (this.dataForm.id) {
          // 从列表获取数据并赋值给表单---回显
          Object.keys(this.dataForm).forEach(key => {
            if (row[key]) {
              this.dataForm[key] = row[key];
            }
          });
          // 对4个麻烦字段进行回显的，专门处理
          this.dataForm.areaId = JSON.parse(row.areaIdChain);
          if (row.peakSeasonfloatingDate1Show !== "null") {
            this.dataForm.peakSeasonfloatingDate1List = JSON.parse(row.peakSeasonfloatingDate1Show).map(v => dayjs(v));
          }
          if (row.peakSeasonfloatingDate2Show !== "null") {
            this.dataForm.peakSeasonfloatingDate2List = JSON.parse(row.peakSeasonfloatingDate2Show).map(v => dayjs(v));
          }
          if (row.peakSeasonfloatingDate3Show !== "null") {
            this.dataForm.peakSeasonfloatingDate3List = JSON.parse(row.peakSeasonfloatingDate3Show).map(v => dayjs(v));
          }
        }
        console.log("回显数据", this.dataForm);
      });
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['elForm'].validate((valid) => {
        if (valid) {
          // 处理一下地区字段, 获取areaid的最后一个节点和对应的name
          const data = { ...this.dataForm };
          data.areaId = this.dataForm.areaId[this.dataForm.areaId.length - 1];
          // 编辑的时候有areName直接用，没有的话肯定是新增，直接拿选择节点的名称
          if (!data.areaName && this.$refs.areaId.getCheckedNodes()) {
            data.areaName = this.$refs.areaId.getCheckedNodes()[0].label;
          }
          data.areaIDchainList = this.dataForm.areaId;
          // 处理时间格式
          if (this.dataForm.peakSeasonfloatingDate1List) {
            data.peakSeasonfloatingDate1List = this.dataForm.peakSeasonfloatingDate1List.map(v => dayjs(v).format("YYYY-MM-DD HH:mm:ss"));
          }
          if (this.dataForm.peakSeasonfloatingDate2List) {
            data.peakSeasonfloatingDate2List = this.dataForm.peakSeasonfloatingDate2List.map(v => dayjs(v).format("YYYY-MM-DD HH:mm:ss"));
          }
          if (this.dataForm.peakSeasonfloatingDate3List) {
            data.peakSeasonfloatingDate3List = this.dataForm.peakSeasonfloatingDate3List.map(v => dayjs(v).format("YYYY-MM-DD HH:mm:ss"));
          }
          const method = this.dataForm.id ? updateRegionRules : saveRegionRules;
          method(data).then(res => {
            this.$message({
              type: "success",
              message: res.msg,
              onClose: () => {
                this.visible = false;
                this.$emit("refresh");
              },
            });
          });
        }
      })
    },
    openSelectDialog(key) {
      this.currTableConf = this.addTableConf[key]
      this.currVmodel = key
      this.selectDialogVisible = true
      this.$nextTick(() => {
        this.$refs.selectDialog.init()
      })
    },
    addForSelect(data) {
      for (let i = 0; i < data.length; i++) {
        let item = { ...this.tableRows[this.currVmodel], ...data[i] }
        this.dataForm[this.currVmodel].push(item)
      }
    },
    changedate1(v) {
      if (!v) {
        this.$refs.elForm.clearValidate(['peakSeasonFloatingRange1'])
        this.dataForm.peakSeasonFloatingRange1 = undefined
      }
    },
    changedate2(v) {
      if (!v) {
        this.$refs.elForm.clearValidate(['peakSeasonFloatingRange2'])
        this.dataForm.peakSeasonFloatingRange2 = undefined
      }
    },
    changedate3(v) {
      if (!v) {
        this.$refs.elForm.clearValidate(['peak_season_floating_range3'])
        this.dataForm.peak_season_floating_range3 = undefined
      }
    },
    setPickerHeader(className) {
      this.$nextTick(() => {
        const prebtn = document.querySelector(`${className} .el-icon-arrow-left`),
          nextbtn = document.querySelector(`${className} .el-icon-arrow-right`)
        // 监听上一月和下一月按钮点击事件，处理日期头部月份的显示和按钮显示
        prebtn.addEventListener('click', this.clickPreMonth)
        prebtn.setAttribute('data-attr', className)
        nextbtn.addEventListener('click', this.clickNextMonth)
        nextbtn.setAttribute('data-attr', className)
        this.setDateHeaderStyle(className)
      })
    },

    // 日期点击上一个月按钮
    clickPreMonth(e) {
      this.setDateHeaderStyle(e.target.getAttribute('data-attr'))
    },
    // 日期点击下一个月按钮
    clickNextMonth(e) {
      this.setDateHeaderStyle(e.target.getAttribute('data-attr'))
    },

    // 设置日期头显示
    setDateHeaderStyle(className) {
      const eles = document.querySelectorAll(`${className} .el-date-range-picker__header`),
        prebtn = document.querySelector(`${className} .el-icon-arrow-left`),
        nextbtn = document.querySelector(`${className} .el-icon-arrow-right`)
      // 将年月遮盖住，只显示月份
      eles.forEach(dom => {
        const dateStr = dom.lastElementChild.innerHTML,
          monthStr = dateStr.substring(7)
        dom.lastElementChild.setAttribute('class', 'dateStr')
        dom.lastElementChild.setAttribute('data-attr', monthStr)
      })
      // 控制上一月和下一月按钮的显隐
      let start = prebtn.nextElementSibling.getAttribute('data-attr').split(' ')[0],
        end = nextbtn.nextElementSibling.getAttribute('data-attr').split(' ')[0]
      // 控制按钮显示，只能从1月选到12月
      if (start == 1) {
        prebtn.style.display = 'none'
      } else {
        prebtn.style.display = ''
      }
      if (end == 12) {
        nextbtn.style.display = 'none'
      } else {
        nextbtn.style.display = ''
      }
    }
  },
}

</script>
<style lang="scss" scoped>
::v-deep .el-cascader,
::v-deep .el-select,
::v-deep .el-date-editor--daterange.el-input__inner {
  width: 100%;
}
::v-deep .el-icon-d-arrow-left:before {
  content: none;
}
::v-deep .el-icon-d-arrow-right:before {
  content: none;
}
::v-deep .el-icon-d-arrow-right:before {
  content: none;
}
::v-deep .el-date-range-picker__header .dateStr {
  position: relative;
}
::v-deep .el-date-range-picker__content.is-left .dateStr::before,
::v-deep .el-date-range-picker__content.is-right .dateStr::before {
  content: attr(data-attr);
  background: #fff;
  position: absolute;
  left: 0;
  right: 0;
}
.disN {
  display: none;
}
</style>
