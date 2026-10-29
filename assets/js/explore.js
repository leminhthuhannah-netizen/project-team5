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
        <button class="favorite-button ${getFavoriteIds().includes(String(recipe.id)) ? 'is-favorite' : ''}"
                type="button"
                aria-pressed="${getFavoriteIds().includes(String(recipe.id))}"
                data-recipe-id="${recipe.id}">
            <i class="${getFavoriteIds().includes(String(recipe.id)) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
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
   5. HANDLE FAVORITE BUTTON
======================================== */

const FAVORITES_KEY = "savorly_favorites";

function getFavoriteIds() {
    try {
        const data = JSON.parse(localStorage.getItem(FAVORITES_KEY));
        return Array.isArray(data) ? data.map(String) : [];
    } catch (error) {
        return [];
    }
}

function saveFavoriteIds(ids) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

if (recipeGrid) {
    recipeGrid.addEventListener("click", function (event) {
        const button = event.target.closest(".favorite-button");

        if (!button) return;

        event.preventDefault();
        event.stopPropagation();

        const recipeId = String(button.dataset.recipeId);
        const favoriteIds = getFavoriteIds();

        // Chỉ thêm nếu món ăn chưa có trong Favorites
        if (!favoriteIds.includes(recipeId)) {
            favoriteIds.push(recipeId);
            saveFavoriteIds(favoriteIds);
        }

        // Chuyển sang trang Favorites
        window.location.href = "favorites.html";
    });
}



/* ========================================
   6. START
======================================== */

initExplore();