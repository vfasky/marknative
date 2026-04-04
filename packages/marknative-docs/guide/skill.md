# Claude Code Skill

`marknative-skill` is an [agent skill](https://www.npmjs.com/package/marknative-skill) for Claude Code. Once installed, Claude automatically knows how to use the marknative CLI — you can ask it to render any Markdown file without explaining the flags yourself.

## Install

```bash
npx skills add marknative-skill
```

## What it does

The skill gives Claude context about:

- All CLI flags and their defaults
- Output path rules (file vs. directory mode)
- JSON mode for scripting
- Math, themes, and scale options
- Common usage patterns

## Example prompts

Once the skill is active, you can ask Claude naturally:

```
Render my README.md to a PNG using the dark theme at 3x scale
```

```
Convert notes.md to SVG and pipe to PDF
```

```
Render all .md files in docs/ to a new images/ directory, single page per file
```

Claude will translate these into the correct `marknative` commands automatically.

## npm package

The skill is published separately from the main library so it stays lightweight — it contains only the `SKILL.md` instruction file.

| Package | Purpose |
|---------|---------|
| [`marknative`](https://www.npmjs.com/package/marknative) | CLI + programmatic API |
| [`marknative-skill`](https://www.npmjs.com/package/marknative-skill) | Claude Code skill |
