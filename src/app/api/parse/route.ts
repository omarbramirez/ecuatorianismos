// app/api/parse/route.ts
import { NextResponse } from "next/server";
import { parseXmlFile } from "@/lib/parser";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "public/db/data.xml");
  const data = await parseXmlFile(filePath);
  return NextResponse.json(data);
}
