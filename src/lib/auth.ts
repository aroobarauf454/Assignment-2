import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import GitHub from '@auth/sveltekit/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '$lib/server/db';
import { users, accounts, sessions, verificationTokens } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens
	}),
	providers: [
		Google({
			allowDangerousEmailAccountLinking: true,
			authorization: { params: { prompt: 'select_account' } }
		}),
		GitHub({ allowDangerousEmailAccountLinking: true })
	],
	pages: {
		signIn: '/login'
	},
	callbacks: {
		async session({ session, user }) {
			if (session.user && user) {
				session.user.id = user.id;
				const [dbUser] = await db
					.select({ role: users.role, disabled: users.disabled })
					.from(users)
					.where(eq(users.id, user.id));
				if (dbUser) {
					session.user.role = dbUser.role;
					session.user.disabled = dbUser.disabled;
				}
			}
			return session;
		}
	},
	trustHost: true
});
