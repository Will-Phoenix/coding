<template>
  <div :__source="aSource" class="htable">
    <div class="hwrapper">
      <div ref="container"></div>
    </div>
    <div ref="mask" class="hmask"></div>
  </div>
</template>
<script>
export default {
  name: "Htable"
}
</script>
<script setup>
import {
  onBeforeUnmount,
  onMounted,
  ref,
  defineProps,
  defineEmits,
  defineExpose,
  defineOptions
} from "@vue/composition-api"
import { hasScrollbar } from "@/utils/design"

import Handsontable from "handsontable"

import "./handsontable.full.min.css"
// 添加中文语言包导入
import "./languages/zh-CN.min.js"

const props = defineProps({
  conf: {
    type: Object,
    default: () => ({})
  },
  outside: {
    type: HTMLElement,
    default: null
  }
})

const emit = defineEmits([])
const config = ref({})
const aSource = ref("src/components/table/Htable.vue")
const CUSTOM_RENDERER_NAME = "a3f6c9b2e5d4417eb8d6f2c3a4e7b8f0"
const DEFAULT_LINE_HEIGHT = "1.2em"
const DEFAULT_BORDER_COLOR = "#000000"
const DEFAULT_BG_COLOR_CLASS = "bg-custom"
const DEFAULT_BG_COLOR = "#EDF0F2"
const container = ref()
const mask = ref("mask")
const selection = ref([])
let hot
let borderColor = DEFAULT_BORDER_COLOR

const getBaseTableConfig = (conf) => ({
  data: conf?.tableData || [],
  width: "100%",
  height: "100%",
  colWidths: conf?.colWidths || 50,
  rowHeights: conf?.rowHeights || 70,
  mergeCells: conf?.mergeCells || [],
  customBorders: true
})

const createCustomRenderer = () =>
  function (hotInstance, td, row, column, prop, value, cellProperties) {
    if (!td.children || td.children.length === 0) {
      const div = document.createElement("div")
      div.style.wordBreak = "break-all"
      div.style.lineHeight = DEFAULT_LINE_HEIGHT
      // div.style.maxHeight = div.style.lineHeight
      div.innerHTML = value
      td.appendChild(div)
    } else {
      const div = td.children[0]
      div.innerHTML = value
    }

    if (cellProperties.className?.includes(DEFAULT_BG_COLOR_CLASS)) {
      td.style.backgroundColor = DEFAULT_BG_COLOR
    }

    if (cellProperties.fontSize) {
      td.style.fontSize = `${cellProperties.fontSize}px`
    }

    if (cellProperties.fontWeight === "bold") {
      td.style.fontWeight = "bold"
    }
    if (cellProperties.fontFamily) {
      td.style.fontFamily = cellProperties.fontFamily
    }

    if (cellProperties.fontColor) {
      td.style.color = cellProperties.fontColor
    }

    td.className =
      cellProperties.className instanceof Array
        ? cellProperties.className.join(" ")
        : cellProperties.className || ""
  }

const init = (conf) => {
  if (hot) {
    hot.destroy()
  }
  config.value = JSON.parse(JSON.stringify(conf))

  Handsontable.renderers.registerRenderer(CUSTOM_RENDERER_NAME, createCustomRenderer())

  const baseConfig = getBaseTableConfig(conf)

  hot = new Handsontable(container.value, {
    ...baseConfig,
    rowHeaders: true,
    colHeaders: true,
    autoColumnSize: true,
    autoRowSize: true,
    manualRowResize: true,
    manualColumnResize: true,
    renderer: CUSTOM_RENDERER_NAME,
    autoWrapRow: true,
    autoWrapCol: true,
    contextMenu: createContextMenu(),
    outsideClickDeselects: (target) => !!props.outside?.contains(target),
    licenseKey: "non-commercial-and-evaluation",
    language: "zh-CN",
    selectionMode: "range",
    className: "htCenter htMiddle"
  })
  setupHooks()
  restoreConfig(conf)
}

