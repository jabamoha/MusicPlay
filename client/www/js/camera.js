navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var video = document.querySelector("#videoElement");

function startVideo() {
    const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    if (isAndroid)
        //  Start camera on Android!! //
        navigator.getUserMedia({ video: { facingMode: { exact: "environment" } } }, handleVideo, videoError);
    else {
        //  Start camera on Web!! //
        navigator.getUserMedia({ video: true }, handleVideo, videoError);
    }
}

function handleVideo(stream) {
    document.querySelector("#videoElement").srcObject = stream;
}

function videoError(e) {
    console.error(e);
}

startVideo();


async function sendPicture(data) {

    // dataURI is the data URI of the cropped image
    localStorage.setItem('image', data)
    encodedData = data


    const buttons = document.querySelector('#buttons')
    const loading = document.createElement('h1')
    loading.textContent = 'Loading...'
    buttons.insertBefore(loading, buttons.firstChild)
    const isAndroid = navigator.userAgent.toLowerCase().indexOf("android") > -1;
    if (isAndroid) {
        res = await fetch('http://ff7a-77-137-194-196.ngrok.io/predict', {
            "method": "POST",
            "body": encodedData,
        })
    }
    else {
        res = await fetch('http://localhost:5000/predict', {
            "method": "POST",
            "body": encodedData,
        })
    }
    data = await res.json();
    data = data.result.replace(/^(tf.Tensor\(\n\[)|b'|'|\[UNK\]|'|\n|\], shape=\(\d\d,\), dtype=string\)/g, "")
    data = data.split(" ")
    let index = 0;

    const firstEmpty = data.map(item => {
        if (item === "") return index
        index++
    })

    data.splice(index);
    localStorage.setItem("data", data)
    const form = document.createElement("form")
    form.action = "../midi.html";
    form.className = 'button-black'
    const input = document.createElement("input")
    input.type = "submit"
    input.value = "go to midi page"
    input.className = 'button-black'
    form.appendChild(input)
    buttons.removeChild(loading)
    buttons.insertBefore(form, buttons.firstChild)

}

//////////////////////////////////////////////////////

function pathToDataURI(filePath) {
    return new Promise(function (resolve, reject) {
        window.resolveLocalFileSystemURL(filePath, function (fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    resolve(reader.result);
                };
                reader.readAsDataURL(file);
            }, reject);
        }, reject);
    });
}

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

//////////////////////////////////////////////////////

// Load the image
const image = new Image();
image.onload = function () {
    canvas.width = image.width;
    canvas.height = image.height;
};
function takePicture() {
    const canvas = document.getElementById("cropCanvas");
    const ctx = canvas.getContext("2d");
    const backupCanvas = document.getElementById("backupCanvas");
    const backupCtx = backupCanvas.getContext("2d");
    const video = document.querySelector("#videoElement");
    const width = video.videoWidth;
    const height = video.videoHeight;
    backupCanvas.width = width;
    backupCanvas.height = height;
    backupCtx.drawImage(output, 0, 0);



    ctx.save();

    const aspectRatio = width / height;
    // Calculate the new height and width
    let newWidth, newHeight;
    const maxWidth = 900;
    const maxHeight = 500;
    if (width > height) {
        newWidth = Math.min(width, maxWidth);
        newHeight = newWidth / aspectRatio;
    } else {
        newHeight = Math.min(height, maxHeight);
        newWidth = newHeight * aspectRatio;
    }
    resizeHeight = height / newHeight;
    resizeWidth = width / newWidth;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, newWidth, newHeight);

    let data = canvas.toDataURL("image/jpeg");
    img.src = data;
    img.hidden = true;
    video.hidden = true
}

const container = document.getElementById("canvasContainer");
const canvas = document.getElementById("cropCanvas");
const ctx = canvas.getContext("2d");
let clicks = [];
let positions = {
    topLeft: null,
    topRight: null,
    bottomRight: null,
    bottomLeft: null,
}

