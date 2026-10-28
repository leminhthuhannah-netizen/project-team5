/* ========================================
   1. GET HTML ELEMENTS
======================================== */
const recipeGrid = document.getElementById("explore-recipe-grid");
const recipeCount = document.getElementById("recipe-count");
const noRecipes = document.getElementById("no-recipes");

// Các element của thanh tìm kiếm và bộ lọc
const searchForm = document.querySelector(".explore-search");
const searchInput = document.getElementById("recipe-search");
const categoryFilter = document.getElementById("category-filter");
const timeFilter = document.getElementById("time-filter");
const difficultyFilter = document.getElementById("difficulty-filter");
const resetFiltersBtn = document.getElementById("reset-filters");

// Biến lưu trữ toàn bộ dữ liệu công thức ban đầu
let allRecipesList = [];

/* ========================================
   2. CREATE RECIPE CARD
======================================== */
function createRecipeCard(recipe) {
    const totalTime = getTotalTime(recipe);
    // Lấy loại món ăn làm danh mục hiển thị
    const category = recipe.mealType || "Recipe";

    return `
        <article class="explore-recipe-card" data-recipe-id="${recipe.id}">
            <a href="recipe.html?id=${recipe.id}" class="explore-recipe-image">
                <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
            </a>
            <button class="favorite-button" type="button" aria-label="Add ${recipe.title} to favorites" data-recipe-id="${recipe.id}">
                <i class="fa-regular fa-heart"></i>
            </button>
            <div class="explore-recipe-info">
                <span class="recipe-category">${category}</span>
                <h3>
                    <a href="recipe.html?id=${recipe.id}">${recipe.title}</a>
                </h3>
                <p>${recipe.description}</p>
                <div class="explore-recipe-meta">
                    <span>
                        <i class="fa-regular fa-clock"></i>
                        ${totalTime} min
                    </span>
                    <span>${recipe.difficulty}</span>
                </div>
                <a href="recipe.html?id=${recipe.id}" class="button button-outline recipe-view-button">
                    View Recipe
                    <span aria-hidden="true"></span>
                </a>
            </div>
        </article>
    `;
}

/* ========================================
   3. DISPLAY RECIPES
======================================== */
function renderRecipes(recipeList) {
    // Đổ dữ liệu HTML vào Grid
    recipeGrid.innerHTML = recipeList.map(recipe => createRecipeCard(recipe)).join("");
    
    // Cập nhật số lượng
    recipeCount.textContent = `${recipeList.length} recipes`;
    
    // Hiển thị thông báo nếu không có kết quả
    noRecipes.hidden = recipeList.length > 0;
}

/* ========================================
   4. FILTER LOGIC
======================================== */
function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryValue = categoryFilter.value.toLowerCase();
    const timeValue = timeFilter.value;
    const difficultyValue = difficultyFilter.value.toLowerCase();

    const filtered = allRecipesList.filter(recipe => {
        // 1. Kiểm tra từ khóa tìm kiếm (so khớp với tiêu đề)
        const matchSearch = recipe.title.toLowerCase().includes(searchTerm);

        // 2. Kiểm tra danh mục (mealType hoặc tags, ví dụ: 'Healthy')
        const recipeCategory = (recipe.mealType || "").toLowerCase();
        const matchCategory = categoryValue === "all" || 
                              recipeCategory === categoryValue || 
                              (recipe.tags && recipe.tags.some(tag => tag.toLowerCase() === categoryValue));

        // 3. Kiểm tra thời gian
        const totalTime = getTotalTime(recipe);
        const matchTime = timeValue === "all" || totalTime <= parseInt(timeValue);

        // 4. Kiểm tra độ khó
        const matchDifficulty = difficultyValue === "all" || (recipe.difficulty || "").toLowerCase() === difficultyValue;

        // Trả về true nếu thỏa mãn mọi điều kiện
        return matchSearch && matchCategory && matchTime && matchDifficulty;
    });

    renderRecipes(filtered);
}

/* ========================================
   5. URL PARAMETERS (Xử lý link từ Footer)
======================================== */
function applyUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const queryParams = params.get('q');
    const categoryParams = params.get('category');

    let shouldFilter = false;

    if (queryParams) {
        searchInput.value = queryParams;
        shouldFilter = true;
    }

    if (categoryParams) {
        // Cập nhật giá trị thẻ select
        categoryFilter.value = categoryParams.toLowerCase();
        shouldFilter = true;
    }

    if (shouldFilter) {
        filterRecipes();
    }
}

/* ========================================
   6. EVENT LISTENERS
======================================== */
function setupEventListeners() {
    // Ngăn chặn tải lại trang khi nhấn Enter trong ô tìm kiếm
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            filterRecipes();
        });
    }

    // Lọc realtime khi người dùng nhập chữ
    if (searchInput) searchInput.addEventListener("input", filterRecipes);

    // Lọc khi người dùng thay đổi select box
    if (categoryFilter) categoryFilter.addEventListener("change", filterRecipes);
    if (timeFilter) timeFilter.addEventListener("change", filterRecipes);
    if (difficultyFilter) difficultyFilter.addEventListener("change", filterRecipes);

    // Nút "Show All Recipes" khi không tìm thấy kết quả
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
            searchInput.value = "";
            categoryFilter.value = "all";
            timeFilter.value = "all";
            difficultyFilter.value = "all";
            filterRecipes();
        });
    }
}

/* ========================================
   7. LOAD RECIPES
======================================== */
async function initExplore() {
    allRecipesList = await loadRecipes(); // Gọi hàm từ recipes.js
    renderRecipes(allRecipesList);
    setupEventListeners();
    applyUrlParameters();
}

/* ========================================
   8. START
======================================== */
initExplore();