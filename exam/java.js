var image = document.getElementById("image");
var displaying = document.getElementById("shift");

image.addEventListener("mouseenter", function() {
    displaying.style.display = "block";
});

image.addEventListener("mouseleave", function() {
    displaying.style.display = "none";
});