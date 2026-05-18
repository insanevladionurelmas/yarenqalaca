"""Yaren Alaca PR — backend API tests (root + leads endpoints)."""
import os
import pytest
import requests
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://yaren-pr-ecosystem.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Root endpoint ----------
class TestRoot:
    def test_root_welcome(self, api_client):
        r = api_client.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "Yaren Alaca" in data["message"]


# ---------- Leads endpoints ----------
class TestLeadsCreate:
    def test_create_collaboration_lead(self, api_client):
        payload = {
            "name": "TEST_Collab User",
            "brand": "TEST_Brand",
            "email": "TEST_collab@example.com",
            "phone": "+1-555-0100",
            "message": "Interested in a multi-platform campaign",
            "type": "collaboration",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert data["type"] == "collaboration"
        assert data["brand"] == payload["brand"]
        assert "created_at" in data
        # ISO datetime parseable
        datetime.fromisoformat(data["created_at"].replace("Z", "+00:00"))
        # ensure no MongoDB _id leaks
        assert "_id" not in data

    def test_create_media_kit_lead(self, api_client):
        payload = {
            "name": "TEST_MediaKit User",
            "email": "TEST_mediakit@example.com",
            "type": "media_kit",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["type"] == "media_kit"
        assert data["name"] == payload["name"]
        assert data["email"] == payload["email"]
        assert "id" in data
        assert "_id" not in data

    def test_create_lead_missing_email_returns_422(self, api_client):
        payload = {
            "name": "TEST_NoEmail",
            "type": "collaboration",
        }
        r = api_client.post(f"{API}/leads", json=payload)
        assert r.status_code == 422, r.text


# ---------- Leads listing ----------
class TestLeadsList:
    def test_list_leads_returns_array(self, api_client):
        r = api_client.get(f"{API}/leads")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_list_leads_persisted_and_sorted_desc(self, api_client):
        # Seed a unique lead
        unique_email = f"TEST_persist_{datetime.utcnow().timestamp()}@example.com"
        create = api_client.post(f"{API}/leads", json={
            "name": "TEST_Persist",
            "email": unique_email,
            "type": "collaboration",
            "message": "persistence check",
        })
        assert create.status_code == 200
        new_id = create.json()["id"]

        r = api_client.get(f"{API}/leads")
        assert r.status_code == 200
        leads = r.json()
        assert isinstance(leads, list) and len(leads) > 0

        # No _id leak
        for lead in leads:
            assert "_id" not in lead
            assert "created_at" in lead
            # ISO datetime parseable
            datetime.fromisoformat(lead["created_at"].replace("Z", "+00:00"))

        # Most recent first — verify by checking dates are non-increasing
        dates = [datetime.fromisoformat(l["created_at"].replace("Z", "+00:00")) for l in leads]
        assert dates == sorted(dates, reverse=True), "Leads not sorted desc by created_at"

        # Our newly created lead should be present
        ids = [l["id"] for l in leads]
        assert new_id in ids
