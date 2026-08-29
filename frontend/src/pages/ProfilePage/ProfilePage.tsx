import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentService } from '../../services';
import { useStudentStore } from '../../store';
import type { StudentSkill } from '../../types';
import './ProfilePage.css';

const SKILLS_SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'SQL', 'Machine Learning', 'Deep Learning',
  'React', 'Node.js', 'Docker', 'AWS', 'Statistics', 'Data Visualization',
  'Natural Language Processing', 'TensorFlow', 'PyTorch', 'Git', 'Linux',
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { student, setStudent } = useStudentStore();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studentService.getProfile().catch(() => null),
      studentService.getSkills().catch(() => []),
    ]).then(([prof, sk]) => {
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
      </div>
    </div>
  );
}
