import os
import glob
import subprocess

artifact_dir = "/Users/chungnd/.gemini/antigravity-ide/brain/48a090c9-071f-472f-b32f-45d2a897240d"
site_dir = "/Volumes/TechSpace/Website/ndchungict.github.io"
dest_img_dir = os.path.join(site_dir, "static/images/toeic-story-posts")
posts_dir = os.path.join(site_dir, "content/posts/english")

os.makedirs(dest_img_dir, exist_ok=True)

mapping = {
    "toeic_mergers": "20260801-0953-toeic-story-hop-dong-sap-nhap.md",
    "toeic_office_equip": "20260711-0953-toeic-story-thiet-bi-van-phong.md",
    "toeic_finance": "20261003-0953-toeic-story-dau-tu-thue-ngan-sach.md",
    "toeic_launch": "20270102-0953-toeic-story-su-kien-ra-mat.md",
    "toeic_media": "20270109-0953-toeic-story-truyen-thong-danh-gia.md",
    "toeic_realestate": "20261205-0953-toeic-story-thue-mua-mat-bang.md",
    "toeic_patents": "20261114-0953-toeic-story-sang-che-thuong-mai-hoa.md",
    "toeic_medical": "20261219-0953-toeic-story-kham-dieu-tri.md",
    "toeic_reception": "20260912-0953-toeic-story-dat-ban-tiep-khach.md",
    "toeic_construction": "20261212-0953-toeic-story-xay-dung-dien-gas-bao-tri.md",
    "toeic_marketing": "20260808-0953-toeic-story-marketing-ban-hang.md",
    "toeic_assembly": "20261024-0953-toeic-story-day-chuyen-nang-suat.md",
    "toeic_salary": "20260725-0953-toeic-story-luong-phuc-loi-thang-chuc.md"
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
