export interface Personal {
  name: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  summary: string;
}

export interface Education {
  institution: string;
  location: string;
  degree: string;
  gpa: number;
  honors: string[];
  startDate: string;
  endDate: string;
  status: string;
}

export interface Project {
  title: string;
  date: string;
  description: string;
  technologies: string[];
}

export interface Certification {
  name: string;
  date?: string;
  issuer?: string;
  expected?: string;
  status?: string;
}

export interface Certifications {
  completed: Certification[];
  inProgress: Certification[];
}

export interface Skills {
  programming: string[]
  security: string[]
  networking: string[]
  frameworks: string[]
  cryptography: string[]
  grc: string[]
  soft: string[]
}

export interface Social {
  github: string;
  linkedin: string;
}

export interface SiteData {
  personal: Personal;
  education: Education[];
  projects: Project[];
  certifications: Certifications;
  skills: Skills;
  social: Social;
}