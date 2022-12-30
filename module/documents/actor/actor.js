import RollPartInfo from "../../roll-part-info.js";
import { addPlusIfNotPresent, evalExpression } from "../../utils.js";

/* 
Wrapper functions for Actor roll funcs to enhance rollData as needed

Unfortunately, these reimplement how Actor roll funcs generate roll parts which is brittle.
Item5E.rollAttack gets roll parts from another func that is easily wrapped, not possible here.
Alternatively, could override entire Actor roll funcs, but probably best not to do that. 
*/

import D20RollEffectChanges from "../../d20-roll-effect-changes.js";

export function rollSkillWrapper(wrapped, skillId, options) {
  const skl = this.system.skills[skillId];
  const globalBonuses = this.system.bonuses?.abilities ?? {};
  const rollData = this.getRollData();

  const parts = ["@mod", "@abilityCheckBonus"];
  if ( skl.prof.hasProficiency ) parts.push("@prof");
  if ( globalBonuses.check ) parts.push("@checkBonus");
  if ( skl.bonuses?.check ) parts.push(`@${skillId}CheckBonus`);
  if ( globalBonuses.skill ) parts.push("@skillBonus");
  
  // Add @mod and @prof part info
  const partsInfo = [
    new RollPartInfo({
      label: CONFIG.DND5E.abilities[skl.ability],
      tag: game.i18n.localize("DND5E.Ability"),
      value: skl.mod,
      valueText: addPlusIfNotPresent(evalExpression(skl.mod, rollData)),
      attr: "@mod"
    }),
    new RollPartInfo({
      label: game.i18n.localize("DND5E.Proficiency"),
      tag: game.i18n.localize("DND5E.Proficiency"),
      value: rollData.prof.term,
      valueText: addPlusIfNotPresent(evalExpression(rollData.prof.term, rollData)),
      attr: "@prof",
      disabled: !skl.prof.hasProficiency
    })
  ];

  const changesInfo = D20RollEffectChanges
    .getChanges(this, "skill", skillId)
    .map(change => foundry.utils.mergeObject(
      change, { valueText: addPlusIfNotPresent(evalExpression(change.value, rollData)) }
    ));
  
  const baseAttributeOrder = ["@mod", "@abilityCheckBonus", "@prof", "@checkBonus", `@${skillId}CheckBonus`, "@skillBonus"];
  
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
        actionType: "abilities",
        attributeOrder: baseAttributeOrder.concat(addlAttributeOrder),
        mode: "skill",
        parts: parts,
        partsInfo: partsInfo.concat(changesInfo),
      }
    }
  });

  return wrapped(skillId, options);
}

export function rollAbilityTestWrapper(wrapped, abilityId, options) {
  const abl = this.system.abilities[abilityId];
  const globalBonuses = this.system.bonuses?.abilities ?? {};
  const rollData = this.getRollData();

  const parts = [];
  parts.push("@mod");
  if ( abl?.checkProf.hasProficiency ) parts.push("@prof");
  if ( abl?.bonuses?.check ) parts.push(`@${abilityId}CheckBonus`);
  if ( globalBonuses.check ) parts.push("@checkBonus");

  // Add @mod and @prof part info
  const partsInfo = [
    new RollPartInfo({
      label: CONFIG.DND5E.abilities[abilityId],
      tag: game.i18n.localize("DND5E.Ability"),
      value: abl?.mod,
      valueText: addPlusIfNotPresent(evalExpression(abl?.mod, rollData)),
      attr: "@mod"
    }),
    new RollPartInfo({
      label: game.i18n.localize("DND5E.Proficiency"),
      tag: game.i18n.localize("DND5E.Proficiency"),
      value: rollData.prof.term,
      valueText: addPlusIfNotPresent(evalExpression(rollData.prof.term, rollData)),
      attr: "@prof",
      disabled: !abl?.checkProf.hasProficiency
    })
  ];

  const changesInfo = D20RollEffectChanges
    .getChanges(this, "check", abilityId)
    .map(change => foundry.utils.mergeObject(
      change, { valueText: addPlusIfNotPresent(evalExpression(change.value, rollData)) }
    ));

  const baseAttributeOrder = ["@mod", "@prof", `@${abilityId}CheckBonus`, "@checkBonus"];
  
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
        actionType: "abilities",
        attributeOrder: baseAttributeOrder.concat(addlAttributeOrder),
        mode: "check",
        parts: parts,
        partsInfo: partsInfo.concat(changesInfo),
      }
    }
  });

  return wrapped(abilityId, options);
}

export function rollAbilitySaveWrapper(wrapped, abilityId, options) {
  console.log(this.system.actionType);
  const abl = this.system.abilities[abilityId];
  const globalBonuses = this.system.bonuses?.abilities ?? {};
  const rollData = this.getRollData();

  const parts = [];
  parts.push("@mod");
  if ( abl?.saveProf.hasProficiency ) parts.push("@prof");
  if ( abl?.bonuses?.save ) parts.push(`@${abilityId}SaveBonus`);
  if ( globalBonuses.save ) parts.push("@saveBonus");

  // Add @mod and @prof part info
  const partsInfo = [
    new RollPartInfo({
      label: CONFIG.DND5E.abilities[abilityId],
      tag: game.i18n.localize("DND5E.Ability"),
      value: abl?.mod,
      valueText: addPlusIfNotPresent(evalExpression(abl?.mod, rollData)),
      attr: "@mod"
    }),
    new RollPartInfo({
      label: game.i18n.localize("DND5E.Proficiency"),
      tag: game.i18n.localize("DND5E.Proficiency"),
      value: rollData.prof.term,
      valueText: addPlusIfNotPresent(evalExpression(rollData.prof.term, rollData)),
      attr: "@prof",
      disabled: !abl?.saveProf.hasProficiency
    })
  ];

  const changesInfo = D20RollEffectChanges
    .getChanges(this, "save", abilityId)
    .map(change => foundry.utils.mergeObject(
      change, { valueText: addPlusIfNotPresent(evalExpression(change.value, rollData)) }
    ));

  const baseAttributeOrder = ["@mod", "@prof", `@${abilityId}SaveBonus`, "@saveBonus"];

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
        actionType: "abilities",
        attributeOrder: baseAttributeOrder.concat(addlAttributeOrder),
        mode: "save",
        parts: parts,
        partsInfo: partsInfo.concat(changesInfo),
      }
    }
  });

  return wrapped(abilityId, options);
}
