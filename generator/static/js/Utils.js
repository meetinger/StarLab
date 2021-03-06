function colorTemperatureToRGB(kelvin) {
    const temp = kelvin / 100;
    let red, green, blue;
    if (temp <= 66) {
        red = 255;
        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;
        if (temp <= 19) {
            blue = 0;
        } else {
            blue = temp - 10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        }
    } else {
        red = temp - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);
        green = temp - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492);
        blue = 255;
    }

    const clamp = (x, min, max) => {
        if (x < min) {
            return min;
        }
        if (x > max) {
            return max;
        }
        return x;
    }

    return [
        clamp(red, 0, 255),
        clamp(green, 0, 255),
        clamp(blue, 0, 255)
    ]
}

function round(value, step) {
    step || (step = 1.0);
    let inv = 1.0 / step;
    return Math.round(value * inv) / inv;
}

function linearScale(x, x1, x2, y1, y2){
    return y1+(x-x1)*(y2-y1)/(x2-x1)
}

function linearScaleByK(Xmin, Xmax, k){
    return (Xmax - Xmin) * k + Xmin
}
