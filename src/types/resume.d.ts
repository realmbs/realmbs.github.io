/**
 * Resume data type definitions
 * These interfaces define the structure of resume.json
 */

/** Social media/professional link */
export interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | string;
  url: string;
  label: string;
}

/** Personal/contact information */
export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  location: string;
  bio: string[];
  socialLinks: SocialLink[];
}

/** Skill category grouping */
export interface SkillCategory {
  name: string;
  skills: string[];
}

/** Project entry */
export interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl?: string;
  codeUrl?: string;
  featured?: boolean;
}

/** Work experience entry */
export interface Experience {
  title: string;
  company: string;
  startDate: string;      // ISO format: "2023-01"
  endDate: string | null; // null = "Present"
  responsibilities: string[];
  technologies: string[];
}

/** Education entry */
export interface Education {
  degree: string;
  institution: string;
  gpa: number;
  startYear: number;
  endYear: number;
}

/** Certification entry */
export interface Certification {
  name: string;
  issueDate: string;      // ISO format: "2023-06"
  credentialUrl?: string;
}

/** Complete resume data structure */
export interface Resume {
  personal: PersonalInfo;
  skills: SkillCategory[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
}
