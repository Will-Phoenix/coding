import get from "lodash.get";
import kebabCase from "lodash.kebabcase";

export const xssFilter = (val) => {
  if (typeof val === 'string' && val.length > 0) {
    return val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/ /g, "&nbsp;")
      .replace(/\'/g, "&#39;")
      .replace(/\"/g, "&quot;")
      .replace(/\n/g, "<br/>");
  }
  return val
}

export const genPrintHtml = (innerHTML) => {
  return `<html lang="zh-Hans">
<head>
  <meta charset=utf-8 />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <style>
    html,body, * {
      padding: 0;
      margin: 0;
    }
  </style>
</head>
  <body>${innerHTML}</body>
</html>`
}

/**
 * 处理替换模板占位
 * @param html 模板html
 * @param params 要注入的参数,可以不传,则所有占位的值视为空
 */
export const handleReplace = (html, params = {}) => {
  let ret = '';
  let part = html;
  let finished = false;
  while (!finished) {
    // console.log('part---start')
    // console.log(part)
    // console.log('part---end')
    const pattern = /\{([\u4e00-\u9fa5\w\.\[\]]+)\}/gim.exec(part)
    if (!pattern) {
      ret = ret + part;
      finished = true;
      break;
    }
    // 带 {}
    const holder = pattern[0]
    // 不带 {}
    const key = pattern[1]
    const index = pattern.index
    // https://www.lodashjs.com/docs/lodash.get
    const v = get(params, key)
    const replacedVal = v == null ? '' : v;
    ret = ret + part.substring(0, index) + (key && key.indexOf("SYS_NO_XSS_") == 0 ? replacedVal : xssFilter(replacedVal));
    part = part.substring(index + holder.length)
  }
  return ret;
}

export const objToInlineStyle = (obj = {}) => {
  const arr = [];
  Object.keys(obj).forEach(k => {
    arr.push(`${kebabCase(k)}:${obj[k]}`)
  })
  return arr.join(";")
}

/**
 * 解析json字符串, 本方法永不报错 ,如果解析失败,则不抛异常并返回默认值
 * @param input 入参任意, 可以容错
 * @param defaultVal 默认空对象
 */
export const parseJsonObj = (input, defaultVal = {}) => {
  let ret = defaultVal;
  if (input && typeof input === 'string') {
    try {
      ret = JSON.parse(input) || defaultVal;
    } catch (error) {
      console.warn('parseJsonObj error ==>', { input, error });
    }
  }
  return ret || defaultVal;
};

export const preprocessTemplate = (template) => {
  return template.replace(/(?<!\{)\{([^{}]+)\}(?!\})/g, '{{$1}}').replace(/config="[^"]*"/, '');
}
