<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main" element-loading-text="处理中，请稍等">
        <div class="JNPF-common-head">
          <div class="btn-container">
            <el-button type="primary" @click="onAdd">新增审批类型</el-button>
          </div>
        </div>
        <JNPF-table
          style="margin: 0 20px"
          v-loading="listLoading"
          :data="list"
          :list-query="listQuery"
        >
          <el-table-column
            label="单据类型"
            prop="orderBizType"
            algin="center"
          >
            <template slot-scope="scope">{{ scope.row.orderBizType * 1 === 1?'审批类单据':'报销类单据' }}</template>
          </el-table-column>
          <el-table-column
            prop="categoryName"
            label="类型名称"
            align="center"
          />
          <el-table-column
            prop="icon"
            label="icon"
            align="center"
          >
            <template slot-scope="scope"><img v-if="scope.row.icon" class="icon-img" :src="scope.row.icon" alt=""></template>
          </el-table-column>
          <el-table-column
            label="审批单数量"
            prop="approvalOrdersNum"
            algin="center"
          />
          <el-table-column
            label="关联管理角色"
            prop="adminRoleStr"
            algin="center"
            width="120"
          />
          <el-table-column
            label="使用部门"
            prop="viewDeptStr"
            algin="center"
          />
          <el-table-column
            label="使用人"
            prop="viewUserStr"
            algin="center"
          >
            <template slot-scope="scope">
              <div v-if="!scope.row.viewUserStr || scope.row.viewUserStr.length === 0 || scope.row.viewUserStr.split('、').length <= 3">{{ scope.row.viewUserStr }}</div>
              <el-tooltip v-else effect="dark" :content="scope.row.viewUserStr" placement="top">
                <div>{{ getViewUserStr(scope.row.viewUserStr) }}</div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            label="首页排序"
            prop="sort"
            algin="center"
          />
          <el-table-column
            label="最后修改时间"
            prop="updateTime"
            algin="left"
            width="160"
          />
          <el-table-column
            label="状态"
            prop="status"
            algin="center"
          >
            <template slot-scope="scope">
              <el-tag type="success" v-if="scope.row.status * 1 === 1">已启用</el-tag>
              <el-tag type="danger" v-else>已禁用</el-tag>
            </template>
          </el-table-column>
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
                @click="enableOrDisable(scope.row)"
              >{{ scope.row.status * 1 === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button
                type="text"
                @click="goToDetail(scope.row, scope.$index)"
              >详情
              </el-button>
            </template>
          </el-table-column>
        </JNPF-table>
        <pagination :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="initData" />
      </div>
    </div>
    <add-type
      :visible.sync="addType.visible"
      :loading="addType.loading"
      :data="addType.data"
      @confirm="initData"
    />
  </div>
</template>

<script>
import baseMixin from '@/mixins/print/baseMixin';
import AddType from "@/views/approvalTypeManage/components/addType.vue";
import { getCcdOrderCategoryPage, postCcdOrderCategoryUpdateStatus } from "@/api/business/approvalTypeManage";

export default {
  name: 'ApprovalOrderPrintManageIndex',
  components: { AddType },
  mixins: [baseMixin],
  data() {
    return {
      list: [],
      listLoading: false,
      listQuery: {
        current: 1,
        size: 20,
      },
      addType: {
        visible: false,
        loading: false,
        data: {},
      },
      total: 0,
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
    initData() {
      this.listLoading = true;
      let _query = {
        ...this.listQuery,
      };
      getCcdOrderCategoryPage(_query).then(res => {
        this.list = res.data.records;
        this.total = res.data.total;
        this.listLoading = false;
      }).finally(() => {
        this.listLoading = false;
      });
    },
    goToDetail(row) {
      const path = row.orderBizType * 1 === 1 ? '/applyTypeListManage' : '/exsTypeListManage';
      this.$router.push({
        path: path,
        query: {
          id: row.id,
          name: row.categoryName,
        }
      });
    },
    enableOrDisable(row) {
      postCcdOrderCategoryUpdateStatus({ id: row.id, status: row.status * 1 === 1 ? 0 : 1 }).then(() => {
        this.$message({
          type: 'success',
          message: "操作成功",
          onClose: () => {
            this.initData()
          }
        });
      })
    },
    getViewUserStr(str) {
      let strArr = str.split('、');
      return strArr[0] + '、' + strArr[1] + '、' + strArr[2] + '等' + strArr.length + '人'
    }
  },
}
</script>
<style lang="scss" scoped>
.btn-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
.icon-img {
  width: 24px;
  height: 24px;
}
</style>
