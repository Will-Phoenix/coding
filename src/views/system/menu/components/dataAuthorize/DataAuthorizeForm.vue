<template>
  <div>
    <el-dialog :title="!dataForm.id ? '新建字段' : '编辑字段'" :close-on-click-modal="false"
      :close-on-press-escape="false" :visible.sync="visible" lock-scroll
      class="JNPF-dialog JNPF-dialog_center" width="630px">
      <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="100px"
        v-loading="formLoading" class="menuForm">
        <jnpf-form-tip-item label="字段名称" prop="enCode">
          <el-input v-model="dataForm.enCode" placeholder="请输入字段名称">
            <template slot="append">
              <el-button type="primary" @click="selectName">选择</el-button>
            </template>
          </el-input>
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="数据库表" prop="bindTable" v-if="dataForm.bindTable">
          <el-input v-model="dataForm.bindTable" placeholder="请输入数据库表" disabled>
          </el-input>
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="字段规则" prop="fieldRule">
          <el-select v-model="dataForm.fieldRule" placeholder="请选择字段规则" clearable
            @change="changeFieldRule">
            <el-option v-for="item in fieldRuleOptions" :key="item.value" :label="item.label"
              :value="item.value">
              <template v-if="item.value!=0">
                <span>{{item.label}}<el-tooltip :content="`与主表是一对${item.value==1?'一':'多'}的主从关系`"
                    placement="top-start">
                    <i class="el-icon-warning-outline" style="margin-left:5px"></i>
                  </el-tooltip></span>
              </template>
            </el-option>
          </el-select>
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="关联字段" prop="childTableKey"
          tip-label="输入表单设计内设计子表的控件字段名，例：tableField107" v-if="dataForm.fieldRule==2">
          <el-input v-model="dataForm.childTableKey" placeholder="请输入关联主表的子表控件名称" />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="字段说明" prop="fullName">
          <el-input v-model="dataForm.fullName" placeholder="输入字段说明" />
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="字段类型" prop="type">
          <el-select v-model="dataForm.type" placeholder="请选择" clearable>
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="条件符号" prop="conditionSymbol">
          <el-select v-model="conditionSymbol" multiple placeholder="请选择">
            <el-option v-for="item in conditionSymbolOptions" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="条件内容" prop="conditionText">
          <el-select v-model="dataForm.conditionText" placeholder="请选择" clearable>
            <el-option v-for="item in conditionTextOptions" :key="item.value" :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </jnpf-form-tip-item>
        <jnpf-form-tip-item label="备注" prop="description">
          <el-input v-model="dataForm.description" type="textarea" :rows="3" />
        </jnpf-form-tip-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">{{$t("common.cancelButton")}}</el-button>
        <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
          {{ $t("common.confirmButton") }}</el-button>
      </span>
    </el-dialog>
    <nameSelects :visible.sync="nameVisible" :value="dataForm.enCode" :moduleId="dataForm.moduleId"
      :title="dataForm.enCode" :dataType="dataType" :bindTable="dataForm.bindTable"
      :menuType="menuType" :treeData="treeData" ref="nameForm" @closeForm="closeForm" />
  </div>
</template>

