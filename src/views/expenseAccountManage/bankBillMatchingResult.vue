<template>
  <div class="page">
    <div class="container">
      <div class="left-area">
        <div class="l-header">
          <div class="icon" />
          <div class="header-title">汇款单</div>
        </div>
        <div class="l-content">
          <div :class="['card', cardSelect.bankFid === item.bankFid ? 'select' : 'non-select']" v-for="(item, index) in list" :key="index" @click="cardClick(item)">
            <div style="display: flex">
              <div class="seq">{{ index + 1 }}</div>
              <div class="content1">{{ item.title }}</div>
            </div>
            <div class="content2">
              <span style="margin-right: 9px">{{ item.receiverName }}</span>
              <span>{{ item.tranDate }}</span>
            </div>
            <div class="content3">
              <img class="img-icon" src="https://image.smxzhcs.cn/smxsc/M00/2F/58/CqDIk2bax4uAa-rOAAAGsFEwFZg280.png" alt="">
              <div class="text1">{{ item.amout }}</div>
              <div :class="['text2', item.matchReason ? 'match' : 'non-match']">{{ item.matchReason ? '已匹配' : '未匹配' }}</div>
            </div>
            <img v-if="item.checkStatus === 1" class="confirm-icon" src="https://image.smxzhcs.cn/smxsc/M00/2F/5E/CqDIk2bebeSASxfxAAADxLgMLJ8594.png" alt="">
          </div>
        </div>
      </div>
      <div class="center-area">
        <div class="c-header">
          <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
            <el-tab-pane label="全部报销单" name="first" />
            <el-tab-pane label="未关联报销单" name="second" />
            <el-tab-pane label="已关联报销单" name="third" />
          </el-tabs>
        </div>
        <div class="c-query">
          <el-form :model="query" ref="formRef" label-width="100px" style="width: 100%">
            <div style="display: flex; flex-wrap: wrap">
              <el-col :span="6">
                <el-form-item label-width="10px" prop="exsPeople">
                  <el-input v-model="query.exsPeople" placeholder="搜索报销人、收款人" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-col :span="13">
                  <el-form-item label="报销金额" prop="minAmount">
                    <el-input v-model="query.minAmount" placeholder="请输入最低金额" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="2">
                  <div style="text-align: center; padding-top: 6px">至</div>
                </el-col>
                <el-col :span="9">
                  <el-form-item prop="maxAmount" label-width="auto">
                    <el-input v-model="query.maxAmount" placeholder="请输入最高金额" clearable />
                  </el-form-item>
                </el-col>
              </el-col>
              <el-col :span="6">
                <el-form-item label-width="20px">
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button type="primary" @click="onReset">重置</el-button>
                </el-form-item>
              </el-col>
            </div>
          </el-form>
        </div>
        <div class="c-list">
          <JNPF-table
            ref="tableRef"
            :data="searchExpenseList"
            stripe
            border
            highlight-current-row
            @row-click="singleSelect"
          >
            <el-table-column
              label="选择"
              align="left"
              width="60"
            >
              <template slot-scope="scope">
                <el-radio v-model="radioSelect" :label="scope.row.id">&nbsp</el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              label="报销单名称"
              align="left"
            />
            <el-table-column
              label="报销人"
              prop="exsUserName"
              algin="left"
            />
            <el-table-column
              label="报销金额"
              prop="exsCost"
              algin="left"
            />
            <el-table-column
              label="收款人"
              algin="left"
            >
              <template slot-scope="scope">
                <span>{{ getReceiver(scope.row ) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="报销日期"
              prop="applyTime"
              algin="left"
            />
          </JNPF-table>
        </div>
      </div>
      <div class="right-area" v-loading="loading" element-loading-text="加载中，请稍等">
        <div class="l-header">
          <div class="icon" />
          <div class="header-title">匹配校验</div>
        </div>
        <div class="r-content">
          <embed v-if="bankUrl" class="r-img" :src="bankUrl">
          <div style="display: flex; align-items: start;">
            <div v-if="bankUrl" class="r-title">{{ cardSelect.title }}</div>
            <el-link type="primary" @click="preview = true">点击放大查看</el-link>
          </div>
          <el-image v-if="expenseUrl" class="r-img" :src="expenseUrl" :preview-src-list="[expenseUrl]" />
          <div v-if="expenseUrl" class="r-title">{{ cardSelect.name }}</div>
        </div>
        <div class="r-bottom-bar">
          <el-button @click="deleteRelation()">重新匹配</el-button>
          <el-button style="background: #08C29A;border-color: #08C29A;" type="primary" @click="confirmRelation()">确认无误</el-button>
        </div>
      </div>
    </div>
    <div class="page-botoomBar">
      <el-button @click="$router.go(-1)">取消</el-button>
      <el-button type="primary" @click="batchRel()">确定提交汇款单</el-button>
    </div>
    <previewOnline :visible.sync="preview" :file-url="bankPdfUrl" :file-title="cardSelect.title" />
  </div>
</template>
<script>
import { downloadFile } from "@/api/business/signature";
import baseMixin from '@/mixins/print/baseMixin';
import previewOnline from "@/components/preview-online/index";
import { batchRelBankSlip } from "@/api/business/expenseAccount";

export default {
  components: { previewOnline },
  mixins: [baseMixin],
  data() {
    return {
      expenseList: [], // 报销单列表原数据
      searchExpenseList: [], // 搜索后的报销单列表
      tabExpenseList: [], // tab筛选后的报销单列表
      list: [], // 处理过的匹配数据
      activeName: "first",
      newData: [], // 存放要提交的匹配数据格式
      query: {
        exsPeople: "",
        minAmount: "",
        maxAmount: ""
      },
      radioSelect: "",
      cardSelect: {}, // 当前选中的卡片
      bankUrl: "",
      expenseUrl: "",
      loading: false,
      preview: false,
      bankPdfUrl: ""
    }
  },
  created() {
    const data = JSON.parse(sessionStorage.getItem("matchData"));
    this.expenseList = data.exsOrderEntities;
    this.tabExpenseList = [...this.expenseList];
    this.newData = data.bankFlexDTOS;
    this.getBankList();
    this.onSearch();
    this.cardClick(this.list[0]);
  },
  methods: {
    confirmRelation() {
      if (this.radioSelect) {
        // 首先，把当前选中的银行回执单的前端确认状态，改为已确认
        this.cardSelect.checkStatus = 1;
        // 进行变更报销单判断和处理操作
        this.changeRelation(this.expenseList[this.expenseList.findIndex(v => v.id === this.radioSelect)]);
      } else {
        this.$message.warning("请选择报销单!");
      }
    },
    deleteRelation() {
      if (this.radioSelect) {
        if (this.cardSelect.id) {
          const index = this.newData.findIndex(v => v.bankSlipResDTO.bankFid === this.cardSelect.bankFid);
          // 判断清除当前报销单的关联关系后，报销单是否还关联其他银行回执单，如果没有，则要把报销单的关联状态isMatch字段改为“否”
          if (this.newData.filter(v => v.ccdExsOrderEntity && v.ccdExsOrderEntity.id === this.newData[index].ccdExsOrderEntity.id).length === 1) {
            this.expenseList[this.expenseList.findIndex(v => v.id === this.newData[index].ccdExsOrderEntity.id)].isMatch = "否";
            this.handleClick({ name: this.activeName });
          }
          // 清除传给后端的相关数据
          this.newData[index].ccdExsOrderEntity = null;
          this.newData[index].matchReason = null;
          // 清除card列表
          this.cardSelect.matchReason = null;
          this.cardSelect.id = null;
        }
        // 清除前端确认状态
        this.cardSelect.checkStatus = 0;
        this.cardClick(this.cardSelect);
      }
    },
    cardClick(item) {
      this.cardSelect = item;
      // 选中卡片后，如果是已匹配的卡片，对应报销单列表也要选中
      if (item.id) {
        this.radioSelect = item.id;
      } else {
        this.radioSelect = "";
      }
      this.getImgBySelectedCard(item);
    },
    handleClick(tab) {
      if (tab.name === "first") {
        this.tabExpenseList = [...this.expenseList];
      } else if (tab.name === "second") {
        // 筛选未关联报销单的
        this.tabExpenseList = this.expenseList.filter(v => v.isMatch === "否");
      } else if (tab.name === "third") {
        // 筛选已关联报销单的
        this.tabExpenseList = this.expenseList.filter(v => v.isMatch === "是");
      }
      this.onSearch();
    },
    // 根据选中的卡片，来下载对应报销单和银行回执单的图片
    async getImgBySelectedCard(item) {
      this.loading = true;
      // 下载银行回执单图片
      if (item.bankFid) {
        this.bankPdfUrl = (await downloadFile(item.bankFid)).data.url;
        this.bankUrl = await this.loadPreviewUrl({ fileDownloadUrl: this.bankPdfUrl })
      } else {
        this.bankUrl = "";
      }
      await this.getExpenseImg(item);
      this.loading = false;
    },
    async getExpenseImg(item) {
      // 下载报销单图片
      if (item.id) {
        const { formData } = await this.loadFormDetail({ formId: item.id });
        if (formData.basePrintdevId) {
          const result = await this.templateToImageDirectly(formData.basePrintdevId, item.id, formData.orderType);
          this.expenseUrl = result.url;
        }
      } else {
        this.expenseUrl = "";
      }
    },
    onSearch() {
      // 前端搜索
      this.searchExpenseList = this.tabExpenseList.filter(v => {
        if ((v.exsUserName.includes(this.query.exsPeople) || this.getReceiver(v).includes(this.query.exsPeople) || this.query.exsPeople === "") &&
          (Number(v.exsCost) >= Number(this.query.minAmount) || this.query.minAmount === '') &&
          (Number(v.exsCost) <= Number(this.query.maxAmount) || this.query.maxAmount === '')) {
          return true;
        }
      });
    },
    onReset() {
      this.$refs.formRef.resetFields();
      this.onSearch();
    },
    async singleSelect(row) {
      this.loading = true;
      this.radioSelect = row.id;
      // 只要更改了报销单，就把前端确认状态去掉
      this.cardSelect.checkStatus = 0;
      this.cardSelect.name = row.name;
      await this.getExpenseImg(row);
      this.loading = false;
    },
    getReceiver(row) {
      const type = row.type;
      // 这几种报销单，收款人就是报销人
      if (['2', '6', '13', '15'].includes(type)) {
        return row.exsUserName;
      } else if (type === "8") {
        // 项目付款单
        return JSON.parse(row.detailJson).payeeName;
      } else if (type === "7") {
        // 请款单
        return JSON.parse(row.detailJson).payee;
      } else if (type === "16") {
        // 银行划款单
        return JSON.parse(row.detailJson).inEntBankAccount;
      } else {
        return row.exsUserName;
      }
    },
    // 构造list
    getBankList() {
      // checkStatus 为前端添加的字段，用来判断用户是否确认了每一条数据，只有全部确认才能提交后端
      this.list = this.newData.map(v => ({ ...v.bankSlipResDTO, ...v.ccdExsOrderEntity, matchReason: v.matchReason, checkStatus: 0 }));
    },
    changeRelation(val) {
      console.log("手动选择的报销单：", val);
      // 重新绑定了报销单要处理：1. 新报销单isMatch改为是，旧的如果没有银行回执单关联的话改成“否”  2. (废除)当前回执单绑定新报销单，报销单原先所在回执单清除该报销单
      const index = this.newData.findIndex(v => v.bankSlipResDTO.bankFid === this.cardSelect.bankFid);
      // 判断是否手动更改了报销单，更改了才触发下方操作
      if (!this.newData[index].ccdExsOrderEntity || this.newData[index].ccdExsOrderEntity.id !== val.id) {
        if (this.newData[index].ccdExsOrderEntity) {
          // 说明原本已关联了报销单，现在属于更改报销单
          // 那就  要判断除了该银行回执单，还有其他银行回执单关联了该报销单吗，如果没有，则要把原先报销单的isMatch字段改为“否”
          if (this.newData.filter(v => v.ccdExsOrderEntity && v.ccdExsOrderEntity.id === this.newData[index].ccdExsOrderEntity.id).length === 1) {
            this.expenseList[this.expenseList.findIndex(v => v.id === this.newData[index].ccdExsOrderEntity.id)].isMatch = "否";
          }
        }
        // 把新的报销单isMatch字段改为“是”
        this.expenseList[this.expenseList.findIndex(v => v.id === val.id)].isMatch = "是";
        /* -------------由于现在允许一个报销单绑定多个银行回执单，因此，先不用清除   -------------
        // 在替换报销单之前，看一下该报销单之前绑定了回执单没，如果绑定了，要清除
        const index2 = this.newData.findIndex(v => v.ccdExsOrderEntity && v.ccdExsOrderEntity.id === val.id);
        if (index2 !== -1) {
          this.newData[index2].ccdExsOrderEntity = null;
          this.newData[index2].matchReason = null;
        } */
        // 替换newData中当前银行回执单对应的报销单
        this.newData[index].ccdExsOrderEntity = val;
        this.newData[index].matchReason = "手动匹配";
        // 让this.list对应的元素的matchReason不为空，前端显示从未匹配，变为已匹配（只是前端显示，不传给后端）
        this.cardSelect.matchReason = "手动匹配";
        this.cardSelect = Object.assign(this.cardSelect, { ...val });
        // 手动替换完成后，更新报销单列表数据
        this.handleClick({ name: this.activeName });
        console.log("手动匹配后，提交给后端的数据：", this.newData);
      }
    },
    // 提交银行回执单与报销单的关联关系
    batchRel() {
      // 把this.newData中空的过滤掉
      const data = this.newData.filter(v => v.ccdExsOrderEntity);
      if (data.length > 0) {
        // 先判断，如果有银行回执单没有确定，二次弹窗确认
        if (this.list.filter(v => !v.checkStatus).length > 0) {
          this.$confirm('有银行汇款单未确认，是否提交?', '提示', {
            type: 'warning'
          }).then(() => {
            batchRelBankSlip(data).then(() => {
              this.$message.success("操作成功");
              setTimeout(() => {
                this.$router.go(-1);
              }, 1000);
            });
          });
        } else {
          batchRelBankSlip(data).then(() => {
            this.$message.success("操作成功");
            setTimeout(() => {
              this.$router.go(-1);
            }, 1000);
          });
        }
      } else {
        this.$message.error("没有已匹配的银行回执单，无法提交");
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .page {
    height: 100%;
    width: 100%;
    padding-bottom: 75px;
  }
  .container {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: auto;

    .left-area {
      width: 371px;
      min-width: 371px;
      background: #FFFFFF;
      border-radius: 8px 0px 0px 8px;
      display: flex;
      flex-direction: column;

      .l-content {
        padding: 19px 22px 2px 21px;
        flex: 1;
        overflow: auto;

        .non-select {
          background: #FFFFFF;
          border: 1px solid #E6E6E6;
        }
        .select {
          background: #F0F5FF;
          border: 2px solid #3272F1;
        }
        .card {
          min-height: 100px;
          border-radius: 8px;
          margin-bottom: 12px;
          position: relative;
          cursor: pointer;

          .confirm-icon {
            width: 28px;
            height: 28px;
            position: absolute;
            top: 0;
            right: 0;
          }

          .seq {
            width: 16px;
            height: 16px;
            background: #3272F1;
            border-radius: 2px;
            font-weight: 500;
            font-size: 12px;
            color: #FFFFFF;
            line-height: 17px;
            text-align: center;
            margin: 18px 4px 0 12px;
          }
          .content1 {
            font-weight: 500;
            font-size: 14px;
            color: #292C33;
            line-height: 20px;
            margin-top: 16px;
          }
          .content2 {
            font-size: 14px;
            color: #5C5F66;
            line-height: 20px;
            margin: 4px 13px 0 14px;
          }
          .content3 {
            margin: 8px 0 13px 14px;
            display: flex;
            .img-icon {
              width: 18px;
              height: 18px;
              margin-right: 1px;
            }
            .text1 {
              font-weight: 500;
              font-size: 14px;
              color: #292C33;
              line-height: 20px;
            }
            .text2 {
              font-size: 12px;
              line-height: 17px;
              margin-left: auto;
              margin-right: 13px;
            }
            .non-match {
              color: #F05248;
            }
            .match {
              color: #3272F1;
            }
          }
        }
      }
    }

    .center-area {
      width: 850px;
      min-width: 850px;
      background: #FFFFFF;
      border-radius: 0px 8px 8px 0px;
      border: 1px solid #F6F7FA;
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      .c-header {
        width: 100%;
        height: 61px;
        border-bottom: 1px solid #EDEFF2;
        padding-top: 10px;
        padding-left: 20px;
      }
      .c-query {
        margin-top: 18px;
        margin-left: 20px;
      }
      .c-list {
        margin: 0 20px 14px 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
    }

    .right-area {
      min-width: 428px;
      flex: 1;
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid #F6F7FA;
      position: relative;
      display: flex;
      flex-direction: column;
      padding-bottom: 80px;
      .r-content {
        padding: 19px 19px 19px 21px;
        overflow-y: auto;
        flex: 1;
        .r-img {
          width: 388px;
          height: 234px;
          margin-bottom: 12px;
        }
        .r-title {
          font-weight: 500;
          font-size: 14px;
          color: #292C33;
          line-height: 20px;
          margin-bottom: 20px;
          margin-right: 10px;
        }
      }
      .r-bottom-bar {
        position: absolute;
        bottom: 0;
        height: 80px;
        width: 100%;
        border-top: 1px solid #F6F7FA;
        text-align: center;
        padding-top: 19px;
      }
    }
  }

  .icon {
    width: 3px;
    height: 16px;
    background: #3272F1;
    margin-right: 8px;
  }

  .l-header {
    width: 100%;
    height: 61px;
    border-bottom: 1px solid #EDEFF2;
    padding: 20px 20px 19px 18px;
    display: flex;

    .header-title {
      font-weight: 500;
      font-size: 16px;
      color: #292C33;
    }
  }

  .page-botoomBar {
    height: 75px;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 210px;
    background: #FFFFFF;
    box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
