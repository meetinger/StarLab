class StarLab{
    clock
    HRDiagram
    structure

    inputData
    data
    evenedData
    clockData

    index

    timeoutsIDs
    timeout
    timeoutInc

    isStarted

    constructor(clockID, HRDiagramID, structureID, inputData) {
        this.inputData = inputData
        this.data = this.inputData
        this.index = 0
        this.timeoutsIDs = []
        this.timeout = 100
        this.timeoutInc = 12.5
        this.isStarted = false
        this.clockData = []

        this.clock = new Clock(clockID, this)
        this.HRDiagram = new HRDiagram(HRDiagramID, this)
        this.structure = new Structure(structureID, this)

        this.HRDiagram.genTrack(this.data)
        this.analyzeData()
        this.clock.build(this.clockData)
    }

    analyzeData(){
        let stageCounter = -1;
        const checkStageInClockData = (stage) => {
            let flag = false;
            for(let i of this.clockData){
                if(i.stage===stage){
                    flag = true;
                    break
                }
            }
            return flag
        }

        for (let i = 1; i < this.data.length;++i){
            if(checkStageInClockData(this.data[i-1].properties.stage)){
                if(this.data[i-1].properties.stage!==this.data[i].properties.stage || i === this.data.length-1){
                    this.clockData[stageCounter].end = this.data[i-1].properties.age
                }
            }else{
                this.clockData.push({
                    stage: this.data[i-1].properties.stage,
                    start: this.data[i-1].properties.age,
                    end: undefined
                })
                ++stageCounter
            }
        }
    }

    beautifyNumber(num, toFixed=0){
        let str = Math.trunc(num)+""
        let res = ""
        for(let i = 0; i < str.length;++i){
            res += str[i]
            if((i + (3 - str.length % 3) + 1) % 3 === 0){
                res+=" "
            }
        }

        let frac = (num.toFixed(toFixed)%1).toFixed(toFixed)
        res = res.trim() + (frac+"").substring(1)

        return res
    }

    setProp(label, value) {
        let labels = document.getElementsByClassName(label)
        for (let i of labels) {
            i.innerHTML = value
        }
    }

    phaseToStr(phase) {
        const arr = {
        "-1": "PMS",
        0: "MS",

        1:"MS",

        2: "RGB",
        3: "CHeB",
        4: "EAGB",
        5: "TPAGB",
        6: "PAGB",

        7: "PAGB",
        8: "WR",

        9: "WR",
        }
        return arr[Math.round(phase)]
    }

    step(stage) {
        ++this.index;
        this.HRDiagram.setPoint(stage.properties.luminosity, stage.properties.temperature)
        this.structure.setStructure(stage)
        this.setProp("age-label", this.beautifyNumber(stage.properties.age, 2))
        this.setProp("luminosity-label", stage.properties.luminosity.toFixed(3))
        this.setProp("temperature-label", stage.properties.temperature.toFixed(2))
        this.setProp("radius-label", stage.properties.radius.toFixed(2))
        this.setProp("mass-label", stage.properties.mass.toFixed(2))
        this.setProp("stage-label", this.phaseToStr(stage.properties.stage))
        this.clock.setPointer(stage.properties.age)
        if (this.index >= this.data.length - 1) {
            this.togglePlay()
        }
    }

    start() {
        this.timeout = 0
        if (this.index >= this.data.length - 1) {
            this.index = 0
        }
        for (let i = this.index; i < this.data.length; ++i) {
            this.timeoutsIDs.push(setTimeout(this.step.bind(this), this.timeout += this.timeoutInc, this.data[i]))
        }
    }

    togglePlay() {
        let btn = document.getElementById("start-stop-btn")
        if (this.isStarted) {
            this.stop()
            btn.innerHTML = "Start"
        } else {
            this.start()
            btn.innerHTML = "Stop"
        }
        this.isStarted = !this.isStarted;
    }

    stop() {
        for (let i of this.timeoutsIDs) {
            clearTimeout(i)
        }
        this.timeoutsIDs = []
    }

    rewind(count) {
        this.togglePlay()
        if (this.index + count > (this.data.length - 1)) {
            this.index = this.data.length - 1
        } else if (this.index + count < 0) {
            this.index = 0
        } else {
            this.index = this.index + count;
        }
        this.togglePlay()
        this.step(this.data[this.index])
        --this.index;
    }

    rewindByAge(age){
        this.togglePlay()
        for(let i = 0; i < this.data.length;++i){
            if(age <= this.data[i].properties.age){
                this.index = i
                break
            }
        }
        this.togglePlay()
        this.step(this.data[this.index])

    }

    changeSpeed(divider) {
        this.togglePlay();
        this.timeoutInc /= divider;
        this.togglePlay();
        document.getElementById("fps").innerHTML = 1000 / this.timeoutInc + ""
    }


    evenData(){
        // TODO
        this.evenedData = []

        let averageAgeGap = inputData[inputData.length-1].properties.age/inputData.length


        function linearScale(x, x1, x2, y1, y2){
            return y1+(x-x1)*(y2-y1)/(x2-x1)
        }

        function findLeftBound(startIndex, age){
            let i = startIndex
            while(i >= 0){
                if(inputData[i].properties.age<=age){
                    return i
                }
                --i;
            }
            return i+1
        }

    function findRightBound(startIndex, age){
            let i = startIndex
            while(i < inputData.length){
                if(inputData[i].properties.age>=age){

                   return i
                }
                ++i;
            }
            return i-1
        }

        for(let i = 1; i < inputData.length; ++i){
            let curAge = i*averageAgeGap
            let leftBoundIndex = findLeftBound(i, curAge)
            let leftBoundAge = inputData[leftBoundIndex].properties.age
            let rightBoundIndex = findRightBound(i, curAge)
            let rightBoundAge = inputData[rightBoundIndex].properties.age
            console.log("INDEX LEFT: " + leftBoundIndex)
            console.log("INDEX MID: " + i)
            console.log("INDEX RIGHT: " + rightBoundIndex)
            evenedData.push({
                structure: false,
                properties: {
                    luminosity: linearScale(curAge, leftBoundAge, rightBoundAge, inputData[leftBoundIndex].properties.luminosity, inputData[rightBoundIndex].properties.luminosity),
                    temperature: linearScale(curAge, leftBoundAge, rightBoundAge, inputData[leftBoundIndex].properties.temperature, inputData[rightBoundIndex].properties.temperature),
                    stage: Math.round(linearScale(curAge, leftBoundAge, rightBoundAge, inputData[leftBoundIndex].properties.stage, inputData[rightBoundIndex].properties.stage)),
                    age: curAge,
                    radius: linearScale(curAge, leftBoundAge, rightBoundAge, inputData[leftBoundIndex].properties.radius, inputData[rightBoundIndex].properties.radius),
                    mass: linearScale(curAge, leftBoundAge, rightBoundAge, inputData[leftBoundIndex].properties.mass, inputData[rightBoundIndex].properties.mass),

                }
            })
            i = rightBoundIndex
        }
    }

}