#!/usr/bin/env python3
"""把 .cache/videos 中已渲染的成片、字幕、时间线、封面发布到课程目录。

渲染器写出的时间线路径相对于缓存目录；发布时改写成课程目录内的
“视频源文件/…”，这样课程页、审片工具和以后重新渲染都指向同一份源文件。
"""
import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path

from batch_videos import paths


def update_storyboard(path: Path, timeline: dict) -> bool:
    """把视频稿表格里的时间列改成当前成片的实际时间。"""
    if not path.exists():
        return False
    rows = {item["id"]: item for item in timeline["scenes"]}
    out, changed = [], False
    for line in path.read_text(encoding="utf-8").splitlines():
        cells = line.split("|")
        if len(cells) >= 4:
            found = re.search(r"·\s*([A-Za-z0-9_-]+)\s*$", cells[1].strip())
            item = rows.get(found.group(1)) if found else None
            if item:
                start = item["start"]
                end = start + item["duration"]
                new = f" {start:.2f}–{end:.2f} 秒 "
                if cells[2] != new:
                    cells[2] = new
                    line = "|".join(cells)
                    changed = True
        out.append(line)
    if changed:
        path.write_text("\n".join(out) + "\n", encoding="utf-8")
    return changed


def publish(script: Path, storyboard: bool) -> dict:
    work, audio, movie = paths(script)
    if not movie.exists():
        raise SystemExit(f"尚未渲染：{movie}")
    lesson = script.parent.parent
    dest = lesson / "视频.mp4"
    for suffix in (".srt", ".vtt"):
        source = movie.with_suffix(suffix)
        if not source.exists():
            raise SystemExit(f"缺少字幕：{source}")
        shutil.copyfile(source, lesson / ("视频" + suffix))
    timeline = json.loads(movie.with_suffix(".timeline.json").read_text(encoding="utf-8"))
    timeline["script"] = "视频源文件/分镜.json"
    timeline["audio_dir"] = "视频源文件/" + audio.name
    timeline["burn_captions"] = False
    (lesson / "视频.timeline.json").write_text(
        json.dumps(timeline, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    shutil.copyfile(movie, dest)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", "1.35", "-i", str(dest),
         "-frames:v", "1", "-q:v", "2", str(lesson / "poster.jpg")],
        check=True)
    changed = update_storyboard(lesson / "视频稿与分镜.md", timeline) if storyboard else False
    return {"script": str(script), "video": str(dest), "storyboard": changed}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("scripts", nargs="+", type=Path)
    ap.add_argument("--storyboard", action="store_true", help="同时更新视频稿表格里的时间列")
    args = ap.parse_args()
    for script in args.scripts:
        result = publish(script.resolve(), args.storyboard)
        print(("更新文稿 " if result["storyboard"] else "发布 ") + result["script"], flush=True)


if __name__ == "__main__":
    main()
