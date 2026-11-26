import { NextResponse } from 'next/server';
import { isAdminRequestAuthenticated } from '../../../../../lib/adminAuth';

export async function GET() {
  const authenticated = await isAdminRequestAuthenticated();
  return NextResponse.json({ authenticated });
}
