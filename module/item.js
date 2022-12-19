import RollEffectChanges from "./roll-effect-changes.js";

export function getAttackToHitWrapper(wrapped, ...args) {
  let results = wrapped(...args);

  if (results) {
    console.log(results);
    let {rollData, parts} = results;

    // Construct initial action info object
    let action = {
      mode: "attack",
      parts: parts,
      changes: RollEffectChanges.getChanges(this.actor, "attack", this.system.actionType),
      item: {
        name: this.name || "",
        abilityMod: this.abilityMod
      },
      actor: {},
      proficient: this.system.proficient
    };
    rollData.action = action;

    // If item bonus present, reparse as @attr
    if (parseInt(rollData.item.attackBonus) && (parts || []).includes(rollData.item.attackBonus)) {
      rollData, parts = itemAttackBonusAsAttribute(rollData, parts);
    }

    // If actor bonus present, reparse as @attr
    const actorAttackBonus = this.actor.system.bonuses?.[this.system.actionType]?.attack;
    if ( (actorAttackBonus) && ( (parts || []).includes(actorAttackBonus) ) ) {
      rollData, parts = actorAttackBonusAsAttribute(rollData, parts, actorAttackBonus);
    }
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