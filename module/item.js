import RollEffectChanges from "./roll-effect-changes.js";

export function getAttackToHitWrapper(wrapped, ...args) {
  let results = wrapped(...args);

  if (results) {
    console.log(results);
    let {rollData, parts} = results;

    // If item bonus present, reparse as @attr
    if (parseInt(rollData.item.attackBonus) && (parts || []).includes(rollData.item.attackBonus)) {
      rollData, parts = itemAttackBonusAsAttribute(rollData, parts);
    }

    // If actor bonus present, reparse as @attr
    const actorAttackBonus = this.actor.system.bonuses?.[this.system.actionType]?.attack;
    if ( (actorAttackBonus) && ( (parts || []).includes(actorAttackBonus) ) ) {
      rollData, parts = actorAttackBonusAsAttribute(rollData, parts, actorAttackBonus);
    }

    const attributeOrder = ["@itemAttackBonus", "@mod", "@prof", "@actorAttackBonus", "@ammo"]

    // Construct initial action info object
    let action = {
      attributeOrder: attributeOrder,
      mode: "attack",
      parts: parts,
      changes: RollEffectChanges.getChanges(this.actor, parts, "attack", this.system.actionType),
      itemName: this.name || "",
      itemAbilityMod: this.abilityMod,
      proficient: this.system.proficient
    };
    rollData.action = action;
  }

  return results;
}

export function itemAttackBonusAsAttribute(rollData, parts) {
  parts.splice(parts.indexOf(rollData.item.attackBonus), 1, "@itemAttackBonus")
  rollData.itemAttackBonus = rollData.item.attackBonus;
  return rollData, parts;
}

export function actorAttackBonusAsAttribute(rollData, parts, actorAttackBonus) {
  parts.splice(parts.lastIndexOf(actorAttackBonus), 1, "@actorAttackBonus")
  rollData.actorAttackBonus = actorAttackBonus;
  return rollData, parts;
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
        changes: RollEffectChanges.getChanges(this.actor, parts, "check", abl, true),
        item: {
          name: this.name || ""
        },
        proficient: this.system.prof?.hasProficiency
      }
    }
  });

  return wrapped(options);
}