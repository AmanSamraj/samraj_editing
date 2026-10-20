from flask import Flask, request,send_file
from flask_cors import CORS
import cv2
import  numpy  as  np
from rembg import remove, new_session
from io import BytesIO
import io
from flask import request, send_file, jsonify
import time


bg_session = new_session("u2net_human_seg")
app =Flask(__name__)
CORS(app)

@app.route("/remove-background", methods=["POST"])
def remove_background():
    uploaded_file = request.files.get("image")

    if not uploaded_file:
        return jsonify({"error": "Please upload an image"}), 400

    image_bytes = uploaded_file.read()

    if not image_bytes:
        return jsonify({"error": "Image is empty"}), 400

    try:
        start = time.perf_counter()

        # Reuse the loaded model; keep alpha matting off initially
        result = remove(
            image_bytes,
            session=bg_session
        )

        elapsed = time.perf_counter() - start
        print(f"Background processing: {elapsed:.2f} seconds")

        return send_file(
            BytesIO(result),
            mimetype="image/png",
            download_name="background_removed.png"
        )

    except Exception as error:
        app.logger.exception("Background removal failed")
        return jsonify({"error": str(error)}), 500

@app.get("/")
def home():
    return "Flask Backend is Running"

@app.post("/process-image")

def process_image():
    # get  image
    uploaded_file = request.files.get("image")

    if uploaded_file is None:
        return {"error": "image  file  nhi mili"},400

    image_bytes = np.frombuffer(uploaded_file.read(),np.uint8)
    image = cv2.imdecode(image_bytes,cv2.IMREAD_COLOR)

    if image is None:
        return{"error": "invalid image"},400

    # get operation
    operation =  request.args.get("operation")

    # grayscale
    if operation == "grayscale":
        image =cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)

    #crop
    elif operation == "crop":

        x = int(request.args.get("x", 0))
        y = int(request.args.get("y", 0))

        width = int(request.args.get("width", 0))
        height = int(request.args.get("height", 0))

        image_height, image_width = image.shape[:2]

        # 🟢 NEW: Validate crop coordinates
        if (
            x < 0 or y < 0 or
            width <= 0 or height <= 0 or
            x + width > image_width or
            y + height > image_height
        ):
            return {"error": "Invalid crop coordinates"}, 400

        # Crop the selected region
        image = image[
            y:y + height,
            x:x + width
        ] 

    # image -jpg
    success, encoded_image = cv2.imencode(".jpg",image)

    if  not  success: 
        return{"error": "image processing failed"}, 500

    # send_image 
    return send_file(
        io.BytesIO(encoded_image.tobytes()),
        mimetype="image/jpg"
    )



    # return{
    #     "message":"image successfully received",
    #     "width":width,
    #     "height":height,
    # }

if __name__ =="__main__":
    app.run(debug=True, port=5501)

