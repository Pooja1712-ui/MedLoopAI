import os
import io
import re
from datetime import datetime, timedelta
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS 
from ultralytics import YOLO
import easyocr

# --- Initialize Flask App and CORS ---
app = Flask(__name__)
# Allow requests from your React app's origin (adjust if needed)
# For development, allowing '*' might be okay, but be more specific for production.
CORS(app, resources={r"/*": {"origins": "*"}}) # Enable CORS for all routes

# --- Configuration & Model Loading ---
try:
    # Load your YOLO detection model
    # Ensure this path is correct relative to where you run app.py
    DETECTION_MODEL_PATH = 'runs/detect/train7/weights/best.pt'
    detection_model = YOLO(DETECTION_MODEL_PATH)
    DETECTION_CLASS_NAMES = ['wheelchair', 'cylinder', 'medicine', 'crutch']
    print(f"✅ YOLO detection model loaded successfully from {DETECTION_MODEL_PATH}")
except Exception as e:
    print(f"❌ Error loading YOLO detection model: {e}")
    detection_model = None

try:
    # Initialize EasyOCR Reader (consider loading only when needed if memory is tight)
    # Using ['en'] for English language
    ocr_reader = easyocr.Reader(['en'], gpu=False) # Set gpu=True if you have a compatible GPU and CUDA setup
    print("✅ EasyOCR reader initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing EasyOCR reader: {e}")
    ocr_reader = None

# --- API Endpoints ---

@app.route('/predict', methods=['POST'])
def predict_object():
    """
    Detects medical devices in an uploaded image using YOLO.
    Returns a list of detected objects with class, confidence, and bounding box.
    """
    if detection_model is None:
        return jsonify({"error": "Detection model not loaded."}), 503 # Service Unavailable

    if 'image' not in request.files:
        return jsonify({"error": "No 'image' file part in the request."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected for upload."}), 400

    try:
        # Read image bytes and open with PIL
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Perform detection
        results = detection_model(image)
        predictions = []

        # Process results
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0]) # Get class ID
                conf = float(box.conf[0]) # Get confidence
                bbox = [float(coord) for coord in box.xyxy[0]] # Get bounding box coordinates [x1, y1, x2, y2]

                # Ensure class ID is valid
                if 0 <= cls_id < len(DETECTION_CLASS_NAMES):
                    pred = {
                        'class': DETECTION_CLASS_NAMES[cls_id],
                        'confidence': round(conf, 4),
                        'bbox': bbox
                    }
                    predictions.append(pred)
                else:
                     print(f"Warning: Detected unknown class ID {cls_id}")


        print(f"Predictions: {predictions}")
        return jsonify({'predictions': predictions}), 200

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return jsonify({"error": f"An error occurred during object detection: {str(e)}"}), 500


