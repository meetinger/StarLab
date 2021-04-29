class HRDiagram {
    constructor(id) {
        this.obj = document.getElementById(id)
    }



    getYByLuminosity(val) {
        return 100 -
             (50 + Math.log10(val) * 7.15)
    }


    getXByTemperature(val) {
        return 100 - (-175 + Math.log10(val) * 54)
        // return map(val,1500, 500000)
    }

    genTrack(arr) {
        this.obj.innerHTML = '<div class="hr-point" id="hr-point"></div>'
        // let divs = []
        for (let i = 0; i < arr.length; ++i) {
            //TODO add interpolation

            let style={
                top: 'calc(' + this.getYByLuminosity(arr[i].properties.luminosity) + '% - 0.075rem)',
                left: 'calc(' + this.getXByTemperature(arr[i].properties.temperature) + '% - 0.075rem)'
            }

            let styleStr = JSON.stringify(style)

            styleStr = styleStr.substring(1, styleStr.length-1)

            styleStr = styleStr.replaceAll("\"", "")
            styleStr = styleStr.replaceAll(",", ";")

            this.obj.innerHTML += "<div class='track' style='"+styleStr+"'></div>";
        }
    }

    setPoint(L, T){
        let point = document.getElementById("hr-point")
        point.style.top = 'calc(' + this.getYByLuminosity(L) + '% - 0.25rem)'
        point.style.left = 'calc(' + this.getXByTemperature(T) + '% - 0.25rem)'
    }

}