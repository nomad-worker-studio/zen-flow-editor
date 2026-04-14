from PIL import Image
import os

def resize_icon(source, target, size):
    if not os.path.exists(source):
        print(f"Source {source} not found.")
        return
    img = Image.open(source)
    # Re-save as the target size
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(target)
    print(f"Resized {source} to {target} ({size}x{size})")

if __name__ == "__main__":
    icon_dir = 'public/icons'
    src = os.path.join(icon_dir, 'pwa-512x512.png')
    
    # Actually the source seems to be 1024x1024, but let's just make sure we have both
    resize_icon(src, os.path.join(icon_dir, 'pwa-512x512.png'), 512)
    resize_icon(src, os.path.join(icon_dir, 'pwa-192x192.png'), 192)
