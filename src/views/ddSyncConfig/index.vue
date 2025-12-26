<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <!--        <div class="JNPF-common-head">-->
        <!--          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">-->
        <!--            <div class="query-flex">-->
        <!--              <el-col :span="8">-->
        <!--                <el-form-item label="搜索" prop="searchKey">-->
        <!--                  <el-input v-model="query.searchKey" placeholder="请输入" />-->
        <!--                </el-form-item>-->
        <!--              </el-col>-->
        <!--              <el-col :span="8">-->
        <!--                <el-form-item>-->
        <!--                  <el-button type="primary" @click="onSearch">查询</el-button>-->
        <!--                  <el-button type="primary" @click="onReset">重置</el-button>-->
        <!--                </el-form-item>-->
        <!--              </el-col>-->
        <!--            </div>-->
        <!--          </el-form>-->
        <!--        </div>-->
        <!--        <div style="display: flex;flex-direction: row;justify-content: space-between;">-->
        <!--          <div class="buttonHead">-->
        <!--            <el-button size="small" type="primary" @click="batchAssociatedHolder" style="margin-right: 10px" :disabled="multipleSelection.length === 0">批量关联持有人</el-button>-->
        <!--            <el-button size="small" type="primary" @click="batchCheck" style="margin-right: 10px" :disabled="multipleSelection.length === 0">批量查询河南省手撕票</el-button>-->
        <!--          </div>-->
        <!--          <div class="buttonHead">-->
        <!--            <gpy-selector style="margin-right: 10px" @select="openGPY">高拍仪上传发票</gpy-selector>-->
        <!--            <el-upload-->
        <!--              :action="actionUrl"-->
        <!--              :file-list="fileList"-->
        <!--              :headers="uploadHeaders"-->
        <!--              :show-file-list="false"-->
        <!--              :on-success="handleSuccess"-->
        <!--              :on-error="handleError"-->
        <!--              :on-progress="handleProgress"-->
        <!--              accept=".pdf,.jpg,.jpeg,.png"-->
        <!--            >-->
        <!--              <el-button size="small" type="primary" :loading="buttonLoading">上传发票</el-button>-->
        <!--            </el-upload>-->
        <!--          </div>-->
        <!--        </div>-->
        <el-form ref="baseForm" :model="baseForm" :rules="rules" label-width="100px">
          <el-row :gutter="20" style="margin-top: 15px">
            <el-col :span="12" :offset="6" :pull="6">
              <el-form-item label="企业号id" prop="dingCorpId">
                <el-input v-model="baseForm.dingCorpId" placeholder="请输入CorpId" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="6" :pull="6">
              <el-form-item label="应用AgentId" prop="dingAgentId">
                <el-input v-model="baseForm.dingAgentId" clearable placeholder="请输入AgentId" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="6" :pull="6">
              <el-form-item label="应用key" prop="dingSynAppKey">
                <el-input v-model="baseForm.dingSynAppKey" clearable placeholder="请输入Client ID" />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="6" :pull="6">
              <el-form-item label="应用秘钥" prop="dingSynAppSecret">
                <el-input v-model="baseForm.dingSynAppSecret" placeholder="请输入Client Secret">
                  <el-button slot="append" @click="checkDing" :loading="testDingLoading">连接测试
                  </el-button>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item>
                <el-button
                  type="primary"
                  size="small"
                  :loading="btnLoading"
                  class="saveBtn"
                  @click="submitForm()"
                >保 存</el-button>
              </el-form-item>
            </el-col>
            <el-col>
              <el-form-item label="同步反馈">
                <el-table :data="ddResults" border>
                  <el-table-column prop="synType" label="同步类型" />
                  <el-table-column prop="recordTotal" label="总数" />
                  <el-table-column prop="synSuccessCount" label="同步成功数" />
                  <el-table-column prop="synFailCount" label="同步失败数" />
                  <el-table-column prop="unSynCount" label="未同步数" />
                  <el-table-column
                    prop="synDate"
                    label="同步时间"
                    :formatter="jnpf.tableDateFormat"
                  />
                  <el-table-column label="操作" width="70">
                    <template slot-scope="scope">
                      <el-button size="mini" type="text" @click="syncDingVisible(scope.row)">同步
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <el-dialog
          title="数据同步"
          :visible.sync="visible"
          class="JNPF-dialog JNPF-dialog_center sync-dialog"
          lock-scroll
          width="450px"
        >
          <div class="add-main">
            <div class="add-item add-item-sys">
              <i class="add-icons icon-ym icon-ym-download"></i>
              <div class="add-txt">
                <p class="add-title">同步到系统</p>
                <p class="add-desc">{{ synchronization }}</p>
              </div>
              <div class="add-button">
                <el-button
                  type="primary"
                  size="small"
                  @click="syncDing(1)"
                  :loading="dingLoading"
                  :disabled="wechatLoading"
                >
                  同步
                </el-button>
              </div>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { updateSystemConfig, getSystemConfig, testDing, getSynThirdTotal, synAllOrganizeSysToDing, synAllUserSysToDing } from '@/api/system/sysConfig';

