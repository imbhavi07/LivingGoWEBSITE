import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: { status: 'approved' },
    select: { id: true, updatedAt: true },
  });

  const propertyUrls = properties.map((property) => ({
    url: `https://livinggo.in/properties/${property.id}`,
    lastModified: property.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://livinggo.in',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...propertyUrls,
  ];
}