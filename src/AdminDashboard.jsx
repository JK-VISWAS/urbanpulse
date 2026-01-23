import React, { useState } from 'react';
import FreeMap from './FreeMap';
import { doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import AdminStats from './AdminStats';

const AdminDashboard = ({ reports }) => {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [adminComments, setAdminComments] = useState({});
  const [resolutionFiles, setResolutionFiles] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);

  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdatingStatus(reportId);
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleResolve = async (reportId) => {
    const adminNote = adminNotes[reportId];
    if (!adminNote || adminNote.trim() === '') {
      alert("Please provide a resolution note before marking as resolved.");
      return;
    }

    setUpdatingStatus(reportId);
    try {
      let resolutionImageUrl = "";
      const file = resolutionFiles[reportId];

      if (file) {
        // Upload resolution photo to Firebase Storage
        const storageRef = ref(storage, `resolutions/${reportId}_${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        resolutionImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Update the report in Firestore
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        status: 'resolved',
        adminResolutionNote: adminNote,
        resolutionImageUrl: resolutionImageUrl,
        resolvedAt: serverTimestamp()
      });

      // Clear the form
      setAdminNotes(prev => ({ ...prev, [reportId]: '' }));
      setResolutionFiles(prev => ({ ...prev, [reportId]: null }));
    } catch (error) {
      console.error("Error resolving report:", error);
      alert("Failed to resolve report. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateAdminComment = async (reportId) => {
    const newComment = adminComments[reportId];
    if (!newComment || newComment.trim() === '') {
      alert("Please provide a comment before updating.");
      return;
    }

    setUpdatingStatus(reportId);
    try {
      const reportRef = doc(db, "reports", reportId);
      await updateDoc(reportRef, {
        adminUpdate: newComment,
        lastUpdated: serverTimestamp()
      });
      setAdminComments(prev => ({ ...prev, [reportId]: '' }));
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Failed to update comment. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to permanently delete this report?")) {
      try {
        const reportRef = doc(db, "reports", reportId);
        await deleteDoc(reportRef);
        alert("Report deleted successfully.");
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("Failed to delete report. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <header className="flex justify-between items-center mb-8 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-black italic uppercase">Admin Command Center</h1>
        <div className="flex gap-4">
          <div className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold">Live Data</div>
        </div>
      </header>

      {/* 1. Statistics Dashboard */}
      <AdminStats reports={reports} />

      {/* Admin-Only Spatial Intel Map */}
      <div className="w-full h-[45vh] md:h-[450px] rounded-[32px] md:rounded-[40px] overflow-hidden mb-6 md:mb-12 shadow-2xl border-4 border-white">
        <FreeMap reports={reports} />
      </div>

      {/* Reports Grid with Boxes and Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-[32px] overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-shadow group relative">
            {/* Delete Button - Available for all statuses */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => handleDeleteReport(report.id)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-lg"
                title="Delete Report"
              >
                🗑
              </button>
            </div>

            <div className="h-36 sm:h-40 md:h-48 bg-slate-200 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedReport(report)}>
              {report.imageUrl ? (
                <img src={report.imageUrl} className="w-full h-full object-cover" alt="Report" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase">No Image</div>
              )}
            </div>
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                  {report.category}
                </span>
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${getStatusColor(report.status)}`}>
                  {report.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{report.title}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2">{report.description}</p>

              {/* Address Display */}
              {report.address && (
                <div className="flex items-start gap-1 mb-3 text-xs text-slate-500">
                  <span className="shrink-0">📍</span>
                  <span className="font-medium line-clamp-1" title={report.address}>{report.address}</span>
                </div>
              )}

              {/* Audio Player in Grid Card */}
              {report.audioUrl && (
                <div className="mb-4 p-2 bg-indigo-50 rounded-xl flex items-center gap-2 border border-indigo-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px]">▶</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black uppercase text-indigo-500 block">Voice Note</span>
                    <audio controls src={report.audioUrl} className="w-full h-6" />
                  </div>
                </div>
              )}

              {/* Admin Action Interface */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {/* Status Update */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 italic">📍 Pinned on Map</span>
                  <div className="flex gap-2">
                    <select
                      value={report.status || 'pending'}
                      onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                      disabled={updatingStatus === report.id}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border-0 font-bold uppercase"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Admin Comment Section */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Admin Update:</label>
                  <textarea
                    value={adminComments[report.id] || ''}
                    onChange={(e) => setAdminComments(prev => ({ ...prev, [report.id]: e.target.value }))}
                    placeholder="Write an update for the user..."
                    className="w-full p-3 text-sm border border-slate-200 rounded-xl resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    rows="2"
                  />
                  <button
                    onClick={() => updateAdminComment(report.id)}
                    disabled={updatingStatus === report.id || !adminComments[report.id]?.trim()}
                    className="w-full bg-indigo-600 text-white text-xs font-bold uppercase py-2 px-4 rounded-xl hover:bg-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingStatus === report.id ? 'UPDATING...' : 'SEND UPDATE'}
                  </button>
                </div>

                {/* Resolution Section - Only show if not already resolved */}
                {report.status !== 'resolved' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-emerald-600 uppercase">Resolution Details:</label>

                    {/* Photo Upload for Resolution Proof */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setResolutionFiles(prev => ({ ...prev, [report.id]: e.target.files[0] }))}
                        className="hidden"
                        id={`resolution-photo-${report.id}`}
                      />
                      <label
                        htmlFor={`resolution-photo-${report.id}`}
                        className="flex flex-col items-center justify-center w-full h-20 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-100 transition-all"
                      >
                        {resolutionFiles[report.id] ? (
                          <div className="text-center">
                            <span className="text-emerald-600 font-bold text-xs">📸 Photo Selected</span>
                            <p className="text-emerald-500 text-xs mt-1">{resolutionFiles[report.id].name}</p>
                          </div>
                        ) : (
                          <>
                            <span className="text-emerald-400 text-xs">📷 Upload Resolution Photo</span>
                            <span className="text-emerald-300 text-xs">(Optional)</span>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Resolution Note */}
                    <textarea
                      value={adminNotes[report.id] || ''}
                      onChange={(e) => setAdminNotes(prev => ({ ...prev, [report.id]: e.target.value }))}
                      placeholder="Describe what was done to resolve this issue..."
                      className="w-full p-3 text-sm border border-emerald-200 rounded-xl resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      rows="3"
                    />

                    <button
                      onClick={() => handleResolve(report.id)}
                      disabled={updatingStatus === report.id || !adminNotes[report.id]?.trim()}
                      className="w-full bg-emerald-600 text-white text-xs font-bold uppercase py-3 px-4 rounded-xl hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {updatingStatus === report.id ? 'UPLOADING...' : 'MARK AS RESOLVED'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black italic uppercase">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-900 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Full Image Display */}
            <div className="w-full h-96 bg-slate-100 rounded-2xl overflow-hidden mb-6">
              {selectedReport.imageUrl ? (
                <img src={selectedReport.imageUrl} className="w-full h-full object-cover" alt="Report" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase">No Image Available</div>
              )}
            </div>

            {/* Report Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-500 mb-1">Title</h3>
                <p className="text-lg font-bold text-slate-900">{selectedReport.title}</p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-slate-500 mb-1">Category</h3>
                <p className="text-lg font-bold text-slate-900">{selectedReport.category || 'Uncategorized'}</p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-slate-500 mb-1">Description</h3>
                <p className="text-slate-700">{selectedReport.description}</p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-slate-500 mb-1">Status</h3>
                <span className={`inline-block px-4 py-2 rounded-full font-bold text-xs uppercase ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-slate-500 mb-1">Submitted by</h3>
                <p className="text-sm text-slate-600">{selectedReport.userId}</p>
              </div>

              {selectedReport.location && (
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-500 mb-1">Location</h3>
                  <p className="text-sm text-slate-600">
                    {selectedReport.address ? (
                      <>
                        <span className="block font-bold text-slate-800 mb-1">{selectedReport.address}</span>
                        <span className="text-xs text-slate-400">({selectedReport.location.lat}, {selectedReport.location.lng})</span>
                      </>
                    ) : (
                      `Lat: ${selectedReport.location.lat}, Lng: ${selectedReport.location.lng}`
                    )}
                  </p>
                </div>
              )}

              {/* Audio Player in Modal */}
              {selectedReport.audioUrl && (
                <div className="pt-2">
                  <h3 className="text-xs font-black uppercase text-slate-500 mb-2">Voice Message</h3>
                  <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <audio controls src={selectedReport.audioUrl} className="w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
              className="w-full mt-6 bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
