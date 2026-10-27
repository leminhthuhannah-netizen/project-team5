
/*
   1. RECIPE DATA
*/

let recipes = [];


/*
   2. LOAD RECIPES FROM JSON
*/

async function loadRecipes() {
    try {
        const response = await fetch("/assets/data/recipe.json");

        if (!response.ok) {
            throw new Error("Cannot load recipes.json");
        }

        recipes = await response.json();

        console.log("Recipes loaded:", recipes);

        return recipes;
    } catch (error) {
        console.error("Error loading recipes:", error);
        return [];
    }
}


/*
   3. GET RECIPE BY ID
*/

function getRecipeById(id) {
    return recipes.find(recipe => recipe.id === id);
}


/*
   4. GET TOTAL COOKING TIME
*/

function getTotalTime(recipe) {
    return recipe.prepTime + recipe.cookingTime;
}


