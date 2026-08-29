// src/data/jharkhandLocations.js

/**
 * Temporary location data for the Jharkhand Interactive Map.
 * 
 * TODO [BACKEND INTEGRATION]: 
 * This data structure should eventually be replaced by an API call 
 * (e.g., GET /api/locations) connected to a PostgreSQL database, 
 * allowing admins to upload real images, videos, and new locations.
 */

export const jharkhandLocations = [
  {
    id: 1,
    name: "Hundru Falls",
    district: "Ranchi",
    latitude: 23.4475,
    longitude: 85.6253,
    description: "One of the most famous tourist destinations of Jharkhand, where the Subarnarekha River falls from a height of 320 feet creating a breathtaking landscape.",
    // Temporary placeholder media
    imageUrl: "https://picsum.photos/seed/hundru/1200/800", 
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" 
  },
  {
    id: 2,
    name: "Dassam Falls",
    district: "Ranchi",
    latitude: 23.0333,
    longitude: 85.4667,
    description: "Also known as Dassam Garh, this beautiful waterfall cascades down across multiple steps, forming a stunning natural plunge pool amidst dense forests.",
    imageUrl: "https://picsum.photos/seed/dassam/1200/800",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 3,
    name: "Netarhat",
    district: "Latehar",
    latitude: 23.4833,
    longitude: 84.2667,
    description: "Known as the 'Queen of Chotanagpur', Netarhat is a beautiful hill station renowned for its spectacular sunrises and sunsets during the summer months.",
    imageUrl: "https://picsum.photos/seed/netarhat/1200/800",
    videoUrl: null // Intentional null to test fallback
  },
  {
    id: 4,
    name: "Betla National Park",
    district: "Latehar",
    latitude: 23.8833,
    longitude: 84.1833,
    description: "A beautiful national park offering rich biodiversity. It was one of the first national parks in India to become a tiger reserve under Project Tiger.",
    imageUrl: "https://picsum.photos/seed/betla/1200/800",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 5,
    name: "Patratu Valley",
    district: "Ramgarh",
    latitude: 23.6333,
    longitude: 85.2833,
    description: "Famous for its winding scenic roads with sharp hairpin bends. The breathtaking view of the Patratu Dam makes it a favorite destination for road trips.",
    imageUrl: "https://picsum.photos/seed/patratu/1200/800",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 6,
    name: "Dalma Wildlife Sanctuary",
    district: "East Singhbhum",
    latitude: 22.8833,
    longitude: 86.2167,
    description: "Located around the Dalma Hills, it's widely known for its significant population of Indian Elephants and dense forest cover.",
    imageUrl: "https://picsum.photos/seed/dalma/1200/800",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 7,
    name: "Deoghar",
    district: "Deoghar",
    latitude: 24.4833,
    longitude: 86.7000,
    description: "An important Hindu pilgrimage site containing the Baidyanath Jyotirlinga temple, one of the twelve Jyotirlingas in India.",
    imageUrl: "https://picsum.photos/seed/deoghar/1200/800",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 8,
    name: "BIT Sindri",
    district: "Dhanbad",
    latitude: 23.6533,
    longitude: 86.4746,
    description: "Birsa Institute of Technology Sindri is a premier engineering college in Jharkhand, known for its sprawling campus and rich academic history.",
    // Using the images provided by the user in the public folder
    images: [
      "/bit-images/bitSindri.jpg",
      "/bit-images/main_gate.jpg",
      "/bit-images/ITdept.jpg",
      "/bit-images/H-27.jpg"
    ],
    imageUrl: "/bit-images/bitSindri.jpg", // Default image
    videoUrl: null
  }
];
