import { z } from "zod";

/**
 * Schema for Plate text node
 */
export const PlateTextSchema = z.object({
    text: z.string(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    code: z.boolean().optional(),
});

/**
 * Base schema for Plate nodes
 * Recursive schema to handle nested children
 */
export const PlateNodeSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        type: z.string(),
        children: z.array(z.union([PlateNodeSchema, PlateTextSchema])).optional(),
        // Common attributes
        align: z.string().optional(),
        indent: z.number().optional(),
        // Specific attributes for different node types
        url: z.string().optional(), // for links
        caption: z.array(PlateNodeSchema).optional(), // for media
        // Allow additional properties
    }).passthrough()
);

/**
 * Schema for root image in slides
 */
export const RootImageSchema = z.object({
    query: z.string().min(1, "Image query is required"),
    url: z.string().url().optional(),
    status: z.enum(["pending", "generating", "success", "error"]).optional(),
});

/**
 * Schema for layout types
 */
export const LayoutTypeSchema = z.enum([
    "left",
    "right",
    "vertical",
    "title",
    "content",
]);

/**
 * Schema for slide alignment
 */
export const AlignmentSchema = z.enum(["left", "center", "right"]);

/**
 * Schema for a single Plate slide
 */
export const PlateSlideSchema = z.object({
    id: z.string(),
    content: z.array(PlateNodeSchema),
    layoutType: LayoutTypeSchema.optional(),
    rootImage: RootImageSchema.optional(),
    alignment: AlignmentSchema.optional(),
});

/**
 * Schema for presentation data
 */
export const PresentationDataSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    slides: z.array(PlateSlideSchema),
    theme: z.string().optional(),
    userId: z.string().optional(),
});

// Export inferred types
export type PlateText = z.infer<typeof PlateTextSchema>;
export type PlateNode = z.infer<typeof PlateNodeSchema>;
export type RootImage = z.infer<typeof RootImageSchema>;
export type LayoutType = z.infer<typeof LayoutTypeSchema>;
export type Alignment = z.infer<typeof AlignmentSchema>;
export type PlateSlide = z.infer<typeof PlateSlideSchema>;
export type PresentationData = z.infer<typeof PresentationDataSchema>;
