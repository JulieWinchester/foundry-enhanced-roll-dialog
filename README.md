![](https://img.shields.io/badge/Foundry-10.291-informational)
<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
![Latest Release Download Count](https://img.shields.io/github/downloads/JulieWinchester/foundry-enhanced-roll-dialog/latest/module.zip)

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2F<your-module-name>&colorB=4aa94a) -->

# Enhanced Roll Dialog (ERD)

Have you ever wanted more clarity from the default D&D 5E attack/check/save roll dialog about what modifiers are affecting you roll? Or possibly wanted to be able to toggle on or off certain roll bonuses depending on the situation? Or just wanted to have the benefits of the slicker roll dialog implemented by the Foundry Pathfinder 2E system? Enhanced Roll Dialog (ERD) accomplishes all of those, largely by reimplementing the basic look and utility of the very clear and interactive Foundry Pathfinder 2E roll dialog for D&D 5E. 

<img width="1477" alt="Screen Shot 2022-12-26 at 10 04 41 PM" src="https://user-images.githubusercontent.com/14943160/209609352-44e7597c-caf0-4d5c-a3e3-2d5bca6e3258.png">

For attack, ability check, and ability save rolls, ERD tries to display all the modifiers (positive or negative) affecting the current roll with each modifier labeled and described with a type tag. You can also toggle modifiers on or off. Toggling a modifier off will only affect the current roll, it will not have any effect on future rolls. 

One of the primary things this module does is to detect modifiers related to Active Effects. If the Active Effect associated with a modifier is currently disabled, it will still be displayed, but will start out toggled off. This allows you to have disabled Active Effects that can still be toggled on as appropriate, e.g., for situational or one-time bonuses like Guidance, Bardic Inspiration, or a Rogue's Sneak Attack Feature. Proficiency also works similarly, it is displayed for all rolls where proficiency might apply, but is toggled off for rolls where the character is not explicitly proficient. This allows you to toggle proficiency on or off as desired. Putting all this together, Enhanced Roll Dialog allows better support for various low- to medium-automation approaches to D&D 5E. 

ERD is in a very early state of development, and numerous problems may be encountered. Importantly, except for a few exceptions, this module mostly does not touch the core roll data handled by Foundry unless you interact with the dialog to toggle a bonus on or off. Because of this, even if the module "misses" some of the modifiers affecting a roll, the roll should still be successfully completed with all modifiers included in most cases, especially (again) if you don't toggle any roll parts.

## Details

Many different modifier categories are detected: 
- Ability modifiers
- Proficiency
- Item attack bonuses (for magical items, etc.)
- Tool bonuses
- Ammunition attack bonuses (for magical ammunition, etc.)
- Active Effects that apply attack/check/save bonuses 

For Active Effects, ERD supports core D&D5E active effect attribute keys, and also some DAE additional attack bonus attribute keys. 

The roll dialog correctly infers and displays derived effect values (e.g., `@details.level` will be shown as 6 for a level 6 character) and can evaluate math expressions (e.g., `(ceil(@details.level/2))d6` will be shown as 2d6 for a level 3 character). There is also some support for attack rolls to fall back to an "Unknown Modifier" label if an attack bonus is present that ERD can't parse. 

Ammunition attack bonuses are a bit of a special case, because while these are displayed, they can't be toggled off. This is because it's not straightforward to prevent ammunition consumption at the point of the roll dialog in response to toggling off an ammunition bonus, so for the moment, ammunition bonuses can't be toggled. All other modifiers can be toggled on or off. 
