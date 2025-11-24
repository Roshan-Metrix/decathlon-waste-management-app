// import * as FileSystem from "expo-file-system/legacy";
// import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

// const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// async function recognizeWithGemini(base64) {
//   if (!GEMINI_API_KEY) {
//     throw new Error("Missing EXPO_PUBLIC_GOOGLE_API_KEY");
//   }

//   console.log("🌐 Calling Gemini OCR API...");

//   try {
//     const response = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyC6q74k2ISglwhacSSs1MvgurH47Y5wgrw`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   inline_data: {
//                     mime_type: "image/jpeg",
//                     data: base64,
//                   },
//                 },
//                 {
//                   text: "Extract ONLY the weight number from this scale image. Do not add units or extra text.",
//                 },
//               ],
//             },
//           ],
//         }),
//       }
//     );

//     const json = await response.json();

//     if (!response.ok) {
//       console.warn("⚠️ Gemini OCR error:", json);
//       throw new Error("Gemini OCR failed: " + response.status);
//     }

//     const text =
//       json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

//     return text;
//   } catch (err) {
//     console.warn("⚠️ Gemini OCR error:", err);
//     throw err;
//   }
// }

// export async function runOcrOnImage(uri) {
//   try {
//     console.log("🔍 Starting OCR on:", uri);

//     const manip = await manipulateAsync(
//       uri,
//       [{ resize: { width: 1000 } }],
//       { compress: 0.7, format: SaveFormat.JPEG }
//     );

//     console.log("🖼️ Preprocessed image, converting to Base64…");

//     const base64 = await FileSystem.readAsStringAsync(manip.uri, {
//       encoding: "base64",
//     });

//     console.log("📏 Base64 length:", base64.length);

//     const weight = await recognizeWithGemini(base64);
//     console.log("🎯 Gemini OCR Result:", weight);

//     if (!weight) {
//       return "Unable to detect weight.";
//     }

//     return `Detected Weight: ${weight}`;
//   } catch (err) {
//     console.error("❌ OCR Error:", err);
//     throw new Error("OCR failed: " + err);
//   }
// }

// export async function terminateOcrWorker() {
//   console.log("Gemini OCR: No cleanup required");
// }




import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { analyzeImageForWeights, extractWeightFromAnalysis, getSmartWeightSuggestions } from './clientOcrService';

/**
 * OCR.space API with timeout and better handling
 */
async function recognizeWithOCRSpace(base64Image) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    console.log('🌐 Calling OCR.space API...');
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'helloworld',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API response not OK: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 OCR.space response:', JSON.stringify(result, null, 2));

    if (result.ParsedResults?.[0]?.ParsedText) {
      const text = result.ParsedResults[0].ParsedText.trim();
      if (text.length > 0) {
        return text;
      }
    }

    if (result.ErrorMessage && result.ErrorMessage !== '') {
      throw new Error(`OCR.space error: ${result.ErrorMessage}`);
    }

    throw new Error('No text detected by OCR.space');
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OCR request timed out');
    }
    console.warn('OCR.space API failed:', error);
    throw error;
  }
}

/**
 * Alternative OCR using Google Cloud Vision API (requires API key)
 */
async function recognizeWithGoogleVision(base64Image) {
  throw new Error('Google Vision API not configured');
}

/**
 * Smart weight extraction from OCR text
 */
function extractWeightFromText(text) {
  console.log('🔍 Analyzing OCR text for weight patterns:', text);

  const cleanText = text.replace(/\s+/g, ' ').trim();
  const allNumbers = cleanText.match(/\d+\.?\d*/g) || [];
  console.log('📊 All detected numbers:', allNumbers);

  if (allNumbers.length === 0) return null;

  const numberAnalysis = allNumbers.map(numStr => {
    const num = parseFloat(numStr);
    let score = 0;

    if (numStr.length >= 4 && numStr.length <= 6) score += 50;
    else if (numStr.length >= 2 && numStr.length <= 3) score += 30;

    if (num >= 1 && num <= 99999) score += 30;
    if (allNumbers.indexOf(numStr) === 0) score += 20;

    const lowerText = cleanText.toLowerCase();
    if (lowerText.includes('since') || lowerText.includes('year') || lowerText.includes('199')) {
      if (numStr.includes('199')) score -= 100;
    }

    if (lowerText.includes('digital sca') || lowerText.includes('weigh') || lowerText.includes('scale')) {
      score += 10;
    }

    return {
      original: numStr,
      value: num,
      score,
      formatted: formatScaleReading(numStr)
    };
  });

  console.log('📈 Number analysis:', numberAnalysis);

  const sortedNumbers = numberAnalysis.sort((a, b) => b.score - a.score);
  const bestMatch = sortedNumbers[0];

  if (bestMatch && bestMatch.score > 0) {
    console.log('✅ Best weight match:', bestMatch);
    return `Weight: ${bestMatch.formatted} kg
Original reading: ${bestMatch.original}
Confidence: ${Math.min(100, Math.round((bestMatch.score / 100) * 100))}%
Method: Smart pattern recognition`;
  }

  return null;
}

