"""Backend tests for iteration 2: admin auth + lead enhancements + email skip.

Covers:
- POST /api/leads with EmailStr validation
- POST /api/leads — persists, status=new, email-skip non-blocking
- POST /api/admin/login (success / wrong password)
- GET /api/admin/me (with / without token)
- GET /api/admin/leads (filters)
- GET /api/admin/leads/stats
- PATCH /api/admin/leads/{id} (status->contacted sets contacted_at; tag allow-list)
- DELETE /api/admin/leads/{id}
- GET /api/admin/leads/export.csv (headers)
- GET /api/admin/tags
- /robots.txt and /sitemap.xml accessible
"""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://yaren-pr-ecosystem.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "admin@yarenalacapr.com"
ADMIN_PASSWORD = "YarenAlaca!Admin2026"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{BASE_URL}/api/admin/login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and "admin" in data
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def created_lead(api):
    """Create a TEST_ lead used by multiple admin tests."""
    payload = {
        "name": "TEST_AdminFlow",
        "brand": "TEST_Brand",
        "email": "TEST_admin_flow@example.com",
        "phone": "+10000000",
        "message": "TEST iteration 2",
        "type": "collaboration",
    }
    r = api.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code == 200, r.text
    return r.json()


# ---------- Public POST /api/leads ----------
class TestPublicLeads:
    def test_invalid_email_returns_422(self, api):
        r = api.post(f"{BASE_URL}/api/leads", json={
            "name": "Bad", "email": "not-an-email", "type": "collaboration"
        })
        assert r.status_code == 422

    def test_missing_email_returns_422(self, api):
        r = api.post(f"{BASE_URL}/api/leads", json={"name": "X", "type": "collaboration"})
        assert r.status_code == 422

    def test_valid_lead_persists_with_defaults(self, api):
        payload = {
            "name": "TEST_Defaults",
            "email": "TEST_defaults@example.com",
            "type": "media_kit",
        }
        r = api.post(f"{BASE_URL}/api/leads", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "new"
        assert data["tags"] == []
        assert data["admin_notes"] is None
        assert data["contacted_at"] is None
        assert "id" in data and "created_at" in data
        assert data["email"] == payload["email"]


# ---------- Admin auth ----------
class TestAdminAuth:
    def test_login_wrong_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401
        assert r.json().get("detail") == "Invalid email or password"

    def test_login_success(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_me_without_auth(self, api):
        r = api.get(f"{BASE_URL}/api/admin/me")
        assert r.status_code == 401

    def test_me_with_auth(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "id" in data and "name" in data


# ---------- Admin lead ops ----------
class TestAdminLeads:
    def test_list_leads(self, api, auth_headers, created_lead):
        r = api.get(f"{BASE_URL}/api/admin/leads", headers=auth_headers)
        assert r.status_code == 200
        leads = r.json()
        assert isinstance(leads, list)
        assert any(l["id"] == created_lead["id"] for l in leads)

    def test_list_leads_filter_by_type(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads?type=collaboration", headers=auth_headers)
        assert r.status_code == 200
        for lead in r.json():
            assert lead["type"] == "collaboration"

    def test_list_leads_filter_by_status_new(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads?status=new", headers=auth_headers)
        assert r.status_code == 200
        for lead in r.json():
            assert lead["status"] == "new"

    def test_list_leads_search_q(self, api, auth_headers, created_lead):
        r = api.get(f"{BASE_URL}/api/admin/leads?q=TEST_AdminFlow", headers=auth_headers)
        assert r.status_code == 200
        results = r.json()
        assert any(l["id"] == created_lead["id"] for l in results)

    def test_stats_endpoint(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads/stats", headers=auth_headers)
        assert r.status_code == 200
        s = r.json()
        for k in ("total", "new", "contacted", "qualified", "closed",
                  "collaboration", "media_kit", "hot"):
            assert k in s
            assert isinstance(s[k], int)

    def test_tags_endpoint(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/tags", headers=auth_headers)
        assert r.status_code == 200
        tags = r.json().get("tags")
        assert isinstance(tags, list) and len(tags) == 7
        assert "Hot Lead" in tags and "High Budget" in tags

    def test_patch_status_contacted_sets_contacted_at(self, api, auth_headers, created_lead):
        lid = created_lead["id"]
        r = api.patch(f"{BASE_URL}/api/admin/leads/{lid}",
                      json={"status": "contacted"}, headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["status"] == "contacted"
        assert data["contacted_at"] is not None

        # GET to verify persistence
        r2 = api.get(f"{BASE_URL}/api/admin/leads?q=TEST_AdminFlow", headers=auth_headers)
        match = next((l for l in r2.json() if l["id"] == lid), None)
        assert match is not None and match["status"] == "contacted"
        assert match["contacted_at"] is not None

    def test_patch_tags_allowlist_filters_unknown(self, api, auth_headers, created_lead):
        lid = created_lead["id"]
        r = api.patch(f"{BASE_URL}/api/admin/leads/{lid}",
                      json={"tags": ["Hot Lead", "NotARealTag", "High Budget"]},
                      headers=auth_headers)
        assert r.status_code == 200
        tags = r.json()["tags"]
        assert "Hot Lead" in tags and "High Budget" in tags
        assert "NotARealTag" not in tags

    def test_patch_admin_notes(self, api, auth_headers, created_lead):
        lid = created_lead["id"]
        r = api.patch(f"{BASE_URL}/api/admin/leads/{lid}",
                      json={"admin_notes": "TEST notes content"},
                      headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["admin_notes"] == "TEST notes content"

    def test_export_csv_headers(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/leads/export.csv", headers=auth_headers)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        assert "attachment" in r.headers.get("content-disposition", "")
        # CSV header row
        first_line = r.text.splitlines()[0]
        assert "id" in first_line and "email" in first_line and "tags" in first_line

    def test_delete_lead(self, api, auth_headers):
        # Create then delete a throwaway lead
        c = api.post(f"{BASE_URL}/api/leads", json={
            "name": "TEST_ToDelete", "email": "TEST_delete@example.com",
            "type": "media_kit"
        })
        assert c.status_code == 200
        lid = c.json()["id"]

        d = api.delete(f"{BASE_URL}/api/admin/leads/{lid}", headers=auth_headers)
        assert d.status_code == 200
        assert d.json() == {"deleted": True}

        # 404 on re-delete
        d2 = api.delete(f"{BASE_URL}/api/admin/leads/{lid}", headers=auth_headers)
        assert d2.status_code == 404


# ---------- SEO static files ----------
class TestSEO:
    def test_robots_txt(self):
        r = requests.get(f"{BASE_URL}/robots.txt")
        assert r.status_code == 200
        assert "User-agent" in r.text
        assert "Sitemap" in r.text

    def test_sitemap_xml(self):
        r = requests.get(f"{BASE_URL}/sitemap.xml")
        assert r.status_code == 200
        assert "<urlset" in r.text
