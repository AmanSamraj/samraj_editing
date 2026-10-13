const imageInput = document.getElementById("import_image");
const image_preview = document.getElementById("image_preview");
const grayscaleButton = document.getElementById("grayscale");
const cropButton = document.getElementById("crop");


let selectedFile = null;

imageInput.addEventListener("change", function() {

    const file = this.files[0];

    if(file){

        selectedFile = file;

        showImage(file);

    }
    else{

        console.log("no image selected");

    }

});

function showImage(source) {

    const image = document.createElement("img");

    image.src = source instanceof Blob ? URL.createObjectURL(source) : source;

    image.style.margin = "2%";
    image.style.width = "96%";
    image.style.height = "96%";
    image.style.objectFit = "contain";

    image_preview.replaceChildren(image);
}


    //grayscale

    grayscaleButton.addEventListener("click",async function (){
        if(!selectedFile){
            alert("Select image to proceed");
            return;
        }


    // send  image to flask

    const formData = new FormData();
    formData.append("image",selectedFile);

    try{
        const  response = await fetch(
            "http://127.0.0.1:5500/process-image?operation=grayscale",
            {
                method:"POST",
                body:formData
            }
        );


    if(!response.ok){
        throw  new Error("server error");
    }

    // flask  se  processed  image receive
    const blob = await response.blob();

    //blob ko image  url  me  change  karta hai 
    const processedImageURL = URL.createObjectURL(blob);
        // show processed  image
    showImage(processedImageURL);

    } catch(error) {
        console.error(error);
        alert("image did not  processed  from backend")
    }    
    
})


// let cropImage = null;
// let cropCanvas = null;
// let cropContext = null;

// let startX = 0;
// let startY = 0;
// let endX = 0;
// let endY =0;

// let  isDrawing = false;

// cropButton.addEventListener("click",function (){
//    if(!selectedFile){
//     console.error("Please upload  image");
//    }
//    else {
//     reader = new FileReader();
//     reader.onload() = function(event){
//         cropImage = newImage();
//         cropImage.onload = function (){
//             cropCanvas = document.createElement("canvas")
//             cropCanvas.id = cropCanvas;

//             // width , height 
//             cropCanvas.width = cropImage.naturalWidth;
//             cropCanvas.height = cropImage.naturalHeight;

//             cropContext = cropContext.getContext("2d");
//             {
//                 cropCanvas,0,0
//             }
//             image_preview.innerHTML = "";
//             image_preview.appendChild("cropCanvas");

//             drawCropRectangle();

//             const actions = document.createElement("div")
//             actions.className = "crop_action"
//             const applyButton = document.createElement("button")
//             applyButton.textContent = "Apply"
//             applyButton.addEventListener(
//                 "click" , applyCrop
//             );
//             actions.appendChild("applyButton")
//             image_preview.appendChild("actions")
//         };
//         cropImage.src = event.target.source
//     };
//     reader.readAsDataURL(selectedFile)
//    }
// })



















let cropCanvas = null;
let cropContext = null;
let cropImage = null;

let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

let  isDrawing = false;

// crop 

cropButton.addEventListener("click",function(){
    if(!selectedFile){
        alert("please select  image ");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event){
        cropImage = new Image();
        cropImage.onload = function(){
            cropCanvas =  document.createElement("canvas");
            cropCanvas.id = "crop_canvas";

            //original image dimension
            cropCanvas.width = cropImage.naturalWidth;
            cropCanvas.height = cropImage.naturalHeight;

            cropContext = cropCanvas.getContext("2d");

            cropContext.drawImage(
                cropImage,
                0,0
            );
             image_preview.innerHTML = "";

            image_preview.appendChild(cropCanvas);

            drawCropRectangle();

            // Apply Crop button
            const actions = document.createElement("div");//yahan element  div  ke  jagah  par  koi   bhi  atttribute  likhkar  create  kar  sakte  the 

            actions.className = "crop_actions";

            const applyButton = document.createElement("button");

            applyButton.textContent = "APPLY CROP";

            applyButton.addEventListener(
                "click",
                applyCrop
            );

            actions.appendChild(applyButton);

            image_preview.appendChild(actions);
        };

        cropImage.src = event.target.result;
    };

    reader.readAsDataURL(selectedFile);
});


// ==========================
// DRAW RECTANGLE
// ==========================

// 🟢 NEW
cropCanvas = null;

function drawCropRectangle() {

    cropCanvas.addEventListener("pointerdown", function (event) {

        const rect = cropCanvas.getBoundingClientRect();

        const scaleX = cropCanvas.width / rect.width;
        const scaleY = cropCanvas.height / rect.height;

        startX = (event.clientX - rect.left) * scaleX;
        startY = (event.clientY - rect.top) * scaleY;

        endX = startX;
        endY = startY;

        isDrawing = true;

        cropCanvas.setPointerCapture(event.pointerId);
    });


    cropCanvas.addEventListener("pointermove", function (event) {

        if (!isDrawing) return;

        const rect = cropCanvas.getBoundingClientRect();

        const scaleX = cropCanvas.width / rect.width;
        const scaleY = cropCanvas.height / rect.height;

        endX = (event.clientX - rect.left) * scaleX;
        endY = (event.clientY - rect.top) * scaleY;

        // Restore original image before redrawing rectangle
        cropContext.drawImage(
            cropImage,
            0,
            0
        );

        // 🟢 NEW: Draw selection rectangle
        cropContext.strokeStyle = "red";
        cropContext.lineWidth = Math.max(
            2,
            cropCanvas.width / 500
        );

        cropContext.strokeRect(
            startX,
            startY,
            endX - startX,
            endY - startY
        );
    });


    cropCanvas.addEventListener("pointerup", function () {

        isDrawing = false;
    });
}


// ==========================
// SEND CROP TO FLASK
// ==========================

async function applyCrop() {

    const x = Math.round(Math.min(startX, endX));
    const y = Math.round(Math.min(startY, endY));

    const width = Math.round(Math.abs(endX - startX));
    const height = Math.round(Math.abs(endY - startY));

    if (width < 1 || height < 1) {
        alert("Pehle image par rectangle draw karo");
        return;
    }

    const formData = new FormData();

    formData.append("image", selectedFile);

    try {

        const response = await fetch(
            `http://127.0.0.1:5500/process-image?operation=crop&x=${x}&y=${y}&width=${width}&height=${height}`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Crop failed");
        }

        const blob = await response.blob();

        const croppedURL = URL.createObjectURL(blob);

        // Display the cropped result
        showImage(croppedURL);

    } catch (error) {

        console.error(error);

        alert("Crop processing failed");
    }
}







//  NEW — SAVE button select karo
const saveButton = document.querySelector(".save");

// 🟢 NEW — Button click event
saveButton.addEventListener("click", function () {
    const previewImage = document.querySelector("#image_preview img");

    // 🟢 NEW — Check karo image preview mein hai ya nahi
    if (!previewImage || !previewImage.src) {
        alert("Pehle image upload karo!");
        return;
    }

    // 🟢 NEW — Image load hone ke baad download karo
    if (!previewImage.complete || previewImage.naturalWidth === 0) {
        alert("Image abhi load ho rahi hai. Dobara SAVE click karo.");
        return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = previewImage.src;
    downloadLink.download = "samraj-editor-image.jpg";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    console.log("Save button clicked");
});
