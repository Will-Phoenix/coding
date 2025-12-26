<template>
  <el-dialog
    title="新增审批类型"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="600px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="单据类型" prop="orderBizType">
        <el-select v-model="formData.orderBizType" placeholder="请选择单据类型">
          <el-option label="审批类单据" :value="1" />
          <el-option label="报销类单据" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型名称" prop="categoryName">
        <el-input v-model="formData.categoryName" placeholder="请输入类型名称" />
      </el-form-item>
      <el-form-item label="关联管理角色" prop="adminRole">
        <div class="row-container">
          <el-select
            v-model="formData.adminRole"
            :disabled="roleAllChecked"
            placeholder="选择角色"
            multiple
            filterable
            clearable
          >
            <el-option-group
              v-for="group in roleTreeData"
              :key="group.id"
              :label="group.fullName+(group.num?'【'+group.num+'】':'')"
            >
              <el-option
                v-for="item in group.children"
                :key="group.id+item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
          <el-checkbox style="margin-left: 10px" v-model="roleAllChecked">全选</el-checkbox>
        </div>
      </el-form-item>
      <el-form-item label="使用部门" prop="viewDept">
        <div class="row-container">
          <DepSelect
            :disabled="deptAllChecked"
            style="flex: 1"
            v-model="formData.viewDept"
            placeholder="请选择部门"
            select-type="all"
            multiple
            clearable
          />
          <el-checkbox style="margin-left: 10px" v-model="deptAllChecked">全选</el-checkbox>
        </div>
      </el-form-item>
      <el-form-item label="使用人" prop="viewUser">
        <userSelect
          v-model="formData.viewUser"
          placeholder="请选择"
          :parent-id="userInfo.companyId"
          multiple
          clearable
        />
      </el-form-item>
      <el-form-item label="首页排序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入首页排序" />
      </el-form-item>
      <el-form-item label="移动端icon" prop="icon">
        <div class="row-container">
          <el-select style="flex: 1" v-model="formData.icon" placeholder="请选择">
            <el-option
              v-for="item in iconList"
              :key="item.src"
              :label="item.name"
              :value="item.src"
            >
              <div class="option-container">
                <img class="option-img" :src="item.src" alt="">
              </div>
            </el-option>
          </el-select>
          <img v-show="formData.icon" class="row-img" :src="formData.icon" alt="">
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { postCcdOrderCategoryAdd, postCcdOrderCategoryUpdate } from "@/api/business/approvalTypeManage";
import { getRoleByOrganize } from "@/api/permission/role";
import { mapGetters } from "vuex";

