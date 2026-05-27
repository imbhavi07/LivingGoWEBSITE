import type { Property } from "@/types/property";
import type { OwnerProperty } from "@/types/owner";
import type { AdminListing, AdminUser } from "@/types/admin";

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Aster House Student Studio",
    price: 18500,
    location: "Koramangala, Bengaluru",
    address: "7th Block, near Forum Mall, Koramangala",
    roomType: "Single",
    preference: "Any",
    facilities: ["Wi-Fi", "Laundry", "Meals", "Study lounge"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    description:
      "A quiet, fully furnished student studio with natural light, fast internet, and easy access to colleges, cafes, and daily essentials.",
    owner: {
      id: "o1",
      name: "Ritika Sharma",
      phone: "+91 98765 43210",
      verified: true,
      responseTime: "Usually replies in 20 minutes"
    }
  },
  {
    id: "2",
    title: "Cedar Nest Shared Residence",
    price: 9800,
    location: "Indiranagar, Bengaluru",
    address: "CMH Road, close to metro station",
    roomType: "Shared",
    preference: "Girls",
    facilities: ["Wi-Fi", "Housekeeping", "Power backup", "CCTV"],
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80"
    ],
    description:
      "A secure shared residence designed for students who want a social, well-managed home near transit and restaurants.",
    owner: {
      id: "o2",
      name: "Neha Iyer",
      phone: "+91 91234 56780",
      verified: true,
      responseTime: "Usually replies within an hour"
    }
  },
  {
    id: "3",
    title: "Maple Court PG",
    price: 12200,
    location: "Hinjewadi, Pune",
    address: "Phase 1, behind tech park bus stop",
    roomType: "Shared",
    preference: "Boys",
    facilities: ["Meals", "Gym", "Wi-Fi", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"
    ],
    description:
      "A practical, commute-friendly PG with nutritious meals, reliable maintenance, and flexible student-friendly terms.",
    owner: {
      id: "o3",
      name: "Arjun Mehta",
      phone: "+91 99887 76655",
      verified: false,
      responseTime: "Usually replies same day"
    }
  }
];

export const mockOwnerProperties: OwnerProperty[] = mockProperties.map((property, index) => ({
  id: property.id,
  title: property.title,
  description: property.description,
  price: property.price,
  location: property.location,
  roomType: property.roomType,
  preference: property.preference,
  facilities: property.facilities,
  images: property.images,
  status: index === 2 ? "pending" : "active",
  createdAt: new Date(Date.now() - index * 86400000).toISOString()
}));

export const mockAdminListings: AdminListing[] = mockProperties.map((property, index) => ({
  id: property.id,
  title: property.title,
  ownerName: property.owner.name,
  price: property.price,
  location: property.location,
  roomType: property.roomType,
  preference: property.preference,
  facilities: property.facilities,
  images: property.images,
  description: property.description,
  status: index === 0 ? "approved" : index === 1 ? "pending" : "rejected",
  submittedAt: new Date(Date.now() - index * 172800000).toISOString()
}));

export const mockAdminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Aarav Nair",
    email: "aarav@example.com",
    role: "student",
    status: "active",
    joinedAt: new Date(Date.now() - 604800000).toISOString(),
    listingsCount: 0
  },
  {
    id: "u2",
    name: "Ritika Sharma",
    email: "ritika.owner@example.com",
    role: "owner",
    status: "active",
    joinedAt: new Date(Date.now() - 1209600000).toISOString(),
    listingsCount: 4
  },
  {
    id: "u3",
    name: "Spam Review",
    email: "spam@example.com",
    role: "owner",
    status: "suspended",
    joinedAt: new Date(Date.now() - 259200000).toISOString(),
    listingsCount: 1
  }
];
