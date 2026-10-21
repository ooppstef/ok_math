#!/usr/bin/env python3
"""导出分幕旁白，或复用 nba_biz 的豆包接口生成指定音色的配音。"""
import argparse
import importlib.util
import json
import re
import sys
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_TTS = ROOT.parent / "nba_biz" / "scripts" / "tts.py"
TEACHING_INSTRUCTION = (
    "用自然、温和的普通话给小学生讲数学，像坐在孩子身边讲题。"
    "吐字清楚，语速从容，句子连贯。讲到关键数字和单位时适当重读，"
    "问句有自然的语调，解释步骤之间稍作停顿。不要喊叫，不要播音腔，不刻意模仿儿童。"
)


def load_nba_tts(path):
    spec = importlib.util.spec_from_file_location("math_nba_tts", path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("script", type=Path)
    ap.add_argument("--out-dir", type=Path, required=True)
    ap.add_argument("--voice-id", help="用户指定的豆包 speaker/音色 ID")
    ap.add_argument("--generate", action="store_true", help="实际调用配音接口；不加此参数只导出旁白")
    ap.add_argument("--resume", action="store_true", help="只在音色和全文均未改变时续做中断的配音")
    ap.add_argument("--nba-tts", type=Path, default=DEFAULT_TTS)
    args = ap.parse_args()
    data = json.loads(args.script.read_text(encoding="utf-8"))
    scenes = [{"id": sc["id"], "text": sc["narration"]} for sc in data["scenes"]]
    ids = [sc["id"] for sc in scenes]
    if len(set(ids)) != len(ids) or any(not re.fullmatch(r"[a-zA-Z0-9_-]+", sid) for sid in ids):
        ap.error("分镜 id 必须唯一，且只包含英文字母、数字、短横线或下划线")
    if not scenes or any(not sc["text"].strip() or len(sc["text"]) > 500 for sc in scenes):
        ap.error("每幕需要 1–500 字旁白")
    if args.generate and not args.voice_id:
        ap.error("生成配音必须提供 --voice-id，不会套用 nba_biz 的默认音色")
    # 官方 2.0 音色与 nba_biz 的 S_ 复刻音色使用不同资源；不修改相邻项目。
    resource_id = "seed-tts-2.0" if (args.voice_id or "").endswith("_uranus_bigtts") else "seed-icl-2.0"
    plan = {"voice_id": args.voice_id, "model": "seed-tts-2.0-expressive", "speech_rate": 0,
            "resource_id": resource_id, "instruction": TEACHING_INSTRUCTION, "scenes": scenes}
    existing = any(args.out_dir.glob("*.mp3")) or (args.out_dir / "manifest.json").exists()
    if existing:
        previous = args.out_dir / "plan.json"
        if not args.resume or not previous.exists() or json.loads(previous.read_text()) != plan:
            ap.error("该目录已有不同配音；同稿续做请加 --resume，改稿或换声音请指定新目录")
    args.out_dir.mkdir(parents=True, exist_ok=True)
    for sc in scenes:
        (args.out_dir / f"{sc['id']}.txt").write_text(sc["text"] + "\n", encoding="utf-8")
    (args.out_dir / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已导出 {len(scenes)} 段旁白：{args.out_dir}")
    if not args.generate:
        print("未读取凭证，未调用配音接口。拿到音色 ID 后加 --voice-id 与 --generate。")
        return

    # 每个新音色使用独立目录，避免中途失败后出现新旧音轨混用。
    tts = load_nba_tts(args.nba_tts)
    tts.RESOURCE_ID = resource_id
    env = tts.load_env(args.nba_tts.resolve().parent.parent / ".env")
    key = env.get("voice_key", "").strip()
    if not key:
        ap.error("nba_biz 的 .env 缺少 voice_key")
    for sc in scenes:
        target = args.out_dir / f"{sc['id']}.mp3"
        if args.resume and target.exists():
            tts.inspect_audio(target)
            print(f"复用 {sc['id']}", flush=True)
            continue
        print(f"生成 {sc['id']} …", flush=True)
        audio = tts.request_tts(key, args.voice_id, sc["text"], model=plan["model"],
                                speech_rate=plan["speech_rate"], instruction=TEACHING_INSTRUCTION)
        with tempfile.TemporaryDirectory(prefix=".tts-", dir=args.out_dir) as tmp:
            candidate = Path(tmp) / f"{sc['id']}.mp3"
            candidate.write_bytes(audio)
            tts.inspect_audio(candidate)
            candidate.replace(args.out_dir / candidate.name)
    (args.out_dir / "manifest.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("分幕配音已生成。自然度、数学读音及句间衔接仍需试听。")


if __name__ == "__main__":
    main()
