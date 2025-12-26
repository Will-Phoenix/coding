<template>
  <div class="page-index">
    <div class="top" v-if="size">
      <div>
        <Space align="center">
          <el-button style="margin: 0;" icon="el-icon-circle-plus-outline" @click="handleNewTable"
            type="primary">新建模版</el-button>
          <el-button style="margin: 0;" icon="el-icon-s-opportunity"
            @click="templateDialogVisible=true" type="primary">通过模版</el-button>
        </Space>
      </div>
      <div>
        <Space align="center">
          <el-button style="margin: 0;" icon="el-icon-back" plain @click="undo">回退</el-button>
          <el-button style="margin: 0;" icon="el-icon-right" plain @click="redo">重做</el-button>
          <el-button style="margin: 0;" icon="el-icon-circle-check" plain
            @click="checkSize">检查表格尺寸</el-button>
          <el-button style="margin: 0;" icon="el-icon-view" plain :loading="_htmlPreviewLoading"
            @click="_htmlPreview">html预览</el-button>
          <el-button style="margin: 0;" icon="el-icon-printer" plain :loading="_printPreviewLoading"
            @click="_printPreview">打印预览</el-button>
          <el-button style="margin: 0;" icon="el-icon-download" type="primary"
            :loading="_tempSaveLoading" @click="openConfigDialog">获取配置数据</el-button>
          <el-button style="margin: 0;" icon="el-icon-s-order" type="primary"
            :loading="_tempSaveLoading" @click="_tempSave">暂存</el-button>
        </Space>
      </div>
    </div>
    <div v-if="size" t="主体部分" class="content">
      <div class="system-view-nav">
        <el-scrollbar class="left-scrollbar">
          <div class="JNPF-common-title">
            <h2>表单字段</h2>
          </div>
          <el-tree :data="newData" default-expand-all :props="defaultProps"
            @node-click="handleNodeClick"></el-tree>
          <div class="JNPF-common-title sys-title">
            <h2>系统字段</h2>
          </div>
          <el-tree :data="newSysData" default-expand-all :props="defaultProps"
            @node-click="handleNodeClick"></el-tree>
        </el-scrollbar>
      </div>
      <div t="中间画布" class="content-center" ref="content">
        <div v-if="['297_210','210_148'].includes(size)"
          :style="`color: #000000;font-size:14px;line-height: 0;font-family: '仿宋', 'FangSong', 'STFangsong', serif;position: relative; background: #fff; margin: auto; width: ${sizeObj.width}mm; height: ${sizeObj.height}mm`">
          <div style="width: 100%; height: 100%; display: flex;  font-weight: 400">
            <div :style="STYLE_CONSTANTS.BINDING_LINE">
              <div>装</div>
              <div>订</div>
              <div>线</div>
            </div>
            <div style="height: 100%; box-sizing: border-box; padding: 110px 0 110px 0">
              <div style="height: 100%; border-left: 1px dashed #292c33"></div>
            </div>
            <div style="width: 0; flex: 1; padding: 50px" :class="iClass">
              <div style="width: 100%; height: 100%">
                <Htable ref="htable" :conf="hconf" :outside="content" :key="size"></Htable>
              </div>
            </div>
          </div>
        </div>
        <div v-if="['210_297','148_210'].includes(size)"
          :style="`color: #000000;font-size:14px;line-height: 0;font-family: '仿宋', 'FangSong', 'STFangsong', serif;position: relative; background: #fff; margin: auto; width: ${sizeObj.width}mm; height: ${sizeObj.height}mm`">
          <div
            :style="`width: 100%; height: 100%;padding: ${newTableForm.paddingY || 80}px ${newTableForm.paddingX || 120}px;` "
            :class="iClass">
            <Htable ref="htable" :conf="hconf" :outside="content" :key="size"></Htable>
          </div>
        </div>
      </div>
      <div t="右侧面板" class="content-right-warp" v-if="selection.length > 0">
        <div v-if="minConfig" @click="minConfig=false" class="mini-config-btn el-icon-setting">
        </div>
        <div v-else class="content-right">
          <el-card>
            <div slot="header">
              <span>配置</span>
              <el-button @click="minConfig=true" style="float: right; padding: 3px 0"
                type="text">收缩</el-button>
            </div>
            <HConf ref="hconf" :table="htable"></HConf>
          </el-card>
        </div>
      </div>

    </div>
    <div class="new-create-contain" v-else>
      <el-button icon="el-icon-plus" size="medium" @click="handleNewTable"
        type="primary">新建模版</el-button>
    </div>
    <el-dialog append-to-body width="30%" :visible.sync="newTableDialogVisible" title="新建表格">
      <el-form :model="newTableForm" label-width="120px">
        <el-form-item label="纸张大小">
          <el-select v-model="newTableForm.size">
            <el-option v-for="(value, key) in SIZE_MAP" :key="key" :label="value" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="行数">
          <el-input-number v-model="newTableForm.row" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="列数">
          <el-input-number v-model="newTableForm.col" :min="1" :max="100" />
        </el-form-item>
        <template v-if="['210_297','148_210'].includes(newTableForm.size)">
          <el-form-item label="纵向边距">
            <el-input-number v-model="newTableForm.paddingY" :min="1" :max="100" />
          </el-form-item>
          <el-form-item label="横向边距">
            <el-input-number v-model="newTableForm.paddingX" :min="1" :max="100" />
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="newTableDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="() => handleNewTableDialogOk(handleTableCreate)">确
          定</el-button>
      </span>
    </el-dialog>

    <el-dialog append-to-body width="30%" :visible.sync="templateDialogVisible" title="使用模版"
      @close="handleTemplateDialogOk">
      <div class="template-dialog-list">
        <div class="template-dialog-item" v-for="item in templateDialogList" :key="item.name">
          <el-popover placement="bottom" trigger="click" :width="800">
            <template #reference>
              <el-button style="position: absolute; right: 8px; top: 8px" circle size="mini"
                type="primary">
                <span style="font-size:16px" class="el-icon-zoom-in"></span>
              </el-button>
            </template>
            <img style="max-width: 760px" :src="item.img" alt="" />
          </el-popover>
          <div @click="() => handleTemplateDialogItemClick(item, handleTableCreate)">
            <img class="template-dialog-item-img" :src="item.img" alt="" />
            <div class="template-dialog-item-title">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog append-to-body width="30%" :visible.sync="htmlDialogVisible" title="通过HTML模版"
      @close="onHtmlDialogOk">
      <el-input v-model="htmlDialogValue" type="textarea" :rows="10" style="height: 600px" />
    </el-dialog>
  </div>
