export interface Contact {
  email: string;
  linkedin: string;
  github: string;
  website: string;
  location: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location: string;
  honors: string;
  gpa: string;
  startDate: string;
  endDate: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
}

export interface CertificationEntry {
  name: string;
  authority: string;
  date: string;
  url: string;
}

export interface CertificationInProgressEntry {
  name: string;
  date: string;
}

export interface SkillEntry {
  category: string;
  skills: string[];
}

export interface Resume {
  name: string;
  headline: string;
  contact: Contact;
  summary: string;
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  certificationInProgress: CertificationInProgressEntry[];
  skills: SkillEntry[];
}