import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RotateCcw, Trash2, AlertTriangle, FileText, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentService, resumeService } from '../../services';
import { useStudentStore, useAuthStore } from '../../store';
import type { StudentSkill, ResumeProfile } from '../../types';
import './ProfilePage.css';

const SKILLS_SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'SQL', 'Machine Learning', 'Deep Learning',
  'React', 'Node.js', 'Docker', 'AWS', 'Statistics', 'Data Visualization',
  'Natural Language Processing', 'TensorFlow', 'PyTorch', 'Git', 'Linux',
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { student, setStudent } = useStudentStore();
  const { clearAuth } = useAuthStore();
  const [form, setForm] = useState<{
    full_name: string;
    education: string;
    learning_preference: 'video' | 'text' | 'projects' | 'mixed';
  }>({
    full_name: student?.full_name || '',
    education: student?.education || '',
    learning_preference: (student?.learning_preference as any) || 'video',
  });
  const [skills, setSkills] = useState<Array<{ name: string; level: string; score: number }>>([]);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Resume Fast-Tracking V4
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      studentService.getProfile().catch(() => null),
      studentService.getSkills().catch(() => []),
      resumeService.getLatest().catch(() => null),
    ]).then(([prof, sk, resProf]) => {
      if (prof) {
        setStudent(prof);
        setForm({ full_name: prof.full_name, education: prof.education || '', learning_preference: prof.learning_preference });
      }
      if (sk) {
        setSkills((sk as StudentSkill[]).map(s => ({
          name: s.skill.name,
          level: s.self_rated_level,
          score: s.proficiency_score,
        })));
      }
      if (resProf) {
        setResumeProfile(resProf);
      }
    }).finally(() => setLoading(false));
  }, []);

  const addSkill = () => {
    if (!newSkill.trim() || skills.find(s => s.name.toLowerCase() === newSkill.toLowerCase())) return;
    setSkills(prev => [...prev, { name: newSkill.trim(), level: 'beginner', score: 30 }]);
    setNewSkill('');
  };

  const removeSkill = (name: string) => {
    setSkills(prev => prev.filter(s => s.name !== name));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await studentService.updateProfile(form);
      setStudent(updated);

      await studentService.setSkills(skills.map(s => ({
        skill_name: s.name,
        self_rated_level: s.level,
        proficiency_score: s.score,
      })));

      toast.success('Profile saved successfully! 🎉');
      navigate('/career');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetProgress = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to clear your learning journey?\n\n' +
      'This will reset your selected career path, curriculum roadmap, weekly milestones, quizzes, flashcards, and notes so you can start completely fresh.\n\n' +
      'Your account profile and login credentials will NOT be deleted.'
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      await studentService.resetProgress();
      const prof = await studentService.getProfile();
      setStudent(prof);
      toast.success('Learning journey reset! Choose your career goal to restart. 🚀');
      navigate('/career');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to reset learning journey');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      '🚨 PERMANENT ACCOUNT DELETION 🚨\n\n' +
      'This action CANNOT be undone. This will permanently delete your user account, login credentials, and all learning history.\n\n' +
      'To permanently delete your account, type "DELETE" below:'
    );
    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        toast.error('Deletion cancelled. You must type DELETE to confirm.');
      }
      return;
    }

    setDeleting(true);
    try {
      await studentService.deleteAccount();
      clearAuth();
      setStudent(null);
      toast.success('Your account has been permanently deleted. Goodbye! 👋');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file first.');
      return;
    }

    setResumeUploading(true);
    try {
      const res = await resumeService.uploadAndAdapt(resumeFile);
      toast.success(`Resume parsed! ${res.skills_detected} skills extracted and curriculum accelerated! 🎉`);
      // Reload profile and latest resume
      const latest = await resumeService.getLatest();
      setResumeProfile(latest);
      setResumeFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to parse resume');
    } finally {
      setResumeUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container container flex justify-center items-center" style={{ minHeight: 400 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container-narrow">
        <div className="page-header animate-fade-up">
          <span className="badge badge-indigo mb-3">Step 1 of 4</span>
          <h1 className="page-title">Your Learning Profile</h1>
          <p className="page-subtitle">Tell us about yourself so we can personalize your experience.</p>
        </div>

        <div className="profile-layout">
          {/* Basic Info */}
          <div className="card-3d animate-fade-up delay-100">
            <h3 className="mb-4">Basic Information</h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="full-name"
                type="text"
                className="form-input"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Education Background</label>
              <input
                id="education"
                type="text"
                className="form-input"
                value={form.education}
                onChange={e => setForm(f => ({ ...f, education: e.target.value }))}
                placeholder="e.g., B.Tech Computer Science, 3rd Year"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Learning Preference</label>
              <select
                id="learning-preference"
                className="form-input form-select"
                value={form.learning_preference}
                onChange={e => setForm(f => ({ ...f, learning_preference: e.target.value as any }))}
              >
                <option value="video">🎥 Video Tutorials</option>
                <option value="text">📄 Reading / Documentation</option>
                <option value="projects">🛠️ Hands-on Projects</option>
                <option value="mixed">🎯 Mixed (Recommended)</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div className="card-3d animate-fade-up delay-200">
            <h3 className="mb-1">Your Existing Skills</h3>
            <p className="text-sm text-muted mb-4">Add skills you already know. Rate your level honestly.</p>

            {/* Add skill */}
            <div className="skill-add-row">
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="add-skill-input"
                  type="text"
                  className="form-input"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Type a skill name..."
                  list="skill-suggestions"
                />
                <datalist id="skill-suggestions">
                  {SKILLS_SUGGESTIONS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <button className="btn btn-primary btn-sm" onClick={addSkill} id="add-skill-btn">Add</button>
            </div>

            {/* Skills List */}
            <div className="skills-list mt-4">
              {skills.map(skill => (
                <div key={skill.name} className="skill-item">
                  <div className="skill-name">{skill.name}</div>
                  <select
                    className="skill-level-select"
                    value={skill.level}
                    onChange={e => setSkills(prev => prev.map(s => s.name === skill.name ? { ...s, level: e.target.value, score: e.target.value === 'beginner' ? 30 : e.target.value === 'intermediate' ? 60 : 85 } : s))}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <button
                    className="btn btn-ghost btn-sm skill-remove"
                    onClick={() => removeSkill(skill.name)}
                    title="Remove"
                  >✕</button>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-muted text-center" style={{ padding: '1rem' }}>
                  No skills added yet. Add skills you know above.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* V4 Resume & Prior Knowledge Fast-Tracker */}
        <div className="card-3d mt-6 animate-fade-up delay-250">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-indigo-500" />
            <h3 className="text-base font-bold">Resume & Prior Knowledge Curriculum Fast-Tracker</h3>
            <span className="badge badge-indigo text-xs">Version 4</span>
          </div>
          <p className="text-xs text-muted mb-4">
            Upload your resume or marksheet. Our AI will analyze your existing technical competencies and dynamically skip topics you have already mastered in your curriculum.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt,.docx"
              style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && setResumeFile(e.target.files[0])}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              id="choose-resume-btn"
            >
              <FileText size={15} /> {resumeFile ? resumeFile.name : 'Choose Resume (PDF / TXT)'}
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm btn-glow"
              onClick={handleUploadResume}
              disabled={!resumeFile || resumeUploading}
              id="analyze-resume-btn"
            >
              {resumeUploading ? (
                <div className="spinner" style={{ width: 14, height: 14 }} />
              ) : (
                <>
                  <Upload size={14} /> Analyze & Fast-Track Curriculum
                </>
              )}
            </button>
          </div>

          {/* If resume exists, show detected skills */}
          {resumeProfile?.has_resume && resumeProfile.skills && resumeProfile.skills.length > 0 && (
            <div className="mt-4 pt-3 border-t border-color text-xs">
              <span className="text-muted font-bold block mb-2">
                Verified Skills Extracted from Latest Resume ({resumeProfile.filename}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {resumeProfile.skills.map(sk => (
                  <span key={sk.name} className="badge badge-emerald text-xs flex items-center gap-1">
                    <CheckCircle2 size={11} /> {sk.name} ({sk.level})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 animate-fade-up delay-300">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            disabled={saving || !form.full_name}
            id="save-profile-btn"
          >
            {saving ? <div className="spinner" /> : <><Save size={18} /> Save & Continue</>}
          </button>
        </div>

        {/* Danger Zone & Account Management */}
        <div className="card-3d danger-zone-card mt-8 animate-fade-up delay-400">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} style={{ color: 'var(--clr-amber-500)' }} />
            <h3 className="text-lg font-bold">Account Management & Data Controls</h3>
          </div>
          <p className="text-sm text-muted mb-5">
            Manage your learning journey lifecycle or permanently delete your account and associated records.
          </p>

          <div className="danger-zone-grid">
            {/* Clear learning data */}
            <div className="danger-zone-action-box">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="danger-action-icon amber">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary">Clear Learning Data & Start Fresh</h4>
                    <span className="badge badge-amber text-xs">Resets Journey</span>
                  </div>
                </div>
                <p className="text-xs text-muted mb-4">
                  Reset your enrolled career path, weekly roadmaps, quizzes, flashcards, and notes. You can choose a new goal and restart from scratch. Your account credentials stay intact.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetProgress}
                disabled={resetting || deleting}
                id="reset-learning-data-btn"
                style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--clr-amber-500)' }}
              >
                {resetting ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><RotateCcw size={14} /> Clear Data & Restart Journey</>}
              </button>
            </div>

            {/* Delete Account */}
            <div className="danger-zone-action-box danger-box-border">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="danger-action-icon rose">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-rose-500">Permanently Delete Account</h4>
                    <span className="badge badge-rose text-xs">Irreversible</span>
                  </div>
                </div>
                <p className="text-xs text-muted mb-4">
                  Permanently delete your profile, credentials, and all recorded learning history from our database. This action is irreversible.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDeleteAccount}
                disabled={resetting || deleting}
                id="delete-account-btn"
              >
                {deleting ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <><Trash2 size={14} /> Delete Account Permanently</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
