
/* ========================================
   1. GET HTML ELEMENTS
======================================== */

const addRecipeButton = document.getElementById("add-recipe-button");

const emptyAddRecipeButton = document.getElementById(
    "empty-add-recipe-button"
);

const formSection = document.getElementById(
    "my-recipe-form-section"
);

const formTitle = document.getElementById("recipe-form-title");

const recipeForm = document.getElementById("my-recipe-form");

const cancelRecipeButton = document.getElementById(
    "cancel-recipe-button"
);

const discardRecipeButton = document.getElementById(
    "discard-recipe-button"
);


/* ========================================
   2. OPEN RECIPE FORM
======================================== */

function openRecipeForm() {
    // Show the form section
    formSection.hidden = false;

    // Set the form title
    formTitle.textContent = "Create a Recipe";

    // Scroll to the form
    formSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* Clear the form without closing it */
function clearRecipeForm() {
    recipeForm.reset();

    // Clear the ID used for editing
    document.getElementById("edit-recipe-id").value = "";

    // Reset the form title
    formTitle.textContent = "Create a Recipe";
}

/* Close the form */
function closeRecipeForm() {
    clearRecipeForm();
    formSection.hidden = true;
}

/* Button events */

// Add New Recipe
addRecipeButton.addEventListener("click", openRecipeForm);

// Create Your First Recipe
emptyAddRecipeButton.addEventListener("click", openRecipeForm);

// X button: clear and close
cancelRecipeButton.addEventListener("click", closeRecipeForm);

// Cancel button: clear only, keep form open
discardRecipeButton.addEventListener("click", clearRecipeForm);
