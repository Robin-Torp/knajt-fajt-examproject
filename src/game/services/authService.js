import { supabase } from "./supabaseClient";

// authService kapslar in anrop mot Supabase Auth.
// Tanken är att scenerna inte ska behöva känna till detaljerna
// i auth-anropen utan bara använda tydliga hjälpfunktioner.

// Loggar in en användare med e-post och lösenord.
export async function login(email, password) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	return { data, error };
}

// Registrerar en ny användare och sparar username i metadata.
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

// Hämtar aktiv användare från nuvarande session.
export async function getCurrentUser() {
	const { data, error } = await supabase.auth.getUser();

	return {
		user: data?.user ?? null,
		error,
	};
}

// Loggar ut användaren.
export async function logout() {
	const { error } = await supabase.auth.signOut();
	return { error };
}

// Hämtar spelarens profilrad från profiles-tabellen.
export async function getProfile(userId) {
	const { data, error } = await supabase
		.from("profiles")
		.select("id, username")
		.eq("id", userId)
		.maybeSingle();

	return { data, error };
}
