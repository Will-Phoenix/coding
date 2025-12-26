const scoreExplain = () => {
  return {
    "企业主特质": ["企业主综合状况较差（5～6分）", "企业主综合状况尚可（7～8分）", "企业主综合状况较好（9分）", "企业主综合状况优秀（10分）"],
    "企业规模": ["企业规模小（5～6分）", "企业规模较小（7～8分）", "企业规模一般（9分）", "企业规模大（10分）"],
    "盈利能力": ["盈利能力不足（5～6分）", "盈利能力较强（7～8分）", "盈利能力强（9分）", "盈利能力很强（10分）"],
    "偿贷能力": ["债务偿还能力不足（5～6分）", "债务偿还能力较强（7～8分）", "债务偿还能力强（9分）", "债务偿还能力很强（10分）"],
    "经营能力": ["机构发展经营处于较差状态（5～6分）", "机构发展经营处于尚可状态（7～8分）", "机构发展经营处于尚佳状态（9分）", "机构发展经营处于优良状态（10分）"],
    "稳定性": ["不确定因素对经营、发展的影响程度大（5～6分）", "不确定因素对经营、发展的影响程度一般（7～8分）", "不确定因素对经营、发展的影响程度较小（9分）", "不确定因素对经营、发展的影响程度很小（10分）"]
  };
};

