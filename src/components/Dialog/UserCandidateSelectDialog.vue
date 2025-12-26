<template>
  <el-dialog
    title="选择审批人"
    :close-on-click-modal="false"
    :visible.sync="visible"
    class="JNPF-dialog JNPF-dialog_center transfer-dialog"
    lock-scroll
    append-to-body
    width="800px"
    :modal-append-to-body="false"
  >
    <div class="transfer__body">
      <div class="transfer-pane">
        <div class="transfer-pane__tools">
          <span>请选择</span>
        </div>
        <div class="transfer-pane__body left-pane" v-loading="loading">
          <el-tree
            :data="treeData"
            :props="props"
            check-on-click-node
            @node-click="handleNodeClick"
            class="JNPF-common-el-tree"
            node-key="id"
            :default-expanded-keys="defaultExpandedKeys"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <i :class="getTreeIcon(data)"></i>
              <span class="text">{{ node.label }}</span>
            </span>
          </el-tree>
        </div>
      </div>
      <div class="transfer-pane">
        <div class="transfer-pane__tools">
          <span>已选</span>
          <el-button @click="removeAll" type="text" class="removeAllBtn">清空列表</el-button>
        </div>
        <div class="transfer-pane__body shadow right-pane">
          <template v-if="selectedData.length">
            <div v-for="(item,index) in selectedData" :key="index" class="selected-item-user">
              <div class="selected-item-main">
                <el-avatar
                  :size="36"
                  :src="define.comUrl+item.headIcon"
                  class="selected-item-headIcon"
                >
                </el-avatar>
                <div class="selected-item-text">
                  <p class="name">{{ item.fullName }}</p>
                </div>
                <i class="el-icon-delete" @click="removeData(index)"></i>
              </div>
            </div>
          </template>
          <el-empty description="暂无数据" :image-size="120" v-else></el-empty>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{ $t('common.cancelButton') }}</el-button>
      <el-button type="primary" @click="confirm">{{ $t('common.confirmButton') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { APIPostCandidateUser } from "@/api/cicada/approval";
import { forEachTreeData } from "@/utils";
export default {
  name: 'UserCandidateSelectDialog',
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    multipleLimit: Number,
  },
  data() {
    return {
      visible: false,
      loading: false,
      props: {
        children: 'children',
        label: 'fullName',
        value: 'id',
      },
      treeData: [],
      tmpTreeData1: [
        {
          "id": "610098327157009477",
          "type": "user",
          "parentId": "610095328980429893",
          "fullName": "张世杰/zhangshijie",
          "headIcon": "icon-ym icon-ym-tree-user2",
          "hasChildren": false,
          "enabledMark": null,
          "children": null
        }
      ],
      tmpTreeData: [
        {
          "id": "610095242737151045",
          "type": "department",
          "parentId": "610095130237529157",
          "fullName": "局领导",
          "headIcon": "icon-ym icon-ym-tree-department1",
          "hasChildren": true,
          "enabledMark": 1,
          "children": [
            {
              "id": "610097362131545157",
              "type": "user",
              "parentId": "610095242737151045",
              "fullName": "员三喜/yunsanxi",
              "headIcon": "icon-ym icon-ym-tree-user2",
              "hasChildren": false,
              "enabledMark": null,
              "children": null
            },
            {
              "id": "610097837279079493",
              "type": "user",
              "parentId": "610095242737151045",
              "fullName": "焦林生/jiaolinsheng",
              "headIcon": "icon-ym icon-ym-tree-user2",
              "hasChildren": false,
              "enabledMark": null,
              "children": null
            },
            {
              "id": "610098057488428101",
              "type": "user",
              "parentId": "610095242737151045",
              "fullName": "张志飞/zhangzhifei",
              "headIcon": "icon-ym icon-ym-tree-user2",
              "hasChildren": false,
              "enabledMark": null,
              "children": null
            },
            {
              "id": "610102677157768261",
              "type": "user",
              "parentId": "610095242737151045",
              "fullName": "戚咏梅/qiyongmei",
              "headIcon": "icon-ym icon-ym-tree-user2",
              "hasChildren": false,
              "enabledMark": null,
              "children": null
            },
            {
              "id": "610102957798648901",
              "type": "user",
              "parentId": "610095242737151045",
              "fullName": "费玉龙/feiyulong",
              "headIcon": "icon-ym icon-ym-tree-user2",
              "hasChildren": false,
              "enabledMark": null,
              "children": null
            },
            {
              "id": "610103137314860101",
              "type": "user",
              "parentId": "610095242737151045",
              "fullName": "许江涛/xujiangtao",
              "headIcon": "icon-ym icon-ym-tree-user2",
              "hasChildren": false,
              "enabledMark": null,
              "children": null
            },
            {
              "id": "610103295813413957",
              "type": "user",
              "parentId": "610095242737151045",
              "fullName": "苏璇/suxuan",
              "headIcon": "icon-ym icon-ym-tree-user2",
              "hasChildren": false,
              "enabledMark": null,
              "children": null
            }
          ]
        }
      ],
      defaultExpandedKeys: [],
      selectedData: [],
    }
  },
  methods: {
    init(node, ids) {
      this.visible = true;
      this.setDefault();
      const nodeCode = node ? node.nodeCode : '';
      const taskId = node ? node.nodePropertyJson.taskId : '';
      this.getList(nodeCode, taskId, ids);
    },
    getList(nodeCode, taskId, ids) {
      this.loading = true;
      APIPostCandidateUser({
        taskId: taskId,
        nodeCode: nodeCode,
      }).then(res => {
        this.loading = false;
        const data = res.data;
        if (data.length > 0) {
          this.treeData = data;
          this.defaultExpandedKeys = [this.treeData[0].id];
          this.selectedData = this.getUserListByIds(ids);
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    getUserListByIds(ids) {
      let ret = [];
      if (ids) {
        let idArr = [];
        if (typeof ids === 'string') {
          idArr = ids.split(',');
        } else if (ids instanceof Array) {
          idArr = ids;
        }
        console.log('getUserListByIds===idArr', idArr);
        if (idArr.length > 0) {
          const tempArr = [];
          forEachTreeData(this.treeData, (item) => {
            console.log(item);
            if (idArr.includes(item.id)) {
              tempArr.push(item);
              console.log(tempArr);
            }
          });
          console.log('getUserListByIds===tempArr', tempArr);
          ret = idArr.map(id => tempArr.find(r => r.id === id)).filter(v => !!v);
          console.log('getUserListByIds===ret', ret);
        }
      }
      return ret;
    },
    getTreeIcon(data) {
      if (data.type === 'department') {
        return 'icon-ym icon-ym-tree-department1'
      } else {
        return 'icon-ym icon-ym-tree-user2'
      }
    },
    removeAll() {
      this.selectedData = []
    },
    removeData(index) {
      this.selectedData.splice(index, 1)
    },
    setDefault() {
      this.selectedData = []
      this.treeData = []
    },
    handleNodeClick(data) {
      if (data.type !== 'user') return
      this.handleNodeClick2(data)
    },
    handleNodeClick2(data) {
      const boo = this.selectedData.some(o => o.id === data.id)
      if (boo) return
      // 改造一下：新增limit限制
      if (this.multiple) {
        if (this.multipleLimit) {
          if (this.selectedData.length < this.multipleLimit) {
            this.selectedData.push(data);
          } else {
            this.$message.warning("所选人数超出限制");
          }
        } else {
          this.selectedData.push(data)
        }
      } else {
        this.selectedData = [data]
      }
    },
    confirm() {
      let selectedIds = this.selectedData.map(o => o.id)
      this.$emit('confirm', selectedIds, this.selectedData)
      this.visible = false
    },
  }
}
</script>
