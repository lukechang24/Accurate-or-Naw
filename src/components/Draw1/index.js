import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { withFirebase } from "../Firebase"
import S from "./style"

class Draw1 extends Component {
    state = {
        canvas: {
            clickX: [],
            clickY: [],
            clickDrag: [],
            clickColor: [],
            clickSize: [],
            backgroundColor: "white",
            prompt: ""
        },
        undoHistory: [],
        ctx: null,
        paint: false,
        strokes: 0,
        strokeCount: [],
        doNotMove: false,
        ratio: 1,
    }
    componentDidMount() {
        this.unsubscribe = this.props.firebase.canvasRef1().orderByChild("userId").equalTo(this.props.currentUser.id).on("value", canvases => {
            if(this.props.currentUser.waiting || this.props.phase === "finished") {
                return
            }
            let exists = false
            canvases.forEach(canvas => {
                if(canvas.val().userId === this.props.currentUser.id && canvas.val().roomId === this.props.match.params.id) {
                    exists = true
                    const canvasInfo = {
                        ...canvas.val().canvas
                    }
                    this.setState({
                        ...this.state,
                        canvas: {...canvasInfo},
                        prompt: canvas.val().prompt
                    })
                }
            })
            if(!exists) {
                const newCanvas = {
                    clickX: [],
                    clickY: [],
                    clickDrag: [],
                    clickColor: [],
                    clickSize: [],
                    backgroundColor: "white",
                    prompt: ""
                }
                this.props.firebase.createCanvas1({canvas: newCanvas, roomId: this.props.match.params.id, userId: this.props.currentUser.id, votes: [], createdAt: Date.now(), isSaved: false})
                    .then(canvas1 => {
                        this.props.firebase.findCanvas1(canvas1.key).once("value", canvas2 => {
                            const canvasInfo = {
                                ...canvas2.val().canvas
                            }
                            this.setState({
                                ...this.state,
                                canvas: {...canvasInfo},
                                prompt: ""
                            })
                        })
                    })
            }
        })
        this.setState({
            ctx: document.querySelector(".canvas").getContext("2d")
        })
        this.resize()
        window.addEventListener("resize", this.throttle, false)
        window.addEventListener("keydown", this.undo, false)
    }
    componentDidUpdate() {
        this.redraw()
    }
    resize = () => {
        let container = document.querySelector(".container")
        this.interval1 = setTimeout(() => {
            let newRatio = container.getBoundingClientRect().width/700
            this.setState({
                ratio: newRatio
            })
        }, 500)
    }
    throttle = () => {
        const func = this.resize()
        var waiting = false
        return function () {
            if (!waiting) {
                func.apply(this, arguments)
                waiting = true
                this.interval2 = setTimeout(function () {
                    waiting = false
                }, 500)
            }
        }
    }
    startDrawing = (e) => {
        const gameContainer = document.querySelector(".gameContainer")
        const container = document.querySelector(".container")
        const mouseX = (e.pageX - container.offsetLeft - gameContainer.offsetLeft)/this.state.ratio
        const mouseY = (e.pageY - container.offsetTop - gameContainer.offsetTop)/this.state.ratio
        this.setState({
            paint: true
        })
        this.addClick(mouseX, mouseY, false)
    }
    drawing = (e) => {
        const gameContainer = document.querySelector(".gameContainer")
        const container = document.querySelector(".container")
        if(this.state.paint) {
            this.addClick((e.pageX - container.offsetLeft - gameContainer.offsetLeft)/this.state.ratio, (e.pageY - container.offsetTop - gameContainer.offsetTop)/this.state.ratio, true)
        }
    }
    stopDrawing = () => {
        if(this.state.paint) {
            this.setState({
                strokeCount: [...this.state.strokeCount, this.state.strokes],
                strokes: 0,
            })
        }
        this.setState({
            paint: false,
        }, () => {
            this.props.firebase.canvasRef1().orderByChild("userId").equalTo(this.props.currentUser.id).once("value", canvases => {
                canvases.forEach(canvas => {
                    this.props.firebase.findCanvas1(canvas.key).update({canvas: {...this.state.canvas}})
                })
            })
        })
    }
    addClick = (x, y, dragging) => {
        const curColor = this.props.mode === "pen" ? this.props.curColor : "white"
        const curSize = this.props.mode === "pen" ? this.props.curSize : 30
        const clickX = this.state.canvas.clickX ? this.state.canvas.clickX : []
        const clickY = this.state.canvas.clickY ? this.state.canvas.clickY : []
        const clickDrag = this.state.canvas.clickDrag ? this.state.canvas.clickDrag : []
        const clickColor = this.state.canvas.clickColor ? this.state.canvas.clickColor : []
        const clickSize = this.state.canvas.clickSize ? this.state.canvas.clickSize : []
        this.setState({
            canvas: {
                ...this.state.canvas,
                clickX: [...clickX, x],
                clickY: [...clickY, y],
                clickDrag: [...clickDrag, dragging],
                clickColor: [...clickColor, curColor],
                clickSize: [...clickSize, curSize],
            },
            strokes: this.state.strokes+1
        })
    }
    redraw = () => {
        if(this.state.doNotDraw) {
            return
        }
        const { ctx } = this.state
        const { backgroundColor } = this.state.canvas
        const clickX = this.state.canvas.clickX ? this.state.canvas.clickX : []
        const clickY = this.state.canvas.clickY ? this.state.canvas.clickY : []
        const clickSize = this.state.canvas.clickSize ? this.state.canvas.clickSize : []
        const clickColor = this.state.canvas.clickColor ? this.state.canvas.clickColor : []
        const clickDrag = this.state.canvas.clickDrag ? this.state.canvas.clickDrag : []

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.lineJoin = "round"
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, 700, 700);
                    
