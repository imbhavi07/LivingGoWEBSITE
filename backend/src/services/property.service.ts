  // Return updated property snapshot
  const updated = await prisma.property.findUnique({ where: { id: propertyId } });
  return {
    propertyId: updated.id,
    propertyTitle: updated.title,
    location: updated.location,
    occupiedBeds: updated.occupiedBeds,
    totalBeds,
    availableBeds: Math.max(0, totalBeds - updated.occupiedBeds),
  };