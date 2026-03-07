"""
FastAPI app entry point.
Re-exports app from server for deployments expecting app.main:app.
"""
import sys
from pathlib import Path

# Ensure backend parent is on path when running from project root
_backend = Path(__file__).resolve().parent.parent
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from server import app

__all__ = ["app"]
