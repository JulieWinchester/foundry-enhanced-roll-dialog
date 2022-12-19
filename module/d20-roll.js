import ModifyRoll from "./modify-roll.js";

Hooks.once('init', async function() {
  libWrapper.register("modify-rolls", "game.dnd5e.dice.D20Roll.prototype.configureDialog", configureDialog, "OVERRIDE");
  game.dnd5e.dice.D20Roll.prototype._onPartToggle = _onPartToggle;
});

export async function configureDialog({title, defaultRollMode, defaultAction=this.constructor.ADV_MODE.NORMAL, chooseModifier=false,
  defaultAbility, template}={}, options={}) {

  console.log(this.data);

  defaultAbility = defaultAbility || this.data.defaultAbility || this.data.action?.item?.abilityMod;

  // Render the Dialog inner HTML
  const content = await renderTemplate("/modules/modify-rolls/templates/roll-dialog.hbs", {
    formula: `${this.formula} + @bonus`,
    defaultRollMode,
    rollModes: CONFIG.Dice.rollModes,
    chooseModifier,
    defaultAbility,
    defaultAbilityLabel: CONFIG.DND5E.abilities[defaultAbility] || "Ability",
    abilities: CONFIG.DND5E.abilities,
    mod: getInitialModifier(this.data, defaultAbility),
    prof: addPlusIfNotPresent(this.data.prof),
    proficient: this.data.action?.proficient,
    changes: this.data.action?.changes,
    itemAttackBonus: parseInt(this.data.itemAttackBonus) ? addPlusIfNotPresent(this.data.itemAttackBonus) : null,
    itemName: this.data.action?.item?.name
  });

  let defaultButton = "normal";
  switch ( defaultAction ) {
    case this.constructor.ADV_MODE.ADVANTAGE: defaultButton = "advantage"; break;
    case this.constructor.ADV_MODE.DISADVANTAGE: defaultButton = "disadvantage"; break;
  }

  // Create the Dialog window and await submission of the form
  return new Promise(resolve => {
    new Dialog({
      title,
      content,
      buttons: {
        advantage: {
          label: game.i18n.localize("DND5E.Advantage"),
          callback: html => resolve(this._onDialogSubmit(html, this.constructor.ADV_MODE.ADVANTAGE))
        },
        normal: {
          label: game.i18n.localize("DND5E.Normal"),
          callback: html => resolve(this._onDialogSubmit(html, this.constructor.ADV_MODE.NORMAL))
        },
        disadvantage: {
          label: game.i18n.localize("DND5E.Disadvantage"),
          callback: html => resolve(this._onDialogSubmit(html, this.constructor.ADV_MODE.DISADVANTAGE))
        }
      },
      default: defaultButton,
      close: () => resolve(null),
      render: (html) => {
        const changeToggles = html[0].querySelectorAll("input.toggle");
        changeToggles.forEach(changeToggle => {
          changeToggle.addEventListener("change", (event) => {
            this._onPartToggle(event, html);
          })
        });
        html[0].querySelector("select[name='ability']")?.addEventListener("change", (event) => {
          _onAbilitySelect(event.target.value, this.data, html);
        });
      }
    }, options).render(true);
  });
}

function getInitialModifier(data, defaultAbility) {
  let mod = data.mod;
  if (mod == '@mod') {
    mod = data.abilities[defaultAbility].mod;
  }
  return addPlusIfNotPresent(mod);
}

function addPlusIfNotPresent(value) {
  if (!value) return "0";
  if (value[0] && OperatorTerm.OPERATORS.includes(value[0])) return value;
  return value = "+".concat(value);
}

function _onPartToggle(event, html) {
  event.preventDefault();

  // Target parent form-group has correct styling
  if (event.target.checked) {
    event.target.closest("div.form-group").classList.remove("toggle-disabled");
  } else {
    event.target.closest("div.form-group").classList.add("toggle-disabled");
  }

  new ModifyRoll(this, event.target).updateRoll();
  console.log(this.data);

  _updateDialogFormula(this.formula, html);
}

function _updateDialogFormula(formula, html) {
  html[0].querySelector("form input[name='formula']").value = `${formula} + @bonus`;
}

function _onAbilitySelect(abl, data, html) {
  const label = CONFIG.DND5E.abilities[abl]
  const mod = addPlusIfNotPresent(data.abilities[abl].mod)
  console.log(html[0].querySelector("label.ability"));
  html[0].querySelector("label.ability").textContent = label;
  html[0].querySelector("label.ability.toggle-value").textContent = mod;
}