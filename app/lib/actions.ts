"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";

// Nextjs has a client side router cache, but since we are modifying data we want to make sure to invalidate
// it to get the up-to-date data
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// use Zod for validating a schema before saving to a database
const InvoiceSchema = z.object({
  id: z.string(), // because it is in UUID format
  customerId: z.string(),
  amount: z.coerce.number(), //because default return value from number type input field is string
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

// Create another schema that is NOT on the DB - we don't provide id or date
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // Before Zod
  //   const rawFormData = {
  //   customerId: formData.get("customerId"),
  //   amount: formData.get("amount"),
  //   status: formData.get("status"),
  //   };

  // After Zod:
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  //   Store amount in cents because dealing with dollars in SQL is actually terrible (i.e. 2 digit decimals)
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0]; // gets the current date without the time

  await sql`
    INSERT INTO invoices (customer_id, amount, status, date) 
    VALUES (${customerId}, ${amount}, ${status}, ${date})
  `;

  // Ensures fresh data is fetched from the server at this path
  revalidatePath("/dashboard/invoices");

  // Redirect after modifying DB
  redirect("/dashboard/invoices");
}


// Use Zod to update the expected types
const UpdateInvoice = InvoiceSchema.omit({ date: true });
  
export async function updateInvoice(id: string, formData: FormData) {
  console.log(id, formData)
  const { customerId, amount, status } = UpdateInvoice.parse({
    id: formData.get('id'),
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}