from google.oauth2 import service_account
import os

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

def handle_workspace(payload):
    creds = service_account.Credentials.from_service_account_file(
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
        scopes=SCOPES
    )

    action = payload.get("action")

    if action == "send_email":
        return {"status": "email-dispatched"}

    if action == "schedule_meeting":
        return {"status": "calendar-event-created"}

    if action == "voice_call":
        return {"status": "voice-initiated"}

    return {"error": "Unknown workspace action"}