const createContextMenu = () => ({
  items: [
    "mergeCells",
    "---------",
    "row_below",
    "col_left",
    // 'col_right',
    "---------",
    "remove_row",
    "remove_col",
    "clear_column",
    "---------",
    "undo",
    "redo",
    "copy",
    "cut",
    "---------",
    "alignment",
    {
      key: "borders",
      name: "边框",
      submenu: {
        items: [
          {
            key: "borders:add",
            name: "添加",
            callback: () => addSelectedRangeBorder()
          },
          {
            key: "borders:remove",
            name: "移除",
            callback: () => removeSelectedRangeBorder()
          },
          {
            key: "borders:clear",
            name: "全部清除",
            callback: () => removeAllBorder()
          }
        ]
      }
    }
  ]
})

const setupHooks = () => {
  hot.addHook("afterDeselect", () => {
    selection.value = []
  })

  hot.addHook("afterSelectionEnd", () => {
    // 获取所有选区
    const selected = hot.getSelected() || []
    if (selected.length === 0) {
      selection.value = []
      return
    }

    // 计算所有选区的边界
    let minRow = Infinity,
      minCol = Infinity,
      maxRow = -Infinity,
      maxCol = -Infinity

    selected.forEach(([startRow, startCol, endRow, endCol]) => {
      minRow = Math.min(minRow, startRow, endRow)
      minCol = Math.min(minCol, startCol, endCol)
      maxRow = Math.max(maxRow, startRow, endRow)
      maxCol = Math.max(maxCol, startCol, endCol)
    })

    // 标准化坐标
    minRow = minRow < 0 ? 0 : minRow
    minCol = minCol < 0 ? 0 : minCol

    selection.value = [minRow, minCol, maxRow, maxCol]
  })

  hot.addHook("beforeRowResize", () => {
    forEachTableTd((td) => {
      const div = td.children[0]
      if (div) {
        div.style.maxHeight = DEFAULT_LINE_HEIGHT
      }
    })
  })

  hot.addHook("afterRowResize", () => {
    updateCellMaxHeight()
  })

  hot.addHook("afterMergeCells", () => {
    updateCellMaxHeight()
  })

  hot.addHook("afterUnmergeCells", () => {
    updateCellMaxHeight()
  })
}

const restoreConfig = (conf) => {
  if (!conf) return

  const { tableData, borderSettings, cellsMeta } = conf

  // 恢复表格数据
  if (Array.isArray(tableData) && tableData.length > 0) {
    hot.loadData(tableData)
  }

  // 恢复边框设置
  if (Array.isArray(borderSettings) && borderSettings.length > 0) {
    const customBordersPlugin = hot.getPlugin("customBorders")
    borderSettings.forEach((v) => {
      customBordersPlugin.setBorders(v.selectionRanges, v.borderObject)
    })
  }

  // 恢复单元格元数据
  if (Array.isArray(cellsMeta) && cellsMeta.length > 0) {
    forEachTableTd((td, row, col) => {
      const meta = cellsMeta[row]?.[col]
      if (!meta) return

      if (meta.className) {
        hot.setCellMeta(row, col, "className", meta.className)
      }
      if (meta.fontSize) {
        hot.setCellMeta(row, col, "fontSize", meta.fontSize)
      }
      if(meta.fontFamily){
        hot.setCellMeta(row, col, "fontFamily", meta.fontFamily);
      }
      if (meta.fontWeight) {
        hot.setCellMeta(row, col, "fontWeight", meta.fontWeight)
      }
      if (meta.fontColor) {
        hot.setCellMeta(row, col, "fontColor", meta.fontColor)
      }
    })
  }

  hot.render()
}

const getTrs = () => {
  const table = hot?.table
  if (table) {
    const tbody = table.getElementsByTagName("tbody")[0]
    if (tbody) {
      return tbody.getElementsByTagName("tr")
    }
  }
  return []
}
const forEachTableTd = (callback) => {
  const trs = getTrs()
  for (let i = 0; i < trs.length; i++) {
    const tr = trs[i]
    for (let j = 1; j < tr.children.length; j++) {
      const td = tr.children[j]
      callback(td, i, j - 1)
    }
  }
}