@app.route('/check-expiry', methods=['POST'])
def check_expiry_ocr():
    """
    Performs OCR on an uploaded image to find and validate medicine expiry dates.
    Returns the detected expiry text and a boolean indicating validity.
    """
    if ocr_reader is None:
        return jsonify({"error": "OCR reader not initialized."}), 503

    if 'image' not in request.files:
        return jsonify({"error": "No 'image' file part in the request."}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No image selected for upload."}), 400

    try:
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        np_img = np.array(img)

        ocr_result_raw = ocr_reader.readtext(np_img)
        ocr_result_text_only = [text for _, text, _ in ocr_result_raw]
        full_text = " ".join(ocr_result_text_only)
        print(f"--- OCR Result --- \n{full_text}\n--------------------")

        expiry_text_found = None
        is_valid = None
        parsed_date = None

        # --- UPDATED Expiry Date Regex ---
        # Looks for optional keyword (Group 1), then Month (Group 2) / Year (Group 3)
        # Separator is now part of the non-capturing group for flexibility
        pattern = r'(?i)(?:(\b(?:EXP\.?|EXPIRY|USE BY|BEST BY)\b)\s*[:\-\s]*)?(0[1-9]|1[0-2])[/\-](\d{2,4})\b'

        matches = re.findall(pattern, full_text)
        print(f"Regex Matches: {matches}") # Should now look like: [('', '06', '2024'), ('EXP', '05', '2026')]

        found_dates = []
        for match in matches:
            # match = (keyword_capture_group, month, year_str)
            keyword = match[0]  # This should now capture 'EXP' or be empty/None
            month = match[1]
            year_str = match[2]

            # Normalize year: '26' -> '2026'
            if len(year_str) == 2:
                year_int = int(year_str)
                # Basic heuristic: Assume 20xx century
                year = 2000 + year_int
            else:
                year = int(year_str)

            # Reconstruct the date string in a consistent format MM/YYYY
            date_str_normalized = f"{month}/{year}"
            expiry_text_original = f"{month}/{year_str}" # Store the originally found format MM/YY or MM/YYYY

            # Attempt to parse the date (assume end of month for MM/YYYY)
            try:
                parsed_dt = datetime.strptime(date_str_normalized, "%m/%Y")
                # Calculate end of the expiry month
                # Go to the 28th day, add 4 days (guarantees next month), then subtract days to get last day of original month
                next_month_approx = parsed_dt.replace(day=28) + timedelta(days=4)
                last_day_of_month = next_month_approx - timedelta(days=next_month_approx.day)
                expiry_date = last_day_of_month.replace(hour=23, minute=59, second=59) # Set time to end of day

                found_dates.append({
                    "text": expiry_text_original,
                    "date": expiry_date,
                    "has_keyword": bool(keyword and keyword.strip()) # Check if keyword group actually captured something
                })
                print(f"Processed Match: Keyword='{keyword}', Text='{expiry_text_original}', Date='{expiry_date}', HasKeyword='{bool(keyword and keyword.strip())}'")

            except ValueError:
                print(f"Could not parse date: {date_str_normalized}")
                continue # Skip if parsing fails

        if found_dates:
            # --- UPDATED Best Match Logic ---
            # Prioritize dates found *with* keywords like EXP
            keyword_matches = [d for d in found_dates if d["has_keyword"]]
            if keyword_matches:
                 # If multiple keyword matches, maybe take the latest date? For now, take the first.
                 best_match = keyword_matches[0]
                 print("Selecting match with keyword.")
            else:
                 # If no keyword match, take the *latest* date found (more likely expiry than MFG)
                 # Or fallback to first if only one date found
                 best_match = max(found_dates, key=lambda d: d["date"]) if len(found_dates) > 1 else found_dates[0]
                 print("Selecting latest date found (no keyword priority).")


            expiry_text_found = best_match["text"]
            parsed_date = best_match["date"]
            now = datetime.now()
            is_valid = parsed_date > now # Check if expiry date is in the future
            print(f"Best match selected: Text='{expiry_text_found}', Parsed Date='{parsed_date}', Valid='{is_valid}'")
        else:
            print("No valid expiry date pattern found in OCR text.")
            expiry_text_found = None
            is_valid = None

        return jsonify({
            'expiry_text_detected': expiry_text_found,
            'is_valid': is_valid,
            'parsed_expiry_date': parsed_date.strftime('%Y-%m-%d') if parsed_date else None,
            'full_ocr_text': full_text
        }), 200

    except Exception as e:
        print(f"❌ Error during expiry check: {e}")
        import traceback
        print(traceback.format_exc()) # Print full traceback for debugging
        return jsonify({"error": f"An error occurred during expiry check: {str(e)}"}), 500


# --- Run Flask App ---
if __name__ == '__main__':
    # Run on 0.0.0.0 to make it accessible outside the container/localhost if needed
    # Default port 5002 for the AI service
    port = int(os.environ.get("PORT", 5002))
    # debug=True automatically reloads on code changes, disable for production
    app.run(debug=True, host='0.0.0.0', port=port)