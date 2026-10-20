// const removeBg = document.getElementById("remove")
// const replaceBg = document.getElementById("replace")
// const addBg = document.getElementById("add")
// const background = document.getElementById("background")//isko baad  me  karenge

// const image = document.querySelector("#import_image img")
// removeBg.addEventListener( "click",  () => {
//     if(!selectedFile){
//         alert("select image")
//     }
//     try{
//         const formdata = new new FormData();
//         formdata.append("image")

//         const bg_removed_image = document.createElement("div")//background  removed image  ko access  karega
        
//     }
//     catch{
//         alert("Image not sent in backend")
//     }
// })


const removeBg = document.getElementById("remove");
const addBg = document.getElementById("add");
const replaceBg = document.getElementById("replace");

const backgroundColor = document.getElementById("background_color");
const backgroundImageInput = document.getElementById("background_image");
const preview = document.getElementById("image_preview");

// AI se mila transparent subject
let transparentSubjectBlob = null;

// Kya background pehle se apply ho chuka hai?
let hasBackground = false;

// Selected custom background image
let backgroundImageFile = null;

// Custom background image select karna
backgroundImageInput.addEventListener("change", function () {
    backgroundImageFile = this.files[0] || null;
});

// Color select karne par custom image selection clear karna
backgroundColor.addEventListener("input", function () {
    backgroundImageFile = null;
    backgroundImageInput.value = "";
});

// Image preview helper
function showBackgroundResult(blob) {
    const imageURL = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = function () {
        preview.replaceChildren(img);

        img.style.width = "96%";
        img.style.height = "96%";
        img.style.margin = "2%";
        img.style.objectFit = "contain";

        URL.revokeObjectURL(imageURL);
    };

    img.onerror = function () {
        URL.revokeObjectURL(imageURL);
        alert("Image preview failed.");
    };

    img.src = imageURL;
}


// =====================================
// 1. REMOVE BACKGROUND
// =====================================

removeBg.addEventListener("click", async function () {

    if (!selectedFile) {
        alert("Please upload an image first.");
        return;
    }

    removeBg.disabled = true;

    try {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const response = await fetch(
            "http://127.0.0.1:5501/remove-background",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
    const errorText = await response.text();

    console.error("Flask response:", response.status, errorText);

    throw new Error(
        `Background removal failed: ${response.status}`
    );
}

        const blob = await response.blob();

        if (blob.type !== "image/png") {
            throw new Error("Server did not return a PNG.");
        }

        // Transparent subject ko save karke rakho
        transparentSubjectBlob = blob;
        hasBackground = false;

        // Selected background image reset
        backgroundImageFile = null;
        backgroundImageInput.value = "";

        showBackgroundResult(transparentSubjectBlob);

        alert("Background removed successfully!");

    } catch (error) {
       console.error("Remove background error:", error);
       alert(error.message);
    } finally {
       removeBg.disabled = false;
    }
});


// =====================================
// 2. ADD BACKGROUND
// =====================================

addBg.addEventListener("click", async function () {

    if (!transparentSubjectBlob) {
        alert("First click REMOVE BACKGROUND.");
        return;
    }

    if (hasBackground) {
        alert("Background already exists. Use REPLACE BACKGROUND.");
        return;
    }

    await applyNewBackground();
});


// =====================================
// 3. REPLACE BACKGROUND
// =====================================

replaceBg.addEventListener("click", async function () {

    if (!transparentSubjectBlob) {
        alert("First click REMOVE BACKGROUND.");
        return;
    }

    if (!hasBackground) {
        alert("No background exists yet. Use ADD BACKGROUND.");
        return;
    }

    await applyNewBackground();
});


// =====================================
// COMMON BACKGROUND COMPOSITION
// =====================================

async function applyNewBackground() {

    let subject = null;
    let backgroundBitmap = null;

    try {
        subject = await createImageBitmap(transparentSubjectBlob);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = subject.width;
        canvas.height = subject.height;

        if (backgroundImageFile) {

            backgroundBitmap = await createImageBitmap(
                backgroundImageFile
            );

            // Background ko canvas cover karne ke liye scale karo
            const scale = Math.max(
                canvas.width / backgroundBitmap.width,
                canvas.height / backgroundBitmap.height
            );

            const width = backgroundBitmap.width * scale;
            const height = backgroundBitmap.height * scale;

            ctx.drawImage(
                backgroundBitmap,
                (canvas.width - width) / 2,
                (canvas.height - height) / 2,
                width,
                height
            );

        } else {

            // Solid color background
            ctx.fillStyle = backgroundColor.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Transparent subject ko background ke upar draw karo
        ctx.drawImage(subject, 0, 0);

        const finalBlob = await new Promise((resolve, reject) => {
            canvas.toBlob(function (blob) {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Could not export image."));
                }
            }, "image/png");
        });

        hasBackground = true;

        // Final composite preview
        showBackgroundResult(finalBlob);

    } catch (error) {
        console.error(error);
        alert("Could not apply background.");
    } finally {
        if (subject) subject.close();
        if (backgroundBitmap) backgroundBitmap.close();
    }
}


