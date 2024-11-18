/*
import type { PageLoad } from './$types';
import { user } from '$stores/userStore';
import { get } from 'svelte/store';

export const load = (async ({ params, fetch }) => {
  const res = await fetch(`http://localhost:8000/conference_roles/get_user_conferences/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: get(user)?.id,
      conference_id: params.id
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch conference data');
  }

  const conference = await res.json();

  return {
    conference,
  };
}) satisfies PageLoad;
*/