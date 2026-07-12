export interface TeamMember {
  name: string;
  role: string;
  designation?: string;
  image: string;
  category: "executive" | "department";
}

export const teamMembers: TeamMember[] = [
  {
    name: "TEJAS THAKUR",
    role: "Managing Director",
    designation: "President • Executive Committee",
    image: "/team/Tejas.jpeg",
    category: "executive",
  },
  {
    name: "FAIZAAN AHMED",
    role: "Head of Client Relationship",
    designation: "Vice President • Executive Committee",
    image: "/team/Faizaan.jpeg",
    category: "executive",
  },
  {
    name: "MOHD. SHAAN",
    role: "Head of Human Resources",
    designation: "Secretary • Executive Committee",
    image: "/team/Shaan.jpeg",
    category: "executive",
  },
  {
    name: "BHAVISHYA SEMWAL",
    role: "Head of Product & Infrastructure",
    designation: "Joint Secretary • Executive Committee",
    image: "/team/Bhavishya.jpeg",
    category: "executive",
  },
  {
    name: "SHUBHAM",
    role: "Head of Operations",
    designation: "Core Leadership Team",
    image: "/team/Shubham.jpeg",
    category: "department",
  },
  {
    name: "PIYUSH K. GAUR",
    role: "Head of Creative & Design",
    designation: "Core Leadership Team",
    image: "/team/Piyush.jpeg",
    category: "department",
  },
  {
    name: "FALIT NAUTIYAL",
    role: "Head of Technology",
    designation: "Core Leadership Team",
    image: "/team/Falit.jpeg",
    category: "department",
  },
  {
    name: "PARUL",
    role: "Head of Outreach",
    designation: "Core Leadership Team",
    image: "/team/Parul.jpeg",
    category: "department",
  },
];