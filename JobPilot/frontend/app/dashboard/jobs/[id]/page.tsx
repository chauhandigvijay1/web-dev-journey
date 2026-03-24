import { JobDetailView } from "@/components/job/JobDetailView";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetailView jobId={params.id} />;
}
