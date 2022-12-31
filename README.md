![](https://img.shields.io/badge/Foundry-10.291-informational)
![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FJulieWinchester%2Ffoundry-enhanced-roll-dialog%2Freleases%2Flatest)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2F<your-module-name>&colorB=4aa94a) -->

# Enhanced Roll Dialog (ERD)

Have you ever wanted more clarity from the default D&D 5E roll dialog about what modifiers or components make up a roll? Or possibly wanted to be able to toggle on or off certain roll bonuses depending on the situation? Enhanced Roll Dialog (ERD) provides a more informative and interactive D&D 5E roll dialog for most kinds of rolls, while only minimally altering the default 5E roll behavior. This module can be used in practically any 5E Foundry game, but it's likely to be especially helpful for low or medium automation setups.  

## What ERD Does

Attack Roll Example | Damage Roll Example
:------------------:|:-------------------------:
![](https://user-images.githubusercontent.com/14943160/209609352-44e7597c-caf0-4d5c-a3e3-2d5bca6e3258.png) | ![](https://user-images.githubusercontent.com/14943160/210117096-1e0ef653-b6a1-4ed5-a94c-e419aa9589d3.png)

Enhanced Roll Dialog targets the following 5E roll types:
- Attack
- Damage
- Ability Checks
- Skill Ability Checks
- Saving Throws
- Tool Checks

For these roll types, ERD tries to display all modifiers (positive or negative) or components forming the current roll, with each modifier labeled and described with a type tag. For non-damage rolls, the type tag describes the source of the modifier. For damage rolls, the type tag describes the damage type of the damage roll component. Modifiers and components can be toggled on or off to be included or excluded from the roll. Some modifiers (like disabled active effects, see below) will start out toggled off, but can be turned back on for a particular roll. Toggling a modifier off or on will only affect the current roll, it will not have any effect on future rolls. 

## Active Effects and Proficiency Bonus

A major thing this module does is to detect relevant roll modifiers from Active Effects. As mentioned above, if the Active Effect associated with a modifier is disabled, that modifier will be displayed, but will be toggled off in the roll dialog. This allows you to have disabled Active Effects that can still be switched on as appropriate for certain rolls, e.g., for situational or one-time bonuses like Guidance, Bardic Inspiration, or a Rogue's Sneak Attack Feature. 

Proficiency is displayed similarly to Active Effects, where appropriate. A proficiency bonus is listed in the roll dialog for all rolls where proficiency might possibly apply - skill checks, tool checks, saving throws, even ability checks in case you want to roll tool checks on the fly. If ERD detects that a proficiency bonus does not necessarily apply to a roll, it will be initially toggled off in the dialog like for disabled active effects. This allows you to toggle proficiency on or off as desired. 

Putting all this together, Enhanced Roll Dialog supports various low to medium automation approaches to 5E that doesn't require players remembering to disable or reenable Active Effects to add bonuses before initiating a roll. But it can also be used in just about any game where it would be helpful for players to see what parts comprise roll formulas. 

## Compatibility

This module does not currently play well with any other module that modifies or enhances roll dialogs. 

**Do not** use this module while enabling Midi-Qol's **Enhanced Damage Roll Dialog**. This module is compatible with Midi, but you must turn off the Midi Enhanced Damage Roll Dialog in order to use ERD.

## Details

ERD is in a very early state of development, and numerous problems may be encountered. Importantly, except for a few exceptions, this module mostly does not touch the core roll data handled by Foundry unless you interact with the dialog to toggle a bonus on or off. Because of this, even if the module "misses" some of the modifiers affecting a roll, the roll should still successfully complete with all modifiers included in most cases, especially (again) if you don't toggle any roll parts.

Many different roll component categories are detected: 
- Ability modifiers
- Base damage dice
- Proficiency
- Active Effects that apply attack/check/save/damage bonuses 
- Item attack and damage bonuses (for magical items, etc.)
- Ammunition attack and damage bonuses (for magical ammunition, etc.)
- Tool bonuses

For Active Effects, ERD supports core D&D5E active effect attribute keys, and also some DAE additional attack bonus attribute keys. It probably does not include all necessary DAE/MidiQOL flags! If you notice an active effect key that doesn't seem to be supported but should be, creating a GitHub Issue would be a great way to bring it to my attention. 🙂

The roll dialog correctly infers and displays derived effect values (e.g., `@details.level` will be shown as 6 for a level 6 character) and can evaluate math expressions (e.g., `(ceil(@details.level/2))d6` will be shown as 2d6 for a level 3 character). There is also some support for attack rolls to fall back to an "Unknown Modifier" label if an attack bonus is present that ERD can't parse. 

Ammunition attack bonuses are a bit of a special case, because while these are displayed, they can't be toggled off. This is because it's not straightforward to prevent ammunition consumption at the point of the roll dialog in response to toggling off an ammunition bonus, so for the moment, ammunition bonuses can't be toggled. All other modifiers can be toggled on or off. 

## Acknowledgements

The direct inspiration for this module is the roll dialog created for the [Pathfinder 2E Foundry System](https://github.com/foundryvtt/pf2e), and much of the user-facing functionality of this module replicates what is available in the PF2E system. 

This module used the [League of Foundry Developers FoundryVTT Module Template](https://github.com/League-of-Foundry-Developers/FoundryVTT-Module-Template) as a foundation from which to build. 

Parts of this module build on top of or take inspiration from the [Foundry VTT D&D 5E system](https://github.com/foundryvtt/dnd5e) and [Dynamic Active Effects](https://gitlab.com/tposney/dae).

