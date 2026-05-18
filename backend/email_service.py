"""Resend email service — premium HTML templates for Yaren Alaca PR.

Modular config: SENDER_EMAIL / SENDER_NAME / NOTIFY_EMAIL / CC_EMAIL all read
from environment at call time, so swapping `onboarding@resend.dev` for
`noreply@yarenalacapr.com` once SPF/DKIM are verified is a one-line env change.
"""
import os
import asyncio
import logging
from typing import Optional
import resend

logger = logging.getLogger(__name__)


def _configure():
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key:
        return False
    resend.api_key = api_key
    return True


def _from_addr() -> str:
    name = os.environ.get("SENDER_NAME", "Yaren Alaca PR")
    email = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
    return f"{name} <{email}>"


# ---------- Templates ----------
def _wrap(inner_html: str, preheader: str = "") -> str:
    """Premium editorial email shell — inline CSS, table-based."""
    return f"""
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Yaren Alaca PR</title>
  </head>
  <body style="margin:0;padding:0;background:#FCFAF8;font-family:'Helvetica Neue',Arial,sans-serif;color:#2D2422;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">{preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FCFAF8;">
      <tr><td align="center" style="padding:48px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #ECE3DC;border-radius:20px;overflow:hidden;">
          <tr><td style="padding:36px 40px 0 40px;border-bottom:1px solid #F2EAE4;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:4px;text-transform:uppercase;color:#2D2422;">
              Yaren <span style="font-style:italic;color:#F0A89C;font-weight:300;">Alaca</span>
            </div>
            <div style="margin-top:6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9A8A82;">
              Multi-Platform Digital Creator
            </div>
          </td></tr>
          <tr><td style="padding:36px 40px;">{inner_html}</td></tr>
          <tr><td style="padding:24px 40px 36px;border-top:1px solid #F2EAE4;background:#FBF6F1;">
            <div style="font-size:11px;line-height:1.7;color:#9A8A82;letter-spacing:0.5px;">
              Yaren Alaca PR — Multi-Platform Digital Personality<br />
              Instagram &middot; TikTok &middot; YouTube &middot; Kick &middot; Combined 7M+ reach<br />
              <a href="mailto:info@yarenalacapr.com" style="color:#D4AF6E;text-decoration:none;">info@yarenalacapr.com</a> &middot;
              <a href="https://yarenalacapr.com" style="color:#D4AF6E;text-decoration:none;">yarenalacapr.com</a>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>
"""


def _row(label: str, value: str) -> str:
    if not value:
        return ""
    return f"""
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F2EAE4;vertical-align:top;width:140px;">
        <div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#9A8A82;">{label}</div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #F2EAE4;font-size:14px;color:#2D2422;">{value}</td>
    </tr>"""


def notification_template(lead: dict) -> str:
    is_collab = lead.get("type") == "collaboration"
    badge = "Collaboration Inquiry" if is_collab else "Media Kit Request"
    inner = f"""
    <div style="display:inline-block;padding:5px 12px;background:#F7E1DE;border-radius:999px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7A5751;">{badge}</div>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:30px;line-height:1.2;margin:18px 0 6px;color:#2D2422;">New lead — {lead.get('name','')}</h1>
    <p style="margin:0 0 24px;color:#6F5F58;font-size:14px;">A new brand inquiry was just submitted on yarenalacapr.com.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #F2EAE4;">
      {_row('Name', lead.get('name',''))}
      {_row('Brand', lead.get('brand') or '—')}
      {_row('Email', f'<a href="mailto:{lead.get("email","")}" style="color:#D4AF6E;text-decoration:none;">{lead.get("email","")}</a>')}
      {_row('Phone', lead.get('phone') or '—')}
      {_row('Type', badge)}
      {_row('Received', lead.get('created_at',''))}
    </table>

    <div style="margin-top:24px;padding:18px 20px;background:#FBF6F1;border-left:3px solid #F0A89C;border-radius:6px;">
      <div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#9A8A82;margin-bottom:6px;">Message</div>
      <div style="font-size:14px;line-height:1.6;color:#2D2422;white-space:pre-wrap;">{lead.get('message') or '—'}</div>
    </div>

    <div style="margin-top:32px;text-align:center;">
      <a href="mailto:{lead.get('email','')}" style="display:inline-block;padding:14px 28px;background:#2D2422;color:#ffffff;text-decoration:none;border-radius:999px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;">Reply to {lead.get('name','').split(' ')[0] if lead.get('name') else 'lead'}</a>
    </div>
    """
    return _wrap(inner, preheader=f"New {badge.lower()} from {lead.get('name','')}")


