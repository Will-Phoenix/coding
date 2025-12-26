<template>
  <div :__source="aSource" class="conf-container">
    <div v-show="showCellConf">
      <!-- <div class="menu-title" :title="selectionStr">当前选区</div> -->
      <el-collapse v-model="areaActiveKey">
        <el-collapse-item name="1" title="边框">
          <div style="padding: 5px 0">每边单独设置</div>
          <table class="conf-border-table">
            <tbody>
              <tr>
                <td colspan="3" style="">
                  <el-checkbox
                    v-model="cellConf.borderTop"
                    @change="onChangeBorderConf"
                  >上</el-checkbox>
                </td>
              </tr>
              <tr>
                <td>
                  <el-checkbox
                    v-model="cellConf.borderLeft"
                    @change="onChangeBorderConf"
                  >左</el-checkbox>
                </td>
                <td :style="bTdStyle"></td>
                <td>
                  <el-checkbox
                    v-model="cellConf.borderRight"
                    @change="onChangeBorderConf"
                  >右</el-checkbox>
                </td>
              </tr>
              <tr>
                <td colspan="3">
                  <el-checkbox
                    v-model="cellConf.borderBottom"
                    @change="onChangeBorderConf"
                  >下</el-checkbox>
                </td>
              </tr>
            </tbody>
          </table>
          <el-divider style="margin: 5px 0" dashed />
          <div style="padding: 5px 0">整体设置</div>
          <Space>
            <el-button
              style="margin: 0"
              @click="addSelectedRangeBorder"
            >添加边框</el-button>
            <el-button
              style="margin: 0"
              @click="removeSelectedRangeBorder"
            >移除边框</el-button>
            <el-button style="margin: 0" @click="removeAllBorder">清除全部边框</el-button>
          </Space>
          <Space align="center" style="padding: 5px 0">
            <span>设置边框颜色:</span>
            <el-color-picker v-model="borderColor" show-alpha></el-color-picker>
            <el-input v-model="borderColor" placeholder="#000000" style="width: 120px" />
          </Space>
        </el-collapse-item>
        <el-collapse-item name="2" title="横向对齐">
          <el-radio-group
            v-model="cellConf.textAlign"
            size="small"
            @input="onChangeTextAlign"
          >
            <el-radio-button
              v-for="item in textAlignOptions"
              :key="item.value"
              :label="item.value"
            >{{ item.label }}</el-radio-button>
          </el-radio-group>
        </el-collapse-item>
        <el-collapse-item name="3" title="纵向对齐">
          <el-radio-group
            v-model="cellConf.verticalAlign"
            size="small"
            @input="onChangeVerticalAlign"
          >
            <el-radio-button
              v-for="item in verticalAlignOptions"
              :key="item.value"
              :label="item.value"
            >{{ item.label }}</el-radio-button>
          </el-radio-group>
        </el-collapse-item>

        <el-collapse-item name="4" title="样式">
          <Space align="center" style="padding: 5px 0">
            <span>背景色:</span>
            <el-button style="margin: 0" @click="setBgColor">设置背景色</el-button>
            <el-button style="margin: 0" @click="removeBgColor">移除背景色</el-button>
          </Space>
          <Space align="center" style="padding: 5px 0">
            <span>加粗:</span>
            <el-button style="margin: 0" @click="setBold">加粗</el-button>
            <el-button style="margin: 0" @click="removeBold">取消加粗</el-button>
          </Space>
          <Space align="center" style="padding: 5px 0">
            <span>设置字体:</span>
            <el-select v-model="fontFamily" placeholder="请选择字体" style="width: 120px">
              <el-option label="黑体" value="&quot;Microsoft YaHei&quot;, 黑体"></el-option>
              <el-option label="仿宋" value="仿宋, FangSong, STFangsong, serif"></el-option>
              <el-option label="宋体" value="Songti SC, SimSun, 宋体"></el-option>
            </el-select>
          </Space>
          <Space align="center" style="padding: 5px 0">
            <span>设置字体大小:</span>
            <el-input-number v-model="fontSize" :min="12" />
          </Space>
          <Space align="center" style="padding: 5px 0">
            <span>设置字体颜色:</span>
            <el-color-picker v-model="fontColor" show-alpha></el-color-picker>
            <el-input v-model="fontColor" placeholder="#373737" style="width: 120px" />
          </Space>
          <Space v-if="colWidth > 0" align="center" style="padding: 5px 0">
            <span>设置列宽:</span>
            <el-input-number v-model="colWidth" :min="12" />
          </Space>
          <Space v-if="rowHeight > 0" align="center" style="padding: 5px 0">
            <span>设置行高:</span>
            <el-input-number v-model="rowHeight" :min="12" />
          </Space>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, defineProps } from "@vue/composition-api"
