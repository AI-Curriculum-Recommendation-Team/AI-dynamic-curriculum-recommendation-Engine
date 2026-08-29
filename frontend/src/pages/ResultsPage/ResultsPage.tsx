import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Radar, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  BarElement, CategoryScale, LinearScale, ArcElement,
  Filler, Tooltip, Legend,
} from 'chart.js';
import { ArrowRight, CheckCircle2, AlertTriangle, Sparkles, Award, TrendingUp, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { assessmentService } from '../../services';
import { useStudentStore } from '../../store';
import type { AssessmentResult } from '../../types';
import GuidedJourneyFlow from '../../components/GuidedJourneyFlow/GuidedJourneyFlow';
import './ResultsPage.css';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement,
  BarElement, CategoryScale, LinearScale, ArcElement,
  Filler, Tooltip, Legend
);

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { student } = useStudentStore();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'radar' | 'bars'>('radar');

  useEffect(() => {
    const fetchResult = id
      ? assessmentService.getResult(parseInt(id))
      : assessmentService.getLatestResult();

    fetchResult
      .then(setResult)
      .catch(() => {
        toast.error('Failed to load assessment results');
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="card-3d text-center p-6" style={{ maxWidth: 360 }}>
          <div className="spinner mb-4" style={{ width: 44, height: 44, margin: '0 auto 1rem auto' }} />
          <p className="text-secondary text-sm font-semibold">Visualizing Skill Gap Analysis...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const skills = Object.keys(result.scores_per_skill);
  const userScores = Object.values(result.scores_per_skill);
  const targetBenchmarks = skills.map(() => 85); // 85% is industry standard readiness

  // Radar Chart Configuration
  const radarChartData = {
    labels: skills,
    datasets: [
      {
        label: 'Your Current Level',
        data: userScores,
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: '#6366f1',
        borderWidth: 2.5,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#10b981',
        pointHoverBorderColor: '#ffffff',
        pointRadius: 4,
      },
      {
        label: 'Industry Benchmark',
        data: targetBenchmarks,
        backgroundColor: 'rgba(16, 185, 129, 0.06)',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 2,
      },
    ],
  };

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          font: { size: 12, family: 'Inter', weight: 600 },
          color: '#94a3b8',
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 12 },
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.parsed.r.toFixed(0)}%`,
        },
      },
    },
  };

  // Horizontal Bar Chart for Skill Gap Comparison
  const barChartData = {
    labels: skills,
    datasets: [
      {
        label: 'Your Score',
        data: userScores,
        backgroundColor: userScores.map(s => s >= 70 ? 'rgba(16, 185, 129, 0.8)' : s >= 40 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(244, 63, 94, 0.8)'),
        borderRadius: 6,
      },
      {
        label: 'Target Benchmark (85%)',
        data: targetBenchmarks,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#94a3b8', callback: (v: any) => `${v}%` },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#f8fafc', font: { family: 'Inter', weight: 600 } },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  // Doughnut Readiness Gauge Data
  const readiness = Math.min(100, Math.round(result.overall_score));
  const doughnutData = {
    labels: ['Ready', 'To Master'],
    datasets: [
      {
        data: [readiness, 100 - readiness],
        backgroundColor: [
          readiness >= 70 ? '#10b981' : readiness >= 45 ? '#6366f1' : '#f59e0b',
          'rgba(255, 255, 255, 0.06)',
        ],
        borderWidth: 0,
        circumference: 260,
        rotation: 230,
      },
    ],
  };

  const strong = skills.filter(s => result.scores_per_skill[s] >= 70);
  const weak = skills.filter(s => result.scores_per_skill[s] < 70);

  return (
    <div className="page-container">
      <div className="container">
        {/* Stage 3 in the 5-Stage Journey */}
        <GuidedJourneyFlow currentStep={3} careerTitle={student?.career_goal?.title} />

        <div className="page-header animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-emerald flex items-center gap-1">
              <Award size={14} /> Stage 3: Skill Gap Analysis
            </span>
            <span className="badge badge-indigo text-xs">Diagnostic Complete</span>
          </div>
          <h1 className="page-title">Your Skill & Gap Profile</h1>
          <p className="page-subtitle">
            Here is your exact competency baseline. Your AI curriculum will intelligently focus on closing the identified gaps.
          </p>
        </div>

        {/* Readiness Metric Banner */}
        <div className="grid-3 mb-6 animate-fade-up delay-100">
          <div className="stat-card card-3d">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Overall Readiness</div>
                <div className="stat-num gradient-text">{result.overall_score.toFixed(1)}%</div>
                <p className="text-xs text-secondary mt-1">
                  {result.overall_score >= 70 ? 'Strong foundation to build upon' : 'Targeted AI curriculum needed'}
                </p>
              </div>
              <div style={{ width: 84, height: 84, position: 'relative' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '76%',
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                  }}
                />
                <div className="doughnut-center-label">{readiness}%</div>
              </div>
            </div>
          </div>

          <div className="stat-card card-3d">
            <div className="stat-icon emerald"><CheckCircle2 size={20} /></div>
            <div className="stat-num">{strong.length} of {skills.length}</div>
            <div className="stat-label">Mastered Competencies</div>
            <p className="text-xs text-secondary mt-1">Skills meeting standard requirements</p>
          </div>

          <div className="stat-card card-3d">
            <div className="stat-icon amber"><TrendingUp size={20} /></div>
            <div className="stat-num">{weak.length}</div>
            <div className="stat-label">Curriculum Focus Areas</div>
            <p className="text-xs text-secondary mt-1">Topics prioritised in your custom roadmap</p>
          </div>
        </div>

        {/* Main Visualizations Layout */}
        <div className="results-layout">
          {/* Chart Display with Tabs */}
          <div className="card-3d animate-fade-up delay-200">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold">Skill Gap Visualization</h3>
              <div className="viz-tab-group">
                <button
                  type="button"
                  className={`viz-tab-btn ${activeTab === 'radar' ? 'active' : ''}`}
                  onClick={() => setActiveTab('radar')}
                >
                  Radar Map
                </button>
                <button
                  type="button"
                  className={`viz-tab-btn ${activeTab === 'bars' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bars')}
                >
                  Gap Breakdown
                </button>
              </div>
            </div>

            <div className="viz-canvas-wrap" style={{ height: '360px', position: 'relative' }}>
              {activeTab === 'radar' ? (
                <Radar data={radarChartData} options={radarChartOptions as any} />
              ) : (
                <Bar data={barChartData} options={barChartOptions as any} />
              )}
            </div>
          </div>

          {/* Right Column: Next Step CTA & Skill Status */}
          <div className="results-sidebar flex flex-col gap-4 animate-fade-up delay-300">
            {/* NEXT STEP HERO CTA */}
            <div className="card-3d next-step-hero-card">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Stage 4 Next Step</span>
              </div>
              <h3 className="text-lg font-bold">Generate AI Dynamic Curriculum</h3>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                Google Gemini AI will design your personalized multi-week learning journey addressing your 
                <strong> {weak.length} focus areas</strong> with curated videos, documentation, and coding projects.
              </p>
              <Link to="/curriculum" className="btn btn-primary btn-lg w-full mt-4 btn-glow">
                <span>🤖 Generate AI Curriculum</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Competency Tag Cards */}
            <div className="card-3d">
              <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                <Compass size={15} className="text-secondary" /> Diagnostic Summary
              </h4>

              {strong.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-emerald mb-1.5 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Strengths:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {strong.map(s => (
                      <span key={s} className="badge badge-emerald text-xs">
                        {s} ({result.scores_per_skill[s].toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {weak.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-amber mb-1.5 flex items-center gap-1">
                    <AlertTriangle size={13} /> Growth Opportunities:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {weak.map(s => (
                      <span key={s} className="badge badge-amber text-xs">
                        {s} ({result.scores_per_skill[s].toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
