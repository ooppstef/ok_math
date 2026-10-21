#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为什么实验室 · 分镜渲染器
把一份 JSON 分镜渲染成 1280x720 的讲解视频（中文配音 + 手绘风动画）。

用法：
  python3 工具/render_episode.py 工具/episodes/L01.json \
      --out 制作/渲染示例/视频.mp4

分镜 JSON 结构见 工具/episodes/L01.json。
"""

import argparse
import importlib
import json
import math
import random
import re
import subprocess
import sys
import tempfile
import wave
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 720
FPS = 24

# ---------- 色板 ----------
BG      = (246, 240, 226)
PAPER   = (255, 252, 244)
INK     = (36, 33, 29)
MUTED   = (122, 115, 104)
LINE    = (216, 205, 184)
RED     = (195, 74, 54)
TEAL    = (46, 111, 106)
GOLD    = (203, 150, 55)
TEAL_BG = (224, 236, 232)
RED_BG  = (244, 224, 218)
GOLD_BG = (247, 236, 209)

M = 84  # 页边距

BODY_PATH = "/System/Library/Fonts/Hiragino Sans GB.ttc"
BOLD_PATH = "/System/Library/Fonts/STHeiti Medium.ttc"


@lru_cache(maxsize=None)
def F(size, bold=False):
    return ImageFont.truetype(BOLD_PATH if bold else BODY_PATH, size, index=0)


# ---------- 基础工具 ----------
def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def appear(t, at, dur=0.6):
    if dur <= 0:
        return 1.0
    return ease_out((t - at) / dur)


def blend(fg, bgc=BG, a=1.0):
    a = clamp(a)
    return tuple(int(fg[i] * a + bgc[i] * (1 - a)) for i in range(3))


def tlen(d, s, f):
    return d.textlength(s, font=f)


PUNCT_HEAD = "，。？！；：、）》”’"


def wrap_text(d, text, f, maxw):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for ch in para:
            if d.textlength(cur + ch, font=f) <= maxw:
                cur += ch
            else:
                if cur:
                    lines.append(cur)
                cur = "" if ch == " " else ch
        lines.append(cur)
    # 行首标点移到上一行
    fixed = []
    for ln in lines:
        if fixed and ln and ln[0] in PUNCT_HEAD:
            fixed[-1] += ln[0]
            ln = ln[1:]
        fixed.append(ln)
    return fixed or [""]


def para(d, x, y, text, f, fill, maxw, lh=None, alpha=1.0):
    lh = lh or int(f.size * 1.5)
    lines = wrap_text(d, text, f, maxw)
    for i, ln in enumerate(lines):
        d.text((x, y + i * lh), ln, font=f, fill=blend(fill, BG, alpha))
    return y + len(lines) * lh


def para_h(d, text, f, maxw):
    return len(wrap_text(d, text, f, maxw)) * int(f.size * 1.5)


def chip(d, box, r, fill, alpha=1.0, outline=None, width=2):
    d.rounded_rectangle(box, radius=r, fill=blend(fill, BG, alpha),
                        outline=blend(outline, BG, alpha) if outline else None,
                        width=width)


# ---------- 纸面背景 ----------
def make_bg():
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=(240, 233, 218), width=1)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=(240, 233, 218), width=1)
    rnd = random.Random(11)
    for _ in range(1600):
        x, y = rnd.randrange(W), rnd.randrange(H)
        c = rnd.choice([(232, 224, 207), (250, 245, 233), (228, 219, 201)])
        d.point((x, y), fill=c)
    # 四角轻微压暗
    return im


BG_IMG = make_bg()


def new_frame():
    im = BG_IMG.copy()
    return im, ImageDraw.Draw(im)


# ---------- 页头页尾 ----------
def header(d, ctx, kicker=None, rule=True):
    kicker = kicker or ctx.get("kicker", "为什么实验室")
    d.text((M, 42), kicker, font=F(21), fill=MUTED)
    # 右上角期号
    num = ctx.get("no", "01")
    box = [W - M - 56, 32, W - M, 88]
    chip(d, box, 10, RED)
    f = F(26, True)
    tw = tlen(d, num, f)
    d.text((box[0] + (56 - tw) / 2, box[1] + 15), num, font=f, fill=PAPER)
    if rule:
        d.line([(M, 104), (W - M, 104)], fill=LINE, width=2)


def footer(d, ctx, t):
    total = max(0.001, ctx["total"])
    p = clamp(t / total)
    d.rectangle([0, H - 7, W, H], fill=(236, 228, 211))
    d.rectangle([0, H - 7, int(W * p), H], fill=RED)
    d.text((M, H - 38), ctx.get("footer", "为什么实验室 · 底层原理课"), font=F(16), fill=MUTED)
    d.text((W - M - 150, H - 38), ctx.get("audience", "给 3–4 年级"), font=F(16), fill=MUTED)


# ---------- 图形零件 ----------
def dot_grid(d, x, y, rows, cols, gap, color, r=7, alpha=1.0):
    for i in range(rows):
        for j in range(cols):
            cx, cy = x + j * gap, y + i * gap
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=blend(color, BG, alpha))


def stick(d, x, y, h=132, w=9, color=TEAL, alpha=1.0, r=4):
    d.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=blend(color, BG, alpha))


def bundle(d, cx, y, n=10, h=132, gap=13, color=TEAL, band=RED, alpha=1.0, scale=1.0):
    """一捆小棒：n 根 + 两道皮筋"""
    w = (n - 1) * gap + 10
    x0 = cx - w / 2
    for i in range(n):
        stick(d, x0 + i * gap, y, h=h, w=10, color=color, alpha=alpha)
    # 皮筋
    d.rounded_rectangle([x0 - 4, y + h * 0.28, x0 + w + 4, y + h * 0.28 + 12],
                        radius=6, fill=blend(band, BG, alpha))
    d.rounded_rectangle([x0 - 4, y + h * 0.62, x0 + w + 4, y + h * 0.62 + 12],
                        radius=6, fill=blend(band, BG, alpha))


def big_bundle(d, cx, cy, size=126, alpha=1.0):
    x0, y0 = cx - size / 2, cy - size / 2
    chip(d, [x0, y0, x0 + size, y0 + size], 8, GOLD_BG, alpha, GOLD, 3)
    for i in range(1, 10):
        p = x0 + size * i / 10
        d.line([(p, y0 + 6), (p, y0 + size - 6)], fill=blend(GOLD, BG, 0.35 * alpha), width=1)
        p = y0 + size * i / 10
        d.line([(x0 + 6, p), (x0 + size - 6, p)], fill=blend(GOLD, BG, 0.35 * alpha), width=1)
    d.rounded_rectangle([x0 - 8, cy - 8, x0 + size + 8, cy + 8], radius=6, fill=blend(RED, BG, alpha))


def card(d, box, fill=PAPER, outline=LINE, r=14, alpha=1.0, width=2):
    shadow = [box[0] + 4, box[1] + 6, box[2] + 4, box[3] + 6]
    d.rounded_rectangle(shadow, radius=r, fill=blend((226, 216, 197), BG, 0.55 * alpha))
    d.rounded_rectangle(box, radius=r, fill=blend(fill, BG, alpha),
                        outline=blend(outline, BG, alpha), width=width)


def arrow_h(d, x1, x2, y, color=GOLD, alpha=1.0, width=3):
    d.line([(x1, y), (x2, y)], fill=blend(color, BG, alpha), width=width)
    s = 9
    d.polygon([(x2, y), (x2 - s, y - s * 0.6), (x2 - s, y + s * 0.6)], fill=blend(color, BG, alpha))


def arrow_v(d, x, y1, y2, color=GOLD, alpha=1.0, width=3):
    d.line([(x, y1), (x, y2)], fill=blend(color, BG, alpha), width=width)
    s = 9
    d.polygon([(x, y2), (x - s * 0.6, y2 - s), (x + s * 0.6, y2 - s)], fill=blend(color, BG, alpha))


# ---------- 场景 ----------
def s_title(im, d, t, sc, ctx):
    a = appear(t, 0, 1.0)
    d.text((M, 108), sc.get("kicker", "为什么实验室"), font=F(24), fill=blend(MUTED, BG, a))

    title = sc["title"]
    size = 104
    f = F(size, True)
    while tlen(d, title, f) > W - 2 * M - 40 and size > 52:
        size -= 4
        f = F(size, True)
    y = 196 + int(22 * (1 - appear(t, 0.15, 0.9)))
    d.text((M, y), title, font=f, fill=blend(INK, BG, a))

    tw = tlen(d, title, f)
    uw = tw * appear(t, 0.85, 0.9)
    d.rounded_rectangle([M, y + size + 24, M + uw, y + size + 36], 6, fill=blend(RED, BG, a))

    sub = sc.get("subtitle", "")
    if sub:
        para(d, M, y + size + 72, sub, F(37), MUTED, W - 2 * M - 260, 54, appear(t, 0.65, 1.0))

    # 右侧装饰：一捆小棒
    if sc.get("motif", "bundle") == "bundle":
        aa = 0.9 * appear(t, 1.1, 1.2)
        bundle(d, W - M - 90, 250, n=10, h=150, gap=12, color=TEAL, alpha=aa)
        d.text((W - M - 145, 430), "10 → 1", font=F(26, True), fill=blend(RED, BG, aa))

    # 底部一行小字
    d.text((M, H - 92), sc.get("foot", "知其然，更知其所以然。"), font=F(22), fill=blend(MUTED, BG, 0.8 * a))


def s_bullets(im, d, t, sc, ctx):
    header(d, ctx)
    d.text((M, 134), sc["heading"], font=F(50, True), fill=INK)

    items = sc["items"]
    f = F(31)
    y = 238
    ats = sc.get("at") or [0.7 + i * 2.0 for i in range(len(items))]
    for i, item in enumerate(items):
        a = appear(t, ats[i], 0.7)
        if a <= 0.01:
            y += 94
            continue
        cy = y + 26
        d.ellipse([M - 2, cy - 23, M + 44, cy + 23], fill=blend(TEAL, BG, a))
        nf = F(23, True)
        nw = tlen(d, str(i + 1), nf)
        d.text((M + 21 - nw / 2, cy - 15), str(i + 1), font=nf, fill=blend(PAPER, BG, a))
        lines = wrap_text(d, item, f, W - 2 * M - 110)
        for k, ln in enumerate(lines):
            d.text((M + 78, y + k * 45), ln, font=f, fill=blend(INK, BG, a))
        y += max(78, len(lines) * 45 + 34)

    if sc.get("caption"):
        ca = appear(t, sc.get("cap_at", 1.0), 0.6)
        d.text((M, 628), sc["caption"], font=F(24), fill=blend(MUTED, BG, ca))


def s_sticks(im, d, t, sc, ctx):
    header(d, ctx)
    d.text((M, 124), sc.get("heading", "把小棒打成一捆一捆"), font=F(44, True), fill=INK)

    hundreds = sc.get("hundreds", 0)
    tens = sc.get("tens", 0)
    ones = sc.get("ones", 0)
    merge = sc.get("merge", False)
    zones_on = sc.get("zones", True)

    # 标题下方的说明
    if sc.get("caption"):
        ca = appear(t, sc.get("cap_at", 0.6), 0.6)
        f = F(30, True)
        cw = tlen(d, sc["caption"], f)
        d.text(((W - cw) / 2, 186), sc["caption"], font=f,
               fill=blend(RED if sc.get("cap_red", True) else INK, BG, ca))

    if zones_on:
        zones = [
            ("百位", "100", 250, hundreds > 0),
            ("十位", "10", 640, tens > 0),
            ("个位", "1", 1030, ones > 0),
        ]
        for label, val, cx, active in zones:
            if active:
                chip(d, [cx - 160, 230, cx + 160, 556], 18, PAPER, 0.55, LINE, 2)
            d.text((cx - 34, 574), label, font=F(25, True),
                   fill=INK if active else blend(MUTED, BG, 0.5))
            vf = F(22)
            vw = tlen(d, "× " + val, vf)
            d.text((cx - vw / 2, 610), "× " + val, font=vf,
                   fill=(RED if active else blend(MUTED, BG, 0.4)))

        if hundreds:
            big_bundle(d, 250, 380, 130, appear(t, 0.8, 0.7))

        for k in range(tens):
            a = appear(t, sc.get("tens_at", 0.8) + k * sc.get("bundle_step", 1.0), 0.5)
            if a <= 0:
                continue
            offset = (k - (tens - 1) / 2) * 110
            bundle(d, 640 + offset, 320, n=10, h=130, gap=9, alpha=a)

        for k in range(min(ones, 9)):
            a = appear(t, sc.get("ones_at", 0.8) + k * sc.get("ones_step", 0.5), 0.3)
            if a <= 0:
                continue
            x = 1030 - (min(ones, 9) - 1) * 11 + k * 22
            stick(d, x, 330, h=128, w=11, alpha=a)
        return

    # 没有数位格：集中展示“十根变一捆”
    chip(d, [M, 230, W - M, 556], 20, PAPER, 0.45, LINE, 2)

    if merge:
        gap, y, h = 40, 268, 238
        ma = appear(t, sc.get("merge_at", 6.0), 0.9)
        ba = appear(t, sc.get("band_at", 4.5), 0.5) * (1 - ma)
        for k in range(10):
            a = appear(t, sc.get("ones_at", 0.2) + k * sc.get("ones_step", 0.25), 0.25) * (1 - ma)
            if a > 0:
                stick(d, 640 - 4.5 * gap + k * gap, y, h=h, w=14, alpha=a)
        if ba > 0:
            d.rounded_rectangle([640 - 5 * gap - 6, y + 70, 640 + 5 * gap - 6, y + 84],
                                6, fill=blend(RED, BG, ba))
            d.rounded_rectangle([640 - 5 * gap - 6, y + 155, 640 + 5 * gap - 6, y + 169],
                                6, fill=blend(RED, BG, ba))
        if ma > 0:
            bundle(d, 640, 268, n=10, h=238, gap=15, alpha=ma)
            if t > sc.get("label_at", 7.0):
                lbl = "= 1 捆"
                lw = tlen(d, lbl, F(34, True))
                d.text((640 - lw / 2, 528), lbl, font=F(34, True), fill=blend(RED, BG, appear(t, sc.get("label_at", 7.0), 0.5)))
    else:
        gap, y, h = 44, 268, 238
        n = min(ones, 9)
        for k in range(n):
            a = appear(t, sc.get("ones_at", 0.25) + k * sc.get("ones_step", 0.55), 0.3)
            if a <= 0:
                continue
            x = 640 - (n - 1) * gap / 2 + k * gap
            stick(d, x, y, h=h, w=14, alpha=a)


def s_place_value(im, d, t, sc, ctx):
    header(d, ctx)
    d.text((M, 124), sc.get("heading", "同一个数字，站在不同位置"), font=F(44, True), fill=INK)

    digits = sc["digits"]
    labels = sc["labels"]
    values = sc["values"]
    n = len(digits)
    cw, gap = 196, 34
    total = n * cw + (n - 1) * gap
    x0 = (W - total) / 2
    y0 = 236

    for i, ch in enumerate(digits):
        a = appear(t, sc.get("card_at", 0.35) + i * sc.get("card_step", 0.42), 0.55)
        if a <= 0:
            continue
        x = x0 + i * (cw + gap)
        yy = y0 + int(26 * (1 - a))
        is_zero = ch == "0"
        card(d, [x, yy, x + cw, yy + 236], PAPER, RED if is_zero else LINE, 16, a)
        df = F(118, True)
        dw = tlen(d, ch, df)
        d.text((x + (cw - dw) / 2, yy + 42), ch, font=df,
               fill=blend(RED if is_zero else INK, BG, a))

        lf = F(24, True)
        lw = tlen(d, labels[i], lf)
        d.text((x + (cw - lw) / 2, yy + 250), labels[i], font=lf, fill=blend(MUTED, BG, a))
        vf = F(31, True)
        vw = tlen(d, values[i], vf)
        d.text((x + (cw - vw) / 2, yy + 286), values[i], font=vf,
               fill=blend(RED if is_zero else TEAL, BG, a))

        if is_zero:
            na = appear(t, 2.4, 0.6)
            d.text((x + cw / 2 - 34, yy - 44), "占位", font=F(23, True), fill=blend(RED, BG, na))
            arrow_v(d, x + cw / 2, yy - 12, yy + 20, RED, na)

    if sc.get("note"):
        na = appear(t, sc.get("note_at", 2.0), 0.7)
        f = F(33, True)
        nw = tlen(d, sc["note"], f)
        d.text(((W - nw) / 2, 604), sc["note"], font=f, fill=blend(TEAL, BG, na))


def s_column_add(im, d, t, sc, ctx):
    header(d, ctx)
    d.text((M, 124), sc.get("heading", "竖式，对齐的到底是什么？"), font=F(44, True), fill=INK)

    a, b = str(sc["a"]), str(sc["b"])
    res = str(sc.get("result", int(sc["a"]) + int(sc["b"])))
    n = max(len(a), len(b), len(res))
    cw = 112
    total = n * cw
    x0 = (W - total) / 2 + 30
    top = 226

    names = ["个位", "十位", "百位", "千位"][:n][::-1]
    for i, nm in enumerate(names):
        f = F(21)
        w = tlen(d, nm, f)
        d.text((x0 + i * cw + (cw - w) / 2, 186), nm, font=f, fill=MUTED)

    def col_x(j):
        return x0 + j * cw

    highlight = sc.get("highlight", [])
    # 高亮列（从右数）
    for idx, col in enumerate(highlight):
        hat = sc.get("highlight_at") or [1.1 + i * 7.0 for i in range(len(highlight))]
        ca = appear(t, hat[idx], 0.6)
        if idx + 1 < len(highlight):
            ca *= 1 - appear(t, hat[idx + 1], 0.6)
        if ca > 0:
            j = n - 1 - col
            d.rounded_rectangle([col_x(j) + 6, 218, col_x(j) + cw - 6, 500], 12,
                                fill=blend(TEAL_BG, BG, 0.85 * ca))

    # 数字
    def put(numstr, yy, color, alpha=1.0):
        s = numstr.rjust(n)
        for j, ch in enumerate(s):
            if ch == " ":
                continue
            f = F(74, True)
            w = tlen(d, ch, f)
            d.text((col_x(j) + (cw - w) / 2, yy), ch, font=f, fill=blend(color, BG, alpha))

    put(a, top, INK)
    put(b, top + 92, INK)
    d.text((x0 - 58, top + 52), "+", font=F(58, True), fill=RED)
    d.line([(x0 + 8, top + 186), (x0 + total - 8, top + 186)], fill=INK, width=4)

    # 结果逐列出现
    rs = res.rjust(n)
    for j, ch in enumerate(rs):
        aa = appear(t, sc.get("result_at", 14.8) + j * 0.22, 0.5)
        if aa <= 0 or ch == " ":
            continue
        f = F(80, True)
        w = tlen(d, ch, f)
        d.text((col_x(j) + (cw - w) / 2, top + 214), ch, font=f, fill=blend(RED, BG, aa))

    # 注解
    notes = sc.get("notes", [])
    for i, note in enumerate(notes):
        nat = sc.get("notes_at") or [1.4 + i * 7.0 for i in range(len(notes))]
        na = appear(t, nat[i], 0.7)
        if na <= 0:
            continue
        f = F(30, True)
        nw = tlen(d, note, f)
        d.text(((W - nw) / 2, 584 + i * 46), note, font=f, fill=blend(TEAL, BG, na))


def s_number_roll(im, d, t, sc, ctx):
    header(d, ctx)
    d.text((M, 124), sc.get("heading", "999 加 1，会发生什么？"), font=F(44, True), fill=INK)

    start, end = str(sc.get("from", 999)), str(sc.get("to", 1000))
    n = max(len(start), len(end))
    start, end = start.rjust(n), end.rjust(n, "0")
    cw, gap = 150, 22
    total = n * cw + (n - 1) * gap
    x0 = (W - total) / 2
    y0 = 274
    names = ["千位", "百位", "十位", "个位"][-n:]

    for i in range(n):
        x = x0 + i * (cw + gap)
        card(d, [x, y0, x + cw, y0 + 190], PAPER, LINE, 14, 1)
        f = F(21)
        w = tlen(d, names[i], f)
        d.text((x + (cw - w) / 2, y0 - 34), names[i], font=f, fill=MUTED)

    # 进位时间点：个位先动，再十位、百位、千位
    digits_old = list(start)
    digits_new = list(end)

    for i in range(n):
        x = x0 + i * (cw + gap)
        rev = n - 1 - i  # 0=个位
        at = sc.get("carry_at", 2.4) + rev * sc.get("carry_step", 3.6)

        p = clamp((t - at) / 0.65)
        old, new = digits_old[i], digits_new[i]
        if old == new:
            p = 0
        f = F(96, True)

        # 滚动：旧数字上移，新数字从下进
        if p <= 0:
            w = tlen(d, old, f)
            col = MUTED if (i == 0 and old == "0") else INK
            d.text((x + (cw - w) / 2, y0 + 36), old, font=f, fill=col)
        elif p < 1:
            off = int(120 * ease_in_out(p))
            w = tlen(d, old, f)
            d.text((x + (cw - w) / 2, y0 + 36 - off), old, font=f, fill=blend(INK, BG, 1 - p))
            w2 = tlen(d, new, f)
            d.text((x + (cw - w2) / 2, y0 + 36 + 120 - off), new, font=f, fill=blend(RED, BG, p))
            # 进位闪光
            d.rounded_rectangle([x - 2, y0 - 2, x + cw + 2, y0 + 192], 16,
                                outline=blend(RED, BG, 0.8 * math.sin(math.pi * p)), width=4)
        else:
            w = tlen(d, new, f)
            d.text((x + (cw - w) / 2, y0 + 36), new, font=f, fill=RED)

    # 进位箭头
    for rev in range(n - 1):
        at = sc.get("carry_at", 2.4) + rev * sc.get("carry_step", 3.6)
        aa = appear(t, at + 0.2, 0.4) * (1 - appear(t, at + 1.1, 0.6))
        if aa > 0:
            i = n - 1 - rev
            x = x0 + i * (cw + gap)
            d.text((x - 66, y0 + 60), "进1", font=F(24, True), fill=blend(RED, BG, aa))

    ca = appear(t, sc.get("cap_at", 17.4), 0.8)
    if ca > 0:
        txt = sc.get("caption", "满十进一，一位一位地往前传")
        f = F(32, True)
        w = tlen(d, txt, f)
        d.text(((W - w) / 2, 600), txt, font=f, fill=blend(TEAL, BG, ca))


def s_grid(im, d, t, sc, ctx):
    header(d, ctx)
    d.text((M, 124), sc.get("heading", "乘法，是一个阵列"), font=F(44, True), fill=INK)

    rows, cols = sc["rows"], sc["cols"]
    kind = sc.get("kind", "dots")
    area_w, area_h = 700, 340
    cs = min(area_w / cols, area_h / rows, 85)
    gw, gh = cols * cs, rows * cs
    ox, oy = (W - gw) / 2 - 60, 232 + (area_h - gh) / 2

    rotate = sc.get("rotate", False)
    ang = 0.0
    if rotate:
        ang = 90 * ease_in_out((t - 3.2) / 1.4)

    layer = Image.new("RGBA", (700, 520), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)

    for i in range(rows):
        for j in range(cols):
            at = 0.35 + (i * cols + j) * 0.055
            a = appear(t, at, 0.35)
            if a <= 0:
                continue
            cx = 350 - gw / 2 + j * cs + cs / 2
            cy = 260 - gh / 2 + i * cs + cs / 2
            if kind == "dots":
                r = cs * 0.135
                ld.ellipse([cx - r, cy - r, cx + r, cy + r], fill=TEAL + (int(255 * a),))
            else:
                s = cs * 0.42
                ld.rounded_rectangle([cx - s, cy - s, cx + s, cy + s], radius=6,
                                     fill=GOLD_BG + (int(235 * a),),
                                     outline=GOLD + (int(255 * a),), width=3)

    if ang:
        layer = layer.rotate(-ang, resample=Image.BICUBIC, center=(350, 260))
    bbox = layer.getbbox()
    if bbox:
        layer = layer.crop(bbox)
        scale = min(1.0, 470 / layer.width, 342 / layer.height)
        if scale < 1.0:
            layer = layer.resize((max(1, int(layer.width * scale)), max(1, int(layer.height * scale))),
                                 Image.LANCZOS)
        im.paste(layer, (int(580 - layer.width / 2), int(402 - layer.height / 2)), layer)

    # 标注
    la = appear(t, 0.8, 0.6) * (1 - appear(t, 3.0, 0.6) if rotate else 1)
    if la > 0:
        f = F(26)
        txt = f"每行 {cols} 个"
        w = tlen(d, txt, f)
        d.text((ox + gw / 2 - w / 2, oy - 44), txt, font=f, fill=blend(MUTED, BG, la))
        arrow_h(d, ox + 10, ox + gw - 10, oy - 16, GOLD, la)
        d.text((ox - 92, oy + gh / 2 - 16), f"{rows} 行", font=f, fill=blend(MUTED, BG, la))

    if rotate:
        la2 = appear(t, 4.3, 0.7)
        f = F(26)
        txt = f"每行 {rows} 个"
        w = tlen(d, txt, f)
        d.text((ox + gw / 2 - w / 2, oy - 44), txt, font=f, fill=blend(MUTED, BG, la2))
        arrow_h(d, ox + 10, ox + gw - 10, oy - 16, GOLD, la2)
        d.text((ox - 92, oy + gh / 2 - 16), f"{cols} 行", font=f, fill=blend(MUTED, BG, la2))

    # 底部等式
    eq = sc.get("equation")
    if eq:
        ea = appear(t, sc.get("eq_at", 2.2), 0.7)
        f = F(52, True)
        w = tlen(d, eq, f)
        d.text(((W - w) / 2, 584), eq, font=f, fill=blend(RED, BG, ea))

    if sc.get("caption"):
        ca = appear(t, sc.get("cap_at", 3.4), 0.6)
        f = F(24)
        w = tlen(d, sc["caption"], f)
        d.text(((W - w) / 2, 648), sc["caption"], font=f, fill=blend(MUTED, BG, ca))


def s_challenge(im, d, t, sc, ctx):
    header(d, ctx, "动手挑战")
    d.text((M, 126), sc.get("kicker", "轮到你啦"), font=F(46, True), fill=RED)

    card(d, [M, 196, W - M, 566], PAPER, LINE, 20, 1)
    q = sc["question"]
    f = F(40, True)
    lines = wrap_text(d, q, f, W - 2 * M - 120)
    total_h = len(lines) * 62
    y = 250 + (230 - total_h) / 2
    for k, ln in enumerate(lines):
        a = appear(t, sc.get("line_at", 0.3) + k * sc.get("line_step", 0.35), 0.6)
        w = tlen(d, ln, f)
        d.text(((W - w) / 2, y + k * 62), ln, font=f, fill=blend(INK, BG, a))

    if sc.get("hint"):
        ha = appear(t, sc.get("hint_at", 1.6), 0.6)
        f2 = F(25)
        hw = tlen(d, sc["hint"], f2)
        d.text(((W - hw) / 2, 508), sc["hint"], font=f2, fill=blend(TEAL, BG, ha))

    if sc.get("digits"):
        da = appear(t, sc.get("digits_at", 2.0), 0.6)
        n = len(sc["digits"])
        cw, gap = 70, 18
        total = n * cw + (n - 1) * gap
        x0 = (W - total) / 2
        for i, ch in enumerate(sc["digits"]):
            x = x0 + i * (cw + gap)
            chip(d, [x, 580, x + cw, 640], 10, RED_BG, da, RED, 2)
            f3 = F(34, True)
            w = tlen(d, ch, f3)
            d.text((x + (cw - w) / 2, 590), ch, font=f3, fill=blend(RED, BG, da))


def s_outro(im, d, t, sc, ctx):
    a = appear(t, 0.2, 1.0)
    txt = sc["text"]
    f = F(58, True)
    lines = wrap_text(d, txt, f, W - 2 * M - 40)
    total_h = len(lines) * 84
    y = (H - total_h) / 2 - 30
    for k, ln in enumerate(lines):
        aa = appear(t, 0.3 + k * 0.5, 0.7)
        w = tlen(d, ln, f)
        d.text(((W - w) / 2, y + k * 84), ln, font=f, fill=blend(INK, BG, aa))

    uw = 220 * appear(t, 1.2, 0.9)
    d.rounded_rectangle([(W - uw) / 2, y + total_h + 26, (W + uw) / 2, y + total_h + 38],
                        6, fill=blend(RED, BG, a))
    sa = appear(t, 1.6, 0.8)
    s = sc.get("sub", "把今天的问题，讲给一个人听。")
    f2 = F(26)
    w = tlen(d, s, f2)
    d.text(((W - w) / 2, y + total_h + 78), s, font=f2, fill=blend(MUTED, BG, sa))

    # 结束标记
    ea = appear(t, 2.0, 0.8)
    d.text((W - M - 110, H - 92), "· 完 ·", font=F(22), fill=blend(MUTED, BG, ea))


def s_regroup_add(im, d, t, sc, ctx):
    """38 + 47：同一批计数片从 7 个十、15 个一换成 8 个十、5 个一。"""
    header(d, ctx)
    d.text((M, 122), "38＋47，为什么要进位？", font=F(43, True), fill=INK)
    stage = sc["stage"]
    # 动作随本幕实际配音时长伸缩，停留画面不改变配音语速。
    p = clamp(t / max(ctx.get("scene_duration", sc["duration"]), 0.1))
    merge = ease_in_out((p - 0.12) / 0.55) if stage == "exchange" else 0.0
    exchanged = stage in ("write", "carry", "tens", "answer")
    if exchanged:
        merge = 1.0
    card(d, [M, 205, 710, 553], PAPER, LINE)
    card(d, [744, 205, W - M, 553], PAPER, LINE)
    d.text((218, 217), "十", font=F(28, True), fill=TEAL)
    d.text((513, 217), "一", font=F(28, True), fill=RED)
    d.line([(418, 219), (418, 536)], fill=LINE, width=2)

    def token(cx, cy, value, alpha=1.0, highlighted=False):
        color, fill = (TEAL, TEAL_BG) if value == 10 else (RED, RED_BG)
        if value == 10:
            box = [cx - 29, cy - 21, cx + 29, cy + 21]
            d.rounded_rectangle(box, 7, fill=blend(fill, PAPER, alpha),
                                outline=blend(color, PAPER, alpha), width=3 if highlighted else 2)
        else:
            box = [cx - 20, cy - 20, cx + 20, cy + 20]
            d.ellipse(box, fill=blend(fill, PAPER, alpha), outline=blend(color, PAPER, alpha), width=2)
        label = str(value)
        f = F(23, True)
        d.text((cx - tlen(d, label, f) / 2, cy - 15), label, font=f, fill=blend(color, PAPER, alpha))

    # 两个加数先分行；随后各自聚拢，整段保持总量 85 不变。
    for k in range(7):
        if stage == "setup":
            x, y = (152 + k * 72, 294) if k < 3 else (152 + (k - 3) * 72, 415)
        else:
            x, y = 152 + (k % 4) * 72, 294 + (k // 4) * 66
        token(x, y, 10)
    for k in range(15):
        if stage == "setup":
            j = k if k < 8 else k - 8
            x, y = 457 + (j % 5) * 48, (280 if k < 8 else 408) + (j // 5) * 49
        else:
            x, y = 457 + (k % 5) * 48, 294 + (k // 5) * 66
        token(x, y, 1, 1 - merge if k < 10 else 1)
    if stage == "setup":
        for y, label in [(335, "3 个十＋8 个一"), (479, "4 个十＋7 个一")]:
            d.text((149, y), label, font=F(22), fill=MUTED)
    if stage == "pack":
        d.rounded_rectangle([430, 265, 677, 389], 15, outline=GOLD, width=4)
        d.text((441, 485), "圈出 10 个一", font=F(25, True), fill=RED)
    if merge > 0:
        x = 553 + (368 - 553) * merge
        y = 326 + (360 - 326) * merge
        token(x, y, 10, merge, highlighted=True)
    if stage != "setup":
        left = "8 个十" if merge >= 1 else "7 个十"
        right = "5 个一" if merge >= 1 else "15 个一"
        if 0 < merge < 1:
            # 换单位的中间状态只保留等式，不把整列误标成 10 个一。
            left, right = "", ""
        d.text((187, 479), left, font=F(26, True), fill=TEAL)
        if stage != "pack":
            d.text((485, 479), right, font=F(26, True), fill=RED)

    # 竖式一直留在原处，让计数片的换单位与进位记号对应。
    x10, x1 = 925, 1062
    for x, label, color in [(x10, "十位", TEAL), (x1, "个位", RED)]:
        d.text((x - 27, 217), label, font=F(22), fill=color)
    if stage in ("ones", "pack", "write"):
        chip(d, [x1 - 46, 267, x1 + 46, 512], 11, RED_BG)
    if stage in ("carry", "tens"):
        chip(d, [x10 - 46, 250, x10 + 46, 512], 11, TEAL_BG)
    for y, numbers in [(276, "38"), (365, "47")]:
        for x, digit in zip((x10, x1), numbers):
            d.text((x - tlen(d, digit, F(66, True)) / 2, y), digit, font=F(66, True), fill=INK)
    d.text((801, 361), "+", font=F(60, True), fill=MUTED)
    d.line([(793, 443), (1138, 443)], fill=INK, width=3)
    if stage in ("write", "carry", "tens", "answer"):
        a = appear(t, 0.2, 0.5) if stage == "write" else 1
        d.text((x1 - 21, 456), "5", font=F(66, True), fill=blend(RED, PAPER, a))
    if stage in ("carry", "tens", "answer"):
        a = appear(t, 0.3, 0.7) if stage == "carry" else 1
        d.text((x10 - 9, 250), "1", font=F(24, True), fill=blend(TEAL, PAPER, a))
    if stage in ("tens", "answer"):
        a = appear(t, sc.get("result_fraction", 0.6) * ctx.get("scene_duration", sc["duration"]), 0.5) if stage == "tens" else 1
        d.text((x10 - 21, 456), "8", font=F(66, True), fill=blend(TEAL, PAPER, a))
    if sc.get("equation"):
        f = F(28, True)
        label = sc["equation"]
        d.text(((W - tlen(d, label, f)) / 2, 563), label, font=f, fill=INK)


def draw_caption(d, text):
    """字幕单独合成；新场景在 605–664 留出字幕区。"""
    for x, y, line in caption_layout(text):
        d.text((x, y), line, font=F(26), fill=INK)


@lru_cache(maxsize=512)
def caption_layout(text):
    d = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    f = F(26)
    lines = wrap_text(d, text, f, W - 2 * M)
    if len(lines) > 2:
        raise ValueError("一幕字幕超过两行，请按完整语句拆幕")
    return tuple(((W - tlen(d, line, f)) / 2, 606 + i * 34, line) for i, line in enumerate(lines))


def s_principle(im, d, t, sc, ctx):
    module = importlib.import_module("scenes." + sc["type"].removeprefix("principle_"))
    module.render(im, d, t, sc, ctx, sys.modules[__name__])


SCENES = {
    "principle_arithmetic": s_principle,
    "principle_geometry": s_principle,
    "principle_relations": s_principle,
    "principle_foundation": s_principle,
    "title": s_title,
    "bullets": s_bullets,
    "sticks": s_sticks,
    "place_value": s_place_value,
    "column_add": s_column_add,
    "number_roll": s_number_roll,
    "grid": s_grid,
    "challenge": s_challenge,
    "outro": s_outro,
    "regroup_add": s_regroup_add,
}


# ---------- 配音 ----------
def make_tts(text, out_wav: Path, voice="Tingting", rate=165):
    aiff = out_wav.with_suffix(".aiff")
    subprocess.run(["say", "-v", voice, "-r", str(rate), "-o", str(aiff), text], check=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(aiff), "-ar", "44100", "-ac", "1",
         "-c:a", "pcm_s16le", str(out_wav)],
        check=True,
    )
    aiff.unlink(missing_ok=True)


def wav_duration(path):
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / w.getframerate()


def silence(seconds, rate=44100):
    return b"\x00\x00" * int(seconds * rate)


def build_audio(scenes, out_path: Path, voice, rate, tmpdir: Path, fps: int):
    rate_hz = 44100
    lead, tail = 0.32, 0.55
    durations = []
    chunks = []
    for i, sc in enumerate(scenes):
        text = (sc.get("narration") or "").strip()
        if text:
            wav = tmpdir / f"scene_{i:02d}.wav"
            make_tts(text, wav, voice, rate)
            with wave.open(str(wav), "rb") as wf:
                dur = wf.getnframes() / wf.getframerate()
                raw = wf.readframes(wf.getnframes())
        else:
            raw, dur = b"", 0.0
        d = lead + dur + tail
        # 对齐到整帧
        frames = max(1, round(d * fps))
        d = frames / fps
        pad = d - (lead + dur)
        chunks.append(silence(lead, rate_hz) + raw + silence(pad, rate_hz))
        durations.append(d)
    data = b"".join(chunks)
    with wave.open(str(out_path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate_hz)
        w.writeframes(data)
    return durations


# ---------- 字幕 ----------
def fmt_ts(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def split_sentences(text):
    parts = re.split(r"(?<=[。！？；])", text)
    parts = [p.strip() for p in parts if p.strip()]
    return parts or [text]


def write_srt(scenes, durations, path: Path, timing=None):
    lines = []
    idx = 1
    start = 0.0
    for scene_index, (sc, d) in enumerate(zip(scenes, durations)):
        text = (sc.get("narration") or "").strip()
        if not text:
            start += d
            continue
        if timing is not None:
            cue = timing[scene_index]
            lines.append(f"{idx}\n{fmt_ts(start + cue['offset'])} --> "
                         f"{fmt_ts(start + cue['offset'] + cue['speech_duration'])}\n{text}\n")
            idx += 1
            start += d
            continue
        sents = split_sentences(text)
        total_chars = sum(len(s) for s in sents) or 1
        audio_start = start + 0.32
        audio_len = max(0.2, d - 0.32 - 0.55)
        cursor = audio_start
        for s in sents:
            span = audio_len * len(s) / total_chars
            lines.append(f"{idx}\n{fmt_ts(cursor)} --> {fmt_ts(cursor + span)}\n{s}\n")
            idx += 1
            cursor += span
        start += d
    path.write_text("\n".join(lines), encoding="utf-8")


def write_subtitles(scenes, durations, path: Path, timing=None):
    write_srt(scenes, durations, path.with_suffix(".srt"), timing)
    subtitles = path.with_suffix(".srt").read_text(encoding="utf-8")
    path.with_suffix(".vtt").write_text(
        "WEBVTT\n\n" + re.sub(r"(\d{2}:\d{2}:\d{2}),(\d{3})", r"\1.\2", subtitles), encoding="utf-8")


def prepare_external_audio(scenes, audio_dir, out_path, tmpdir, fps):
    """每幕匹配一段原速配音；拒绝把旧稿音频套在新画面上。"""
    manifest = json.loads((audio_dir / "manifest.json").read_text(encoding="utf-8"))
    expected = [{"id": sc["id"], "text": sc["narration"]} for sc in scenes]
    if manifest["scenes"] != expected:
        raise ValueError("配音清单与分镜正文不一致，请按当前分镜重新配音")
    durations, timing = [], []
    with wave.open(str(out_path), "wb") as out:
        out.setparams((1, 2, 44100, 0, "NONE", "not compressed"))
        for sc in scenes:
            sid = sc["id"]
            if not re.fullmatch(r"[a-zA-Z0-9_-]+", sid):
                raise ValueError(f"无效的分镜 ID：{sid}")
            converted = tmpdir / f"{sid}.wav"
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(audio_dir / f"{sid}.mp3"),
                            "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(converted)], check=True)
            with wave.open(str(converted), "rb") as audio:
                raw = audio.readframes(audio.getnframes())
                speech_duration = audio.getnframes() / 44100
            duration = math.ceil((speech_duration + sc.get("pause_after", 0.45)) * fps) / fps
            out.writeframes(raw + silence(duration - speech_duration))
            durations.append(duration)
            timing.append({"offset": 0, "speech_duration": speech_duration})
    return durations, timing


# ---------- 主流程 ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("--out", required=True)
    ap.add_argument("--fps", type=int, default=FPS)
    ap.add_argument("--voice", default="Tingting")
    ap.add_argument("--rate", type=int, default=165)
    audio_mode = ap.add_mutually_exclusive_group()
    audio_mode.add_argument("--silent", action="store_true", help="无声画面样片，按分镜 duration 渲染")
    audio_mode.add_argument("--audio-dir", type=Path, help="nba_biz 配音适配器生成的分幕 MP3 目录")
    ap.add_argument("--burn-captions", action="store_true", help="将字幕合成到画面；不改变分镜素材")
    ap.add_argument("--preview", type=int, default=-1, help="只渲染某一幕的一帧")
    ap.add_argument("--preview-frame", type=float, default=1.0)
    args = ap.parse_args()
    if args.fps <= 0:
        ap.error("fps 必须大于 0")

    data = json.loads(Path(args.script).read_text(encoding="utf-8"))
    scenes = data["scenes"]
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    ctx = {"kicker": data.get("kicker", "为什么实验室"), "no": data.get("no", "01"),
           "audience": data.get("audience", "小学数学"),
           "footer": data.get("footer", "为什么实验室 · 底层原理课"), "total": 0}
    for sc in scenes:
        if sc["type"] not in SCENES:
            ap.error(f"未知场景：{sc['type']}")

    if args.preview >= 0:
        sc = scenes[args.preview]
        im, d = new_frame()
        ctx["total"] = ctx["scene_duration"] = sc.get("duration", 10)
        ctx["speech_duration"] = max(0.1, ctx["scene_duration"] - sc.get("pause_after", 0.45))
        SCENES[sc["type"]](im, d, args.preview_frame, sc, ctx)
        if args.burn_captions:
            draw_caption(d, sc.get("narration", ""))
        footer(d, ctx, args.preview_frame)
        preview_path = out.with_name(out.stem + "_preview.png")
        im.save(preview_path)
        print("preview:", preview_path)
        return

    with tempfile.TemporaryDirectory(prefix=".render-", dir=out.parent) as tmp:
        tmpdir = Path(tmp)
        rendered = tmpdir / out.name
        audio_path = tmpdir / "audio.wav"
        timing = None
        if args.silent:
            durations = [round(float(sc["duration"]) * args.fps) / args.fps for sc in scenes]
            if any(d <= 0 for d in durations):
                ap.error("无声样片每幕 duration 必须大于 0")
            timing = [{"offset": 0, "speech_duration": max(.1, dur - sc.get("pause_after", .45))}
                      for sc, dur in zip(scenes, durations)]
        elif args.audio_dir:
            print("① 读取分幕配音 …", flush=True)
            durations, timing = prepare_external_audio(scenes, args.audio_dir, audio_path, tmpdir, args.fps)
        else:
            print("① 生成系统临时配音 …", flush=True)
            durations = build_audio(scenes, audio_path, args.voice, args.rate, tmpdir, args.fps)
        ctx["total"] = sum(durations)
        print(f"总时长 {ctx['total']:.2f}s，共 {len(scenes)} 幕", flush=True)

        write_subtitles(scenes, durations, rendered, timing)
        cursor, timeline = 0.0, []
        for i, (sc, duration) in enumerate(zip(scenes, durations)):
            timeline.append({"id": sc.get("id", f"scene_{i:02d}"), "start": round(cursor, 6),
                             "duration": duration, "narration": sc.get("narration", ""),
                             "speech_duration": timing[i]["speech_duration"] if timing else None,
                             "pause_after": sc.get("pause_after", .45)})
            cursor += duration
        rendered.with_suffix(".timeline.json").write_text(json.dumps({
            "script": str(Path(args.script).resolve()), "fps": args.fps,
            "audio": "silent" if args.silent else "files" if args.audio_dir else "system",
            "audio_dir": str(args.audio_dir.resolve()) if args.audio_dir else None,
            "voice_id": json.loads((args.audio_dir / "manifest.json").read_text())["voice_id"] if args.audio_dir else None,
            "burn_captions": args.burn_captions, "scenes": timeline,
        }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        print("② 渲染画面 …", flush=True)
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-vcodec", "rawvideo",
               "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(args.fps), "-i", "-"]
        if not args.silent:
            cmd += ["-i", str(audio_path)]
        cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p"]
        cmd += ["-an"] if args.silent else ["-c:a", "aac", "-b:a", "160k", "-shortest"]
        cmd += ["-movflags", "+faststart", str(rendered)]
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        t_global, written = 0.0, 0
        try:
            for si, (sc, dur) in enumerate(zip(scenes, durations)):
                fn = SCENES[sc["type"]]
                ctx["scene_duration"] = dur
                ctx["speech_duration"] = timing[si]["speech_duration"] if timing else max(0.1, dur - 0.55)
                nframes = max(1, round(dur * args.fps))
                for k in range(nframes):
                    t = k / args.fps
                    im, d = new_frame()
                    fn(im, d, t, sc, ctx)
                    if args.burn_captions and (timing is None or t < timing[si]["speech_duration"]):
                        draw_caption(d, sc.get("narration", ""))
                    footer(d, ctx, t_global + t)
                    proc.stdin.write(im.tobytes())
                    written += 1
                t_global += dur
                print(f"   幕 {si+1}/{len(scenes)} · {sc['type']:<12} {dur:5.2f}s", flush=True)
        finally:
            proc.stdin.close()
            proc.wait()
        if proc.returncode != 0:
            sys.exit("ffmpeg 失败")
        # 整片成功后才替换交付文件，渲染异常时保留原成片及其字幕。
        for suffix in (".srt", ".vtt", ".timeline.json"):
            rendered.with_suffix(suffix).replace(out.with_suffix(suffix))
        rendered.replace(out)
        print(f"③ 完成：{out}  ({written} 帧)")


if __name__ == "__main__":
    main()