import { getSelectedCellCount } from "@/utils/design"
import Space from "./Space/index.vue"

const props = defineProps({
  table: {
    type: Object,
    default: undefined
  }
})

const aSource = ref("src/components/table/HConf.vue")
const selection = computed(() => props.table?.selection || [])
const showCellConf = ref(selection.value.length > 0)

watch(selection, (n, o) => {
  showCellConf.value = n.length > 0
  const borders = {
    borderTop: false,
    borderRight: false,
    borderBottom: false,
    borderLeft: false
  }
  const align = { textAlign: undefined, verticalAlign: undefined }
  const cell = props.table?.getSelectedCell()

  if (selection.value.length > 0) {
    const customBorders = getCustomBorders()
    const cb = customBorders?.getBorders([getSelectionCellRange()])
    if (cb && cb.length > 0) {
      const { top, right, bottom, left } = cb[0]
      Object.assign(borders, {
        borderTop: !top?.hide,
        borderRight: !right?.hide,
        borderBottom: !bottom?.hide,
        borderLeft: !left?.hide
      })
      borderColor.value = top?.color || right?.color || bottom?.color || left?.color || "#000000";
    } else {
      borderColor.value = "#000000";
    }

    if (getSelectedCellCount(props.table?.getHot()) === 1) {
      fontSize.value = cell?.style?.fontSize ? parseInt(cell?.style?.fontSize) : 14;
      fontFamily.value = cell?.style?.fontFamily ? cell?.style?.fontFamily : '仿宋, FangSong, STFangsong, serif';
      fontColor.value = cell?.style?.color || "#373737";
    }
    colWidth.value = 0
    rowHeight.value = 0
    if (selection.value[0] === selection.value[2]) {
      if (props.table?.getHot()?.getRowHeight(selection.value[0])) {
        rowHeight.value = Math.floor(
          props.table?.getHot()?.getRowHeight(selection.value[0])
        )
      }
    }
    if (selection.value[1] === selection.value[3]) {
      if (props.table?.getHot()?.getColWidth(selection.value[1])) {
        colWidth.value = Math.floor(
          props.table?.getHot()?.getColWidth(selection.value[1])
        )
      }
    }
  }
  if (cell) {
    if (cell.classList.contains("htLeft")) {
      align.textAlign = "left"
    } else if (cell.classList.contains("htCenter")) {
      align.textAlign = "center"
    } else if (cell.classList.contains("htRight")) {
      align.textAlign = "right"
    } else if (cell.classList.contains("htJustify")) {
      align.textAlign = "justify"
    }
    if (cell.classList.contains("htTop")) {
      align.verticalAlign = "top"
    } else if (cell.classList.contains("htMiddle")) {
      align.verticalAlign = "middle"
    } else if (cell.classList.contains("htBottom")) {
      align.verticalAlign = "bottom"
    }
  }
  cellConf.value = { ...borders, ...align }
})

const borderColor = ref("#000000")
const activeTab = ref(selection.value.length > 0 ? "2" : "1")
const areaActiveKey = ref(["1", "2", "3", "4"])
const tableAreaActiveKey = ref(["1"])
const cellConf = ref({
  textAlign: "center",
  verticalAlign: "middle"
})
const fontSize = ref(14)
const fontFamily = ref('仿宋, FangSong, STFangsong, serif')
const fontColor = ref("#373737");
const colWidth = ref(0)
const rowHeight = ref(0)

watch(fontFamily, () => {
  props.table?.setFontFamily(fontFamily.value)
})

watch(fontColor, () => {
  props.table?.setFontColor(fontColor.value)
})

