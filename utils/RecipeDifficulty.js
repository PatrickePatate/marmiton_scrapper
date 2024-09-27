export {
    RecipeDifficulty,
    findRecipeDifficulty
}

let RecipeDifficulty = {
    VERY_EASY: "très facile",
    EASY: "facile",
    MEDIUM: "moyenne",
    HARD: "difficile",
    VERY_HARD: "très difficile"
};

let findRecipeDifficulty = (difficulty) => {
    if(difficulty.toLowerCase() === RecipeDifficulty.VERY_EASY) {
        return RecipeDifficulty.VERY_EASY;
    }
    if(difficulty.toLowerCase() === RecipeDifficulty.EASY) {
        return RecipeDifficulty.EASY;
    }
    if(difficulty.toLowerCase() === RecipeDifficulty.MEDIUM) {
        return RecipeDifficulty.MEDIUM;
    }
    if(difficulty.toLowerCase() === RecipeDifficulty.HARD) {
        return RecipeDifficulty.HARD;
    }
    if(difficulty.toLowerCase() === RecipeDifficulty.VERY_HARD) {
        return RecipeDifficulty.VERY_HARD;
    }
    console.error('Unable to find difficulty for value: ' + difficulty);
    return null;
}