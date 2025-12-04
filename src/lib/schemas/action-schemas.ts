import { z } from "zod";
import { PlateSlideSchema } from "./plate-schemas";

/**
 * Schema for creating a new presentation
 */
export const CreatePresentationSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    slides: z.array(PlateSlideSchema).min(0, "Slides must be an array"), // 修改：允许空数组，支持创建空演示文稿
    theme: z.string().optional(),
    thumbnailUrl: z.string().url().optional(),
});

/**
 * Schema for updating an existing presentation
 */
export const UpdatePresentationSchema = z.object({
    id: z.string().min(1, "Presentation ID is required"),
    title: z.string().min(1, "Title is required").max(200, "Title is too long").optional(),
    slides: z.array(PlateSlideSchema).optional(),
    theme: z.string().optional(),
    thumbnailUrl: z.string().url().optional(),
});

/**
 * Schema for generating an image
 */
export const GenerateImageSchema = z.object({
    prompt: z.string().min(1, "Image prompt is required").max(500, "Prompt is too long"),
    presentationId: z.string().optional(),
    slideId: z.string().optional(),
});

/**
 * Schema for deleting a presentation
 */
export const DeletePresentationSchema = z.object({
    id: z.string().min(1, "Presentation ID is required"),
});

// Export inferred types
export type CreatePresentationInput = z.infer<typeof CreatePresentationSchema>;
export type UpdatePresentationInput = z.infer<typeof UpdatePresentationSchema>;
export type GenerateImageInput = z.infer<typeof GenerateImageSchema>;
export type DeletePresentationInput = z.infer<typeof DeletePresentationSchema>;