const updateRowHeight = (row, height) => {
  const rowHeights = getRowHeights()
  rowHeights[row] = height
  hot.updateSettings({
    rowHeights: rowHeights
  })
}

const updateColWidth = (col, width) => {
  const colWidths = getColWidths()

  colWidths[col] = width
  hot.updateSettings({
    colWidths: colWidths
  })
}

const updateCellMaxHeight = () => {
  forEachTableTd((td) => {
    const style = window.getComputedStyle(td)
    const h = Number(style.height.replace(/[^\d.]/gim, ""))
    console.log({ td, h })
    const div = td.children[0]
    if (div) {
      div.style.maxHeight = `${h}px`
    }
  })
}
const deselectCell = () => {
  hot && hot.deselectCell()
}
const getHtml = () => {
  if (!hot) return ""
  deselectCell()
  const all = hot.getData()
  const colWidths = []
  for (let i = 0; i < hot.countCols(); i++) {
    colWidths[i] = hot.getColWidth(i)
  }
  const customBordersPlugin = hot.getPlugin("customBorders")
  const allBorders = customBordersPlugin.getBorders()
  const borderMap = {}
  allBorders.forEach((b) => {
    const { col, row } = hot.getCoords(hot.getCell(b.row, b.col))
    const bArr = []

    const { top, right, bottom, left } = b
    if (top && !top.hide) {
      bArr.push(`border-top:1px solid ${top?.color || DEFAULT_BORDER_COLOR};`)
    }
    if (right && !right.hide) {
      bArr.push(`border-right:1px solid ${right?.color || DEFAULT_BORDER_COLOR};`)
    }
    if (bottom && !bottom.hide) {
      bArr.push(`border-bottom:1px solid ${bottom?.color || DEFAULT_BORDER_COLOR};`)
    }
    if (left && !left.hide) {
      bArr.push(`border-left:1px solid ${left?.color || DEFAULT_BORDER_COLOR};`)
    }
    const key = `${row}_${col}`
    const old = borderMap[key] || []
    bArr.forEach((_) => {
      if (!old.includes(_)) {
        old.push(_)
      }
    })
    borderMap[key] = old
  })
  console.log("--border---", { borderMap, allBorders })
  return `<table border="0" cellspacing="1" cellpadding="1" style="border-collapse: collapse;border-spacing: 0;border-width: 0;margin: 0;max-height: none;max-width: none;outline-width: 0;table-layout: fixed;">
  <colgroup><col style="width: 0">${colWidths
    .map((v) => `<col style="width: ${v}px;">`)
    .join("")}</colgroup>
  <tbody>${all
    .map((_row, rowIndex) => {
      return `<tr>${_row
        .map((_col, colIndex) => {
          let ret = ""
          if (colIndex === 0) {
            const _h = hot.getRowHeight(rowIndex)
            ret += `<th style="width: 0;height: ${
              _h || 25
            }px;border: none;border-width: 0;margin: 0;padding: 0 4px;"></th>`
          }
          const cell = hot.getCell(rowIndex, colIndex)
          const { row, col } = hot.getCoords(cell)
          if (cell && row === rowIndex && col === colIndex) {
            const meta = hot.getCellMeta(rowIndex, colIndex)
            const cStyle = window.getComputedStyle(cell)
            ret += `<td rowspan="${cell.getAttribute("rowspan") || "1"}" colspan="${
              cell.getAttribute("colspan") || "1"
            }" style="padding:0 4px;margin:0;empty-cells: show;outline: none;outline-width: 0;white-space: pre-wrap;overflow: hidden;text-align: ${
              cStyle.textAlign
            }; ${
              cStyle.backgroundColor ? "background-color:" + cStyle.backgroundColor : ""
            };${cStyle.fontSize ? "font-size:" + cStyle.fontSize : ""};
            ${cStyle.fontFamily ? "font-family:" + cStyle.fontFamily.replace(/"/g, "'") : ""};${
              cStyle.fontWeight ? "font-weight:" + cStyle.fontWeight : ""
            };${
              cStyle.color ? "color:" + cStyle.color : ""
            };vertical-align: ${cStyle.verticalAlign};${(
              borderMap[`${row}_${col}`] || []
            ).join("")}">${cell.innerHTML}</td>`
          }
          return ret
        })
        .join("")}</tr>`
    })
    .join("")}</tbody>
</table>`
}
const getRowHeights = () => {
  const rowHeights = []
  for (let row = 0; row < hot.countRows(); row++) {
    rowHeights.push(hot.getRowHeight(row))
  }
  return rowHeights
}
const getColWidths = () => {
  const colWidths = []
  for (let col = 0; col < hot.countCols(); col++) {
    colWidths.push(hot.getColWidth(col))
  }
  return colWidths
}

