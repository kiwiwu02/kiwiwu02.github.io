"""按网格元数据，从 canonical spritesheet 切出全部宠物状态帧。

spritesheet: 1536x2288 = 8 列 x 11 行，单元格 192x208
  row 0  idle          7 帧
  row 1  running-right 8 帧
  row 2  running-left  8 帧
  row 3  waving        4 帧
  row 4  jumping       5 帧
  row 5  failed        8 帧
  row 6  waiting       6 帧
  row 7  running       6 帧
  row 8  review        6 帧
  row 9  look (000-157.5)   8 帧
  row 10 look (180-337.5)   8 帧  -> 与 row 9 合并为 16 方向注视

关键：所有动画共用**同一个全局裁切框**（全部已用帧的并集包围盒），
这样状态切换时角色脚底位置完全对齐，不会跳。
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = PROJECT_ROOT / 'public' / 'pet'
CELL_W, CELL_H = 192, 208
PAD = 3

ROWS = [
    ('idle', 0, 7),
    ('running-right', 1, 8),
    ('running-left', 2, 8),
    ('waving', 3, 4),
    ('jumping', 4, 5),
    ('failed', 5, 8),
    ('waiting', 6, 6),
    ('running', 7, 6),
    ('review', 8, 6),
]


def parse_args():
    parser = argparse.ArgumentParser(description='从 Kiwi 宠物 spritesheet 生成状态帧。')
    parser.add_argument('sheet', type=Path, help='spritesheet.webp 的路径')
    parser.add_argument('--output-dir', type=Path, help='帧输出目录（默认：项目根目录的 public/pet）')
    parser.add_argument('--look-sheet', type=Path, help='可选：输出 16 方向注视联络表的路径')
    return parser.parse_args()


def main():
    args = parse_args()
    sheet = Image.open(args.sheet).convert('RGBA')
    output_root = args.output_dir or DEFAULT_OUT

    def cell(row, col):
        return sheet.crop((col * CELL_W, row * CELL_H, (col + 1) * CELL_W, (row + 1) * CELL_H))


    # 1) 先收集所有用到的帧，算全局并集包围盒
    all_cells = []
    groups = []
    for name, row, count in ROWS:
        cs = [cell(row, c) for c in range(count)]
        groups.append((name, cs))
        all_cells.extend(cs)

    look_cells = [cell(9, c) for c in range(8)] + [cell(10, c) for c in range(8)]
    groups.append(('look', look_cells))
    all_cells.extend(look_cells)

    boxes = [c.split()[3].getbbox() for c in all_cells if c.split()[3].getbbox()]
    x0 = max(0, min(b[0] for b in boxes) - PAD)
    y0 = max(0, min(b[1] for b in boxes) - PAD)
    x1 = min(CELL_W, max(b[2] for b in boxes) + PAD)
    y1 = min(CELL_H, max(b[3] for b in boxes) + PAD)
    box = (x0, y0, x1, y1)

    for name, cs in groups:
        output_dir = output_root / name
        output_dir.mkdir(parents=True, exist_ok=True)
        for old in output_dir.iterdir():
            if old.is_file() or old.is_symlink():
                old.unlink()
        for i, c in enumerate(cs):
            c.crop(box).save(output_dir / f'{i:02d}.png')
        print(f'{name}: {len(cs)} frames -> {x1 - x0}x{y1 - y0}px')

    # 2) 可选输出 look 16 方向联络表，人工确认方向顺序
    if args.look_sheet:
        args.look_sheet.parent.mkdir(parents=True, exist_ok=True)
        cw, ch = x1 - x0, y1 - y0
        cols, rows_n = 8, 2
        contact = Image.new('RGBA', (cw * cols, ch * rows_n), (255, 255, 255, 255))
        draw = ImageDraw.Draw(contact)
        for i in range(16):
            cx, cy = (i % cols) * cw, (i // cols) * ch
            contact.alpha_composite(look_cells[i].crop(box), (cx, cy))
            draw.rectangle([cx, cy, cx + cw - 1, cy + ch - 1], outline=(220, 220, 220, 255))
            draw.text((cx + 6, cy + 4), f'{i} ({i * 22.5:g}deg)', fill=(200, 30, 30, 255))
        contact.save(args.look_sheet)
        print('look 联络表 ->', args.look_sheet)


if __name__ == '__main__':
    main()
