"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { dictionary } from "@/lib/i18n/dictionary";

// Los links van por índice: siguen el mismo orden que projects.items del
// diccionario (Cloud Resume Challenge, Tute, JobFit).
const PROJECT_LINKS = [
  "https://github.com/TutteOviedo/portfolio-matias-oviedo",
  // Tute vive en el repo del portfolio (widget y código de la Lambda).
  "https://github.com/TutteOviedo/portfolio-matias-oviedo",
  "https://github.com/TutteOviedo/job-fit",
];

export default function ProjectsSidebar() {
  const { t } = useLanguage();
  const d = dictionary.curriculum.projects;

  return (
    <div className="fade-up delay-5 mt-4">
      <div className="section-label">{t(d.label)}</div>

      {d.items.map((project, i) => (
        <div className="cv-card" key={i}>
          <div className="card-title">{t(project.title)}</div>
          <div className="card-period">{t(project.period)}</div>
          <p className="card-desc mb-2">{t(project.desc)}</p>
          <div className="tag-list">
            {project.tags.map((tag, j) => (
              <span className="tag" key={j}>
                {t(tag)}
              </span>
            ))}
          </div>
          <div className="d-flex justify-content-start mt-3">
            <a
              href={PROJECT_LINKS[i]}
              target="_blank"
              rel="noopener noreferrer"
              className="card-link"
            >
              {t(d.githubLink)}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
