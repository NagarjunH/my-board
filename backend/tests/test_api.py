import pytest
import json
from app import create_app, db_session, engine
from app.models import Base, User, Board, Page

@pytest.fixture
def client():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"
    })

    with app.test_client() as test_client:
        with app.app_context():
            Base.metadata.create_all(bind=engine)
            from app.services.seed_service import seed_database_if_empty
            seed_database_if_empty(db_session)
        yield test_client

def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"

def test_auth_login(client):
    res = client.post("/api/auth/login", json={
        "email": "nagarjun@youtube.creator",
        "password": "password123"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    assert data["user"]["email"] == "nagarjun@youtube.creator"

def test_get_boards_with_auth(client):
    login_res = client.post("/api/auth/login", json={
        "email": "nagarjun@youtube.creator",
        "password": "password123"
    })
    token = login_res.get_json()["token"]

    res = client.get("/api/boards", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.get_json()
    assert len(data["boards"]) >= 1

    # Check that JavaScript Complete board has the seeded 9 pages
    js_board = next(b for b in data["boards"] if "JavaScript" in b["name"])
    assert len(js_board["pages"]) == 9
    first_page = js_board["pages"][0]
    assert first_page["name"] == "01. Variables and Data Types"
    assert len(first_page["canvasState"]["elements"]) > 0

def test_create_and_update_page(client):
    login_res = client.post("/api/auth/login", json={
        "email": "nagarjun@youtube.creator",
        "password": "password123"
    })
    token = login_res.get_json()["token"]

    # 1. Create a new board
    create_board_res = client.post("/api/boards", json={"name": "React 19 Hooks"}, headers={"Authorization": f"Bearer {token}"})
    assert create_board_res.status_code == 201
    board_id = create_board_res.get_json()["board"]["id"]

    # 2. Create a new page
    create_page_res = client.post(f"/api/boards/{board_id}/pages", json={"name": "useActionState Guide"}, headers={"Authorization": f"Bearer {token}"})
    assert create_page_res.status_code == 201
    page_id = create_page_res.get_json()["page"]["id"]

    # 3. Simulate Autosave patch with serialized canvas state
    canvas_payload = {
        "elements": [
            {
                "id": "code-hook-1",
                "type": "code",
                "code": "const [state, formAction] = useActionState(updateName, null);",
                "language": "javascript"
            }
        ],
        "viewport": {"x": 50, "y": 100, "zoom": 1.2}
    }
    patch_res = client.patch(
        f"/api/pages/{page_id}",
        json={"canvas_state": canvas_payload, "background_config": {"style": "graph"}},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert patch_res.status_code == 200
    updated = patch_res.get_json()["page"]
    assert len(updated["canvasState"]["elements"]) == 1
    assert updated["backgroundConfig"]["style"] == "graph"

def test_share_board_flow(client):
    login_res = client.post("/api/auth/login", json={
        "email": "nagarjun@youtube.creator",
        "password": "password123"
    })
    token = login_res.get_json()["token"]

    # Share existing board
    share_res = client.post("/api/boards/board-js/share", json={"permission": "view"}, headers={"Authorization": f"Bearer {token}"})
    assert share_res.status_code == 201
    share_token = share_res.get_json()["share"]["token"]

    # Public viewer visits share token without login
    public_res = client.get(f"/api/share/{share_token}")
    assert public_res.status_code == 200
    public_data = public_res.get_json()
    assert public_data["board"]["name"] == "JavaScript Complete"
    assert public_data["permission"] == "view"
