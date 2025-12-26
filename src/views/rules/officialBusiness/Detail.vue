<template>
  <el-dialog
    title="详情"
    :close-on-click-modal="false"
    append-to-body
    :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-row :gutter="15" class="">
      <el-form ref="elForm" :model="dataForm" size="small" label-width="180px" label-position="left">
        <template v-if="!loading">
          <el-col :span="24">
            <el-form-item
              label="省市区"
              prop="name"
            >
              <p>{{ dataForm.name }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="角色"
              prop="positionlist"
            >
              <p>{{ dataForm.positionlist }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="住宿标准费用（元）"
              prop="probation"
            >
              <p>{{ dataForm.probation }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="伙食补助费（元）"
              prop="department"
            >
              <p>{{ dataForm.department }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="室内交通费（元）"
              prop="workingyears"
            >
              <p>{{ dataForm.workingyears }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间1"
              prop="birthday"
            >
              <p>{{ jnpf.toDate(dataForm.birthday,"yyyy-MM-dd") }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间1标准（元）"
              prop="phone"
            >
              <p>{{ dataForm.phone }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间2"
              prop="nation"
            >
              <p>{{ jnpf.toDate(dataForm.nation,"yyyy-MM-dd") }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间2标准（元）"
              prop="positionrank"
            >
              <p>{{ dataForm.positionrank }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间3"
              prop="email"
            >
              <p>{{ jnpf.toDate(dataForm.email,"yyyy-MM-dd") }}</p>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="旺季浮动区间3标准（元）"
              prop="sequence"
            >
              <p>{{ dataForm.sequence }}</p>
            </el-form-item>
          </el-col>
        </template>
      </el-form>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false"> 取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import request from '@/utils/request'
import PrintBrowse from '@/components/PrintBrowse'
import jnpf from '@/utils/jnpf'
export default {
  components: { PrintBrowse },
  props: [],
  data() {
    return {
      visible: false,
      loading: false,
      printBrowseVisible: false,
      printId: '',
      dataForm: {
        id: '',
        name: [],
        positionlist: '',
        probation: 0,
        department: 3,
        workingyears: 0,
        birthday: '',
        phone: 0,
        nation: '',
        positionrank: 0,
        email: '',
        sequence: 0,
      },

    }
  },
  computed: {},
  watch: {},
  created() {

  },
  mounted() {},
  methods: {
    dataInfo(dataAll) {
      let _dataAll = dataAll
      this.dataForm = _dataAll
    },

    init(id) {
      this.dataForm.id = id || 0;
      this.visible = true;
      this.$nextTick(() => {
        if (this.dataForm.id) {
          this.loading = true
          request({
            url: '/api/system/Base_entry/detail/' + this.dataForm.id,
            method: 'get'
          }).then(res => {
            this.dataInfo(res.data)
            this.loading = false
          })
        }
      })
    },
  },
}

</script>

