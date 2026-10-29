document.addEventListener("DOMContentLoaded", async function () {
    const favoritesGrid = document.getElementById("favorites-grid");
    const favoritesCount = document.querySelector(".favorites-count");
    const favoritesEmpty = document.getElementById("favorites-empty");

    if (!favoritesGrid) return;

    const FAVORITES_KEY = "savorly_favorites";

    // Đọc danh sách ID món ăn đã yêu thích
    function getFavoriteIds() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(FAVORITES_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved.map(String) : [];
        } catch (error) {
            return [];
        }
    }

    // Tải dữ liệu món ăn
    const allRecipes = await loadRecipes();
    const favoriteIds = getFavoriteIds();

    // Lấy những món ăn có ID nằm trong danh sách yêu thích
    function renderFavorites() {
        const favoriteRecipes = allRecipes.filter(recipe =>
            favoriteIds.includes(String(recipe.id))
        );

        favoritesGrid.innerHTML = favoriteRecipes.map(recipe => {
            const totalTime = getTotalTime(recipe);

            return `
                <article class="explore-recipe-card"
                         data-recipe-id="${recipe.id}">
                    <a href="recipe.html?id=${recipe.id}"
                       class="explore-recipe-image">
                        <img src="${recipe.image}"
                             alt="${recipe.title}">
                    </a>

                    <button class="favorite-button is-favorite"
                            type="button"
                            data-recipe-id="${recipe.id}"
                            aria-label="Remove ${recipe.title} from favorites">
                        <i class="fa-solid fa-heart"></i>
                    </button>

                    <div class="explore-recipe-info">
                        <span class="recipe-category">
                            ${recipe.mealType || "Recipe"}
                        </span>

                        <h3>
                            <a href="recipe.html?id=${recipe.id}">
                                ${recipe.title}
                            </a>
                        </h3>

                        <p>${recipe.description || ""}</p>

                        <div class="explore-recipe-meta">
                            <span>
                                <i class="fa-regular fa-clock"></i>
                                ${totalTime} min
                            </span>
                            <span>${recipe.difficulty || ""}</span>
                        </div>

                        <a href="recipe.html?id=${recipe.id}"
                           class="button button-outline recipe-view-button">
                            View Recipe →
                        </a>
                    </div>
                </article>
            `;
        }).join("");

        if (favoritesCount) {
            favoritesCount.textContent =
                `${favoriteRecipes.length} saved recipes`;
        }

        if (favoritesEmpty) {
            favoritesEmpty.hidden = favoriteRecipes.length > 0;
        }
    }

    renderFavorites();

    // Bấm trái tim để bỏ yêu thích
    favoritesGrid.addEventListener("click", function (event) {
        const button = event.target.closest(".favorite-button");

        if (!button) return;

        const recipeId = String(button.dataset.recipeId);
        const updatedIds = getFavoriteIds().filter(
            id => id !== recipeId
        );

        localStorage.setItem(
            FAVORITES_KEY,
            JSON.stringify(updatedIds)
        );

        // Cập nhật lại danh sách và số lượng
        favoriteIds.splice(0, favoriteIds.length, ...updatedIds);
        renderFavorites();
    });
});
