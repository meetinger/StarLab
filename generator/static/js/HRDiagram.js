class HRDiagram {
    obj
    inner
    minMaxValues
    constructor(id, starlab) {
        this.obj = document.getElementById(id)
        this.obj.innerHTML = '<div class="hr-header text-center"> \n' +
            '                    <div>Hertzsprung–Russell Diagram</div>\n' +
            '                    <div><b>Stage: </b><span class="stage-label"></span></div>\n' +
            '                </div>\n' +
            '\n' +
            '                <div class="hr-diagram-left-scale">\n' +
            '                    <div class="hr-diagram-left-scale-wrapper flex">\n' +
            '                    </div>\n' +
            '                </div>\n' +
            '\n' +
            '                <div class="hr-diagram-inner"></div>\n' +
            '\n' +
            '                <div class="hr-diagram-bottom-scale">\n' +
            '                    <div class="hr-diagram-gradient"></div>\n' +
            '                    <div class="hr-diagram-bottom-scale-wrapper flex">\n' +
            '                    </div>\n' +
            '                </div>'
        this.inner = this.obj.getElementsByClassName("hr-diagram-inner")[0]
        this.inner.innerHTML = '<div class="hr-diagram-point"></div>'
        

        this.resetMinMaxValues()
    }

    resetMinMaxValues(){
        this.minMaxValues = {
            luminosity: {
                min: 10**-7,
                max: 10**7
            },
            temperature: {
                min: 1750,
                max: 125000
            }
        }
    }

    // getYByLuminosity(val) {
    //     return 100 -
    //          (50 + Math.log10(val) * 7.15)
    // }
    //
    //
    // getXByTemperature(val) {
    //     return 100 - (-175 + Math.log10(val) * 54)
    //     // return map(val,1500, 500000)
    // }
    //
    // getTemperatureByX(x){
    //     return 10**((275-x)/54)
    // }
    //
    // getLuminosityByY(y){
    //     return 10**((50-y)/7.15)
    // }

    getYByLuminosity(val) {

        let b = -100/(Math.log10(this.minMaxValues.luminosity.max)-Math.log10(this.minMaxValues.luminosity.min))

        let a = -Math.log10(this.minMaxValues.luminosity.max)*b

        return (a + Math.log10(val) * b)
    }


    getXByTemperature(val) {

        let b = -100/(Math.log10(this.minMaxValues.temperature.max)-Math.log10(this.minMaxValues.temperature.min))

        let a = -Math.log10(this.minMaxValues.temperature.max)*b

        return (a + Math.log10(val) * b)
        // return map(val,1500, 500000)
    }

    build(inputData, autoScale){
        
        let leftScaleWrapper = this.obj.getElementsByClassName('hr-diagram-left-scale-wrapper')[0]
        leftScaleWrapper.innerHTML = ''

        let HRDiagramInner = this.obj.getElementsByClassName('hr-diagram-inner')[0]
        HRDiagramInner.innerHTML = '<div class="hr-diagram-point"></div>'
        HRDiagramInner.style.border = 'none'

        let bottomScaleWrapper = this.obj.getElementsByClassName('hr-diagram-bottom-scale-wrapper')[0]
        bottomScaleWrapper.innerHTML = ''

        let gradient = this.obj.getElementsByClassName("hr-diagram-gradient")[0]

        gradient.style.background = 'none'
        gradient.style.border = 'none'

        if(autoScale) {
            
            this.minMaxValues = {
                luminosity: {
                    min: inputData[0].properties.luminosity,
                    max: inputData[0].properties.luminosity
                },
                temperature: {
                    min: inputData[0].properties.temperature,
                    max: inputData[0].properties.temperature
                }
            }

            for (let i = 0; i < inputData.length; ++i) {
                this.minMaxValues.luminosity.min = Math.min(this.minMaxValues.luminosity.min, inputData[i].properties.luminosity)
                this.minMaxValues.luminosity.max = Math.max(this.minMaxValues.luminosity.max, inputData[i].properties.luminosity)

                this.minMaxValues.temperature.min = Math.min(this.minMaxValues.temperature.min, inputData[i].properties.temperature)
                this.minMaxValues.temperature.max = Math.max(this.minMaxValues.temperature.max, inputData[i].properties.temperature)
            }

            this.minMaxValues.luminosity.min*=0.9
            this.minMaxValues.luminosity.max*=1.1

            this.minMaxValues.temperature.min*=0.9
            this.minMaxValues.temperature.max*=1.1
            
            
            this.obj.style.backgroundImage = 'none'

            const minTemp = this.minMaxValues.temperature.min
            const maxTemp = this.minMaxValues.temperature.max

            const minLum = this.minMaxValues.luminosity.min
            const maxLum = this.minMaxValues.luminosity.max

            let backgroundGradient = 'linear-gradient(to left, '

            for (let i = minTemp; i <= maxTemp; i += (maxTemp - minTemp) / 50) {
                backgroundGradient += ' rgb(' + colorTemperatureToRGB(i) + ') ' + (100 - this.getXByTemperature(i)) + '%,'
            }

            backgroundGradient = backgroundGradient.substring(0, backgroundGradient.length - 1) + ')'
            gradient.style.background = backgroundGradient
            gradient.style.border = 'solid 0.1rem black'

            HRDiagramInner.style.border = 'solid 0.1rem black'
            HRDiagramInner.style.borderBottom = '0'

            for (let i = Math.trunc(Math.log10(minLum)); i <= Math.trunc(Math.log10(maxLum)); ++i) {
                let element = document.createElement("div")
                element.classList.add("hr-diagram-left-scale-label")
                element.innerHTML = '<div class="hr-diagram-left-scale-label-value">10<sup>' + i + '</sup></div>'

                let pointer = document.createElement("div")
                pointer.classList.add("hr-diagram-left-scale-pointer")

                element.style.top = 'calc(' + this.getYByLuminosity(10 ** i) + '% - 0.5rem)'
                pointer.style.top = 'calc(' + this.getYByLuminosity(10 ** i) + '%)'

                leftScaleWrapper.appendChild(element)
                HRDiagramInner.appendChild(pointer)
            }

            const lgTStart = Math.log10(minTemp)
            const lgTEnd = Math.log10(maxTemp)

            for (let i = lgTStart; i <= lgTEnd; i += (lgTEnd - lgTStart) / 6) {

                let curTemp = 10 ** i

                let roundedTemp = round(curTemp, 500)

                let element = document.createElement("div")
                element.classList.add("hr-diagram-bottom-scale-label")

                element.innerHTML = '<div class="hr-diagram-bottom-scale-pointer"></div>' +
                    '<div class="hr-diagram-bottom-scale-label-value">' + roundedTemp + '</div>'

                element.style.left = 'calc(' + this.getXByTemperature(roundedTemp) + '% - 2rem)'

                bottomScaleWrapper.appendChild(element)
            }
        }else{
            this.obj.style.backgroundImage = 'url("../../static/img/hrdiagram.png")'
            this.resetMinMaxValues()
        }

        this.genTrack(inputData)
    }

    genTrack(inputData) {
        // let divs = []
        let trackPoints = ""
        for (let i = 0; i < inputData.length; ++i) {
            //TODO add interpolation

            let style={
                top: 'calc(' + this.getYByLuminosity(inputData[i].properties.luminosity) + '% - 0.075rem)',
                left: 'calc(' + this.getXByTemperature(inputData[i].properties.temperature) + '% - 0.075rem)'
            }

            let styleStr = JSON.stringify(style)

            styleStr = styleStr.substring(1, styleStr.length-1)

            styleStr = styleStr.replaceAll("\"", "")
            styleStr = styleStr.replaceAll(",", ";")
            trackPoints+="<div class='hr-diagram-track' style='"+styleStr+"'></div>";
        }
        this.inner.innerHTML += trackPoints
    }

    setPoint(L, T){
        let point = this.obj.getElementsByClassName("hr-diagram-point")[0]
        point.style.top = 'calc(' + this.getYByLuminosity(L) + '% - 0.25rem)'
        point.style.left = 'calc(' + this.getXByTemperature(T) + '% - 0.25rem)'
    }

}