</template>

<script setup >
import { onMounted, ref, computed, nextTick, watch, defineExpose } from '@vue/composition-api';
import { useTableStorage, useLoadingTry, useTablePreview, useTableTemplate } from './hook';
import templateJson from './template';
import { divStrToDom, parseJsonObj } from '@/utils/design';
import { message } from '@/utils/message';
import HConf from './HConf.vue';
import Htable from './Htable.vue';
import Space from './Space/index.vue';

const props = defineProps({
  dataForm: {
    type: Object,
    default: null,
  },
  treeData: {
    type: Array,
    default: () => []
  },
  pageParam: {
    type: Object,
    default: null,
  }
});

// 提取常量

const CLASS_NAME = 'b7eaf4d16b8c4c6da9e2b3c5f7d4a9e1';
const SIZE_MAP = {
  '297_210': 'A4横向',
  '210_297': 'A4纵向',
  '210_148': 'A5横向',
  '148_210': 'A5纵向',
};

// 提取默认表单值
const DEFAULT_FORM = {
  size: '297_210',
  row: 8,
  col: 8,
  paddingY: 80,
  paddingX: 120,
};

// 提取样式常量
const STYLE_CONSTANTS = {
  BINDING_LINE: {
    padding: '172px 47px 154px 56px',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-between',
    fontSize: '28px',
    color: '#000000',
    fontWeight: 400,
  },
  TABLE_CONTAINER: {
    padding: '50px',
  },
  PREVIEW_CANVAS: {
    backgroundColor: '#ffffff',
    allowTaint: true,
    useCORS: true,
    scale: 2,
  },
};

// 提取消息常量
const MESSAGE_CONSTANTS = {
  success: '表格尺寸正常',
  error: '表格尺寸超出虚线范围',
};
const systemData = [
  {
    fullName: "打印人员",
    id: "systemPrinter"
  },
  {
    fullName: "打印时间",
    id: "systemPrintTime"
  },
  {
    fullName: "审批内容",
    id: "systemApprovalContent"
  },
  {
    fullName: "图片",
    id: "img"
  },
  {
    fullName: "二维码",
    id: "qrCode"
  },
  {
    fullName: "条形码",
    id: "barCode"
  }
]

