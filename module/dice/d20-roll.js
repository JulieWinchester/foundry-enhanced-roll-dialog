import { _onPartToggle, _onAbilitySelect } from "../listeners.js";

export async function configureDialog({title, defaultRollMode, defaultAction=this.constructor.ADV_MODE.NORMAL, chooseModifier=false,
  defaultAbility, template}={}, options={}) {

  console.log(this.data);

  defaultAbility = defaultAbility || this.data.defaultAbility || this.data.action?.itemAbilityMod;

  await loadTemplates({
    toggleRow: "/modules/enhanced-roll-dialog/templates/roll-dialog-toggle-row.hbs"
  });

  // Render the Dialog inner HTML
  const content = await renderTemplate("/modules/enhanced-roll-dialog/templates/roll-dialog.hbs", {
    formula: `${this.formula} + @bonus`,
    defaultRollMode,
    rollModes: CONFIG.Dice.rollModes,
    chooseModifier,
    defaultAbility,
    abilities: CONFIG.DND5E.abilities,
    rows: this.data.action?.partsInfo,
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
            _onPartToggle(event, this, html);
          })
        });
        html[0].querySelector("select[name='ability']")?.addEventListener("change", (event) => {
          _onAbilitySelect(event.target.value, this, html);
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
  value = `${value}`;
  if (value[0] && OperatorTerm.OPERATORS.includes(value[0])) return value;
  return value = "+".concat(value);
}
