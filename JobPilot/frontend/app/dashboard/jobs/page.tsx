import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobsKanban } from "@/components/job/JobsKanban";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Drag cards between columns to update status.</p>
        </div>
        <Button size="sm" className="gap-1" asChild>
          <Link href="/dashboard/add-job">
            <Plus className="h-4 w-4" />
            Add job
          </Link>
        </Button>
      </div>
      <JobsKanban />
    </div>
  );
}
