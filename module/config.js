// Namespace Configuration Values
const ERD = {};

/**
 * Effect key configuration data.
 *
 * @typedef {object} EffectKeyConfiguration
 * @property {string}        key           Key name.
 * @property {Array<string>} rollSubTypes  Array of roll subtypes key applies to.
 */

/**
 * Additional (non-formulaic) DND5E effect flags parsed by this module.
 * 
 * This module handles many core DND5E effect keys using standardized formulas
 * based on roll type. However, it's not always possible to recognize all keys
 * using formulas, especially for non-core DND5E (DAE, MIDI) effect keys. This
 * is the set of effect keys manually recognized by this module. The object
 * is organized by roll types, and each flag records the associated subtypes.
 * @enum {Array<EffectKeyConfiguration>}
 */
ERD.addlEffectKeys = {
  attack: [
    { key: "system.bonuses.All-Attacks", rollSubTypes: ["msak", "mwak", "rsak", "rwak"] },
    { key: "system.bonuses.spell.attack", rollSubTypes: ["msak", "rsak"] },
    { key: "system.bonuses.weapon.attack", rollSubTypes: ["mwak", "rwak"] },
  ]
}

/* -------------------------------------------- */

export default ERD;

