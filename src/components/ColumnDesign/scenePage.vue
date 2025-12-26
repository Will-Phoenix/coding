<template>
  <div class="columnDesign-container">
    <div class="main-board">
      <div class="field-box">
        <el-button class="add-scene" @click="addScene">增加场景</el-button>
        <el-tabs v-model="activeSceneName" type="card" closable @tab-remove="removeScene" @tab-click="sceneTabClick">
          <el-tab-pane v-for="(item, index) in formSceneData" :key="item.name" :label="item.name" :name="item.name">
            <el-button class="func-btn" @click="funcBtnHandel()">场景脚本事件</el-button>
            <el-table :data="item.field" class="scene-select-table" size="mini" height="100%">
              <el-table-column prop="label" label="表单字段" align="left"></el-table-column>
              <el-table-column prop="write" label="操作" align="center" width="260">
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.read" @change="tapRead(scope)">查看</el-checkbox>
                  <el-checkbox v-model="scope.row.write">编辑</el-checkbox>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <form-script v-if="formScriptVisible" :key="scriptKey" :value="activeItem.func" ref="formScript"
                 type="btn" @updateScript="updateScript" @closeDialog="formScriptVisible=false" />
  </div>
</template>
<script>
import FormScript from './FormScript'

const defaultFunc = '({ data, request }) => {\r\n   \r\n}'

export default {
  name: 'scenePage',
  props: {
    formSceneData: {
      type: Array,
      default: () => []
    },
    formFieldData: {
      type: Array,
      default: () => []
    }
  },
  components: { FormScript },
  data() {
    return {
      activeSceneName: '',
      scriptKey: '',
      formScriptVisible: false,
      activeItem: {}
    }
  },
  mounted() {
    if (this.formSceneData == null) this.formSceneData = []
    if (this.formSceneData.length !== 0){
      this.activeSceneName = this.formSceneData[0].name
      this.activeItem = this.formSceneData[0]
      const newKey = {}
      this.formFieldData.forEach(value => {
        newKey[value.model] = value
      })
      // 在这里处理下新旧表单合并
      this.formSceneData.forEach(item => {
        // 根据新的表单数据过滤已经移除的控件
        item.field = item.field.filter(obj => newKey.hasOwnProperty(obj.model) )
        // 添加新的之前没有的控件
        let oldKeys = item.field.map(obj => obj.model)
        let addField = []
        Object.keys(newKey).forEach(key => {
          if (!oldKeys.includes(key)) {
            addField.push(newKey[key])
          }
        })
        item.field = item.field.concat(addField)
      })
    }
  },
  methods: {
    getAllScene() {
      return this.formSceneData
    },
    sceneTabClick(scene) {
      this.activeItem = scene
    },
    addScene() {
      this.$prompt('请输入场景名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        if (this.formSceneData == null) this.formSceneData = []
        const nowSceneName = this.formSceneData.find(o => o.name === value)
        if (!nowSceneName){ // 生成新的场景数据
          const id = this.jnpf.idGenerator()
          const scene = {
            name: value,
            id: id,
            field: JSON.parse(JSON.stringify(this.formFieldData))
          }
          this.formSceneData.push(scene)
          this.activeSceneName = value
          this.activeItem = scene
        } else {
          this.$message.warning('名称不能重复')
        }
      });
    },
    removeScene(targetName) {
      let scenes = this.formSceneData
      let activeName = this.activeSceneName
      let activeItemTemp = this.activeItem
      if (activeName === targetName) {
        scenes.forEach((scene, index) => {
          if (scene.name === targetName) {
            let nextScene = scenes[index + 1] || scenes[index - 1]
            if (nextScene) {
              activeName = nextScene.name;
              activeItemTemp = nextScene;
            }
          }
        })
      }
      this.activeSceneName = activeName;
      this.activeItem = activeItemTemp;
      this.formSceneData = scenes.filter(scene => scene.name !== targetName)
    },
    tapRead(scope) {
      if (scope.row.read === false){
        scope.row.write = false
      }
    },
    funcBtnHandel() {
      if (!this.activeItem.hasOwnProperty('func') || !this.activeItem.func || this.activeItem.func.length === 0) this.activeItem.func = defaultFunc
      this.formScriptVisible = true
      this.$nextTick(() => {
        this.$refs.formScript.init()
      })
    },
    updateScript(func) {
      this.activeItem.func = func
    },
  }
}
</script>
<style lang="scss" scoped>
@import './index.scss';
.add-scene {
  margin: 10px;
}
.scene-select-table {
  height: auto;
}
.func-btn {
  margin: 10px;
  font-size: 14px;
}
</style>
