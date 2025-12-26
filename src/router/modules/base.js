// 基础路由
const baseRouter = [
  {
    path: '/home',
    component: (resolve) => require(['@/views/dashboard'], resolve),
    name: 'home',
    meta: {
      title: 'home',
      icon: 'icon-ym icon-ym-nav-home',
      affix: true,
      nopad: false,
      zhTitle: '首页'
    }
  },
  {
    path: '/dashboard',
    component: (resolve) => require(['@/views/basic/dashboard'], resolve),
    name: 'dashboard',
    meta: {
      title: 'dashboard',
      icon: 'icon-ym icon-ym-generator-kanban',
      affix: false,
      zhTitle: '门户展示'
    }
  },
  {
    path: '/messageRecord',
    component: (resolve) => require(['@/views/basic/messageRecord'], resolve),
    name: 'messageRecord',
    meta: {
      title: 'messageRecord',
      affix: false,
      zhTitle: '站内消息',
      icon: 'icon-ym icon-ym-sysNotice',
    }
  },
  {
    path: '/previewModel',
    component: (resolve) => require(['@/views/basic/dynamicModel'], resolve),
    name: 'previewModel',
    meta: {
      title: 'previewModel',
      affix: false,
      zhTitle: '功能预览',
      icon: 'icon-ym icon-ym-btn-preview',
    }
  },
  {
    path: '/profile',
    component: (resolve) => require(['@/views/basic/profile'], resolve),
    name: 'profile',
    meta: {
      title: 'profile',
      affix: false,
      zhTitle: '个人信息',
      icon: 'icon-ym icon-ym-user',
    }
  },
  {
    path: '/emailDetail',
    component: (resolve) => require(['@/views/extend/email/DetailPage'], resolve),
    name: 'emailDetail',
    meta: {
      title: 'emailDetail',
      affix: false,
      zhTitle: '查看邮件',
      icon: 'icon-ym icon-ym-emailExample',
    }
  },
  {
    path: '/workFlowDetail',
    component: (resolve) => require(['@/views/workFlow/workFlowDetail'], resolve),
    name: 'workFlowDetail',
    meta: {
      title: 'workFlowDetail',
      affix: false,
      zhTitle: '流程详情',
      icon: 'icon-ym icon-ym-workFlow',
    }
  },
  {
    path: '/externalLink',
    component: (resolve) => require(['@/views/basic/externalLink'], resolve),
    name: 'externalLink',
    meta: {
      title: 'externalLink',
      affix: false,
      zhTitle: '链接',
      icon: 'icon-ym icon-ym-generator-link',
    }
  },
  {
    path: '/reimbursementTemplateDetail',
    component: (resolve) => require(['@/views/reimbursement/templateDetail/index'], resolve),
    name: 'reimbursementTemplateDetail',
    meta: {
      title: 'reimbursementTemplateDetail',
      affix: false,
      zhTitle: '报销模板详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/electronicCertificatesTemplateDetail',
    component: (resolve) => require(['@/views/electronicCertificatesManage/detail'], resolve),
    name: 'electronicCertificatesTemplateDetail',
    meta: {
      title: 'electronicCertificatesTemplateDetail',
      affix: false,
      zhTitle: '电子凭证管理详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/expenseAccountDetail',
    component: (resolve) => require(['@/views/expenseAccountManage/detail'], resolve),
    name: 'expenseAccountDetail',
    meta: {
      title: 'expenseAccountDetail',
      affix: false,
      zhTitle: '票据详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/expenseAccountPrintDetail',
    component: (resolve) => require(['@/views/expenseAccountPrintManage/detail'], resolve),
    name: 'expenseAccountPrintDetail',
    meta: {
      title: 'expenseAccountPrintDetail',
      affix: false,
      zhTitle: '票据打印',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/approvalOrderPrintDetail',
    component: (resolve) => require(['@/views/appDashbordHome/approvalDetail.vue'], resolve),
    name: 'approvalOrderPrintDetail',
    meta: {
      title: 'approvalOrderPrintDetail',
      affix: false,
      zhTitle: '审批单详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/budgetItemsDetail',
    component: (resolve) => require(['@/views/budgetItems/detail/index'], resolve),
    name: 'budgetItemsDetail',
    meta: {
      title: 'budgetItemsDetail',
      affix: false,
      zhTitle: '预算项目管理详情',
      icon: 'icon-ym icon-ym-workFlow',
    }
  },
  {
    path: '/bankBillMatchingResult',
    component: (resolve) => require(['@/views/expenseAccountManage/bankBillMatchingResult'], resolve),
    name: 'bankBillMatchingResult',
    meta: {
      title: 'bankBillMatchingResult',
      affix: false,
      zhTitle: '银行回执单匹配详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/budgetDetail',
    component: (resolve) => require(['@/views/budgetManagement/detail'], resolve),
    name: 'budgetDetail',
    meta: {
      title: 'budgetDetail',
      affix: false,
      zhTitle: '预算详情',
      icon: 'icon-ym icon-ym-workFlow',
    }
  },
  {
    path: '/budgetMonthDetail',
    component: (resolve) => require(['@/views/budgetManagement/monthDetail'], resolve),
    name: 'budgetMonthDetail',
    meta: {
      title: 'budgetMonthDetail',
      affix: false,
      zhTitle: '月度预算详情',
      icon: 'icon-ym icon-ym-workFlow',
    }
  },
  {
    path: '/test',
    component: (resolve) => require(['@/views/workFlow/formDesign/AppForm.vue'], resolve),
    name: 'test',
    meta: {
      title: 'test',
      affix: false,
      zhTitle: 'test',
      icon: 'icon-ym icon-ym-workFlow',
    }
  },
  {
    path: '/applyTypeListManage',
    component: (resolve) => require(['@/views/approvalTypeManage/applyTypeListManage.vue'], resolve),
    name: 'applyTypeListManage',
    meta: {
      title: 'applyTypeListManage',
      affix: false,
      zhTitle: '审批管理',
      icon: 'icon-ym icon-ym-workFlow',
    }
  },
  {
    path: '/exsTypeListManage',
    component: (resolve) => require(['@/views/approvalTypeManage/exsTypeListManage.vue'], resolve),
    name: 'exsTypeListManage',
    meta: {
      title: 'exsTypeListManage',
      affix: false,
      zhTitle: '报销管理',
      icon: 'icon-ym icon-ym-workFlow',
    }
  },
  {
    path: '/approvalOrderDetail',
    component: (resolve) => require(['@/views/approvalOrderManage/applyOrderDetail.vue'], resolve),
    name: 'approvalOrderDetail',
    meta: {
      title: 'approvalOrderDetail',
      affix: false,
      zhTitle: '审批单详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/exsOrderDetail',
    component: (resolve) => require(['@/views/approvalOrderManage/exsOrderDetail.vue'], resolve),
    name: 'exsOrderDetail',
    meta: {
      title: 'exsOrderDetail',
      affix: false,
      zhTitle: '审批单详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/userNoticeIndex',
    component: (resolve) => require(['@/views/userNotice/index.vue'], resolve),
    name: 'userNoticeIndex',
    meta: {
      title: 'userNoticeIndex',
      affix: false,
      zhTitle: '通知公告',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/userNoticeDetail',
    component: (resolve) => require(['@/views/userNotice/detail.vue'], resolve),
    name: 'userNoticeDetail',
    meta: {
      title: 'userNoticeDetail',
      affix: false,
      zhTitle: '通知详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/reimburseDetail',
    component: (resolve) => require(['@/views/appDashbordHome/reimburseDetail.vue'], resolve),
    name: 'reimburseDetail',
    meta: {
      title: 'reimburseDetail',
      affix: false,
      zhTitle: '预览报销单',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/approvalDetail',
    component: (resolve) => require(['@/views/appDashbordHome/approvalDetail.vue'], resolve),
    name: 'approvalDetail',
    meta: {
      title: 'approvalDetail',
      affix: false,
      zhTitle: '打印审批单',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/personalBillManage',
    component: (resolve) => require(['@/views/pasteTicketCenter/billManage/personalIndex.vue'], resolve),
    name: 'PersonalBillManage',
    meta: {
      title: 'personalBillManage',
      affix: false,
      zhTitle: '发票夹',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/personalUserFolderManage',
    component: (resolve) => require(['@/views/userFolderManage/personalIndex.vue'], resolve),
    name: 'PersonalUserFolderManage',
    meta: {
      title: 'personalUserFolderManage',
      affix: false,
      zhTitle: '资料夹',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/approvalCenter',
    component: (resolve) => require(['@/views/approvalCenter/index.vue'], resolve),
    children: [
      {
        path: 'list',
        component: (resolve) => require(['@/views/approvalCenter/list.vue'], resolve),
        name: 'approvalCenterList',
        meta: {
          title: 'approvalCenterList',
          affix: false,
          zhTitle: '审批中心',
          icon: 'icon-ym icon-ym-codeGeneration',
        }
      },
      {
        path: '/approvalList',
        component: (resolve) => require(['@/views/approvalCenter/approvalList.vue'], resolve),
        name: 'approvalCenterApprovalList',
        meta: {
          title: 'approvalCenterApprovalList',
          affix: false,
          zhTitle: '审批列表',
          icon: 'icon-ym icon-ym-codeGeneration',
        }
      },
      {
        path: '/applyList',
        component: (resolve) => require(['@/views/approvalCenter/applyList.vue'], resolve),
        name: 'approvalCenterApplyList',
        meta: {
          title: 'approvalCenterApplyList',
          affix: false,
          zhTitle: '报销列表',
          icon: 'icon-ym icon-ym-codeGeneration',
        }
      },
      {
        path: '/approval',
        component: (resolve) => require(['@/views/approvalCenter/approval.vue'], resolve),
        name: 'approvalCenterApproval',
        meta: {
          title: 'approvalCenterApproval',
          affix: false,
          zhTitle: '审批提交',
          icon: 'icon-ym icon-ym-codeGeneration',
        }
      },
      {
        path: '/apply',
        component: (resolve) => require(['@/views/approvalCenter/apply.vue'], resolve),
        name: 'approvalCenterApply',
        meta: {
          title: 'approvalCenterApply',
          affix: false,
          zhTitle: '报销提交',
          icon: 'icon-ym icon-ym-codeGeneration',
        }
      },
      {
        path: 'detail',
        component: (resolve) => require(['@/views/approvalCenter/detail.vue'], resolve),
        name: 'approvalCenterDetail',
        meta: {
          title: 'approvalCenterDetail',
          affix: false,
          zhTitle: '申请详情',
          icon: 'icon-ym icon-ym-codeGeneration',
        }
      }
    ]
  },
  {
    path: '/aiInvoice',
    component: (resolve) => require(['@/views/aiInvoice/index.vue'], resolve),
    name: 'AIInvoice',
    meta: {
      title: 'aiInvoice',
      affix: false,
      zhTitle: '便捷报销',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/previewHelperFile',
    component: (resolve) => require(['@/views/preview/previewHelperFile.vue'], resolve),
    name: 'previewHelperFile',
    meta: {
      title: 'previewHelperFile',
      affix: false,
      zhTitle: '操作手册',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/enterpriseManageDetail',
    component: (resolve) => require(['@/views/creditEnhancementByFinancing/enterpriseManage/detail.vue'], resolve),
    name: 'enterpriseManageDetail',
    meta: {
      title: 'enterpriseManageDetail',
      affix: false,
      zhTitle: '企业详情',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  },
  {
    path: '/payInfoDetail',
    component: (resolve) => require(['@/views/payInfoManagement/detail.vue'], resolve),
    name: 'payInfoDetail',
    meta: {
      title: 'payInfoDetail',
      affix: false,
      zhTitle: '支付信息',
      icon: 'icon-ym icon-ym-codeGeneration',
    }
  }
]
export default baseRouter

