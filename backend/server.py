from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import io
import csv
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, BackgroundTasks, Depends, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr

from auth import hash_password, verify_password, create_access_token, get_current_admin
from email_service import send_lead_emails


# === DB ===
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# === App ===
app = FastAPI(title="Yaren Alaca PR API")
app.state.db = db
api_router = APIRouter(prefix="/api")


# ============================================================
# Models
# ============================================================
LeadType = Literal["collaboration", "media_kit"]
LeadStatus = Literal["new", "contacted", "qualified", "closed"]
ALLOWED_TAGS = [
    "Hot Lead",
    "Brand Inquiry",
    "Agency",
    "Event Invite",
    "PR Package",
    "High Budget",
    "Pending Reply",
]


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    brand: Optional[str] = Field(default=None, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=60)
    message: Optional[str] = Field(default=None, max_length=5000)
    type: LeadType


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    brand: Optional[str] = None
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    type: LeadType
    status: LeadStatus = "new"
    tags: List[str] = Field(default_factory=list)
    admin_notes: Optional[str] = None
    contacted_at: Optional[datetime] = None
    created_at: datetime


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    tags: Optional[List[str]] = None
    admin_notes: Optional[str] = None


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminMe(BaseModel):
    id: str
    email: str
    name: str
    role: str


# ============================================================
# Public routes
# ============================================================
@api_router.get("/")
async def root():
    return {"message": "Yaren Alaca PR — Multi-Platform Digital Ecosystem"}


@api_router.post("/leads", response_model=Lead)
async def create_lead(payload: LeadCreate, background: BackgroundTasks):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["tags"] = []
    doc["admin_notes"] = None
    doc["contacted_at"] = None
    now = datetime.now(timezone.utc)
    doc["created_at"] = now.isoformat()

    await db.leads.insert_one(doc)

    # Fire emails in the background — never blocks/raises
    background.add_task(send_lead_emails, {**doc, "created_at": now.strftime("%b %d, %Y · %H:%M UTC")})

    return Lead(**{**doc, "created_at": now})


# ============================================================
# Admin auth
# ============================================================
auth_router = APIRouter(prefix="/api/admin", tags=["admin"])


@auth_router.post("/login")
async def admin_login(payload: AdminLogin):
    email = payload.email.lower().strip()
    admin = await db.admins.find_one({"email": email})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(admin_id=admin["id"], email=admin["email"])
    return {
        "token": token,
        "admin": {
            "id": admin["id"],
            "email": admin["email"],
            "name": admin.get("name", "Admin"),
            "role": admin.get("role", "admin"),
        },
    }


@auth_router.get("/me", response_model=AdminMe)
async def admin_me(admin: dict = Depends(get_current_admin)):
    return AdminMe(
        id=admin["id"],
        email=admin["email"],
        name=admin.get("name", "Admin"),
        role=admin.get("role", "admin"),
    )


# ============================================================
# Admin lead management
# ============================================================
@auth_router.get("/leads", response_model=List[Lead])
async def admin_list_leads(
    admin: dict = Depends(get_current_admin),
    type: Optional[str] = None,
    status: Optional[str] = None,
    tag: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 500,
):
    query: dict = {}
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    if tag:
        query["tags"] = tag
    if q:
        regex = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"name": regex}, {"brand": regex}, {"email": regex},
            {"message": regex}, {"admin_notes": regex},
        ]
    cursor = db.leads.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    for it in items:
        if isinstance(it.get("created_at"), str):
            try:
                it["created_at"] = datetime.fromisoformat(it["created_at"])
            except Exception:
                it["created_at"] = datetime.now(timezone.utc)
        if isinstance(it.get("contacted_at"), str):
            try:
                it["contacted_at"] = datetime.fromisoformat(it["contacted_at"])
            except Exception:
                it["contacted_at"] = None
    return items


@auth_router.get("/leads/stats")
async def admin_lead_stats(admin: dict = Depends(get_current_admin)):
    total = await db.leads.count_documents({})
    new = await db.leads.count_documents({"status": "new"})
    contacted = await db.leads.count_documents({"status": "contacted"})
    qualified = await db.leads.count_documents({"status": "qualified"})
    closed = await db.leads.count_documents({"status": "closed"})
    collab = await db.leads.count_documents({"type": "collaboration"})
    media = await db.leads.count_documents({"type": "media_kit"})
    hot = await db.leads.count_documents({"tags": "Hot Lead"})
    return {
        "total": total, "new": new, "contacted": contacted,
        "qualified": qualified, "closed": closed,
        "collaboration": collab, "media_kit": media, "hot": hot,
    }


@auth_router.patch("/leads/{lead_id}", response_model=Lead)
async def admin_update_lead(lead_id: str, payload: LeadUpdate, admin: dict = Depends(get_current_admin)):
    update_doc: dict = {}
    if payload.status is not None:
        update_doc["status"] = payload.status
        if payload.status == "contacted":
            update_doc["contacted_at"] = datetime.now(timezone.utc).isoformat()
    if payload.tags is not None:
        # Validate tags against allow-list (lenient: ignore unknown silently)
        update_doc["tags"] = [t for t in payload.tags if t in ALLOWED_TAGS]
    if payload.admin_notes is not None:
        update_doc["admin_notes"] = payload.admin_notes
    if not update_doc:
        raise HTTPException(status_code=400, detail="No changes")

    result = await db.leads.find_one_and_update(
        {"id": lead_id},
        {"$set": update_doc},
        projection={"_id": 0},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Lead not found")
    # Coerce datetime strings
    for k in ("created_at", "contacted_at"):
        v = result.get(k)
        if isinstance(v, str):
            try:
                result[k] = datetime.fromisoformat(v)
            except Exception:
                result[k] = None if k == "contacted_at" else datetime.now(timezone.utc)
    return result


@auth_router.delete("/leads/{lead_id}")
async def admin_delete_lead(lead_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.leads.delete_one({"id": lead_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"deleted": True}


@auth_router.get("/leads/export.csv")
async def admin_export_csv(admin: dict = Depends(get_current_admin)):
    cursor = db.leads.find({}, {"_id": 0}).sort("created_at", -1)
    items = await cursor.to_list(10000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "id", "created_at", "type", "status", "tags",
        "name", "brand", "email", "phone", "message",
        "admin_notes", "contacted_at",
    ])
    for it in items:
        writer.writerow([
            it.get("id", ""), it.get("created_at", ""), it.get("type", ""),
            it.get("status", ""), ";".join(it.get("tags") or []),
            it.get("name", ""), it.get("brand") or "", it.get("email", ""),
            it.get("phone") or "", (it.get("message") or "").replace("\n", " ").replace("\r", " "),
            (it.get("admin_notes") or "").replace("\n", " ").replace("\r", " "),
            it.get("contacted_at") or "",
        ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="leads-{datetime.now(timezone.utc).date()}.csv"'},
    )


@auth_router.get("/tags")
async def admin_allowed_tags(admin: dict = Depends(get_current_admin)):
    return {"tags": ALLOWED_TAGS}


# ============================================================
# Startup: seed admin, indexes
# ============================================================
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if not admin_email or not admin_password:
        return
    existing = await db.admins.find_one({"email": admin_email})
    if existing is None:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logging.info("Seeded admin %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.admins.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logging.info("Rotated admin password for %s", admin_email)


@app.on_event("startup")
async def on_startup():
    await db.admins.create_index("email", unique=True)
    await db.admins.create_index("id", unique=True)
    await db.leads.create_index("id", unique=True)
    await db.leads.create_index("created_at")
    await seed_admin()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# Mount routers
app.include_router(api_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
