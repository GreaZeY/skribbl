import React from 'react'
import { useRef, useState, useEffect } from 'react';
import socket from '../common/socket';


const strokeSize = 5
let drawing = false, timeoutHandle = null
const D2Canvas = ({styles,roomId}) => {

    const [isYourTurn, setIsYourTurn] = useState(true)
    const canvasRef = useRef()

    let ctx = canvasRef.current?.getContext("2d");

    useEffect(() => {
        document?.addEventListener('pointerup', resetEvents)
        socket.on('update-canvas', updateCanvas)
        return () => {
            document?.removeEventListener('pointerup', resetEvents)
            socket.off('update-canvas', updateCanvas)
        }

    }, [])

    const updateCanvas = points => {
        if (drawing) return
        if (timeoutHandle) clearTimeout(timeoutHandle);
        drawOnCanvas(points)
        timeoutHandle = setTimeout(() => {
            ctx?.beginPath()
            timeoutHandle = null
        }, 100)
    }

    const getPoints = (evt) => {

        // if (!isYourTurn) return
        if (!drawing) return
        var rect = canvasRef.current.getBoundingClientRect();
        let x = evt.clientX - rect.left, y = evt.clientY - rect.top
        drawOnCanvas({ x, y })
        socket.emit('update-canvas', {roomId,points:{ x, y }})

    }

    const drawOnCanvas = (points) => {
        ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return
        const { x, y } = points

        ctx.lineWidth = strokeSize;
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y)
        ctx.stroke()
        // ctx.closePath();
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const resetEvents = () => {
        drawing = false
        ctx?.beginPath()
    }

    return (
        <div className={styles.canvasContainer}>
            <canvas
                ref={canvasRef}
                height='600px'
                width='800px'
                className={styles.canvas}
                onPointerMove={getPoints}
                onPointerDown={() => drawing = true}
                onPointerUp={resetEvents}
                onMouseLeave={() => ctx?.beginPath()}
            >
                Canvas is not supported on your Browser
            </canvas>
        </div>
    )
}

export default D2Canvas
