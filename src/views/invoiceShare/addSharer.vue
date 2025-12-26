<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    append-to-body
    :visible="visible"
    @update:visible="updateVisible"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    width="600px"
  >
    <el-form ref="elForm" :model="dataForm" :rules="rules" label-width="135px">
      <el-form-item
        label="持有人"
        prop="applyUserId"
      >
        <userSelect
          v-model="dataForm.applyUserId"
          placeholder="请选择持有人"
          :parent-id="parentId"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="共享人"
        prop="receivedUserIds"
      >
        <userSelect
          v-model="dataForm.receivedUserIds"
          placeholder="请选择共享人"
          :parent-id="parentId"
          :multiple="true"
          clearable
        />
      </el-form-item>
      <el-form-item
        label="共享时间"
        prop="expireFlag"
      >
        <el-select v-model="dataForm.expireFlag" placeholder="请选择">
          <el-option label="长期" :value="1"></el-option>
          <el-option label="固定期限" :value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="dataForm.expireFlag === 0"
        label="开始时间"
        prop="startTime"
      >
        <el-date-picker
          v-model="dataForm.startTime"
          type="date"
          placeholder="请选择开始时间"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item
        v-if="dataForm.expireFlag === 0"
        label="结束时间"
        prop="endTime"
      >
        <el-date-picker
          v-model="dataForm.endTime"
          type="date"
          placeholder="请选择结束时间"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="updateVisible(false)"> 取 消</el-button>
      <el-button type="primary" @click="dataFormSubmit" :loading="loading"> 确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from "vuex";
import { getOrganizeList } from '@/api/permission/organize.js'

export default {
  name: 'AddSharer',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 支持 .sync , 支持 v-model
    visible: {
      type: Boolean,
      default: true
    },
    // 提交按钮的loading状态
    loading: {
      type: Boolean,
      default: false
    },
    title: {
      default: '新增发票共享'
    }
  },
  data() {
    return {
      parentId: "0",
      dataForm: {
        applyUserId: "",
        receivedUserIds: "",
        expireFlag: 1,
        startTime: "",
        endTime: ""
      },
      rules: {
        applyUserId: [
          {
            required: true,
            message: '请选择发票持有人',
            trigger: 'change'
          },
        ],
        receivedUserIds: [
          {
            required: true,
            message: '请选择发票共享人',
            trigger: 'change'
          },
        ],
        expireFlag: [
          {
            required: true,
            message: '请选择发票时间',
            trigger: 'change'
          },
        ],
        startTime: [
          {
            required: true,
            message: '请选择共享开始时间',
            trigger: 'change'
          },
        ],
        endTime: [
          {
            required: true,
            message: '请选择共享结束时间',
            trigger: 'change'
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(["userInfo"]),
  },
  created() {
    this.getParentId();
  },
  methods: {
    dataFormSubmit() {
      this.$refs.elForm.validate((valid) => {
        if (valid) {
          this.$emit("confirm", { ...this.dataForm });
          this.updateVisible(false);
        }
      })
    },
    updateVisible(val) {
      this.$emit('update:visible', val);
      this.$refs.elForm.resetFields();
    },
    getParentId() {
      if (this.deptFilter) {
        getOrganizeList().then(res => {
          const rList = res.data.list[0].children.filter(v => v.fullName === this.deptFilter);
          if (rList.length > 0) {
            this.parentId = rList[0].id;
          } else {
            this.parentId = this.deptFilter;
          }
        });
      } else {
        this.parentId = this.userInfo.companyId;
      }
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
