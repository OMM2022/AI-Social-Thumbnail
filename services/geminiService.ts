import { GoogleGenAI } from "@google/genai";
import type { GenerationOptions } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

const getAnalysisPrompt = async (options: GenerationOptions): Promise<string> => {
    if (options.mode === 'url') {
        const prompt = `You are an expert YouTube thumbnail designer. A user wants to create a thumbnail for a video based on the content at this URL: ${options.url}. The video's title is "${options.title}". Your task is to act as a creative director and write a detailed visual prompt for an AI image generator. This prompt should describe a highly engaging, clickable YouTube thumbnail. Consider the subject, composition, style (photorealistic, dramatic), colors (high contrast, vibrant), and mood (excitement, curiosity). Based on your analysis of the URL's likely content, provide ONLY the descriptive prompt for the image generator.`;
        const response = await ai.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } else if (options.mode === 'image' && options.referenceImage) {
        const imagePart = fileToGenerativePart(options.referenceImage, 'image/jpeg');
        const promptParts = [
            `You are an expert YouTube thumbnail designer. A user has provided this reference image and wants to use it to create a thumbnail for a video titled "${options.title}". Your task is to act as a creative director and write a detailed visual prompt for an AI image generator. This prompt should describe how to transform or incorporate the user's image into a new, highly engaging, clickable YouTube thumbnail. Describe enhancements like dramatic lighting, color grading, special effects, and how to best integrate the title text. Provide ONLY the descriptive prompt for the image generator based on the provided image.`,
            imagePart
        ];
        const response = await ai.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: promptParts },
        });
        return response.text;
    }
    return 'A generic but exciting YouTube thumbnail.';
};

export const enhancePrompt = async (currentPrompt: string): Promise<string> => {
    if (!currentPrompt.trim()) {
        return currentPrompt;
    }
    try {
        const prompt = `You are an expert prompt engineer for AI image generation models like Imagen. Your task is to take a user's idea and rewrite it into a more vivid, detailed, and effective prompt for creating a visually stunning YouTube thumbnail.
        Keep the user's core idea, but enhance it with descriptive language about:
        - Style (e.g., photorealistic, cinematic, fantasy art, 90s retro)
        - Composition (e.g., close-up, wide shot, dynamic angle)
        - Lighting (e.g., dramatic lighting, soft glow, neon highlights)
        - Color Palette (e.g., vibrant and high-contrast, moody and dark, pastel)
        - Mood (e.g., mysterious, exciting, epic, comedic)

        User's prompt: "${currentPrompt}"

        Return ONLY the rewritten, enhanced prompt. Do not add any extra text, explanations, or labels like "Enhanced Prompt:".`;

        const response = await ai.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw new Error("Failed to enhance the prompt with AI.");
    }
};

export const generateThumbnail = async (options: GenerationOptions): Promise<string> => {
    try {
        const analysisResult = await getAnalysisPrompt(options);

        const finalPrompt = `
            Create a highly engaging and clickable YouTube thumbnail with a ${options.aspectRatio} aspect ratio.
            Style: cinematic, high contrast, vibrant colors, dramatic lighting, photorealistic.
            The thumbnail MUST prominently feature the text "${options.title}". This text should be in a bold, easily readable font with a style similar to the "${options.fontFamily}" font family.
            Visual Description based on content analysis: ${analysisResult}.
            Additional user instructions: ${options.prompt}.
        `;

        const response = await ai.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: options.aspectRatio,
                outputMimeType: 'image/jpeg',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("Image generation failed, no images were returned.");
        }
    } catch (error) {
        console.error("Error generating thumbnail:", error);
        throw new Error("Failed to generate thumbnail. Please check the console for details.");
    }
};