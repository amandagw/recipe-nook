import Link from "next/link";
import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="site-header-wrap">
      <div className="site-header">
        <Link className="site-brand" href="/">
          The Recipe Nook
        </Link>

        <nav className="site-nav">
          <Link href="/">Recipes</Link>
          <Link href="/add-recipe">Add Recipe</Link>
          <Link href="/plan">Plan & Shop</Link>
        </nav>

        <div className="site-auth">
          {session ? (
            <>
              <span className="site-user">Hi, {session.name}</span>
              <LogoutButton />
            </>
          ) : (
            <Link className="secondary-button" href="/auth">
              Log in / Sign up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
