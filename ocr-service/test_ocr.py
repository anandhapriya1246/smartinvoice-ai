
from ocr import extract_text

image_path = "uploads/73e70f96-c5f5-490a-a0c0-7bfdf40ffb1e.png"

text = extract_text(image_path)

print("\nExtracted Invoice Text:\n")

for line in text:
    print(line)
