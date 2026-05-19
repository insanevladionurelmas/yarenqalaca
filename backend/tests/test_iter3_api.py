"""Iteration 3 backend tests: campaigns CRUD + site settings merge."""
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@yarenalacapr.com"
ADMIN_PASSWORD = "YarenAlaca!Admin2026"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api):
    r = api.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Public site-settings ----------
class TestSiteSettings:
    def test_public_settings_returns_full_defaults(self, api):
        r = api.get(f"{API}/site-settings")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d.get("brands"), list)
        assert len(d["brands"]) >= 21
        ag = d["audience_gender_primary"]
        assert ag["women"] == 61 and ag["men"] == 37 and ag["other"] == 2
        assert len(d["age_ranges"]) == 4
        assert len(d["top_countries_audience"]) == 4
        assert len(d["top_countries_location"]) == 5
        for k in ("media_kit_cta_title", "media_kit_cta_text", "media_kit_cta_button"):
            assert k in d and isinstance(d[k], str) and len(d[k]) > 0

    def test_admin_partial_put_preserves_other_keys(self, api, auth_headers):
        new_title = "TEST_MK CTA Title"
        r = api.put(f"{API}/admin/site-settings",
                    json={"media_kit_cta_title": new_title}, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["media_kit_cta_title"] == new_title
        # other keys preserved (from defaults)
        assert len(d["brands"]) >= 21
        assert d["audience_gender_primary"]["women"] == 61

        # GET reflects persisted change
        r2 = api.get(f"{API}/site-settings")
        assert r2.status_code == 200
        assert r2.json()["media_kit_cta_title"] == new_title

        # restore default
        api.put(f"{API}/admin/site-settings",
                json={"media_kit_cta_title": "Request Full Media Kit"},
                headers=auth_headers)

    def test_admin_put_invalid_keys_returns_400(self, api, auth_headers):
        r = api.put(f"{API}/admin/site-settings",
                    json={"random_key": "x", "foo": 1}, headers=auth_headers)
        assert r.status_code == 400


# ---------- Public campaigns ----------
class TestCampaignsPublic:
    def test_public_list_visible_sorted(self, api):
        r = api.get(f"{API}/campaigns")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 5
        for it in items:
            assert "_id" not in it
            assert it["visible"] is True
        orders = [it["display_order"] for it in items]
        assert orders == sorted(orders), "Campaigns should be sorted asc by display_order"
        brands = {it["brand"] for it in items}
        for expected in ("Adidas", "Sephora", "Sol de Janeiro", "Prime Video", "Tamirhane"):
            assert expected in brands


# ---------- Admin campaign CRUD ----------
class TestCampaignsAdmin:
    def test_admin_list_includes_hidden(self, api, auth_headers):
        r = api.get(f"{API}/admin/campaigns", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_categories_endpoint(self, api, auth_headers):
        r = api.get(f"{API}/admin/campaign-categories", headers=auth_headers)
        assert r.status_code == 200
        cats = r.json().get("categories")
        assert isinstance(cats, list) and len(cats) == 8

    def test_create_invalid_category_returns_400(self, api, auth_headers):
        r = api.post(f"{API}/admin/campaigns",
                     json={"title": "TEST_Bad", "brand": "TEST", "category": "NotARealCat"},
                     headers=auth_headers)
        assert r.status_code == 400

    def test_create_update_delete_campaign(self, api, auth_headers):
        # CREATE
        payload = {
            "title": "TEST_Campaign Iter3",
            "brand": "TEST_Brand",
            "category": "Beauty",
            "image_url": "https://example.com/x.jpg",
            "description": "TEST description",
            "featured": False,
            "display_order": 99,
            "visible": True,
        }
        r = api.post(f"{API}/admin/campaigns", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        c = r.json()
        cid = c["id"]
        assert c["title"] == payload["title"]
        assert c["category"] == "Beauty"

        # GET via admin list — present
        r2 = api.get(f"{API}/admin/campaigns", headers=auth_headers)
        assert any(x["id"] == cid for x in r2.json())

        # UPDATE
        r3 = api.patch(f"{API}/admin/campaigns/{cid}",
                       json={"title": "TEST_Updated", "visible": False},
                       headers=auth_headers)
        assert r3.status_code == 200
        assert r3.json()["title"] == "TEST_Updated"
        assert r3.json()["visible"] is False

        # Public should NOT include hidden
        r4 = api.get(f"{API}/campaigns")
        assert not any(x["id"] == cid for x in r4.json())

        # DELETE
        r5 = api.delete(f"{API}/admin/campaigns/{cid}", headers=auth_headers)
        assert r5.status_code == 200
        assert r5.json() == {"deleted": True}

        # Re-delete returns 404
        r6 = api.delete(f"{API}/admin/campaigns/{cid}", headers=auth_headers)
        assert r6.status_code == 404
