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
        let baseExp = gameMonster.experience ?? 0;
        let difficulty = this.difficultyTier ?? 0;
        this.experience = (1.0 + 0.2 * difficulty) * (baseExp + 10.0 * difficulty);
    }

    updateCombatDetails() {
        const gameMonster = combatMonsterDetailMap[this.hrid];

        let levelMultiplier = 1.0 + 0.2 * this.difficultyTier;
        let levelBonus = 20.0 * this.difficultyTier;
        this.staminaLevel = levelMultiplier * (gameMonster.combatDetails.staminaLevel + levelBonus);
        this.intelligenceLevel = levelMultiplier * (gameMonster.combatDetails.intelligenceLevel + levelBonus);
        this.attackLevel = levelMultiplier * (gameMonster.combatDetails.attackLevel + levelBonus);
        this.powerLevel = levelMultiplier * (gameMonster.combatDetails.powerLevel + levelBonus);
        this.defenseLevel = levelMultiplier * (gameMonster.combatDetails.defenseLevel + levelBonus);
        this.rangedLevel = levelMultiplier * (gameMonster.combatDetails.rangedLevel + levelBonus);
        this.magicLevel = levelMultiplier * (gameMonster.combatDetails.magicLevel + levelBonus);

        this.combatDetails.combatStats.combatStyleHrid = gameMonster.combatDetails.combatStats.combatStyleHrids[0];

        for (const [key, value] of Object.entries(gameMonster.combatDetails.combatStats)) {
            this.combatDetails.combatStats[key] = value;
        }

        [
            "stabAccuracy",
            "slashAccuracy",
            "smashAccuracy",
            "rangedAccuracy",
            "magicAccuracy",
            "stabDamage",
            "slashDamage",
            "smashDamage",
            "rangedDamage",
            "magicDamage",
            "taskDamage",
            "physicalAmplify",
            "waterAmplify",
            "natureAmplify",
            "fireAmplify",
            "healingAmplify",
            "stabEvasion",
            "slashEvasion",
            "smashEvasion",
            "rangedEvasion",
            "magicEvasion",
            "armor",
            "waterResistance",
            "natureResistance",
            "fireResistance",
            "maxHitpoints",
            "maxManapoints",
            "lifeSteal",
            "hpRegenPer10",
            "mpRegenPer10",
            "physicalThorns",
            "elementalThorns",
            "combatDropRate",
            "combatRareFind",
            "combatDropQuantity",
            "combatExperience",
            "criticalRate",
            "criticalDamage",
            "armorPenetration",
            "waterPenetration",
            "naturePenetration",
            "firePenetration",
            "abilityHaste",
            "abilityDamage",
            "tenacity",
            "manaLeech",
            "castSpeed",
            "threat",
            "parry",
            "mayhem",
            "pierce",
            "curse",
            "fury",
            "weaken",
            "ripple",
            "bloom",
            "blaze",
            "attackSpeed",
            "foodHaste",
            "drinkConcentration",
            "autoAttackDamage"
        ].forEach((stat) => {
            if (gameMonster.combatDetails.combatStats[stat] == null) {
                this.combatDetails.combatStats[stat] = 0;
            }
        });
        
    this.combatDetails.combatStats.attackInterval = gameMonster.combatDetails.attackInterval;

    super.updateCombatDetails();
}
}

export default Monster;