import BlurImage from "@/components/blur-image";
import type { SelectProject, SelectAgency } from "@/lib/schema";
import Link from "next/link";
import { Badge } from "./ui/badge";

export default function ProjectCard({
  data,
}: {
  data: SelectProject & { agency: SelectAgency | null };
}) {
  const url = `${data.agency?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/${data.slug}`;
  const [statusColor, statusText] = statusCheck(data.status) ?? ["bg-gray-500", "Unknown"];

  return (
    <div className="relative rounded-lg border border-stone-200 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/project/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white dark:text-white">
            {data.name}
            
          </h3>
          <p className="my-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description}
          </p>
          <div className="justify-end">
            <Badge className="dark:text-white" variant="primary">{statusText}</Badge>
          </div>
        </div>
        
      </Link>
    </div>
  );
}

function statusCheck(status: string) {
  if (status === "NOT_STARTED") {
    return ["bg-red-500", "Not Started"];
  }
  if (status === "IN_PROGRESS") {
    return ["bg-yellow-500", "In Progress"];
  }
  if (status === "COMPLETED") {
    return ["bg-green-500", "Completed"];
  }
}
