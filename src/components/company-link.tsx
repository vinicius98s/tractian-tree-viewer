"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const CompanyLink = ({ id, name }: { id: string; name: string }) => {
  const pathname = usePathname();
  const isActive = pathname.includes(id);

  return (
    <Link
      href={`/${id}`}
      className={`${isActive ? "bg-[#2188FF]" : "bg-[#023B78]"} px-4 rounded-sm font-semibold text-white`}
    >
      {name}
    </Link>
  );
};
