const USER_RECIPES_KEY = "savorlyUserRecipes";
const DEFAULT_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxOmzOrsnS-oDBAUh8wWQT_REql0peL_m96R4U3B63PQ&s=10";

/* ---------- Storage helpers ---------- */

function getUserRecipes() {
    try {
        const data = JSON.parse(localStorage.getItem(USER_RECIPES_KEY));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

function saveUserRecipes(recipes) {
    localStorage.setItem(USER_RECIPES_KEY, JSON.stringify(recipes));
}

// Để các file khác (explore.js, favorites.js...) có thể dùng
window.getUserRecipes = getUserRecipes;

/* ---------- Small helpers ---------- */

// Tách textarea thành từng dòng, bỏ dòng trống
function splitLines(text) {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");
}

function formatMinutes(minutes) {
    // Nếu dữ liệu đã là chữ (vd "25 minutes") thì giữ nguyên
    return typeof minutes === "number" ? `${minutes} min` : String(minutes);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

/* PART 1: ADD RECIPE PAGE */

function initAddRecipePage() {
    const form = document.getElementById("add-recipe-form");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData(form);

        const prepTime = Number(formData.get("prepTime")) || 0;
        const cookingTime = Number(formData.get("cookingTime")) || 0;

        const recipe = {
            id: "user-" + Date.now(),
            title: formData.get("title").trim(),
            description: formData.get("description").trim(),
            image: (formData.get("image") || "").trim() || DEFAULT_IMAGE,
            mealType: formData.get("mealType"),
            tags: formData.getAll("tags"),
            prepTime: prepTime,
            cookingTime: cookingTime,
            totalTime: prepTime + cookingTime,
            difficulty: formData.get("difficulty"),
            servings: Number(formData.get("servings")) || 1,
            ingredients: splitLines(formData.get("ingredients")),
            instructions: splitLines(formData.get("instructions")),
            tips: (formData.get("tips") || "").trim(),
            author: "You",
            isUserRecipe: true
        };

        const recipes = getUserRecipes();
        recipes.push(recipe);
        saveUserRecipes(recipes);

        // Chuyển sang trang xem công thức vừa tạo
        window.location.href = "recipe.html?id=" + encodeURIComponent(recipe.id);
    });
}
/* =========================================================
   PART 2: RECIPE DETAILS PAGE
   ========================================================= */

// Lấy giá trị đầu tiên có dữ liệu (không dùng toán tử ?? cho dễ tương thích)
function firstDefined() {
    for (let i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined && arguments[i] !== null) {
            return arguments[i];
        }
    }
    return 0;
}

// Đưa công thức từ recipes.js (tên trường có thể khác) về cùng một dạng
function normalizeRecipe(raw) {
    const prep = firstDefined(raw.prepTime, raw.prep_time, raw.prep);
    const cook = firstDefined(raw.cookingTime, raw.cookTime, raw.cooking_time, raw.time);

    let total = raw.totalTime;
    if (total === undefined || total === null) {
        total = (typeof prep === "number" && typeof cook === "number") ? prep + cook : cook;
    }

    return {
        id: String(raw.id),
        title: raw.title || raw.name || "Untitled recipe",
        description: raw.description || "",
        image: raw.image || raw.img || raw.imageUrl || DEFAULT_IMAGE,
        mealType: raw.mealType || raw.category || "",
        tags: raw.tags || [],
        prepTime: prep,
        cookingTime: cook,
        totalTime: total,
        difficulty: raw.difficulty || "",
        servings: Number(raw.servings) || 1,
        ingredients: raw.ingredients || [],
        instructions: raw.instructions || raw.steps || raw.directions || [],
        tips: raw.tips || raw.tip || "",
        author: raw.author || "Savorly Kitchen"
    };
}

// Gộp công thức có sẵn (recipes.js) + công thức người dùng thêm
async function getAllRecipes() {
    let builtIn = [];

    if (typeof loadRecipes === "function") {
        try {
            builtIn = await loadRecipes();
        } catch (error) {
            console.error("Could not load recipes:", error);
        }
    }

    return [...builtIn, ...getUserRecipes()].map(normalizeRecipe);
}

// Nhân số lượng đầu dòng: "200g pasta" x2 -> "400g pasta"
function scaleIngredient(text, ratio) {
    return text.replace(/^(\d+\s+\d\/\d|\d+\/\d+|\d*\.?\d+)/, function(match) {
        let value;

        if (/^\d+\s+\d\/\d$/.test(match)) {
            const [whole, fraction] = match.split(/\s+/);
            const [a, b] = fraction.split("/");
            value = Number(whole) + Number(a) / Number(b);
        } else if (match.includes("/")) {
            const [a, b] = match.split("/");
            value = Number(a) / Number(b);
        } else {
            value = Number(match);
        }

        const scaled = Math.round(value * ratio * 100) / 100;
        return String(scaled);
    });
}