def autoresponse_template(lead: dict) -> str:
    is_collab = lead.get("type") == "collaboration"
    name = (lead.get("name") or "").strip().split(" ")[0] if lead.get("name") else "there"
    headline = "Thank you for reaching out" if is_collab else "Your media kit request is in"
    sub = (
        "Your collaboration inquiry has been received and is being reviewed personally by our team."
        if is_collab
        else "Your media kit request has been received. Our team will be in touch with the full kit shortly."
    )
    inner = f"""
    <div style="display:inline-block;padding:5px 12px;background:#F7E1DE;border-radius:999px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7A5751;">Received</div>
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:32px;line-height:1.2;margin:18px 0 6px;color:#2D2422;">{headline}, <span style="font-style:italic;color:#F0A89C;">{name}</span>.</h1>
    <p style="margin:0 0 28px;color:#6F5F58;font-size:15px;line-height:1.7;">{sub}</p>

    <p style="margin:0 0 18px;color:#2D2422;font-size:14px;line-height:1.8;">
      Yaren Alaca operates as a cross-platform digital personality with combined reach of <strong>7M+</strong> across Instagram, TikTok, YouTube and Kick — built for global, multi-format brand campaigns. Brand collaborations are curated selectively to maintain editorial integrity and long-term partnership value.
    </p>

    <p style="margin:0 0 28px;color:#2D2422;font-size:14px;line-height:1.8;">
      A member of the team will respond to qualified inquiries within <strong>48 hours</strong>. Until then, feel free to explore the latest work on the platforms below.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
      <tr>
        <td style="padding:0 14px 0 0;"><a href="https://www.instagram.com/yarenalaca" style="color:#D4AF6E;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Instagram</a></td>
        <td style="padding:0 14px 0 0;color:#E1D2C5;">·</td>
        <td style="padding:0 14px 0 0;"><a href="https://www.tiktok.com/@yarenalaca" style="color:#D4AF6E;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">TikTok</a></td>
        <td style="padding:0 14px 0 0;color:#E1D2C5;">·</td>
        <td style="padding:0 14px 0 0;"><a href="https://www.youtube.com/@YarenAlaca" style="color:#D4AF6E;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">YouTube</a></td>
        <td style="padding:0 14px 0 0;color:#E1D2C5;">·</td>
        <td><a href="https://kick.com/yarenalaca" style="color:#D4AF6E;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;">Kick</a></td>
      </tr>
    </table>

    <p style="margin:24px 0 0;padding-top:24px;border-top:1px solid #F2EAE4;color:#9A8A82;font-size:12px;line-height:1.7;font-style:italic;">
      "Working with Yaren is working with a creator who lives across cultures and platforms — built for the next generation of luxury brand storytelling."
    </p>
    """
    return _wrap(inner, preheader=sub)


# ---------- Send functions ----------
async def _send(to: list, subject: str, html: str, cc: Optional[list] = None) -> dict:
    if not _configure():
        logger.warning("RESEND_API_KEY not configured — skipping email send to %s", to)
        return {"skipped": True, "reason": "no_api_key"}
    params = {
        "from": _from_addr(),
        "to": to,
        "subject": subject,
        "html": html,
    }
    if cc:
        params["cc"] = cc
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info("Resend OK -> %s id=%s", to, (result or {}).get("id"))
        return {"ok": True, "id": (result or {}).get("id")}
    except Exception as exc:
        logger.error("Resend failed -> %s: %s", to, exc)
        return {"ok": False, "error": str(exc)}


async def send_lead_emails(lead: dict) -> dict:
    """Fire both emails concurrently. Never raises — failures are logged."""
    notify_to = os.environ.get("NOTIFY_EMAIL", "info@yarenalacapr.com")
    cc_email = os.environ.get("CC_EMAIL", "").strip() or None
    is_collab = lead.get("type") == "collaboration"
    notify_subject = (
        f"New collaboration inquiry — {lead.get('name','')}"
        if is_collab
        else f"New media kit request — {lead.get('name','')}"
    )
    auto_subject = (
        "Your collaboration inquiry has been received — Yaren Alaca PR"
        if is_collab
        else "Your media kit request has been received — Yaren Alaca PR"
    )
    notification = _send(
        to=[notify_to],
        cc=[cc_email] if cc_email else None,
        subject=notify_subject,
        html=notification_template(lead),
    )
    autoresponse = _send(
        to=[lead["email"]],
        subject=auto_subject,
        html=autoresponse_template(lead),
    )
    results = await asyncio.gather(notification, autoresponse, return_exceptions=True)
    return {"notification": results[0], "autoresponse": results[1]}
