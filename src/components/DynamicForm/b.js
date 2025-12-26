/**
 * 1.【当 showInForm == false 时, 也依旧要在表单中渲染的组件列表】;;<br>
 * 2. 因为如果跳过渲染组件,则其内部的联动计算逻辑代码无法执行;;<br>
 * 3. 此时渲染代码一般写为三目运算:  <code> return showInForm ? <Form.Item>...</Form.Item> : <></> </code> ;;<br>
 * 4. 注意不要写成 <code> showInForm && <Form.Item>...</Form.Item> </code>
 */
export const alwaysRenderComponents = ['input', 'daysDiff', 'numberSum', 'numberMultiply', 'amountSum', 'numberMultiply', 'travelAllowance', 'relatedApproval'];

// 禁止必填校验的组件, 因为这些组件要么是计算结果值,要么是展示值, 不属于表单输入范围;
export const notSupportRequiredComponents = ['showValue', 'numberSum', 'numberMultiply', 'amountSum'];
