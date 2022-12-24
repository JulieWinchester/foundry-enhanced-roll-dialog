import ModifyRoll from "./modify-roll.js";

export async function configureDialog({title, defaultRollMode, defaultAction=this.constructor.ADV_MODE.NORMAL, chooseModifier=false,
  defaultAbility, template}={}, options={}) {

  console.log(this.data);

  defaultAbility = defaultAbility || this.data.defaultAbility || this.data.action?.itemAbilityMod;

  await loadTemplates({
    toggleRow: "/modules/modify-rolls/templates/roll-dialog-toggle-row.hbs"
  });

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
    itemName: this.data.action?.itemName,
    toolBonus: parseInt(this.data.toolBonus) ? addPlusIfNotPresent(this.data.toolBonus) : null,
    ammo: parseInt(this.data.ammo) ? addPlusIfNotPresent(this.data.ammo) : null,
    ammoItemName: this.data.action?.ammoItemName || "Ammunition"
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
          _onAbilitySelect(event.target.value, this.data, this, html);
        });
      }
    }, options).render(true, { height: "100%" });
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

export function _onPartToggle(event, html) {
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

async function _onAbilitySelect(abl, data, roll, html) {
  const label = CONFIG.DND5E.abilities[abl];
  const mod = addPlusIfNotPresent(data.abilities[abl].mod);

  // Update ability modifier value
  html[0].querySelector("label.toggle-label").textContent = label;
  html[0].querySelector("label.toggle-value").textContent = mod;

  // If ability check bonus, update
  const fg = html[0]
    .querySelector("input[data-attribute='@abilityCheckBonus']")
    ?.closest("div.form-group");
  if (data.abilities[abl].bonuses?.check) {
    const genericLabel = "Ability Check Bonus"
    const value = addPlusIfNotPresent(data.abilities[abl].bonuses.check);

    // Bonus exists, must update or add
    if (fg) {
      // update
      fg.querySelector("label").textContent = genericLabel;
      fg.querySelector("label.toggle-value").textContent = value;
      if (fg.querySelector("input").checked == false) {
        fg.querySelector("input").checked = true;
        new ModifyRoll(roll, fg.querySelector("input")).updateRoll();
        _updateDialogFormula(roll.formula, html);
      }
      if (fg.style.display == "none") fg.style.display = "flex";
    } else {
      // add
      const newElement = await renderTemplate("/modules/modify-rolls/templates/ability-check-bonus-row.hbs", {
        label: genericLabel,
        value: value
      });
      $("form.roll-toggle-dialog div.toggle-rows").append(newElement);

      // apply usual event listeners
      html[0].querySelector("div.form-group.dnd5e.ability-check-bonus")
        .addEventListener("change", (event) => {
          roll._onPartToggle(event, html);
      });
    }
  } else if (fg) {
    // Bonus does not exist, must remove if present
    fg.style.display = "none";
    if (fg.querySelector("input").checked == true) {
      fg.querySelector("input").checked = false;
      new ModifyRoll(roll, fg.querySelector("input")).updateRoll();
      _updateDialogFormula(roll.formula, html);
    }
  }
}
