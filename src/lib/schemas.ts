import { z } from 'zod'

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial()

export const createCampaignSchema = z.object({
  workspaceId: z.string().min(1),
  brandId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  commissionRate: z.number().min(0).max(100).default(10),
  targetUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  rewardType: z.string().optional(),
  rewardConfig: z.string().optional(),
  status: z.string().optional(),
  isPublic: z.boolean().optional(),
})

export const createLinkSchema = z.object({
  workspaceId: z.string().min(1),
  campaignId: z.string().optional(),
  partnerId: z.string().optional(),
  key: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  url: z.string().url('Must be a valid URL'),
  title: z.string().optional(),
})

export const analyticsQuerySchema = z.object({
  linkId: z.string().optional(),
  campaignId: z.string().optional(),
  workspaceId: z.string().min(1),
  range: z.enum(['24h', '7d', '30d']).default('7d'),
})

export const checkoutSchema = z.object({
  email: z.string().email(),
  companyName: z.string().optional(),
  affiliateId: z.string().optional(),
  campaignId: z.string().optional(),
  priceId: z.string().min(1),
})

export const conversionWebhookSchema = z.object({
  email: z.string().email(),
  campaignId: z.string().optional(),
  affiliateId: z.string().optional(),
  revenueAmount: z.number().min(0),
  stripeSessionId: z.string().optional(),
})
