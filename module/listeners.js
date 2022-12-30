import ModifyRoll from "./modify-roll.js";

// When roll part is toggled, update UI and modify roll
export function _onPartToggle(event, roll, html) {
  event.preventDefault();

  // For damage dialog, can't toggle off last checked entry
  if (
    roll.data?.action?.mode == "damage" &&
    !html[0].querySelectorAll("input.toggle:checked").length &&
    !event.target.checked
  ) {
    event.target.checked = true;
    return;
  }

  // Target parent form-group has correct styling
  if (event.target.checked) {
    event.target.closest("div.form-group").classList.remove("toggle-disabled");
  } else {
    event.target.closest("div.form-group").classList.add("toggle-disabled");
  }

  new ModifyRoll(roll, event.target).updateRoll();
  console.log(roll.data);

  _updateDialogFormula(roll.formula, html);
}

// Update UI roll formula
function _updateDialogFormula(formula, html) {
  html[0].querySelector("form input[name='formula']").value = `${formula} + @bonus`;
}

// For skill/tool rolls, update UI in response to changing ability used
export async function _onAbilitySelect(abl, roll, html) {
  const label = CONFIG.DND5E.abilities[abl];
  const mod = addPlusIfNotPresent(data.abilities[abl].mod);
  const data = roll.data;

  // Update ability modifier value
  html[0].querySelector("label.toggle-label").textContent = label;
  html[0].querySelector("label.toggle-value").textContent = mod;

  // If ability check bonus, update
  const fg = html[0]
    .querySelector("input[data-attribute='@abilityCheckBonus']")
    ?.closest("div.form-group");
  if (data.abilities[abl].bonuses?.check) {
    const genericLabel = game.i18n.localize("DND5E.ActionAbil");
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
      const newElement = await renderTemplate("/modules/enhanced-roll-dialog/templates/roll-dialog-toggle-row.hbs", {
        label: genericLabel,
        tag: game.i18n.localize("ERD.effect"),
        value: value,
        attr: "@abilityCheckBonus",
        inputID: "toggle-checkbox-ability-check-bonus",
        formGroupClass: "ability-check-bonus",
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