function findPositions(dots) {
    let topLeft = { x: Infinity, y: Infinity };
    let bottomLeft = { x: Infinity, y: -Infinity };
    let topRight = { x: -Infinity, y: Infinity };
    let bottomRight = { x: -Infinity, y: -Infinity };

    for (let prop in dots) {
        if (positions.topLeft === null && (dots[prop].x - 10 < topLeft.x || topLeft === null)) {
            if (dots[prop].y - 10 < topLeft.y || topLeft === null) {
                topLeft = dots[prop];
            }
        }
        if (positions.bottomLeft === null && (dots[prop].x - 10 < bottomLeft.x || bottomLeft === null)) {
            if (dots[prop].y - 10 > bottomLeft.y || bottomLeft === null) {
                bottomLeft = dots[prop];
            }
        }
        if (positions.topRight === null && (dots[prop].x + 10 > topRight.x || topRight === null)) {
            if (dots[prop].y - 10 < topRight.y || topRight === null) {
                topRight = dots[prop];
            }
        }
        if (positions.bottomRight === null && (dots[prop].x + 10 > bottomRight.x || bottomRight === null)) {
            if (dots[prop].y - 10 > bottomRight.y || bottomRight === null) {
                bottomRight = dots[prop];
            }
        }
    }
    return { topLeft, topRight, bottomRight, bottomLeft };
}

function findPositions2(dots) {
    const backupCanvas = document.getElementById('backupCanvas')
    positions.topLeft = findDistance(dots, 0, 0)
    positions.bottomLeft = findDistance(dots, 0, backupCanvas.height)
    positions.topRight = findDistance(dots, backupCanvas.width, 0)
    positions.bottomRight = findDistance(dots, 0, backupCanvas.width)
}

function findDistance(dots, x, y) {
    let minDist = Infinity;
    for (dot of dots) {
        const distance = Math.sqrt(Math.pow(dot.x - x, 2) + Math.pow(dot.y - y, 2));
        if (distance < minDist) {
            minDist = distance
            minDot = dot;
        }
    }
    return minDot
}
function invertColors(pixels) {
    for (var i = 0; i < pixels.length; i += 4) {
        pixels[i] = pixels[i] ^ 255; // Invert Red
        pixels[i + 1] = pixels[i + 1] ^ 255; // Invert Green
        pixels[i + 2] = pixels[i + 2] ^ 255; // Invert Blue
    }
}

function dilate(pixels, canvas) {
    let currIdx = 0;
    const maxIdx = pixels.length ? pixels.length / 4 : 0;
    const out = new Int32Array(maxIdx);
    let currRowIdx, maxRowIdx, colOrig, colOut, currLum;

    let idxRight, idxLeft, idxUp, idxDown;
    let colRight, colLeft, colUp, colDown;
    let lumRight, lumLeft, lumUp, lumDown;

    while (currIdx < maxIdx) {
        currRowIdx = currIdx;
        maxRowIdx = currIdx + canvas.width;
        while (currIdx < maxRowIdx) {
            colOrig = colOut = getARGB(pixels, currIdx);
            idxLeft = currIdx - 1;
            idxRight = currIdx + 1;
            idxUp = currIdx - canvas.width;
            idxDown = currIdx + canvas.width;

            if (idxLeft < currRowIdx) {
                idxLeft = currIdx;
            }
            if (idxRight >= maxRowIdx) {
                idxRight = currIdx;
            }
            if (idxUp < 0) {
                idxUp = 0;
            }
            if (idxDown >= maxIdx) {
                idxDown = currIdx;
            }
            colUp = getARGB(pixels, idxUp);
            colLeft = getARGB(pixels, idxLeft);
            colDown = getARGB(pixels, idxDown);
            colRight = getARGB(pixels, idxRight);

            //compute luminance
            currLum =
                77 * ((colOrig >> 16) & 0xff) +
                151 * ((colOrig >> 8) & 0xff) +
                28 * (colOrig & 0xff);
            lumLeft =
                77 * ((colLeft >> 16) & 0xff) +
                151 * ((colLeft >> 8) & 0xff) +
                28 * (colLeft & 0xff);
            lumRight =
                77 * ((colRight >> 16) & 0xff) +
                151 * ((colRight >> 8) & 0xff) +
                28 * (colRight & 0xff);
            lumUp =
                77 * ((colUp >> 16) & 0xff) +
                151 * ((colUp >> 8) & 0xff) +
                28 * (colUp & 0xff);
            lumDown =
                77 * ((colDown >> 16) & 0xff) +
                151 * ((colDown >> 8) & 0xff) +
                28 * (colDown & 0xff);

            if (lumLeft > currLum) {
                colOut = colLeft;
                currLum = lumLeft;
            }
            if (lumRight > currLum) {
                colOut = colRight;
                currLum = lumRight;
            }
            if (lumUp > currLum) {
                colOut = colUp;
                currLum = lumUp;
            }
            if (lumDown > currLum) {
                colOut = colDown;
                currLum = lumDown;
            }
            out[currIdx++] = colOut;
        }
    }
    setPixels(pixels, out);
};
function preprocessImage(canvas) {
    const processedImageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const numOfBrightPixels = checkIfDilate(canvas);
    let level = 0.58 //0.6
    let radius = 1; //1
    if (numOfBrightPixels > 0.7) {
        return;
    }

    canvas.getContext('2d').putImageData(processedImageData, 0, 0);
    if (numOfBrightPixels < 0.7) {
        dilate(processedImageData.data, canvas);
        canvas.getContext('2d').putImageData(processedImageData, 0, 0);
    }
    else {
        level = 0.75
    }

    thresholdFilter(processedImageData.data, level = level);
    canvas.getContext('2d').putImageData(processedImageData, 0, 0);
    return processedImageData;
}
function checkIfDilate(canvas) {
    var context = canvas.getContext("2d");
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    var brightnessThreshold = 200;
    var brightPixels = 0;

    for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];

        // Calculate the brightness of the pixel
        var brightness = (r + g + b) / 3;

        // If the brightness is above the threshold, increment the bright pixels count
        if (brightness > brightnessThreshold) {
            brightPixels++;
        }
    }

    console.log("Number of bright pixels: " + brightPixels);
    const width = canvas.width
    const height = canvas.height
    brightPixels = brightPixels / (width * height)
    return brightPixels;
}

