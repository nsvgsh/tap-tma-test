import { redirect } from 'next/navigation'

interface ClickPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClickPage({ searchParams }: ClickPageProps) {
  const resolvedSearchParams = await searchParams;
  const queryString = new URLSearchParams(resolvedSearchParams as Record<string, string>).toString();
  
  // Redirect to static HTML page with query parameters
  redirect(`/click.html?${queryString}`)
}
