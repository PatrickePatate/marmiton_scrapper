export {
    RecipePrice,
    findRecipePrice
}

let RecipePrice = {
    CHEAP: "bon marché",
    AVERAGE: "moyen",
    EXPENSIVE: "assez cher",
    VERY_EXPENSIVE: "cher",
    VERY_VERY_EXPENSIVE: "très cher"
};

let findRecipePrice = (price) => {
    if(price.toLowerCase() === RecipePrice.CHEAP) {
        return RecipePrice.CHEAP;
    }
    if(price.toLowerCase() === RecipePrice.AVERAGE) {
        return RecipePrice.AVERAGE;
    }
    if(price.toLowerCase() === RecipePrice.EXPENSIVE) {
        return RecipePrice.EXPENSIVE;
    }
    if(price.toLowerCase() === RecipePrice.VERY_EXPENSIVE) {
        return RecipePrice.VERY_EXPENSIVE;
    }
    if(price.toLowerCase() === RecipePrice.VERY_VERY_EXPENSIVE) {
        return RecipePrice.VERY_VERY_EXPENSIVE;
    }

    console.error('Unable to find price for value: ' + price);
    return null;
}