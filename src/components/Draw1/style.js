import styled from "styled-components"
import paintBrush from "../../images/paint-brush.png"

const S = {};

S.Container1 = styled.div`
    height: 35rem;
    width: 35rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 5rem;
    border: 0.1rem solid black;
    background-color: rgb(167, 218, 250);
`

S.UtilityLeft = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`

S.UtilityRight = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
`
S.Container2 = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`

S.Canvas = styled.canvas`
    &:hover {
        cursor: url(${paintBrush}) 2 20, auto;
    }
`

S.UtilityTop = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: flex-end;
`

S.UtilityBottom = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`
S.Color = styled.button`
    width: 2.5rem;
    height: 2.5rem;
    margin: 0.25rem;
    border-radius: 0.5rem;
    background-color: ${props => props.color};
    border: 0.08rem solid black;
    &.selected {
        box-shadow: 0 0 6px 6px white;
    }
    &:hover {
        cursor: pointer;
    }
`

S.BackgroundColor = styled.button`
    width: 2.5rem;
    height: 2.5rem;
    background-color: ${props => props.color};
    border: 0.1rem solid black;
    border-bottom: 0;
    border-radius: 1rem 1rem 0 0;
    &.selected {
        height: 3.5rem;
    }
`
S.WhiteSquare = styled.div`
    height: 2.8rem;
    width: 2.8rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
`

S.PaintSize = styled.button`
    border: none;
    border-radius: 100rem;
    background-color: black;
    &.small {
        height: 0.8rem;
        width: 0.8rem;
    }
    &.medium {
        height: 1.25rem;
        width: 1.25rem;
    }
    &.large {
        height: 1.7rem;
        width: 1.7rem;
    }
    &:focus {
        outline: 0;
    }
`

S.Undo = styled.i`
    height: 2.8rem;
    font-size: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    color: black;
    margin: 1rem;
    transition: 0.1s ease-in-out;
    &:hover {
        color: white;
    }
`

S.ClearCanvas = styled.i`
    height: 2.8rem;
    width: 2.8rem;
    font-size: 2rem;
    margin: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.1s ease-in-out;
    &:hover {
        color: white;
    }
`


export default S