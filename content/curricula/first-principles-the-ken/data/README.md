# Data provenance

`episodes.csv` is generated, not hand-maintained. It is the machine-readable form of
[`../EPISODE-MATRIX.md`](../EPISODE-MATRIX.md); both are emitted from one classification table so
they cannot drift apart.

## Columns

| Column | Source |
|---|---|
| `playlist_position` | Position in the YouTube playlist as served (newest first) |
| `curriculum_order` | Position in the recommended sequence (1–79) |
| `module`, `module_name` | Assigned (judgement) |
| `priority` | Assigned (judgement) — S/A/B/C/D |
| `guest`, `organisation`, `part` | Parsed from title + description |
| `canonical_episode` | Season/episode from the podcast RSS feed, joined on guest + part |
| `published`, `minutes`, `video_id`, `url`, `youtube_title` | YouTube metadata (factual) |
| `domains`, `core_mental_model`, `transferable_lesson` | Assigned (judgement) |
| `prerequisites`, `redundancy_overlap` | Assigned (judgement) |
| `in_top_10`, `in_top_25` | Assigned (judgement) |

Factual columns are machine-extracted. Judgement columns are inference from each video's full
title, description and chapter list — see the caveats in [`../README.md`](../README.md).

## How the episode list was retrieved

The playlist page is JavaScript-rendered and the full-metadata endpoint returns a bot check,
so the list was pulled with `yt-dlp` using the `web_embedded` player client. That client
returns metadata but no playable formats, hence `--ignore-no-formats-error`.

```sh
PLAYLIST='https://www.youtube.com/playlist?list=PLGoCQBlsj_-6APZHMFrQjWoD7-eefFPKV'

# 1. Flat playlist -> ordered video ids (80 entries)
yt-dlp --flat-playlist --print "%(playlist_index)s|%(id)s|%(duration)s|%(title)s" "$PLAYLIST"

# 2. Full metadata per video: titles are truncated to 100 chars in flat mode,
#    and descriptions + chapters are not returned at all.
yt-dlp --no-warnings --skip-download --ignore-no-formats-error \
       --extractor-args "youtube:player_client=web_embedded" \
       --print "%(.{id,title,upload_date,duration,view_count,description,chapters})j" \
       -a urls.txt
```

Batch the second command (~40 URLs at a time); long unattended runs were truncated silently.

## Cross-checks performed

1. **Canonical numbering.** Episode descriptions carry a `Episode N, Season M` footer for 33 of
   80 videos. The podcast RSS feed
   (`https://feeds.transistor.fm/first-principles-261f2954-4e6b-4315-973d-17d02efc10f6`,
   discovered via the Transistor share link embedded in the descriptions) supplied
   `itunes:season` / `itunes:episode` for the rest. 58 of 80 videos joined to a feed item on
   guest + part.
2. **Completeness.** The feed carries 70 items, none earlier than mid-2023 — so it does *not*
   cover the full run either. The rosters of the two "Final Supercut" episodes name all 41
   Season 1–2 guests in order, which is what identified the 18 guests missing from both the
   playlist and the feed.
3. **Internal consistency.** 40 guest conversations (29 × 2 parts + 11 × 1 part = 69 videos)
   + 10 supercuts/specials + 1 unavailable video = 80. Matches the playlist count exactly.

Beware of a second, unrelated show: the YouTube playlist "Full Episodes (From First Principles)"
(`PLhbT3uXTCVB19NGgJe-_nB-YZyBS01THU`) is a science podcast, and
`feeds.transistor.fm/first-principles` is *First Principles with Christian Keil*. Neither is
The Ken's show.

## Regenerating

Re-run the two `yt-dlp` commands above to refresh the factual columns. `episodes.csv` is itself
the classification table: a new episode needs one new row, with the judgement columns filled in
by hand and the module/priority reconciled against the rest. `../EPISODE-MATRIX.md` and
`../WATCH-ORDER.md` are both views of this file and should be regenerated from it rather than
edited directly.

Data captured 2026-08-26. The show was still publishing (latest video 2026-08-17), so the
playlist grows.
