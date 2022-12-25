import { rollAttackWrapper, rollToolCheckWrapper } from "./item.js";
import { rollAbilitySaveWrapper, rollAbilityTestWrapper, rollSkillWrapper } from "./actor.js";
import { configureDialog, _onPartToggle } from "./d20-roll.js";

Hooks.once('init', async function() {
  libWrapper.register("modify-rolls", "CONFIG.Actor.documentClass.prototype.rollAbilitySave", rollAbilitySaveWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "CONFIG.Actor.documentClass.prototype.rollAbilityTest", rollAbilityTestWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "CONFIG.Actor.documentClass.prototype.rollSkill", rollSkillWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "CONFIG.Item.documentClass.prototype.rollAttack", rollAttackWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "CONFIG.Item.documentClass.prototype.rollToolCheck", rollToolCheckWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.dice.D20Roll.prototype.configureDialog", configureDialog, "OVERRIDE");
  game.dnd5e.dice.D20Roll.prototype._onPartToggle = _onPartToggle;
});
