/* ========================================
   1. GET HTML ELEMENTS
======================================== */
const recipeGrid = document.getElementById("explore-recipe-grid");
const recipeCount = document.getElementById("recipe-count");
const noRecipes = document.getElementById("no-recipes");

// Các element phục vụ Tìm kiếm & Lọc (Search & Filter)
const searchForm = document.querySelector(".explore-search");
const searchInput = document.getElementById("recipe-search");
const categoryFilter = document.getElementById("category-filter");
const timeFilter = document.getElementById("time-filter");
const difficultyFilter = document.getElementById("difficulty-filter");
const resetFiltersBtn = document.getElementById("reset-filters");

/* ========================================
   2. CREATE RECIPE CARD
======================================== */
function createRecipeCard(recipe) {
    const totalTime = getTotalTime(recipe);
    // Lấy loại món ăn, nếu không có thì để mặc định
    const category = recipe.mealType || "Recipe";

    return `
        <article class="explore-recipe-card" data-recipe-id="${recipe.id}">
            <a href="recipe.html?id=${recipe.id}" class="explore-recipe-image">
                <img src="${recipe.image}" alt="${recipe.title}" loading="lazy">
            </a>
            
            <!-- Nút Favorites: Dành cho phần việc của bạn bạn -->
            <button class="favorite-button" type="button" aria-label="Add ${recipe.title} to favorites" data-recipe-id="${recipe.id}">
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
                <a href="recipe.html?id=${recipe.id}" class="button button-outline recipe-view-button">
                    View Recipe
                    <span aria-hidden="true"> </span>
                </a>
            </div>
        </article>
    `;
}

/* ========================================
   3. DISPLAY RECIPES
======================================== */
function renderRecipes(recipeList) {
    // Vẽ lại HTML từ danh sách truyền vào
    recipeGrid.innerHTML = recipeList.map(recipe => createRecipeCard(recipe)).join("");
    
    // Cập nhật số lượng
    recipeCount.textContent = `${recipeList.length} recipes`;
    
    // Hiện thông báo nếu không có kết quả nào
    if (recipeList.length === 0) {
        recipeGrid.hidden = true;
        noRecipes.hidden = false;
    } else {
        recipeGrid.hidden = false;
        noRecipes.hidden = true;
    }
}

/* ========================================
   4. TÍNH NĂNG TÌM KIẾM VÀ LỌC (CỦA BẠN)
======================================== */
function applyFilters() {
    // 1. Lấy giá trị từ các input
    const searchTerm = searchInput.value.toLowerCase().trim();
    const categoryVal = categoryFilter.value.toLowerCase();
    const timeVal = timeFilter.value;
    const difficultyVal = difficultyFilter.value.toLowerCase();

    // 2. Dùng hàm .filter() để tạo mảng mới, KHÔNG LÀM HỎNG mảng 'recipes' gốc
    const filteredRecipes = recipes.filter(recipe => {
        // Lọc theo tên món ăn (Search)
        const matchSearch = recipe.title.toLowerCase().includes(searchTerm);

        // Lọc theo Danh mục (có thể nằm ở mealType hoặc tags như Healthy)
        let matchCategory = true;
        if (categoryVal !== "all") {
            const isMealType = recipe.mealType && recipe.mealType.toLowerCase() === categoryVal;
            const isTag = recipe.tags && recipe.tags.some(tag => tag.toLowerCase() === categoryVal);
            matchCategory = isMealType || isTag;
        }

        // Lọc theo Thời gian nấu (Time)
        let matchTime = true;
        if (timeVal !== "all") {
            const totalTime = getTotalTime(recipe);
            matchTime = totalTime <= parseInt(timeVal);
        }

        // Lọc theo Độ khó (Difficulty)
        let matchDifficulty = true;
        if (difficultyVal !== "all") {
            matchDifficulty = recipe.difficulty && recipe.difficulty.toLowerCase() === difficultyVal;
        }

        // Phải thoả mãn TẤT CẢ các điều kiện lọc (AND logic)
        return matchSearch && matchCategory && matchTime && matchDifficulty;
    });

    // 3. Render lại danh sách đã lọc
    renderRecipes(filteredRecipes);
}

// Hàm Reset bộ lọc khi bấm "Show All Recipes"
function resetFilters() {
    searchInput.value = "";
    categoryFilter.value = "all";
    timeFilter.value = "all";
    difficultyFilter.value = "all";
    
    renderRecipes(recipes); // Trả lại danh sách gốc ban đầu
}

/* ========================================
   5. CÀI ĐẶT LẮNG NGHE SỰ KIỆN (EVENT LISTENERS)
======================================== */
function setupEventListeners() {
    // Ngăn trang bị reload khi nhấn Enter trong ô Search
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            applyFilters();
        });
    }

    // Lọc realtime ngay khi user gõ phím
    searchInput.addEventListener("input", applyFilters);

    // Bắt sự kiện khi user thay đổi dropdown (Select)
    categoryFilter.addEventListener("change", applyFilters);
    timeFilter.addEventListener("change", applyFilters);
    difficultyFilter.addEventListener("change", applyFilters);

    // Bắt sự kiện nút Reset
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", resetFilters);
    }
}

/* ========================================
   6. START
======================================== */
async function initExplore() {
    // Tải dữ liệu từ recipes.js
    const recipeList = await loadRecipes();
    
    // Render lần đầu
    renderRecipes(recipeList);
    
    // Kích hoạt các bộ lọc
    setupEventListeners();
}

initExplore();