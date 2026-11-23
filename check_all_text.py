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
    
    # find all text-[something] or text-xl/2xl/3xl/4xl
    for i, line in enumerate(text.split("\n"), 1):
        matches = re.findall(r'\btext-(?:\[[^\]]+\]|\w+)\b', line)
        for m in matches:
            if any(k in m for k in ['2xl', '3xl', '4xl', '5xl', '6xl', '1.', '2.', 'clamp']):
                print(f"{fpath}:{i} -> {m} in {line.strip()[:100]}")
