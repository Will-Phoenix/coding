import axios from "axios";
/**
 * base64 字符串 转 Uint8Array 对象
 * @param base64
 * @returns {Uint8Array}
 */
export const base64ToUint8Array = (base64 = "") => {
  let bstr = atob(base64),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr;
};

/**
 * Base64 ==> Blob .  注意: 入参不是base64DataURL , 不以 "data:" 开头
 * @param base64
 * @param options ,需要指定type. (endings取默认值即可). 参考 https://segmentfault.com/a/1190000011563430
 * @returns {Blob}
 */
export const base64ToBlob = (base64 = "", options = { type: "application/octet-stream" }) => {
  return new Blob([base64ToUint8Array(base64)], options);
};

/**
 * Base64URL ==> Blob
 * @param dataurl 字符串,格式类似于 "data:image/x-icon;base64,AAABAAEAgIAAA略略"
 * @returns {Blob}
 */
export const dataURLToBlob = dataurl => {
  let arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1];
  return base64ToBlob(arr[1], { type: mime });
};

/**
 * Base64URL ==> File
 * @param base64
 * @param filename 输出文件名
 * @param options
 * @returns {File}
 */
export const base64ToFile = (base64 = "", filename = "", options = { type: "application/octet-stream" }) => {
  return new File([base64ToUint8Array(base64)], filename, options);
};

/**
 * Base64URL ==> File
 * @param dataurl 字符串,格式类似于 "data:image/x-icon;base64,AAABAAEAgIAAA略略"
 * @param filename 指定文件名
 * @returns {File}
 */
export const dataURLToFile = (dataurl, filename = "") => {
  let arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1];
  return base64ToFile(arr[1], filename, { type: mime });
};

/**
 * Blob ==> File
 * @param blob Blob的实例对象
 * @param filename 文件名
 * @param contentType mime值,取值参考 https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 * @returns {File}
 */
export const blobToFile = (blob, filename = "", contentType = blob.type || "application/octet-stream") => {
  return new File([blob], filename, { type: contentType, lastModified: Date.now() });
};

/**
 * File ==> Blob
 * @param file file的实例对象
 * @returns {Blob}
 */
export const fileToBlob = file => {
  return new Blob([file], { type: file.type });
};

/**
 * Blob ==> Base64URL. 如果不传callback,则返回promise实例, 如果传了callback,则无返回值,文件内容在callback回调方法的入参内.
 * @param blob Bolb的实例对象
 * @param callback 转换完成之后的回调方法,参数是Base64DataURL文件内容(字符串), 以 "data:" 开头
 */
export const blobToDataURL = (blob, callback) => {
  let ret;
  let reader = new FileReader();
  if (typeof callback === "function") {
    reader.onload = function(e) {
      callback(e.target.result);
    };
  } else {
    ret = new Promise((resolve, reject) => {
      reader.onload = e => {
        resolve(e.target.result);
      };
      reader.onerror = e => {
        reject(e);
      };
    });
  }
  reader.readAsDataURL(blob);
  return ret;
};

/**
 * 将图片URL转为 Base64图片(png格式)内容,只针对静态图片,不支持gif, 因为 图片需要加载出来之后才能感知图片尺寸, 所以本方法是一个异步方法,返回Promise&lt;Base64字符串&gt;
 * @param src 网络图片URL地址,由于canvas限制,不允许跨域,取值示例  https://image.smxzhcs.cn/smxsc/M00/12/38/CqDIk18qIh6AMIihAAAwE-RLkL4186.jpg
 * @param type 生成的图片格式, 默认值 "image/png"
 * @returns {Promise<String>}
 */
export const imgURLToDataURL = (src, type = "image/png") => {
  return new Promise((resolve, reject) => {
    let doc = document;
    let img = doc.createElement("img");
    img.src = src;
    img.onload = () => {
      let canvas = doc.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      let dataURL = canvas.toDataURL(type);
      resolve(dataURL);
    };
    img.onerror = e => {
      reject(e);
    };
  });
};

// 上传文件, 参数2是file对象
const uploadFile = (url, file, token) => {
  let form = new FormData();
  form.append("file", file);
  return axios({
    url: url,
    data: form,
    headers: {
      // "Content-Type": "application/json;charset=UTF-8",
      "Authorization": token,
    },
    method: "post"
  });
}
// 上传文件, 参数2是base64字符串
export function uploadBase64Data(url, base64data, fileName, token) {
  let fileObj = dataURLToFile(base64data, fileName); // base64数据转为文件对象
  return uploadFile(url, fileObj, token)
}
// 上传文件, 参数2是blob对象
export function uploadBlobData(url, blob, fileName, token) {
  let fileObj = blobToFile(blob, fileName);
  return uploadFile(url, fileObj, token)
}

export async function downloadFileByUrl(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}
