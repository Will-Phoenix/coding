<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div class="btn-container">
            <el-button type="primary" @click="downloadTemplate">下载模板</el-button>
            <el-button type="primary" style="margin-left: 10px" @click="onAddSubject(null)">新增一级科目</el-button>
            <el-button type="primary" style="margin-left: 10px" :loading="uploading" @click="$refs.input.click()">批量导入科目定义</el-button>
            <input ref="input" type="file" @change="onChangeFile" accept=".xls,.xlsx" style="display: none">
          </div>
        </div>
        <el-tabs style="margin: 10px 10px 0 10px" @tab-click="onChangeTab">
          <el-tab-pane v-for="(item,index) in typeList" :key="index" :label="item.label" :name="item.value" />
        </el-tabs>
        <vxe-table
          resizable
          style="margin: 0 10px"
          border
          size="small"
          ref="xTable"
          :tree-config="{transform: true, rowField: 'code', parentField: 'parentCode'}"
          :data="tableData"
          :loading="listLoading"
        >
          <vxe-column field="code" title="科目编号" tree-node width="160" />
          <vxe-column field="name" title="科目名称" min-width="160" />
          <vxe-column field="memCode" title="助记码" width="120" />
          <vxe-column field="subAttr" title="科目属性" width="120">
            <template #default="{ row }">
              <span>{{ getSubjectAttributeStr(row.subAttr) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="balDir" title="余额方向" width="120">
            <template #default="{ row }">
              <span>{{ getBalanceDirectionStr(row.balDir) }}</span>
            </template>
          </vxe-column>
          <vxe-column field="auxAccNames" title="已关联辅助核算" min-width="180" show-overflow />
          <vxe-column field="action" title="操作" width="220" fixed="right">
            <template #default="{row}">
              <el-button type="text" @click="onDelete(row)">删除</el-button>
              <el-button type="text" @click="onEditSubject(row)">编辑</el-button>
              <el-button type="text" @click="onAddSubject(row.parentCode)">增加同级</el-button>
              <el-button type="text" @click="onAddSubject(row.code)">增加下级</el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>
    </div>
    <add-subject
      :visible.sync="addSubject.visible"
      :data="addSubject.data"
      :subject-attribute-options="subjectAttributeOptions"
      :balance-direction-options="balanceDirectionOptions"
      :loading="addSubject.loading"
      @confirm="onAddSubjectConfirm"
    />
  </div>
</template>
<script>
import AddSubject from "@/views/unitSubjectDefinition/components/addSubject.vue";
import {
  getBalanceDirectionEnum,
  getFinUnitSubjectEntityList, getSubjectAttributeEnum,
  postFinUnitSubjectEntityDelete, downloadExcelTemplate, importUnitSubjectEntity
} from "@/api/business/unitSubjectDefinition";
import { saveAs } from 'file-saver'

export default {
  components: { AddSubject },
  data() {
    return {
      type: '',
      typeList: [],
      subjectAttributeOptions: [],
      balanceDirectionOptions: [],
      listLoading: false,
      tableData: [],
      addSubject: {
        visible: false,
        data: {},
        loading: false,
      },
      importFormVisible: false,
      uploading: false
    }
  },
  mounted() {
    this.loadBalanceDirectionOptions()
    this.loadSubjectAttributeOptions()
  },
  methods: {
    onChangeTab(tab) {
      this.type = tab.name
      this.loadList()
    },
    onAddSubject(parentCode) {
      this.addSubject.visible = true
      this.addSubject.data = { parentCode: parentCode }
    },
    onEditSubject(row) {
      this.addSubject.visible = true
      this.addSubject.data = { ...row }
    },
    onAddSubjectConfirm() {
      this.loadList()
    },
    async onDelete(row) {
      this.$confirm('确定要删除此科目？', '提示', {
        type: 'warning'
      }).then(async() => {
        // 判断是否末级科目
        let canDelete = true
        for (let i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].parentCode === row.code) {
            canDelete = false
            break
          }
        }
        if (!canDelete) {
          this.$message.error("不能删除非末级科目！");
          return
        }
        this.listLoading = true;
        // 请求删除接口
        postFinUnitSubjectEntityDelete(row.id).then(() => {
          this.$message.success("删除成功");
          this.loadList();
        })
          .finally(() => {
            this.listLoading = false;
          });
      })
    },
    loadBalanceDirectionOptions() {
      getBalanceDirectionEnum().then(res => {
        const list = res.data
        this.balanceDirectionOptions = list.map(v => {
          return {
            label: v.name,
            value: v.code * 1
          }
        })
      })
    },
    loadSubjectAttributeOptions() {
      getSubjectAttributeEnum().then(res => {
        const list = res.data
        this.typeList = []
        this.subjectAttributeOptions = []
        this.typeList.push({
          label: '全部',
          value: ''
        })
        for (let i = 0; i < list.length; i++) {
          let item = {
            label: list[i].name,
            value: list[i].code
          }
          this.subjectAttributeOptions.push(item)
          this.typeList.push(item)
        }
        this.type = this.typeList[0].value
        this.loadList()
      })
    },
    onChangeFile(e) {
      const file = e.target.files[0]
      this.uploading = true
      importUnitSubjectEntity(file).then(res => {
        let filename
        try {
          // attachment;filename=%E9%83%A8%E9%97%A8%E9%98%B2%E6%8E%A7%E4%BF%A1%E6%81%AF.xlsx
          filename = decodeURIComponent(res.headers["content-disposition"].split(";")[1].split("filename=")[1]);
        } catch (e) {
          filename = "科目定义导入结果.xlsx";
        }
        const blob = new Blob([res])
        saveAs(blob, filename)
        this.$message.success("导入成功");
        this.loadList()
      }).finally(() => {
        this.uploading = false
        this.$refs.input.value = null
      })
    },
    downloadTemplate() {
      downloadExcelTemplate().then(res => {
        let filename
        try {
          // attachment;filename=%E9%83%A8%E9%97%A8%E9%98%B2%E6%8E%A7%E4%BF%A1%E6%81%AF.xlsx
          filename = decodeURIComponent(res.headers["content-disposition"].split(";")[1].split("filename=")[1]);
        } catch (e) {
          filename = "科目定义导入模版.xlsx";
        }
        const blob = new Blob([res])
        saveAs(blob, filename)
      })
    },
    getSubjectAttributeStr(val) {
      for (let i = 0; i < this.subjectAttributeOptions.length; i++) {
        if ((val * 1) === this.subjectAttributeOptions[i].value * 1) {
          return this.subjectAttributeOptions[i].label
        }
      }
    },
    getBalanceDirectionStr(val) {
      for (let i = 0; i < this.balanceDirectionOptions.length; i++) {
        if ((val * 1) === this.balanceDirectionOptions[i].value * 1) {
          return this.balanceDirectionOptions[i].label
        }
      }
    },
    loadList() {
      this.listLoading = true
      const params = {
        subAttr: this.type
      }
      getFinUnitSubjectEntityList(params).then(res => {
        this.tableData = res.data
      }).finally(() => {
        this.listLoading = false
      });
    }
  }
}
</script>
<style scoped lang="scss">
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

::v-deep .el-tabs__nav-wrap::after {
  height: 0;
}
</style>