function thresholdFilter(pixels, level) {
    if (level === undefined) {
        level = 0.5;
    }
    const thresh = Math.floor(level * 255);
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        let val;
        if (gray >= thresh) {
            val = 255;
        } else {
            val = 0;
        }
        pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
    }
}

function getARGB(data, i) {
    const offset = i * 4;
    return (
        ((data[offset + 3] << 24) & 0xff000000) |
        ((data[offset] << 16) & 0x00ff0000) |
        ((data[offset + 1] << 8) & 0x0000ff00) |
        (data[offset + 2] & 0x000000ff)
    );
};

function setPixels(pixels, data) {
    let offset = 0;
    for (let i = 0, al = pixels.length; i < al; i++) {
        offset = i * 4;
        pixels[offset + 0] = (data[i] & 0x00ff0000) >>> 16;
        pixels[offset + 1] = (data[i] & 0x0000ff00) >>> 8;
        pixels[offset + 2] = data[i] & 0x000000ff;
        pixels[offset + 3] = (data[i] & 0xff000000) >>> 24;
    }
};

// internal kernel stuff for the gaussian blur filter
let blurRadius;
let blurKernelSize;
let blurKernel;
let blurMult;

function buildBlurKernel(r) {
    let radius = (r * 3.5) | 0;
    radius = radius < 1 ? 1 : radius < 248 ? radius : 248;

    if (blurRadius !== radius) {
        blurRadius = radius;
        blurKernelSize = (1 + blurRadius) << 1;
        blurKernel = new Int32Array(blurKernelSize);
        blurMult = new Array(blurKernelSize);
        for (let l = 0; l < blurKernelSize; l++) {
            blurMult[l] = new Int32Array(256);
        }

        let bk, bki;
        let bm, bmi;

        for (let i = 1, radiusi = radius - 1; i < radius; i++) {
            blurKernel[radius + i] = blurKernel[radiusi] = bki = radiusi * radiusi;
            bm = blurMult[radius + i];
            bmi = blurMult[radiusi--];
            for (let j = 0; j < 256; j++) {
                bm[j] = bmi[j] = bki * j;
            }
        }
        bk = blurKernel[radius] = radius * radius;
        bm = blurMult[radius];

        for (let k = 0; k < 256; k++) {
            bm[k] = bk * k;
        }
    }
}

