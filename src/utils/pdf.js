import axios from "axios";

/**
 * 将多张图片合并为一个pdf文件, 返回 blob 对象
 * @param imgDataList 数组, 数组内每个元素是 base64dataURL 或者 图片URL
 * @param pagePadding pdf的页面内边距, 单位:毫米, 默认: 10 , 可以为0但是不建议(因为不好看)
 * @param type 输出的pdf内容的格式，默认为blob
 * @return Promise<blob> blob对象
 */
export const imgToPdf = async(imgDataList = [], pagePadding = 10, type = 'blob') => {
  const { jsPDF } = await loadJsPdf();
  // API http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html
  // eslint-disable-next-line new-cap
  let pdf;
  let contentHeight = 0;
  let contentWidth = 0;
  for (let i = 0; i < imgDataList.length; i++) {
    const d = imgDataList[i];
    const img = await loadImg(d);
    if (img.width > img.height) {
      contentWidth = 297 - pagePadding * 2;
      contentHeight = 210 - pagePadding * 2;
    } else {
      contentWidth = 210 - pagePadding * 2;
      contentHeight = 297 - pagePadding * 2;
    }
    // A4 是 210*297 mm
    const { width, height } = calcMaxSize(contentWidth, contentHeight, img.width, img.height)
    let orientation = width > height ? "l" : "p";
    if (i > 0) {
      pdf.addPage("a4", orientation);
    } else {
      pdf = new jsPDF({
        orientation: orientation, // Orientation of the first page. Possible values are "portrait" or "landscape" (or shortcuts "p" or "l").
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true, // Only put fonts into the PDF, which were used.
        rotation: 0, // 图片旋转角度
        compress: true // Compress the generated PDF.
      })
    }
    const x = (contentWidth - width) / 2 + pagePadding;
    const y = (contentHeight - height) / 2 + pagePadding
    // API http://raw.githack.com/MrRio/jsPDF/master/docs/module-addImage.html#~addImage
    // addImage(imageData, format, x, y, width, height, alias, compression, rotation)
    // compression of the generated JPEG, can have the values 'NONE', 'FAST', 'MEDIUM' and 'SLOW' , 实测示例: NONE 11.5MB, FAST 583KB , MEDIUM 608KB, SLOW 565KB, 如果不传默认值应该是 SLOW
    pdf.addImage(d, 'jpeg', x, y, width, height, undefined, 'FAST')
  }
  // API http://raw.githack.com/MrRio/jsPDF/master/docs/jsPDF.html#output
  return pdf.output(type)
}

// 读取pdf文件，转成可以合并的pdf格式
export const readPdfFile = async(pdfPath) => {
  return await axios.get(pdfPath, { responseType: 'arraybuffer' }).then(async res => {
    const { PDFDocument } = await loadPdfLib();
    return await PDFDocument.load(res.data, { ignoreEncryption: true });
  });
};

// 调用imgToPdf，且把返回的pdf转成，可以合并的格式
export const imgToMergedFormatPdf = async(imgDataList = []) => {
  const { PDFDocument } = await loadPdfLib();
  const jsPdfBytes = await imgToPdf(imgDataList, 10, 'arraybuffer');
  return await PDFDocument.load(jsPdfBytes, { ignoreEncryption: true });
};

/**
 * 将多个pdf文件，合并为一个pdf，并返回其createObjectURL
 * @param pdfList pdf数组, 数组内每个元素是 PDFDocument.load后的pdf
 * @param directPreview，默认为true，则打开新页面预览合并的pdf文件
 * @return Promise<string> createObjectURL对象
 */
