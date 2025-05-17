export interface EducationEntry {
  school: string;
  location: string;
  degree: string;
  gpa: string;
  honors: string;
  startDate: string;
  endDate: string;
}

export interface ProjectEntry {
  name: string;
  date: string;
  description: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface CertificationInProgressEntry {
  name: string;
  issuer: string;
  date: string;
}

export interface SkillEntry {
  category: string;
  skills: string[];
}