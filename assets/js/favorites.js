
document.addEventListener("DOMContentLoaded", function () {
    const favoritesGrid = document.getElementById("favorites-grid");

    if (!favoritesGrid) return;

    // Bấm vào trái tim để xóa món ăn
    favoritesGrid.addEventListener("click", function (event) {
        const heartButton = event.target.closest(".favorite-button");

        if (!heartButton) return;

        const recipeCard = heartButton.closest(".explore-recipe-card");

        if (!recipeCard) return;

        // Xóa món ăn khỏi giao diện
        recipeCard.remove();
    });
});
