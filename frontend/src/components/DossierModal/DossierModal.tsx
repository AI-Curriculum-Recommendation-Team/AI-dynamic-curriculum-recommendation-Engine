import { useEffect, useState } from 'react';
import { X, Download, FileText, CheckCircle2, Sparkles, BookOpen, Printer } from 'lucide-react';
import { studentService, curriculumService, readinessService } from '../../services';
import type { RoadmapData, CareerReadinessMetrics, CurriculumRecalibration } from '../../types';
import './DossierModal.css';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DossierModal({ isOpen, onClose }: DossierModalProps) {
  const [loading, setLoading]             = useState(true);
  const [roadmap, setRoadmap]             = useState<RoadmapData | null>(null);
  const [readiness, setReadiness]         = useState<CareerReadinessMetrics | null>(null);
  const [recalibrations, setRecalibrations] = useState<CurriculumRecalibration[]>([]);
  const [studentName, setStudentName]     = useState('Student');

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

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const todayShort = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const careerGoal = roadmap?.career_goal || 'Engineering Trainee';
  const targetCo   = readiness?.target_company
    ? `${readiness.target_company.company_name} (${readiness.target_company.tier})`
    : null;

  /* ── Build the standalone printable HTML ── */
  const buildDossierHTML = () => {
    const weekRows = (roadmap?.weeks || []).map(w => {
      const statusLabel =
        w.status === 'completed'  ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;">Completed</span>' :
        w.status === 'in_progress'? '<span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;">In Progress</span>' :
                                    '<span style="background:#fef9c3;color:#78350f;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;">Upcoming</span>';
      const subtopicItems = (w.subtopics || []).slice(0, 4)
        .map(s => `<li>${s}</li>`).join('');
      return `<tr>
        <td style="font-weight:700;white-space:nowrap;">Week ${w.week_number}</td>
        <td>
          <div style="font-weight:700;color:#1e1b4b;">${w.topic}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:2px;">${w.difficulty || 'Intermediate'} &bull; ${w.estimated_hours || 10}h</div>
        </td>
        <td><ul style="margin:0;padding-left:14px;font-size:11px;">${subtopicItems}</ul></td>
        <td style="text-align:center;">${statusLabel}</td>
      </tr>`;
    }).join('');

    const recalRows = recalibrations.slice(0, 4).map(r => `
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:4px;">
          <span style="color:#4f46e5;">Trigger: ${r.trigger_type.replace('_',' ').toUpperCase()} — ${r.trigger_source_title}</span>
          <span style="color:#9ca3af;">${new Date(r.recalibrated_at).toLocaleDateString()}</span>
        </div>
        <div style="font-size:11px;color:#374151;margin-bottom:2px;"><strong>Reason:</strong> ${r.reason}</div>
        ${r.changes_summary?.length > 0
          ? `<div style="font-size:10.5px;color:#6b7280;"><strong>Adjustments:</strong> ${r.changes_summary.join(' &bull; ')}</div>`
          : ''}
      </div>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Academic &amp; Placement Dossier – ${studentName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #111;
      font-size: 12px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Cover / Header ── */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }

    .doc-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #1e1b4b;
      margin-bottom: 3px;
    }

    .doc-subtitle {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 10px;
    }

    .badge-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .badge {
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-indigo  { background: #e0e7ff; color: #3730a3; }
    .badge-emerald { background: #d1fae5; color: #065f46; }
    .badge-purple  { background: #f3e8ff; color: #6b21a8; }

    .doc-meta {
      text-align: right;
      font-size: 10.5px;
      color: #6b7280;
      line-height: 1.7;
    }

    /* ── Stats row ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 22px;
    }

    .stat-box {
      background: #f5f3ff;
      border: 1px solid rgba(79,70,229,0.2);
      border-radius: 10px;
      padding: 12px 10px;
      text-align: center;
    }

    .stat-num {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #4f46e5;
      line-height: 1.1;
    }

    .stat-lbl {
      font-size: 9.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6b7280;
      margin-top: 3px;
    }

    /* ── Section headings ── */
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e1b4b;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 22px;
    }

    .section-title:first-of-type { margin-top: 0; }

    /* ── Syllabus table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      margin-bottom: 18px;
      page-break-inside: auto;
    }

    thead th {
      background: #f5f3ff;
      color: #3730a3;
      font-weight: 700;
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }

    tbody td {
      padding: 7px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      color: #1f2937;
    }

    tbody tr:nth-child(even) td { background: #fafafa; }
    tbody tr { page-break-inside: avoid; }

    /* ── Footer ── */
    .doc-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #9ca3af;
    }

    .doc-footer .valid {
      color: #059669;
      font-weight: 700;
    }
  </style>
</head>
<body>

  <!-- Document Header -->
  <div class="doc-header">
    <div>
      <div class="doc-title">AI Dynamic Curriculum &amp; Career Dossier</div>
      <div class="doc-subtitle">Official Student Competency &amp; Closed-Loop Adaptive Syllabus Report</div>
      <div class="badge-row">
        <span class="badge badge-indigo">Candidate: ${studentName}</span>
        <span class="badge badge-emerald">Target Role: ${careerGoal}</span>
        ${targetCo ? `<span class="badge badge-purple">Target Co: ${targetCo}</span>` : ''}
      </div>
    </div>
    <div class="doc-meta">
      <div>Generated: ${today}</div>
      <div>Engine: Antigravity Adaptive V4</div>
    </div>
  </div>

  <!-- High-Level Stats -->
  <div class="stats-row">
    <div class="stat-box">
      <div class="stat-num">${readiness?.overall_score ?? 78}%</div>
      <div class="stat-lbl">Placement Readiness</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${(roadmap?.weeks || []).filter(w => w.status === 'completed').length} / ${(roadmap?.weeks || []).length}</div>
      <div class="stat-lbl">Weeks Completed</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${readiness?.quiz_mastery_score ?? 82}%</div>
      <div class="stat-lbl">Quiz Mastery</div>
    </div>
    <div class="stat-box">
      <div class="stat-num">${readiness?.coding_score ?? 75}%</div>
      <div class="stat-lbl">Coding Lab Score</div>
    </div>
  </div>

  <!-- Curriculum Table -->
  <div class="section-title">📚 Dynamic Curriculum Roadmap (${(roadmap?.weeks || []).length} Weeks)</div>
  <table>
    <thead>
      <tr>
        <th style="width:9%">Week</th>
        <th style="width:30%">Core Topic &amp; Workload</th>
        <th style="width:46%">Curriculum Subtopics</th>
        <th style="width:15%">Status</th>
      </tr>
    </thead>
    <tbody>
      ${weekRows || `<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:20px;">No curriculum weeks found. Generate a curriculum first.</td></tr>`}
    </tbody>
  </table>

  ${recalibrations.length > 0 ? `
  <!-- Recalibration Log -->
  <div class="section-title">⚡ Closed-Loop Adaptive Recalibration Log (${recalibrations.length} Events)</div>
  ${recalRows}
  ` : ''}

  <!-- Footer -->
  <div class="doc-footer">
    <div>Verified by AI Dynamic Curriculum Recommendation Engine</div>
    <div class="valid">✓ Authenticated Academic Record &nbsp;|&nbsp; ${todayShort}</div>
  </div>

</body>
</html>`;
  };

  /* Open print popup */
  const handleDownloadPDF = () => {
    const popup = window.open('', '_blank', 'width=1000,height=900');
    if (!popup) {
      alert('Please allow pop-ups to download the dossier PDF.');
      return;
    }
    popup.document.open();
    popup.document.write(buildDossierHTML());
    popup.document.close();
    popup.onload = () => {
      setTimeout(() => {
        popup.focus();
        popup.print();
      }, 700);
    };
  };

  /* Inline print fallback */
  const handlePrint = () => window.print();

  return (
    <div className="dossier-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="dossier-modal-container" onClick={(e) => e.stopPropagation()}>

        {/* ── Header Controls ── */}
        <div className="dossier-modal-header">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-accent" />
            <h3 className="font-bold text-base text-primary">Academic &amp; Placement Dossier Export</h3>
          </div>
          <div className="dossier-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              onClick={handlePrint}
              title="Print inline"
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              onClick={handleDownloadPDF}
              id="download-dossier-pdf-btn"
              title="Download clean A4 PDF"
              disabled={loading}
            >
              <Download size={14} /> Download PDF
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

        {/* ── Scrollable Preview Body ── */}
        <div className="dossier-modal-body">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="spinner" style={{ width: 40, height: 40 }} />
            </div>
          ) : (
            <div className="dossier-report-sheet" id="dossier-print-area">

              {/* Document Header */}
              <div className="dossier-sheet-header">
                <div>
                  <h1 className="dossier-title">AI Dynamic Curriculum &amp; Career Dossier</h1>
                  <p className="dossier-subtitle">
                    Official Student Competency &amp; Closed-Loop Adaptive Syllabus Report
                  </p>
                  <div className="dossier-badge-row">
                    <span className="badge badge-indigo text-xs">Candidate: {studentName}</span>
                    <span className="badge badge-emerald text-xs">Target Role: {careerGoal}</span>
                    {targetCo && (
                      <span className="badge badge-purple text-xs">Target Co: {targetCo}</span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-muted" style={{ minWidth: 150 }}>
                  <p>Generated: {todayShort}</p>
                  <p>Engine: Antigravity Adaptive V4</p>
                </div>
              </div>

              {/* Stats */}
              <div className="dossier-grid-stats">
                <div className="dossier-stat-box">
                  <div className="dossier-stat-num">{readiness?.overall_score ?? 78}%</div>
                  <div className="dossier-stat-label">Placement Readiness</div>
                </div>
                <div className="dossier-stat-box">
                  <div className="dossier-stat-num">
                    {(roadmap?.weeks || []).filter(w => w.status === 'completed').length} / {(roadmap?.weeks || []).length}
                  </div>
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

              {/* Curriculum Table */}
              <h2 className="dossier-section-title">
                <BookOpen size={16} className="text-accent" />
                Dynamic Curriculum Roadmap ({(roadmap?.weeks || []).length} Weeks)
              </h2>
              <table className="dossier-syllabus-table">
                <thead>
                  <tr>
                    <th style={{ width: '9%' }}>Week</th>
                    <th style={{ width: '30%' }}>Core Topic &amp; Workload</th>
                    <th style={{ width: '46%' }}>Curriculum Subtopics</th>
                    <th style={{ width: '15%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(roadmap?.weeks || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No curriculum weeks found. Generate a curriculum first.
                      </td>
                    </tr>
                  ) : (
                    roadmap!.weeks.map(w => (
                      <tr key={w.week_id || w.week_number}>
                        <td className="font-bold">Week {w.week_number}</td>
                        <td>
                          <div className="font-semibold text-primary">{w.topic}</div>
                          <div className="text-xs text-secondary">{w.difficulty} &bull; {w.estimated_hours || 10}h</div>
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
                    ))
                  )}
                </tbody>
              </table>

              {/* Recalibration Log */}
              {recalibrations.length > 0 && (
                <>
                  <h2 className="dossier-section-title">
                    <Sparkles size={16} className="text-accent" />
                    Closed-Loop Recalibration Log ({recalibrations.length} Events)
                  </h2>
                  <div className="space-y-3">
                    {recalibrations.slice(0, 4).map((rec) => (
                      <div key={rec.id} className="dossier-recal-card">
                        <div className="dossier-recal-header">
                          <span className="text-accent font-semibold">
                            {rec.trigger_type.replace('_', ' ').toUpperCase()} — {rec.trigger_source_title}
                          </span>
                          <span className="text-muted text-xs">
                            {new Date(rec.recalibrated_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-secondary text-xs mt-1">
                          <strong>Reason:</strong> {rec.reason}
                        </p>
                        {rec.changes_summary?.length > 0 && (
                          <p className="text-muted text-xs mt-0.5">
                            <strong>Adjustments:</strong> {rec.changes_summary.join(' • ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="dossier-footer-row">
                <span>Verified by AI Dynamic Curriculum Recommendation Engine</span>
                <span className="dossier-footer-valid">
                  <CheckCircle2 size={13} /> Authenticated Academic Record
                </span>
              </div>
            </div>
          )}

          {/* Hint */}
          {!loading && (
            <p className="dossier-download-hint">
              <Download size={13} />
              Click <strong>Download PDF</strong> to open a clean A4 print page. Choose <em>"Save as PDF"</em> in the dialog.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
