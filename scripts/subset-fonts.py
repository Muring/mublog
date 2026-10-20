"""
assets/fonts 의 NanumSquareNeo 원본 woff2 를 줄여 public/fonts 에 쓴다.

    yarn subset:fonts

원본은 한글 음절 11,172자를 다 담아 굵기마다 400KB 쯤 된다. 모바일 회선에서는 글꼴이
8~10초 뒤에야 도착해, 대체 글꼴로 먼저 그려진 글이 그때 한 번 더 밀렸다.
자주 쓰는 한글 2,350자(KS X 1001 완성형)만 남기면 굵기당 120KB 대로 줄어든다.
한글 외의 글자(영문·기호·자모)는 원본에 있는 것을 전부 남긴다.

2,350자 밖의 음절은 그 글자만 시스템 글꼴로 보인다. 글을 쓴 뒤 그런 글자가 있는지는
--check 로 백업본을 훑어 확인한다.
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "fonts"
OUT = ROOT / "public" / "fonts"
WEIGHTS = ["Light", "Regular", "Bold", "ExtraBold", "Heavy"]
HANGUL = range(0xAC00, 0xD7A4)


def ks_x_1001_hangul() -> set[int]:
    # EUC-KR 의 B0A1–C8FE 가 완성형 한글 2,350자다
    chars = set()
    for hi in range(0xB0, 0xC9):
        for lo in range(0xA1, 0xFF):
            try:
                chars.add(ord(bytes([hi, lo]).decode("euc-kr")))
            except UnicodeDecodeError:
                pass
    return chars


def check(keep: set[int]) -> int:
    missing = set()
    for path in (ROOT / "backup" / "posts").glob("*.mdx"):
        text = path.read_text(encoding="utf-8")
        missing |= {c for c in text if ord(c) in HANGUL and ord(c) not in keep}
    if missing:
        print(f"2,350자 밖의 한글 {len(missing)}자: {''.join(sorted(missing))}")
        return 1
    print("백업된 글의 한글은 모두 2,350자 안에 있다.")
    return 0


def main() -> int:
    keep_hangul = ks_x_1001_hangul()
    if "--check" in sys.argv:
        return check(keep_hangul)

    OUT.mkdir(exist_ok=True)
    for weight in WEIGHTS:
        src = SRC / f"NanumSquareNeo-{weight}.woff2"
        cmap = TTFont(src).getBestCmap()
        unicodes = [c for c in cmap if c not in HANGUL or c in keep_hangul]

        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]
        font = subset.load_font(str(src), options)
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=unicodes)
        subsetter.subset(font)
        dest = OUT / src.name
        subset.save_font(font, str(dest), options)
        print(f"{src.name}: {src.stat().st_size // 1024}KB -> {dest.stat().st_size // 1024}KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
