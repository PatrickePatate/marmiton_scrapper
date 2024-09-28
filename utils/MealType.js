export {
    MealType,
    findMealType
}

let MealType = {
    SAUCE: "sauce",
    SIDE: "accompagnement",
    STARTER: "entrée",
    MAIN: "plat principal",
    DESSERT: "dessert",
    DRINK: "boisson",
    APERITIVE: "apéritif",
    OTHER: "autre"
};

let findMealType = (type) => {
    if(type.toLowerCase() === MealType.STARTER) {
        return MealType.STARTER;
    }
    if(type.toLowerCase() === MealType.MAIN) {
        return MealType.MAIN;
    }
    if(type.toLowerCase() === MealType.DESSERT) {
        return MealType.DESSERT;
    }
    if(type.toLowerCase() === MealType.DRINK) {
        return MealType.DRINK;
    }
    if(type.toLowerCase() === MealType.APERITIVE) {
        return MealType.APERITIVE;
    }
    if(type.toLowerCase() === MealType.SIDE) {
        return MealType.SIDE;
    }
    if(type.toLowerCase() === MealType.SAUCE) {
        return MealType.SAUCE;
    }

    console.error('Unable to find mal type for value: ' + type);
    return MealType.OTHER;
}