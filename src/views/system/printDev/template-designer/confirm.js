// confirm.js
import { MessageBox } from 'element-ui';

/**
 * 封装一个确认弹窗，类似于 Ant Design Vue 的 Modal.confirm
 * @param {Object} options 配置项：
 *   - title: 弹窗标题，默认 '提示'
 *   - content: 弹窗内容
 *   - okText: 确认按钮文字，默认 '确定'
 *   - cancelText: 取消按钮文字，默认 '取消'
 *   - onOk: 点击确认后的回调函数
 *   - onCancel: 点击取消后的回调函数
 *   - ...rest: 其他 MessageBox.confirm 的配置项
 */
export function confirm(options) {
  const {
    title = '提示',
    content = '',
    okText = '确定',
    cancelText = '取消',
    onOk,
    onCancel,
    ...rest
  } = options;

  return MessageBox.confirm(content, title, {
    confirmButtonText: okText,
    cancelButtonText: cancelText,
    ...rest,
  })
    .then(() => {
      // 点击确认时触发
      if (typeof onOk === 'function') {
        onOk();
      }
    })
    .catch(() => {
      // 点击取消或关闭时触发
      if (typeof onCancel === 'function') {
        onCancel();
      }
    });
}