export const entData = () => [
  {
    entName: "河南丰锂新能源科技股份有限公司",
    tax: "91411281MA45MT2N9Q",
    name: "董晓芳",
    type: "接口拉取",
    interfaceStatus: "接口正常",
    taxType: "小规模纳税人",
    entReport: "已生成",
    reportTime: "2025年4月9日",
    industry: "制造业 > 电气机械和器材制造业 > 电池制造 (C384)",
    entRating: "B+",
    entScore: "7.32",
    entScale: "企业规模小",
    stabilityDesc: "不确定因素对经营、发展的影响程度一般",
    entTraitDesc: "企业主综合状况尚可",
    profitabilityDesc: "盈利能力较强",
    solvencyDesc: "债务偿还能力较强",
    capabilityDesc: "机构发展经营处于较差状态",
    scoreDesc: "该企业信用评级为B+级，表明其信用程度较好，经营状况符合行业良性循环特征",
    pdfUrl: "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/a0d72ab9-dc25-439b-9aad-64fe0c3527b1.pdf",
    scoreList: [
      {
        dimension: "企业主特质",
        score: "8.42",
        explain: scoreExplain()["企业主特质"]
      },
      {
        dimension: "企业规模",
        score: "5.6",
        explain: scoreExplain()["企业规模"]
      },
      {
        dimension: "盈利能力",
        score: "7.62",
        explain: scoreExplain()["盈利能力"]
      },
      {
        dimension: "偿贷能力",
        score: "7.98",
        explain: scoreExplain()["偿贷能力"]
      },
      {
        dimension: "经营能力",
        score: "6.62",
        explain: scoreExplain()["经营能力"]
      },
      {
        dimension: "稳定性",
        score: "7.68",
        explain: scoreExplain()["稳定性"]
      },
    ]
  },
  {
    entName: "河南昌盛铜业有限公司",
    tax: "91411282MA460FMT8L",
    name: "徐奔驰",
    type: "接口拉取",
    interfaceStatus: "接口正常",
    taxType: "小规模纳税人",
    entReport: "已生成",
    reportTime: "2025年4月8日",
    industry: "制造业 > 有色金属冶炼和压延加工业 >有色金属压延加工 (C325)",
    entRating: "B+",
    entScore: "7.26",
    entScale: "企业规模较小",
    stabilityDesc: "不确定因素对经营、发展的影响程度一般",
    entTraitDesc: "企业主综合状况尚可",
    profitabilityDesc: "盈利能力较强",
    solvencyDesc: "债务偿还能力较强",
    capabilityDesc: "机构发展经营处于尚可状态",
    scoreDesc: "该企业信用评级为B+级，表明其信用程度较好，经营状况符合行业良性循环特征",
    pdfUrl: "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/78111f92-ab0a-48d2-9c7c-f3bac681d469.pdf",
    scoreList: [
      {
        dimension: "企业主特质",
        score: "8.12",
        explain: scoreExplain()["企业主特质"]
      },
      {
        dimension: "企业规模",
        score: "7",
        explain: scoreExplain()["企业规模"]
      },
      {
        dimension: "盈利能力",
        score: "7.32",
        explain: scoreExplain()["盈利能力"]
      },
      {
        dimension: "偿贷能力",
        score: "6.68",
        explain: scoreExplain()["偿贷能力"]
      },
      {
        dimension: "经营能力",
        score: "7.16",
        explain: scoreExplain()["经营能力"]
      },
      {
        dimension: "稳定性",
        score: "7.28",
        explain: scoreExplain()["稳定性"]
      },
    ]
  },
  {
    entName: "河南甘棠软件科技有限公司",
    tax: "91410100MA9H1CA94B",
    name: "何国栋",
    type: "接口拉取",
    interfaceStatus: "接口正常",
    taxType: "小规模纳税人",
    entReport: "已生成",
    reportTime: "2025年4月2日",
    industry: "信息传输、软件和信息技术服务业 > 软件和信息技术服务业 > 软件开发 (I651)",
    entRating: "A",
    entScore: 8.646,
    entScale: "企业规模较小",
    stabilityDesc: "不确定因素对经营、发展的影响程度较小",
    entTraitDesc: "企业主综合状况较好",
    profitabilityDesc: "盈利能力强",
    solvencyDesc: "债务偿还能力强",
    capabilityDesc: "机构发展经营处于尚可状态",
    scoreDesc: "该企业信用评级为A级，表明其信用程度良好，债务偿还能力稳定，经营状况符合行业良性循环特征",
    pdfUrl: "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/a756c4e3-ee95-460d-97a8-f6726c85888c.pdf",
    scoreList: [
      {
        dimension: "企业主特质",
        score: 8.92,
        explain: scoreExplain()["企业主特质"]
      },
      {
        dimension: "企业规模",
        score: 7,
        explain: scoreExplain()["企业规模"]
      },
      {
        dimension: "盈利能力",
        score: 8.12,
        explain: scoreExplain()["盈利能力"]
      },
      {
        dimension: "偿贷能力",
        score: 8.51,
        explain: scoreExplain()["偿贷能力"]
      },
      {
        dimension: "经营能力",
        score: 8.66,
        explain: scoreExplain()["经营能力"]
      },
      {
        dimension: "稳定性",
        score: 9.02,
        explain: scoreExplain()["稳定性"]
      },
    ]
  },
  {
    entName: "三门峡崤云视联科技有限公司",
    tax: "91411200MA45H95T5D",
    name: "张樊迪",
    type: "接口拉取",
    interfaceStatus: "接口正常",
    taxType: "小规模纳税人",
    entReport: "已生成",
    reportTime: "2025年4月2日",
    industry: "信息传输、软件和信息技术服务业 > 互联网和相关服务 > 互联网信息服务 (I642)",
    entRating: "B",
    entScore: "7.712",
    entScale: "企业规模较小",
    stabilityDesc: "不确定因素对经营、发展的影响程度一般",
    entTraitDesc: "企业主综合状况较好",
    profitabilityDesc: "盈利能力较强",
    solvencyDesc: "债务偿还能力较强",
    capabilityDesc: "机构发展经营处于尚可状态",
    scoreDesc: "该企业信用评级为B级，表明其信用程度较好，经营状况符合行业良性循环特征",
    pdfUrl: "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/ed099f8f-1090-40d2-9090-859b1c911be7.pdf",
    scoreList: [
      {
        dimension: "企业主特质",
        score: "8.92",
        explain: scoreExplain()["企业主特质"]
      },
      {
        dimension: "企业规模",
        score: "7",
        explain: scoreExplain()["企业规模"]
      },
      {
        dimension: "盈利能力",
        score: "7.12",
        explain: scoreExplain()["盈利能力"]
      },
      {
        dimension: "偿贷能力",
        score: "6.98",
        explain: scoreExplain()["偿贷能力"]
      },
      {
        dimension: "经营能力",
        score: "7.66",
        explain: scoreExplain()["经营能力"]
      },
      {
        dimension: "稳定性",
        score: "7.88",
        explain: scoreExplain()["稳定性"]
      },
    ]
  },
  {
    entName: "三门峡崤云信息服务股份有限公司",
    tax: "91411200MA442EYM3D",
    name: "党创业",
    type: "接口拉取",
    interfaceStatus: "接口正常",
    taxType: "小规模纳税人",
    entReport: "已生成",
    reportTime: "2025年3月17日",
    industry: "科学研究和技术服务业 > 科技推广和应用服务业 > 创业空间服务 (M754)",
    entRating: "A+",
    entScore: "8.488",
    entScale: "企业规模较小",
    stabilityDesc: "不确定因素对经营、发展的影响程度较小",
    entTraitDesc: "企业主综合状况较好",
    profitabilityDesc: "盈利能力较强",
    solvencyDesc: "债务偿还能力强",
    capabilityDesc: "机构发展经营处于尚可状态",
    scoreDesc: "该企业信用评级为A+级，表明其信用程度良好，债务偿还能力稳定，经营状况符合行业良性循环特征",
    pdfUrl: "https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/06c1c99b-52da-4b63-a8e5-cf44f3216c1c.pdf",
    scoreList: [
      {
        dimension: "企业主特质",
        score: "9.12",
        explain: scoreExplain()["企业主特质"]
      },
      {
        dimension: "企业规模",
        score: "8",
        explain: scoreExplain()["企业规模"]
      },
      {
        dimension: "盈利能力",
        score: "7.46",
        explain: scoreExplain()["盈利能力"]
      },
      {
        dimension: "偿贷能力",
        score: "8.98",
        explain: scoreExplain()["偿贷能力"]
      },
      {
        dimension: "经营能力",
        score: "7.66",
        explain: scoreExplain()["经营能力"]
      },
      {
        dimension: "稳定性",
        score: "9.22",
        explain: scoreExplain()["稳定性"]
      },
    ]
  }
];
