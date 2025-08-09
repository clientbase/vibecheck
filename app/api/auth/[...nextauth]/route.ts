import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

const handler = NextAuth(authOptions);

export async function GET(request: Request, ctx: { params?: Record<string, unknown> }) {
  return handler(request, ctx);
}
export async function POST(request: Request, ctx: { params?: Record<string, unknown> }) {
  return handler(request, ctx);
}
