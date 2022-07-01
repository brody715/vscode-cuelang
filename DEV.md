
## Publish Extension

Tag your commit and use github workflow.

```sh
git tag -a v0.1 -m "Release v0.1"
git push --tags
```

## Sync Syntax file

The syntax file is synced from [github.com/shikijs/shiki](https://raw.githubusercontent.com/shikijs/shiki/main/packages/shiki/languages/cue.tmLanguage.json)

Use `yarn run sync-syntax` to synchronize