<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-center">
      <el-card header="电子凭证" shadow="hover">
        <div class="detail-line">
          <div class="kv">
            <span class="k">票据类型：</span>
            <span class="v">{{ invoiceTypeName }}</span>
          </div>
          <div class="kv">
            <span class="k">发票代码：</span>
            <span class="v">{{ invoiceBillCode }}</span>
          </div>
          <div class="kv">
            <span class="k">发票号码：</span>
            <span class="v">{{ code }}</span>
          </div>
        </div>
        <div>
          <el-tabs v-model="activeName">
            <!--            <el-tab-pane label="票据原件" name="first">-->
            <!--              <div v-if="invoiceFidImg !== ''">-->
            <!--                <embed :src="invoiceFidImg" style="width: 100%;height: 60vh">-->
            <!--              </div>-->
            <!--              <div v-else>-->
            <!--                暂无数据-->
            <!--              </div>-->
            <!--            </el-tab-pane>-->

            <el-tab-pane label="票据原件" name="first">
              <div v-if="invoiceImg !== ''">
                <el-image :src="invoiceImg" class="img" :preview-src-list="[invoiceImg]" />
              </div>
              <div v-else>
                暂无数据
              </div>
            </el-tab-pane>
            <el-tab-pane label="XML代码" name="second">
              <div v-if="invoiceXmlImg !== ''">
                <textarea v-model="invoiceXmlImg" readonly style="width: 100%;height: 400px" />
              </div>
              <div v-else>
                暂无数据
              </div>
            </el-tab-pane>
            <el-tab-pane label="查验凭证" name="third">
              <div v-if="invoiceCheckImg !== ''">
                <el-image :src="invoiceCheckImg" class="img" :preview-src-list="[invoiceCheckImg]" />
              </div>
              <div v-else>
                暂无数据
              </div>
            </el-tab-pane>
            <el-tab-pane label="关联报销信息" name="fourth">
              <FormOrder :prop-order-id="orderId" :toolbar-visible="false" title="详情" sub-title="单据详情" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </div>
  </div>

</template>
<script>
import { downloadFile } from "@/api/business/signature";
import FormOrder from '@/views/expenseAccountManage/copy';
import axios from 'axios';
import Textarea from "@/components/Generator/index/RightComponents/Textarea.vue";

export default {
  components: { Textarea, FormOrder },
  data() {
    return {
      activeName: 'first',
      dataList: [],
      invoiceTypeName: "",
      invoiceBillCode: "",
      code: "",
      invoiceFidImg: "",
      invoiceXmlImg: "",
      invoiceImg: "",
      invoiceCheckImg: "",
      orderId: "",
      accountVoucher: {
        visible: false,
        data: {},
        loading: false,
      },
      preview: {
        visible: false,
        fileUrl: "",
        fileTitle: "",
      },
    }
  },
  created() {
    let isPreview = this.$route.query.data ? JSON.parse(this.$route.query.data) : false
    if (isPreview) {
      this.invoiceTypeName = isPreview.invoiceTypeName
      this.invoiceBillCode = isPreview.invoiceBillCode
      this.code = isPreview.code
      this.orderId = isPreview.orderId
      this.isPreview = true
      // 加载票据原件
      // if (isPreview.fid && isPreview.fid !== "-") {
      //   downloadFile(isPreview.fid).then(res2 => {
      //     this.invoiceFidImg = res2.data.url;
      //   });
      // }
      // 加载XML代码
      if (isPreview.xmlFid && isPreview.xmlFid !== "-") {
        downloadFile(isPreview.xmlFid).then(res2 => {
          axios.get(res2.data.url)
            .then(response => {
              this.invoiceXmlImg = response.data
            })
            .catch(error => {
              console.error('获取XML文件失败', error);
            });
        });
      }
      // 加载票据原件（原名为拍摄原件）
      if (isPreview.imgFid && isPreview.imgFid !== "-") {
        downloadFile(isPreview.imgFid).then(res2 => {
          this.invoiceImg = res2.data.url;
        });
      }
      // 加载查验凭证
      if (isPreview.chectFid && isPreview.chectFid !== "-") {
        downloadFile(isPreview.chectFid).then(res3 => {
          this.invoiceCheckImg = res3.data.url;
        });
      }
    }
  },
  methods: {
  }
}
</script>
<style scoped lang="scss">
.detail-line {
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .kv {
    .k {
      font-weight: bold;
    }
    .v {
      margin-right: 20px;
    }
  }
}

::v-deep .el-tabs__item{
  margin-top: 30px;
  padding-right:15vw;
}

.img{
  overflow: auto;
}

::v-deep .is-hover-shadow{
  overflow: auto;
}
::v-deep .JNPF-common-layout-center{
  overflow: auto;
}
</style>
