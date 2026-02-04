import sharp from "sharp";
import FormData from "form-data";
import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/*  GEMINI OCR  */
async function recognizeWithGemini(base64Image) {
  if (!GEMINI_API_KEY) {
    throw new Error("[GEMINI ERROR] API key missing");
  }

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `This image contains a digital weighing machine.Identify the digital display that shows the measured weight value.
            Disregard all other text, numbers, labels, reflections, price, tare, count, or secondary displays.If multiple numeric readings are visible, select the one that represents the weight measurement.
            If the image is taken from a distance or slightly unclear, choose the most prominent and likely weight display.
            Output rules:
            - Numbers only
            - Decimal allowed
            - No units
            - No spaces
            - No words or explanations
            - The value represents kilograms (kg)
  
            Valid example outputs:
            72
            72.4
            100.0`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[GEMINI ERROR]", response.status, text);
    throw new Error(`Gemini HTTP ${response.status}`);
  }

  const result = await response.json();

  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error("Gemini returned empty text");
  }

  const match = text.match(/\d+\.?\d*/);
  if (!match) {
    throw new Error("Gemini returned non-numeric output");
  }

  return parseFloat(match[0]);
}

/*  OCR.SPACE  */
async function recognizeWithOCRSpace(base64Image) {
  const formData = new FormData();
  formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);
  formData.append("language", "eng");

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: "helloworld",
      ...formData.getHeaders(),
    },
    body: formData,
  });

  const result = await response.json();
  const text = result?.ParsedResults?.[0]?.ParsedText;

  if (!text) throw new Error("OCR.space failed");

  const match = text.match(/\d+\.?\d*/);
  if (!match) throw new Error("OCR.space no numeric result");

  return parseFloat(match[0]);
}

/*  MAIN OCR PIPELINE  */
export async function runOcrOnImage(imagePath) {
  console.log("-- OCR started for image:", imagePath);

  // Resize & compress using sharp
  const processedBuffer = await sharp(imagePath)
    .resize({ width: 1000 })
    .jpeg({ quality: 80 })
    .toBuffer();

  const base64 = processedBuffer.toString("base64");

  // Gemini
  try {
    const weight = await recognizeWithGemini(base64);
    console.log("-- Gemini success → weight:", weight);
    return weight;
  } catch (e) {
    console.warn("-- Gemini failed → falling back");
    console.warn(e.message);
  }

  // OCR.space
  try {
    const weight = await recognizeWithOCRSpace(base64);
    console.log("-- OCR.space success → weight:", weight);
    return weight;
  } catch (e) {
    console.warn("-- OCR.space failed");
    console.warn(e.message);
  }

  console.error("-- All OCR methods failed");
  throw new Error("Weight could not be detected");
}

export function terminateOcrWorker() {}
