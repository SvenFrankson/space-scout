class StationLoadManager {

    private _character: Character;
    private _lastLevel: SectionLevel;

    constructor(character: Character) {
        this._character = character;
        this._character.scene.registerBeforeRender(this.updateLoad);
    }

    private updateLoad = () => {
        let currentLevel = this._character.currentLevel();
        if (currentLevel && currentLevel !== this._lastLevel) {
            // mark previously loaded sections for disposal (outer only instantiation)
            let needDisposal: StationSection[] = [];
            if (this._lastLevel) {
                needDisposal.push(this._lastLevel.section);
                this._lastLevel.joinedLevels.forEach(
                    (lastJoinedLevel: SectionLevel) => {
                        if (needDisposal.indexOf(lastJoinedLevel.section) === -1) {
                            needDisposal.push(lastJoinedLevel.section)
                        }
                    }
                )
            }
            
            // unmark current level section for disposal
            let currentSectionIndex: number = needDisposal.indexOf(currentLevel.section);
            if (currentSectionIndex !== -1) {
                needDisposal.splice(currentSectionIndex, 1);
            }

            currentLevel.section.instantiate(currentLevel.level);
            currentLevel.joinedLevels.forEach(
                (joinedLevel: SectionLevel) => {
                    joinedLevel.section.instantiate(joinedLevel.level);
                    // unmark joinded level section for disposal
                    let joindedLevelSectionIndex: number = needDisposal.indexOf(joinedLevel.section);
                    if (joindedLevelSectionIndex !== -1) {
                        needDisposal.splice(joindedLevelSectionIndex, 1);
                    }
                }
            )

            // dispose sections still marked for disposal
            needDisposal.forEach(
                (section: StationSection) => {
                    section.instantiate(-1);
                }
            )
        }
        this._lastLevel = currentLevel;
    }
}