const getConf = () => {
  const customBorders = hot.getPlugin("customBorders")
  const arr = customBorders.getBorders()
  const borderSettings = []
  arr.forEach((v) => {
    borderSettings.push({
      selectionRanges: [[v.row, v.col, v.row, v.col]],
      borderObject: {
        top: v.top,
        right: v.right,
        bottom: v.bottom,
        left: v.left
      }
    })
  })
  const tableData = hot.getData()
  const cellsMeta = []
  forEachTableTd((td, row, col) => {
    if (!cellsMeta[row]) {
      cellsMeta[row] = []
    }
    const meta = hot.getCellMeta(row, col)
    cellsMeta[row][col] = {
      className:
        (meta.className instanceof Array ? meta.className.join(" ") : meta.className) ||
        ""
    }
    if (meta?.fontSize) {
      cellsMeta[row][col].fontSize = meta.fontSize
    }
    if(meta?.fontFamily){
      cellsMeta[row][col].fontFamily = meta.fontFamily;
    }
    if (meta?.fontWeight) {
      cellsMeta[row][col].fontWeight = meta.fontWeight
    }
    if (meta?.fontColor) {
      cellsMeta[row][col].fontColor = meta.fontColor
    }
  })

  return {
    borderSettings,
    tableData,
    cellsMeta,
    row: config.value.row,
    col: config.value.col,
    size: config.value.size,
    paddingX: config.value.paddingX,
    paddingY: config.value.paddingY,
    mergeCells: hot.getPlugin("mergeCells").mergedCellsCollection.mergedCells,
    colWidths: getColWidths(),
    rowHeights: getRowHeights()
  }
}
const setConf = (conf) => {
  if (!mask.value) return
  const maskElement = mask.value
  const { width, height } = maskElement.getBoundingClientRect()
  const rowHeights = Math.floor((height - 2) / (conf.row || 8))
  const colWidths = Math.floor((width - 2) / (conf.col || 8))

  if (!conf.rowHeights) {
    conf.rowHeights = rowHeights
  }
  if (!conf.colWidths) {
    conf.colWidths = colWidths
  }
  init({ ...conf })
}
const validateTableSize = () => {
  const div = hot.rootElement.getElementsByClassName("htCore")[0]
  const wrap = document.getElementsByClassName("hmask")[0]
  const divRight = div.getBoundingClientRect().right;
  const divBottom = div.getBoundingClientRect().bottom;
  const wrapRight = wrap.getBoundingClientRect().right
  const wrapBottom = wrap.getBoundingClientRect().bottom
  return divRight<wrapRight && divBottom<wrapBottom;
}
const getCell = (rowIndex, colIndex) => {
  return hot ? hot.getCell(rowIndex, colIndex) : null
}
const getSelectedCell = () => {
  return selection.value.length > 0
    ? getCell(selection.value[0], selection.value[1])
    : null
}
const addSelectedRangeBorder = () => {
  const range = selection.value
  console.log("addSelectedRangeBorder range", range)
  const customBorders = hot.getPlugin("customBorders")
  if (range.length > 0) {
    customBorders.setBorders([range], {
      top: { hide: true },
      right: { width: 1, color: borderColor },
      bottom: { width: 1, color: borderColor },
      left: { hide: true }
    })
    const start = { row: range[0], col: range[1] }
    const end = { row: range[2], col: range[3] }
    for (let i = start.row; i <= end.row; i++) {
      for (let j = start.col; j <= end.col; j++) {
        if (j === start.col) {
          // 对第一列的所有行加左边框
          customBorders.setBorders([[i, j, i, j]], {
            left: { width: 1, color: borderColor }
          })
        }
        if (i === start.row) {
          // 对第一行的所有列加上边框
          customBorders.setBorders([[i, j, i, j]], {
            top: { width: 1, color: borderColor }
          })
        }
      }
    }
  }
}

