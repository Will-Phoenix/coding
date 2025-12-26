<template>
  <div class="flow-task-node-list">
    <el-timeline class="custom-timeline">
      <el-timeline-item v-for="(item, index) in nodeList" :key="item.id" :style="{ 'padding-bottom': item.approvalList || item.childStyle ? '1px' : '12px' }">
        <template #dot>
          <img :class="item.hasParent ? 'child-dot-img' : 'dot-img'" :src="`${isSelect ? IMG_NEED_SELECT : item.icon}`" alt="">
        </template>
        <div class="flow-task-node-list-item">
          <div style="width: 100%">
            <div class="flow-task-item-black">
              <span v-if="isSelect && get(item, 'nodePropertyJson.properties.assigneeType') === '7' && currNodeIndex < index && checkCandidateRequired(item)" style="color: red;margin-right: 2px;">*</span>
              <template v-if="item.nodeType === 'endround'">
                审批结束
              </template>
              <template v-else-if="item.operatorUser">
                <span style="font-weight: bold;margin-right: 20px">{{ item.nodeName }}</span>
              </template>
              <template v-else-if="get(item, 'nodePropertyJson.properties.assigneeType') === '7'">
                <span style="font-weight: bold;">{{ item.nodeName }}</span>
              </template>
              <template v-else>
                <!-- 这里可以是空的或者任何你想显示的内容 -->
              </template>
            </div>
            <div>
              <div class="flow-task-item-black" v-if="item.operatorUser && (!isSelect || index <= currNodeIndex || !(item.nodePropertyJson && item.nodePropertyJson.properties && item.nodePropertyJson.properties.assigneeType === '7'))">
                {{ item.operatorUser }}
              </div>
              <div class="low-task-item-blue" v-if="isSelect">
                {{ candidateList[item.nodeCode] ? candidateList[item.nodeCode][0].fullName : '' }}
              </div>
              <div class="flow-task-item-gray" v-else>{{ item.nodeType === 'start' ? '发起申请' : item.typeText }}</div>
            </div>
            <!--            <template v-if="item.approvalList">-->
            <!--              <div v-for="childItem in item.approvalList" :key="childItem.id" class="child-list">-->
            <!--                <div class="flow-task-node-child-list-item">-->
            <!--                  <div class="flow-task-item-gray">{{ childItem.operatorUser.split("/")[0] }} {{ childItem.typeText }}</div>-->
            <!--                  <div class="flow-task-item-gray self-flex">{{ childItem.operatorDate }}</div>-->
            <!--                </div>-->
            <!--                <div class="flow-task-item-gray">{{ childItem.handleOpinion }}</div>-->
            <!--              </div>-->
            <!--            </template>-->
            <div v-if="item.handleOpinion" class="flow-task-item-gray">{{ item.handleOpinion }}</div>
            <div v-if="!isSelect && showFastAudit && item.nodeType == 'approver' && currNodeIndex === index">
              <el-dropdown @visible-change="(v)=>{onApproval(v,item)}" @command="(v)=>{onFastAudit(v.split('/')[1])}" trigger="click" placement="bottom-start">
                <el-button type="primary" size="small">审批通过</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item class="custom-dropdown-item" v-for="userItem in userList" :command="userItem" :key="userItem">
                    {{ userItem }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-dropdown @visible-change="(v)=>{onReject(v,item)}" @command="(v)=>{onFastReject(v.split('/')[1])}" trigger="click" placement="bottom-start">
                <el-button style="margin-left: 10px;" type="danger" size="small">审批驳回</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item class="custom-dropdown-item" v-for="userItem in userList" :command="userItem" :key="userItem">
                    {{ userItem }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <div v-if="isSelect && currNodeIndex < index">
            <div v-if="get(item, 'nodePropertyJson.properties.assigneeType') === '7' && checkCandidate(item)" @click="goSelectCandidate(item)" class="cursor-pointer flow-task-item-gray flow-task-item-select-candidate" :class="{'flow-task-item-blue': candidateList[item.nodeCode] }" slot="reference"><i class="el-icon-circle-plus-outline"></i> {{ candidateList[item.nodeCode] ? "切换审批人" : "选择审批人" }}</div>
          </div>
          <div v-else class="flow-task-item-gray self-flex">{{ item.operatorDate }}</div>
        </div>
      </el-timeline-item>
      <el-timeline-item v-if="circulateUserName">
        <template #dot>
          <img class="dot-img" src="https://image.smxzhcs.cn/smxsc/M00/2C/61/CqDIk2T_st2ADYQTAAAEEBUxiks574.png" alt="">
        </template>
        <div class="flow-task-node-list-item">
          <div>
            <div class="flow-task-item-black">抄送 {{ circulateUserName }} <span class="flow-task-item-blue">{{ length }}人</span> </div>
          </div>
        </div>
      </el-timeline-item>

    </el-timeline>
    <UserCandidateSelectDialog ref="userCandidateSelectRef" :multiple="true" :multiple-limit="100" @confirm="onApprovalConfirm" />
  </div>
</template>
<script>
import { computed, defineComponent, ref, watch } from '@vue/composition-api';
import dayjs from 'dayjs';
import _ from 'lodash';
import UserCandidateSelectDialog from "@/components/Dialog/UserCandidateSelectDialog.vue";

// 图片常量
const IMG_DONE = 'https://image.smxzhcs.cn/smxsc/M00/2C/5A/CqDIlGT9Ey-AFZaJAAAENBX6TYc406.png';
const IMG_LOADING = 'https://image.smxzhcs.cn/smxsc/M00/2C/5F/CqDIlGT_st2AZtcQAAADnsRDnz0012.png';
const IMG_DOT = 'https://image.smxzhcs.cn/smxsc/M00/2C/61/CqDIk2T_st2AedrXAAACzL4hMfg649.png';
const IMG_REJECT = 'https://image.smxzhcs.cn/smxsc/M00/2C/94/CqDIk2UhBheAFGbiAAAErZEauNg546.png';
const IMG_NEED_SELECT = 'https://image.smxzhcs.cn/smxsc/M00/2F/E4/CqDIk2crLMKAQAx5AAADzFcHQdg419.png';
const CHILD_IMG_DONE = 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/8ae981f8-970e-4886-98a4-afcee055effa.png';
const CHILD_IMG_DONE2 = 'https://minio.smxzhcs.cn/smxol-pre/TuChuang/public/9c176155-567b-4cee-ab89-e26bd5df2e0e.png';

// 映射表
const typeImageMap = {
  0: IMG_DONE,
  1: IMG_LOADING,
};

const typeTextMap = {
  0: '已审批',
  1: '审批中',
};

const typeThemeMap = {
  0: '',
  1: 'warn',
};

const handleStatusMap = {
  0: '审核驳回',
  1: '审核通过',
  2: '发起申请',
  3: '撤回',
  4: '终止',
  5: '指派',
  6: '加签',
  7: '转审',
  8: '变更',
  9: '复活',
};

const handleStatusImageMap = {
  0: IMG_REJECT,
  1: IMG_DONE,
};

const childHandleStatusImageMap = {
  0: IMG_REJECT,
  1: CHILD_IMG_DONE,
};

const handleStatusThemeMap = {
  0: 'error',
};

export default defineComponent({
  name: 'FlowTaskNodeList',
  components: { UserCandidateSelectDialog },
  props: {
    flowTaskNodeList: {
      type: Array,
      required: true
    },
    flowTaskOperatorRecordList: {
      type: Array,
      required: false,
      default: () => []
    },
    circulateUserName: {
      type: String,
      required: false,
      default: ''
    },
    isSelect: {
      type: Boolean,
      required: false,
      default: false
    },
    // 是否是审核人
    isAudit: {
      type: Boolean,
      required: false,
      default: false
    },
    onFastAudit: {
      type: Function,
      required: false
    },
    onFastReject: {
      type: Function,
      required: false
    },
    onCandidateListChange: {
      type: Function,
      required: false,
      default: () => {}
    }
  },
  setup(props, { root }) {
    console.log("调用流程组件，传入的流程操作记录：", props.flowTaskOperatorRecordList);
    console.log("调用流程组件，传入的完整审批流程：", props.flowTaskNodeList);
    const currNodeIndex = ref(0);
    const showFastAudit = window.location.origin.includes('localhost') || window.location.origin.includes('presaas.smxzhcs.cn');
    const userList = ref([]);
    const type = ref('');
    const approvalOpen = ref(false);
    const node = ref(null);
    const userCandidateSelectRef = ref(null);
    const candidateList = ref({});
    const approvalUserList = ref([]);
    const checkedUserName = ref([]);
    const nextNodeCode = ref([]); // 发起人需要校验后续所有的发起人必填节点
    const length = computed(() => {
      if (props.circulateUserName) {
        return props.circulateUserName.split(',').length;
      }
      return 0;
    });
    const nodeList = computed(() => {
      let ret = [];
      // 先把操作历史怼上去
      if (props.flowTaskOperatorRecordList) {
        ret = props.flowTaskOperatorRecordList.map(v => ({
          id: v.id,
          nodeCode: v.nodeCode,
          nodeType: '',
          theme: handleStatusThemeMap[v.handleStatus],
          icon: handleStatusImageMap[v.handleStatus] || IMG_DONE,
          operatorUser: v.userName,
          operatorDate: dayjs(v.handleTime).format('YYYY-MM-DD HH:mm'),
          typeText: handleStatusMap[v.handleStatus],
          handleOpinion: v.handleOpinion,
          nodeName: v.nodeName,
        })).filter(vv => vv.operatorUser);
      }
      // 对于存在会签节点的，操作历史中存在相同nodeCode的多条记录，需整合到一个列表中去特殊展示
      const newRet = [];
      ret.forEach((v, i) => {
        const count = ret.filter(vv => vv.nodeCode === v.nodeCode).length;
        const info = props.flowTaskNodeList.filter(vv => vv.nodeCode === v.nodeCode)[0];
        // 已撤回和驳回的单子flowTaskNodeList.length === 0，不处理会签
        if (props.flowTaskNodeList.length === 0 || (count === 1 && info?.completion)) {
          // 普通节点，只需一个人审批通过即可
          newRet.push({ ...v, completion: info?.completion });
        } else {
          // 判断去重
          if (newRet.filter(vv => vv.nodeCode === v.nodeCode).length === 0) {
            // 会签节点，需多人审批通过
            const list1 = ret.slice(i, i + count);
            // 由于newRet中铺平了，所以hasParent用来标记会签下的二级记录，childStyle用来标记二级记录的样式
            const list = list1.map((vv, ii) => ({
              ...vv,
              icon: info?.completion ? CHILD_IMG_DONE2 : childHandleStatusImageMap[v.handleStatus] || CHILD_IMG_DONE,
              hasParent: true,
              childStyle: ii !== list1.length - 1,
              completion: info?.completion,
            }));
            // 构造一个外层对象，塞入nodeCode对应的flowTaskNodeList里的属性，并新增approvalList，用来存放同nodeCode下的记录
            newRet.push({
              id: info.id,
              completion: info?.completion,
              nodeCode: info.nodeCode,
              nodeType: info.nodeType,
              theme: typeThemeMap[info.type],
              icon: typeImageMap[info.type] || IMG_DOT,
              operatorUser: info.userName,
              operatorDate: '',
              typeText: typeTextMap[info.type],
              handleOpinion: '',
              nodeName: info.nodeName,
              nodePropertyJson: typeof info.nodePropertyJson === 'string' ? JSON.parse(info.nodePropertyJson) : info.nodePropertyJson,
              approvalList: list
            });
            newRet.push(...list);
          }
        }
      });
      // 再进行节点对齐
      const lastNodeCode = _.get(newRet, `[${newRet.length - 1}].nodeCode`, null);
      let sliceIndex = 0;
      if (lastNodeCode) {
        const ii = props.flowTaskNodeList.findIndex(v => v.nodeCode === lastNodeCode);
        if (ii >= 0) {
          sliceIndex = ii + 1;
        }
      }
      console.log("要从flowTaskNodeList复制的位置：", sliceIndex);
      console.log('flowTaskNodeList', props.flowTaskNodeList);
      const arr = props.flowTaskNodeList.slice(sliceIndex).filter(v => {
        const nodePropertyJson = typeof v.nodePropertyJson === 'string' ? JSON.parse(v.nodePropertyJson) : v.nodePropertyJson;
        return !(!v.userName && !['4', '7'].includes(nodePropertyJson?.properties?.assigneeType)) || v.nodeCode === 'end';
      }).map(v => ({
        id: v.id,
        nodeCode: v.nodeCode,
        nodeType: v.nodeType,
        theme: typeThemeMap[v.type],
        icon: typeImageMap[v.type] || IMG_DOT,
        operatorUser: v.userName,
        operatorUserIds: v.userId,
        operatorDate: '',
        typeText: typeTextMap[v.type],
        handleOpinion: '',
        nodeName: v.nodeName,
        nodePropertyJson: typeof v.nodePropertyJson === 'string' ? JSON.parse(v.nodePropertyJson) : v.nodePropertyJson,
      }));
      if (arr.length > 0) {
        newRet.push(...arr);
      }
      // 获取当前节点index
      // 记录最后一条未完成，说明是会签，审批中的节点是最近一个审批中的：需要用newRet的长度 减去 和最后一条记录nodeCode一样的条数；但若最后一条记录已完成，那审批节点应该是下面新塞入的，也就是newRet.length - 1 + 1
      // 但有特殊情况：若是表单还未提交，没有记录，那么newRet为空数组
      let currNode = props.flowTaskNodeList.find(v => v.type === "1");
      let nodeIndex = 0;
      if (currNode) {
        let newIndex = newRet.findIndex(v => v.nodeCode === currNode.nodeCode);
        if (newIndex > -1) {
          nodeIndex = newIndex;
        }
      }
      // if (newRet.length > 0) {
      //   nodeIndex = newRet[newRet.length - 1]?.completion ? newRet.length - 1 + 1 : newRet.length - 1 - newRet.filter(vv => vv.nodeCode === lastNodeCode && vv.nodeType !== "approver").length;
      // }
      currNodeIndex.value = nodeIndex;

      if (props.isSelect) {
        // 设置下个节点NodeCode
        const index = props.flowTaskNodeList.findIndex(v => v.type === "1");
        const nextIndex = index + 1;

        let tempCandidateList = {};
        let nextList = [];
        let auditEnd = false;
        for (let i = nextIndex; i < props.flowTaskNodeList.length; i++) {
          const tNode = props.flowTaskNodeList[i];
          const nodePropertyJson = typeof tNode.nodePropertyJson === 'string' ? JSON.parse(tNode.nodePropertyJson) : tNode.nodePropertyJson;
          if (!(!tNode.userName && !['4', '7'].includes(nodePropertyJson?.properties?.assigneeType))) {
            // 审批人
            if (props.isAudit) {
              if (!auditEnd) {
                if (nodePropertyJson?.properties?.assigneeType === '7') {
                  const r = checkNextNode(nodePropertyJson);
                  if (r) {
                    nextList.push(tNode.nodeCode);
                    auditEnd = true;
                  } else {
                    // 查找到一个指定候选人的节点，则停止找
                    if (tNode.userId) {
                      auditEnd = true;
                    }
                  }
                } else {
                  auditEnd = true;
                }
              }
            } else {
              // 发起人
              if (nodePropertyJson?.properties?.assigneeType === '7') {
                const r = checkNextNode(nodePropertyJson);
                if (r) {
                  nextList.push(tNode.nodeCode)
                }
              }
            }
            // 获取候选人已选数据
            if (nodePropertyJson?.properties?.assigneeType === '7') {
              if (tNode.userName) {
                const arr = tNode.userId?.split(',')?.map(v => {
                  return {
                    value: v,
                    id: v,
                    label: tNode.userName,
                    fullName: tNode.userName,
                  };
                });
                if (arr) {
                  const user = { [tNode.nodeCode]: arr };
                  tempCandidateList = { ...tempCandidateList, ...user };
                }
              }
            }
          }
        }
        nextNodeCode.value = [];
        if (nextList.length > 0) {
          nextNodeCode.value.push(...nextList);
        }
        candidateList.value = tempCandidateList;
      }
      console.log('nodeList', newRet);
      return newRet;
    });

    // 根据角色判断节点候选人是否必选
    const checkNextNode = (nodePropertyJson) => {
      // 先判断是否必选, 默认必选
      let required = true;
      if (nodePropertyJson?.properties?.candidateConfig) {
        required = nodePropertyJson.properties.candidateConfig.required;
      }
      if (required) {
        // 判断角色是否符合,默认发起人
        let role = 0;
        if (nodePropertyJson?.properties?.candidateConfig) {
          role = nodePropertyJson.properties.candidateConfig.role;
        }
        const checkRole = role === 2 || (role === 1 && props.isAudit) || (role === 0 && !props.isAudit);
        if (checkRole) {
          return true;
        }
      }
      return false;
    }

    const goSelectCandidate = (_node) => {
      node.value = _node;
      let ids = '';
      if (candidateList.value[_node.nodeCode]) {
        ids = candidateList.value[_node.nodeCode].map(v => v.id || v.value).join(',');
      }
      userCandidateSelectRef.value.init(_node, ids);
    }

    // 根据角色判断是否显示选择审批人/切换审批人
    const checkCandidate = (_node) => {
      let show = true;
      // 选择候选人区分权限
      // 仅发起人
      if (!_node.nodePropertyJson?.properties?.candidateConfig || !_node.nodePropertyJson?.properties?.candidateConfig?.role) {
        show = !props.isAudit;
      } else if (_node.nodePropertyJson.properties.candidateConfig?.role === 1) {
        show = props.isAudit;
      }
      return show;
    }

    // 根据角色判断是否显示必选
    const checkCandidateRequired = (_node) => {
      return !!nextNodeCode.value.find(v => v == _node.nodeCode) && checkCandidate(_node);
    }

    const onReject = (v, _node) => {
      if (v) {
        if (_node.operatorUser) {
          let list = _node.operatorUser.split(',');
          if (list.length > 1) {
            userList.value = list;
            type.value = 'reject';
          } else {
            onConfirm(list[0], 'reject');
          }
        } else {
          userList.value = [];
        }
      }
    };

    const onApproval = (v, _node) => {
      if (v) {
        if (_node.operatorUser) {
          let list = _node.operatorUser.split(',');
          if (list.length > 1) {
            userList.value = list;
            type.value = 'pass';
          } else {
            onConfirm(list[0], 'pass');
          }
        }
      } else {
        userList.value = [];
      }
    };

    const onConfirm = (user, operateType) => {
      if (user) {
        let account = user.split('/')[1];
        if (operateType == 'pass') {
          props.onFastAudit && props.onFastAudit(account);
        } else {
          props.onFastReject && props.onFastReject(account, nodeList.value[0].nodeCode);
        }
      }
    };

    const onApprovalConfirm = (ids, list) => {
      const labelFullName = list.map(v => v.fullName).join(',');
      const arr = list.map(v => {
        return {
          ...v,
          fullName: labelFullName,
        };
      });
      const user = { [node.value.nodeCode]: arr };
      candidateList.value = { ...candidateList.value, ...user };
      node.value = null;
    };
    const onCandidateChange = () => {
      const localCandidateList = {};
      console.log('onCandidateChange', candidateList.value);
      for (const key in candidateList.value) {
        if (Object.prototype.hasOwnProperty.call(candidateList.value, key)) {
          localCandidateList[key] = candidateList.value[key].map(item => item.id);
        }
      }
      // 判断是否审批完成
      // 当前是发起人 后续所有的仅发起人必填节点必须都选择完
      // 当前是审批人 下一个必填审批节点必须指定候选人
      if (props.isSelect) {
        if (nextNodeCode.value.length > 0) {
          let finish = true;
          for (let i = 0; i < nextNodeCode.value.length; i++) {
            const nextNode = nodeList.value.filter(item => item.nodeCode === nextNodeCode.value[i])[0];
            if (
              nextNode.nodePropertyJson?.properties?.assigneeType === '7' &&
              Object.keys(candidateList.value).indexOf(nextNodeCode.value[i]) === -1
            ) {
              finish = false
              break
            }
          }
          props.onCandidateListChange(finish, localCandidateList);
        } else {
          props.onCandidateListChange(true, localCandidateList);
        }
      } else {
        props.onCandidateListChange(true, localCandidateList);
      }
    }
    watch(candidateList, () => {
      onCandidateChange();
    }, {
      immediate: true,
      deep: true
    });
    watch(nextNodeCode, () => {
      onCandidateChange();
    }, {
      immediate: true,
      deep: true
    });

    return {
      currNodeIndex,
      showFastAudit,
      userList,
      type,
      approvalOpen,
      node,
      candidateList,
      length,
      nodeList,
      onReject,
      onApproval,
      onConfirm,
      onApprovalConfirm,
      IMG_NEED_SELECT,
      get: _.get,
      approvalUserList,
      checkedUserName,
      goSelectCandidate,
      userCandidateSelectRef,
      checkCandidate,
      checkCandidateRequired
    };
  }
});
</script>
<style lang="scss">
.custom-timeline{
  .el-timeline-item{
    padding-bottom: 10px;
  }
  .el-timeline-item__dot{
    left: -8px
  }
}
.custom-dropdown-item{
  &.el-dropdown-menu__item:not(.is-disabled):hover,
  &.el-dropdown-menu__item:focus{
    background: #ECFDFF;
    color: #00B4C4;
  }
}
</style>
<style lang="scss" scoped>
.flow-task-node-list {
  width: 100%;
  height: 100%;
  padding-right: 6px;
  padding-left: 20px;
  font-size: 14px;
  background-color: #fff;
  .dot-img{
    width: 26px;
    height: 26px;
  }
  .child-dot-img {
    width: 10px;
    height: 10px;
    position: relative;
    left: 8px;
    top: 7px;
  }
  .flow-task-node-list-item{
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    line-height: 20px;
    padding-top: 5px;
  }
  .flow-task-item-gray{
    color: #919499;
  }
  .flow-task-item-origin{
    color:#FA914B
  }
  .flow-task-item-blue{
    color: #00B4C4;
  }
  .flow-task-item-select-candidate {
    word-break: keep-all;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .flow-task-item-black{
    color: #292C33;
  }
  .cursor-pointer{
    cursor: pointer;
  }
}
.self-flex {
  flex-shrink: 0;
}
.flow-task-item-select-candidate-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
}
.flow-task-node-child-list-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  line-height: 20px;
}
.child-list {
  margin-top: 5px;
}
</style>
