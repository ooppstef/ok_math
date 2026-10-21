#!/usr/bin/env python3
"""核对实际成片的音轨、时间线、字幕和关键帧；不代替教学审片。"""
import argparse
from array import array
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

from batch_videos import ROOT, VOICE, paths
import render_episode as r


def check_subtitles(movie, scenes, timeline):
    with tempfile.TemporaryDirectory() as tmp:
        expected = Path(tmp) / "video.mp4"
        r.write_subtitles(scenes, [s["duration"] for s in timeline], expected,
                          [{"offset": 0, "speech_duration": s["speech_duration"]} for s in timeline])
        for suffix in (".srt", ".vtt"):
            assert movie.with_suffix(suffix).read_text() == expected.with_suffix(suffix).read_text(), (movie, suffix)


def inspect(script, contact_sheet=False, published=False):
    data = json.loads(script.read_text())
    work, audio, movie = paths(script)
    if published:
        movie = script.parent.parent / "视频.mp4"
    work.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((audio / "manifest.json").read_text())
    assert manifest["voice_id"] == VOICE and manifest["speech_rate"] == 0
    assert manifest["scenes"] == [{"id": s["id"], "text": s["narration"]} for s in data["scenes"]]
    timeline = json.loads(movie.with_suffix(".timeline.json").read_text())
    assert (movie.parent / timeline["script"]).resolve() == script.resolve()
    assert (movie.parent / timeline["audio_dir"]).resolve() == audio.resolve()
    assert timeline["audio"] == "files" and timeline["voice_id"] == VOICE
    check_subtitles(movie, data["scenes"], timeline["scenes"])
    probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(movie)]))
    v = next(s for s in probe["streams"] if s["codec_type"] == "video")
    a = next(s for s in probe["streams"] if s["codec_type"] == "audio")
    assert (v["width"], v["height"], v["avg_frame_rate"]) == (1280, 720, "24/1")
    assert v["codec_name"] == "h264" and a["codec_name"] == "aac"
    total = sum(s["duration"] for s in timeline["scenes"])
    assert abs(float(probe["format"]["duration"]) - total) < .1
    assert len(timeline["scenes"]) == len(data["scenes"])
    pauses, cursor = 0, 0.0
    for sc, actual in zip(data["scenes"], timeline["scenes"]):
        assert sc["id"] == actual["id"] and sc["narration"] == actual["narration"]
        assert abs(actual["start"] - cursor) < .000002
        cursor += actual["duration"]
        r.caption_layout(sc["narration"])
        assert actual["duration"] - actual["speech_duration"] + .001 >= sc.get("pause_after", .45)
        pauses += sc.get("pause_after", 0) >= 8
    assert pauses >= 1
    decoded = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(movie), "-af", "volumedetect", "-vn",
                              "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True)
    volume = decoded.stderr.decode()
    peak = float(re.search(r"max_volume: ([\d.-]+) dB", volume)[1])
    mean = float(re.search(r"mean_volume: ([\d.-]+) dB", volume)[1])
    assert peak < 0 and mean > -40, (script, peak, mean)
    samples = array("h", decoded.stdout)
    for scene in timeline["scenes"]:
        if scene["pause_after"] >= 8:
            start = int((scene["start"] + scene["speech_duration"] + .05) * 16000)
            end = int((scene["start"] + scene["duration"] - .05) * 16000)
            assert end <= len(samples) and start < end
            assert max(abs(x) for x in samples[start:end]) <= 8, (script, scene["id"], "思考停顿内有声音")
    if contact_sheet:
        import cv2
        from PIL import Image
        capture = cv2.VideoCapture(str(movie))
        # 按每幕实际语长提取，不用分镜估计时长。
        out = Image.new("RGB", (1280, 240 * len(data["scenes"])), "white")
        for i, scene in enumerate(timeline["scenes"]):
            for j, phase in enumerate((.1, .5, .95)):
                capture.set(cv2.CAP_PROP_POS_MSEC, (scene["start"] + scene["speech_duration"] * phase) * 1000)
                ok, frame = capture.read()
                assert ok, (movie, scene["id"])
                frame = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                frame.thumbnail((426, 240))
                out.paste(frame, (426 * j, 240 * i))
        capture.release()
        out.save(work / "实际成片关键帧.jpg", quality=88)
    result = {"script": str(script.relative_to(ROOT)), "video": str(movie.relative_to(ROOT)),
              "duration": round(total, 3), "scenes": len(data["scenes"]), "voice_id": VOICE,
              "speech_rate": 0, "max_volume_db": peak, "mean_volume_db": mean,
              "thinking_pauses": pauses, "sha256": hashlib.sha256(movie.read_bytes()).hexdigest(),
              "checks": "配音清单/时间线音色/原速、1280×720/24fps/H264/AAC、连续分幕、实际SRT/VTT、字幕两行、思考静音≥8秒及实际采样、音量无削波",
              "frame_samples_decoded": contact_sheet}
    (work / "成片技术核验.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print("核验完成", work.name, flush=True)
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("scripts", nargs="+", type=Path)
    ap.add_argument("--contact-sheet", action="store_true")
    ap.add_argument("--published", action="store_true", help="核对课程目录中的成片；默认核对缓存中的新渲染结果")
    args = ap.parse_args()
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda p: inspect(p.resolve(), args.contact_sheet, args.published), args.scripts))
    report = ROOT / ".cache/videos/成片技术核验汇总.json"
    previous = json.loads(report.read_text()) if report.exists() else []
    merged = {item["script"]: item for item in previous + results}
    report.write_text(json.dumps([merged[key] for key in sorted(merged)], ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
