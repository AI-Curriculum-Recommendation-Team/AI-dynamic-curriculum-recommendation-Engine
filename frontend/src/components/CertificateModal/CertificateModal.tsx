import { Award, Download, X, Sparkles, ShieldCheck, Printer } from 'lucide-react';
import type { CareerReadinessMetrics, Student } from '../../types';
import './CertificateModal.css';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  metrics: CareerReadinessMetrics | null;
}

export default function CertificateModal({ isOpen, onClose, student, metrics }: CertificateModalProps) {
  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const certId = `ADCR-${student?.id || 101}-${(student?.created_at
    ? new Date(student.created_at).getTime()
    : 1791950000000
  ).toString(36).toUpperCase()}`;

  const topSkills = metrics?.skill_gap_matrix
    ? metrics.skill_gap_matrix.map(s => s.skill).slice(0, 8)
    : ['Python Architecture', 'Algorithmic Problem Solving', 'Full Stack Development', 'System Design', 'Git & CI/CD'];

  const score         = metrics?.overall_score || 85;
  const targetRole    = student?.career_goal?.title || 'Software Engineering Professional';
  const targetCompany = metrics?.target_company?.company_name || 'Industry Standard Tier-1';
  const studentName   = student?.full_name || 'Aspiring Technologist';

  /* ── Build an isolated HTML page and print it in a popup window ── */
  const buildCertHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Certificate – ${studentName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: A4 landscape;
      margin: 14mm 18mm;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #111;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .cert-page {
      width: 100%;
      min-height: 185mm;
      border: 5px double #4f46e5;
      border-radius: 16px;
      padding: 36px 44px 32px;
      position: relative;
      text-align: center;
      background: #fff;
    }

    .cert-page::before {
      content: '';
      position: absolute;
      inset: 8px;
      border: 1.5px solid rgba(79,70,229,0.18);
      border-radius: 11px;
      pointer-events: none;
    }

    /* Watermark */
    .wm {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      font-size: 90px;
      font-weight: 900;
      opacity: 0.035;
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.1em;
      pointer-events: none;
      user-select: none;
      color: #4f46e5;
    }

    /* Ribbon */
    .ribbon {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 18px;
      background: linear-gradient(135deg, rgba(79,70,229,0.12), rgba(168,85,247,0.12));
      border: 1px solid rgba(79,70,229,0.35);
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #4f46e5;
      margin-bottom: 14px;
    }

    h1.cert-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }

    .cert-subtitle {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 20px;
    }

    .presented-to {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #9ca3af;
      margin-bottom: 4px;
    }

    .recipient {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 30px;
      font-weight: 800;
      color: #4f46e5;
      border-bottom: 2px dashed rgba(79,70,229,0.35);
      display: inline-block;
      padding-bottom: 6px;
      min-width: 260px;
      margin-bottom: 14px;
    }

    .statement {
      font-size: 12px;
      line-height: 1.7;
      color: #374151;
      max-width: 600px;
      margin: 0 auto 20px;
    }

    /* Stats row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }

    .stat-box {
      background: #f5f3ff;
      border: 1px solid rgba(79,70,229,0.2);
      border-radius: 10px;
      padding: 10px 8px;
    }

    .stat-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #4f46e5;
    }

    .stat-val.emerald { color: #059669; }
    .stat-val.amber   { color: #d97706; }

    .stat-lbl {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #9ca3af;
      margin-top: 3px;
    }

    /* Skill chips */
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      max-width: 600px;
      margin: 0 auto 22px;
    }

    .chip {
      padding: 3px 10px;
      background: #eef2ff;
      border: 1px solid rgba(79,70,229,0.25);
      border-radius: 9999px;
      font-size: 10px;
      color: #4338ca;
      font-weight: 500;
    }

    /* Footer */
    .cert-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(79,70,229,0.18);
      padding-top: 16px;
    }

    .seal {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }

    .seal-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .seal-circle svg { color: white; }

    .seal-text strong {
      display: block;
      font-size: 11px;
      color: #111;
    }

    .seal-text span {
      font-size: 9.5px;
      color: #6b7280;
    }

    .meta {
      text-align: right;
      font-size: 9.5px;
      color: #9ca3af;
      line-height: 1.7;
    }

    .meta strong { color: #374151; }
    .meta .valid { color: #059669; font-weight: 600; }
  </style>
</head>
<body>
<div class="cert-page">
  <div class="wm">VERIFIED</div>

  <div class="ribbon">
    ✦ AI Curriculum Engine Verified
  </div>

  <h1 class="cert-title">Certificate of Curriculum Mastery</h1>
  <p class="cert-subtitle">Adaptive Competency &amp; Placement Readiness Endorsement</p>

  <div class="presented-to">This is proudly conferred to</div>
  <div class="recipient">${studentName}</div>

  <p class="statement">
    Having successfully demonstrated algorithmic proficiency, completed multi-week dynamic syllabus modules,
    validated weekly topic assessments, and achieved rigorous technical alignment for the role of
    <strong>${targetRole}</strong>.
  </p>

  <div class="stats-row">
    <div class="stat-box">
      <div class="stat-val">${score}%</div>
      <div class="stat-lbl">Placement Index</div>
    </div>
    <div class="stat-box">
      <div class="stat-val emerald">${targetCompany}</div>
      <div class="stat-lbl">Target Benchmark</div>
    </div>
    <div class="stat-box">
      <div class="stat-val amber">Level 4</div>
      <div class="stat-lbl">Mastery Tier</div>
    </div>
  </div>

  <div class="chips">
    ${topSkills.map(sk => `<span class="chip">✓ ${sk}</span>`).join('')}
  </div>

  <div class="cert-footer">
    <div class="seal">
      <div class="seal-circle">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <div class="seal-text">
        <strong>AI Recalibration Engine</strong>
        <span>Google Gemini Dynamic Curriculum Core</span>
      </div>
    </div>
    <div class="meta">
      <div>Issue Date: <strong>${todayStr}</strong></div>
      <div>Verification ID: <strong>${certId}</strong></div>
      <div>Status: <span class="valid">Active &amp; Validated</span></div>
    </div>
  </div>
</div>
</body>
</html>`;

  /* Open print popup */
  const handleDownloadPDF = () => {
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) {
      alert('Please allow pop-ups to download the certificate PDF.');
      return;
    }
    popup.document.open();
    popup.document.write(buildCertHTML());
    popup.document.close();
    // Auto-trigger print after fonts load
    popup.onload = () => {
      setTimeout(() => {
        popup.focus();
        popup.print();
      }, 600);
    };
  };

  /* Inline print (legacy fallback) */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cert-modal-overlay" onClick={onClose}>
      <div className="cert-modal-card animate-scale-up" onClick={e => e.stopPropagation()}>

        {/* ── Modal Header Controls ── */}
        <div className="cert-modal-header">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-indigo-400" />
            <span className="font-bold text-sm text-primary">AI Dynamic Placement Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              onClick={handlePrint}
              id="print-certificate-btn"
              title="Print this page"
            >
              <Printer size={14} /> Print
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              onClick={handleDownloadPDF}
              id="download-certificate-pdf-btn"
              title="Download as PDF (A4 Landscape)"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              aria-label="Close certificate"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Certificate Preview Body ── */}
        <div className="cert-modal-body">
          <div className="cert-frame" id="certificate-print-area">
            <div className="cert-watermark">VERIFIED</div>

            <div className="cert-badge-ribbon">
              <Sparkles size={13} /> AI Curriculum Engine Verified
            </div>

            <h1 className="cert-title">Certificate of Curriculum Mastery</h1>
            <p className="cert-subtitle">Adaptive Competency &amp; Placement Readiness Endorsement</p>

            <div className="cert-presented-to">This is proudly conferred to</div>
            <div className="cert-recipient-name">{studentName}</div>

            <p className="cert-statement">
              Having successfully demonstrated algorithmic proficiency, completed multi-week dynamic syllabus
              modules, validated weekly topic assessments, and achieved rigorous technical alignment for the
              role of <strong>{targetRole}</strong>.
            </p>

            {/* Metrics */}
            <div className="cert-stats-grid">
              <div className="cert-stat-item">
                <div className="cert-stat-val indigo">{score}%</div>
                <div className="cert-stat-lbl">Placement Index</div>
              </div>
              <div className="cert-stat-item">
                <div className="cert-stat-val emerald">{targetCompany}</div>
                <div className="cert-stat-lbl">Target Benchmark</div>
              </div>
              <div className="cert-stat-item">
                <div className="cert-stat-val amber">Level 4</div>
                <div className="cert-stat-lbl">Mastery Tier</div>
              </div>
            </div>

            {/* Skills */}
            <div className="cert-skills-chips">
              {topSkills.map((sk) => (
                <span key={sk} className="cert-skill-chip">✓ {sk}</span>
              ))}
            </div>

            {/* Footer */}
            <div className="cert-footer-row">
              <div className="cert-seal">
                <div className="cert-seal-icon">
                  <ShieldCheck size={24} />
                </div>
                <div className="cert-seal-text">
                  <strong>AI Recalibration Engine</strong>
                  <span>Google Gemini Dynamic Curriculum Core</span>
                </div>
              </div>
              <div className="cert-meta-info">
                <div>Issue Date: <strong>{todayStr}</strong></div>
                <div>Verification ID: <span className="font-mono text-xs">{certId}</span></div>
                <div>Status: <span className="cert-status-valid">Active &amp; Validated</span></div>
              </div>
            </div>
          </div>

          {/* Download hint */}
          <p className="cert-download-hint">
            <Download size={13} />
            Click <strong>Download PDF</strong> to save a clean A4 landscape PDF. Choose <em>"Save as PDF"</em> in the print dialog.
          </p>
        </div>
      </div>
    </div>
  );
}
