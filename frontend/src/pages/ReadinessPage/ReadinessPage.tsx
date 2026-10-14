import { useEffect, useState } from 'react';
import { Target, Building2, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { readinessService, companyService } from '../../services';
import type { CareerReadinessMetrics, CompanyProfile } from '../../types';
import './ReadinessPage.css';

export default function ReadinessPage() {
  const [metrics, setMetrics] = useState<CareerReadinessMetrics | null>(null);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

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
        <div className="page-header animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-indigo">Version 4 Dynamic Matrix</span>
            <span className="badge badge-emerald">Placement Aligned</span>
          </div>
          <h1 className="page-title">Career Readiness & Skill Gap Matrix</h1>
          <p className="page-subtitle">
            Real-time multi-dimensional scoring and live curriculum alignment with target companies.
          </p>
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
                <div className="mb-2.5">
                  <div className="breakdown-row">
                    <span className="text-muted">Curriculum Mastery (30%)</span>
                    <strong>{metrics?.curriculum_completion_score || 0}%</strong>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${metrics?.curriculum_completion_score || 0}%` }} />
                  </div>
                </div>

                <div className="mb-2.5">
                  <div className="breakdown-row">
                    <span className="text-muted">Quiz Validation (30%)</span>
                    <strong>{metrics?.quiz_mastery_score || 0}%</strong>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${metrics?.quiz_mastery_score || 0}%`, background: 'var(--clr-amber-500)' }} />
                  </div>
                </div>

                <div className="mb-1">
                  <div className="breakdown-row">
                    <span className="text-muted">Coding Challenges (40%)</span>
                    <strong>{metrics?.coding_score || 0}%</strong>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div className="progress-bar-fill" style={{ width: `${metrics?.coding_score || 0}%`, background: 'var(--clr-emerald-500)' }} />
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
                  <Building2 size={16} className="text-indigo-500" /> Target Company Curriculum Bias
                </h3>
                {applying && (
                  <span className="text-xs text-muted flex items-center gap-1">
                    <RefreshCw size={12} className="spinner" /> Calibrating...
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Select your dream target. The AI engine will dynamically calibrate your curriculum roadmap to emphasize their specific hiring tech stack.
              </p>

              <div className="company-card-grid">
                {companies.map(comp => (
                  <div
                    key={comp.id}
                    className={`company-select-card ${selectedCompanyId === comp.id ? 'active' : ''}`}
                    onClick={() => handleSelectCompany(comp.id)}
                  >
                    <div className="flex justify-between items-start">
                      <strong className="text-xs text-primary">{comp.company_name}</strong>
                      <span className={`badge text-xs ${comp.difficulty_level === 'Hard' ? 'badge-rose' : 'badge-amber'}`}>
                        {comp.difficulty_level}
                      </span>
                    </div>
                    <span className="text-xs text-muted">{comp.target_role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gap Matrix */}
            <div className="card-3d animate-fade-up delay-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Target size={16} className="text-indigo-500" /> Live Competency & Skill Gap Matrix
                </h3>
                <span className="text-xs text-muted">Target: {metrics?.target_company?.company_name || 'Industry Bar'}</span>
              </div>
              <p className="text-xs text-muted mt-1 mb-2">
                Real-time validation against the required tech stack. As you complete curriculum milestones and coding labs, gaps turn green.
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
                            width: `${item.current_level}%`,
                            background: item.status === 'mastered' ? 'var(--clr-emerald-500)' : item.status === 'in_progress' ? 'var(--clr-indigo-500)' : 'var(--clr-amber-500)',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-primary w-12 text-right">
                        {item.current_level}%
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
      </div>
    </div>
  );
}
