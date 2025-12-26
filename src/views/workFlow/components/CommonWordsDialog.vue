<template>
  <div source="src/views/workFlow/components/CommonWordsDialog.vue">
    <el-dialog title="选择审批常用语" :close-on-click-modal="false" width='500px' :visible.sync="visible"
      class="JNPF-dialog JNPF-dialog_center table-dialog" lock-scroll append-to-body>
      <JNPF-table :data="list" :border="false" @row-click="rowClick" :hasNO="false"
        :show-header='false'>
        <el-table-column width="35">
          <template slot-scope="scope">
            <el-radio :label="scope.row.id" v-model="checked">&nbsp;</el-radio>
          </template>
        </el-table-column>
        <el-table-column label="字段" prop="commonWordsText" align="left">
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="addOrUpdateHandle(scope.row.id)"
              v-if="scope.row.commonWordsType" icon="el-icon-edit-outline"
              class="outline"></el-button>
            <el-button type="text" class="JNPF-table-delBtn outline" icon="el-icon-delete"
              v-if="scope.row.commonWordsType" @click="handleDel(scope.row.id)"></el-button>
          </template>
        </el-table-column>
      </JNPF-table>
      <div class="table-actions" @click="addOrUpdateHandle()">
        <el-button type="text" icon="el-icon-plus">添加审批常用语</el-button>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" @click="select()" :loading="btnLoading">
          {{$t('common.confirmButton')}}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog :title="!this.dataForm.id?'新增审批常用语':'编辑审批常用语'" :close-on-click-modal="false"
      width='600px' :visible.sync="commonWordsVisible" class="JNPF-dialog JNPF-dialog_center"
      @close='cancel()' lock-scroll append-to-body>
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" v-loading="formLoading"
        label-width="100px">
        <el-form-item label="常用语" prop="commonWordsText">
          <el-input v-model="dataForm.commonWordsText" placeholder="输入常用语" />
        </el-form-item>
        <el-form-item label="排序" prop="sortCode">
          <el-input-number :min="0" :max="999999" v-model="dataForm.sortCode"
            controls-position="right" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel()">{{$t('common.cancelButton')}}</el-button>
        <el-button type="primary" :loading="dataFormBtnLoading" @click="dataFormSubmit(1)"
          :disabled='commonBtnLoading'>
          {{$t('common.confirmButton')}}</el-button>
        <el-button @click="dataFormSubmit(2)" type="primary" v-if="!this.dataForm.id"
          :loading="commonBtnLoading" :disabled='dataFormBtnLoading'>
          保存并新增
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  getSelector,
  Update,
  Create,
  getCommonWordsInfo,
  deleteCommonWords
} from '@/api/system/commonWords'
export default {
  components: {},
  props: {
  },
  data() {
    return {
      visible: false,
      eventType: '',
      dataForm: {
        systemNames: [],
        systemIds: [],
        commonWordsText: '',
        commonWordsType: 1,
        sortCode: '',
        enabledMark: 1,
      },
      dataRule: {
        commonWordsText: [
          { required: true, message: '请输入常用语', trigger: 'blur' },
        ],
      },
      list: [],
      listQuery: {
        keyword: '',
        currentPage: 1,
        pageSize: 20
      },
      checked: '',
      checkedRow: {},
      signVisible: false,
      signImg: '',
      btnLoading: false,
      title: '',
      label: '',
      commonWordsVisible: false,
      commonBtnLoading: false,
      formLoading: false,
      dataFormBtnLoading: false,
    }
  },
  computed: {
  },
  methods: {
    init() {
      this.visible = true
      this.initData()
    },
    addOrUpdateHandle(id) {
      this.commonWordsVisible = true
      this.formLoading = true
      this.dataForm.id = id || 0
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          getCommonWordsInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data || {}
            this.formLoading = false
          })
        }
        this.formLoading = false
      })
    },
    select() {
      if (!this.checked) return this.$message.warning("请选择一条数据")
      this.$emit('input', this.checked)
      this.$emit('change', this.checkedRow)
      this.visible = false
    },
    initData() {
      getSelector().then(res => {
        this.list = res.data.list || []
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    cancel() {
      this.commonWordsVisible = false
      this.initData()
    },
    clear() {
      this.checked = ''
      this.checkedRow = {}
      this.$emit('input', this.checked)
      this.$emit('change', this.checked, this.checkedRow)
    },
    closeDialog() {
      this.btnLoading = false
      this.visible = false
    },
    rowClick(row) {
      this.checked = row.id
      this.checkedRow = row
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        deleteCommonWords(id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1500,
            onClose: () => {
              this.checked = ''
              this.checkedRow = {}
              this.initData()
            }
          })
        })
      }).catch(() => { })
    },
    dataFormSubmit(type) {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (type == 2) {
            this.continueBtnLoading = true
          } else {
            this.dataFormBtnLoading = true
          }
          const formMethod = this.dataForm.id ? Update : Create
          formMethod(this.dataForm).then(res => {
            if (type == 2) {
              this.$message({
                message: res.msg,
                type: 'success',
                duration: 1500,
              })
              this.$nextTick(() => {
                this.continueBtnLoading = false
                this.$refs['dataForm'].resetFields()
              })
            } else {
              this.$message({
                message: res.msg,
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.commonWordsVisible = false
                  this.commonBtnLoading = false
                  this.dataFormBtnLoading = false
                  this.initData()
                }
              })
            }
          }).catch(() => {
            this.btnLoading = false
            this.commonWordsVisible = false

          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.outline {
  font-size: 22px;
}
.table-dialog {
  >>> .el-dialog__body {
    height: 30vh;
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .JNPF-common-search-box {
      margin-bottom: 0;
      .JNPF-common-search-box-right {
        padding: 10px 10px 0 0;
      }
    }
  }
}
</style>
