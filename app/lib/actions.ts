"use server";
import { z } from "zod";
import { sql } from "@vercel/postgres";

// Nextjs has a client side router cache, but since we are modifying data we want to make sure to invalidate
// it to get the up-to-date data
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
// use Zod for validating a schema before saving to a database
const InvoiceSchema = z.object({
  id: z.string(), // because it is in UUID format
  customerId: z.string({ invalid_type_error: "Please select a customer..." }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }), //because default return value from number type input field is string
  // must be greater than 0
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status.",
  }),
  date: z.string(),
});

// Create another schema that is NOT on the DB - we don't provide id or date
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
export async function createInvoice(prevState: State, formData: FormData) {
  // Before Zod
  //   const rawFormData = {
  //   customerId: formData.get("customerId"),
  //   amount: formData.get("amount"),
  //   status: formData.get("status"),
  //   };
  // After Zod:
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  //   Store amount in cents because dealing with dollars in SQL is actually terrible (i.e. 2 digit decimals)
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0]; // gets the current date without the time

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date) 
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // Ensures fresh data is fetched from the server at this path
    revalidatePath("/dashboard/invoices");
  } catch (e) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }
  // Redirect after modifying DB
  redirect("/dashboard/invoices");
}

// Use Zod to update the expected types
const UpdateInvoice = InvoiceSchema.omit({ date: true });

export async function updateInvoice(id: string, formData: FormData) {
  console.log(id, formData);
  const { customerId, amount, status } = UpdateInvoice.parse({
    id: formData.get("id"),
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  const amountInCents = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
    `;
  } catch (e) {
    return {
      message: "Database Error: Failed to Update Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  // Throwing an error will return the error.tsx file
  // throw new Error("Failed to Delte Invoice")

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch (e) {
    return {
      message: "Database Error: Failed to Delete Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", Object.fromEntries(formData));
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignIn")) {
      return "CredentialSignIn";
    }
    throw error;
  }
}
