import type { NextPage } from 'next'
import { useState, useEffect, useRef, LegacyRef } from 'react'
import { Button, Card, Col, Container, Image, Row, Spinner } from 'react-bootstrap'
import Dropzone from 'react-dropzone'
import Jimp from 'jimp';
import CanvasDraw from "react-canvas-draw";
import { useElementSize, useEventListener } from 'usehooks-ts';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import axios from 'axios';
import { useKeyboard } from 'react-keyboard-event'

const renderSize = 880
const Home: NextPage = () => {
    const [selectedFile, setSelectedFile] = useState<any>()
    const [preview, setPreview] = useState<string | undefined>()
    const [result, setResult] = useState<string | undefined>()
    const [uploadingImage, setUploadingImage] = useState(false)
    const [inpainting, setInpainting] = useState(false)
    const [brushSize, setBrushSize] = useState(52)
    const [imgBoxRef, { width: imgBoxWidth, height: imgBoxHeight }] = useElementSize()
    const [showMask, setShowMask] = useState(true)
    const canvasRef = useRef<CanvasDraw>(null)
    const [compare, setCompare] = useState(false)
    useEffect(() => {
        // create the preview
        if (!selectedFile) return
        const objectUrl = URL.createObjectURL(selectedFile)

        Jimp.read(objectUrl).then(async image => {
            let width = image.getWidth()
            let height = image.getHeight()
            const coef = width > height ? renderSize / height : renderSize / width
            image.resize(width * coef, height * coef)
            console.log(width * coef, height * coef);
            let dx= width > height ? (image.getWidth()-renderSize) / 2 : 0
            let dy= width > height ? 0 : (image.getHeight()-renderSize) / 2
            image.crop(dx, dy, renderSize, renderSize)
            setPreview(await image.getBase64Async(Jimp.AUTO as any))
            setUploadingImage(false)
        })

        // free memory when ever this component is unmounted
        // return () => URL.revokeObjectURL(objectUrl)
    }, [selectedFile])
    useEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key == 'z') {
            canvasRef.current?.undo()
        }
    });
    return (
        <Container fluid className='aligns-items-center d-flex justify-content-center text-light' style={{ minHeight: '100%' }}>
            <Row className="justify-content-center d-flex align-items-center" style={{ minHeight: '100%', minWidth: '100%' }}>
                <Col sm={12} lg={5}>
                    <Card className='ratio ratio-1x1' bg='dark'>
                        {/* {preview && <Jimage
                            src={preview}
                        >
                        </Jimage>} */}
                        {/* {preview && <Image src={preview} alt='s'/>} */}
                        {preview && <>
                            <Card.Img src={preview} alt='s' ref={imgBoxRef} />
                            <CanvasDraw
                                ref={canvasRef}
                                // onChange={ }
                                lazyRadius={5}
                                brushRadius={brushSize}
                                backgroundColor='#0000'
                                brushColor='#3DCB87'
                                hideGrid
                                hideInterface
                                canvasHeight={renderSize}
                                canvasWidth={renderSize}
                                style={{
                                    height: imgBoxHeight, width: imgBoxWidth, opacity: showMask ? '0.8' : '0'
                                }}
                            />
                        </>}
                    </Card>
                </Col>
                <Col sm={12} lg={2}>
                    <Dropzone
                        disabled={uploadingImage}
                        onDrop={acceptedFiles => {
                            setUploadingImage(true)
                            if (!acceptedFiles || acceptedFiles.length === 0) {
                                setSelectedFile(undefined)
                                return
                            }

                            // I've kept this example simple by using the first image instead of multiple
                            setSelectedFile(acceptedFiles[0])
                        }}>
                        {({ getRootProps, getInputProps }) => (
                            <Button className='w-100' {...getRootProps()}>
                                <input {...getInputProps()} />
                                {uploadingImage ? <Spinner animation='border' /> : `Select Image`}
                            </Button>
                        )}
                    </Dropzone>

                    <label className='mt-3'>Brush size</label>
                    <Slider
                        min={3}
                        max={47}
                        defaultValue={25}
                        // startPoint={25}
                        onChange={(v) => setBrushSize(v as number)}
                    />
                    <Button variant={'secondary'} className='w-100 mt-3' disabled={!preview} onClick={() => {
                        setShowMask(!showMask)
                    }}>Toggle Mask</Button>
                    <Button variant='danger' className='w-100 mt-3' disabled={!preview} onClick={() => {
                        canvasRef.current?.clear()
                    }}>Clear Mask</Button>
                    <Button className='w-100 mt-3' disabled={!preview || inpainting} onClick={() => {
                        setInpainting(true)
                        axios.post(`/api/inpaint`, {
                            image: preview,
                            mask: (canvasRef.current as any)?.getDataURL()
                        }).then(res => {
                            console.log(res);

                            setResult(res.data.image)
                            setInpainting(false)
                        })
                        // setResult()
                    }}>{inpainting ? <Spinner animation='border' /> : `Inpaint`}</Button>

                    <Button variant={'secondary'} className='w-100 mt-3' disabled={!result} onClick={() => {
                        setCompare(!compare)
                    }}>Toggle Compare</Button>
                </Col>
                <Col sm={12} lg={5}>
                    <Card className='ratio ratio-1x1' bg='dark'>
                        {result && <Card.Img src={compare ? preview : result} alt='s' />}
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default Home