watch(borderColor, () => {
  // 当边框颜色变化时，更新边框样式
  props.table?.setBorderColor(borderColor.value)
  // 如果当前有选中的单元格，重新应用边框配置
  if (selection.value.length > 0) {
    addSelectedRangeBorderItem(cellConf.value)
  }
})

const bTdStyle = computed(() => {
  const { borderTop, borderRight, borderBottom, borderLeft } = cellConf.value
  return {
    borderTop: borderTop ? `1px solid ${borderColor.value}` : `1px dashed #eeeeee`,
    borderRight: borderRight ? `1px solid ${borderColor.value}` : `1px dashed #eeeeee`,
    borderBottom: borderBottom ? `1px solid ${borderColor.value}` : `1px dashed #eeeeee`,
    borderLeft: borderLeft ? `1px solid ${borderColor.value}` : `1px dashed #eeeeee`
  }
})

const getCustomBorders = () => props.table?.getHot()?.getPlugin("customBorders")
const getSelectionCellRange = () => [
  selection.value[0],
  selection.value[1],
  selection.value[0],
  selection.value[1]
]

const onChangeBorderConf = () => {
  addSelectedRangeBorderItem(cellConf.value)
}

const textAlignOptions = ref([
  { label: "左对齐", value: "left" },
  { label: "水平居中", value: "center" },
  { label: "右对齐", value: "right" },
  { label: "两端对齐", value: "justify" }
])

const verticalAlignOptions = ref([
  { label: "顶端对齐", value: "top" },
  { label: "垂直居中", value: "middle" },
  { label: "底端对齐", value: "bottom" }
])

const onChangeTextAlign = (e) => {
  changeSelectedCellTextAlign(e)
}

const onChangeVerticalAlign = (e) => {
  changeSelectedCellVerticalAlign(e)
}

watch(fontSize, () => {
  props.table?.setFontSize(fontSize.value)
})

watch(colWidth, (v, p) => {
  if (v > 0 && p > 0) {
    props.table?.setColWidth(v)
  }
})

watch(rowHeight, (v, p) => {
  if (v > 0 && p > 0) {
    props.table?.setRowHeight(v)
  }
})

const addSelectedRangeBorder = () => {
  props.table?.addSelectedRangeBorder()
  cellConf.value = {
    ...cellConf.value,
    borderTop: true,
    borderRight: true,
    borderBottom: true,
    borderLeft: true
  }
}

const removeSelectedRangeBorder = () => {
  props.table?.removeSelectedRangeBorder()
  cellConf.value = {
    ...cellConf.value,
    borderTop: false,
    borderRight: false,
    borderBottom: false,
    borderLeft: false
  }
}

const removeAllBorder = () => props.table?.removeAllBorder()
const setBgColor = () => props.table?.addSelectedRangeBgColor()
const removeBgColor = () => props.table?.removeSelectedRangeBgColor()
const setBold = () => props.table?.setBold()
const removeBold = () => props.table?.removeBold()
const addSelectedRangeBorderItem = (borderConf) =>
  props.table?.addSelectedRangeBorderItem(borderConf)
const changeSelectedCellTextAlign = (textAlign) =>
  props.table?.changeSelectedCellTextAlign(textAlign)
const changeSelectedCellVerticalAlign = (verticalAlign) =>
  props.table?.changeSelectedCellVerticalAlign(verticalAlign)
</script>
<style lang="scss">
.conf-container {
  .el-collapse {
    border: 0 !important;
  }
  .el-collapse-item__header {
    border: 0 !important;
  }
  .el-collapse-item__wrap {
    border: 0 !important;
  }
}
.conf-border-table{
  .ant-checkbox + span{
    padding: 0;
  }
}
.ant-tabs > .ant-tabs-nav{
  margin-bottom: 0;
}
</style>
<style lang="scss" scoped>
.conf-container {
  box-sizing: border-box;
  padding: 0 10px;
}
.conf-border-table {
  margin: 0 auto;
  td {
    width: 60px;
    height: 60px;
    text-align: center;
    vertical-align: middle;
  }
}

.menu-title {
  padding: 10px 5px 0 5px;
  font-size: 17px;
  font-weight: bold;
}
button + button {
  margin-left: 5px;
}
</style>
