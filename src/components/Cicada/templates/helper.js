function xssFilter(val) {
  if (typeof val === 'string' && val.length > 0) {
    return val
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/ /g, "&nbsp;")
      .replace(/\'/g, "&#39;")
      .replace(/\"/g, "&quot;")
      .replace(/\n/g, "<br/>")
  }
  return val
}

/**
 * 处理替换模板占位
 * @param html 模板html
 * @param params 要注入的参数,可以不传,则所有占位的值视为空
 */
function handleReplace(html, params = {}) {
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
    const v = window._.get(params, key)
    const replacedVal = v == null ? '' : v;
    ret = ret + part.substring(0, index) + (key && key.indexOf("SYS_NO_XSS_") == 0 ? replacedVal : xssFilter(replacedVal));
    part = part.substring(index + holder.length)
  }
  return ret;
}

/**
 * 替换模拟数据
 * @param domId
 * @param printData
 */
function preview(domId, _printData = {}) {
  const dom = document.getElementById(domId)
  const out = handleReplace(dom.innerHTML, _printData)
  dom.innerHTML = out;
}

/**
 * 生成图片并保存
 * @param domId
 */
function toImage(domId) {
  const dom = document.getElementById(domId)
  return window.html2canvas(dom, {
    backgroundColor: "#ffffff",
    allowTaint: true,
    useCORS: true,
    scale: 2.5
  }).then(async(canvas) => {
    console.log('toImage', { canvas })
    const blob = await new Promise(resolve => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png', 1)
    })
    const url = window.URL.createObjectURL(blob);
    let newTab = window.open(url);
  })
}

