import Image from "next/image";

import { getCompanies } from "@/lib/data";
import { CompanyLink } from "@/components/company-link";

import logo from "../../public/logo.svg";

export async function Header() {
  const companies = await getCompanies();

  return (
    <header className="flex justify-between px-4 bg-[#17192D] h-12">
      <Image src={logo} alt="Logo" />
      <div className="flex gap-2 items-center">
        {companies.map((company) => (
          <CompanyLink key={company.id} id={company.id} name={company.name} />
        ))}
      </div>
    </header>
  );
}
