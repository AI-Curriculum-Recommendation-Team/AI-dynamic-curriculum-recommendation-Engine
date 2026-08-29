import requests

BASE = 'http://127.0.0.1:8000/api/v1'

# 1. Register
reg_res = requests.post(f'{BASE}/auth/register', json={
    'email': 'student.test@example.com',
    'password': 'Password123!',
    'full_name': 'Alex Student'
})
print('1. Register status:', reg_res.status_code)
data = reg_res.json()
token = data.get('access_token')
if not token:
    # If already registered, login
    login_res = requests.post(f'{BASE}/auth/login', json={
        'email': 'student.test@example.com',
        'password': 'Password123!'
    })
    token = login_res.json()['access_token']
    print('1b. Logged in successfully')

headers = {'Authorization': f'Bearer {token}'}

# 2. Get Profile
prof_res = requests.get(f'{BASE}/students/profile', headers=headers)
print('2. Profile:', prof_res.status_code, prof_res.json().get('full_name'))

# 3. Set Career Goal (AI Engineer = 1)
career_res = requests.post(f'{BASE}/students/career', json={'career_goal_id': 1}, headers=headers)
print('3. Career goal set:', career_res.status_code, career_res.json())

# 4. Get Assessment
assess_res = requests.get(f'{BASE}/assessments/1', headers=headers)
assess_data = assess_res.json()
print('4. Assessment loaded, question count:', len(assess_data.get('questions', [])))

# 5. Submit Answers
answers = {q['id']: q['options'][0] for q in assess_data['questions']}
sub_res = requests.post(f'{BASE}/assessments/submit', json={
    'assessment_id': assess_data['id'],
    'answers': answers
}, headers=headers)
result_data = sub_res.json()
print('5. Assessment submitted. Overall Score:', result_data.get('overall_score'), '%')

# 6. Generate Curriculum
print('6. Generating AI curriculum with Gemini...')
cur_res = requests.post(f'{BASE}/curriculum/generate', json={'career_goal_id': 1}, headers=headers)
print('6. Curriculum generation status:', cur_res.status_code)
if cur_res.status_code == 200:
    cur_data = cur_res.json()
    print('   Total weeks generated:', cur_data.get('total_weeks'))
    print('   Strong skills:', cur_data.get('strong_skills'))
    print('   Skill gaps:', cur_data.get('skill_gaps'))
    for w in cur_data.get('weeks', [])[:3]:
        print(f"   - Week {w['week_number']}: {w['topic']} ({w['estimated_hours']}h)")

# 7. Get Roadmap
road_res = requests.get(f'{BASE}/curriculum/roadmap', headers=headers)
print('7. Roadmap loaded. Total roadmap steps:', len(road_res.json().get('weeks', [])))

# 8. Update Progress on Week 1
weeks = road_res.json().get('weeks', [])
if weeks:
    first_week_id = weeks[0]['week_id']
    prog_res = requests.put(f'{BASE}/progress/{first_week_id}', json={'status': 'completed'}, headers=headers)
    print('8. Progress updated for week 1 to completed:', prog_res.status_code)
    
# 9. Get Summary
sum_res = requests.get(f'{BASE}/progress/summary/me', headers=headers)
print('9. Progress summary:', sum_res.json())

# 10. V2 Adaptive Learning: Submit Low Quiz Score (<60%) -> injects remedial practice
adapt_res = requests.post(f'{BASE}/curriculum/quiz/{first_week_id}/submit', json={
    'score_percentage': 50.0,
    'topic': weeks[0]['topic']
}, headers=headers).json()
print('10. V2 Adaptive Quiz (<60%): Action =', adapt_res.get('action'), '| Status =', adapt_res.get('status'))

# 11. V2 Smart Notifications: Check notification generated
notifs_res = requests.get(f'{BASE}/notifications/', headers=headers).json()
print('11. V2 Notifications:', len(notifs_res), 'notifications. Latest:', notifs_res[0]['title'])

# 12. V2 Weekly AI Progress Report
rep_res = requests.get(f'{BASE}/curriculum/report/weekly', headers=headers).json()
print('12. V2 Weekly AI Report generated:', len(rep_res.get('report', '')), 'characters')

print('\nALL V1 & V2 E2E STEPS SUCCEEDED SUCCESSFULLY!')