export const mergePdf = async(pdfList, directPreview = true) => {
  const { PDFDocument } = await loadPdfLib();
  // 创建一个新的PDF文档
  const mergedPdf = await PDFDocument.create();
  // 遍历每个pdf文件，进行合并
  for (const v of pdfList) {
    const copiedPages = await mergedPdf.copyPages(
      v,
      v.getPageIndices()
    );
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  // 输出合并后的pdf文件和其url
  const uint8Array = await mergedPdf.save();
  let mergeBuffer = Buffer.from(uint8Array);
  const url = window.URL.createObjectURL(new Blob([mergeBuffer], { type: 'application/pdf;charset=utf-8' }));
  console.log("pdf合并完成");
  console.log("新合并的pdf的url--", url);
  console.log("新合并的pdf--", mergedPdf);
  if (directPreview) {
    // 预览合并后的pdf文件
    let a = document.createElement("a");
    a.target = "_blank";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  return url;
};

// 直接打印pdf文件，且支持回调函数
export const printPdf = async(pdfList, callback) => {
  const url = await mergePdf(pdfList, false);
  // 在页面中嵌入 iframe 预览
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  // 初始化两个定时器
  let checkOpenPrint;
  let checkPrintClose;
  iframe.onload = () => {
    /* afterprint事情在iframe中无法通过iframe.contentWindow.print()触发，但却可以通过window.print()触发，不知原因，只能废弃此方案
    iframe.contentWindow.addEventListener('afterprint', () => {
      console.log('打印弹窗已关闭');
    }); */
    // 主动调用 iframe 内的打印
    iframe.contentWindow.print();
    // 由于不同电脑可能调起打印窗口的时间不同，因此定时器去检测何时打开了打印窗口，为防止异常，设置最大检测次数
    let currentCheckCount = 0;
    checkOpenPrint = setInterval(() => {
      currentCheckCount++;
      // 检查最大次数
      if (currentCheckCount >= 100) {
        clearInterval(checkOpenPrint);
        console.error('打印窗口打开检测超时');
        callback(new Error('打印窗口未打开'));
        return;
      }
      // 打印窗口打开
      if (!document.hasFocus()) {
        clearInterval(checkOpenPrint);
        // 降级方案：通过定时器检查焦点变化，来监测打印窗口是否关闭
        checkPrintClose = setInterval(() => {
          if (document.hasFocus()) {
            clearInterval(checkPrintClose);
            document.body.removeChild(iframe);
            console.log('打印对话框已关闭');
            callback();
          }
        }, 1500);
      }
    }, 100);
  };
  // 返回定时器引用以便外部清除
  return {
    cancel: () => {
      clearInterval(checkOpenPrint);
      clearInterval(checkPrintClose);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      callback(new Error('打印已取消'));
    }
  };
};

const loadJsPdf = () => {
  return new Promise((resolve) => {
    window.requirejs(['jspdf'], function(j) {
      resolve(j)
    });
  })
}

const loadImg = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src
    img.onload = () => {
      resolve(img);
    };
  })
}

export const addWatermark = async(pdfDoc, text) => {
  console.log('addWatermark');
  const { PDFDocument, rgb } = await loadPdfLib();
  const fontkit = await loadFontKitLib();
  const fontUrl = "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/2284ceb4-211d-4059-bc68-8dba63fc173c.ttf";
  const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
  pdfDoc.registerFontkit(fontkit);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(fontBytes);
  for (let i = 0; i < pages.length; i++) {
    const pageEle = pages[i];
    const { width, height } = pageEle.getSize();
    pageEle.drawText(text, {
      x: width - 80,
      y: height - 20,
      size: 12,
      color: rgb(0.8, 0.8, 0.8),
      font: font,
    })
  }
  const pdfBytes = await pdfDoc.save();
  return await PDFDocument.load(pdfBytes, { ignoreEncryption: true })
}

const loadPdfLib = () => {
  return new Promise((resolve) => {
    window.requirejs(['pdflib'], function(j) {
      resolve(j)
    });
  })
};

const loadFontKitLib = () => {
  return new Promise((resolve) => {
    window.requirejs(['fontkit'], function(j) {
      resolve(j)
    });
  })
};

/**
 * 保持纵横比, 根据真实尺寸计算容器允许的最大范围内的尺寸
 * @param containerWidth 容器宽
 * @param containerHeight 容器高
 * @param realWidth 真实宽
 * @param realHeight 真实高
 * @return {{width, height}} 宽和高
 */
const calcMaxSize = (containerWidth, containerHeight, realWidth, realHeight) => {
  let width = containerWidth, height = containerHeight;
  if (realWidth > 0 && realHeight > 0) {
    const ratio1 = containerWidth / containerHeight;
    const ratio2 = realWidth / realHeight;
    if (ratio1 > ratio2) {
      // 容器更宽更低, 以容器高度为准
      width = containerHeight * ratio2
    } else {
      height = containerWidth / ratio2
    }
  }
  return { width, height }
}
