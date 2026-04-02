import { supabase } from "./supabaseClient";

// leaderboardService hanterar resultat mot Supabase.
// Här sparas vinster och förluster per användare och topplistan hämtas ut
// för att kunna visas i menyn.

// Sparar ett matchresultat för en inloggad användare.
export async function saveMatch({ userId, username, win }) {
	if (!userId) return;

	const { data: existing, error: fetchError } = await supabase
		.from("leaderboard")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (fetchError && fetchError.code !== "PGRST116") {
		throw fetchError;
	}

	if (!existing) {
		const { error } = await supabase.from("leaderboard").insert({
			user_id: userId,
			username,
			wins: win ? 1 : 0,
			losses: win ? 0 : 1,
			updated_at: new Date().toISOString(),
		});

		if (error) throw error;
		return;
	}

	const { error } = await supabase
		.from("leaderboard")
		.update({
			username,
			wins: existing.wins + (win ? 1 : 0),
			losses: existing.losses + (win ? 0 : 1),
			updated_at: new Date().toISOString(),
		})
		.eq("user_id", userId);

	if (error) throw error;
}

// Hämtar topp 10 sorterat på flest vinster.
export async function getLeaderboard() {
	const { data, error } = await supabase
		.from("leaderboard")
		.select("username, wins, losses")
		.order("wins", { ascending: false })
		.limit(10);

	if (error) throw error;

	return data ?? [];
}