const removeAllBorder = () => {
  hot.getPlugin("customBorders").clearBorders()
}

const removeSelectedRangeBorder = () => {
  const range = selection.value
  console.log("removeSelectedRangeBorder range", range)
  if (range.length > 0) {
    hot.getPlugin("customBorders").clearBorders([range])
  }
}

// 抽取公共逻辑处理选中区域的单元格样式
const processSelectedCells = (callback) => {
  const [row, col, row2, col2] = selection.value
  if (row === undefined) return

  for (let r = Math.min(row, row2); r <= Math.max(row, row2); r++) {
    for (let c = Math.min(col, col2); c <= Math.max(col, col2); c++) {
      const cell = hot.getCell(r, c)
      if (cell) {
        callback(cell, r, c)
      }
    }
  }
}

// 添加选中区域的背景色
const addSelectedRangeBgColor = () => {
  processSelectedCells((cell, row, col) => {
    const meta = hot.getCellMeta(row, col)
    const className = meta.className || ""
    const classNames = Array.isArray(className) ? className : className.split(" ")

    if (!classNames.includes(DEFAULT_BG_COLOR_CLASS)) {
      classNames.push(DEFAULT_BG_COLOR_CLASS)
    }

    hot.setCellMeta(row, col, "className", classNames.join(" "))
  })
  hot.render()
}

// 移除选中区域的背景色
const removeSelectedRangeBgColor = () => {
  processSelectedCells((cell, row, col) => {
    const meta = hot.getCellMeta(row, col)
    const className = meta.className || ""
    const classNames = Array.isArray(className) ? className : className.split(" ")

    const filteredClasses = classNames.filter((c) => c !== DEFAULT_BG_COLOR_CLASS)
    hot.setCellMeta(row, col, "className", filteredClasses.join(" "))
  })
  hot.render()
}

const setBold = () => {
  processSelectedCells((cell, row, col) => {
    hot.setCellMeta(row, col, "fontWeight", "bold")
  })
  hot.render()
}

const removeBold = () => {
  processSelectedCells((cell, row, col) => {
    hot.setCellMeta(row, col, "fontWeight", "normal")
  })
  hot.render()
}

// 添加选中区域的字体大小
const setFontSize = (size) => {
  processSelectedCells((cell, row, col) => {
    hot.setCellMeta(row, col, "fontSize", size)
  })
  hot.render()
}

// 设置选中区域的单元格的行高
const setRowHeight = (height) => {
  const [row] = selection.value
  updateRowHeight(row, height)
  hot.render()
}

// 设置选中区域的单元格的列宽
const setColWidth = (width) => {
  const [, col] = selection.value
  updateColWidth(col, width)
  hot.render()
}

const addSelectedRangeBorderItem = (borderConf) => {
  const customBorders = hot.getPlugin("customBorders")
  if (customBorders && selection.value.length > 0) {
    const { borderTop, borderRight, borderBottom, borderLeft } = borderConf
    processSelectedCells((cell, row, col) => {
      customBorders.setBorders([[row, col, row, col]], {
        top: borderTop ? { width: 1, color: borderColor } : { hide: true },
        right: borderRight ? { width: 1, color: borderColor } : { hide: true },
        bottom: borderBottom ? { width: 1, color: borderColor } : { hide: true },
        left: borderLeft ? { width: 1, color: borderColor } : { hide: true }
      })
    })
  }
}

