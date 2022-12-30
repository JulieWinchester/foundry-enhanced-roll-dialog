import ERD from "./config.js";
import { rollAttackWrapper, rollDamageWrapper, rollToolCheckWrapper } from "./documents/item.js";
import { rollAbilitySaveWrapper, rollAbilityTestWrapper, rollSkillWrapper } from "./documents/actor/actor.js";
import { configureDialog } from "./dice/d20-roll.js";
import { configureDamageRollDialog } from "./dice/damage-roll.js";

Hooks.once('init', async function() {
  libWrapper.register("enhanced-roll-dialog", "CONFIG.Actor.documentClass.prototype.rollAbilitySave", rollAbilitySaveWrapper, "WRAPPER");
  libWrapper.register("enhanced-roll-dialog", "CONFIG.Actor.documentClass.prototype.rollAbilityTest", rollAbilityTestWrapper, "WRAPPER");
  libWrapper.register("enhanced-roll-dialog", "CONFIG.Actor.documentClass.prototype.rollSkill", rollSkillWrapper, "WRAPPER");
  libWrapper.register("enhanced-roll-dialog", "CONFIG.Item.documentClass.prototype.rollAttack", rollAttackWrapper, "WRAPPER");
  libWrapper.register("enhanced-roll-dialog", "CONFIG.Item.documentClass.prototype.rollToolCheck", rollToolCheckWrapper, "WRAPPER");
  libWrapper.register("enhanced-roll-dialog", "CONFIG.Item.documentClass.prototype.rollDamage", rollDamageWrapper, "WRAPPER");
  libWrapper.register("enhanced-roll-dialog", "game.dnd5e.dice.D20Roll.prototype.configureDialog", configureDialog, "OVERRIDE");
  libWrapper.register("enhanced-roll-dialog", "game.dnd5e.dice.DamageRoll.prototype.configureDialog", configureDamageRollDialog, "OVERRIDE");
  CONFIG.ERD = ERD;
});