function blurARGB(pixels, canvas, radius) {
    const width = canvas.width;
    const height = canvas.height;
    const numPackedPixels = width * height;
    const argb = new Int32Array(numPackedPixels);
    for (let j = 0; j < numPackedPixels; j++) {
        argb[j] = getARGB(pixels, j);
    }
    let sum, cr, cg, cb, ca;
    let read, ri, ym, ymi, bk0;
    const a2 = new Int32Array(numPackedPixels);
    const r2 = new Int32Array(numPackedPixels);
    const g2 = new Int32Array(numPackedPixels);
    const b2 = new Int32Array(numPackedPixels);
    let yi = 0;
    buildBlurKernel(radius);
    let x, y, i;
    let bm;
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            cb = cg = cr = ca = sum = 0;
            read = x - blurRadius;
            if (read < 0) {
                bk0 = -read;
                read = 0;
            } else {
                if (read >= width) {
                    break;
                }
                bk0 = 0;
            }
            for (i = bk0; i < blurKernelSize; i++) {
                if (read >= width) {
                    break;
                }
                const c = argb[read + yi];
                bm = blurMult[i];
                ca += bm[(c & -16777216) >>> 24];
                cr += bm[(c & 16711680) >> 16];
                cg += bm[(c & 65280) >> 8];
                cb += bm[c & 255];
                sum += blurKernel[i];
                read++;
            }
            ri = yi + x;
            a2[ri] = ca / sum;
            r2[ri] = cr / sum;
            g2[ri] = cg / sum;
            b2[ri] = cb / sum;
        }
        yi += width;
    }
    yi = 0;
    ym = -blurRadius;
    ymi = ym * width;
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            cb = cg = cr = ca = sum = 0;
            if (ym < 0) {
                bk0 = ri = -ym;
                read = x;
            } else {
                if (ym >= height) {
                    break;
                }
                bk0 = 0;
                ri = ym;
                read = x + ymi;
            }
            for (i = bk0; i < blurKernelSize; i++) {
                if (ri >= height) {
                    break;
                }
                bm = blurMult[i];
                ca += bm[a2[read]];
                cr += bm[r2[read]];
                cg += bm[g2[read]];
                cb += bm[b2[read]];
                sum += blurKernel[i];
                ri++;
                read += width;
            }
            argb[x + yi] =
                ((ca / sum) << 24) |
                ((cr / sum) << 16) |
                ((cg / sum) << 8) |
                (cb / sum);
        }
        yi += width;
        ymi += width;
        ym++;
    }
    setPixels(pixels, argb);
}
canvas.addEventListener("click", function (event) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.fillRect(x, y, 5, 5);
    clicks.push({ x: x * resizeWidth, y: y * resizeHeight });

    if (clicks.length >= 4) {
        // Replace the corrupted canvas with the bgcanvas
        for (let prop in positions) {
            if (positions.hasOwnProperty(prop) && positions[prop] === null) {
                findPositions2(clicks)
                break;
            }
        }
        // Draw the polygon
        ctx.save()
        ctx.beginPath();
        ctx.moveTo(positions.topLeft.x, positions.topLeft.y);
        for (const key in positions) {
            if (key === 'topLeft')
                continue
            ctx.lineTo(positions[key].x, positions[key].y);
        }
        ctx.closePath();
        ctx.stroke();


        // Create a new canvas with the desired dimensions
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCanvas.width = positions.topRight.x - positions.bottomRight.x;
        croppedCanvas.height = positions.bottomRight.y - positions.topLeft.y;
        const output = document.getElementById('img');

        if (output.src)
            croppedCtx.drawImage(output, positions.topLeft.x, positions.topLeft.y, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);
        else
            croppedCtx.drawImage(video, positions.topLeft.x, positions.topLeft.y, croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);

        // Replace the original canvas with the cropped canvas
        canvas.parentNode.replaceChild(croppedCanvas, canvas);
        preprocessImage(croppedCanvas);
        // Get the clipped image as a data URL
        const dataURL = croppedCanvas.toDataURL();

        // Display the data URL in an image element
        const img = document.getElementById("img");
        img.src = dataURL;
        img.hidden = false;
        img.width = 500
        img.height = 100
        croppedCanvas.hidden = true;
        sendPicture(dataURL);

    }
});




