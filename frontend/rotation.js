const rotateButton = document.getElementById("rotate");
const rotateControl =document.getElementById("rotateControl");
const rotateLeft = document.getElementById("rotateLeft");
const rotateRight = document.getElementById("rotateRight");


//ROTATION 
let rotationAngle = 0;
rotate.addEventListener("click",function(){
    if(!image_preview.querySelector("img")){
        alert("please  select  image")
        return;
    }
    rotation.hidden = !rotation.hidden

});

// rotation left
rotateLeft.addEventListener("click",function(){
    rotationAngle = 90;
    rotateImage(rotationAngle);
})

rotateRight.addEventListener("click",function(){
    rotationAngle = -90;
    rotateImage(rotationAngle);
})



