import RollPartInfo from "./roll-part-info.js";
import { parseDamageType, dmgTypeLabel } from "./utils.js";

/* 
This is the start of a function that will determine which effect changes apply to a particular roll
It's likely that each general category of flag will need to be handled separately
AKA, each category of flag needs to be checked to see if/how it affects the roll
Maybe there is an easier way to do this, but I'm not aware of it so far!
*/

/**
 * Gets relevant effect changes for a particular damage roll.
 * @param {Actor5e} actor       Actor associated with the role.
 * @param {String}  rollSubType One of "msak", "mwak", "rsak", "rwak".
 */
export default class DamageRollEffectChanges {

  constructor(actor, rollSubType, defaultDmgType) {
    this.actor = actor;
    this.rollSubType = rollSubType;
    this.defaultDmgType = defaultDmgType;
  }

  /**
   * Static method to get just the relevant effect changes for roll.
   * @param {Actor5e} actor       Actor associated with the role.
   * @param {String}  rollSubType One of "msak", "mwak", "rsak", "rwak".   
 */
  static getChanges(actor, rollSubType, defaultDmgType) {
    return new this(actor, rollSubType, defaultDmgType).changes;
  }

  /**
   * Array of relevant effect change objects with original effect included.
   * @type {Array<Object>} 
   */
  get changes() {
    if (!this.actor) return [];
    
    const c = this.actor.effects.map(effect => {
      const changes = effect.changes
        .filter(change => this.changeKeys.includes(change.key))
        .map(change => foundry.utils.mergeObject(change, { effect: effect }));

      return ( !(effect.isSuppressed) && changes.length ) ? changes : null;
    }).filter(changeArray => changeArray).flat();

    const changePartsInfo = c.map(change => new RollPartInfo({
      label: change.effect.label,
      tag: this.getDamageType(change.value),
      value: change.value,
      attr: "@actorDamageBonus",
      disabled: change.effect.disabled
    }));

    return changePartsInfo;
  }

  /**
   * Array of effect change keys.
   * @type {Array<String>} 
   */
  get changeKeys() {
    const keys = [`system.bonuses.${this.rollSubType}.damage`];
    return keys.concat(this.additionalKeys);
  }

  /**
   * Additional change key(s) not captured by core DND5E key formulas.
   * @type {Array<object>} 
   */
  get additionalKeys() {
    return (CONFIG.ERD.addlEffectKeys['damage'] || [])
      .filter(keyConfig => keyConfig.rollSubTypes.includes(this.rollSubType))
      .map(keyConfig => keyConfig.key);
  }

  getDamageType(value) {
    return parseDamageType(value) || dmgTypeLabel(this.defaultDmgType) || game.i18n.localize("ERD.unknown");
  }
}
