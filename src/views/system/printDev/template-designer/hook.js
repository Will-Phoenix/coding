import { ref, watch } from '@vue/composition-api';
import { message } from '@/utils/message';
import { confirm } from './confirm';
import { createVNode } from 'vue';
import { Textarea } from 'element-ui';
import html2canvas from 'html2canvas';
import { divStrToDom, parseJsonObj, create2DArray } from '@/utils/design';

export const STORAGE_KEY = 'template-print-key';
/**
 * 将入参异步方法用以 try-catch包裹,保证不抛出异常，在loading==true时, 不会重复执行;
 * 返回[包裹后的异步方法, 以及一个loading的ref]
 */
export const useLoadingTry = func => {
  const loading = ref(false);
  const exec = async (...args) => {
    if (loading.value) {
      return;
    }
    loading.value = true;
    try {
      return await func(...args);
    } catch (e) {
      console.error(e);
    } finally {
      loading.value = false;
    }
  };
  return [exec, loading];
};

export const useTableStorage = (storageKey = STORAGE_KEY) => {
  const saveToStorage = async config => {
    const str = JSON.stringify(config);
    sessionStorage.setItem(storageKey, str);
    message.success(`已暂存至session, 刷新网页后可检验效果, 关闭当前标签页后失效`);
  };

  const getFromStorage = () => {
    const str = sessionStorage.getItem(storageKey);
    if (!str) return null;
    return parseJsonObj(str);
  };

  const removeFromStorage = () => {
    sessionStorage.removeItem(storageKey);
  };

  const loadFromStorage = () => {
    const str = sessionStorage.getItem(storageKey);
    if (!str) return null;
    return parseJsonObj(str);
  };

  return {
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    getFromStorage
  };
};

export const useTablePreview = () => {
  const showHtmlPreview = async (html) => {
    const newWindow = window.open(undefined, '_blank');
    if (newWindow) {
      newWindow.document.body.style.background = '#eeeeee';
      newWindow.document.body.innerHTML = html;
    }
  };

  const showPrintPreview = async (html, config) => {
    const div = divStrToDom(html);
    const temp = document.createElement('div');
    temp.style.position = 'fixed';
    temp.style.left = '99999px';
    temp.style.top = '99999px';
    temp.appendChild(div);

    document.body.append(temp);
    const canvas = await html2canvas(div, config);
    temp.remove();

    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => b && resolve(b), 'image/png', 1);
    });

    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  const showHtmlDialog = async (html) => {
    confirm({
      title: 'HTML预览',
      customClass: 'my-message-box',
      dangerouslyUseHTMLString: true,
      content: `<Textarea style="width: 100%; height: 600px; background: #fff; padding: 20px;">${html}</Textarea>`,
      okText: '复制',
      cancelText: '取消',
      async onOk () {
        await navigator.clipboard.writeText(html);
        message.success('复制成功');
      },
    });
  };

  const showConfigDialog = async (table) => {
    const config = table?.getConf();
    if (!config) return;

    const configStr = JSON.stringify(config);
    confirm({
      customClass: 'my-message-box',
      title: '配置数据',
      dangerouslyUseHTMLString: true,
      content: `<Textarea style="width: 100%; height: 600px; background: #fff; padding: 20px;">${configStr}</Textarea>`,
      okText: '复制',
      cancelText: '取消',
      async onOk () {
        await navigator.clipboard.writeText(configStr);
        message.success('复制成功');
      },
    });
  };

  return {
    showHtmlPreview,
    showPrintPreview,
    showHtmlDialog,
    showConfigDialog,
  };
};

export const useTableTemplate = (defaultForm) => {
  const newTableForm = ref({ ...defaultForm });
  const newTableDialogVisible = ref(false);
  const templateDialogVisible = ref(false);

  watch(() => newTableForm.value.size, (val) => {
    if (!['210_297', '148_210'].includes(val)) {
      newTableForm.value.paddingY = undefined;
      newTableForm.value.paddingX = undefined;
    }
  })
  const handleNewTable = () => {
    newTableDialogVisible.value = true;
  };

  const handleNewTableDialogOk = (callback) => {
    newTableDialogVisible.value = false;
    const { size: newSize, row, col, paddingY = 80, paddingX = 120 } = newTableForm.value;
    const tableData = create2DArray(row, col);
    callback({ tableData, size: newSize, row, col, paddingY, paddingX });
  };

  const handleTemplateDialogOk = () => {
    templateDialogVisible.value = false;
  };

  const handleTemplateDialogItemClick = (item, callback) => {
    const { config } = item;
    callback(config);
    templateDialogVisible.value = false;
  };

  return {
    newTableForm,
    newTableDialogVisible,
    templateDialogVisible,
    handleNewTable,
    handleNewTableDialogOk,
    handleTemplateDialogOk,
    handleTemplateDialogItemClick,
  };
};
