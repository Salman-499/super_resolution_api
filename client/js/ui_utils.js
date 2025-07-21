
function openDashboard() {
  location.reload();
}

function openResults() {
  let html = document.getElementById("sidebar");
  html.innerHTML =  `<h3 class='fw-bold py-3 border-bottom border-2'><center>Results<center></h3>
  <p class='fw-bold ps-1'>Coordinates [Lon, Lat]:</p>
  <select id='select-location' class='form-select mb-2' onmousedown='if(this.options.length>5){this.size=5;}'  onchange='this.size=0;' onblur='this.size=0;'></select>`;
  
  let selectedValue = [70.06147101184834, 31.38360019224729];
  let select = document.getElementById('select-location');
  let option = document.createElement('option');
  option.value = JSON.stringify([70.06147101184834, 31.38360019224729]);
  option.text = JSON.stringify([70.06147101184834, 31.38360019224729]);
  select.appendChild(option);
  let option2 = document.createElement('option');
  option2.value = JSON.stringify([71.20992756451624, 33.89064217605153]);
  option2.text = JSON.stringify([71.20992756451624, 33.89064217605153]);
  select.appendChild(option2);
  html.innerHTML +=   `<button class='btn btn-primary w-100 mt-2' onclick='showImage("./img/results/norm-res.jpg")'>Show Pre-Fire</button>
  <button class='btn btn-primary w-100 mt-2' onclick='showImage("./img/results/super-res.jpg")'>Show Post-Fire</button>
  <button class='btn btn-primary w-100 mt-2' onclick='clusterOverlay(${selectedValue})'>Show Clustering</button>
  <p class='fw-bold ps-1 mt-3'>Original Image:</p>
  <center><img class='sat-img' src='./img/results/norm-res.jpg' onclick='showImage("./img/results/norm-res.jpg")' height='400rem'></center>
  <p class='fw-bold ps-1 mt-2'>Processed Image:</p>
  <center><img class='sat-img' src='./img/results/super-res.jpg' onclick='showImage("./img/results/super-res.jpg")' height='400rem'></center>`;
  
  document.getElementById('select-location').addEventListener('change', function() {
    selectedValue = JSON.parse(this.value); // Parse the value to convert it back to an array
    CenterMap(selectedValue[0], selectedValue[1], 12); // Call CenterMap with the new selected value
    console.log("hi")
  });
  
  CenterMap(selectedValue[0], selectedValue[1], 12);
}

function showImage(imageUrl) {
  const modal = new bootstrap.Modal(document.getElementById('imageModal'), {
    keyboard: true
  });
  const modalImage = document.getElementById('modalImage');
  modalImage.src = imageUrl;
  modal.show();

  // Call imageZoom after the image has loaded
  modalImage.onload = function() {
    imageZoom("modalImage", "zoomResult");
  };
}

function imageZoom(imgID, resultID) {
  var img, lens, result, cx, cy;
  img = document.getElementById(imgID);
  result = document.getElementById(resultID);
  /* Create lens: */
  lens = document.createElement("DIV");
  lens.setAttribute("class", "img-zoom-lens");
  /* Insert lens: */
  img.parentElement.insertBefore(lens, img);
  /* Calculate the ratio between result DIV and lens: */
  cx = result.offsetWidth / lens.offsetWidth;
  cy = result.offsetHeight / lens.offsetHeight;
  /* Set background properties for the result DIV */
  result.style.backgroundImage = "url('" + img.src + "')";
  result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
  /* Execute a function when someone moves the cursor over the image, or the lens: */
  lens.addEventListener("mousemove", moveLens);
  img.addEventListener("mousemove", moveLens);
  /* And also for touch screens: */
  lens.addEventListener("touchmove", moveLens);
  img.addEventListener("touchmove", moveLens);
  function moveLens(e) {
    var pos, x, y;
    /* Prevent any other actions that may occur when moving over the image */
    e.preventDefault();
    /* Get the cursor's x and y positions: */
    pos = getCursorPos(e);
    /* Calculate the position of the lens: */
    x = pos.x - (lens.offsetWidth / 5);
    y = pos.y - (lens.offsetHeight / 5);
    /* Prevent the lens from being positioned outside the image: */
    if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
    if (y < 0) {y = 0;}
    /* Set the position of the lens: */
    lens.style.left = x + "px";
    lens.style.top = y + "px";
    /* Display what the lens "sees": */
    result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
  }
  function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /* Get the x and y positions of the image: */
    a = img.getBoundingClientRect();
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /* Consider any page scrolling: */
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return {x : x, y : y};
  }
}