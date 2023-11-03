import React from "react";
import Image from "next/image";
import { lusitana } from "@/app/ui/fonts";
import { Customer } from "@/app/lib/definitions";
import { fetchAllCustomers, fetchCustomers } from "@/app/lib/data";

export default async function CustomerCards() {
  const customers = await fetchAllCustomers();
  return (
    <>
      <div className="flex flex-wrap gap-6">
        {customers.map((customer) => {
          return (
            <>
              <Image
                src={`/customers/steven-tey.png`}
                width={50}
                height={50}
                alt={`${customer.name}'s Profile Picture`}
              />
              <CustomerCard key={customer.id} customer={customer} />;
            </>
          );
        })}
      </div>
    </>
  );
}

const CustomerCard = ({ customer }: { customer: Customer }) => {
  console.log(customer);
  console.log(customer.image_url);
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm min-w-[300px]">
      <div className="flex p-4">
        <Image
          src={`/customers/steven-tey.png`}
          width={50}
          height={50}
          alt={`${customer.name}'s Profile Picture`}
        />
        <h3 className="ml-2 text-sm font-medium">{customer.name}</h3>
      </div>
      <p className={`${lusitana.className}`}>{customer.email}</p>
    </div>
  );
};