const defaultProps = {
  children: "children",
  label: "fullName"
}
// 组件状态
const iClass = CLASS_NAME;
const minConfig = ref(false);
const content = ref();
const htable = ref();
const hconf = ref();
const size = ref('');
const htmlDialogVisible = ref(false);
const htmlDialogValue = ref('');
const templateDialogList = ref(templateJson);
const newData = computed(() => {
  return props.treeData
});
const selection = computed(() => (htable.value?.selection || []));

const newSysData = computed(() => {
  let data = systemData;
  if (props.dataForm?.type == 2) {
    data = systemData.filter(o => o.id !== "systemApprovalContent");
  }
  return data;
})

// 使用 hooks
const { saveToStorage, getFromStorage, loadFromStorage } = useTableStorage();
const { showHtmlPreview, showPrintPreview, showHtmlDialog, showConfigDialog } = useTablePreview();

const {
  newTableForm,
  newTableDialogVisible,
  templateDialogVisible,
  handleNewTable,
  handleNewTableDialogOk,
  handleTemplateDialogOk,
  handleTemplateDialogItemClick,
} = useTableTemplate(DEFAULT_FORM);

// 计算属性
const sizeObj = computed(() => {
  const [width, height] = size.value.split('_');
  return { width: Number(width), height: Number(height) };
});

// HTML 生成方法
const getHtml = async (showDialog = false) => {
  const cr = await checkSize();
  if (!cr) {
    return;
  }
  const root = document.createElement('div');
  root.innerHTML = content.value?.innerHTML || '';
  const arr = root.getElementsByClassName(CLASS_NAME);
  arr[0].innerHTML = htable.value?.getHtml() || '';
  arr[0].setAttribute('config', JSON.stringify(htable.value?.getConf()));

  const html = root.innerHTML;
  if (showDialog) {
    await showHtmlDialog(html);
  }
  return html;
};

// 表格创建回调
const handleTableCreate = config => {
  size.value = config.size;

  nextTick(() => {
    htable.value?.setConf(config);
  });
};

const undo = () => {
  if (htable.value?.getHot()) {
    const undoRedoPlugin = htable.value?.getHot().getPlugin('UndoRedo');
    if (undoRedoPlugin.isUndoAvailable()) {
      // 执行回撤操作
      undoRedoPlugin.undo();
    }
  }
}

const redo = () => {
  if (htable.value?.getHot()) {
    const undoRedoPlugin = htable.value?.getHot().getPlugin('UndoRedo');
    if (undoRedoPlugin.isRedoAvailable()) {
      // 执行回撤操作
      undoRedoPlugin.redo();
    }
  }
}
// 工具方法
const checkSize = () => {
  htable.value?.getHot().deselectCell();
  return new Promise((resolve) => {
    nextTick(() => {
      const result = htable.value?.validateTableSize();
      if (result != null) {
        message[result ? 'success' : 'error'](result ? MESSAGE_CONSTANTS.success : MESSAGE_CONSTANTS.error);
      }
      resolve(result);
    });
  });
};

const closeAllPopovers = () => {
  const popovers = document.querySelectorAll('.ant-popover');
  popovers.forEach(popover => {
    if (popover instanceof HTMLElement) {
      popover.style.display = 'none';
    }
  });
};

// HTML 模板处理
const onHtmlDialogOk = () => {
  htmlDialogVisible.value = false;
  setConfWithHtml(htmlDialogValue.value);
  htmlDialogValue.value = '';
};

const setConfWithHtml = (html = '') => {
  const root = divStrToDom(html);
  const arr = root.getElementsByClassName(CLASS_NAME);
  const config = arr[0].getAttribute('config');
  if (config) {
    const tableConfig = parseJsonObj(config);
    if (tableConfig) {
      size.value = tableConfig.size;
      if (tableConfig?.paddingY) {
        newTableForm.value.paddingY = tableConfig.paddingY;
        newTableForm.value.paddingX = tableConfig.paddingX;
      }
      if (tableConfig?.size) {
        newTableForm.value.size = tableConfig.size;
      }
      nextTick(() => {
        htable.value?.setConf(tableConfig);
      });
    }
  }
}

