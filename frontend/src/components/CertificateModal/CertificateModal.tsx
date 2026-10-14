import { Award, Printer, X, Sparkles, ShieldCheck } from 'lucide-react';
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

  const certId = `ADCR-${student?.id || 101}-${(student?.created_at ? new Date(student.created_at).getTime() : 1791950000000).toString(36).toUpperCase()}`;

  const topSkills = metrics?.skill_gap_matrix
    ? metrics.skill_gap_matrix.map(s => s.skill).slice(0, 8)
    : ['Python Architecture', 'Algorithmic Problem Solving', 'Full Stack Development', 'System Design', 'Git & CI/CD'];

  const score = metrics?.overall_score || 85;
  const targetRole = student?.career_goal?.title || 'Software Engineering Professional';
  const targetCompany = metrics?.target_company?.company_name || 'Industry Standard Tier-1';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cert-modal-overlay" onClick={onClose}>
      <div className="cert-modal-card animate-scale-up" onClick={e => e.stopPropagation()}>
        {/* Header Controls */}
        <div className="cert-modal-header">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-indigo-400" />
            <span className="font-bold text-sm text-primary">AI Dynamic Placement Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              onClick={handlePrint}
              id="print-certificate-btn"
            >
              <Printer size={14} /> Print / Save PDF
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

        {/* Certificate Body */}
        <div className="cert-modal-body">
          <div className="cert-frame">
            <div className="cert-watermark">VERIFIED</div>

            <div className="cert-badge-ribbon">
              <Sparkles size={13} /> AI Curriculum Engine Verified
            </div>

            <h1 className="cert-title">Certificate of Curriculum Mastery</h1>
            <p className="cert-subtitle">Adaptive Competency & Placement Readiness Endorsement</p>

            <div className="cert-presented-to">This is proudly conferred to</div>
            <div className="cert-recipient-name">
              {student?.full_name || 'Aspiring Technologist'}
            </div>

            <p className="cert-statement">
              Having successfully demonstrated algorithmic proficiency, completed multi-week dynamic syllabus modules, validated weekly topic assessments, and achieved rigorous technical alignment for the role of <strong>{targetRole}</strong>.
            </p>

            {/* Metrics Row */}
            <div className="cert-stats-grid">
              <div className="cert-stat-item">
                <div className="cert-stat-val text-indigo-400">{score}%</div>
                <div className="cert-stat-lbl">Placement Index</div>
              </div>
              <div className="cert-stat-item">
                <div className="cert-stat-val text-emerald-400">{targetCompany}</div>
                <div className="cert-stat-lbl">Target Benchmark</div>
              </div>
              <div className="cert-stat-item">
                <div className="cert-stat-val text-amber-400">Level 4</div>
                <div className="cert-stat-lbl">Mastery Tier</div>
              </div>
            </div>

            {/* Endorsed Skills Chips */}
            <div className="cert-skills-chips">
              {topSkills.map((sk) => (
                <span key={sk} className="cert-skill-chip">
                  ✓ {sk}
                </span>
              ))}
            </div>

            {/* Footer with Seal */}
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
                <div>Verification ID: <span className="font-mono">{certId}</span></div>
                <div>Status: <span className="text-emerald-400 font-semibold">Active & Validated</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