export default {
  data() {
    return {
      baseForm: {
        dingSynAppKey: '',
        dingSynAppSecret: '',
        dingCorpSecret: '',
        dingAgentId: '',
        dingCorpId: ""
      },
      ddResults: [{
        recordTotal: '',
        synDate: '',
        synFailCount: '',
        synSuccessCount: '',
        synType: '组织',
        unSynCount: '',
      }, {
        recordTotal: '',
        synDate: '',
        synFailCount: '',
        synSuccessCount: '',
        synType: '用户',
        unSynCount: '',
      }],
      visible: false,
      synchronization: '',
      name: '',
      row: '',
      btnLoading: false,
      testDingLoading: false,
      dingLoading: false,
      wechatLoading: false,
      rules: {}
    }
  },
  computed: {

  },
  created() {
    this.getSynThirdTotal();
    this.initData();
  },
  methods: {
    syncDingVisible(row) {
      this.name = '同步到阿里钉钉';
      this.synchronization = '把阿里钉钉数据同步到系统';
      this.row = row || '';
      this.visible = true;
    },
    submitForm() {
      this.$confirm('您确定要保存，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        this.btnLoading = true;
        updateSystemConfig(this.baseForm).then(res => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.btnLoading = false;
              this.initData()
            }
          })
        }).catch(() => {
          this.btnLoading = false
        })
      }).catch(() => { this.btnLoading = false })
    },
    initData() {
      this.$nextTick(() => {
        getSystemConfig().then(res => {
          this.baseForm = res.data;
        });
      });
    },
    checkDing() {
      this.testDingLoading = true;
      const data = {
        dingAgentId: this.baseForm.dingAgentId,
        dingSynAppKey: this.baseForm.dingSynAppKey,
        dingSynAppSecret: this.baseForm.dingSynAppSecret,
        dingCorpId: this.baseForm.dingCorpId
      };
      testDing(data).then(res => {
        this.$message({
          message: res.msg,
          type: 'success',
          duration: 1500,
          onClose: () => {
            this.testDingLoading = false;
          }
        })
      }).catch(() => {
        this.testDingLoading = false;
      })
    },
    getSynThirdTotal() {
      getSynThirdTotal(2).then(res => {
        let list = res.data.map(o => ({ loading: false, ...o }));
        this.ddResults = list;
      })
    },
    syncDing(type) {
      this.$confirm('同步以后会丢失现有数据，是否继续？', '提示', {
        type: 'warning'
      }).then(() => {
        type == 0 ? this.wechatLoading = true : this.dingLoading = true
        const method = this.row.synType == '组织' ? synAllOrganizeSysToDing : synAllUserSysToDing
        method(type).then(res => {
          type == 0 ? this.wechatLoading = false : this.dingLoading = false
          this.visible = false
          if (res.msg === '正在进行同步,请稍等') {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
            })
            return
          }
          this.row.recordTotal = res.data.recordTotal
          this.row.synDate = res.data.synDate
          this.row.synFailCount = res.data.synFailCount
          this.row.synSuccessCount = res.data.synSuccessCount
          this.row.synType = res.data.synType
          this.row.unSynCount = res.data.unSynCount
          this.$message({
            message: '同步成功',
            type: 'success',
            duration: 1500,
          })
        }).catch(() => { type == 0 ? this.wechatLoading = false : this.dingLoading = false })
      })
    },
  }
}
</script>
<style lang="scss" scoped>
  .saveBtn {
    width: 100px;
  }

  .add-main {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .add-item {
      width: 450px;
      height: 100px;
      display: flex;
      align-items: center;
      cursor: pointer;

      &.add-item-sys {
        .add-icon {
          background: #75d8f791;
          color: #08c0f8;
        }
      }

      .add-icon {
        width: 56px;
        height: 56px;
        margin-right: 10px;
        background: #cefae2;
        border-radius: 50%;
        color: #0eac5c;
        flex-shrink: 0;
        font-size: 30px;
        line-height: 56px;
        text-align: center;
      }

      .add-button {
        margin-left: 80px;
      }

      .add-icons {
        width: 56px;
        height: 56px;
        margin-right: 10px;
        background: #cefae2;
        border-radius: 50%;
        color: #0eac5c;
        flex-shrink: 0;
        font-size: 30px;
        line-height: 56px;
        text-align: center;
      }

      .add-txt {
        height: 56px;

        P {
          line-height: 28px;
        }

        .add-title {
          font-size: 18px;
          font-weight: bold;
        }

        .add-desc {
          color: #8d8989;
          font-size: 12px;
          width: 150px;
        }
      }
    }
  }
</style>
