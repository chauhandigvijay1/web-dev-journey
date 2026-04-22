import { BriefcaseBusiness } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EmptyState from './EmptyState'

type WorkspaceRequiredStateProps = {
  title?: string
  description?: string
  actionLabel?: string
}

const WorkspaceRequiredState = ({
  title = 'Select a workspace to continue',
  description = 'Choose or create a workspace first so this page can load live members, files, tasks, and activity.',
  actionLabel = 'Open workspaces',
}: WorkspaceRequiredStateProps) => {
  const navigate = useNavigate()

  return (
    <EmptyState
      actionLabel={actionLabel}
      description={description}
      icon={<BriefcaseBusiness size={24} />}
      onAction={() => navigate('/workspaces')}
      title={title}
    />
  )
}

export default WorkspaceRequiredState
