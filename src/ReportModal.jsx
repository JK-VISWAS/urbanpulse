import React, { useState } from 'react';
import { X, Send, MapPin, Camera, Loader2, CheckCircle, Mic, Square, Trash2, Play } from 'lucide-react';
import { auth, db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ReportModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [file, setFile] = useState(null);
    const [address, setAddress] = useState('');

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [timerInterval, setTimerInterval] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Roads',
        description: '',
        imageUrl: '', // We'll store the URL string
        location: null, // Stores { lat, lng }
        address: '' // Stores formatted address
    });

    // 1. GEOLOCATION LOGIC
    const handleGetLocation = async () => {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Fetch address from coordinates
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                        {
                            headers: {
                                'User-Agent': 'UrbanPulse/1.0'
                            }
                        }
                    );
                    const data = await response.json();
                    const formattedAddress = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

                    setFormData({
                        ...formData,
                        location: { lat, lng },
                        address: formattedAddress
                    });
                    setAddress(formattedAddress);
                } catch (error) {
                    console.error('Error fetching address:', error);
                    // Fallback to coordinates if address fetch fails
                    const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    setFormData({
                        ...formData,
                        location: { lat, lng },
                        address: fallbackAddress
                    });
                    setAddress(fallbackAddress);
                }
                setLocationLoading(false);
            },
            (error) => {
                console.error(error);
                setLocationLoading(false);
                alert("Could not get location. Please enable GPS.");
            }
        );
    };

    // 2. IMAGE UPLOAD LOGIC
    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create preview URL for display
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        }
    };

    // 2.5 AUDIO RECORDING LOGIC
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop()); // Stop mic access
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            // Start timer
            const interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            setTimerInterval(interval);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            clearInterval(timerInterval);
            setRecordingTime(0);
        }
    };

    const deleteAudio = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // 3. UPLOAD handled inline in handleSubmit

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = "";
            if (file) {
                const form = new FormData();
                form.append("file", file);
                form.append("upload_preset", "urbanpulse");
                const res = await fetch("https://api.cloudinary.com/v1_1/dx97l3k4d/image/upload", {
                    method: "POST",
                    body: form
                });
                if (!res.ok) {
                    throw new Error("Cloudinary upload failed");
                }
                const data = await res.json();
                imageUrl = data?.secure_url || "";
            }

            let audioDownloadUrl = "";
            if (audioBlob) {
                const form = new FormData();
                form.append("file", audioBlob);
                form.append("upload_preset", "urbanpulse");
                form.append("resource_type", "video"); // Cloudinary treats audio as video usually, or use 'auto'
                const res = await fetch("https://api.cloudinary.com/v1_1/dx97l3k4d/video/upload", {
                    method: "POST",
                    body: form
                });
                if (!res.ok) {
                    throw new Error("Audio upload failed");
                }
                const data = await res.json();
                audioDownloadUrl = data?.secure_url || "";
            }

            // Save the report details with imageUrl to Firestore
            await addDoc(collection(db, "reports"), {
                title: formData.title,
                category: formData.category,
                description: formData.description,
                imageUrl,
                audioUrl: audioDownloadUrl,
                location: formData.location,
                address: formData.address || '', // Save the address
                userId: auth.currentUser.uid,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            // Reset form and close the modal
            setFormData({ title: '', category: 'Roads', description: '', imageUrl: '', location: null, address: '' });
            setPreviewUrl(null);
            setFile(null);
            setAddress('');
            setAudioBlob(null);
            setAudioUrl(null);
            onClose();
        } catch (error) {
            console.error("The actual error is:", error);
            alert("Upload failed! See the browser console (F12) for the real error.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-[48px] p-8 md:p-12 shadow-2xl relative my-auto animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-10">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Report Issue</h2>
                    <p className="text-slate-500 font-bold mt-2">Help optimize our urban grid.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title & Category Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Title</label>
                            <input
                                required
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-5 outline-none transition-all font-bold text-slate-900 shadow-inner"
                                placeholder="Issue name..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Category</label>
                            <select
                                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-5 outline-none transition-all font-bold text-slate-900 shadow-inner appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Roads</option>
                                <option>Sanitation</option>
                                <option>Utilities</option>
                                <option>Vandalism</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Description</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl p-5 outline-none transition-all font-bold text-slate-900 shadow-inner"
                            placeholder="Provide details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Visual Evidence & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <>
                                        <Camera className="text-slate-400 mb-2" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Attach Photo</span>
                                    </>
                                )}
                            </label>
                        </div>

                        <button
                            type="button"
                            onClick={handleGetLocation}
                            className={`flex flex-col items-center justify-center w-full h-32 rounded-[32px] transition-all border-2 p-2 text-center ${formData.location
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-400'
                                }`}
                        >
                            {locationLoading ? (
                                <Loader2 className="animate-spin" />
                            ) : formData.location ? (
                                <>
                                    <CheckCircle className="mb-1" size={20} />
                                    <span className="text-[10px] font-black uppercase tracking-widest mb-1">Pinned</span>
                                    {address && <span className="text-[9px] font-medium leading-tight line-clamp-2 px-2">{address}</span>}
                                </>
                            ) : (
                                <>
                                    <MapPin className="mb-2" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Pin Location</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Audio Recording Section */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Voice Message (Optional)</label>
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[24px] border-2 border-slate-100">
                            {!audioUrl && !isRecording ? (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <Mic size={18} />
                                    </div>
                                    <span>Record Audio</span>
                                </button>
                            ) : isRecording ? (
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center animate-pulse">
                                        <div className="w-3 h-3 bg-rose-600 rounded-full"></div>
                                    </div>
                                    <span className="text-rose-600 font-black text-xs uppercase tracking-widest">{formatTime(recordingTime)}</span>
                                    <button
                                        type="button"
                                        onClick={stopRecording}
                                        className="ml-auto bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase hover:bg-slate-800"
                                    >
                                        Stop
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <Play size={18} fill="currentColor" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-slate-900 font-bold text-xs uppercase block">Audio Recorded</span>
                                        <span className="text-slate-400 text-[10px] font-bold uppercase">Ready to send</span>
                                    </div>
                                    <audio src={audioUrl} controls className="hidden" />
                                    <button
                                        type="button"
                                        onClick={deleteAudio}
                                        className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white p-6 rounded-[32px] font-black text-xl shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
                        {loading ? 'UPLOADING...' : 'SUBMIT DATA'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
