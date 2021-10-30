class Clock{
    data = []
    starlab
    constructor(id, starlab) {
        this.obj = document.getElementById(id)
        this.obj.innerHTML = '<div class="clock-body"></div>' +
            '<div class="clock-pointer-wrapper"><div class="clock-pointer"></div></div>' +
            '<div class="clock-stages"></div>'
        this.starlab = starlab
    }
    build(data){
        this.data = data
        const colors = [
            [255, 0, 0],
            [255, 165, 0],
            [255, 255, 0],
            [0, 255, 0],
            [0, 191, 255],
            [0, 0, 255],
            [139, 0, 255]
        ]
        const terminalAge = data[data.length-1].end
        let colorIndex = 0
        let clockBody = this.obj.getElementsByClassName("clock-body")[0]
        let clockStages = this.obj.getElementsByClassName("clock-stages")[0]
        for(let i in data){
            let block = document.createElement("div")
            let width = (data[i].end - data[i].start)*100/terminalAge
            block.style.width = width+"%"
            block.style.backgroundColor = "rgb("+colors[colorIndex]+")"
            clockBody.appendChild(block)

            let stageRow = document.createElement("div")
            stageRow.classList.add("clock-stage-row")

            let stageColorPointer = document.createElement("div")
            stageColorPointer.classList.add("clock-stage-color-pointer")
            stageColorPointer.style.backgroundColor = "rgb("+colors[colorIndex]+")"

            stageRow.appendChild(stageColorPointer)

            let stageLabel = document.createElement("div")
            stageLabel.innerHTML = this.starlab.phaseToStr(data[i].stage)

            stageRow.appendChild(stageLabel)
            stageRow.onclick = ()=>{this.starlab.rewindByAge(data[i].start)}


            clockStages.appendChild(stageRow)

            ++colorIndex
        }
    }

    setPointer(age){
        const terminalAge = this.data[this.data.length-1].end
        let marginLeft = 0
        let clockPointer = this.obj.getElementsByClassName("clock-pointer")[0]
        let clockStagesRows = this.obj.getElementsByClassName("clock-stage-row")
        for(let i of clockStagesRows){
            i.classList.remove("clock-stage-row-selected")
        }
        for (let i in this.data){
            if ((this.data[i].start <= age) && (age <= this.data[i].end)){
                marginLeft+=((age - this.data[i].start)*100/terminalAge)
                clockStagesRows[i].classList.add("clock-stage-row-selected")
                break
            }
            else{
                marginLeft+=((this.data[i].end - this.data[i].start)*100/terminalAge)
                // console.log()
            }
        }
        clockPointer.style.left = "calc("+marginLeft+"% - 0.25rem)"
        // console.log(marginLeft)
    }
}