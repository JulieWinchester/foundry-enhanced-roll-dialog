/*
This is the class that will accept a D20 Roll instance and an obj with toggled changes, modifies rollData, parts, terms, and formula. 
*/

export default class ModifyRoll {
  singleSourceAttrs = ["@mod", "@prof", "@itemAttackBonus", "@abilityCheckBonus", "@toolBonus", "@ammo"];

  constructor(roll, element) {
    this.roll = roll;
    this.element = element;
    this.attribute = this.element.dataset.attribute;
    this.rollData = roll.data;
    this.parts = roll.data.action.parts;
  }

  updateRoll() {
    if (this.singleSourceAttrs.includes(this.attribute)) {
      this.updateRollSingleSource();
    } else {
      this.updateRollMultiSource();
    }
    this.sortParts();

    const newFormula = ( this.rollData.action?.mode == "damage" ) ? 
      this.parts.join("+") : 
      [this.roll.terms[0].formula].concat(this.parts).join("+");

    console.log(newFormula);

    this.roll.terms = this.removeDuplicateOperators(
      this.roll.constructor.parse(newFormula, this.rollData)
    );
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

    const attrChanges = Array.from(form.querySelectorAll("input.toggle:checked"))
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

  sortParts() {
    this.parts.sort((a, b) =>
      (this.rollData.action.attributeOrder.indexOf(a) + 1 || Number.MAX_VALUE) -
      (this.rollData.action.attributeOrder.indexOf(b) + 1 || Number.MAX_VALUE)
    );
  }

  /**
   * Checks terms and removes duplicate OperatorTerms with the same operator
   * @param {RollTerm[]} terms      An array of terms which is eligible for simplification
   * @returns {RollTerm[]}          An array of simplified terms
   */
  removeDuplicateOperators(terms) {
    return terms.map( (term, index) => {
      if (
        index != 0 && 
        term instanceof OperatorTerm && 
        terms[index-1] instanceof OperatorTerm &&
        term.operator == terms[index-1].operator
      ) {
        return null;
      } else {
        return term;
      }
    }).filter(term => term);
  }
}