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

export const divStrToDom = (str) => {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.children[0];
};

export const domToStr = (dom) => {
  const div = document.createElement('div');
  div.appendChild(dom);
  return div.innerHTML;
};

export const create2DArray = (rows, cols, defaultValue = '') => {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => defaultValue));
};

export const getSelectedCellCount = hot => {
  const selected = hot.getSelected();
  if (!selected) {
    return 0;
  }

  let totalCells = 0;
  const mergedCellsPlugin = hot.getPlugin('mergeCells');
  const countedCells = new Set(); // 用于记录已经计算过的单元格

  // 遍历所有选择范围
  selected.forEach(range => {
    const [startRow, startCol, endRow, endCol] = range;
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    const minCol = Math.min(startCol, endCol);
    const maxCol = Math.max(startCol, endCol);

    // 遍历选中区域的每个单元格
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellKey = `${row}-${col}`;

        // 如果这个单元格已经计算过，跳过
        if (countedCells.has(cellKey)) {
          continue;
        }

        // 获取当前单元格的合并信息
        const mergeParent = mergedCellsPlugin.mergedCellsCollection.get(row, col);

        if (mergeParent) {
          // 如果是合并单元格的一部分
          const parentKey = `${mergeParent.row}-${mergeParent.col}`;
          if (!countedCells.has(parentKey)) {
            // 只有当合并单元格的主单元格没有被计算过时才计数
            totalCells++;
            // 标记这个合并单元格范围内的所有单元格为已计算
            for (let r = mergeParent.row; r < mergeParent.row + mergeParent.rowspan; r++) {
              for (let c = mergeParent.col; c < mergeParent.col + mergeParent.colspan; c++) {
                countedCells.add(`${r}-${c}`);
              }
            }
          }
        } else {
          // 如果是普通单元格
          totalCells++;
          countedCells.add(cellKey);
        }
      }
    }
  });

  return totalCells;
};

export function hasScrollbar(div) {
  // 假设你已经有一个指向 div 的引用
  const hasHorizontalScrollbar = div.scrollWidth > div.clientWidth;
  const hasVerticalScrollbar = div.scrollHeight > div.clientHeight;
  return {
    horizontal: hasHorizontalScrollbar,
    vertical: hasVerticalScrollbar,
  };
}

export const getMergedCellMaster = (hot, row, col) => {
  const mergeCellsPlugin = hot.getPlugin('mergeCells');
  const mergedCells = mergeCellsPlugin.mergedCellsCollection.mergedCells;
  // 遍历所有合并区域
  for (let i = 0; i < mergedCells.length; i++) {
    const merged = mergedCells[i];
    // 判断当前单元格是否在此合并区域内
    if (
      row >= merged.row && row < merged.row + merged.rowspan &&
      col >= merged.col && col < merged.col + merged.colspan
    ) {
      // 返回该区域的主单元格坐标（左上角的那个）
      return { row: merged.row, col: merged.col };
    }
  }
  // 如果没有找到合并区域，则直接返回当前坐标
  return { row, col };
}