/**
 * Format scale readings intelligently
 */
function formatScaleReading(reading) {
  const cleanReading = reading.replace(/\./g, '');

  if (cleanReading.length >= 4) {
    const intPart = cleanReading.slice(0, -3);
    const decPart = cleanReading.slice(-3);
    return `${intPart}.${decPart}`;
  } else if (cleanReading.length === 3) {
    const intPart = cleanReading.slice(0, -1);
    const decPart = cleanReading.slice(-1);
    return `${intPart}.${decPart}`;
  } else {
    return cleanReading;
  }
}

/**
 * Enhanced mock detection with realistic weight patterns
 */
function detectNumbersInImage() {
  const scenarios = [
    { type: 'Personal Item', weights: ['0.5', '1.2', '2.8', '5.1', '7.3'] },
    { type: 'Package', weights: ['10.5', '15.2', '22.8', '28.4', '35.7'] },
    { type: 'Bulk Item', weights: ['45.2', '52.6', '68.9', '73.1', '89.4'] },
  ];

  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const randomWeight = randomScenario.weights[Math.floor(Math.random() * randomScenario.weights.length)];

  console.log(`📋 Mock detection (${randomScenario.type}): ${randomWeight} kg`);

  return `Weight: ${randomWeight} kg
Detected as: ${randomScenario.type}
Confidence: 85%

[DEMO MODE: This is simulated OCR data for testing]`;
}

/**
 * Run OCR on an image and return the extracted text
 */
export async function runOcrOnImage(uri) {
  try {
    console.log('🔍 Starting OCR on image:', uri);

    const manipResult = await manipulateAsync(
      uri,
      [{ resize: { width: 1000 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    console.log('🖼️ Image preprocessed, converting to base64...');
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, { encoding: 'base64' });
    console.log(`📏 Base64 length: ${base64.length} characters`);

    let ocrResult = null;

    try {
      const rawText = await recognizeWithOCRSpace(base64);
      console.log('✅ OCR.space raw text:', rawText);

      const weightText = extractWeightFromText(rawText);
      if (weightText) {
        console.log('✅ Smart weight extraction successful:', weightText);
        return weightText;
      } else {
        console.log('📝 No weight pattern detected, returning raw text:', rawText);
        return `Raw OCR Text: ${rawText}

⚠️ No clear weight pattern detected. Please check the manual entry field below.`;
      }
    } catch (ocrError) {
      console.log('⚠️ OCR.space failed:', ocrError.message);
      ocrResult = ocrError.message;
    }

    try {
      const text = await recognizeWithGoogleVision(base64);
      console.log('✅ Google Vision complete:', text);
      return text;
    } catch (visionError) {
      console.log('⚠️ Google Vision failed:', visionError.message);
    }

    try {
      console.log('🔍 Trying client-side image analysis...');
      const analysis = await analyzeImageForWeights(uri);
      const weightText = extractWeightFromAnalysis(analysis);

      if (weightText) {
        console.log('✅ Client-side analysis successful:', weightText);
        return weightText;
      } else {
        console.log('⚠️ No weight detected in client-side analysis');
      }
    } catch (analysisError) {
      console.log('⚠️ Client-side analysis failed:', analysisError.message);
    }

    console.log('📋 Using enhanced mock detection...');
    const mockText = detectNumbersInImage();
    const suggestions = getSmartWeightSuggestions();

    console.log('✅ Mock detection complete with suggestions');

    return `${mockText}

📝 QUICK SUGGESTIONS:
${suggestions.join('\n')}

[DEBUG: All OCR methods failed - ${ocrResult}]`;
  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw new Error(`OCR failed: ${error}`);
  }
}

export async function terminateOcrWorker() {
  console.log('API-based OCR: No cleanup needed');
}
