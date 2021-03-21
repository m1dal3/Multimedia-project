'use strict';
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var img = new Image();
var action = '', subaction = '';
var mouseX, mouseY, mouseXInit, mouseYInit;

var selection = document.getElementById('selection');
selection.className = 'selection';
selection.style.display = 'none';

var textEditor = document.getElementById('textEditor');
textEditor.style.display = 'none';
var textEditorInput = document.getElementById('textEditorInput');
textEditorInput.value = '';
var textColor = '#000';

var info = document.getElementById('info');
info.innerHTML = '';

document.getElementById('btnImageLoad').addEventListener("change", function (e) {
    let fileReader = new FileReader();
    fileReader.addEventListener('load', function (e) {
        img.src = e.target.result;
    });
    fileReader.readAsDataURL(e.target.files[0]);
});

img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    refreshHistogram();
}

document.getElementById('btnImageDownload').addEventListener('click', function (e) {
    var link = document.createElement('a');
    link.setAttribute('download', 'outputImage.png');
    link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")); //Fortam type pt download
    link.click();
});

canvas.addEventListener('mouseover', function (e) {

});
canvas.addEventListener('mousedown', function (e) {
    subaction = 'hover';

    info.innerHTML = '';
    document.getElementById('toolbar2').style.displat = 'none';

    let rect = canvas.getBoundingClientRect();
    mouseXInit = e.clientX - rect.left;
    mouseYInit = e.clientY - rect.top;

    switch (action) {
        case 'crop':
        case 'select':
            selection.style.display = 'block';
            selection.style.left = (mouseXInit) + 'px';
            selection.style.top = (mouseYInit + rect.top) + 'px';
            selection.style.width = '0';
            selection.style.height = '0';
            break;

        case 'text':
            textEditor.style.display = 'block';
            textEditor.style.left = mouseXInit + 'px';
            textEditor.style.top = (mouseYInit + rect.top) + 'px';
            textEditorInput.value = '';
            textEditorInput.focus();
            info.innerHTML = 'Press ENTER to insert text in image';
            break;
    }
});
canvas.addEventListener('mouseup', function (e) {
    subaction = '';

    switch (action) {
        case 'crop':
            info.innerHTML = 'Press enter to crop';
            break;

        case 'select':
            document.getElementById('toolbar2').style.display = 'block';
            info.innerHTML = 'Choose tools from toolbar';
            break;

        case 'text':

            break;
    }
});
canvas.addEventListener('mousemove', function (e) {
    let rect = canvas.getBoundingClientRect();

    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    // console.log(mouseX+' '+mouseY);

    if (subaction == 'hover') {
        // console.log(action);
        switch (action) {
            case 'pencil':
                ctx.beginPath();
                ctx.moveTo(mouseX, mouseY);
                ctx.lineTo(mouseX + 1, mouseY + 1);
                ctx.stroke();
                break;

            case 'crop':
            case 'select':
                selection.style.width = (mouseX - mouseXInit) + 'px';
                selection.style.height = (mouseY - mouseYInit) + 'px';
                break;
        }
    }

    switch (action) {
        case 'select':
            refreshHistogram(parseInt(selection.style.left), parseInt(selection.style.top), parseInt(selection.style.width), parseInt(selection.style.height));
            break;

        default:
            refreshHistogram(mouseX, mouseY);
            break;
    }
});
canvas.addEventListener('mouseout', function (e) {
    if (selection.style.display == 'none' || parseInt(selection.style.width) == 0)
        refreshHistogram();
    else
        refreshHistogram(parseInt(selection.style.left), parseInt(selection.style.top), parseInt(selection.style.width), parseInt(selection.style.height));
});

document.getElementById('btnNew').addEventListener('click', function (e) {
    canvas.width = 800;
    canvas.height = 600;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fill();

    action = '';
    subaction = '';
    canvas.style.cursor = 'default';
    selection.style.display = 'none';
    textEditor.style.display = 'none';
    info.innerHTML = '';
});

document.getElementById('btnArrow').addEventListener('click', function (e) {
    action = '';
    canvas.style.cursor = 'default';
});
document.getElementById('btnPencil').addEventListener('click', function (e) {
    action = 'pencil';
    canvas.style.cursor = 'crosshair';
});
document.getElementById('btnCrop').addEventListener('click', function (e) {
    action = 'crop';
    canvas.style.cursor = 'cell';
});
document.getElementById('btnSelect').addEventListener('click', function (e) {
    action = 'select';
    canvas.style.cursor = 'cell';
});
document.getElementById('btnText').addEventListener('click', function (e) {
    action = 'text';
    canvas.style.cursor = 'text';
});
document.getElementById('btnResize').addEventListener('click', function (e) {
    let newWidth = prompt('Lungime imagine este: ' + canvas.width + 'px. Introduceti noua lungime', canvas.width);
    let newHeight = prompt('Inaltime imagine este: ' + canvas.height + 'px. Introduceti noua inaltime', canvas.height);

    let procentWidth = newWidth / canvas.width;
    let procentHeight = newHeight / canvas.height;
    let tempCanvas = document.createElement("canvas");
    let tctx = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tctx.drawImage(canvas, 0, 0);

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx = canvas.getContext('2d');

    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, tempCanvas.width * procentWidth, tempCanvas.height * procentHeight);
});

