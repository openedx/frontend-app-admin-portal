# Overview

This is a place to record our best practices for using AI-powered
coding tools to develop in this codebase.

## Claude Code

This repository supports Claude code out of the box via a top-level `CLAUDE.md`
file and conventions around where documentation lives.

## Using Ralph Safely

This repository supports semi-autonomous claude loops using a methodology
called "Ralph". This specific command-line tool is supported: 
https://github.com/frankbria/ralph-claude-code/tree/main/docs/user-guide

Ralph is a powerful AI coding assistant. Follow the guidelines below.

### Before You Start
1. **Use a feature branch** - Never run Ralph on `main`
2. **Set safe limits** - Use our team `.ralphrc` (max 20 API calls/hour, 15min timeout)
3. **Check your environment** - No production credentials in `.env`

### Autoscan for leaked keys with gitleaks

1. Install the `gitleaks` tool: https://github.com/gitleaks/gitleaks
2. Add a `.git/hooks/pre-commit` file to run it before commits
```bash
# brew install gitleaks
git diff | gitleaks -v stdin
git diff --staged | gitleaks -v stdin
```

### Running Ralph
```bash
cd your-project/
ralph --monitor  # Uses team defaults from .ralphrc
```

### After Ralph Completes
1. **Review all changes**: `git diff` - don't blindly trust AI output
2. **Test locally**: Ensure tests pass before pushing
3. **Normal PR process**: Ralph code needs same review as human code

### Troubleshooting
- **Runaway API usage?** Ralph stops at 20 calls/hour (configurable)
- **Logs too large?** Circuit breaker halts after 2 loops with no progress
- **Unexpected changes?** Check `.ralph/fix_plan.md` - that's what Ralph follows

### Security Reminders
- ✅ Ralph logs (`.ralph/logs/`) are gitignored
- ✅ Pre-commit hooks scan for secrets
- ✅ All code reviewed before merging
- ❌ Never run Ralph with prod credentials
- ❌ Don't commit `.ralph/logs/` or session files

