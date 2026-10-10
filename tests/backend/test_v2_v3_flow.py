import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend')))

import io
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine
from app.services.seed import seed_initial_data

def test_full_v1_v2_v3_flow():
    print("\n--- Starting Full V1, V2, V3 Verification ---")
    Base.metadata.create_all(bind=engine)
    seed_initial_data()
    client = TestClient(app)

    # 1. Register / Login
    email = "v3_student@example.com"
    reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": "Antigravity V3 Tester",
    })
    if reg.status_code == 200:
        token = reg.json()["access_token"]
        print("[OK] Auth Register Success")
    else:
        login = client.post("/api/v1/auth/login", json={
            "email": email,
            "password": "Password123!",
        })
        token = login.json()["access_token"]
        print("[OK] Auth Login Success")

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Career Goal Set & Curriculum check
    client.post("/api/v1/students/career", json={"career_goal_id": 1}, headers=headers)
    curr = client.post("/api/v1/curriculum/generate", json={"career_goal_id": 1}, headers=headers)
    assert curr.status_code == 200
    curr_data = curr.json()
    week_id = curr_data["weeks"][0]["id"]
    print(f"[OK] V1 Curriculum Loaded with {len(curr_data['weeks'])} weeks (Week 1 ID: {week_id})")

    # 3. V2 Achievements
    ach = client.get("/api/v2/achievements", headers=headers)
    assert ach.status_code == 200
    print(f"[OK] V2 Achievements endpoint working (Found {len(ach.json())} badges)")

    # 4. V2 Reports
    rep = client.get("/api/v2/reports/weekly", headers=headers)
    assert rep.status_code == 200
    print("[OK] V2 Weekly AI Progress Report generated successfully")

    # 5. V2 Quizzes
    quiz = client.post(f"/api/v2/quiz/generate/{week_id}", headers=headers)
    assert quiz.status_code == 200
    quiz_data = quiz.json()
    quiz_id = quiz_data["quiz_id"]
    print(f"[OK] V2 Quiz generated for topic '{quiz_data['topic']}' (Quiz ID: {quiz_id})")

    # Submit quiz
    sub = client.post(f"/api/v2/quiz/{quiz_id}/submit", json={
        "answers": {"0": "A"},
        "score_percentage": 90.0,
    }, headers=headers)
    assert sub.status_code == 200
    assert sub.json()["action"] == "advanced"
    print("[OK] V2 Quiz submitted with 90% score -> Action: advanced")

    # 6. V3 Document Upload & Indexing
    dummy_pdf_content = (
        b"%PDF-1.4\n1 0 obj\n<< /Title (Machine Learning Basics) >>\nendobj\n"
        b"Deep Learning is a subset of Machine Learning utilizing neural networks with multiple layers. "
        b"Backpropagation calculates gradients of the loss function with respect to weights."
    )
    doc_res = client.post(
        "/api/v3/documents/upload",
        files={"file": ("ml_notes.txt", io.BytesIO(dummy_pdf_content), "text/plain")},
        headers=headers,
    )
    assert doc_res.status_code == 200
    doc_data = doc_res.json()
    doc_id = doc_data["id"]
    print(f"[OK] V3 Document Uploaded & Indexed (Doc ID: {doc_id}, chunks: {doc_data['chunk_count']})")

    # 7. V3 Flashcards Generation
    fc_res = client.post(f"/api/v3/flashcards/generate/{week_id}", headers=headers)
    assert fc_res.status_code == 200
    fc_data = fc_res.json()
    print(f"[OK] V3 AI Flashcards generated (Deck ID: {fc_data['id']}, {len(fc_data['items'])} cards)")

    # Toggle mastery
    if fc_data["items"]:
        item_id = fc_data["items"][0]["id"]
        master_res = client.put(f"/api/v3/flashcards/items/{item_id}/master", headers=headers)
        assert master_res.status_code == 200
        print(f"[OK] V3 Flashcard Item #{item_id} mastery toggled -> {master_res.json()['is_mastered']}")

    # 8. V3 Study Notes Summarization
    note_res = client.post(f"/api/v3/notes/summarize-topic/{week_id}", headers=headers)
    assert note_res.status_code == 200
    note_data = note_res.json()
    print(f"[OK] V3 Study Notes Synthesized: '{note_data['title']}' with {len(note_data['key_takeaways'])} takeaways")

    # 9. V3 AI Tutor Session & Grounded Message (RAG)
    sess_res = client.post("/api/v3/tutor/sessions", json={
        "title": "Deep Learning Fundamentals",
        "curriculum_week_id": week_id,
    }, headers=headers)
    assert sess_res.status_code == 200
    sess_id = sess_res.json()["id"]
    print(f"[OK] V3 Tutor Session started (Session ID: {sess_id})")

    chat_res = client.post(f"/api/v3/tutor/sessions/{sess_id}/message", json={
        "message": "What is backpropagation in neural networks?",
        "topic": "Deep Learning",
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    print(f"[OK] V3 AI Tutor RAG Response received! Sources cited: {len(chat_data['sources'])}")
    print(f"   AI response preview: {chat_data['ai_message']['content'][:120]}...")

    print("\n=== ALL V1, V2, and V3 Endpoints Passed Verification! ===\n")

if __name__ == "__main__":
    test_full_v1_v2_v3_flow()