export default {
  name: 'addType',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 不实时双向绑定(不支持v-model), 仅在点击确认时触发 update:value 事件 以及 confirm 事件
    data: {
      type: Object,
      default: () => ({})
    },
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 保存按钮 loading, 不双向绑定
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    const validateDept = (rule, value, callback) => {
      // 部门和使用人二选一
      if ((!this.formData.viewUser || this.formData.viewUser.length === 0) && !this.deptAllChecked && (!value || value.length === 0)) {
        callback(new Error('请选择使用部门或者使用人'));
      } else {
        callback();
      }
    };
    return {
      formData: {
        orderBizType: '',
        categoryName: '',
        adminRole: [],
        viewDept: [],
        viewUser: [],
        sort: '',
        icon: '',
      },
      rules: {
        orderBizType: [{ required: true, message: '请选择' }],
        categoryName: [{ required: true, message: '请输入' }],
        viewDept: [{ validator: validateDept, trigger: 'blur' }],
      },
      roleTreeData: [],
      deptAllChecked: false,
      roleAllChecked: false,
      iconList:
        [
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIUmAEufEAAAFW4VaeRc011.png', name: '图标1' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIUyAEes2AAAG7ChHpOM794.png', name: '图标2' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIWGAIF7JAAAIDkNXjHQ577.png', name: '图标3' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGAOqVbAAAIBPzpIxQ771.png', name: '图标4' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIWGAK3F9AAAGOLgKocc895.png', name: '图标5' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E7/CqDIlGcWIVCAQpKfAAAJpxvg3iI971.png', name: '图标6' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIVaACqR2AAAHNP4OdHA992.png', name: '图标7' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGAc691AAAFZ5mZhGc007.png', name: '图标8' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIWGAe_AUAAAIQHMnr3o403.png', name: '图标9' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGAWEUqAAAFxjvIuQs670.png', name: '图标10' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIVOAWiT4AAAGfC0JmuI447.png', name: '图标11' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGATxwFAAAEsvYxLcE577.png', name: '图标12' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGAWlnsAAAGG42XXEk326.png', name: '图标13' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIWGANXE9AAAD1nyTXbA210.png', name: '图标14' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGANqdmAAAHJKi3VUc342.png', name: '图标15' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIWGAAkLCAAAHzravl2M179.png', name: '图标16' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGAFN3uAAAGG7IeA0M739.png', name: '图标17' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/E8/CqDIlGcWIWGAI2cbAAAHjzBUGgY101.png', name: '图标18' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIWGALRIqAAAHlvZ3ys8742.png', name: '图标19' },
          { src: 'https://image.smxzhcs.cn/smxsc/M00/2F/BF/CqDIk2cWIWGAXluaAAAGmPSEJTw331.png', name: '图标20' },
        ]
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  watch: {
    visible(n) {
      if (n) {
        // 编辑
        if (this.data.id) {
          for (const key in this.formData) {
            if (key === 'adminRole') {
              if (this.data[key] === 'all') {
                this.formData[key] = [];
                this.roleAllChecked = true;
              } else if (this.data[key]) {
                this.formData[key] = this.data[key].split(',');
                this.roleAllChecked = false;
              } else {
                this.formData[key] = [];
                this.roleAllChecked = false;
              }
              continue;
            }
            if (key === 'viewDept') {
              if (this.data[key] === 'all') {
                this.formData[key] = [];
                this.deptAllChecked = true;
              } else if (this.data[key]) {
                this.formData[key] = this.data[key].split(',');
                this.deptAllChecked = false;
              } else {
                this.formData[key] = [];
                this.deptAllChecked = false;
              }
              continue;
            }
            if (key === 'viewUser') {
              if (this.data[key]) {
                this.formData[key] = this.data[key].split(',');
              } else {
                this.formData[key] = [];
              }
              continue;
            }
            this.formData[key] = this.data[key]
          }
        } else {
          this.formData = {
            orderBizType: '',
            categoryName: '',
            adminRole: [],
            viewDept: [],
            viewUser: [],
            sort: '',
            icon: '',
          }
          this.deptAllChecked = false;
          this.roleAllChecked = false;
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      }
    },
    deptAllChecked(n) {
      if (n) {
        this.formData.viewDept = [];
        this.$refs.form && this.$refs.form.clearValidate('viewDept')
      }
    },
    roleAllChecked(n) {
      if (n) {
        this.formData.adminRole = [];
      }
    },
  },
  created() {
    const organizeIds = [this.userInfo.organizeId];
    getRoleByOrganize(organizeIds).then(res => {
      this.roleTreeData = res.data.list.filter(o => o.children && Array.isArray(o.children) && o.children.length)
    })
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          let adminRole = '';
          if (this.roleAllChecked) {
            adminRole = 'all';
          } else {
            if (this.formData.adminRole && this.formData.adminRole.length > 0) {
              adminRole = this.formData.adminRole.join(',');
            }
          }
          let viewDept = '';
          if (this.deptAllChecked) {
            viewDept = 'all';
          } else {
            if (this.formData.viewDept && this.formData.viewDept.length > 0) {
              viewDept = this.formData.viewDept.join(',');
            }
          }
          let viewUser = '';
          if (this.formData.viewUser && this.formData.viewUser.length > 0) {
            viewUser = this.formData.viewUser.join(',');
          }
          if (this.data.id) {
            postCcdOrderCategoryUpdate({ ...this.formData, adminRole: adminRole, viewDept: viewDept, viewUser: viewUser, id: this.data.id }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } else {
            postCcdOrderCategoryAdd({ ...this.formData, adminRole: adminRole, viewDept: viewDept, viewUser: viewUser }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          }
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val)
    },
  }
}
</script>
<style lang="scss" scoped>
.option-container {
  display: flex;
  align-items: center;
  justify-content: center;
  .option-img {
    width: 32px;
    height: 32px;
  }
}
::v-deep .el-select-dropdown__item{
  height: 40px;
}
.row-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  .row-img {
    width: 32px;
    height: 32px;
  }
}
</style>
