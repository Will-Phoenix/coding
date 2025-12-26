export class CustomBtnType {
  static default = new CustomBtnType('default')
  static mailShare = new CustomBtnType('mailShare')
  static smsShare = new CustomBtnType('smsShare')
  static scene = new CustomBtnType('scene')
  constructor(name) {
    this.name = name
  }
  toString() {
    return this.name
  }
  toLocalString() {
    switch (this.name) {
      case CustomBtnType.default.toString():
        return "默认"
      case CustomBtnType.mailShare.toString():
        return "邮件分享"
      case CustomBtnType.smsShare.toString():
        return "短信分享"
      case CustomBtnType.scene.toString():
        return "权限按钮"
    }
  }
}
