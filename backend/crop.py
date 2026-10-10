# backend/crop.py
import cv2
import numpy as np


def load_image(image_bytes):
    data = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


def crop_image(image, x, y, width, height):
    """Return a rectangular crop from an OpenCV image.

    x and y are the top-left pixel coordinates; width and height are the
    requested crop dimensions. Coordinates outside the image are clipped.
    Raises ValueError if the image or crop rectangle is invalid.
    """
    if image is None or not isinstance(image, np.ndarray) or image.size == 0:
        raise ValueError("A valid image is required")

    image_height, image_width = image.shape[:2]
    x, y, width, height = map(int, (x, y, width, height))

    if width <= 0 or height <= 0:
        raise ValueError("Crop width and height must be positive")

    left = max(0, x)
    top = max(0, y)
    right = min(image_width, x + width)
    bottom = min(image_height, y + height)

    if left >= right or top >= bottom:
        raise ValueError("Crop rectangle does not overlap the image")

    return image[top:bottom, left:right].copy()
