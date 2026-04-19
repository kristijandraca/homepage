---
title: 1001 Albums Generator
description: 1001 Albums Generator Widget Configuration
---

Learn more about [1001 Albums Generator](https://1001albumsgenerator.com).

Shows the current album from a public project and quick links to configured streaming services.

The `project` value is the project slug from the project URL
(e.g. `https://1001albumsgenerator.com/projects/test` → `project: test`).

```yaml
widget:
  type: 1001albums
  project: test
  history: 5 # optional, number of previous albums to show (defaults to 0)
  links: # optional
    - spotify
    - appleMusic
    - tidal
    - youtubeMusic
    - amazonMusic
    - deezer
    - qobuz
```

When `links` is omitted, `spotify`, `appleMusic`, `tidal`, and `youtubeMusic` are shown when available.
A link is only rendered if the streaming service id is present on the current album.

When `history` is set to a positive integer, that many most-recent previously generated albums are
shown as thumbnails below the current album. Defaults to `0` (hidden).
