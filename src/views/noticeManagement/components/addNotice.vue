<template>
  <el-dialog
    :title="(data && data.id? '编辑':'新增')+'公告'"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    @update:visible="updateVisible"
  >
    <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="公告名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入公告名称" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入排序" />
      </el-form-item>
      <el-form-item label="公告接收组织" prop="receiveType">
        <el-radio-group v-model="formData.receiveType">
          <el-radio :label="0">全部单位/企业</el-radio>
          <el-radio :label="1">指定单位/企业发布</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.receiveType === 1" label="接收组织" prop="organizeIds">
        <el-cascader
          v-model="formData.organizeIds"
          placeholder="请选择单位/企业"
          :props="{multiple: true,emitPath: false,value: 'id',label: 'fullName'}"
          :options="orgOption"
          :show-all-levels="false"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <wang-editor v-model="formData.content" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" :loading="loading" @click="onConfirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { getOrganizeTree } from "@/api/permission/organize";
import WangEditor from "@/components/Editor/WangEditor.vue";
import { getCcdNoticeDetail, postCcdNoticeSaveOrUpdate } from "@/api/business/notice";

export default {
  name: 'addOrgNotice',
  components: { WangEditor },
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
    return {
      formData: {
        name: '',
        organizeIds: [],
        content: '',
        sort: '',
        receiveType: 0
      },
      rules: {
        organizeIds: [{ required: true, message: '请选择' }],
        receiveType: [{ required: true, message: '请选择' }],
        name: [{ required: true, message: '请输入' }],
      },
      orgOption: [], // 企业选项
    }
  },
  watch: {
    visible(n) {
      if (n) {
        // 编辑
        if (this.data.id) {
          getCcdNoticeDetail({ id: this.data.id }).then(res => {
            let data1 = res.data;
            for (const key in this.formData) {
              if (key === 'organizeIds') {
                if (data1[key]) {
                  if (data1[key] === 'all') {
                    this.formData.receiveType = 0;
                    this.formData.organizeIds = [];
                  } else {
                    this.formData.receiveType = 1;
                    this.formData.organizeIds = data1[key].split(',');
                  }
                }
                continue;
              }
              if (key === 'receiveType') continue;
              this.formData[key] = data1[key]
            }
          })
        }
        this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
      } else {
        this.formData = {
          name: '',
          organizeIds: [],
          content: '',
          sort: '',
          receiveType: 0
        }
      }
    },
  },
  created() {
    getOrganizeTree().then(res => {
      this.orgOption = res.data.list;
    })
  },
  methods: {
    onConfirm() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
        if (valid) {
          let organizeIds = '';
          if (this.formData.receiveType === 0) {
            organizeIds = 'all';
          } else {
            organizeIds = this.formData.organizeIds.join(',');
          }
          if (this.data.id) {
            postCcdNoticeSaveOrUpdate({ ...this.formData, id: this.data.id, organizeIds: organizeIds, type: 1 }).then(() => {
              this.$message.success("操作成功");
              this.$emit('confirm');
              this.updateVisible(false);
            });
          } else {
            postCcdNoticeSaveOrUpdate({ ...this.formData, organizeIds: organizeIds, type: 1 }).then(() => {
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
