import '@auth/sveltekit';

declare module '@auth/sveltekit' {
	interface User {
		role?: string;
		disabled?: Date | null;
	}
}

declare module '@auth/core/types' {
	interface User {
		role?: string;
		disabled?: Date | null;
	}
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
