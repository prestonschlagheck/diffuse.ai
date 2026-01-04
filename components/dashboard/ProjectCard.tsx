import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils/format'
import type { DiffuseProject } from '@/types/database'

interface ProjectCardProps {
  project: DiffuseProject
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30',
    archived: 'bg-medium-gray/20 text-medium-gray border-medium-gray/30',
    draft: 'bg-pale-blue/20 text-pale-blue border-pale-blue/30',
  }

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="glass-container-hover p-6 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-heading-md text-secondary-white font-medium">
            {project.name}
          </h3>
          <span
            className={`px-3 py-1 text-caption font-medium rounded-full border ${
              statusColors[project.status]
            }`}
          >
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="text-body-sm text-medium-gray mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-caption text-medium-gray">
          <span>Created {formatRelativeTime(project.created_at)}</span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            {project.visibility === 'private' ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
            <span className="capitalize">{project.visibility}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

