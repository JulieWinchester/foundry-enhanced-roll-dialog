import { evalExpression } from "./utils.js";

/**
 * Contains information about a single "part" comprising the formula for a Roll.
 * Unlike core DND5E roll parts, a single "@attr" can have >1 RollPartInfo objects.
 * @param {string}  label         Label text for roll part
 * @param {string}  tag           Tag text for roll part
 * @param {string}  value         The value of the roll part
 * @param {string}  attr          "@attr" code associated with this part in the parts array
 * @param {string}  valueText     If needed, the text label version of roll part
 * @param {boolean} disabled      If true, part starts toggled off
 * @param {boolean} preventToggle If true, part can't be toggled on or off
 */
export default class RollPartInfo {
  constructor(
    {
      label, tag, value, attr, valueText="",
      disabled=false, preventToggle=false,
      effect=null, effectChangeKey=null 
    }={}
  ) {
    this.label = label;
    this.tag = tag;
    this.value = value;
    this.attr = attr;
    this.valueText = valueText;
    this.disabled = disabled;
    this.preventToggle = preventToggle;
  }
}