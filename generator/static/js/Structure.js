class Structure {
    constructor(id, starlab) {
        this.obj = document.getElementById(id)
        this.divider = 1
        this.radius = 10
        this.stage = {}
    }

    getRadius(L0, T) {
        let L = 3.828 * Math.pow(10, 26) * L0
        let R = Math.sqrt(L / (4 * Math.PI * 5.67 * Math.pow(10, -8) * Math.pow(T, 4)))
        let R0 = R / (696340000)
        return R0
    }

    colorTemperatureToRGB(kelvin) {
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
        return [
            this.clamp(red, 0, 255),
            this.clamp(green, 0, 255),
            this.clamp(blue, 0, 255)
        ]
    }

    clamp(x, min, max) {
        if (x < min) {
            return min;
        }
        if (x > max) {
            return max;
        }
        return x;
    }

    genShells(arr, index) {
        let i = arr[index];

        if (index < arr.length) {
            let shellStyle = {
                backgroundColor: "rgb(" + i.color + ")",
                width: (parseFloat(i.size) / this.divider) + "rem",
                height: (parseFloat(i.size) / this.divider) + "rem",
            }
            // console.log("DIVIDER:", this.divider)
            // console.log("WIDTH:", shellStyle.width)
            if (index === 0) {
                shellStyle.backgroundColor = "rgb(" + this.colorTemperatureToRGB(this.state.stage.properties.temperature) + ")"
            }
            let labelStyle = {
                color: "black"
            }
            if (i.color.some((value) => value < 100)) {
                labelStyle = {color: "white"}
            }

            return '<div style="' + shellStyle + '" class="shell">' +
                '<div style="' + labelStyle + '" class="matter-label">i.matter</div>' +
                this.genShells(arr, index + 1);
        } else {
            return;
        }
    }

    getDivider(radius) {
        // let i = 1
        // while (2 * parseInt(radius) / i > 24) {
        //     i *= 10;
        // }

        let i = Math.max(10**Math.ceil(Math.log10(radius/12)), 1)

        // console.log("getDivider: ", i)
        return i;
    }

    setStructure(stage) {
        this.divider = this.getDivider(stage.properties.radius)
        if (this.divider === 1) {
            this.obj.innerHTML = '<div class="structure-wrapper">' +
                this.genStructure(stage) + '</div>';
        } else {
            this.obj.innerHTML = '<div class="structure-wrapper">' +
                this.genStructure(stage) + '</div>' +
                '<div style="text-align: right">Scale: 1/' + this.divider + '</div>';
        }
    }

    genStructure(stage) {
        if (stage.structure === false) {

            
            let shell = document.createElement("div")

            shell.classList.add("shell")

            let style = {
                width: 2 * parseFloat(stage.properties.radius) / this.divider + "rem",
                height: 2 * parseFloat(stage.properties.radius) / this.divider + "rem",
                "border-radius": 2 * parseFloat(stage.properties.radius) / this.divider + "rem",
                "background-color": "rgb(" + this.colorTemperatureToRGB(stage.properties.temperature) + ")"
            }

            // let styleStr = JSON.stringify(style)
            //
            // styleStr = styleStr.substring(1, styleStr.length-1)
            //
            // styleStr = styleStr.replaceAll("\"", "")
            //
            // styleStr = styleStr.replaceAll(",", ";")
            //
            // styleStr = "background-color: rgb(" + this.colorTemperatureToRGB(stage.properties.temperature) + ");"+styleStr

            Object.assign(shell.style, style)

            return shell.outerHTML
        } else {

            this.divider = this.getDivider(stage.structure[0].size)

            return this.genShells(stage.structure, 0)
        }

    }
}