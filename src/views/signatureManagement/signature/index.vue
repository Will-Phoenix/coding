<template>

  <div class="JNPF-common-layout">

    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <div>
            <el-button type="primary" icon="el-icon-plus" @click="addOrUpdateHandle()">新增签名
            </el-button>
          </div>
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link
                icon="icon-ym icon-ym-Refresh JNPF-common-head-icon"
                :underline="false"
                @click="initData()"
              />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table
          v-loading="listLoading"
          :data="list"
        >
          <el-table-column
            prop="name"
            label="签名人"
            align="left"
          />
          <el-table-column
            label="关联用户"
            algin="left"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.userPhone">{{ scope.row.userName }}({{ scope.row.userPhone}})</span>
              <span v-else>{{ scope.row.userName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="签名文件"
            prop="signSealImgName"
            algin="left"
          >
            <template slot-scope="scope">
              <el-image
                style="width: 100px; height: 100px"
                :src="scope.row.signSealImgUrl"
                :preview-src-list="[scope.row.signSealImgUrl,]">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column
            label="签名线下签订文件"
            prop="signSealAuthName"
            algin="left"
            min-width="150"
          >
            <template slot-scope="scope">
              <el-link type="primary" @click="downloadFile(scope.row.signSealAuthUrl, scope.row.signSealAuthName)">{{ scope.row.signSealAuthName }}</el-link>
            </template>
          </el-table-column>
          <el-table-column
            label="最后修改时间"
            prop="updateTime"
            algin="left"
          />
          <el-table-column
            label="操作"
            fixed="right"
            width="100"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="addOrUpdateHandle(scope.row.id, scope.row)"
              >编辑
              </el-button>
              <el-button
                type="text"
                @click="OnDelete(scope.row.id)"
              >删除
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="initData" />
      </div>
    </div>
    <JNPF-Form v-if="formVisible" ref="JNPFForm" @refresh="initData" />
  </div>
</template>

<script>
import { getCcdSignSealList, downloadFile, deleteCcdSignSeal } from "@/api/business/signature";
import { saveAs } from "file-saver";
import JNPFForm from './form'

export default {
  components: { JNPFForm },
  data() {
    return {
      list: [],
      listLoading: true,
      total: 0,
      listQuery: {
        currentPage: 1,
        pageSize: 20,
      },
      formVisible: false,
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.listLoading = true;
      getCcdSignSealList({ ...this.listQuery, type: 1 }).then(res => {
        this.list = res.data.records;
        this.list.forEach(v => {
          downloadFile(v.signSealAuthFid).then(res => {
            this.$set(v, "signSealAuthName", res.data.name);
            this.$set(v, "signSealAuthUrl", res.data.url);
          });
          downloadFile(v.signSealImgFid).then(res => {
            this.$set(v, "signSealImgName", res.data.name);
            this.$set(v, "signSealImgUrl", res.data.url);
          });
        });
        // for (const v of res.data.records) {
        //   await downloadFile(v.signSealAuthFid).then(res => {
        //     v.signSealAuthName = res.data.name;
        //     v.signSealAuthUrl = res.data.url;
        //   });
        //   await downloadFile(v.signSealImgFid).then(res => {
        //     v.signSealImgName = res.data.name;
        //     v.signSealImgUrl = res.data.url;
        //   });
        // }
        // this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      });
    },
    OnDelete(id) {
      this.$confirm('该操作将永久删除数据, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        deleteCcdSignSeal(id).then(() => {
          this.$message({
            type: "success",
            message: "操作成功",
            onClose: () => {
              this.initData();
            },
          });
        });
      }).catch(() => {
      });
    },
    addOrUpdateHandle(id, row) {
      this.formVisible = true;
      this.$nextTick(() => {
        this.$refs.JNPFForm.init(id, row);
      })
    },
    downloadFile(fileUrl, fileName) {
      this.$confirm('确认下载该文件?', '提示', {
        type: 'warning'
      }).then(() => {
        saveAs(fileUrl, fileName);
        this.$message.success("下载成功，请在浏览器下载列表中查看");
      });
    },
  }
}
</script>
