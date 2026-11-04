import { vi } from "../copy/vi";

export function OpenScreen({ closesAt }: { closesAt: string | null }) {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold text-lamp">{vi.open.title}</h1>
      <p className="max-w-sm opacity-80">{vi.open.placeholder}</p>
      {closesAt && (
        <p className="text-sm opacity-60">
          {vi.open.closesAt} {new Date(closesAt).toLocaleString("vi-VN", { timeZone: "Europe/London" })}
        </p>
      )}
    </main>
  );
}
