import { getAttackToHitWrapper, rollToolCheckWrapper } from "./item.js";
import { rollAbilitySaveWrapper, rollAbilityTestWrapper, rollSkillWrapper } from "./actor.js";

Hooks.once('init', async function() {
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Actor5e.prototype.rollAbilitySave", rollAbilitySaveWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Actor5e.prototype.rollAbilityTest", rollAbilityTestWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Actor5e.prototype.rollSkill", rollSkillWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Item5e.prototype.getAttackToHit", getAttackToHitWrapper, "WRAPPER");
  libWrapper.register("modify-rolls", "game.dnd5e.documents.Item5e.prototype.rollToolCheck", rollToolCheckWrapper, "WRAPPER");
});
