<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="8">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="query.name" placeholder="请输入姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="银行卡号" prop="bankNumber">
                  <el-input v-model="query.bankNumber" placeholder="请输入银行卡号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>
        <div class="btn-container">
          <el-button class="btn" @click="downloadFile">下载模版</el-button>
          <el-upload
            class="btn"
            :action="actionUrl"
            :headers="uploadHeaders"
            :on-success="handleSuccess"
            :on-error="() => { uploading = false;}"
            :show-file-list="false"
            :on-progress="() => { uploading = true;}"
            accept=".xls,.xlsx"
          >
            <el-button type="primary" :loading="uploading">导入银行卡信息</el-button>
          </el-upload>
          <el-button class="btn" type="primary" @click="onAdd">新增银行卡</el-button>
        </div>
        <JNPF-table
          style="margin: 0 20px"
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            prop="name"
            label="姓名/名称"
          />
          <el-table-column
            label="银行卡号"
            prop="bankNumber"
          />
          <el-table-column
            label="银行卡类型"
            prop="cardTypeStr"
          />
          <el-table-column
            label="开户银行"
            prop="baseOpened"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="120"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="onEdit(scope.row)"
              >编辑
              </el-button>
              <el-button
                type="text"
                @click="onDelete(scope.row)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <add-bank-card-info
      :visible.sync="addType.visible"
      :loading="addType.loading"
      :data="addType.data"
      @confirm="initData"
    />
  </div>
</template>

<script>
import baseMixin from '@/mixins/print/baseMixin';
import { saveAs } from "file-saver";
import AddBankCardInfo from "@/views/bankCardInfoManagement/components/addBankCardInfo.vue";
import { getCcdUserBankPage, postCcdUserBankRemove } from "@/api/business/bankCardInfoManagement";

export default {
  name: 'bankCardInfoManagement',
  components: { AddBankCardInfo },
  mixins: [baseMixin],
  data() {
    return {
      actionUrl: process.env.VUE_APP_BASE_API + "/api/cicada/ccdUserBank/import",
      uploadHeaders: { Authorization: this.$store.getters.token },
      list: [],
      listLoading: false,
      listQuery: {
        current: 1,
        size: 20,
      },
      query: {
        name: undefined,
        bankNumber: undefined,
      },
      addType: {
        visible: false,
        loading: false,
        data: {},
      },
      total: 0,
      uploading: false
    }
  },
  deactivated() {
    this.$deactivedLast = true;
  },
  activated() {
    if (this.$deactivedLast) {
      this.initData();
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    onAdd() {
      this.addType.visible = true;
      this.addType.data = {};
    },
    onEdit(row) {
      this.addType.visible = true;
      this.addType.data = { ...row };
    },
    // 搜索
    onSearch() {
      this.listQuery.current = 1;
      this.initData();
    },
    // 重置搜索条件
    onReset() {
      this.$refs.formRef && this.$refs.formRef.resetFields();
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
        ...this.query,
      };
      getCcdUserBankPage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    onDelete(row) {
      this.$confirm('确定要删除该银行卡信息?', '提示', {
        type: 'warning'
      }).then(() => {
        postCcdUserBankRemove({ id: row.id }).then(() => {
          this.$message.success("删除成功");
          this.initData();
        })
      });
    },
    downloadFile() {
      const url = "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/4faf1a83-aed7-48ac-a8e0-605569da939e.xlsx";
      saveAs(url, "电子凭证银行卡信息导入模版.xlsx");
    },
    handleSuccess(response, file, fileList) {
      // console.log("handleSuccess", { response, file, fileList });
      this.uploading = false;
      if (response.code === 200) {
        this.initData();
        this.$message({
          type: "success",
          message: response.msg || "导入成功",
        });
      } else {
        this.$message({
          type: "error",
          message: response.msg || '导入失败',
        });
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0 20px 12px 20px;
  .btn + .btn {
    margin-left: 12px;
  }
}
.align {
  text-align: center;
}
.query-flex {
  display: flex;
  flex-wrap: wrap;
}
.icon-img {
  width: 24px;
  height: 24px;
}
</style>
