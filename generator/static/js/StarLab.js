class StarLab{
    clock
    HRDiagram
    structure

    inputData
    data
    evenedData
    stagesData

    index

    timeoutsIDs
    timeout
    timeoutInc

    isStarted

    isEqualTimeFrameEnabled
    isAutoscalingEnabled

    delayDivider
    averageAgeGapDivider

    constructor(clockID, HRDiagramID, structureID, inputData) {
        this.timeoutInc = 12.5
        this.inputData = inputData

        this.stagesData = []
        this.data = this.inputData

        // this.analyzeData()
        // this.evenData()
        // this.data = this.evenedData


        // console.log(this.data)
        this.index = 0
        this.timeoutsIDs = []
        this.timeout = 100
        this.isStarted = false
        this.isEqualTimeFrameEnabled = false

        this.delayDivider = 1
        this.averageAgeGapDivider = 20

        this.clock = new Clock(clockID, this)
        this.HRDiagram = new HRDiagram(HRDiagramID, this)
        this.structure = new Structure(structureID, this)

        // this.HRDiagram.build(this.inputData, false)
        // this.HRDiagram.genTrack(this.inputData)
        this.analyzeData()
        this.toggleAutoscaling()
    }

    analyzeData(){
        this.stagesData = []
        let stageCounter = -1;
        const checkStageInStagesData = (stage) => {
            let flag = false;
            for(let i of this.stagesData){
                if(i.stage===stage){
                    flag = true;
                    break
                }
            }
            return flag
        }

        for (let i = 1; i < this.data.length;++i){
            if(checkStageInStagesData(this.data[i-1].properties.stage)){
                if(this.data[i-1].properties.stage!==this.data[i].properties.stage || i === this.data.length-1){
                    this.stagesData[stageCounter].endAge = this.data[i-1].properties.age
                    this.stagesData[stageCounter].endIndex = i-1
                }
            }else{
                this.stagesData.push({
                    stage: this.data[i-1].properties.stage,
                    startAge: this.data[i-1].properties.age,
                    startIndex: i-1,
                    endAge: undefined,
                    endIndex: undefined
                })
                ++stageCounter
            }
        }
        this.clock.build(this.stagesData)
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
            i.innerText = value
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
        if (this.index >= this.data.length - 1 && this.isStarted) {
            this.togglePlay()
        }
    }

    start() {
        this.timeout = 0
        if (this.index >= this.data.length - 1) {
            this.index = 0
        }
        for (let i = this.index; i < this.data.length; ++i) {
            this.timeoutsIDs.push(setTimeout(()=>{this.step(this.data[i])}, this.timeout += this.data[i].delay===-1 ? this.timeoutInc : this.data[i].delay/this.delayDivider))
        }
        this.isStarted = true
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
    }

    toggleEqualTimeFrame(){
        let checkbox = document.getElementById("equal-timeframeCB")
        this.isEqualTimeFrameEnabled = checkbox.checked
        let curAge = this.data[this.index].properties.age
        this.togglePlay()
        if (this.isEqualTimeFrameEnabled) {
            // console.log("ENABLED")
            this.analyzeData()
            this.evenData()
            this.data = this.evenedData
        } else {
            // console.log("DISABLED")
            this.data = this.inputData
            this.analyzeData()
        }
        this.rewindByAge(curAge)
        this.togglePlay()
        this.changeSpeed(1)
    }

    toggleAutoscaling(){
        let checkbox = document.getElementById("enable-autoscaling")
        this.isAutoscalingEnabled = checkbox.checked
        this.HRDiagram.build(this.inputData, this.isAutoscalingEnabled)
        this.step(this.data[this.index])
        --this.index
    }

    stop() {
        for (let i of this.timeoutsIDs) {
            clearTimeout(i)
        }
        this.timeoutsIDs = []
        this.isStarted = false
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
        --this.index
    }

    changeSpeed(divider) {
        if(this.isEqualTimeFrameEnabled){
            this.togglePlay()
            this.delayDivider *= divider
            this.togglePlay()
            document.getElementById("speed").innerHTML = this.beautifyNumber((1000/this.timeoutInc)*((this.inputData[this.inputData.length-1].properties.age)/this.inputData.length/this.averageAgeGapDivider)*this.delayDivider, 2)  + " Years/s"
        }
        else {
            this.togglePlay();
            this.timeoutInc /= divider;
            this.togglePlay();
            document.getElementById("speed").innerHTML = 1000 / this.timeoutInc + " FPS"
        }
    }


    evenData(){
        // TODO
        this.evenedData = []

        const terminalAge = this.inputData[this.inputData.length-1].properties.age

        const averageAgeGap = terminalAge/this.inputData.length/this.averageAgeGapDivider

        // console.log("AVG: "+averageAgeGap)

        const findLeftBound = (startIndex, age) => {
            let i = startIndex
            while(i < this.inputData.length){
                if(this.inputData[i].properties.age > age){
                   return i
                }
                ++i;
            }
            return i-1
        }

        const stagePointsAmount = 1000
        const delayIncThreshold = 30
        for(let i in this.stagesData){
            const ageDelta = (this.stagesData[i].endAge - this.stagesData[i].startAge)

            let stagePointsAmountMultiplier = Math.max(Math.ceil((ageDelta*this.timeoutInc)/(delayIncThreshold*stagePointsAmount*averageAgeGap)), 1)
            let calculatedAgeGap = ageDelta/(stagePointsAmount*stagePointsAmountMultiplier)
            let calculatedDelayInc = calculatedAgeGap*this.timeoutInc/averageAgeGap

            let hintIndex = this.stagesData[i].startIndex
            

            for(let j = this.stagesData[i].startAge; j < this.stagesData[i].endAge;j+=calculatedAgeGap){
                let leftBoundIndex = findLeftBound(hintIndex, j)
                let leftBoundAge = this.inputData[leftBoundIndex].properties.age

                let rightBoundIndex = Math.min(leftBoundIndex+1, this.inputData.length-1)
                let rightBoundAge = this.inputData[rightBoundIndex].properties.age

                hintIndex=leftBoundIndex


                let deltaAgeA = rightBoundAge-j
                let deltaAgeA_B = rightBoundAge-leftBoundAge

                let k = deltaAgeA_B/deltaAgeA


                this.evenedData.push({
                    structure: false,
                    properties: {
                        luminosity: linearScaleByK(this.inputData[leftBoundIndex].properties.luminosity, this.inputData[rightBoundIndex].properties.luminosity, k),
                        temperature: linearScaleByK(this.inputData[leftBoundIndex].properties.temperature, this.inputData[rightBoundIndex].properties.temperature, k),
                        stage: this.inputData[leftBoundIndex].properties.stage,
                        age: j,
                        radius: linearScaleByK(this.inputData[leftBoundIndex].properties.radius, this.inputData[rightBoundIndex].properties.radius, k),
                        mass: linearScaleByK(this.inputData[leftBoundIndex].properties.mass, this.inputData[rightBoundIndex].properties.mass, k),
                    },
                    delay: calculatedDelayInc
                })

            }
        }
    }



}