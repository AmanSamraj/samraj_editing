from io import BytesIO
from flask import request, send_file, jsonify
from rembg import remove


@app.route("/remove-background", methods=["POST"])
def remove_background():
    file = request.files.get("image")

    if not file:
        return jsonify({"error": "Please upload an image"}), 400

    try:
        image_bytes = file.read()

        if not image_bytes:
            return jsonify({"error": "Image is empty"}), 400

        # AI removes the background
        result = remove(image_bytes)

        # Return transparent PNG to frontend
        return send_file(
            BytesIO(result),
            mimetype="image/png",
            download_name="background_removed.png"
        )

    except Exception as error:
        app.logger.exception("Background removal failed")

        return jsonify({
            "error": str(error)
        }), 500