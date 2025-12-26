<template>
  <el-dialog
    :visible.sync="visible"
    fullscreen
    lock-scroll
    class="JNPF-full-dialog"
    :show-close="false"
    :modal="false"
    append-to-body
    source="src/views/workFlow/formDesign/Form.vue"
  >
    <div class="JNPF-full-dialog-header">
      <div class="header-title">
        <img src="@/assets/images/jnpf.png" class="header-logo">
        <p class="header-txt" style="max-width: unset;" v-if="activeStep==0"> · 表单设计</p>
        <el-tooltip effect="dark" :content="dataForm.fullName" placement="bottom" v-else>
          <p class="header-txt" style="max-width: unset;"> · {{ dataForm.fullName }}</p>
        </el-tooltip>
      </div>
      <el-steps :active="activeStep" finish-status="success" simple class="steps">
        <el-step title="基础信息" @click.native="stepChick(0)" />
        <el-step title="表单设计" @click.native="stepChick(1)" />
      </el-steps>
      <div class="options" style="width: 450px;">
        <el-button @click="prev" :disabled="activeStep<=0||btnLoading">{{ $t('common.prev') }}
        </el-button>
        <el-button @click="next" :disabled="activeStep>=1||loading||btnLoading">
          {{ $t('common.next') }}
        </el-button>
        <template>
          <el-button
            type="primary"
            @click="dataFormSubmit(false)"
            :disabled="loading"
            :loading="btnLoading"
            v-if="dataForm.id"
          >保 存</el-button>
          <el-button
            type="primary"
            @click="dataFormSubmit(true)"
            :disabled="loading"
            :loading="btnLoading"
          >保存并关闭</el-button>
        </template>
        <el-button @click="closeDialog()">{{ $t('common.cancelButton') }}</el-button>
      </div>
    </div>
    <div class="main" v-loading="loading">
      <el-row type="flex" justify="center" align="middle" v-if="!activeStep" class="basic-box">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="10" class="basicForm">
          <el-form
            :model="dataForm"
            :rules="dataRule"
            ref="dataForm"
            label-width="120px"
            @submit.native.prevent
            label-position="right"
          >
            <jnpf-form-tip-item label="表单名称" prop="fullName">
              <el-input v-model="dataForm.fullName" placeholder="表单名称" maxlength="50" />
            </jnpf-form-tip-item>
            <jnpf-form-tip-item label="表单编码" prop="enCode">
              <el-input v-model="dataForm.enCode" placeholder="表单编码" maxlength="50" />
            </jnpf-form-tip-item>
            <jnpf-form-tip-item label="表单类型" prop="formType">
              <el-input v-model="formType" maxlength="50" disabled />
            </jnpf-form-tip-item>
            <el-form-item v-if="userInfo && userInfo.isAdministrator" label="所属单位/企业" prop="entId">
              <el-cascader
                v-model="dataForm.entId"
                placeholder="请选择单位/企业"
                :props="{multiple: false,emitPath: false,value: 'id',label: 'fullName'}"
                :options="orgOption"
                :show-all-levels="false"
                style="width: 100%"
              />
            </el-form-item>
            <template v-if="dataForm.formType==1">
              <jnpf-form-tip-item label="表单类别" prop="flowType">
                <el-radio-group v-model="dataForm.flowType" size="small">
                  <el-radio-button :label="0">发起表单</el-radio-button>
                  <el-radio-button :label="1">功能表单</el-radio-button>
                </el-radio-group>
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="Web地址" prop="urlAddress">
                <el-input v-model="dataForm.urlAddress" placeholder="Web地址">
                  <template slot="prepend">@/views/</template>
                </el-input>
              </jnpf-form-tip-item>
              <jnpf-form-tip-item
                label="App地址"
                prop="appUrlAddress"
                tip-label="APP地址配置为物理地址，需与代码同步更新。"
              >
                <el-input v-model="dataForm.appUrlAddress" placeholder="App地址" />
              </jnpf-form-tip-item>
              <jnpf-form-tip-item
                label="接口地址"
                prop="interfaceUrl"
                tip-label="后端接口请求地址, 系统将会请求地址中的saveData(post方法), getData(get方法)接口例：/api/example/UserController"
              >
                <el-input v-model="dataForm.interfaceUrl" placeholder="接口地址" />
              </jnpf-form-tip-item>
            </template>
            <jnpf-form-tip-item label="表单排序" prop="sortCode">
              <el-input-number
                :min="0"
                :max="999999"
                v-model="dataForm.sortCode"
                controls-position="right"
              />
            </jnpf-form-tip-item>
            <jnpf-form-tip-item label="表单说明" prop="description">
              <el-input
                v-model="dataForm.description"
                placeholder="流程说明"
                type="textarea"
                :rows="3"
              />
            </jnpf-form-tip-item>
            <template>
              <template v-if="dataForm.formType==2">
                <jnpf-form-tip-item label="数据连接">
                  <el-select
                    v-model="dataForm.dbLinkId"
                    placeholder="请选择数据库"
                    @change="onDbChange"
                    clearable
                  >
                    <el-option-group
                      v-for="group in dbOptions"
                      :key="group.fullName"
                      :label="group.fullName"
                    >
                      <el-option
                        v-for="item in group.children"
                        :key="item.id"
                        :label="item.fullName"
                        :value="item.id"
                      />
                    </el-option-group>
                  </el-select>
                </jnpf-form-tip-item>
                <el-table
                  :data="tables"
                  class="JNPF-common-table"
                  empty-text="点击“新增”可选择 1 条（单表）或 2 条以上（多表）"
                >
                  <el-table-column type="index" label="序号" width="50" align="center" />
                  <el-table-column prop="typeId" label="类别" width="65">
                    <template slot-scope="scope">
                      <el-tag v-if="scope.row.typeId=='1'">主表</el-tag>
                      <el-tag
                        type="warning"
                        v-else
                        @click="changeTable(scope.row)"
                        style="cursor:pointer"
                        title="点击设置成主表"
                      >从表</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="table" label="表名">
                    <template slot-scope="scope">
                      <el-tooltip :content="scope.row.tableName||scope.row.table" placement="top">
                        <span>{{ scope.row.table }}</span>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column prop="tableField" label="外键字段">
                    <template slot-scope="scope" v-if="scope.row.typeId !=='1'">
                      <el-select v-model="scope.row.tableField" placeholder="请选择">
                        <el-option
                          v-for="item in scope.row.fields"
                          :key="item.field"
                          :label="item.field"
                          :value="item.field"
                        />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column prop="relationField" label="关联主键">
                    <template slot-scope="scope" v-if="scope.row.typeId !=='1'">
                      <el-select v-model="scope.row.relationField" placeholder="请选择">
                        <el-option
                          v-for="item in mainTableFields"
                          :key="item.field"
                          :label="item.field"
                          :value="item.field"
                        />
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" fixed="right" width="50">
                    <template slot-scope="scope">
                      <el-button
                        size="mini"
                        type="text"
                        class="JNPF-table-delBtn"
                        @click="delItem(scope.row,scope.$index)"
                      >移除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <div class="table-actions" @click="openTableBox">
                  <el-button type="text" icon="el-icon-plus">新增一行</el-button>
                </div>
              </template>
            </template>
          </el-form>
        </el-col>
      </el-row>
      <template v-if="activeStep==1">
        <template v-if="this.dataForm.formType == 2">
          <Generator ref="generator" :conf="draftJson" :model-type="6" :db-type="dbType" />
        </template>
        <template v-else>
          <el-tabs class="mytbb" v-model="mytbb">
            <el-tab-pane label="字段设置" name="zdsz">
              <el-row type="flex" justify="center" align="middle" class="basic-box">
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="10" class="basicForm bf">
                  <FieldForm ref="fieldForm" :conf="draftJson" :en-code="dataForm.enCode" />
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="小程序动态表单设计器" name="appForm">
              <AppForm ref="appForm" :data-form="dataForm" :conf="moduleJson" @updateDraftJson="updateDraftJson" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </template>
    </div>
    <TableForm
      :visible.sync="formVisible"
      ref="tableForm"
      @closeForm="closeForm"
      :db-link-id="dataForm.dbLinkId"
    />
  </el-dialog>
