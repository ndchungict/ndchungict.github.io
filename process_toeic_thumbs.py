import os
import glob
import subprocess

artifact_dir = "/Users/chungnd/.gemini/antigravity-ide/brain/48a090c9-071f-472f-b32f-45d2a897240d"
site_dir = "/Volumes/TechSpace/Website/ndchungict.github.io"
dest_img_dir = os.path.join(site_dir, "static/images/toeic-story-posts")
posts_dir = os.path.join(site_dir, "content/posts/english")

os.makedirs(dest_img_dir, exist_ok=True)

mapping = {
    "toeic_qc": "20261031-0953-toeic-story-kiem-soat-chat-luong.md",
    "toeic_health_ins": "20261226-0953-toeic-story-bao-hiem-suc-khoe.md",
    "toeic_shopping": "20261010-0953-toeic-story-mua-sam-dat-hang.md",
    "toeic_banking": "20260926-0953-toeic-story-ngan-hang-ke-toan.md",
    "toeic_dining": "20260919-0953-toeic-story-mon-an-thanh-toan.md",
    "toeic_labor": "20260822-0953-toeic-story-hoi-nghi-quan-he-lao-dong.md",
    "toeic_hotel": "20260905-0953-toeic-story-khach-san-thue-xe.md",
    "toeic_rnd": "20261107-0953-toeic-story-rd-doi-moi.md",
    "toeic_travel": "20260829-0953-toeic-story-ve-lich-trinh-du-lich.md",
    "toeic_shipping": "20261017-0953-toeic-story-van-chuyen-hoa-don.md",
    "toeic_board": "20260704-0953-toeic-story-hop-hoi-dong-quan-tri.md",
    "toeic_it_systems": "20261121-0953-toeic-story-phan-mem-he-thong-it.md"
}

for prefix, md_file in mapping.items():
    # find the jpg file
    jpg_files = glob.glob(f"{artifact_dir}/{prefix}_*.jpg")
    if not jpg_files:
        print(f"Skipping {prefix}: Image not found.")
        continue
    
    # Just take the first one if multiple exist
    jpg_file = jpg_files[0]
    
    # Convert to webp
    webp_filename = f"{prefix}.webp"
    webp_path = os.path.join(dest_img_dir, webp_filename)
    
    print(f"Converting {jpg_file} to {webp_path}")
    subprocess.run(["cwebp", "-q", "80", jpg_file, "-o", webp_path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    # Update markdown file
    md_path = os.path.join(posts_dir, md_file)
    if not os.path.exists(md_path):
        print(f"Markdown file not found: {md_path}")
        continue
        
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    thumb_url = f"/images/toeic-story-posts/{webp_filename}"
    
    # Replace or add thumbnail in front matter
    import re
    if "thumbnail" in content:
        content = re.sub(r'thumbnail\s*=\s*[\'"].*?[\'"]', f"thumbnail = '{thumb_url}'", content, count=1)
    else:
        # insert before +++ at the end of front matter
        content = content.replace("+++\n", f"thumbnail = '{thumb_url}'\n+++\n", 1)
        
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Updated {md_file}")

print("Done processing 12 images.")
