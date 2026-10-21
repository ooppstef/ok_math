"""只运行本地短渲染，覆盖失败保护和交付文件完整性，不调用配音。"""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import audit_videos
import render_episode

ROOT = Path(__file__).resolve().parent.parent


class RenderTests(unittest.TestCase):
    def render(self, folder, fail=False):
        scene = {"id": "one", "type": "principle_arithmetic", "model": "multiple",
                 "stage": 1, "title": "测试", "narration": "一份", "duration": .25,
                 "pause_after": 0}
        scenes = [scene]
        if fail:
            scenes.append({**scene, "id": "two", "model": "missing_model"})
        script = folder / "script.json"
        script.write_text(json.dumps({"scenes": scenes}, ensure_ascii=False))
        return subprocess.run([sys.executable, str(ROOT / "工具/render_episode.py"), str(script),
                               "--out", str(folder / "video.mp4"), "--silent", "--burn-captions"],
                              capture_output=True, text=True)

    def test_failed_scene_preserves_existing_delivery(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            originals = {"video" + suffix: ("original " + suffix).encode()
                         for suffix in (".mp4", ".srt", ".vtt", ".timeline.json")}
            for name, content in originals.items():
                (folder / name).write_bytes(content)
            result = self.render(folder, fail=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Unknown arithmetic model", result.stderr)
            for name, content in originals.items():
                self.assertEqual((folder / name).read_bytes(), content, name)
            self.assertFalse(list(folder.glob(".render-*")))

    def test_success_delivers_movie_and_matching_subtitles(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp)
            result = self.render(folder)
            self.assertEqual(result.returncode, 0, result.stderr)
            probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_streams",
                                                       "-of", "json", str(folder / "video.mp4")]))
            self.assertEqual(int(probe["streams"][0]["nb_frames"]), 6)
            self.assertIn("一份", (folder / "video.srt").read_text())
            self.assertTrue((folder / "video.vtt").read_text().startswith("WEBVTT"))
            self.assertEqual(json.loads((folder / "video.timeline.json").read_text())["scenes"][0]["duration"], .25)
            self.assertFalse(list(folder.glob(".render-*")))


class SubtitleTests(unittest.TestCase):
    def test_missing_or_stale_delivery_subtitles_are_rejected(self):
        scenes = [{"id": "one", "narration": "四分之一"}]
        timeline = [{"duration": 10, "speech_duration": 2}]
        with tempfile.TemporaryDirectory() as tmp:
            movie = Path(tmp) / "video.mp4"
            render_episode.write_subtitles(scenes, [10], movie, [{"offset": 0, "speech_duration": 2}])
            audit_videos.check_subtitles(movie, scenes, timeline)
            movie.with_suffix(".vtt").write_text("WEBVTT\n\n上一版字幕")
            with self.assertRaises(AssertionError):
                audit_videos.check_subtitles(movie, scenes, timeline)
            movie.with_suffix(".vtt").unlink()
            with self.assertRaises(FileNotFoundError):
                audit_videos.check_subtitles(movie, scenes, timeline)


if __name__ == "__main__":
    unittest.main()