// Lấy giá trị của trường đầu tiên có trong object (không có thì trả về undefined)
function pickField(obj, keys) {
    for (let i = 0; i < keys.length; i++) {
        const value = obj[keys[i]];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return undefined;
}

// 2.5 -> "2.5", 3 -> "3", 0.3333 -> "0.33"
function formatAmount(value) {
    return String(Math.round(value * 100) / 100);
}

// Biến 1 nguyên liệu (chuỗi hoặc object) thành chữ đã nhân theo khẩu phần
function getIngredientText(ingredient, ratio) {
    // Nguyên liệu dạng chữ: "200g pasta"
    if (typeof ingredient === "string") {
        return scaleIngredient(ingredient, ratio);
    }

    // Nguyên liệu dạng object: { name, amount, unit }
    const name = pickField(ingredient, ["name", "item", "ingredient", "title"]) || "";
    const amount = pickField(ingredient, ["amount", "quantity", "qty"]);
    const unit = pickField(ingredient, ["unit", "units"]) || "";
    const note = pickField(ingredient, ["note", "notes"]) || "";

    let amountText = "";

    if (amount !== undefined) {
        const number = Number(amount);

        if (typeof amount === "number" || (!isNaN(number) && String(amount).trim() !== "")) {
            amountText = formatAmount(number * ratio);
        } else {
            // vd "1/2" hoặc "a pinch"
            amountText = scaleIngredient(String(amount), ratio);
        }
    }

    let text = [amountText, unit, name].filter(Boolean).join(" ");
    if (note) text += ` (${note})`;

    return text;
}

function renderIngredients(recipe, currentServings) {
    const list = document.getElementById("recipe-ingredients");
    if (!list) return;

    const ratio = currentServings / (Number(recipe.servings) || 1);
    list.innerHTML = "";

    recipe.ingredients.forEach(function(ingredient) {
        const item = document.createElement("li");
        item.className = "ingredient-item";

        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";

        const text = document.createElement("span");
        text.textContent = getIngredientText(ingredient, ratio);

        label.append(checkbox, text);
        item.appendChild(label);
        list.appendChild(item);
    });
}

function renderInstructions(recipe) {
    const container = document.getElementById("recipe-instructions");
    if (!container) return;

    container.innerHTML = "";

    recipe.instructions.forEach(function(step, index) {
        // Hỗ trợ cả chuỗi và object { title, text }
        const stepTitle =
            typeof step === "object" && step.title ? step.title : `Step ${index + 1}`;
        const stepText = typeof step === "object" ? step.text || "" : String(step);

        const article = document.createElement("article");
        article.className = "instruction-step";

        const number = document.createElement("div");
        number.className = "instruction-step-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const content = document.createElement("div");
        content.className = "instruction-step-content";

        const heading = document.createElement("h3");
        heading.textContent = stepTitle;

        const paragraph = document.createElement("p");
        paragraph.textContent = stepText;

        content.append(heading, paragraph);
        article.append(number, content);
        container.appendChild(article);
    });
}

function renderCategories(recipe) {
    const container = document.getElementById("recipe-categories");
    if (!container) return;

    const names = [recipe.mealType, ...(recipe.tags || [])].filter(Boolean);
    container.innerHTML = "";

    // bỏ trùng lặp
    [...new Set(names)].forEach(function(name) {
        const span = document.createElement("span");
        span.className = "recipe-category";
        span.textContent = name;
        container.appendChild(span);
    });
}

function renderRelatedRecipes(allRecipes, currentId) {
    const grid = document.getElementById("related-recipes-grid");
    if (!grid) return;

    const others = allRecipes
        .filter((recipe) => recipe.id !== currentId)
        .slice(0, 3);

    if (others.length === 0) return; // giữ nguyên các thẻ mẫu

    grid.innerHTML = "";

    others.forEach(function(recipe) {
        const href = "recipe.html?id=" + encodeURIComponent(recipe.id);

        const card = document.createElement("article");
        card.className = "related-recipe-card";

        const imageLink = document.createElement("a");
        imageLink.href = href;
        imageLink.className = "related-recipe-image";
        const img = document.createElement("img");
        img.src = recipe.image || DEFAULT_IMAGE;
        img.alt = recipe.title;
        imageLink.appendChild(img);

        const content = document.createElement("div");
        content.className = "related-recipe-content";

        const category = document.createElement("span");
        category.className = "related-recipe-category";
        category.textContent = recipe.mealType || "Recipe";

        const title = document.createElement("h3");
        const titleLink = document.createElement("a");
        titleLink.href = href;
        titleLink.textContent = recipe.title;
        title.appendChild(titleLink);

        const meta = document.createElement("div");
        meta.className = "related-recipe-meta";
        const time = document.createElement("span");
        time.innerHTML = '<i class="fa-regular fa-clock"></i> ';
        time.append(formatMinutes(recipe.totalTime));
        const difficulty = document.createElement("span");
        difficulty.textContent = recipe.difficulty || "";
        meta.append(time, difficulty);

        content.append(category, title, meta);
        card.append(imageLink, content);
        grid.appendChild(card);
    });
}

function showRecipeNotFound() {
    const notFound = document.getElementById("recipe-not-found");
    if (!notFound) return;

    document
        .querySelectorAll(
            ".recipe-hero, .recipe-overview, .recipe-details, .recipe-tips, .related-recipes"
        )
        .forEach(function(section) {
            section.hidden = true;
        });

    notFound.hidden = false;
}

async function initRecipePage() {
    // Chỉ chạy trên recipe.html
    if (!document.getElementById("recipe-title")) return;

    const id = new URLSearchParams(window.location.search).get("id");

    // Không có ?id= thì giữ nội dung mẫu trong HTML
    if (!id) return;

    const allRecipes = await getAllRecipes();
    const recipe = allRecipes.find((item) => item.id === id);

    if (!recipe) {
        showRecipeNotFound();
        return;
    }

    document.title = `${recipe.title} | Savorly`;

    // Ảnh, tiêu đề, mô tả, tác giả
    const image = document.getElementById("recipe-image");
    if (image) {
        image.src = recipe.image || DEFAULT_IMAGE;
        image.alt = recipe.title;
        image.onerror = function() {
            image.onerror = null;
            image.src = DEFAULT_IMAGE;
        };
    }

    setText("recipe-title", recipe.title);
    setText("recipe-description", recipe.description || "");
    setText("recipe-author", recipe.author || "Savorly Kitchen");

    renderCategories(recipe);

    // Thông tin nhanh
    setText("recipe-prep-time", formatMinutes(recipe.prepTime));
    setText("recipe-cooking-time", formatMinutes(recipe.cookingTime));
    setText("recipe-total-time", formatMinutes(recipe.totalTime));
    setText("recipe-difficulty", recipe.difficulty || "");

    const baseServings = recipe.servings;
    setText(
        "recipe-servings",
        `${baseServings} ${baseServings === 1 ? "person" : "people"}`
    );

    // Nguyên liệu + nút chỉnh khẩu phần
    let currentServings = baseServings;
    setText("servings-current", currentServings);
    renderIngredients(recipe, currentServings);

    const decrease = document.getElementById("servings-decrease");
    const increase = document.getElementById("servings-increase");

    if (decrease) {
        decrease.addEventListener("click", function() {
            if (currentServings > 1) {
                currentServings--;
                setText("servings-current", currentServings);
                renderIngredients(recipe, currentServings);
            }
        });
    }

    if (increase) {
        increase.addEventListener("click", function() {
            if (currentServings < 20) {
                currentServings++;
                setText("servings-current", currentServings);
                renderIngredients(recipe, currentServings);
            }
        });
    }

    // Các bước nấu
    renderInstructions(recipe);

    // Mẹo nấu ăn (ẩn nếu không có)
    const tipsSection = document.getElementById("recipe-tips-section");
    if (recipe.tips) {
        setText("recipe-tips", recipe.tips);
    } else if (tipsSection) {
        tipsSection.hidden = true;
    }

    // Công thức liên quan
    renderRelatedRecipes(allRecipes, recipe.id);

    // Nút chia sẻ: sao chép link
    const shareButton = document.getElementById("recipe-share-button");
    if (shareButton && navigator.clipboard) {
        shareButton.addEventListener("click", function() {
            navigator.clipboard.writeText(window.location.href).then(function() {
                const original = shareButton.innerHTML;
                shareButton.textContent = "Link copied!";
                setTimeout(function() {
                    shareButton.innerHTML = original;
                }, 1500);
            });
        });
    }
}

/* ---------- Start ---------- */

document.addEventListener("DOMContentLoaded", function() {
    initAddRecipePage();
    initRecipePage();
});