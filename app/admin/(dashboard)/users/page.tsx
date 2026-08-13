import { getUsers } from "@/lib/db";
import { requireSection } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/permissions";
import { createUserAction, updateUserRoleAction, toggleUserActiveAction, deleteUserAction } from "./actions";
import type { Role } from "@/lib/types";

const fieldClass = "w-full border border-bone-300/20 bg-ink-900 px-4 py-2.5 text-sm text-bone-100 focus:border-gold-bright";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest2 text-bone-400";

const ROLES: Role[] = ["super-admin", "marketing-lead", "marketing", "social-media", "reservations-sales"];

interface UsersPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const currentUser = await requireSection("users");
  const [users, params] = await Promise.all([getUsers(), searchParams]);
  const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h1 className="text-display-3 mb-8">Users &amp; Roles</h1>

      {params.error && <p className="mb-6 max-w-xl border border-signal-red/40 bg-signal-red/10 px-4 py-3 text-sm text-signal-red">{params.error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-bone-300/15 text-left text-xs uppercase tracking-wider text-bone-400">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => (
              <tr key={user.id} className="border-b border-bone-300/10">
                <td className="py-3 pr-4 font-medium text-bone-100">
                  {user.name} {user.id === currentUser.id && <span className="text-xs text-bone-500">(you)</span>}
                </td>
                <td className="py-3 pr-4 text-bone-300/70">{user.email}</td>
                <td className="py-3 pr-4">
                  <form action={updateUserRoleAction} className="inline-flex items-center gap-2">
                    <input type="hidden" name="id" value={user.id} />
                    <select name="role" defaultValue={user.role} className="border border-bone-300/20 bg-ink-900 px-2 py-1 text-xs text-bone-100">
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                      ))}
                    </select>
                    <button type="submit" className="text-[11px] uppercase tracking-wider text-gold-bright hover:underline">
                      Update
                    </button>
                  </form>
                </td>
                <td className="py-3 pr-4">
                  <span className={user.active ? "text-[#4ade80]" : "text-bone-500"}>{user.active ? "Active" : "Inactive"}</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex gap-3">
                    <form action={toggleUserActiveAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <button type="submit" className="text-bone-300 hover:underline">
                        {user.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                    <form action={deleteUserAction}>
                      <input type="hidden" name="id" value={user.id} />
                      <button type="submit" className="text-signal-red hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 max-w-md">
        <h2 className="text-display-3 mb-4 text-xl">Add User</h2>
        <form action={createUserAction} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="name">Full Name</label>
            <input id="name" name="name" required className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required className={fieldClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="password">Temporary Password</label>
            <input id="password" name="password" type="password" required minLength={10} className={fieldClass} />
            <p className="mt-1 text-xs text-bone-500">At least 10 characters, with upper, lower and a number. Share it with them securely.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="role">Role</label>
            <select id="role" name="role" required defaultValue="marketing" className={fieldClass}>
              {ROLES.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}
