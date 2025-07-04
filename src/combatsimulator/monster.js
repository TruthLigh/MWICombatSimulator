import Ability from "./ability";
import CombatUnit from "./combatUnit";
import combatMonsterDetailMap from "./data/combatMonsterDetailMap.json";
import Drops from "./drops";

class Monster extends CombatUnit {
    constructor(hrid, difficultyTier = 0, isDungeon = false) {
        super();

        this.isPlayer = false;
        this.hrid = hrid;
        this.difficultyTier = difficultyTier;
        this.isDungeon = isDungeon;

        let gameMonster = combatMonsterDetailMap[this.hrid];
        if (!gameMonster) {
            throw new Error("No monster found for hrid: " + this.hrid);
        }

        // 技能表
        this.abilities = [];
        if (gameMonster.abilities) {
            for (let i = 0; i < gameMonster.abilities.length; i++) {
                if (gameMonster.abilities[i].minDifficultyTier > this.difficultyTier) continue;
                this.abilities.push(new Ability(gameMonster.abilities[i].abilityHrid, gameMonster.abilities[i].level));
            }
        }
        // 掉落表
        this.dropTable = [];
        if (gameMonster.dropTable) {
            for (let i = 0; i < gameMonster.dropTable.length; i++) {
                if (gameMonster.dropTable[i].minDifficultyTier > this.difficultyTier) continue;
                this.dropTable.push(
                    new Drops(
                        gameMonster.dropTable[i].itemHrid,
                        gameMonster.dropTable[i].dropRate,
                        gameMonster.dropTable[i].minCount,
                        gameMonster.dropTable[i].maxCount,
                        gameMonster.dropTable[i].minDifficultyTier
                    )
                );
            }
        }

        // 稀有掉落表
        this.rareDropTable = [];
        if (gameMonster.rareDropTable) {
            for (let i = 0; i < gameMonster.rareDropTable.length; i++) {
                if (gameMonster.rareDropTable[i].minDifficultyTier > this.difficultyTier) continue;
                this.rareDropTable.push(
                    new Drops(
                        gameMonster.rareDropTable[i].itemHrid,
                        gameMonster.rareDropTable[i].dropRate,
                        gameMonster.rareDropTable[i].minCount,
                        gameMonster.rareDropTable[i].maxCount,
                        gameMonster.rareDropTable[i].minDifficultyTier
                    )
                );
            }
        }

        // 属性缩放
        this.combatDetails = Monster.getScaledCombatDetails(gameMonster.combatDetails, this.difficultyTier);
        this.updateCombatDetails();
    }

    static getScaledCombatDetails(combatDetails, difficultyTier = 0) {
        let scaled = { ...combatDetails, combatStats: { ...combatDetails.combatStats } };
        if (difficultyTier > 0) {
            let levelMultiplier = 1.0 + 0.2 * difficultyTier;
            let levelBonus = 20.0 * difficultyTier;
            scaled.staminaLevel = levelMultiplier * (scaled.staminaLevel + levelBonus);
            scaled.intelligenceLevel = levelMultiplier * (scaled.intelligenceLevel + levelBonus);
            scaled.attackLevel = levelMultiplier * (scaled.attackLevel + levelBonus);
            scaled.powerLevel = levelMultiplier * (scaled.powerLevel + levelBonus);
            scaled.defenseLevel = levelMultiplier * (scaled.defenseLevel + levelBonus);
            scaled.rangedLevel = levelMultiplier * (scaled.rangedLevel + levelBonus);
            scaled.magicLevel = levelMultiplier * (scaled.magicLevel + levelBonus);
            //.experience = levelMultiplier * (.experience + 10 * difficultyTier);
        }
        return scaled;
    }

    updateCombatDetails() {
        this.staminaLevel = this.combatDetails.staminaLevel;
        this.intelligenceLevel = this.combatDetails.intelligenceLevel;
        this.attackLevel = this.combatDetails.attackLevel;
        this.powerLevel = this.combatDetails.powerLevel;
        this.defenseLevel = this.combatDetails.defenseLevel;
        this.rangedLevel = this.combatDetails.rangedLevel;
        this.magicLevel = this.combatDetails.magicLevel;

        if (this.combatDetails.combatStats) {
            
            if (Array.isArray(this.combatDetails.combatStats.combatStyleHrids)) {
                this.combatDetails.combatStats.combatStyleHrid = this.combatDetails.combatStats.combatStyleHrids[0];
            }

            // 补全所有常用字段
            const defaultStats = [
                "stabAccuracy","slashAccuracy","smashAccuracy","rangedAccuracy","magicAccuracy",
                "stabDamage","slashDamage","smashDamage","rangedDamage","magicDamage","taskDamage",
                "physicalAmplify","waterAmplify","natureAmplify","fireAmplify","healingAmplify",
                "stabEvasion","slashEvasion","smashEvasion","rangedEvasion","magicEvasion",
                "armor","waterResistance","natureResistance","fireResistance",
                "maxHitpoints","maxManapoints","lifeSteal","hpRegenPer10","mpRegenPer10",
                "physicalThorns","elementalThorns","combatDropRate","combatRareFind","combatDropQuantity",
                "combatExperience","criticalRate","criticalDamage","armorPenetration","waterPenetration",
                "naturePenetration","firePenetration","abilityHaste","abilityDamage","tenacity",
                "manaLeech","castSpeed","threat","parry","mayhem","pierce","curse","fury","weaken",
                "ripple","bloom","blaze","attackSpeed","foodHaste","drinkConcentration","autoAttackDamage"
            ];
            defaultStats.forEach(stat => {
                if (this.combatDetails.combatStats[stat] == null) {
                    this.combatDetails.combatStats[stat] = 0;
                }
            });
            // attackInterval
            if (this.combatDetails.attackInterval != null) {
                this.combatDetails.combatStats.attackInterval = this.combatDetails.attackInterval;
            }
        }

        super.updateCombatDetails();
    }
}

export default Monster;