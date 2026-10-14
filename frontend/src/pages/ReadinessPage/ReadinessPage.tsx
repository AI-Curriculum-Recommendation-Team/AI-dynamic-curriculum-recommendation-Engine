import { useEffect, useState } from 'react';
import { Target, Building2, Sparkles, RefreshCw, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { readinessService, companyService } from '../../services';
import type { CareerReadinessMetrics, CompanyProfile } from '../../types';
import DossierModal from '../../components/DossierModal/DossierModal';
import './ReadinessPage.css';

export default function ReadinessPage() {
  const [metrics, setMetrics] = useState<CareerReadinessMetrics | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [met, comps] = await Promise.all([
        readinessService.getMetrics().catch(() => null),
        companyService.list().catch(() => []),
      ]);
      if (met) {
        setMetrics(met);
        if (met.target_company) {
          setSelectedCompanyId(met.target_company.id);
        }
      }
      setCompanies(comps);
    } catch {
      toast.error('Failed to load readiness metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCompany = async (companyId: number) => {
    setSelectedCompanyId(companyId);
    setApplying(true);
    try {
      const res = await companyService.applyTarget(companyId);
      toast.success(res.message);
      // Reload updated readiness and gap matrix
      const updated = await readinessService.getMetrics();
      setMetrics(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to calibrate curriculum for target company');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const scorePct = Math.min(100, Math.max(0, metrics?.overall_score || 0));

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="page-header animate-fade-up flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-indigo">Version 4 Dynamic Matrix</span>
              <span className="badge badge-emerald">Placement Aligned</span>
            </div>
            <h1 className="page-title">Career Readiness & Skill Gap Matrix</h1>
            <p className="page-subtitle">
              Real-time multi-dimensional scoring and live curriculum alignment with target companies.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary flex items-center gap-1.5"
              onClick={loadData}
              disabled={loading}
              title="Recalculate metrics across quizzes, coding labs, and target company stack"
            >
              <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Recalculate
            </button>
            <button
              type="button"
              className="btn btn-primary btn-glow flex items-center gap-2"
              onClick={() => setDossierOpen(true)}
              id="export-readiness-dossier-btn"
            >
              <FileText size={16} /> Export Placement Dossier
            </button>
          </div>
        </div>

        <div className="readiness-grid">
          {/* Left Column: Overall Score & Breakdown */}
          <div className="flex flex-col gap-4">
            <div className="card-3d readiness-score-card animate-fade-up delay-100">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Overall Readiness</span>

              {/* Dynamic Circular Gauge */}
              <div className="score-circle-outer" style={{ ['--score-pct' as any]: scorePct }}>
                <div className="score-circle-inner">
                  <span className="score-number">{scorePct}%</span>
                  <span className="score-label">Placement Index</span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="w-full mt-3 text-left">
                <div className="mb-2">
                  <div className="breakdown-row">
                    <span className="text-muted">Curriculum Mastery (20%)</span>
                    <strong>{metrics?.curriculum_completion_score || 0}%</strong>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${metrics?.curriculum_completion_score || 0}%`, background: 'var(--clr-indigo-500)' }} />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="breakdown-row">
                    <span className="text-muted">Quiz Validation (25%)</span>
                    <strong>{metrics?.quiz_mastery_score || 0}%</strong>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${metrics?.quiz_mastery_score || 0}%`, background: 'var(--clr-amber-500)' }} />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="breakdown-row">
                    <span className="text-muted">Coding Challenges (25%)</span>
                    <strong>{metrics?.coding_score || 0}%</strong>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${metrics?.coding_score || 0}%`, background: 'var(--clr-emerald-500)' }} />
                  </div>
                </div>

                <div className="mb-1">
                  <div className="breakdown-row">
                    <span className="text-muted">Company Stack Match (30%)</span>
                    <strong className="text-primary">{metrics?.company_match_percentage ?? 0}%</strong>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${metrics?.company_match_percentage ?? 0}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation Card */}
            {metrics?.recommended_action && (
              <div className="card-3d animate-fade-up delay-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  <h4 className="text-xs uppercase font-bold text-primary tracking-wider">AI Recommendation</h4>
                </div>
                <p className="text-xs text-secondary leading-relaxed">
                  {metrics.recommended_action}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Company Target Alignment & Live Gap Matrix */}
          <div className="flex flex-col gap-4">
            {/* Target Company Selector */}
            <div className="card-3d animate-fade-up delay-100">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-500" /> Target Company Calibration
                </h3>
                {applying && (
                  <span className="text-xs text-indigo-400 flex items-center gap-1">
                    <RefreshCw size={12} className="spinner" /> Aligning Curriculum...
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Select your target company. The AI engine recalculates your benchmark score (Tier-1: 90%, AI Startups: 80%, Service: 70%) and immediately updates your skill gaps.
              </p>

              <div className="company-card-grid">
                {companies.map(comp => {
                  const isSelected = selectedCompanyId === comp.id;
                  return (
                    <div
                      key={comp.id}
                      className={`company-select-card ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectCompany(comp.id)}
                    >
                      <div className="flex justify-between items-start">
                        <strong className="text-xs text-primary">{comp.company_name}</strong>
                        <span className={`badge text-xs ${comp.difficulty_level === 'Hard' ? 'badge-rose' : 'badge-amber'}`}>
                          {comp.difficulty_level}
                        </span>
                      </div>
                      <span className="text-xs text-muted">{comp.target_role}</span>
                      {isSelected && (
                        <div className="mt-1">
                          <span className="badge badge-indigo text-xs" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            ✓ Active Target
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skill Gap Matrix */}
            <div className="card-3d animate-fade-up delay-200">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Target size={16} className="text-indigo-500" /> Live Competency & Skill Gap Matrix
                </h3>
                <div className="flex items-center gap-2">
                  <span className="badge badge-outline text-xs">
                    Target: {metrics?.target_company?.company_name || 'Industry Standard'}
                  </span>
                  <span className="badge badge-indigo text-xs">
                    Benchmark: {metrics?.benchmark_target || 80}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted mt-1 mb-2">
                Real-time validation aggregated from diagnostic evaluations, weekly quiz scores, resume skills, and coding labs.
              </p>

              <div className="skill-gap-list">
                {metrics?.skill_gap_matrix?.map(item => (
                  <div key={item.skill} className="skill-gap-item">
                    <div className="skill-name-col">{item.skill}</div>
                    <div className="skill-bar-wrap">
                      <div className="progress-bar-track flex-1" style={{ height: 8 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${Math.min(100, item.current_level)}%`,
                            background: item.status === 'mastered' ? 'var(--clr-emerald-500)' : item.status === 'in_progress' ? 'var(--clr-indigo-500)' : 'var(--clr-amber-500)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-primary w-20 text-right">
                        {item.current_level}% <span className="text-muted font-normal text-xs">/ {item.required_level || item.target_level || 80}%</span>
                      </span>
                    </div>
                    <span className={`badge text-xs ${item.status === 'mastered' ? 'badge-emerald' : item.status === 'in_progress' ? 'badge-indigo' : 'badge-amber'}`}>
                      {item.status === 'mastered' ? 'Mastered' : item.status === 'in_progress' ? 'In Progress' : 'Focus Needed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Placement Dossier Export Modal */}
        <DossierModal
          isOpen={dossierOpen}
          onClose={() => setDossierOpen(false)}
        />
      </div>
    </div>
  );
}
