"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Shield, ShieldAlert, ShieldCheck } from "lucide-react"

export type Team = {
  id: string
  email: string
  role: "admin" | "user" | "owner"
  permissions: string[]
}

const RoleBadge = ({ role }: { role: Team["role"] }) => {
  const variants = {
    admin: { icon: ShieldAlert, className: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" },
    owner: { icon: ShieldCheck, className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
    user: { icon: Shield, className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
  }
  const { icon: Icon, className } = variants[role]
  
  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  )
}

export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div className="ml-2">
          <div className="font-medium">{row.getValue("email")}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions: string[] = row.getValue("permissions")
      return (
        <div className="flex gap-1">
          {permissions.map((permission) => (
            <Badge key={permission} variant="secondary" className="capitalize">
              {permission}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(user.id)}
            >
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit permissions</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400">
              Remove user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]