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
        const terminalAge = data[data.length-1].endAge
        let colorIndex = 0
        let clockBody = this.obj.getElementsByClassName("clock-body")[0]
        clockBody.addEventListener("click", (event)=>{this.rewindByClickOnClock(event)})
        let clockStages = this.obj.getElementsByClassName("clock-stages")[0]
        clockBody.innerHTML = ""
        clockStages.innerHTML = ""
        for(let i in data){
            let block = document.createElement("div")
            let width = (data[i].endAge - data[i].startAge)*100/terminalAge
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
            stageRow.onclick = ()=>{this.starlab.rewindByAge(data[i].startAge)}


            clockStages.appendChild(stageRow)

            ++colorIndex
        }
    }
    rewindByClickOnClock(event){
        let clockBody = this.obj.getElementsByClassName("clock-body")[0]
        let clockBodyRect = clockBody.getBoundingClientRect()
        let cursorX = event.pageX
        let age = (cursorX-clockBodyRect.x)/clockBodyRect.width*this.data[this.data.length-1].endAge
        this.starlab.rewindByAge(age)
    }
    setPointer(age){
        const terminalAge = this.data[this.data.length-1].endAge
        let marginLeft = 0
        let clockPointer = this.obj.getElementsByClassName("clock-pointer")[0]
        let clockStagesRows = this.obj.getElementsByClassName("clock-stage-row")
        for(let i of clockStagesRows){
            i.classList.remove("clock-stage-row-selected")
        }
        for (let i in this.data){
            if ((this.data[i].startAge <= age) && (age <= this.data[i].endAge)){
                marginLeft+=((age - this.data[i].startAge)*100/terminalAge)
                clockStagesRows[i].classList.add("clock-stage-row-selected")
                break
            }
            else{
                marginLeft+=((this.data[i].endAge - this.data[i].startAge)*100/terminalAge)
                // console.log()
            }
        }
        clockPointer.style.left = "calc("+marginLeft+"% - 0.25rem)"
        // console.log(marginLeft)
    }
}