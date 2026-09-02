import Link from 'next/link';
import type { ProjectCaseStudy } from '@/lib/project-case-studies';
import LeadCta from '@/components/LeadCta';

export default function ProjectCaseStudyCard({ project }: { project: ProjectCaseStudy }) {
  return (
    <article className="case-study">
      <header className="case-study-header">
        <p className="mkt-eyebrow">
          {project.location} · {project.homeType}
        </p>
        <h2>{project.title}</h2>
      </header>

      <dl className="case-study-grid">
        <div>
          <dt>Customer requirement</dt>
          <dd>{project.customerRequirement}</dd>
        </div>
        <div>
          <dt>Challenge</dt>
          <dd>{project.challenge}</dd>
        </div>
        <div>
          <dt>Design solution</dt>
          <dd>{project.designSolution}</dd>
        </div>
        <div>
          <dt>Materials</dt>
          <dd>
            <ul>
              {project.materials.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Manufacturing</dt>
          <dd>{project.manufacturing}</dd>
        </div>
        <div>
          <dt>Installation</dt>
          <dd>{project.installation}</dd>
        </div>
        <div>
          <dt>Final result</dt>
          <dd>{project.finalResult}</dd>
        </div>
      </dl>

      {project.gallery.length > 0 && (
        <div className="mkt-gallery-row">
          {project.gallery.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`${project.title} in ${project.location}`} />
          ))}
        </div>
      )}

      {project.customerFeedback ? (
        <blockquote className="case-study-quote">
          <p>{project.customerFeedback}</p>
        </blockquote>
      ) : null}

      <LeadCta
        whatsappMessage={`Hi, I saw your ${project.title} project in ${project.location}. I want a similar design — please book a free site visit.`}
        ctaPosition="case_study"
        location={project.location.toLowerCase().replace(/\s+/g, '-')}
      />
      <p className="case-study-alt">
        Or browse more work in the <Link href="/gallery">design gallery</Link>.
      </p>
    </article>
  );
}
