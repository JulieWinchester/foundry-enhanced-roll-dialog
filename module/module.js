import { rollAttackWrapper, rollToolCheckWrapper } from "./item.js";
import { rollAbilitySaveWrapper, rollAbilityTestWrapper, rollSkillWrapper } from "./actor.js";
import { configureDialog, _onPartToggle } from "./d20-roll.js";

Hooks.once('init', async function() {
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Actor5e.prototype.rollAbilitySave", rollAbilitySaveWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Actor5e.prototype.rollAbilityTest", rollAbilityTestWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Actor5e.prototype.rollSkill", rollSkillWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Item5e.prototype.rollAttack", rollAttackWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Item5e.prototype.rollToolCheck", rollToolCheckWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.dice.D20Roll.prototype.configureDialog", configureDialog, "OVERRIDE");
  game.dnd5e.dice.D20Roll.prototype._onPartToggle = _onPartToggle;
});