</template>

<script>
import Generator from '@/components/Generator/index/Home'
import FieldForm from './FieldForm'
import TableForm from '@/views/generator/TableForm'
import mixin from '@/mixins/generator/common'
import { getFormInfo, Create, Update } from '@/api/workFlow/FormDesign'
import AppForm from '@/views/workFlow/formDesign/AppForm.vue'
import { getOrganizeTree } from "@/api/permission/organize";
import { mapGetters } from "vuex";

export default {
  components: { AppForm, Generator, FieldForm, TableForm },
  mixins: [mixin],
  data() {
    return {
      visible: false,
      loading: false,
      activeStep: 0,
      mytbb: 'zdsz',
      dataForm: {
        id: '',
        fullName: '',
        enCode: '',
        dbLinkId: '0',
        sortCode: 0,
        category: '',
        description: "",
        tables: '',
        formType: 2,
        columnData: '',
        interfaceUrl: '',
        flowType: '',
        entId: '',
      },
      dataRule: {
        fullName: [
          { required: true, message: '表单名称不能为空', trigger: 'blur' },
          // { pattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/, message: '请输入正确的表单名称', trigger: 'blur' },
        ],
        enCode: [
          { required: true, message: '表单编码不能为空', trigger: 'blur' },
          { pattern: /^\w+$/, message: '请输入正确的表单编码', trigger: 'blur' },
        ],
        formType: [
          { required: true, message: '表单类型不能为空', trigger: 'blur' }
        ],
        flowType: [
          { required: true, message: '表单类别不能为空', trigger: 'blur' }
        ],
        entId: [
          { required: true, message: '请选择单位/企业', trigger: 'blur' }
        ],
      },
      tables: [],
      formVisible: false,
      btnLoading: false,
      mainTableFields: [],
      relationTable: "",
      draftJson: null,
      moduleJson: '',
      iconBoxVisible: false,
      dbOptions: [],
      formType: '系统表单',
      dbType: "MySQL",
      defaultTable: [],
      orgOption: [] // 企业选项
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created() {
    getOrganizeTree().then(res => {
      this.orgOption = res.data.list;
    })
  },
  methods: {
    init(id, flowType, formType) {
      this.activeStep = 0
      this.tables = []
      this.defaultTable = []
      this.dataForm.id = id || ''
      this.getDbOptions()
      this.visible = true
      this.loading = true
      this.$nextTick(() => {
        if (this.dataForm.id) {
          getFormInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.formType = res.data.formType == 2 ? "自定义表单" : "系统表单"
            this.draftJson = res.data.draftJson && JSON.parse(res.data.draftJson)
            this.moduleJson = res.data.moduleJson;
            this.tables = this.dataForm.tableJson && JSON.parse(this.dataForm.tableJson) || []
            this.defaultTable = JSON.parse(JSON.stringify(this.tables))
            this.updateFields()
          }).catch(() => { this.loading = false })
        } else {
          this.dataForm.flowType = flowType
          this.dataForm.formType = formType
          this.formType = formType == 2 ? "自定义表单" : "系统表单"
          this.loading = false
        }
      })
    },
    dataFormSubmit(close) {
      if (this.activeStep === 1) {
        if (this.$refs.appForm) {
          try {
            const moduleJson = this.$refs.appForm.getData();
            if (moduleJson && moduleJson.groups && moduleJson.groups.length > 0) {
              this.moduleJson = JSON.stringify(moduleJson);
            } else {
              this.moduleJson = '';
            }
          } catch (e) {
            const msg = e.msg || e.message;
            msg && this.$message.warning(msg)
            return;
          }
        }
        const model = this.dataForm.formType == 2 ? 'generator' : 'fieldForm'
        this.$refs[model].getData().then(res => {
          this.dataForm.draftJson = JSON.stringify(res.formData)
          this.dataForm.tableJson = JSON.stringify(this.tables)
          this.draftJson = res.formData
          this.submit(close)
        }).catch(err => {
          err.msg && this.$message.warning(err.msg)
        })
      } else {
        if (!this.tables.length && this.defaultTable.length) return this.$message.warning('请至少选择一个数据表')
        this.$refs['dataForm'].validate((valid) => {
          this.dataForm.tableJson = JSON.stringify(this.tables)
          if (!valid) return
          this.submit(close)
        })
      }
    },
    submit(close = true) {
      this.btnLoading = true
      const formMethod = this.dataForm.id ? Update : Create
      formMethod({ ...this.dataForm, moduleJson: this.moduleJson }).then((res) => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            if (close) {
              this.closeDialog(true)
            } else {
              this.btnLoading = false;
            }
          }
        })
      }).catch(() => { this.btnLoading = false })
    },
    next() {
      if (this.activeStep < 1) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.getDbType()
            if (!this.tables.length) {
              if (this.defaultTable.length) {
                this.$message.warning('请至少选择一个数据表')
                return
              }
              this.$store.commit('generator/SET_TABLE', false)
              this.activeStep += 1
            } else {
              if (!this.exist()) return
              let subTable = this.tables.filter(o => o.typeId == '0')
              this.$store.commit('generator/UPDATE_SUB_TABLE', subTable)
              this.$store.commit('generator/SET_ALL_TABLE', this.tables)
              this.$store.commit('generator/SET_TABLE', true)
              this.$store.commit('generator/UPDATE_FORMITEM_LIST', this.mainTableFields)
              this.activeStep += 1
            }
          }
        })
      }
    },
    typeChange(val) {
      if (val == 1) {
        this.dataForm.icon = ''
        this.dataForm.iconBackground = '#008cff'
      }
    },
    updateDraftJson(exportFields, unExportFields) {
      const pushed = [];
      exportFields.forEach(a => {
        const index = this.$refs.fieldForm.drawingList.findIndex(v => v.filedId === a.fieldName);
        if (index < 0) {
          this.$refs.fieldForm.drawingList.push({
            filedId: a.fieldName,
            filedName: a.label,
            jnpfKey: "",
            multiple: false,
            required: false });
        } else {
          this.$set(this.$refs.fieldForm.drawingList[index], 'filedName', a.label)
        }
        pushed.push(`${a.label}(${a.fieldName})`)
      })
      if (pushed.length > 0) {
        this.$message.success(`已同步${pushed.length}个字段: ${pushed.join('、')}`)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
>>> .steps {
  padding: 6px 99px !important;
}
.bf {
  width: 100%!important;
  padding-top: 0!important;
}
.mytbb {
  background: white;
  height: 100%;
  ::v-deep .el-tabs__header {
    margin: 0;
  }
  ::v-deep .el-tabs__nav-wrap {
    padding: 0 20px;
  }
  ::v-deep .el-tabs__content {
    height: calc(100% - 40px);
  }
  ::v-deep .el-tab-pane {
    height: 100%;
  }
}
</style>
