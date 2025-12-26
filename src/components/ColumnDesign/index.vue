<template>
  <div class="columnDesign-box">
    <div style="height:100%" v-show="webType==2||webType==3||webType==4">
      <column-main ref="columnMain" :conf="columnData" :modelType="modelType" :webType="webType"
        :interfaceId="interfaceId" :templateJson="templateJson" v-show="currentTab==='pc'" :form-scene-data="formSceneData" />
      <column-main-app ref="columnMainApp" :conf="appColumnData" :modelType="modelType"
        :webType="webType" :interfaceId="interfaceId" :templateJson="templateJson"
        v-show="currentTab==='app'" />
      <scene-page ref="scenePage" v-show="currentTab==='scene'" :form-scene-data="formSceneData" :form-field-data="formFieldData" />
      <div class="head-tabs">
        <el-button icon="icon-ym icon-ym-pc" :class="{'unActive-btn':currentTab!=='pc'}" type="text"
          @click="currentTab='pc'" size="medium">桌面端</el-button>
        <el-button icon="icon-ym icon-ym-mobile" :class="{'unActive-btn':currentTab!=='app'}"
          type="text" @click="currentTab='app'" size="medium">移动端</el-button>
        <el-button icon="icon-ym icon-ym icon-ym-authorize" :class="{'unActive-btn':currentTab!=='scene'}"
                   type="text" @click="currentTab='scene'" size="medium"
                   v-if="formFieldData.length !== 0">场景权限</el-button>
      </div>
    </div>
    <div class="column-empty-info" v-show="webType!=2&&webType!=4">
      <img src="@/assets/images/generator/columnType1.png" class=" empty-img">
      <p>开启后，表单带有数据列表</p>
      <el-button type="primary" style="width:150px" size="medium" @click="$emit('openList')">开启列表
      </el-button>
    </div>
  </div>
</template>
<script>
import ColumnMain from './main'
import ColumnMainApp from './mainApp'
import ScenePage from './scenePage'
export default {
  name: 'columnDesign-box',
  props: {
    columnData: {
      type: Object,
      default: () => { }
    },
    appColumnData: {
      type: Object,
      default: () => { }
    },
    formSceneData: {
      type: Array,
      default: () => []
    },
    formFieldData: {
      type: Array,
      default: () => []
    },
    webType: {},
    modelType: {},
    interfaceId: {},
    templateJson: {
      type: Array,
      default: () => []
    },
  },
  components: { ColumnMain, ColumnMainApp, ScenePage },
  data() {
    return {
      currentTab: 'pc',
    }
  },
  created() {
  },
  methods: {
    /**
      * 供父组件使用 获取列表JSON
    */
    getData() {
      return new Promise((resolve, reject) => {
        let columnData = this.$refs.columnMain.getData()
        let sceneData = this.$refs.scenePage.getAllScene()
        if (!columnData) reject({ msg: '', target: 2 })
        let appColumnData = this.$refs.columnMainApp.getData()
        if (!appColumnData.columnList || !appColumnData.columnList.length) {
          appColumnData.columnList = columnData.columnList
        }
        resolve({ columnData, appColumnData, target: 2, sceneData })
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.columnDesign-box {
  width: 100%;
  height: 100%;
  position: relative;
  .head-tabs {
    position: absolute;
    left: 0;
    top: 0;
    width: calc(100% - 350px);
    height: 42px;
    border-bottom: 1px solid #dcdfe6;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 10px;
    z-index: 100;
    border-radius: 4px 4px 0 0;
    .el-button + .el-button {
      margin-left: 15px;
    }
    .unActive-btn {
      color: #606266 !important;
      &:hover {
        color: #1890ff !important;
      }
    }
    >>> i {
      font-size: 20px;
      vertical-align: middle;
      position: relative;
      top: -1px;
    }
  }
}
</style>
