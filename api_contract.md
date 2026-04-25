# Math Explainer API

AI-powered animated math explainer. Submit a concept, get back an MP4.

```
User prompt → Gemini (breakdown) → Gemini (scripts) → Gemini (Manim code)
           → Manim + Google TTS (render per scene) → ffmpeg (merge) → MP4
```

---

## Prerequisites

| Tool | Why |
|---|---|
| Python 3.11+ | Runtime |
| ffmpeg | Video merging |
| Cairo + Pango | Manim rendering |
| LaTeX (texlive-full) | Manim `MathTex` |
| GCP account | Vertex AI (Gemini) |

---

Go sudo: 
sudo su

## 1. GCP Setup

```bash
# Install gcloud CLI if you haven't
# https://cloud.google.com/sdk/docs/install

# login with any email
# project ID is shared in the tg group

gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

Enable APIs in your GCP project:
- **Vertex AI API** — `gcloud services enable aiplatform.googleapis.com`

Then edit `app/config.py`:

# shared in tg group

```python
GCP_PROJECT_ID = "your-actual-project-id"   # ← put your real project ID here
GCP_LOCATION   = "us-central1"              # change region if needed
```

---

## 2. Install & Run

```bash
# Clone / enter project
cd math-explainer

# One-shot setup (creates venv, installs system + python deps)
bash setup.sh

# Activate venv
source venv/bin/activate

# Start server
uvicorn app.main:app --reload --port 8000

if it doeesn't work, use this:
PYTHONPATH=. uvicorn app.main:app --reload
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---


----
# Some issues I ran into. you better do these before you test your first prompt

1. Install sox (system package)
sudo apt install sox

 2. Fix missing pkg_resources (it's in setuptools, missing from your venv)
pip install setuptools

---

setuptools is installed but pkg_resources isn't being found — this is a known Python 3.12 + manim-voiceover compatibility issue. Force reinstall it:

pip install --force-reinstall setuptools

If that still doesn't work, run this full fix:

pip install --force-reinstall setuptools pip
pip install --force-reinstall manim-voiceover[gtts]

Then verify it's actually fixed before starting the server:

python -c "import pkg_resources; print('OK')"

You should see OK. If you do, restart the server and try again.

---

if it doesn't fix yet

setuptools is installed but broken/incomplete. Nuclear fix — directly patch the one line causing the issue:

Find the file
python -c "import manim_voiceover; print(manim_voiceover.__file__)"

That will print something like .../venv/lib/python3.12/site-packages/manim_voiceover/__init__.py

Open that file and delete or comment out line 4 which is import pkg_resources. It's not actually used for anything in the voiceover flow.

Or do it in one command (replace the path with what the above prints)
sed -i 's/^import pkg_resources/# import pkg_resources/' \
  $(python -c "import manim_voiceover; print(manim_voiceover.__file__)")

Then verify:
python -c "from manim_voiceover import VoiceoverScene; print('OK')"

This is safe — pkg_resources isn't actually used anywhere in the voiceover execution path, it's just a stale import in their __init__.py that breaks on Python 3.12.

# This fixes it for me.


----





## 3. API Usage

### Submit a topic

```bash
curl -X POST http://localhost:8000/explain \
  -H "Content-Type: application/json" \
  -d '{"topic": "derivatives in calculus"}'
```

Response:
```json
{
  "job_id": "a3f2b1c0",
  "status": "pending",
  "message": "Job 'a3f2b1c0' started. Poll GET /jobs/a3f2b1c0 for status."
}
```

### Poll status

```bash
curl http://localhost:8000/jobs/a3f2b1c0
```

Status values: `pending` → `breaking_down` → `generating_scripts` →
`generating_code` → `rendering` → `merging` → **`done`** | `failed`

### Download video

```bash
curl -OJ http://localhost:8000/videos/a3f2b1c0
```

### Debug: inspect generated Manim code

```bash
curl http://localhost:8000/jobs/a3f2b1c0/scenes/0/code
```

---

## 4. Project Structure

```
math-explainer/
├── app/
│   ├── config.py               # GCP credentials, model, paths
│   ├── models.py               # Pydantic models (Job, Scene, ...)
│   ├── pipeline.py             # Orchestrator + in-memory job store
│   ├── main.py                 # FastAPI app + all routes
│   ├── agents/
│   │   ├── breakdown_agent.py  # Gemini: topic → scene list
│   │   ├── script_agent.py     # Gemini: scene → narration script
│   │   └── manim_agent.py      # Gemini: scene + script → Manim code
│   └── services/
│       ├── renderer.py         # subprocess: manim → MP4 per scene
│       └── merger.py           # subprocess: ffmpeg concat → final MP4
├── outputs/                    # rendered videos (auto-created)
│   └── <job_id>/
│       ├── scene_00.py
│       ├── scene_01.py
│       ├── media/videos/...    # Manim output
│       ├── concat_list.txt
│       └── final.mp4
├── requirements.txt
├── setup.sh
└── README.md
```

---

## 5. Configuration Reference

| Key | Default | Description |
|---|---|---|
| `GCP_PROJECT_ID` | `your-gcp-project-id` | Your GCP project |
| `GCP_LOCATION` | `us-central1` | Vertex AI region |
| `GEMINI_MODEL` | `gemini-1.5-pro` | Model for all agents |
| `QUALITY_FLAG` | `-ql` | Manim quality (`-ql` low, `-qm` med, `-qh` high) |

---

## 6. Troubleshooting

**Manim render fails with LaTeX error**
→ Make sure `texlive-full` is installed. On Ubuntu: `sudo apt install texlive-full`

**`google.auth.exceptions.DefaultCredentialsError`**
→ Run `gcloud auth application-default login`

**Video not found after render**
→ Check `outputs/<job_id>/` for the raw Manim output and any error logs.
   Inspect the generated code via `GET /jobs/{job_id}/scenes/{n}/code`.

**GTTS rate limit / network error**
→ Google TTS requires internet access during Manim render. Ensure the machine
   running the server has outbound HTTPS access.
# vismath
