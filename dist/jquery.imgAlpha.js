/*!
 *
 * imgAlpha.js
 *
 * Version: 0.1.0
 *  Author: Yann Masoch
 * Website: -
 *    Docs: -
 *    Repo: https://github.com/yannmasoch/imgAlpha.js
 *  Issues: https://github.com/yannmasoch/imgAlpha.js/issues
 *
 * Copyright 2017 Yann Masoch
 * Licensed under the MIT license
 *
 */

;(function($) {

    $.fn.imgAlpha = function(options) {

        var settings = $.extend({
            imgColor: undefined,
            imgAlpha: undefined,
            bgColor: null,
        }, options );

        return this.each(function() {

            // Make $(this) global
            var $this = $(this);

            // Init var
            var imgColor = undefined;
            var imgAlpha = undefined;
            var bgColor = null;
            var arrayColor = [];
            var arrayAlpha = [];


            //------------------------------
            // Init settings
            //------------------------------

            // Normalize bgColor values fomr settings.bgColor and/or from data-bg-color
            var setBgColor = isHex(settings.bgColor) ? hexToRgb(normalizeHex(settings.bgColor)) : null;
            var dataBgColor = isHex($this.data('bgColor')) ? hexToRgb(normalizeHex($this.data('bgColor'))) : null;

            // Prioritize values
            imgColor = settings.imgColor || $this.data('imgColor') || $this.attr('src');
            imgAlpha = settings.imgAlpha || $this.data('imgAlpha');
            bgColor = setBgColor || dataBgColor || [255, 255, 255];

            // No Alpha img specified (act as a normal image) -> stop the process for this element
            if(!imgAlpha) return;


            //------------------------------
            // Create canvas
            //------------------------------

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');


            // ------------------------------
            // Imges processsing and compositing
            //------------------------------

            var tmpImgColor = new Image();
            tmpImgColor.src = imgColor;

            var tmpImgAlpha = new Image();
            tmpImgAlpha.src = imgAlpha;

            (tmpImgColor && tmpImgAlpha).onload = function() {

                // Init canvas size
                canvas.width = tmpImgColor.width;
                canvas.height = tmpImgColor.height;

                // Get pixel color values
                getColor(canvas, ctx, tmpImgColor, arrayColor, function() {

                    // Get pixel alpha values
                    getAlpha(canvas, ctx, tmpImgAlpha, arrayAlpha, function() {

                        // Compositing
                        drawComposite(canvas, ctx, arrayColor, arrayAlpha, bgColor, function() {

                            var base64 = canvas.toDataURL();
                            $this.attr('src', base64);


                        });

                    });

                });

            };




        });

    };



    function getColor(canvas, ctx, img, arrayColor, callback) {

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get datas from image
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        // Loop each pixel RGB
        for (var i = 0; i < data.length; i += 4) {
            arrayColor.push(data[i]);
            arrayColor.push(data[i+1]);
            arrayColor.push(data[i+2]);
            arrayColor.push(255);
        }

        // Clean canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        callback();

    }


    function getAlpha(canvas, ctx, img, arrayAlpha, callback) {

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get datas from image
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        // Loop each pixel Alpha
        for (var i = 0; i < data.length; i += 4) {
            arrayAlpha.push(data[i]);
            arrayAlpha.push(data[i+1]);
            arrayAlpha.push(data[i+2]);
            arrayAlpha.push(255);
        }

        // Clean canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        callback();

    }


    function drawComposite(canvas, ctx, arrayColor, arrayAlpha, bgColor, callback) {

        var imgData = ctx.createImageData(canvas.width, canvas.height);
        var data = imgData.data;

        for (var i = 0; i < data.length; i += 4) {

            data[i] = reverseBlending(arrayColor[i], bgColor[0], arrayAlpha[i]);
            data[i+1] = reverseBlending(arrayColor[i+1], bgColor[1], arrayAlpha[i]);
            data[i+2] = reverseBlending(arrayColor[i+2], bgColor[2], arrayAlpha[i]);
            data[i+3] = arrayAlpha[i];
        }

        // Draw the alpha compositing on canvas
        ctx.putImageData(imgData, 0, 0);

        callback();

    }


    function reverseBlending(outpout, bg, alpha) {

        outpout = outpout / 255;
        bg = bg / 255;
        alpha = alpha / 255;

        var color = (outpout / alpha) - ((bg * (1.0 - alpha)) / alpha);

        return color * 255;

    }


    // Test if string a correct hexstring
    function isHex(hex) {

        return /^#?[0-9A-F]{6}$/i.test(hex);
        /*
            ^ match beginning
            # a hash
            ? optional char
            [a-f0-9] any letter from a-f and 0-9
            {6} the previous group appears exactly 6 times
            $ match end
            i ignore case
        */

    }


    function normalizeHex(hex) {

        // Remove '#'
        hex = hex.replace('#', '');

        return hex;
    }


    function hexToRgb(hex) {
        var arrBuff = new ArrayBuffer(4);
        var vw = new DataView(arrBuff);
        vw.setUint32(0, parseInt(hex, 16), false);
        var arrByte = new Uint8Array(arrBuff);

        return [ arrByte[1],  arrByte[2], arrByte[3] ];
    }


}(jQuery));
