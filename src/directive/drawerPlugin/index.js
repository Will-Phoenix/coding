// src/plugins/drawerPlugin.js

import Vue from 'vue';
import { Drawer } from 'element-ui';
import store from '@/store'

const DrawerConstructor = Vue.extend(Drawer);

const HOST = window.location.host.includes('smxzhcs') ? window.location.origin : process.env.VUE_APP_CONFIG_HOST;
// const HOST = "https://presaas.smxzhcs.cn";
// const HOST = "http://192.168.8.47:10086";

const DrawerService = {
  open(url = '', options = {}) {
    // 创建一个 iframe 元素
    const iframe = document.createElement('iframe');
    if (!url.includes('http')) {
      url = HOST + url;
    }

    if (url.includes('?')) {
      url = url + '&token=' + store.getters.token + '&roleCodes=' + store.getters.userInfo.roleCodes;
    } else {
      url = url + '?token=' + store.getters.token + '&roleCodes=' + store.getters.userInfo.roleCodes;
    }

    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '98%';
    iframe.style.border = 'none';

    const instance = new DrawerConstructor({
      el: document.createElement('div'),
      propsData: {
        withHeader: true,
        direction: 'rtl',
        size: 680,
        visible: true,
        destroyOnClose: true,
        closeOnPressEscape: false,
        wrapperClosable: false,
        ...options
      }
    });

    // 将 iframe 添加到抽屉中
    setTimeout(() => {
      instance.$el.querySelector('.el-drawer__body').appendChild(iframe);
    }, 0);

    document.body.appendChild(instance.$el);

    // 关闭抽屉时移除 iframe 并销毁实例
    instance.$on('close', () => {
      options.onClose && options.onClose();
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      document.body.removeChild(instance.$el);
      instance.$destroy();
    });

    return instance;
  }
};

export default {
  install(Vue) {
    Vue.prototype.$openDraw = DrawerService.open;
  }
};
