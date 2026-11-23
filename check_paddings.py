import re

files = [
    "src/components/CategoryTiles.tsx",
    "src/components/CircularCategories.tsx",
    "src/components/FeaturedCollections.tsx",
    "src/components/FeaturedSection.tsx",
    "src/components/FeaturedTreasures.tsx",
    "src/components/NewArrivalsSection.tsx",
    "src/components/PopularSection.tsx",
    "src/components/ProductSection.tsx",
    "src/components/ExpoSection.tsx",
    "src/components/RealmsSection.tsx",
    "src/components/HowToOrder.tsx",
    "src/components/LoveNotes.tsx",
    "src/components/ProductReviews.tsx"
]

for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        text = f.read()
    
    for i, line in enumerate(text.split("\n"), 1):
        # find px- or p- with large values
        matches = re.findall(r'\b(px|p|pl|pr|mx|m|ml|mr)-(\d+|\[[^\]]+\])', line)
        for prefix, val in matches:
            if val.isdigit() and int(val) >= 6:
                print(f"{fpath}:{i} -> {prefix}-{val} in {line.strip()[:100]}")
