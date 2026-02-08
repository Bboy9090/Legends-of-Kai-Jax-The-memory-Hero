# Legends of Kai-Jax: The Memory King

**Status:** PRODUCTION CANON LOCKED  
**Version:** 1.0.0

---

## Quick Start

### For Developers
1. Read **[copilot-instructions.md](./copilot-instructions.md)** — Complete development guidelines
2. Review **[kai_jax.character.json](./kai_jax.character.json)** — Canonical character specification
3. Check **[design_guidelines.json](./design_guidelines.json)** — Visual design rules
4. See **[memory/PRD.md](./memory/PRD.md)** — Master product requirements

### For Contributors
All changes must:
- ✅ Match JSON spec ([kai_jax.character.json](./kai_jax.character.json))
- ✅ Follow PC-first design approach
- ✅ Maintain deterministic behavior
- ✅ Pass validation: `python validate_characters.py`

---

## Canonical References

These files are the **single source of truth**:

| File | Purpose |
|------|---------|
| [kai_jax.character.json](./kai_jax.character.json) | Character specs, stats, rendering layers |
| [copilot-instructions.md](./copilot-instructions.md) | Development guidelines and workflow |
| [design_guidelines.json](./design_guidelines.json) | Visual identity, typography, colors |
| [memory/PRD.md](./memory/PRD.md) | Master product requirements |
| [specs/primary/](./specs/primary/) | Technical specifications |

---

## Validation

Before committing, run:

```bash
# Validate character data
python validate_characters.py

# Validate story schema
python test_schema_validation.py

# Build and check
cd apps/web && npm run build
```

---

## Core Principles

> **"Silhouette first. If the silhouette reads, you win."**

- **Unified Core** — One source of truth, no logic divergence
- **PC-First** — Design for desktop, scale to mobile
- **Deterministic** — Same input → same output, always
- **No Placeholders** — Features are complete or clearly disabled

---

For detailed instructions, see [copilot-instructions.md](./copilot-instructions.md)
