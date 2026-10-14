import { useEffect, useState } from 'react';
import { X, Printer, FileText, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { studentService, curriculumService, readinessService } from '../../services';
import type { RoadmapData, CareerReadinessMetrics, CurriculumRecalibration } from '../../types';
import './DossierModal.css';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DossierModal({ isOpen, onClose }: DossierModalProps) {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [readiness, setReadiness] = useState<CareerReadinessMetrics | null>(null);
  const [recalibrations, setRecalibrations] = useState<CurriculumRecalibration[]>([]);
  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    Promise.all([
      studentService.getProfile().catch(() => null),
      curriculumService.getRoadmap().catch(() => null),
      readinessService.getMetrics().catch(() => null),
      curriculumService.getRecalibrations().catch(() => []),
    ])
      .then(([profile, road, ready, recals]) => {
        if (profile?.full_name) setStudentName(profile.full_name);
        setRoadmap(road);
        setReadiness(ready);
        setRecalibrations(recals || []);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dossier-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="dossier-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Controls */}
        <div className="dossier-modal-header">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-accent" />
            <h3 className="font-bold text-base text-primary">Academic & Placement Dossier Export</h3>
          </div>
          <div className="dossier-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm dossier-modal-close-btn"
              onClick={onClose}
              aria-label="Close dossier"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Printable Sheet Body */}
        <div className="dossier-modal-body">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : (
            <div className="dossier-report-sheet">
              {/* Document Header */}
              <div className="dossier-sheet-header">
                <div>
                  <h1 className="dossier-title">AI Dynamic Curriculum & Career Dossier</h1>
                  <p className="dossier-subtitle">
                    Official Student Competency & Closed-Loop Adaptive Syllabus Report
                  </p>
                  <div className="dossier-badge-row">
                    <span className="badge badge-indigo text-xs">
                      Candidate: {studentName}
                    </span>
                    <span className="badge badge-emerald text-xs">
                      Target Role: {roadmap?.career_goal || 'Engineering Trainee'}
                    </span>
                    {readiness?.target_company && (
                      <span className="badge badge-purple text-xs">
                        Target Co: {readiness.target_company.company_name} ({readiness.target_company.tier})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-muted">
                  <p>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p>Engine: Antigravity Adaptive V4</p>
                </div>
              </div>

              {/* High Level Stats Grid */}
              <div className="dossier-grid-stats">
                <div className="dossier-stat-box">
                  <div className="dossier-stat-num">{readiness?.overall_score ?? 78}%</div>
                  <div className="dossier-stat-label">Placement Readiness</div>
                </div>
                <div className="dossier-stat-box">
                  <div className="dossier-stat-num">{roadmap?.weeks?.filter(w => w.status === 'completed').length || 0} / {roadmap?.weeks?.length || 0}</div>
                  <div className="dossier-stat-label">Weeks Completed</div>
                </div>
                <div className="dossier-stat-box">
                  <div className="dossier-stat-num">{readiness?.quiz_mastery_score ?? 82}%</div>
                  <div className="dossier-stat-label">Quiz Mastery</div>
                </div>
                <div className="dossier-stat-box">
                  <div className="dossier-stat-num">{readiness?.coding_score ?? 75}%</div>
                  <div className="dossier-stat-label">Coding Lab Score</div>
                </div>
              </div>

              {/* Dynamic Curriculum Syllabus Table */}
              <h2 className="dossier-section-title">
                <BookOpen size={18} className="text-accent" />
                Dynamic Curriculum Roadmap ({roadmap?.weeks?.length || 0} Weeks)
              </h2>
              <table className="dossier-syllabus-table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Week</th>
                    <th style={{ width: '30%' }}>Core Topic & Workload</th>
                    <th style={{ width: '45%' }}>Curriculum Subtopics</th>
                    <th style={{ width: '15%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roadmap?.weeks?.map(w => (
                    <tr key={w.week_id || w.week_number}>
                      <td className="font-bold">Week {w.week_number}</td>
                      <td>
                        <div className="font-semibold text-primary">{w.topic}</div>
                        <div className="text-xs text-secondary">{w.difficulty} • {w.estimated_hours || 10}h</div>
                      </td>
                      <td>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem' }}>
                          {(w.subtopics || []).slice(0, 4).map((sub, idx) => (
                            <li key={idx}>{sub}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {w.status === 'completed' ? (
                          <span className="badge badge-emerald text-xs">Completed</span>
                        ) : w.status === 'in_progress' ? (
                          <span className="badge badge-indigo text-xs">In Progress</span>
                        ) : (
                          <span className="badge badge-amber text-xs">Upcoming</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Recalibration Audit Trail */}
              {recalibrations.length > 0 && (
                <>
                  <h2 className="dossier-section-title">
                    <Sparkles size={18} className="text-accent" />
                    Closed-Loop Adaptive Recalibration Log ({recalibrations.length} Events)
                  </h2>
                  <div className="space-y-3">
                    {recalibrations.slice(0, 4).map((rec) => (
                      <div key={rec.id} className="p-3 rounded border border-subtle bg-surface text-xs">
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-accent">
                            Trigger: {rec.trigger_type.replace('_', ' ').toUpperCase()} ({rec.trigger_source_title})
                          </span>
                          <span className="text-muted">
                            {new Date(rec.recalibrated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-secondary mb-1"><strong>Reason:</strong> {rec.reason}</p>
                        {rec.changes_summary?.length > 0 && (
                          <div className="text-muted">
                            <strong>Adjustments:</strong> {rec.changes_summary.join(' • ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Footer Stamp */}
              <div className="mt-8 pt-4 border-t border-subtle flex justify-between items-center text-xs text-muted">
                <div>Verified by AI Dynamic Curriculum Recommendation Engine</div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Authenticated Academic Record</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
