import styled from "styled-components"
import paintBrush from "../../images/paint-brush.png"

const S = {};

S.Container1 = styled.div`
    &.hide {
        display: none;
    }
`

S.CanvasContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 15px;
`

S.Canvas = styled.canvas`
    width: 100%;
    max-width: 1500px;
    min-width: 300px;
    height: auto;
    &:hover {
        cursor: url(${paintBrush}) 2 20, auto;
    }
`

S.Prompt = styled.h2`
    position: absolute;
    top: -50px;
    font-size: 25px;
    color: white;
    user-select: none;
    @media only screen and (max-width: 1040px) {
        top: -40px;
        font-size: 15px;
    }
    /* @media only screen and (max-width: 700px) {
        top: -30px;
        font-size: 10px;
    } */
`

S.Undo = styled.i`
    position: absolute;
    bottom: 5px;
    right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
    &:hover {
        color: grey;
    }
`

S.TrashCan = styled.i`
    position: absolute;
    bottom: 5px;
    left: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
    transition: 0.1s ease-in-out;
    &:hover {
        color: red;
    }
`

export default S