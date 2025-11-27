import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
// Assuming the path to your helper files is correct
import { analyzeImageForWeights, extractWeightFromAnalysis, getSmartWeightSuggestions } from './clientOcrService';

// --- Environment Variable Access ---
// const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_VISION_API_KEY = "AIzaSyC6q74k2ISglwhacSSs1MvgurH47Y";
const GOOGLE_VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';
// -----------------------------------


  // OCR.space API with timeout and better handling
  // (Kept for fallback demonstration but will be skipped for Google Vision)
 
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


  // Alternative OCR using Google Cloud Vision API

async function recognizeWithGoogleVision(base64Image) {
  if (!GOOGLE_VISION_API_KEY) {
    throw new Error('Google Vision API key is not configured in .env file.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const payload = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION', 
              maxResults: 1,
            },
          ],
        },
      ],
    };

    console.log('🌐 Calling Google Vision API...');
    
    const response = await fetch(`${GOOGLE_VISION_ENDPOINT}?key=${GOOGLE_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Vision HTTP Error:', errorText);
      throw new Error(`Google Vision API request failed: ${response.status} - ${errorText.substring(0, 100)}...`);
    }

    const result = await response.json();
    console.log('📥 Google Vision response:', JSON.stringify(result, null, 2));

    const textAnnotations = result.responses?.[0]?.textAnnotations;

    // The first element of textAnnotations is the full text recognized in the image
    if (textAnnotations && textAnnotations.length > 0) {
      const fullText = textAnnotations[0].description.trim();
      console.log('✅ Google Vision raw text:', fullText);
      
      if (fullText.length > 0) {
        // Use your smart weight extractor on the raw text
        const weightText = extractWeightFromText(fullText);
        
        if (weightText) {
            console.log('✅ Smart weight extraction successful from Google Vision result.');
            return weightText;
        } else {
            console.log('📝 No weight pattern detected in Google Vision result, returning raw text.');
            return `Raw OCR Text (Google Vision): ${fullText}
            
⚠️ No clear weight pattern detected. Please check the manual entry field below.`;
        }
      }
    }

    // Fallback if no text annotations are present
    throw new Error('Google Vision API detected no text.');

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Google Vision request timed out');
    }
    console.warn('Google Vision API failed:', error);
    throw error;
  }
}

/**
 * Smart weight extraction from OCR text
 * (Keep this function as is, it's used by both OCR services)
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

    // --- PRIORITY 1: Google Vision API ---
    try {
      const text = await recognizeWithGoogleVision(base64);
      console.log('✅ Google Vision successful:', text);
      return text;
    } catch (visionError) {
      console.log('⚠️ Google Vision failed, falling back:', visionError.message);
      ocrResult = visionError.message;
    }

    // --- PRIORITY 2: OCR.space (if you wish to keep it as a fallback) ---
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
      console.log('⚠️ OCR.space failed, falling back:', ocrError.message);
      ocrResult = ocrError.message;
    }

    // --- PRIORITY 3: Client-side analysis ---
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

    // --- LAST RESORT: Mock detection ---
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