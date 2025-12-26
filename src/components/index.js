import JNPFTreeSelect from '@/components/JNPF-treeSelect'
import topOperation from '@/components/JNPF-topOperation/index'
import tableOperation from '@/components/JNPF-tableOperation'
import Pagination from '@/components/Pagination'
import JNPFTable from '@/components/JNPF-table'
import jnpfFormTipItem from '@/components/jnpf-form-tip-item'
import jnpfOpenData from '@/components/jnpf-open-data'
import UserBox from '@/components/JNPF-userBox'
import Screenfull from '@/components/Screenfull'
import ColumnSettings from '@/components/ColumnSettings'
import JNPFQuill from '@/components/JNPFEditor/quill'
import UserSelect from '@/components/JNPF-userSelect'
import UsersSelect from '@/components/JNPF-usersSelect'
import uploadBtn from '@/components/JNPF-uploadBtn'
import ImportBox from '@/components/JNPFImport'
// 代码生成器专供
import JNPFText from '@/components/Generator/components/JNPFText'
import JnpfLink from '@/components/Generator/components/JnpfLink'
import JnpfBarcode from '@/components/Generator/components/JnpfBarcode'
import JnpfQrcode from '@/components/Generator/components/JnpfQrcode'
import JnpfButton from '@/components/Generator/components/JnpfButton'
import JNPFUploadFz from '@/components/Generator/components/Upload/UploadFz'
import JNPFUploadImg from '@/components/Generator/components/Upload/UploadImg'
import PopupSelect from '@/components/Generator/components/PopupSelect'
import PopupTableSelect from '@/components/Generator/components/PopupTableSelect'
import PopupAttr from '@/components/Generator/components/PopupAttr'
import NumRange from '@/components/Generator/components/NumRange'
import ComSelect from '@/components/Generator/components/ComSelect'
import GroupSelect from '@/components/Generator/components/GroupSelect'
import DepSelect from '@/components/Generator/components/DepSelect'
import PosSelect from '@/components/Generator/components/PosSelect'
import DicSelect from '@/components/Generator/components/DicSelect'
import BillRule from '@/components/Generator/components/BillRule'
import JNPFInputTable from '@/components/Generator/components/InputTable'
import RoleSelect from '@/components/Generator/components/RoleSelect'
import JNPFAddress from '@/components/Generator/components/Address'
import GroupTitle from '@/components/Generator/components/GroupTitle'
import RelationForm from '@/components/Generator/components/RelationForm'
import RelationFormAttr from '@/components/Generator/components/RelationFormAttr'
import Calculate from '@/components/Generator/components/Calculate'

export default {
  install(Vue, options) {
    Vue.component('JNPFTreeSelect', JNPFTreeSelect)
    Vue.component('topOpts', topOperation)
    Vue.component('tableOpts', tableOperation)
    Vue.component('Pagination', Pagination)
    Vue.component('JNPFTable', JNPFTable)
    Vue.component('jnpfFormTipItem', jnpfFormTipItem)
    Vue.component('jnpfOpenData', jnpfOpenData)
    Vue.component('uploadBtn', uploadBtn)
    Vue.component('UserBox', UserBox)
    Vue.component('JNPFText', JNPFText)
    Vue.component('JnpfLink', JnpfLink)
    Vue.component('JnpfBarcode', JnpfBarcode)
    Vue.component('JnpfQrcode', JnpfQrcode)
    Vue.component('JnpfButton', JnpfButton)
    Vue.component('JNPFUploadFz', JNPFUploadFz)
    Vue.component('JNPFUploadImg', JNPFUploadImg)
    Vue.component('PopupSelect', PopupSelect)
    Vue.component('PopupTableSelect', PopupTableSelect)
    Vue.component('PopupAttr', PopupAttr)
    Vue.component('NumRange', NumRange)
    Vue.component('ComSelect', ComSelect)
    Vue.component('GroupSelect', GroupSelect)
    Vue.component('DepSelect', DepSelect)
    Vue.component('PosSelect', PosSelect)
    Vue.component('UserSelect', UserSelect)
    Vue.component('UsersSelect', UsersSelect)
    Vue.component('RoleSelect', RoleSelect)
    Vue.component('DicSelect', DicSelect)
    Vue.component('BillRule', BillRule)
    Vue.component('JNPFInputTable', JNPFInputTable)
    Vue.component('JNPFAddress', JNPFAddress)
    Vue.component('GroupTitle', GroupTitle)
    Vue.component('RelationForm', RelationForm)
    Vue.component('RelationFormAttr', RelationFormAttr)
    Vue.component('Calculate', Calculate)
    Vue.component('JNPFQuill', JNPFQuill)
    Vue.component('Screenfull', Screenfull)
    Vue.component('ColumnSettings', ColumnSettings)
    Vue.component('ImportBox', ImportBox)
  }
}