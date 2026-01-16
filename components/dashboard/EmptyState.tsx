interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  } | React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  // Check if action is a React element or an action object
  const isActionObject = action && typeof action === 'object' && 'label' in action && 'onClick' in action

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="mb-4 text-medium-gray">{icon}</div>}
      <h3 className="text-heading-md text-secondary-white mb-2">{title}</h3>
      <p className="text-body-md text-medium-gray mb-6 max-w-md">{description}</p>
      {action && (
        isActionObject ? (
          <button onClick={(action as { label: string; onClick: () => void }).onClick} className="btn-primary px-6 py-3">
            {(action as { label: string; onClick: () => void }).label}
          </button>
        ) : (
          action
        )
      )}
    </div>
  )
}

