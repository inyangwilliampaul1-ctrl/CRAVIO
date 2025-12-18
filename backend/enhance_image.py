import sys
import os
from PIL import Image, ImageEnhance

def enhance_image(image_path, output_path=None):
    """
    Automatically enhances a food image by brightening, sharpening, and adding contrast.
    
    Args:
        image_path (str): Path to input image
        output_path (str, optional): Path to save enhanced image. Defaults to 'enhanced_<filename>'.
    """
    try:
        if not os.path.exists(image_path):
            print(f"Error: Image not found at {image_path}")
            return False

        print(f"Opening {image_path}...")
        img = Image.open(image_path)

        # 1. Enhance Brightness (Small boost for dark food photos)
        print("Applying Brightness Boost...")
        enhancer = ImageEnhance.Brightness(img)
        img = enhancer.enhance(1.15) 

        # 2. Enhance Contrast (Make colors pop)
        print("Applying Contrast Boost...")
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.1)

        # 3. Enhance Sharpness (Crispy details)
        print("Applying Sharpness Boost...")
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.5)

        # Generate output path if not provided
        if not output_path:
            directory, filename = os.path.split(image_path)
            name, ext = os.path.splitext(filename)
            output_path = os.path.join(directory, f"{name}_enhanced{ext}")

        img.save(output_path, quality=95)
        print(f"✅ Success! Enhanced image saved to: {output_path}")
        return output_path

    except Exception as e:
        print(f"❌ Error enhancing image: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python enhance_image.py <image_path>")
    else:
        enhance_image(sys.argv[1])