<script>
import {
  createDataAuthorize,
  updateDataAuthorize,
  getDataAuthorizeInfo
} from "@/api/system/dataAuthorize";
import nameSelects from '../NameSelect.vue'
import { getVisualTables } from "@/api/system/authorize"
export default {
  components: { nameSelects },
  data() {
    return {
      visible: false,
      formLoading: false,
      btnLoading: false,
      typeOptions: [
        {
          value: "string",
          label: "string"
        },
        {
          value: "int",
          label: "int"
        },
        {
          value: "double",
          label: "double"
        },
        {
          value: "varchar",
          label: "varchar"
        },
        {
          value: "datetime",
          label: "datetime"
        },
        {
          value: "text",
          label: "text"
        },
        {
          value: "bigint",
          label: "bigint"
        }
      ],
      fieldRuleOptions: [
        { value: 0, label: "主表规则" },
        { value: 1, label: "副表规则" },
        { value: 2, label: "子表规则" }
      ],
      treeData: [],
      conditionTextOptions: [
        {
          value: "text",
          label: "任意文本"
        },
        {
          value: "@userId",
          label: "当前用户"
        },
        {
          value: "@userAraSubordinates",
          label: "当前用户及下属"
        },
        {
          value: "@companyId",
          label: "当前公司"
        },
        {
          value: "@organizeId",
          label: "当前组织"
        },
        {
          value: "@organizationAndSuborganization",
          label: "当前组织及子组织"
        },
        {
          value: "@branchManageOrganize",
          label: "当前分管组织"
        },
        {
          value: "@branchManageOrganizeAndSub",
          label: "当前分管组织及子组织"
        }
      ],
      conditionSymbolOptions: [
        {
          value: "Equal",
          label: "等于"
        },
        {
          value: "NotEqual",
          label: "不等于"
        },
        {
          value: "GreaterThan",
          label: "大于"
        },
        {
          value: "GreaterThanOrEqual",
          label: "大于等于"
        },
        {
          value: "LessThan",
          label: "小于"
        },
        {
          value: "LessThanOrEqual",
          label: "小于等于"
        }, {
          value: 'Included',
          label: '包含'
        }, {
          value: 'NotIncluded',
          label: '不包含'
        }, {
          value: 'IsNull',
          label: '是null'
        }, {
          value: 'IsNotNull',
          label: '不是null'
        }
      ],
      dataForm: {
        id: "",
        moduleId: "",
        fullName: "",
        enCode: "",
        type: "",
        conditionSymbol: "",
        conditionText: "",
        description: "",
        fieldRule: 0,
        childTableKey: ''
      },
      conditionSymbol: [],
      menuType: 2,
      nameVisible: false,
      dataRule: {
        enCode: [
          { required: true, message: "字段名称不能为空", trigger: "blur" }
        ],
        fieldRule: [
          { required: true, message: "主表规则不能为空", trigger: "blur" }
        ],
        fullName: [
          { required: true, message: "字段说明不能为空", trigger: "blur" }
        ],
        childTableKey: [
          { required: true, message: "关联字段不能为空", trigger: "blur" }
        ],
        type: [{ required: true, message: "请选择字段类型", trigger: "blur" }],
        conditionSymbol: [
          { required: true, message: "请选择条件符号", trigger: "blur" }
        ],
        conditionText: [
          { required: true, message: "请选择条件内容", trigger: "blur" }
        ]
      },
      enCodeOptions: [],
      dataType: ""
    };
  },
  methods: {
    init(moduleId, id, menuType, dataType) {
      this.menuType = menuType;
      this.dataType = dataType
      this.dataForm.id = id || "";
      this.dataForm.moduleId = moduleId;
      this.conditionSymbol = [];
      this.visible = true;
      this.formLoading = true
      this.treeData = []
      getVisualTables(moduleId, dataType).then(res => {
        let data = []
        for (const key in res.data.linkTables) {
          data.push({
            tableName: res.data.linkTables[key],
            dbLink: res.data.linkId
          })
        }
        this.treeData = data
      })
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        this.dataForm.bindTable = ''
        this.dataForm.fieldRule = 0
        // 获取字段数据
        if (this.dataForm.id) {
          getDataAuthorizeInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data;
            this.conditionSymbol = res.data.conditionSymbol
              ? res.data.conditionSymbol.split(",")
              : [];
          });
        }
        this.formLoading = false;
      });
    },
    selectName() {
      this.nameVisible = true
      this.$nextTick(() => {
        this.$refs.nameForm.openDialog();
      });
    },
    changeFieldRule() {
      this.dataForm.childTableKey = ''
    },
    closeForm(val, value) {
      this.dataForm.enCode = val
      this.dataForm.bindTable = value.tableName
      this.dataForm.fullName = value.fieldName || ''
    },
    onEnCodeChange(e) {
      let objVal;
      this.dataForm.fullName = "";
      this.dataForm.type = "";
      if (!!e) {
        this.enCodeOptions.forEach(o => {
          if (o.field === e) {
            objVal = {
              fullName: o.fieldName,
              type: o.dataType
            };
            return objVal;
          }
        });
        this.dataForm.fullName = objVal["fullName"];
        this.dataForm.type = objVal["type"];
      }
    },
    dataFormSubmit() {
      this.dataForm.conditionSymbol = this.conditionSymbol.join();
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.btnLoading = true;
          const formMethod = this.dataForm.id
            ? updateDataAuthorize
            : createDataAuthorize;
          formMethod(this.dataForm)
            .then(res => {
              this.$message({
                message: res.msg,
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.btnLoading = false;
                  this.$emit("refreshDataList");
                }
              });
            })
            .catch(() => {
              this.btnLoading = false;
            });
        }
      });
    }
  }
};
</script>
