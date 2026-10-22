#!/usr/bin/env python3
"""按课程分镜配音、渲染；配音保存在课程中，渲染结果和日志写入 .cache/videos。"""
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
VOICE = "zh_male_kailangxuezhang_uranus_bigtts"
# 豆包语速参数：20 表示在自然语速上再快约 20%。
SPEECH_RATE = 20


def paths(script):
    lesson = script.parent.parent
    work = ROOT / ".cache/videos" / (lesson.parent.name + "-" + lesson.name)
    audio_version = json.loads(script.read_text()).get("audio_version", "配音-开朗学长-v1")
    return work, script.parent / audio_version, work / "成片" / "视频.mp4"


def run_one(script, stage):
    work, audio, movie = paths(script)
    work.mkdir(parents=True, exist_ok=True)
    if stage == "audio":
        cmd = [sys.executable, str(ROOT / "工具/prepare_narration.py"), str(script),
               "--out-dir", str(audio), "--voice-id", VOICE, "--speech-rate", str(SPEECH_RATE),
               "--generate", "--resume"]
    else:
        cmd = [sys.executable, str(ROOT / "工具/render_episode.py"), str(script),
               "--out", str(movie), "--audio-dir", str(audio), "--branding"]
    with (work / (stage + ".log")).open("w") as log:
        result = subprocess.run(cmd, stdout=log, stderr=subprocess.STDOUT)
    print(f"{stage} {work.name}: {'完成' if result.returncode == 0 else '失败，检查日志'}", flush=True)
    return {"script": str(script.relative_to(ROOT)), "stage": stage, "ok": result.returncode == 0}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("stage", choices=["audio", "render"])
    ap.add_argument("scripts", nargs="+", type=Path)
    ap.add_argument("--jobs", type=int, default=2)
    args = ap.parse_args()
    scripts = [p.resolve() for p in args.scripts]
    if len(scripts) != len(set(scripts)) or args.jobs < 1:
        ap.error("任务不能重复，jobs 必须为正数")
    results = []
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        for future in as_completed([pool.submit(run_one, p, args.stage) for p in scripts]):
            results.append(future.result())
    report = ROOT / ".cache/videos" / ("批次-" + args.stage + ".json")
    report.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n")
    if not all(r["ok"] for r in results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
