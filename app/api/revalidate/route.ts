import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    revalidateTag('competitions', 'default');
    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 });
  }
}
