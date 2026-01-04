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
          <span className="capitalize">{project.visibility}</span>
        </div>
      </div>
    </Link>
  )
}