const changeSelectedCellTextAlign = (textAlign) => {
  const alignClassMap = {
    left: "htLeft",
    center: "htCenter",
    right: "htRight",
    justify: "htJustify"
  }
  const textAlignClass = alignClassMap[textAlign]
  const alignClasses = Object.values(alignClassMap)

  processSelectedCells((cell, row, col) => {
    const meta = hot.getCellMeta(row, col)
    const className = meta.className || ""
    const classNames = Array.isArray(className) ? className : className.split(" ")
    const filteredClasses = classNames.filter((cls) => !alignClasses.includes(cls))
    filteredClasses.push(textAlignClass)
    hot.setCellMeta(row, col, "className", filteredClasses.join(" "))
  })
  hot.render()
}

const changeSelectedCellVerticalAlign = (verticalAlign) => {
  const verticalAlignClassMap = {
    top: "htTop",
    middle: "htMiddle",
    bottom: "htBottom"
  }
  const verticalAlignClass = verticalAlignClassMap[verticalAlign]
  const verticalAlignClasses = Object.values(verticalAlignClassMap)

  processSelectedCells((cell, row, col) => {
    const meta = hot.getCellMeta(row, col)
    const className = meta.className || ""
    const classNames = Array.isArray(className) ? className : className.split(" ")
    const filteredClasses = classNames.filter(
      (cls) => !verticalAlignClasses.includes(cls)
    )
    filteredClasses.push(verticalAlignClass)
    hot.setCellMeta(row, col, "className", filteredClasses.join(" "))
  })
  hot.render()
}

const setFontFamily = (fontFamily) => {
  processSelectedCells((cell, row, col) => {
    hot.setCellMeta(row, col, "fontFamily", fontFamily)
  })
  hot.render()
}

// 设置字体颜色
const setFontColor = (color) => {
  processSelectedCells((cell, row, col) => {
    hot.setCellMeta(row, col, "fontColor", color)
  })
  hot.render()
}

// 设置边框颜色
const setBorderColor = (color) => {
  // 更新边框颜色，在应用边框时会使用此颜色
  borderColor = color
  hot.render()
}

defineExpose({
  getConf,
  setConf,
  getHtml,
  deselectCell,
  validateTableSize,
  selection,
  getSelectedCell,
  getCell,
  getHot: () => hot,
  addSelectedRangeBorder,
  removeSelectedRangeBorder,
  removeAllBorder,
  addSelectedRangeBgColor,
  removeSelectedRangeBgColor,
  setFontSize,
  setBold,
  removeBold,
  addSelectedRangeBorderItem,
  changeSelectedCellTextAlign,
  changeSelectedCellVerticalAlign,
  setRowHeight,
  setColWidth,
  setFontFamily,
  setFontColor,
  setBorderColor
})

onMounted(() => {})
onBeforeUnmount(() => {
  if (hot) {
    hot.destroy()
  }
})
</script>
<style>
.htContextMenu:not(.htGhostTable) {
  z-index: 100000;
}
.handsontable {
  font-family: "仿宋", "FangSong", "STFangsong", serif;
}
.handsontable td,
.handsontable th {
  padding: 0 4px;
  font-size: 14px;
}
.ht_master.handsontable .htItemWrapper {
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei,
    Arial, sans-serif !important;
}
</style>

<style lang="scss" scoped>
.htable {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 100%;
}

.hwrapper {
  width: calc(100% + 50px);
  height: calc(100% + 26px);
  overflow: visible;
  position: absolute;
  top: -26px;
  left: -50px;
}

.hmask {
  pointer-events: none;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  border: 1px dashed red;
  z-index: 1000;
}
</style>
