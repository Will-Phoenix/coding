<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div class="query-flex">
              <el-col :span="10">
                <el-form-item label="关键词" prop="keyWord">
                  <el-input
                    v-model="query.keyWord"
                    placeholder="请输入关键词查询"
                    clearable
                    @keyup.enter.native="onSearch"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="50px">
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>

        <div class="buttonHead">
          <el-button type="primary" @click="onCreate">新增发票共享</el-button>
        </div>

        <JNPF-table
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            prop="applyUserName"
            label="持有人"
            align="left"
          />
          <el-table-column
            label="共享人"
            prop="receivedUserName"
            algin="left"
          />
          <el-table-column
            prop="fileExtension"
            label="共享时间"
            align="left"
          >
            <template slot-scope="{ row }">
              <div>{{ row.expireFlag === 1 ? "长期" : "固定期限" }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="startTime"
            label="开始时间"
            align="left"
          >
            <template slot-scope="{ row }">
              <div>{{ row.startTime ? row.startTime : "-" }}</div>
            </template>
          </el-table-column>
          <el-table-column
            prop="endTime"
            label="结束时间"
            align="left"
          >
            <template slot-scope="{ row }">
              <div>{{ row.endTime ? row.endTime : "-" }}</div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            fixed="right"
            width="100"
          >
            <template slot-scope="scope">
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
      <AddSharer :visible.sync="createDialog.visible" :loading="createDialog.loading" @confirm="onConfirm" />
    </div>
  </div>
</template>

<script>
import AddSharer from "./addSharer";
import { sharerPage, sharerSave, sharerRemove } from "@/api/business/invoiceShare";

export default {
  components: { AddSharer },
  data() {
    return {
      list: [],
      listLoading: false,
      total: 0,
      createDialog: {
        visible: false,
        loading: false,
      },
      query: {
        keyWord: ""
      },
      listQuery: {
        current: 1,
        size: 20,
      },
    }
  },
  created() {
    this.initData();
  },
  methods: {
    // 搜索
    onSearch() {
      // 先把页码设置到第一页
      this.listQuery.current = 1;
      // 加载数据
      this.initData();
    },

    // 重置搜索条件
    onReset() {
      this.$refs.formRef.resetFields();
      this.onSearch();
    },
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
        ...this.query
      };
      sharerPage(_query).then(res => {
        this.list = res?.data?.records || [];
        this.total = res?.data?.total || 0;
      })
        .finally(() => {
          this.listLoading = false;
        });
    },
    onCreate() {
      Object.assign(this.createDialog, { visible: true, loading: false });
    },
    onConfirm(formData) {
      sharerSave(formData).then(() => {
        this.$message.success("操作成功");
        this.initData();
      });
    },
    onDelete(row) {
      this.$confirm('您确定要删除该共享, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        sharerRemove(row.id).then(() => {
          this.$message.success("删除成功");
          this.initData();
        });
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.query-flex {
  display: flex;
  flex-wrap: wrap;
}
.align {
  text-align: center;
}
.content {
  padding: 10px;
  display: flex;
  align-items: center;
}

.buttonHead {
  display: flex;
  align-items: center;
  padding: 14px 10px;
  flex-shrink: 0;
}
</style>
