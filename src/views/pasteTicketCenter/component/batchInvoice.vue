<template>
  <el-dialog
    title="批量查验河南省手撕票"
    :close-on-click-modal="false"
    class="JNPF-dialog JNPF-dialog_center"
    lock-scroll
    append-to-body
    width="900px"
    :modal-append-to-body="false"
    destroy-on-close
    :visible="visible"
    :show-close="false"
  >
    <el-alert
      title="有部分发票查验失败，请点击验证码刷新，修改输入后重新提交"
      type="error"
      class="error-tip"
      v-if="errorTipVisible"
    />
    <el-form ref="form" :model="formData" label-width="150px" v-loading="submitting">

      <div class="block-status" v-for="(item,index) in formData.list" :key="item.billId">
        <div class="block-box">
          <div class="block" v-loading="item.submitting">
            <div class="num">
              <div>{{ index + 1 }}</div>
            </div>
            <div class="form-el">
              <div class="left">
                <div class="sec"><span class="label">发票号码：</span><span class="value">{{ item.number }}</span></div>
                <div class="sec"><span class="label">发票代码：</span><span class="value">{{ item.code }}</span></div>
                <div class="sec"><span class="label">票据金额：</span><span class="value">{{ item.amountInFiguers }}</span></div>
              </div>
              <div class="right">
                <!--                <el-form-item-->
                <!--                  label="收款方纳税识别号"-->
                <!--                  :prop="'list.' + index + '.nsrsbh'"-->
                <!--                  :rules="{-->
                <!--                    required: true, message: '收款方纳税识别号不能为空', trigger: 'blur'-->
                <!--                  }"-->
                <!--                >-->
                <!--                  <el-input v-model="item.nsrsbh" placeholder="请输入收款方纳税识别号" clearable maxlength="50" :disabled="item.status=='success'" />-->
                <!--                </el-form-item>-->
                <div class="code-box">
                  <el-form-item
                    label="验证码"
                    :prop="'list.' + index + '.rcode'"
                    :rules="{
                      required: true, message: '验证码不能为空', trigger: 'blur'
                    }"
                  >
                    <el-input v-model="item.rcode" placeholder="请输入验证码" clearable maxlength="10" :disabled="item.status=='success'" />
                  </el-form-item>
                  <div class="code-img">
                    <div class="code" @click="reload(index)" v-loading="item.loading">
                      <el-image :src="item.srcCode" />
                    </div>
                    <div class="code-refresh" @click="reload(index)">
                      <div class="rei">
                        <i class="el-icon-refresh-right" />
                      </div>
                      <span>刷新</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-alert
            :title="item.error"
            type="error"
            v-show="item.error"
          />
        </div>
        <div class="success" v-show="item.status=='success'">
          <i class="el-icon-success" /><span>查验成功</span>
        </div>
        <div class="error" v-show="item.status =='fail'">
          <i class="el-icon-error" /><span>查验失败</span>
        </div>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel" :disabled="submitDisabled">取 消</el-button>
      <el-button type="primary" @click="submit" :disabled="submitDisabled">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { sspCheck, getPictureCode, getBatchInvoiceDetail, getHeadTailByContinuousNumber } from "@/api/business/pasteTicket";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        list: []
      },
      billIdList: [],
      submitting: false
    }
  },
  computed: {
    errorTipVisible() {
      // 有任何一个发票验证不通过就提示
      let failedIdx = this.formData.list.findIndex(item => item.status == 'fail');
      if (failedIdx > -1) {
        return true;
      }
      return false;
    },
    submitDisabled() {
      // 有任何一个发票处于提交状态中，都不能点击
      let idx = this.formData.list.findIndex(item => item.loading);
      if (idx > -1) {
        return true;
      }
      return false;
    }
  },
  watch: {
    async visible(v) {
      if (v) {
        let list = [];
        // 取发票代码和号码
        let ids = this.data.map(item => item.id);
        this.billIdList = ids;
        // 把ids过滤再通过后端接口过滤一下，连续的只要首尾
        ids = (await getHeadTailByContinuousNumber(ids.join(','))).data;
        getBatchInvoiceDetail({
          billIds: ids.join(',')
        }).then(res => {
          res.data.forEach(element => {
            let item = {
              ...element,
              srcCode: '',
              rcode: '',
              id: '',
              submitting: false,
              status: '',
              error: ''
            };
            list.push(item);
            item.loading = true;
            getPictureCode({ billId: item.billId }).then(res => {
              let data = res.data;
              item.srcCode = data.rcodeBase64;
              item.rcode = data.code;
              item.id = data.id;
            }).finally(() => {
              item.loading = false;
            })
          });
          this.formData.list = list;
        })
      } else {
        this.formData.list = [];
      }
    }
  },
  methods: {
    reload(index) {
      let item = this.formData.list[index];
      if (item.status == 'success') {
        return
      }
      item.loading = true;
      getPictureCode({ billId: item.billId }).then(res => {
        let data = res.data;
        item.srcCode = data.rcodeBase64;
        item.rcode = data.code;
        item.id = data.id;
      }).finally(() => {
        item.loading = false;
      })
    },
    cancel() {
      this.$emit('update:visible', false);
      this.$emit('confirm')
    },
    submit() {
      this.$refs.form.validate().then(async(valid) => {
        // 要查验没有查验成功的发票
        let list = this.formData.list.filter(item => item.status != 'success')
        if (!list || !list.length) {
          return;
        }
        this.submitting = true;
        sspCheck(list.map(item => ({ fpdm: item.code, fphm: item.number, billId: item.billId, billIdList: this.billIdList, code: item.rcode, id: item.id }))).then(res => {
          if (res.code == 200) {
            this.$message.success('已全部验证通过');
            this.cancel();
          } else {
            this.$message.error(`${res.msg}`);
            list.forEach((v, index) => {
              this.reload(index);
            });
          }
        })
          .finally(() => {
            this.submitting = false;
          });
        // let successCount = 0, requestCount = 0;
        // for (const item of list) {
        //   item.submitting = true;
        //   await sspCheck({ fpdm: item.code, fphm: item.number, billId: item.billId, billIdList: this.billIdList, code: item.rcode, id: item.id }).then(res => {
        //     if (res.code == 200) {
        //       item.status = 'success';
        //       item.error = '';
        //       successCount++;
        //     } else {
        //       item.error = res.msg;
        //       item.status = 'fail';
        //     }
        //     console.log("成功次数:", successCount);
        //   }).finally(() => {
        //     requestCount++;
        //     if (requestCount == list.length && successCount == list.length) {
        //     // 已经全部提交完，是否全部通过, 关闭弹窗
        //
        //       this.$message.success('已全部验证通过')
        //       this.cancel();
        //     }
        //     item.submitting = false;
        //   });
        //   // 本来就是请求完一个再请求下一个，但是后端还是会出现并发，选择的方案是前端再等待一下
        //   await new Promise(resolve => setTimeout(resolve, 1000));
        // }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.block-status {
  display: flex;
  align-items: center;
  margin: 20px 0;
  .success {
    color: #28b428;
    margin-left: 10px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
  .error {
    color: #eb0707;
    margin-left: 10px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
}
.block-box {
}
.block {
  flex: 1;
  display: flex;
  background-color: #ecf8ff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px dashed #5ac3ff;
  .num {
    background-color: #32a3e4;
    width: 50px;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .form-el {
    display: flex;
    flex: 1;
    padding: 18px 16px;
    .left {
      flex: 1;
      border-right: 1px solid #bde7ff;
      .sec {
        margin-bottom: 10px;
        margin-right: 15px;
        .label {
          margin-right: 5px;
        }
        .value {
          font-weight: 600;
        }
      }
    }
    .right {
      width: calc(50% + 50px);
      .code-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 18px;
      }
      .code-img {
        display: flex;
        align-items: center;
        .rei {
          color: #017ae3;
          font-size: 18px;
        }
      }
      .code {
        cursor: pointer;
        width: 90px;
        margin-left: 10px;
        height: 32px;
      }
      .code-refresh {
        display: flex;
        align-items: center;
        text-decoration: underline;
        white-space: nowrap;
        color: #017ae3;
        cursor: pointer;
      }
    }
  }
}
.el-form-item--small.el-form-item {
  margin-bottom: 0;
}
::v-deep .el-loading-spinner .circular {
  width: 22px;
  height: 22px;
}
::v-deep .el-loading-spinner {
  margin-top: -11px;
}
.error-tip {
  position: absolute;
  left: 0;
  z-index: 9;
  top: 56px;
}
</style>