        for(var i = 0; i < clickX.length; i++) {		
            ctx.beginPath()
            if(clickDrag[i] && i) {
                ctx.moveTo(clickX[i-1], clickY[i-1])
            } else {
                ctx.moveTo(clickX[i]-1, clickY[i])
            }
            ctx.lineTo(clickX[i], clickY[i])
            ctx.closePath()
            ctx.strokeStyle = clickColor[i]
            ctx.lineWidth = clickSize[i]
            ctx.stroke()
        }
        this.setState({
            doNotDraw: true
        }, () => {
            this.interval3 = setTimeout(() => {
                this.setState({doNotDraw: false})
            }, 10)
        })
    }
    changeBackgroundColor = (e) => {
        e.persist()
        this.props.firebase.canvasRef1().orderByChild("userId").equalTo(this.props.currentUser.id).once("value", canvases => {
            canvases.forEach(canvas => {
                this.props.firebase.findCanvas1(canvas.key).update({canvas: {...canvas.val().canvas, backgroundColor: e.target.name}})
            })
        })
    }
    undo = (e, clicked) => {
        if(e.ctrlKey && e.which === 90 || clicked) {
            const recentStroke = this.state.strokeCount.pop()
            const { clickX, clickY, clickDrag, clickColor, clickSize } = this.state.canvas
            const canvasInfo = {
                ...this.state.canvas,
                clickX: clickX.slice(0, clickX.length - recentStroke),
                clickY: clickY.slice(0, clickY.length - recentStroke),
                clickDrag: clickDrag.slice(0, clickDrag.length-recentStroke),
                clickColor: clickColor.slice(0, clickColor.length - recentStroke),
                clickSize: clickSize.slice(0, clickSize.length - recentStroke),
            }
            this.props.firebase.canvasRef1().orderByChild("userId").equalTo(this.props.currentUser.id).once("value", canvases => {
                canvases.forEach(canvas => {
                    this.props.firebase.findCanvas1(canvas.key).update({canvas: {...canvasInfo}})
                })
            })
        }
    }
    clearCanvas = (e) => {
        const { ctx } = this.state
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        const canvasInfo = {
            ...this.state.canvas,
            clickX: [],
            clickY: [],
            clickDrag: [],
            clickColor: [],
            clickSize: [],
        }
        this.setState({
            canvas: canvasInfo
        })
        this.props.firebase.canvasRef1().orderByChild("userId").equalTo(this.props.currentUser.id).once("value", canvases => {
            canvases.forEach(canvas => {
                this.props.firebase.findCanvas1(canvas.key).update({canvas: {...canvasInfo}})
            })
        })
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.throttle, false)
        window.removeEventListener("keydown", this.undo, false)
        this.props.firebase.canvasRef1().orderByChild("userId").equalTo(this.props.currentUser.id).off("value", this.unsubscribe1)
        clearInterval(this.interval1)
        clearInterval(this.interval2)
        clearInterval(this.interval3)
    }
    render() {
        return(
            <S.Container1 className={this.props.phase.indexOf("vote") !== -1 ? "hide" : ""}>
                <S.CanvasContainer className="container">
                    <S.Canvas 
                        className="canvas"
                        width="700" 
                        height="700" 
                        onMouseDown={this.startDrawing}
                        onMouseMove={this.drawing}
                        onMouseUp={this.stopDrawing}
                        onMouseLeave={this.stopDrawing}
                    ></S.Canvas>
                    <S.Prompt><span>Draw: </span>{this.state.canvas.prompt}</S.Prompt>
                    <S.TrashCan className="fas fa-trash-alt clear" onClick={this.clearCanvas}></S.TrashCan>
                    <S.Undo className="fas fa-undo" onClick={(e) => {this.undo(e, true)}}></S.Undo>
                </S.CanvasContainer>
            </S.Container1>
        )
    }
}

export default withRouter(withFirebase(Draw1))