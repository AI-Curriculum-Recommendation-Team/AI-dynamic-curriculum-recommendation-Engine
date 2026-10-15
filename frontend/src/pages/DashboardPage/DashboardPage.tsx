import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Target, TrendingUp, Award, ArrowRight, 
  RefreshCw, Sparkles, Compass, CheckCircle2, Clock, Code2, Building2, ShieldCheck
} from 'lucide-react';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, 
  LinearScale, RadialLinearScale, PointElement, LineElement, 
  Filler, Tooltip, Legend
} from 'chart.js';
import toast from 'react-hot-toast';
import { studentService, curriculumService, progressService, assessmentService, v2Service, readinessService, resumeService } from '../../services';
import { useAuthStore, useStudentStore } from '../../store';
import type { ProgressSummary, Curriculum, AssessmentResult, Achievement, CareerReadinessMetrics, ResumeProfile } from '../../types';
import GuidedJourneyFlow from '../../components/GuidedJourneyFlow/GuidedJourneyFlow';
import type { JourneyStep } from '../../components/GuidedJourneyFlow/GuidedJourneyFlow';
import CertificateModal from '../../components/CertificateModal/CertificateModal';
import { Bot, FileText, Layers } from 'lucide-react';
import './DashboardPage.css';

ChartJS.register(
  ArcElement, BarElement, CategoryScale, LinearScale, 
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { student, setStudent } = useStudentStore();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [readinessMetrics, setReadinessMetrics] = useState<CareerReadinessMetrics | null>(null);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchWeeklyReport = async () => {
    setReportLoading(true);
    try {
      const res = await curriculumService.getWeeklyReport();
      setAiReport(res.report);
      toast.success('AI Weekly Coaching Report generated! 🤖');
    } catch {
      toast.error('Failed to generate weekly report');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [profRes, progRes, assessRes, curRes, achRes, readyRes, resProfRes] = await Promise.allSettled([
          studentService.getProfile(),
          progressService.getSummary(),
          assessmentService.getLatestResult(),
          curriculumService.getMyCurriculum(),
          v2Service.getAchievements(),
          readinessService.getMetrics(),
          resumeService.getLatest(),
        ]);

        if (profRes.status === 'fulfilled') setStudent(profRes.value);
        if (progRes.status === 'fulfilled') setSummary(progRes.value);
        if (assessRes.status === 'fulfilled') setLatestAssessment(assessRes.value);
        if (achRes.status === 'fulfilled') setAchievements(achRes.value);
        if (readyRes.status === 'fulfilled') setReadinessMetrics(readyRes.value);
        if (resProfRes.status === 'fulfilled') setResumeProfile(resProfRes.value);
        if (curRes.status === 'fulfilled') {
          setCurriculum(curRes.value);
          // Fetch coach report if curriculum exists
          curriculumService.getWeeklyReport()
            .then(r => setAiReport(r.report))
            .catch(() => {});
        }
      } catch {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: '500px' }}>
        <div className="card-3d text-center p-8" style={{ maxWidth: 360 }}>
          <div className="spinner mb-4" style={{ width: 48, height: 48, margin: '0 auto 1.5rem auto' }} />
          <h3 className="text-base font-bold gradient-text">Loading Your Learning Hub</h3>
          <p className="text-xs text-secondary mt-1">Retrieving real-time progress, AI curricula & analytics...</p>
        </div>
      </div>
    );
  }

  // Determine accurate user lifecycle stage
  let currentStage: JourneyStep = 1;
  let nextAction = {
    title: 'Stage 1: Choose Your Career Goal',
    desc: 'Select your target role (e.g. AI Engineer, Full Stack) so our AI can calibrate your roadmap.',
    buttonText: 'Select Career Goal',
    href: '/career',
    icon: Target,
  };

  if (!student?.career_goal_id) {
    currentStage = 1;
    nextAction = {
      title: 'Stage 1: Choose Your Career Goal',
      desc: 'Select your target role (e.g. AI Engineer, Full Stack) so our AI can calibrate your roadmap.',
      buttonText: 'Select Career Goal',
      href: '/career',
      icon: Target,
    };
  } else if (!latestAssessment) {
    currentStage = 2;
    nextAction = {
      title: 'Stage 2: Take Diagnostic Skill Quiz',
      desc: `Assess your baseline knowledge for ${student.career_goal?.title || 'your career goal'}. Takes only 3-5 minutes!`,
      buttonText: 'Start Skill Quiz',
      href: '/assessment',
      icon: Compass,
    };
  } else if (!curriculum) {
    currentStage = 4;
    nextAction = {
      title: 'Stage 4: Generate Your AI Dynamic Curriculum',
      desc: 'Your skill profile is ready! Now let Google Gemini generate your personalized multi-week syllabus.',
      buttonText: 'Generate AI Curriculum',
      href: '/curriculum',
      icon: Sparkles,
    };
  } else {
    currentStage = 5;
    nextAction = {
      title: 'Stage 5: Master Roadmap & Adaptive Quizzes',
      desc: 'Follow your active week, study resources, and take topic quizzes to adapt your syllabus dynamically.',
      buttonText: 'Open Learning Roadmap',
      href: '/roadmap',
      icon: BookOpen,
    };
  }

  // Visual Charts Setup
  const hasCurriculum = !!curriculum;
  const completedTopics = summary?.completed || 0;
  const inProgressTopics = summary?.in_progress || 0;
  const totalTopics = summary?.total_topics || (hasCurriculum ? curriculum.weeks.length : 0);
  const remainingTopics = Math.max(0, totalTopics - completedTopics - inProgressTopics);

  // 1. Completion Doughnut Chart
  const completionDoughnutData = {
    labels: ['Completed', 'In Progress', 'Remaining'],
    datasets: [{
      data: [completedTopics, inProgressTopics, remainingTopics],
      backgroundColor: ['#10b981', '#f59e0b', 'rgba(255, 255, 255, 0.08)'],
      borderWidth: 0,
      cutout: '75%',
    }],
  };

  // 2. Weekly Velocity Bar Chart
  const weekLabels = curriculum ? curriculum.weeks.map(w => `W${w.week_number}`) : [];
  const weekHours = curriculum ? curriculum.weeks.map(w => w.estimated_hours) : [];
  const velocityBarData = {
    labels: weekLabels,
    datasets: [{
      label: 'Estimated Hours',
      data: weekHours,
      backgroundColor: 'rgba(99, 102, 241, 0.75)',
      borderRadius: 6,
      hoverBackgroundColor: '#6366f1',
    }],
  };

  // 3. Radar Chart (if assessment results exist)
  const skills = latestAssessment ? Object.keys(latestAssessment.scores_per_skill) : [];
  const scores = latestAssessment ? Object.values(latestAssessment.scores_per_skill) : [];
  const radarData = {
    labels: skills,
    datasets: [{
      label: 'Skill Proficiency',
      data: scores,
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      borderColor: '#6366f1',
      borderWidth: 2,
      pointBackgroundColor: '#818cf8',
    }],
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Unified 5-Stage Guided Journey Bar */}
        <GuidedJourneyFlow currentStep={currentStage} careerTitle={student?.career_goal?.title} />

        {/* Dashboard Header */}
        <div className="dashboard-header animate-fade-up">
          <div>
            <span className="badge badge-indigo text-xs mb-2 block" style={{ width: 'fit-content' }}>
              Real-time Analytics Hub
            </span>
            <h1 className="page-title">
              Welcome back, <span className="gradient-text">{student?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span> 👋
            </h1>
            <p className="page-subtitle">
              Target Career: <strong className="text-primary">{student?.career_goal?.title || 'Not Selected Yet'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasCurriculum && (
              <Link to="/roadmap" className="btn btn-secondary">
                <Compass size={16} /> Interactive Roadmap
              </Link>
            )}
            <Link to={nextAction.href} className="btn btn-primary btn-glow">
              <nextAction.icon size={16} /> {nextAction.buttonText}
            </Link>
          </div>
        </div>

        {/* Dynamic "Next Action" Hero Card */}
        <div className="card-3d next-action-card animate-fade-up delay-100 mt-6">
          <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
            <div className="flex items-start gap-3.5">
              <div className="next-action-icon-pill">
                <nextAction.icon size={22} className="text-white" />
              </div>
              <div>
                <span className="badge badge-emerald text-xs mb-1.5">Recommended Next Move</span>
                <h2 className="text-lg font-bold text-primary">{nextAction.title}</h2>
                <p className="text-xs text-secondary mt-1 max-w-xl leading-relaxed">
                  {nextAction.desc}
                </p>
              </div>
            </div>
            <Link to={nextAction.href} className="btn btn-primary btn-lg whitespace-nowrap btn-glow">
              <span>{nextAction.buttonText}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Real-time Metric Cards Grid */}
        <div className="grid-4 mt-6 animate-fade-up delay-150">
          <div className="stat-card card-3d">
            <div className="stat-icon emerald"><CheckCircle2 size={20} /></div>
            <div className="stat-num">{completedTopics}</div>
            <div className="stat-label">Mastered Topics</div>
          </div>
          <div className="stat-card card-3d">
            <div className="stat-icon amber"><TrendingUp size={20} /></div>
            <div className="stat-num">{inProgressTopics}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card card-3d">
            <div className="stat-icon indigo"><BookOpen size={20} /></div>
            <div className="stat-num">{totalTopics}</div>
            <div className="stat-label">Total Curricular Topics</div>
          </div>
          <div className="stat-card card-3d">
            <div className="stat-icon rose"><Award size={20} /></div>
            <div className="stat-num">
              {summary ? `${summary.completion_percentage.toFixed(0)}%` : '0%'}
            </div>
            <div className="stat-label">Journey Completion</div>
          </div>
        </div>

        {/* Version 4: Real-Time Career Placement & Target Company Benchmark Widget */}
        <div className="card-3d v4-readiness-dashboard-card animate-fade-up delay-180 mt-6">
          <div className="v4-readiness-header">
            <div className="v4-readiness-title-group">
              <div className="v4-readiness-icon-pill">
                <ShieldCheck size={22} />
              </div>
              <div className="v4-readiness-title-text">
                <div className="v4-readiness-badges">
                  <span className="badge badge-indigo text-xs">Placement Readiness</span>
                  {readinessMetrics?.target_company ? (
                    <span className="badge badge-emerald text-xs flex items-center gap-1">
                      <Building2 size={12} /> {readinessMetrics.target_company.company_name} ({readinessMetrics.target_company.tier})
                    </span>
                  ) : (
                    <span className="badge badge-amber text-xs flex items-center gap-1">
                      <Building2 size={12} /> Uncalibrated
                    </span>
                  )}
                  {resumeProfile?.has_resume && (
                    <span className="badge badge-purple text-xs">
                      Resume Fast-Tracked ({resumeProfile.skills?.length || 0} Skills)
                    </span>
                  )}
                </div>
                <h3>
                  Target Role: {student?.career_goal?.title ? `${student.career_goal.title} Placement Index` : 'Career Goal Not Selected Yet'}
                </h3>
              </div>
            </div>

            <div className="v4-readiness-actions">
              {hasCurriculum ? (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                    onClick={() => setCertModalOpen(true)}
                    id="open-cert-modal-btn"
                    title="Generate your AI verified Curriculum & Placement Readiness Certificate"
                  >
                    <Award size={14} className="text-amber-400" /> View Placement Certificate
                  </button>
                  <Link to="/readiness" className="btn btn-primary btn-sm flex items-center gap-1.5">
                    <Target size={14} /> Full Skill Gap Matrix
                  </Link>
                </>
              ) : (
                <Link to="/career" className="btn btn-primary btn-sm flex items-center gap-1.5 btn-glow">
                  <Target size={14} /> Choose Career Goal to Calibrate
                </Link>
              )}
            </div>
          </div>

          <div className="v4-readiness-grid">
            {/* Box 1: Overall Score */}
            <div className="v4-readiness-box v4-readiness-score-box">
              <div className="v4-score-circular-badge">
                <div className="v4-score-number">
                  {readinessMetrics?.overall_score ?? 0}%
                </div>
                <div className="v4-score-caption">Placement Index</div>
              </div>
              <div className="v4-score-explainer">
                {student?.career_goal?.title ? (
                  <>
                    Target Benchmark: <strong className="text-primary">{readinessMetrics?.benchmark_target ?? readinessMetrics?.target_company?.benchmark_target ?? 80}%</strong>.<br />
                    Calibrated to <strong>{readinessMetrics?.target_company?.company_name || 'Tier-1 Standards'}</strong>.
                  </>
                ) : (
                  <>
                    <strong className="text-amber-500">Awaiting Calibration</strong>.<br />
                    Select your Career Goal to set your hiring benchmark.
                  </>
                )}
              </div>
            </div>

            {/* Box 2: Curriculum + Quiz Progress */}
            <div className="v4-readiness-box">
              <div className="v4-bar-metric-row">
                <div className="v4-bar-header">
                  <span className="v4-bar-label">Curriculum Mastery (20%)</span>
                  <span className="v4-bar-val">{readinessMetrics?.curriculum_completion_score ?? 0}%</span>
                </div>
                <div className="progress-bar-track" style={{ height: 6 }}>
                  <div className="progress-bar-fill" style={{ width: `${readinessMetrics?.curriculum_completion_score ?? 0}%` }} />
                </div>
              </div>

              <div className="v4-bar-metric-row">
                <div className="v4-bar-header">
                  <span className="v4-bar-label">Quiz Validation (25%)</span>
                  <span className="v4-bar-val">{readinessMetrics?.quiz_mastery_score ?? 0}%</span>
                </div>
                <div className="progress-bar-track" style={{ height: 6 }}>
                  <div className="progress-bar-fill" style={{ width: `${readinessMetrics?.quiz_mastery_score ?? 0}%`, background: 'var(--clr-amber-500)' }} />
                </div>
              </div>
            </div>

            {/* Box 3: Coding Lab + Stack Match */}
            <div className="v4-readiness-box">
              <div className="v4-bar-metric-row">
                <div className="v4-bar-header">
                  <span className="v4-bar-label">Coding Challenges (25%)</span>
                  <span className="v4-bar-val">{readinessMetrics?.coding_score ?? 0}%</span>
                </div>
                <div className="progress-bar-track" style={{ height: 6 }}>
                  <div className="progress-bar-fill" style={{ width: `${readinessMetrics?.coding_score ?? 0}%`, background: 'var(--clr-emerald-500)' }} />
                </div>
              </div>

              <div className="v4-bar-metric-row">
                <div className="v4-bar-header">
                  <span className="v4-bar-label">Company Tech Match (30%)</span>
                  <span className="v4-bar-val">{readinessMetrics?.company_match_percentage ?? 0}%</span>
                </div>
                <div className="progress-bar-track" style={{ height: 6 }}>
                  <div className="progress-bar-fill" style={{ width: `${readinessMetrics?.company_match_percentage ?? 0}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
                </div>
              </div>
            </div>

            {/* Box 4: Quick Action CTA */}
            <div className="v4-readiness-box v4-cta-card">
              <div>
                <div className="v4-cta-title">
                  {hasCurriculum ? (
                    <>
                      <Code2 size={16} className="text-indigo-400" />
                      <span>Hands-On Coding Lab</span>
                    </>
                  ) : (
                    <>
                      <Target size={16} className="text-indigo-400" />
                      <span>{nextAction.title.split(':')[0]}</span>
                    </>
                  )}
                </div>
                <p className="v4-cta-desc mt-1">
                  {hasCurriculum
                    ? 'Practice topic algorithms with unit tests & AI complexity analysis.'
                    : nextAction.desc}
                </p>
              </div>
              <Link to={hasCurriculum ? '/coding-lab' : nextAction.href} className="btn btn-secondary btn-sm flex items-center justify-center gap-1.5 w-full mt-2">
                {hasCurriculum ? (
                  <>Launch Coding Lab <ArrowRight size={13} /></>
                ) : (
                  <>{nextAction.buttonText} <ArrowRight size={13} /></>
                )}
              </Link>
            </div>

          </div>
        </div>

        {/* Visual Charts Row */}
        <div className="dashboard-charts-grid mt-6 animate-fade-up delay-200">
          {/* Progress Donut Chart */}
          <div className="card-3d chart-box">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold">Curriculum Breakdown</h3>
              <span className="text-xs text-muted">Topic Statuses</span>
            </div>
            <div className="flex items-center justify-center gap-6" style={{ minHeight: 200 }}>
              <div style={{ width: 140, height: 140, position: 'relative' }}>
                <Doughnut
                  data={completionDoughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
                <div className="donut-stat-center">
                  <div className="font-extrabold text-lg text-primary">
                    {summary?.completion_percentage.toFixed(0) || 0}%
                  </div>
                  <div className="text-xs text-muted">Done</div>
                </div>
              </div>
              <div className="chart-legend-custom flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="legend-pip bg-emerald" />
                  <span>Mastered ({completedTopics})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="legend-pip bg-amber" />
                  <span>In Progress ({inProgressTopics})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="legend-pip bg-muted" />
                  <span>Remaining ({remainingTopics})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Workload & Velocity Bar Chart */}
          <div className="card-3d chart-box">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold">Weekly Study Velocity</h3>
              <span className="text-xs text-muted">Pacing (~Hours/Week)</span>
            </div>
            <div style={{ height: 200 }}>
              {hasCurriculum ? (
                <Bar
                  data={velocityBarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        grid: { color: 'rgba(255, 255, 255, 0.06)' },
                        ticks: { color: '#94a3b8' },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted text-xs p-4">
                  <BookOpen size={24} className="mb-2 opacity-50" />
                  <span>Generate curriculum to visualize weekly study pacing</span>
                </div>
              )}
            </div>
          </div>

          {/* Skill Proficiency Radar Preview */}
          <div className="card-3d chart-box">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold">Skill Competency Radar</h3>
              {latestAssessment && (
                <Link to={`/results/${latestAssessment.id}`} className="text-xs text-accent hover:underline">
                  Full Gap Details →
                </Link>
              )}
            </div>
            <div style={{ height: 200 }}>
              {latestAssessment && skills.length > 0 ? (
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.08)' },
                        pointLabels: { color: '#94a3b8', font: { size: 10, family: 'Inter' } },
                      },
                    },
                    plugins: { legend: { display: false } },
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted text-xs p-4">
                  <Compass size={24} className="mb-2 opacity-50" />
                  <span>Complete diagnostic quiz to unlock your radar profile</span>
                  <Link to="/assessment" className="btn btn-primary btn-sm mt-3">
                    Take Quiz
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Weekly Coaching Insight Card */}
        {hasCurriculum && (
          <div className="card-3d ai-report-card animate-fade-up delay-250 mt-6">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="ai-coach-icon">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Google Gemini AI Learning Coach</h3>
                  <span className="badge badge-emerald text-xs mt-0.5">Real-time Progress Analysis</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={fetchWeeklyReport}
                disabled={reportLoading}
              >
                <RefreshCw size={13} className={reportLoading ? "spinner" : ""} /> Refresh Coach Report
              </button>
            </div>

            <div className="ai-report-body mt-3">
              {reportLoading ? (
                <div className="flex items-center gap-2 text-sm text-secondary py-4">
                  <div className="spinner" style={{ width: 20, height: 20 }} />
                  <span>Google Gemini AI is synthesizing your weekly milestones...</span>
                </div>
              ) : aiReport ? (
                <p className="text-sm text-secondary" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                  {aiReport}
                </p>
              ) : (
                <div className="flex justify-between items-center py-2 flex-wrap gap-2">
                  <span className="text-sm text-muted">Generate an AI coaching assessment of your weekly milestones.</span>
                  <button type="button" className="btn btn-primary btn-sm" onClick={fetchWeeklyReport}>
                    Generate Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Next Weeks Overview */}
        {hasCurriculum && (
          <div className="mt-8 animate-fade-up delay-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Your Curriculum Roadmap Preview</h2>
                <p className="text-xs text-muted">Next upcoming modules crafted by Gemini</p>
              </div>
              <Link to="/roadmap" className="btn btn-ghost btn-sm">
                View Full Dynamic Roadmap <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid-3">
              {curriculum.weeks.slice(0, 3).map((week) => (
                <div key={week.id} className="week-preview-card card-3d">
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-indigo">Week {week.week_number}</span>
                    <span className={`status-dot ${week.status.replace('_', '-')}`} title={`Status: ${week.status}`} />
                  </div>
                  <h3 className="text-sm font-bold mt-2 text-primary">{week.topic}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted mt-1">
                    <Clock size={12} /> ~{week.estimated_hours}h · {week.difficulty}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {week.subtopics.slice(0, 2).map((s) => (
                      <span key={s} className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Version 3 Interactive Learning Suite */}
        <div className="mt-8 animate-fade-up delay-350">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="badge badge-purple text-xs mb-1 block" style={{ width: 'fit-content' }}>
                AI Intelligence Hub
              </span>
              <h2 className="text-lg font-bold">Interactive Learning & Knowledge Suite</h2>
              <p className="text-xs text-muted">Grounded RAG tutoring, vector PDF indexing, flashcards & notes</p>
            </div>
          </div>

          <div className="grid-4">
            <Link to="/tutor" className="v3-feature-card">
              <div className="v3-feature-header">
                <div className="v3-feature-icon indigo">
                  <Bot size={22} />
                </div>
                <div>
                  <h3 className="v3-feature-name">AI Chat Tutor</h3>
                  <span className="v3-feature-tag text-emerald-400">RAG Grounded</span>
                </div>
              </div>
              <p className="v3-feature-desc">
                Conversational study assistant answering questions with citations from your notes.
              </p>
              <span className="v3-feature-link">
                Open Tutor Chat →
              </span>
            </Link>

            <Link to="/documents" className="v3-feature-card">
              <div className="v3-feature-header">
                <div className="v3-feature-icon emerald">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="v3-feature-name">Knowledge Base</h3>
                  <span className="v3-feature-tag">PDF & Text Docs</span>
                </div>
              </div>
              <p className="v3-feature-desc">
                Upload textbooks and lecture notes to index into the vector database.
              </p>
              <span className="v3-feature-link">
                Manage Documents →
              </span>
            </Link>

            <Link to="/flashcards" className="v3-feature-card">
              <div className="v3-feature-header">
                <div className="v3-feature-icon purple">
                  <Layers size={22} />
                </div>
                <div>
                  <h3 className="v3-feature-name">AI Flashcards</h3>
                  <span className="v3-feature-tag">3D Flip Study</span>
                </div>
              </div>
              <p className="v3-feature-desc">
                Auto-generate active recall cards with difficulty ratings and mastery tracking.
              </p>
              <span className="v3-feature-link">
                Study Flashcards →
              </span>
            </Link>

            <Link to="/notes" className="v3-feature-card">
              <div className="v3-feature-header">
                <div className="v3-feature-icon amber">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 className="v3-feature-name">Study Notes</h3>
                  <span className="v3-feature-tag">Key Takeaways</span>
                </div>
              </div>
              <p className="v3-feature-desc">
                AI-synthesized revision notes with code patterns and takeaways.
              </p>
              <span className="v3-feature-link">
                Read Notes →
              </span>
            </Link>
          </div>
        </div>

        {/* Milestone Badges & Achievements (V2) */}
        <div className="mt-8 animate-fade-up delay-400 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="badge badge-amber text-xs mb-1 block" style={{ width: 'fit-content' }}>
                Gamification & Rewards
              </span>
              <h2 className="text-lg font-bold">Earned Badges & Achievements ({achievements.length})</h2>
              <p className="text-xs text-muted">Milestones unlocked along your curriculum journey</p>
            </div>
          </div>

          {achievements.length === 0 ? (
            <div className="card-3d p-6 text-center text-secondary text-xs">
              <Award size={28} className="mx-auto mb-2 text-muted" />
              <span>Complete diagnostic quizzes, generate your curriculum, and take topic quizzes to unlock milestone badges!</span>
            </div>
          ) : (
            <div className="grid-3">
              {achievements.map((ach) => (
                <div key={ach.id} className="achievement-card">
                  <div className="achievement-icon-wrap">
                    <Award size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary">{ach.badge_name}</h4>
                    <p className="text-xs text-secondary mt-0.5">{ach.description}</p>
                    <span className="text-xs text-muted block mt-1" style={{ fontSize: '0.7rem' }}>
                      Unlocked on {new Date(ach.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Certificate Modal */}
        <CertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          student={student}
          metrics={readinessMetrics}
        />
      </div>
    </div>
  );
}
