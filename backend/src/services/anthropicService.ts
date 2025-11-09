import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import { createError } from '../middleware/errorHandler.js';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface ExtractedIDData {
  id?: string;
  lastName?: string;
  firstName?: string;
  middleInitial?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  sex?: string;
  dob?: string;
  confidence?: number;
}

export class AnthropicService {
  private static readonly OCR_PROMPT = `
Please extract text from this ID document and organize it into the following fields.
If a field is not present or cannot be read, omit it rather than guessing.

Required fields to extract:
- ID Number: Any identification number shown on the document
- Last Name: Person's family name/surname
- First Name: Person's given name
- Middle Initial: Middle name initial (if present)
- Address Street: Street address line
- Address City: City name
- Address State: State/Province name
- Address Zip: ZIP/Postal code
- Sex: Gender (M/F/Male/Female)
- DOB: Date of birth (in YYYY-MM-DD format if possible)

Please respond with a JSON object containing only these fields.
Be precise and extract exactly what's written on the document.
If text is unclear or missing, do not include that field in your response.
`;

  static async extractTextFromImage(imagePath: string): Promise<ExtractedIDData> {
    try {
      // Read and encode image
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Determine media type from file extension
      const mediaType = this.getMediaType(imagePath);

      if (!mediaType) {
        throw createError('Unsupported file format for OCR', 400);
      }

      // Call Anthropic API
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: this.OCR_PROMPT
              }
            ]
          }
        ]
      });

      // Extract and parse the response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw createError('Invalid response format from OCR service', 500);
      }

      // Parse JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw createError('Could not parse OCR response', 500);
      }

      let extractedData: ExtractedIDData;
      try {
        extractedData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw createError('Failed to parse OCR JSON response', 500);
      }

      // Normalize field names and clean data
      return this.normalizeExtractedData(extractedData);

    } catch (error: any) {
      console.error('Anthropic OCR error:', error);

      if (error.status === 401) {
        throw createError('Invalid Anthropic API key', 500);
      } else if (error.status === 429) {
        throw createError('OCR service rate limit exceeded. Please try again later.', 503);
      } else if (error.status === 500) {
        throw createError('OCR service temporarily unavailable', 503);
      }

      throw error;
    }
  }

  private static getMediaType(imagePath: string): string | null {
    const ext = imagePath.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      // Note: PDF not directly supported by Anthropic API
      // Would need PDF to image conversion for full support
      default:
        return null;
    }
  }

  private static normalizeExtractedData(data: any): ExtractedIDData {
    const normalized: ExtractedIDData = {};

    // Map various possible field names to our standard names
    const fieldMappings: { [key: string]: string } = {
      'id': 'id',
      'id_number': 'id',
      'identification': 'id',
      'license': 'id',
      'last_name': 'lastName',
      'surname': 'lastName',
      'family_name': 'lastName',
      'first_name': 'firstName',
      'given_name': 'firstName',
      'middle_initial': 'middleInitial',
      'middle_name': 'middleInitial',
      'address_street': 'addressStreet',
      'street': 'addressStreet',
      'address': 'addressStreet',
      'address_city': 'addressCity',
      'city': 'addressCity',
      'address_state': 'addressState',
      'state': 'addressState',
      'address_zip': 'addressZip',
      'zip': 'addressZip',
      'zipcode': 'addressZip',
      'postal_code': 'addressZip',
      'sex': 'sex',
      'gender': 'sex',
      'dob': 'dob',
      'date_of_birth': 'dob',
      'birth_date': 'dob'
    };

    // Apply mappings and clean data
    Object.keys(data).forEach(key => {
      const normalizedKey = fieldMappings[key.toLowerCase().replace(/\s+/g, '_')];
      if (normalizedKey && data[key]) {
        let value = String(data[key]).trim();

        // Clean up common formatting issues
        if (normalizedKey === 'middleInitial') {
          value = value.toUpperCase().substring(0, 1);
        } else if (normalizedKey === 'sex') {
          value = value.toLowerCase().startsWith('m') ? 'M' : 'F';
        } else if (normalizedKey === 'addressZip') {
          value = value.replace(/\D/g, '').substring(0, 5);
        }

  (normalized as any)[normalizedKey] = value;
      }
    });

    return normalized;
  }
}