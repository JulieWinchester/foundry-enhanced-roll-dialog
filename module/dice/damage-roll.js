import { _onPartToggle, _onAbilitySelect } from "../listeners.js";

export async function configureDamageRollDialog({title, defaultRollMode, defaultCritical=false, template, allowCritical=true}={}, options={}) {

  console.log(this.data);

  await loadTemplates({
    toggleRow: "/modules/enhanced-roll-dialog/templates/roll-dialog-toggle-row.hbs"
  });

  const rows = this.data.action.partsInfo.map(row => 
    foundry.utils.mergeObject(
      row, { dmgTypeHtml: CONFIG.ERD.damageTypeIcons[row.dmgType] }
    )
  );

  // Render the Dialog inner HTML
  const content = await renderTemplate("/modules/enhanced-roll-dialog/templates/roll-dialog-new.hbs", {
    formula: `${this.formula} + @bonus`,
    defaultRollMode,
    rollModes: CONFIG.Dice.rollModes,
    rows: this.data.action.partsInfo,
    smallTag: true
  });

  // Create the Dialog window and await submission of the form
  return new Promise(resolve => {
    new Dialog({
      title,
      content,
      buttons: {
        critical: {
          condition: allowCritical,
          label: game.i18n.localize("DND5E.CriticalHit"),
          callback: html => resolve(this._onDialogSubmit(html, true))
        },
        normal: {
          label: game.i18n.localize(allowCritical ? "DND5E.Normal" : "DND5E.Roll"),
          callback: html => resolve(this._onDialogSubmit(html, false))
        }
      },
      default: defaultCritical ? "critical" : "normal",
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
    }, options).render(true);
  });
}