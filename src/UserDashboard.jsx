import React, { useState } from 'react';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const UserDashboard = ({ onOpenModal, reports }) => {
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const deleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteDoc(doc(db, "reports", reportId));
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("Failed to delete report. Please try again.");
      }
    }
  };

  const openEditModal = (report) => {
    setEditingReport(report.id);
    setEditForm({
      title: report.title,
      description: report.description,
      category: report.category
    });
  };

  const saveEdit = async () => {
    try {
      const reportRef = doc(db, "reports", editingReport);
      await updateDoc(reportRef, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        updatedAt: new Date()
      });
      setEditingReport(null);
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditingReport(null);
    setEditForm({ title: '', description: '', category: '' });
  };



  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Action Area */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <h2 className="text-4xl md:text-6xl font-black uppercase text-center mb-8">
            Optimize Your <span className="text-indigo-600 italic">Grid.</span>
          </h2>
          <button
            onClick={onOpenModal}
            className="animate-glow bg-indigo-600 text-white px-12 py-5 rounded-[32px] text-xl font-bold"
          >
            + GET STARTED
          </button>
        </div>
      ) : (
        <>
          {/* Reports Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-8 mb-20">
            {reports.map((report) => (
              <div key={report.id} className={`bg-white rounded-[32px] overflow-hidden shadow-lg border-2 transition-all hover:shadow-2xl group relative ${report.status === 'resolved' ? 'bg-emerald-50 border-emerald-200' : 'border-slate-100'}`}>
                {/* Edit/Delete Overlay */}
                {report.status === 'pending' && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => openEditModal(report)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                      title="Edit Report"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      title="Delete Report"
                    >
                      🗑
                    </button>
                  </div>
                )}

                <div className="h-40 md:h-48 bg-slate-200">
                  {report.imageUrl ? (
                    <img src={report.imageUrl} className="w-full h-full object-cover" alt="Report" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase">No Image</div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-xl">{report.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(report.status)}`}>
                      {report.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>

                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{report.description}</p>

                  {/* Address Display */}
                  {report.address && (
                    <div className="flex items-start gap-1 mb-4 text-xs text-slate-500">
                      <span className="shrink-0">📍</span>
                      <span className="font-medium line-clamp-1" title={report.address}>{report.address}</span>
                    </div>
                  )}

                  {/* Audio Player */}
                  {report.audioUrl && (
                    <div className="mb-4 p-3 bg-indigo-50 rounded-2xl flex items-center gap-3 border border-indigo-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                        ▶
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase text-indigo-500 block mb-1">Voice Message</span>
                        <audio controls src={report.audioUrl} className="w-full h-6" />
                      </div>
                    </div>
                  )}

                  {/* Live Admin Feedback Section */}
                  {report.adminUpdate && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border-l-4 border-indigo-500 animate-slide-up">
                      <p className="text-xs font-black text-indigo-600 uppercase mb-1">Official Admin Response:</p>
                      <p className="text-slate-700 italic">"{report.adminUpdate}"</p>
                    </div>
                  )}

                  {/* Resolution Card - Only show when resolved */}
                  {report.status === 'resolved' && report.adminResolutionNote && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in resolved-card">
                      <h5 className="text-emerald-700 font-bold text-xs uppercase">Resolution Complete:</h5>
                      <p className="text-emerald-900 text-sm mt-1 italic">"{report.adminResolutionNote}"</p>
                      {report.resolutionImageUrl && (
                        <img src={report.resolutionImageUrl} className="w-full h-32 object-cover rounded-xl mt-3" alt="Resolution proof" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Modal */}
          {editingReport && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Edit Report</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl"
                    placeholder="Title"
                  />
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl"
                  >
                    <option>Roads</option>
                    <option>Sanitation</option>
                    <option>Utilities</option>
                    <option>Vandalism</option>
                  </select>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl"
                    rows="3"
                    placeholder="Description"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={saveEdit}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Professional Footer */}
      <footer className="w-full py-16 px-10 bg-slate-900 text-white mt-20 rounded-t-[50px]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="animate-reveal">
            <h3 className="text-3xl font-black italic uppercase text-indigo-500 mb-4">UrbanPulse</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              The next generation of urban logistics. Bridging the gap between citizens and administrators.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Connect</h4>
            <p className="text-slate-300">📧 urbanpulse@gmail.com</p>
            <p className="text-slate-300">📞 +91 8008207802</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">HQ Address</h4>
            <p className="text-slate-300">
              Level 7, T-Hub Phase 2,<br />
              Madhapur, Hyderabad,<br />
              Telangana 500081
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
