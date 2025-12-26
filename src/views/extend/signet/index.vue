<template>
  <div class="tem-container app-container">
    <el-button @click="print" class="signs print">打印</el-button>
    <el-button @click="showlip" v-if="showBtn" class="signs">盖章</el-button>
    <div ref="print">
      <div class="tem_list">
        <div class="tem_main">
<!--          <h1>三门峡崤云视联科技有限公司</h1>-->
          <h2>报 价 单</h2>
          <h4>TO：</h4>
          <p class="title"> 感谢惠顾，现将贵公司所需配件报价如下：</p>
          <p class="lip">一、产品价格</p>
          <div style="padding: 0 1px 0 0">
            <el-table :data="tableData" border>
              <el-table-column prop="order" label="序号" width="50"></el-table-column>
              <el-table-column prop="name" label="品名" width="150"></el-table-column>
              <el-table-column prop="standards" label="规格" width="100"></el-table-column>
              <el-table-column prop="num" label="数量" width="60"></el-table-column>
              <el-table-column prop="unit" label="单位" width="60"></el-table-column>
              <el-table-column prop="unitprice" label="单价"></el-table-column>
              <el-table-column prop="total" label="金额"></el-table-column>
              <el-table-column prop="remarks" label="备注"></el-table-column>
            </el-table>
          </div>
          <p class="lip">二、通讯联络</p>
          <div class="content1">
            <div class="item">
              <span>需方联系人员：</span>
              <span>丰梦琪</span>
            </div>
            <div class="item">
              <span>供方联系人员：</span>
              <span>应白梦</span>
            </div>
            <div class="item">
              <span>需方联系电话：</span>
              <span>13802141322</span>
            </div>
            <div class="item">
              <span>供方联系电话：</span>
              <span>13802141322</span>
            </div>
            <div class="item">
              <span>需方传真号码：</span>
              <span>010-88888888</span>
            </div>
            <div class="item">
              <span>供方传真号码：</span>
              <span>021-88888888</span>
            </div>
            <div class="item">
              <span>供方地址：</span>
              <span>北京市海淀区西直门北大街42号</span>
            </div>
            <div class="item">
              <span>供方地址：</span>
              <span>上海市青浦区</span>
            </div>
            <div class="item">
              <span>供方邮编：</span>
              <span>100000</span>
            </div>
            <div class="item">
              <span>供方邮编：</span>
              <span>201799</span>
            </div>
          </div>
          <div class="temdate">日 期：2017-11-29</div>
          <div class="seal">盖章：</div>
        </div>
        <VueDragResize :isDraggable="showBtn" :w="150" :h="150" :isResizable='false' v-if="showsin">
          <img
            src ="data:image/png;base64,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"
            alt="">
          <div class="signBtn">
            <el-button @click="signclick" v-if="showBtn">确认</el-button>
            <el-button @click="cancelSign" v-if="showBtn">取消</el-button>
          </div>
        </VueDragResize>
      </div>
    </div>
  </div>
</template>
<script>
import VueDragResize from 'vue-drag-resize'
import printStyle from '../printData/printStyle'

export default {
  name: 'extend-signet',
  data() {
    return {
      showSign: true,
      showBtn: true,
      showsin: false,
      key: '',
      labelPosition: 'right',
      connect: {
        user: '丰梦琪',
        supply: '应白梦',
        userPhone: '13802141322',
        supplyPhone: '13004363886',
        useremail: '010-88888888',
        supplyemail: '021-88888888',
        useraddress: '北京市海淀区西直门北大街42号',
        supplyaddress: '上海市青浦 区',
        userPostcode: '100000',
        suPostcode: '201799'
      },
      tableData: [{
        order: '1',
        name: '服务器硬件',
        standards: '联想',
        num: '5',
        unit: '台',
        unitprice: '20000.00',
        total: '100000.00',
        remarks: ''
      }, {
        order: '2',
        name: '数据库正版',
        standards: 'SQLServer',
        num: '5',
        unit: '套',
        unitprice: '9998.00',
        total: '49990.00',
        remarks: ''
      }, {
        order: '3',
        name: 'OA内部管理系统',
        standards: '定制',
        num: '5',
        unit: '套',
        unitprice: '	390000.00',
        total: '	390000.00',
        remarks: ''
      }, {
        order: '4',
        name: '进销存管理系统',
        standards: '定制',
        num: '5',
        unit: '套',
        unitprice: '260000.00',
        total: '260000.00',
        remarks: ''
      }, {
        order: '5',
        name: '	服务费',
        standards: '',
        num: '5',
        unit: '年',
        unitprice: '80000.00',
        total: '80000.00',
        remarks: ''
      }, {
        order: '6',
        name: '差旅费用',
        standards: '',
        num: '5',
        unit: '年',
        unitprice: '60000.00',
        total: '80000.00',
        remarks: ''
      }]
    }
  },
  components: { VueDragResize },
  methods: {
    print() {
      let print = this.$refs.print.innerHTML
      let printPart = print + printStyle;
      let newTab = window.open('_blank');
      newTab.document.body.innerHTML = printPart;
      newTab.print();
      newTab.close();
    },
    showlip() {
      this.showsin = true
    },
    signclick() {
      this.showSign = false
      this.showBtn = false
    },
    cancelSign() {
      this.showsin = false
    }
  }
}
</script>

<style lang="scss" scoped>
.tem-container {
  background: #ebeef5 !important;
  overflow: auto;
  position: relative;
  padding: 0;
  .signs {
    position: absolute;
    right: 10px;
    top: 70px;
    &.print {
      top: 20px;
    }
  }
  .signBtn {
    display: flex;
    justify-content: space-between;
  }
  .tem_list {
    width: 800px;
    margin: 0 auto;
    background: #fff;
    // box-shadow: rgb(189, 189, 189) 0px 0px 10px;
    color: #606266;
    position: relative;
    .tem_main {
      width: 90%;
      margin: 0 auto;
      font-size: 12px;
      padding-bottom: 15px;
      h1 {
        padding-top: 36px;
      }
      h1,
      h2 {
        text-align: center;
        color: #475059;
      }
      .title {
        border-bottom: 2px dashed #000;
        padding-left: 30px;
        line-height: 30px;
        font-size: 12px;
      }
      .lip {
        padding: 20px 0;
      }

      .demo-form-inline {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
      }
      .el-form-item--mini.el-form-item,
      .el-form-item--small.el-form-item {
        border-bottom: 1px solid #ebeef5;
        width: 48%;
        margin: 0;
        >>> .el-input__inner {
          border: 0 !important;
          padding: 0;
          width: 220px;
          font-size: 12px;
        }
        >>> .el-form-item__label {
          font-size: 12px;
        }
      }
      .temdate {
        text-align: right;
        margin: 20px 60px;
      }
      .seal {
        text-align: right;
        margin: 10px 120px;
        padding-bottom: 40px;
      }
    }
  }
  .vdr.active:before {
    outline: 0;
  }
  .vdr.active {
    img {
      width: 100%;
      height: 100%;
    }
  }
  >>> .el-table thead tr th {
    background: #fff !important;
  }
  .el-table td,
  .el-table th.is-leaf {
    background: #fff !important;
  }
  .content1 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    .item {
      width: 345px;
      padding: 8px 0;
      border-bottom: 1px solid #ebeef5;
      span {
        font-size: 12px;
        padding: 10px 0;
        color: #606266;
      }
    }
  }
}
</style>
