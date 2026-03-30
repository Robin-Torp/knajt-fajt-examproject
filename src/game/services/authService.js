import { supabase } from "./supabaseClient";

export async function login(email, password) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	return { data, error };
}

export async function register(email, password, username) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				username,
			},
		},
	});

	return { data, error };
}

export async function getCurrentUser() {
	const { data, error } = await supabase.auth.getUser();

	return {
		user: data?.user ?? null,
		error,
	};
}

export async function logout() {
	const { error } = await supabase.auth.signOut();
	return { error };
}

export async function getProfile(userId) {
	const { data, error } = await supabase
		.from("profiles")
		.select("id, username")
		.eq("id", userId)
		.maybeSingle();

	return { data, error };
}
