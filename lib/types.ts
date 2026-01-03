export type GalleryItem = {
  id: string;
  src: string;
  title?: string;
  tags: string[];
  prompt: string;
  negativePrompt?: string;
  model?: string;
  loras?: string[];
  steps?: number;
  cfg?: number;
  sampler?: string;
  seed?: number;
  size?: string;
  createdAt?: string;
};
