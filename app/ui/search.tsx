"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter(); //

  // Callback function that modifies the URL search parameters for easy refetching of data based on a term
  // URL is updated without reloading the page
  // useDebouncedCallback will wait for a specified amount of time before running the callback
  // this will allow us to not bog down our server with incessant redundant calls
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);
    // Will get search params in URL like ?page=4&limit=100
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        onChange={(e) => handleSearch(e.target.value)}
        // Set the default value inside of the input to the searchparam with key 'query' if it exists
        defaultValue={searchParams.get("query")?.toString()}
        placeholder={placeholder}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