let colorBtns = document.getElementsByClassName('colorize');
for (let i = 0; i < colorBtns.length; i++) {
    colorBtns[i].addEventListener('click', function (e) {
        var color = this.dataset.color;
        var colorOffset = 25;

        if (selection.offsetWidth > 0 && selection.offsetHeight > 0) {
            let rect = canvas.getBoundingClientRect();
            let data = ctx.getImageData(selection.offsetLeft - rect.left, selection.offsetTop - rect.top, selection.offsetWidth, selection.offsetHeight);

            for (let i = 0, length = data.data.length; i < length; i += 4) {
                switch (color) {
                    case 'alpha':
                        data.data[i + 3] = Math.max(0, data.data[i + 3] - colorOffset);
                        break;

                    case 'red':
                        data.data[i] = Math.min(255, data.data[i] + colorOffset);
                        data.data[i + 1] = 0;
                        data.data[i + 2] = 0;
                        break;

                    case 'green':
                        data.data[i] = 0;
                        data.data[i + 1] = Math.min(255, data.data[i + 1] + colorOffset);
                        data.data[i + 2] = 0;
                        break;

                    case 'blue':
                        data.data[i] = 0;
                        data.data[i + 1] = 0;
                        data.data[i + 2] = Math.min(255, data.data[i + 2] + colorOffset);
                        break;

                    case 'censor':
                        let randomPixel = Math.floor(Math.random() * 255);
                        data.data[i] = randomPixel;
                        data.data[i + 1] = randomPixel;
                        data.data[i + 2] = randomPixel;
                        break;

                    case 'blackwhite':
                        let pixel = Math.round((data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3);
                        data.data[i] = pixel;
                        data.data[i + 1] = pixel;
                        data.data[i + 2] = pixel;
                        break;

                    case 'erase':
                        data.data[i] = 255;
                        data.data[i + 1] = 255;
                        data.data[i + 2] = 255;
                        break;
                }
            }

            ctx.putImageData(data, selection.offsetLeft - rect.left, selection.offsetTop - rect.top);
        }
    });
}

document.addEventListener('keypress', function (e) {
    switch (action) {
        case 'crop':
            if (selection.offsetWidth > 0 && selection.offsetHeight > 0 && e.charCode == 13) {
                let rect = canvas.getBoundingClientRect();
                let data = ctx.getImageData(selection.offsetLeft - rect.left, selection.offsetTop - rect.top, selection.offsetWidth, selection.offsetHeight);

                canvas.width = selection.offsetWidth;
                canvas.height = selection.offsetHeight;
                ctx.putImageData(data, 0, 0);

                selection.style.display = 'none';
                info.innerHTML = '';
            }
            break;
    }
});

textEditorInput.addEventListener('keypress', function (e) {
    if (e.charCode == 13) {
        let rect = canvas.getBoundingClientRect();
        let fontSize = parseInt(document.getElementById('textEditorSize').value, 10);
        ctx.font = fontSize + 'px Arial';
        ctx.fillStyle = textColor;
        ctx.fillText(this.value, textEditor.offsetLeft - rect.left, textEditor.offsetTop - rect.top + fontSize);
        textEditor.style.display = 'none';
        info.innerHTML = '';
    }
});

var textColorsBtns = document.getElementsByClassName('textColor');
for (let i = 0; i < textColorsBtns.length; i++) {
    textColorsBtns[i].addEventListener('click', function (e) {
        textColor = this.dataset.color;
    });
}

function refreshHistogram(xSel, ySel, widthSel, heightSel) {
    let histoCanvas = document.getElementById('histogram');
    let histoCtx = histoCanvas.getContext('2d');
    histoCtx.clearRect(0, 0, histoCanvas.width, histoCanvas.height);

    let rect = canvas.getBoundingClientRect();
    let data = ctx.getImageData(0, 0, rect.width, rect.height);
    let red = 0; let green = 0; let blue = 0; let alpha = 0;

    if (xSel && ySel) {
        let i = xSel * 4 + ySel * (rect.width * 4);

        if (widthSel && heightSel) {
            //Histograma pe selectie
            let count = 0;
            let startX = i;
            let length = widthSel * 4;
       
            for (let j = ySel; j < ySel + heightSel; j++) {
                for (i = startX; i < startX + length; i += 4) {
                    let iPrim = i + (j - ySel) * (rect.width * 4);

                    red += data.data[iPrim];
                    green += data.data[iPrim + 1];
                    blue += data.data[iPrim + 2];
                    alpha += data.data[iPrim + 3];
                    count++;
                }
            }

            red = Math.round(red / count);
            green = Math.round(green / count);
            blue = Math.round(blue / count);
            alpha = Math.round(alpha / count);
        } else {
            //Histograma pe pixel
            red = data.data[i];
            green = data.data[i + 1];
            blue = data.data[i + 2];
            alpha = data.data[i + 3];
        }
    } else {
        //Histograma pe toata imaginea
        for (var i = 0, length = data.data.length; i < length; i += 4) {
            red += data.data[i];
            green += data.data[i + 1];
            blue += data.data[i + 2];
            alpha += data.data[i + 3];
        }

        red = Math.round(red / (data.data.length / 4));
        green = Math.round(green / (data.data.length / 4));
        blue = Math.round(blue / (data.data.length / 4));
        alpha = Math.round(alpha / (data.data.length / 4));
    }

    let histoRect = histoCanvas.getBoundingClientRect();

    let fontSize = 12;
    histoCtx.font = fontSize + 'px Arial';
    let x, y, text = '';

    //red
    histoCtx.fillStyle = "#FF0000";
    x = 0 * (histoRect.width / 4); //Fiind 4 valori (red, green, blue, alpha), impart canvas.width in 4 si incept de la 0, apoi incrementez pentru fiecare culoare
    y = histoRect.height - Math.round((red / 255) * histoRect.height) - fontSize - 2;//Calculez cat reprezinta procentual valoarea mea fata de 255 (valoarea maxima), apoi o raportez la canvas.height. Acest raport il scad din canvas.height si stabilesc y de unde incep chenarul, pentru ca in cazul de fata desenul trebuie facut de jos in sus, invers desenarii de rectangle in canvas
    histoCtx.fillRect(x, y, histoRect.width / 4, histoRect.height - y - (fontSize * 2) - 4);//Am prevazut 2 rows a cate 12px (cat e fontSize) in partea de jos + ceva spatiere intre randuri. Aceasta valoare o scad din height-ul total al rectangle pe care il desenez
    histoCtx.fillStyle = '#000000';
    text = 'red';
    histoCtx.fillText(text, x + (text.length * fontSize / 2) - 8, histoRect.height - (fontSize / 2) * 2 - 4);//Scriu label. Aproximez centrare text in partea de jos. Imposibil de centrat dupa formule cu fonturi variable-width precum Arial
    text = `${red}`;
    histoCtx.fillText(text, x + (text.length * fontSize / 2) - 8, histoRect.height - (fontSize / 2));//Scriu valoare pe urmatorul rand. Aproximez centrare text in partea de jos. Imposibil de centrat dupa formule cu fonturi variable-width precum Arial

    //green
    histoCtx.fillStyle = "#00FF00";
    x = 1 * (histoRect.width / 4);
    y = histoRect.height - Math.round((green / 255) * histoRect.height) - fontSize - 2;
    histoCtx.fillRect(x, y, histoRect.width / 4, histoRect.height - y - (fontSize * 2) - 4);//2 rows x 12px in the bottom + line-height
    histoCtx.fillStyle = '#000000';
    text = 'green';
    histoCtx.fillText(text, x + 4, histoRect.height - (fontSize / 2) * 2 - 4);
    text = `${green}`;
    histoCtx.fillText(text, x + (text.length * fontSize / 2) - 8, histoRect.height - (fontSize / 2));

    //blue
    histoCtx.fillStyle = '#0000ff';
    x = 2 * (histoRect.width / 4);
    y = histoRect.height - Math.round((blue / 255) * histoRect.height) - fontSize - 2;
    histoCtx.fillRect(x, y, histoRect.width / 4, histoRect.height - y - (fontSize * 2) - 4);//2 rows x 12px in the bottom + line-height
    histoCtx.fillStyle = '#000000';
    text = 'blue';
    histoCtx.fillText(text, x + 4, histoRect.height - (fontSize / 2) * 2 - 4);
    text = `${blue}`;
    histoCtx.fillText(text, x + (text.length * fontSize / 2) - 8, histoRect.height - (fontSize / 2));

    //alpha
    histoCtx.fillStyle = '#000000';
    x = 3 * (histoRect.width / 4);
    y = histoRect.height - Math.round((alpha / 255) * histoRect.height) - fontSize - 2;
    histoCtx.fillRect(x, y, histoRect.width / 4, histoRect.height - y - (fontSize * 2) - 4);//2 rows x 12px in the bottom + line-height
    histoCtx.fillStyle = '#000000';
    text = 'alpha';
    histoCtx.fillText(text, x + 4, histoRect.height - (fontSize / 2) * 2 - 4);
    text = `${alpha}`;
    histoCtx.fillText(text, x + (text.length * fontSize / 2) - 8, histoRect.height - (fontSize / 2));

}