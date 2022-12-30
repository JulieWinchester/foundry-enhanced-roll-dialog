import D20RollEffectChanges from "../d20-roll-effect-changes.js";
import RollPartInfo from "../roll-part-info.js";
import { isFallbackChangeNeeded, fallbackChange, evalExpression } from "../utils.js";

export function rollAttackWrapper(wrapped, options={}) {
  if ( !this.hasAttack ) throw new Error("You may not place an Attack Roll with this Item.");
  
  // Get the parts and rollData for this item's attack
  let {parts, rollData} = this.getAttackToHit();

  // Additional roll data terms
  let addlRollData = {};

  // If item bonus present, reparse as @attr
  if (parseInt(rollData?.item?.attackBonus) && (parts || []).includes(rollData?.item?.attackBonus)) {
    parts.splice(parts.indexOf(rollData.item.attackBonus), 1, "@itemAttackBonus");
    addlRollData.itemAttackBonus = rollData.item.attackBonus;
  }

  // If actor bonus present, reparse as @attr
  const actorAttackBonus = this.actor?.system?.bonuses?.[this.system.actionType]?.attack;
  if ( (actorAttackBonus) && ( (parts || []).includes(actorAttackBonus) ) ) {
    parts.splice(parts.lastIndexOf(actorAttackBonus), 1, "@actorAttackBonus")
    addlRollData.actorAttackBonus = actorAttackBonus;
  }

  // Get ammo name if necessary
  let ammoItemName = "";
  if ( (this.system.consume?.type === "ammo") && this.actor?.items ) {
    const ammoItem = this.actor.items.get(this.system.consume.target);
    ammoItemName = ammoItem.name;
  }

  let changes = D20RollEffectChanges.getChanges(this.actor, parts, "attack", this.system.actionType);

  // Add @actorAttackBonus fallback change if effects not recognized
  if (isFallbackChangeNeeded("@actorAttackBonus", parts, addlRollData, changes)) {
    changes.push(fallbackChange("@actorAttackBonus", addlRollData));
  }

  addlRollData.action = {
    attributeOrder: ["@itemAttackBonus", "@mod", "@prof", "@actorAttackBonus", "@ammo"],
    mode: "attack",
    parts: parts,
    changes: changes,
    itemName: this.name || "",
    itemAbilityMod: this.abilityMod,
    proficient: !["weapon", "consumable"].includes(this.type) || this.system.proficient,
    ammoItemName: ammoItemName
  };

  options = foundry.utils.mergeObject(options, { parts, data: addlRollData });

  return wrapped(options);
} 

export function rollToolCheckWrapper(wrapped, options) {
  const abl = this.system.ability;
  const globalBonus = this.actor.system.bonuses?.abilities || {};
  const parts = ["@mod", "@abilityCheckBonus"];
  if ( this.system.prof?.hasProficiency ) parts.push("@prof");
  if ( this.system.bonus ) parts.push("@toolBonus");
  if ( globalBonus.check ) { parts.push("@checkBonus"); }
  const baseAttributeOrder = ["@mod", "@abilityCheckBonus", "@prof", "@toolBonus", "@checkBonus"];
  
  let addlAttributeOrder = [];
  if ( options.parts?.length > 0 ) { 
    parts.push(...options.parts);
    addlAttributeOrder = options.parts
      .filter(p => p[0] && p[0] == "@")
      .filter(p => !baseAttributeOrder.includes(p));
  }

  options = foundry.utils.mergeObject(options, {
    data: {
      action: {
        actionType: "tool",
        attributeOrder: baseAttributeOrder.concat(addlAttributeOrder),
        mode: "check",
        parts: parts,
        changes: D20RollEffectChanges.getChanges(this.actor, parts, "check", abl, true),
        item: {
          name: this.name || ""
        },
        proficient: this.system.prof?.hasProficiency
      }
    }
  });

  return wrapped(options);
}

export function rollDamageWrapper(wrapped, {critical=false, event=null, spellLevel=null, versatile=false, options={}}={}) {
  console.log(this.system);
  const dmg = this.system.damage;
  let parts = dmg.parts.map(d => d[0]);

  const rollData = this.getRollData();
  if ( spellLevel ) rollData.item.level = spellLevel;
  const addlRollData = {}

  // Adjust damage from versatile usage
  if ( versatile && dmg.versatile ) {
    parts[0] = dmg.versatile;
  }

  // Scale damage from up-casting spells
  const scaling = this.system.scaling;
  if ( (this.type === "spell") ) {
    if ( scaling.mode === "cantrip" ) {
      let level;
      if ( this.actor.type === "character" ) level = this.actor.system.details.level;
      else if ( this.system.preparation.mode === "innate" ) level = Math.ceil(this.actor.system.details.cr);
      else level = this.actor.system.details.spellLevel;
      this._scaleCantripDamage(parts, scaling.formula, level, rollData);
    }
    else if ( spellLevel && (scaling.mode === "level") && scaling.formula ) {
      this._scaleSpellDamage(parts, this.system.level, spellLevel, scaling.formula, rollData);
    }
  }

  const partsInfo = parts.map((p, idx) => {
    addlRollData[`dmg${idx}`] = p; 
    return new RollPartInfo({
      label: this.name || "", 
      tag: dmg.parts[idx][1], 
      value: p, 
      valueText: evalExpression(p, rollData),
      attr: `@dmg${idx}`
    });
  });

  // Reconfigure parts to use attributes instead of straight formulas
  parts = partsInfo.map(p => p.attr);
  const initialAttributeOrder = parts;

  // Add damage bonus formula
  const actorBonus = foundry.utils.getProperty(this.actor.system, `bonuses.${this.system.actionType}`) || {};
  if ( actorBonus.damage && (parseInt(actorBonus.damage) !== 0) ) {
    parts.push("@actorDamageBonus");
    addlRollData.actorDamageBonus = actorBonus.damage;
  }

  // Only add the ammunition damage if the ammunition is a consumable with type 'ammo'
  if ( this._ammo && (this._ammo.type === "consumable") && (this._ammo.system.consumableType === "ammo") ) {
    parts.push("@ammo");
    const ammoDmg = this._ammo.system.damage;
    const ammoDmgValue = ammoDmg.parts.map(p => p[0]).join("+")
    const ammoDmgTypes = ammoDmg.parts.map(p => p[1]);
    partsInfo.push(new RollPartInfo({
      label: this._ammo.name, 
      tag: ammoDmgTypes.every((d => d == ammoDmgTypes[0])) ? ammoDmgTypes[0] : "multiple", 
      value: ammoDmgValue, 
      valueText: evalExpression(ammoDmgValue, rollData),
      attr: `@ammo`,
      preventToggle: true
    }));
  }

  // if (isFallbackChangeNeeded("@actorDamageBonus", parts, rollData, partsInfo)) {
  //   changes.push(fallbackChange("@actorAttackBonus", addlRollData));
  // }

  addlRollData.action = {
    attributeOrder: initialAttributeOrder.concat(["@actorDamageBonus", "@ammo"]),
    mode: "damage",
    parts,
    partsInfo,
  }

  foundry.utils.mergeObject(options, { parts, data: addlRollData });

  console.log(parts);

  return wrapped({critical, event, spellLevel, versatile, options});
}