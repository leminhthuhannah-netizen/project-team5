
/* ========================================
   1. GET HTML ELEMENTS
======================================== */

const recipeGrid = document.getElementById("explore-recipe-grid");
const recipeCount = document.getElementById("recipe-count");
const noRecipes = document.getElementById("no-recipes");


/* ========================================
   2. CREATE RECIPE CARD
======================================== */

function createRecipeCard(recipe) {
    const totalTime = getTotalTime(recipe);

    // Lấy loại bữa ăn để hiển thị danh mục
    const category = recipe.mealType || "Recipe";

    return `
        <article class="explore-recipe-card"
                 data-recipe-id="${recipe.id}">

            <a href="recipe.html?id=${recipe.id}"
               class="explore-recipe-image">

                <img src="${recipe.image}"
                     alt="${recipe.title}"
                     loading="lazy">

            </a>

            <button class="favorite-button"
                    type="button"
                    aria-label="Add ${recipe.title} to favorites"
                    aria-pressed="false"
                    data-recipe-id="${recipe.id}">

                <i class="fa-regular fa-heart"></i>

            </button>

            <div class="explore-recipe-info">

                <span class="recipe-category">
                    ${category}
                </span>

                <h3>
                    <a href="recipe.html?id=${recipe.id}">
                        ${recipe.title}
                    </a>
                </h3>

                <p>${recipe.description}</p>

                <div class="explore-recipe-meta">

                    <span>
                        <i class="fa-regular fa-clock"></i>
                        ${totalTime} min
                    </span>

                    <span>
                        ${recipe.difficulty}
                    </span>

                </div>

                <a href="recipe.html?id=${recipe.id}"
                   class="button button-outline recipe-view-button">

                    View Recipe
                    <span aria-hidden="true">→</span>

                </a>

            </div>

        </article>
    `;
}


/* ========================================
   3. DISPLAY RECIPES
======================================== */

function renderRecipes(recipeList) {

    // Tạo các thẻ món ăn từ dữ liệu JSON
    recipeGrid.innerHTML = recipeList
        .map(recipe => createRecipeCard(recipe))
        .join("");

    // Cập nhật số lượng món ăn
    recipeCount.textContent =
        `${recipeList.length} recipes`;

    // Hiện thông báo nếu không có kết quả
    noRecipes.hidden = recipeList.length > 0;
}


/* ========================================
   4. LOAD RECIPES
======================================== */

async function initExplore() {

    const recipeList = await loadRecipes();

    renderRecipes(recipeList);

}


/* ========================================
   5. START
======================================== */

initExplore();
