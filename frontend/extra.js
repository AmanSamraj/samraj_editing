const imageInput = document.getElementById("import_image");
const preview = document.getElementById("image_preview");

if (!imageInput || !preview) {
    console.error("Image input or preview element was not found. Check the IDs in index.html.");
} else {
    imageInput.addEventListener("change", function () {
        const file = imageInput.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            preview.textContent = "Please choose an image file.";
            imageInput.value = "";
            return;
        }

        const image = document.createElement("img");
        image.alt = file.name;
        image.style.width = "90%";
        image.style.height = "90%";
        image.style.objectFit = "contain";

        const objectUrl = URL.createObjectURL(file);
        image.onload = function () {
            URL.revokeObjectURL(objectUrl);
        };
        image.onerror = function () {
            URL.revokeObjectURL(objectUrl);
            preview.textContent = "Image could not be loaded.";
        };
        image.src = objectUrl;

        preview.replaceChildren(image);
    });
}
