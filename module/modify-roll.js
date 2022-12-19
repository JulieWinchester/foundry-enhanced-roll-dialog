/*
This is the class that will accept a D20 Roll instance and an obj with toggled changes, modifies rollData, parts, terms, and formula. 
*/

export default class ModifyRoll {
  singleSourceAttrs = ["@mod", "@prof", "@itemAttackBonus"];

  constructor(roll, element) {
    this.roll = roll;
    console.log(element);
    this.element = element;
    this.attribute = this.element.dataset.attribute;
    console.log(this.attribute)
    this.rollData = roll.data;
    this.parts = roll.data.action.parts;
  }

  updateRoll() {
    if (this.singleSourceAttrs.includes(this.attribute)) {
      this.updateRollSingleSource();
    } else {
      this.updateRollMultiSource();
    }

    console.log(this.parts);
    this.roll.terms = this.roll.constructor.parse([this.roll.terms[0].formula].concat(this.parts).join("+"), this.rollData);
    console.log(this.roll.terms)
    this.roll._formula = this.roll.constructor.getFormula(this.roll.terms);
    console.log(this.roll._formula);
  }

  // Update roll parts, but no need to update roll attribute value
  updateRollSingleSource() {
    if (this.element.checked && !this.parts.includes(this.attribute)) {
      this.parts.push(this.attribute);
    } else if (this.parts.includes(this.attribute)) {
      this.parts.splice(this.parts.indexOf(this.attribute), 1)
    }
  }

  // Update roll parts and recalculate roll attribute value among effect changes
  updateRollMultiSource() {
    const form = this.element.closest('form');

    const attrChanges = Array.from(form.querySelectorAll("input.toggle-effect:checked"))
      .filter(checkbox => checkbox.dataset.attribute == this.attribute)
      .map(checkbox => {
        let valueSplit = this.roll.constructor._splitOperators(checkbox.dataset.changeValue);
        if ( valueSplit.length && !(valueSplit[0] instanceof OperatorTerm) ) {
          valueSplit.unshift("+");
        }
        return valueSplit.map(value => value instanceof OperatorTerm ? value.operator : value ).join("");
      });

    this.rollData[this.attribute.slice(1)] = attrChanges.join("");

    // Ensure attribute is added to or removed from roll formula
    if (this.rollData[this.attribute.slice(1)] && !this.parts.includes(this.attribute)) {
      this.parts.push(this.attribute);
    } else if (!this.rollData[this.attribute.slice(1)] && this.parts.includes(this.attribute)) {
      this.parts.splice(this.parts.indexOf(this.attribute), 1);
    }
  }
}