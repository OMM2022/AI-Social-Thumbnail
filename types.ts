export type GenerationMode = 'url' | 'image';

export type AspectRatio = '16:9' | '9:16' | '4:3' | '3:4' | '1:1';

export interface GenerationOptions {
  mode: GenerationMode;
  url: string;
  referenceImage: string | null; // base64 string
  title: string;
  fontFamily: string;
  prompt: string;
  aspectRatio: AspectRatio;
}