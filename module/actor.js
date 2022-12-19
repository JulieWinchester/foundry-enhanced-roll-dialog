/* 
Wrapper functions for Actor roll funcs to enhance rollData as needed

Unfortunately, these reimplement how Actor roll funcs generate roll parts which is brittle.
Item5E.rollAttack gets roll parts from another func that is easily wrapped, not possible here.
Alternatively, could override entire Actor roll funcs, but probably best not to do that. 
*/

import RollEffectChanges from "./roll-effect-changes.js";

export function rollSkillWrapper(wrapped, skillId, options) {
  const skl = this.system.skills[skillId];
  const globalBonuses = this.system.bonuses?.abilities ?? {};
  const parts = ["@mod", "@abilityCheckBonus"];
  if ( skl.prof.hasProficiency ) parts.push("@prof");
  if ( globalBonuses.check ) parts.push("@checkBonus");
  if ( skl.bonuses?.check ) parts.push(`@${skillId}CheckBonus`);
  if ( globalBonuses.skill ) parts.push("@skillBonus");
  if ( options.parts?.length > 0 ) parts.push(...options.parts);

  options = foundry.utils.mergeObject(options, {
    data: {
      action: {
        actionType: "abilities",
        mode: "skill",
        parts: parts,
        changes: RollEffectChanges.getChanges(this, "skill", skillId),
        skill: skillId,
        proficient: skl.proficient
      }
    }
  });

  return wrapped(skillId, options);
}

export function rollAbilityTestWrapper(wrapped, abilityId, options) {
  const abl = this.system.abilities[abilityId];
  const globalBonuses = this.system.bonuses?.abilities ?? {};
  const parts = [];
  parts.push("@mod");
  if ( abl?.checkProf.hasProficiency ) parts.push("@prof");
  if ( abl?.bonuses?.check ) parts.push(`@${abilityId}CheckBonus`);
  if ( globalBonuses.check ) parts.push("@checkBonus");
  if ( options.parts?.length > 0 ) parts.push(...options.parts);

  console.log(parts);

  options = foundry.utils.mergeObject(options, {
    data: {
      action: {
        actionType: "abilities",
        mode: "check",
        parts: parts,
        changes: RollEffectChanges.getChanges(this, "check", abilityId),
        ability: abilityId,
        proficient: abl?.checkProf.hasProficiency
      }
    }
  });

  return wrapped(abilityId, options);
}

export function rollAbilitySaveWrapper(wrapped, abilityId, options) {
  console.log(this.system.actionType);
  const abl = this.system.abilities[abilityId];
  const globalBonuses = this.system.bonuses?.abilities ?? {};
  const parts = [];
  parts.push("@mod");
  if ( abl?.saveProf.hasProficiency ) parts.push("@prof");
  if ( abl?.bonuses?.save ) parts.push(`@${abilityId}SaveBonus`);
  if ( globalBonuses.save ) parts.push("@saveBonus");
  if ( options.parts?.length > 0 ) parts.push(...options.parts);

  options = foundry.utils.mergeObject(options, {
    data: {
      action: {
        actionType: "abilities",
        mode: "save",
        parts: parts,
        changes: RollEffectChanges.getChanges(this, "save", abilityId),
        ability: abilityId,
        proficient: abl?.saveProf.hasProficiency
      }
    }
  });

  return wrapped(abilityId, options);
}
