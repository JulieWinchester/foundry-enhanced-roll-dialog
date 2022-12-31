import RollPartInfo from "./roll-part-info.js";

// This logic is taken from DAE's applyDaeEffects() method
export function evalExpression(value, rollData) {  
  console.log("DEBUG: enhanced-roll-dialog | evalExpression: Doing eval of ", value);
  
  value = `${value}`;
  value = value.replace("@item.level", "@itemLevel");

  // Replace @ attributes
  value = Roll.replaceFormulaData(value, rollData, { missing: 0, warn: false });
  
  try { // Roll parser no longer accepts some expressions it used to so we will try and avoid using it  
    value = Roll.safeEval(value);
  }
  catch (err) { // safeEval failed try a roll
    try {
        console.log("enhanced-roll-dialog | encountered dice expression, will try to parse");
        console.log(`Value is ${value}`);
        value = `${new Roll(value).evaluate({ async: false }).formula}`;
    }
    catch (err) {
        console.log("enhanced-roll-dialog | value calculation failed for", this, value);
        console.log(err);
    }
  }

  return value;
}

export function isFallbackChangeNeeded(attr, parts, rollData, rollPartInfoArray) {
  return parts.includes(attr) && 
    rollData[attr.substring(1)] && 
    addlBonusValue(attr, rollData, rollPartInfoArray);
}

export function fallbackChange(attr, rollData, rollPartInfoArray, defaultTag=null) {
  const newValue = addlBonusValue(attr, rollData, rollPartInfoArray);
  return new RollPartInfo({
    label: game.i18n.localize("ERD.unknownModifier"), 
    tag: defaultTag || game.i18n.localize("ERD.unknown"), 
    value: newValue, 
    valueText: addPlusIfNotPresent(evalExpression(newValue, rollData)),
    attr: attr
  });
}

function addlBonusValue(attr, rollData, rollPartInfoArray) {
  if (rollData[attr.substring(1)]) {
    let value = rollData[attr.substring(1)];
    rollPartInfoArray.forEach(partInfo => {
      if (partInfo.attr == attr) value = value.replace(partInfo.value, "");
    })
    return value;
  } else {
    return null;
  }
}

export function parseDamageType(dmg) {
  const dmgType = dmg.match(/\[(.*?)\]/);
  return dmgType ? dmgTypeLabel(dmgType[1]) : null;
}

export function dmgTypeLabel(dmgType) {
  if (!dmgType) return null;
  const damageLabels = { ...CONFIG.DND5E.damageTypes, ...CONFIG.DND5E.healingTypes };
  if (dmgType.split(',').length > 1) {
    return "Multiple";
  } else if (damageLabels[dmgType]) {
    return damageLabels[dmgType];
  } else {
    return null;
  }
}

export function removeDmgTypeFromStr(value) {
  return (value || "").replace(/\[(.*?)\]/, ""); 
}

export function addPlusIfNotPresent(value) {
  if (!value) return "0";
  value = `${value}`;
  if (value[0] && OperatorTerm.OPERATORS.includes(value[0])) return value;
  return value = "+".concat(value);
}