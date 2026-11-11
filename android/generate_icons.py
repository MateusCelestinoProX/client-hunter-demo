#!/usr/bin/env python3
"""
generate_icons.py
Gera ícones profissionais oficiais em alta definição para o Client Hunter Android App
"""
import os
import math
from PIL import Image, ImageDraw, ImageFilter

SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

def create_master_icon(size=512, is_round=False):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center = size / 2.0
    radius = size * 0.44

    # Background shape
    if is_round:
        draw.ellipse([center - radius, center - radius, center + radius, center + radius], fill=(12, 10, 8, 255))
        draw.ellipse([center - radius, center - radius, center + radius, center + radius], outline=(250, 66, 0, 220), width=int(size * 0.025))
    else:
        # Rounded squircle
        corner_radius = int(size * 0.22)
        pad = int(size * 0.05)
        draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=corner_radius, fill=(12, 10, 8, 255))
        draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=corner_radius, outline=(250, 66, 0, 200), width=int(size * 0.025))

    # Inner glow circle
    inner_rad = radius * 0.72
    draw.ellipse([center - inner_rad, center - inner_rad, center + inner_rad, center + inner_rad], outline=(255, 119, 51, 140), width=int(size * 0.018))

    # Second inner radar ring
    core_rad = radius * 0.45
    draw.ellipse([center - core_rad, center - core_rad, center + core_rad, center + core_rad], outline=(250, 66, 0, 180), width=int(size * 0.015))

    # Hunter Crosshairs (Top, Bottom, Left, Right cross lines)
    cross_len = radius * 0.88
    inner_gap = radius * 0.25
    stroke = int(size * 0.032)

    # Top line
    draw.line([center, center - cross_len, center, center - inner_gap], fill=(255, 119, 51, 240), width=stroke)
    # Bottom line
    draw.line([center, center + inner_gap, center, center + cross_len], fill=(255, 119, 51, 240), width=stroke)
    # Left line
    draw.line([center - cross_len, center, center - inner_gap, center], fill=(255, 119, 51, 240), width=stroke)
    # Right line
    draw.line([center + inner_gap, center, center + cross_len, center], fill=(255, 119, 51, 240), width=stroke)

    # Corner brackets (Hunter HUD style)
    bracket_rad = radius * 0.65
    b_len = size * 0.06
    b_stroke = int(size * 0.02)
    b_color = (250, 66, 0, 230)

    # 4 HUD corners
    for angle in [45, 135, 225, 315]:
        rad = math.radians(angle)
        bx = center + bracket_rad * math.cos(rad)
        by = center + bracket_rad * math.sin(rad)
        draw.ellipse([bx - size*0.015, by - size*0.015, bx + size*0.015, by + size*0.015], fill=(255, 200, 100, 240))

    # Central glowing target laser dot
    dot_rad = size * 0.06
    draw.ellipse([center - dot_rad, center - dot_rad, center + dot_rad, center + dot_rad], fill=(250, 66, 0, 255))
    center_core = size * 0.03
    draw.ellipse([center - center_core, center - center_core, center + center_core, center + center_core], fill=(255, 255, 255, 255))

    return img

def main():
    base_res = "/Users/mcp/.gemini/antigravity/scratch/client-hunter-android/res"
    os.makedirs(base_res, exist_ok=True)

    # Generate master 512
    master_sq = create_master_icon(512, is_round=False)
    master_rd = create_master_icon(512, is_round=True)

    master_sq.save("/Users/mcp/.gemini/antigravity/scratch/client-hunter-android/app-icon.png")

    for folder, dim in SIZES.items():
        out_dir = os.path.join(base_res, folder)
        os.makedirs(out_dir, exist_ok=True)

        # Square
        sq_resized = master_sq.resize((dim, dim), Image.Resampling.LANCZOS)
        sq_resized.save(os.path.join(out_dir, "ic_launcher.png"), "PNG")

        # Round
        rd_resized = master_rd.resize((dim, dim), Image.Resampling.LANCZOS)
        rd_resized.save(os.path.join(out_dir, "ic_launcher_round.png"), "PNG")

        print(f"Generated {dim}x{dim} icons in {folder}")

    print("=== TODOS OS ÍCONES GERADOS COM SUCESSO ===")

if __name__ == "__main__":
    main()
