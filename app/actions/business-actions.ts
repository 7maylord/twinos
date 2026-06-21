'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getUserBusinesses } from '@/lib/auth-helpers';

export async function switchBusiness(businessId: string) {
  (await cookies()).set('active-business-id', businessId, { path: '/' });
  revalidatePath('/', 'layout');
}

export async function getBusinesses() {
  const businesses = await getUserBusinesses();
  const activeId = (await cookies()).get('active-business-id')?.value;
  return { businesses, activeId };
}