// 监听器
watch(templateDialogVisible, v => {
  if (!v) {
    closeAllPopovers();
  }
});

// 加载效果包装
const [_getHtml, _getHtmlLoading] = useLoadingTry(getHtml);
const [_tempSave, _tempSaveLoading] = useLoadingTry(async () => {
  await saveToStorage(htable.value?.getConf());
});
const [_htmlPreview, _htmlPreviewLoading] = useLoadingTry(async () => {
  const html = await getHtml();
  await showHtmlPreview(html);
});
const [_printPreview, _printPreviewLoading] = useLoadingTry(async () => {
  const html = await getHtml();
  await showPrintPreview(html, STYLE_CONSTANTS.PREVIEW_CANVAS);
});

const handleNodeClick = (item, node) => {
  if (item.children != null && item.children.length > 0) return;
  console.log(item)
  if (selection.value.length > 0) {
    const hot = htable.value?.getHot();
    const currentValue = hot.getDataAtCell(selection.value[0], selection.value[1]);
    const newValue = `{{${item.id}}}`;
    const finalValue = currentValue ? `${currentValue}${newValue}` : newValue;
    hot.setDataAtCell(selection.value[0], selection.value[1], finalValue);
  }
}

// 重命名方法以避免命名冲突
const openConfigDialog = () => {
  showConfigDialog(htable.value);
};
defineExpose({
  getHtml: _getHtml
})
// 生命周期
onMounted(() => {
  // const config = loadFromStorage();

  // if (config) {
  //   size.value = config?.size;
  //   nextTick(() => {
  //     htable.value?.setConf(config);
  //   });
  // }

  const storageConf = getFromStorage();
  if (props.dataForm?.pageParam) {
    const pageParm = parseJsonObj(props.dataForm.pageParam);
    if (pageParm.width) {
      size.value = `${pageParm.width}_${pageParm.height}`;
    }
    if (storageConf) {
      message.warning('当前页面还没有保存，记得保存');
      handleTableCreate(storageConf)
    } else {
      if (props.dataForm?.printTemplate) {
        setConfWithHtml(props.dataForm.printTemplate)
      }
    }

  }
});

</script>
<style>
.my-message-box {
  width: 800px;
}
.content-right .el-card__body {
  padding: 8px;
}
.left-scrollbar .el-scrollbar__wrap {
  overflow-x: auto;
}
</style>
<style lang="scss" scoped>
.page-index {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  background-color: #fff;
  .new-create-contain {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .top {
    width: 100%;
    height: 50px;
    border-bottom: 1px solid #e6ebf5;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 0 10px;
    margin-bottom: 8px;
  }
  .content {
    width: 100%;
    height: calc(100% - 50px);
    position: relative;
    .content-center {
      overflow: auto;
      height: 100%;
      background: var(--secondary-bg-color);
      // padding: 20px;
      transition: all 0.3s;
      padding-top: 10px;
      > div {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
    }
    .content-right-warp {
      position: absolute;
      right: 8px;
      top: 0;
      overflow: auto;
      z-index: 100000;
      height: 100%;
      .mini-config-btn {
        padding: 10px;
        background: #00b4c4;
        color: #fff;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
      }
    }
    .content-right {
      width: 350px;
      height: 100%;
    }
  }
}
.tool-bar-item {
  display: flex;
  align-items: center;
}
.tool-bar-item + .tool-bar-item {
  margin-left: 10px;
}

.template-dialog-list {
  padding: 10px 0;
  .template-dialog-item {
    position: relative;
    display: inline-block;
    width: 32%;
    margin-bottom: 5px;
    margin-right: 5px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    border-radius: 4px;
    .template-dialog-item-img {
      width: 100%;
      height: 100px;
      object-fit: cover;
    }
    .template-dialog-item-title {
      text-align: center;
      height: 30px;
      line-height: 30px;
      background-color: #ddd;
    }
  }
}
.system-view-nav {
  width: 300px;
  position: absolute;
  background: #fff;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
  left: 0;
  top: 0;
  bottom: 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding-right: 8px;
  z-index: 100000;

  .JNPF-common-title {
    padding: 0 10px;
    margin-bottom: 10px;
    height: 39px;
    &.sys-title {
      margin-top: 30px;
    }
    h2 {
      font-size: 14px;
      line-height: 39px;
      color: #043254;
      font-weight: bold;
    }
  }
}
</style>
