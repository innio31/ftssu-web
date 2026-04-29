import React, { useState, useRef } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import imageCompression from 'browser-image-compression'

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export default function ImageUploadModal({ isOpen, onClose, onImageUpload, currentImage }) {
    const [imgSrc, setImgSrc] = useState(null)
    const [crop, setCrop] = useState()
    const [completedCrop, setCompletedCrop] = useState()
    const [loading, setLoading] = useState(false)
    const imgRef = useRef(null)

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener('load', () => {
                setImgSrc(reader.result)
            })
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget
        const crop = centerAspectCrop(width, height, 1)
        setCrop(crop)
    }

    const compressImage = async (file) => {
        const options = {
            maxSizeMB: 0.15,
            maxWidthOrHeight: 800,
            useWebWorker: true,
            fileType: 'image/jpeg',
        }

        try {
            const compressedFile = await imageCompression(file, options)
            return compressedFile
        } catch (error) {
            console.error('Compression error:', error)
            return file
        }
    }

    const getCroppedImg = () => {
        return new Promise((resolve, reject) => {
            if (!completedCrop || !imgRef.current) {
                reject(new Error('No crop selected'))
                return
            }

            const canvas = document.createElement('canvas')
            const image = imgRef.current
            const crop = completedCrop
            const scaleX = image.naturalWidth / image.width
            const scaleY = image.naturalHeight / image.height
            const ctx = canvas.getContext('2d')

            canvas.width = crop.width
            canvas.height = crop.height

            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height
            )

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }

                const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' })
                const compressedFile = await compressImage(file)
                resolve(compressedFile)
            }, 'image/jpeg', 0.9)
        })
    }

    const handleUpload = async () => {
        if (!completedCrop) {
            alert('Please select a crop area for your profile picture')
            return
        }

        setLoading(true)
        try {
            const croppedImage = await getCroppedImg()
            onImageUpload(croppedImage)
            handleClose()
        } catch (error) {
            console.error('Crop error:', error)
            alert('Failed to crop image. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setImgSrc(null)
        setCrop(null)
        setCompletedCrop(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Upload Profile Picture</h2>
                    <button onClick={handleClose} className="text-gray-500 text-2xl hover:text-gray-700">
                        &times;
                    </button>
                </div>

                <div className="p-6">
                    {!imgSrc ? (
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="w-32 h-32 rounded-full mx-auto overflow-hidden bg-gray-100">
                                    {currentImage ? (
                                        <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-4xl">📷</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Current Picture</p>
                            </div>

                            <label className="block">
                                <span className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-red-700 inline-block">
                                    Select New Image
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onSelectFile}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-4">
                                Recommended: Square image, will be compressed to under 150KB
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Crop your image (square format)</p>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop
                                >
                                    <img
                                        ref={imgRef}
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        alt="Crop preview"
                                        className="max-w-full"
                                    />
                                </ReactCrop>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setImgSrc(null)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Upload & Crop'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}