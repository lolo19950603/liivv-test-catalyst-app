import { redirect } from 'next/navigation';

/** Saved kits now live on the Wish Lists page. */
export default function SavedKitsRedirect() {
  redirect('/account/wishlists/');
}
